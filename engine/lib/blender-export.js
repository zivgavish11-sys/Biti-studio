// blender-export.js — Media pro 2026-11-27: bridge from our three.js episodes to Blender (Ziv: build the Blender infrastructure now, test after ep036).
// Loaded by tools/blender/export.py inside the episode page. Exposes:
//   prepare()            → gives every node a unique name ("name~i") so Blender objects/bones can be matched frame by frame
//   glb(t)               → renderAt(t) then the whole scene as a binary glTF (base64) — sky/helper/overlay-only meshes skipped
//   frameData(t)         → {cam:{pos,quat,fov,aspect}, sun:{dir,intensity,color}, nodes:{uname:[px,py,pz,qx,qy,qz,qw,sx,sy,sz,visible]}}   (local TRS of every named node)
import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
const st = () => window.__studio;
let named = false;
export function prepare() {
  if (named) return; named = true; let i = 0;
  st().scene.traverse(o => { o.userData.bname = `${(o.name || o.type).replace(/[^\w.-]/g, '_').slice(0, 40)}~${i++}`; });   // names stay (episode code looks them up); unique name only during export
}
const skip = o => o.isSky || (o.material && o.material.isShaderMaterial) || o.isLight || o.isCamera || o.type.includes('Helper');
export async function glb(t) {
  prepare(); await window.renderAt(t);
  const S = st().scene, hidden = [];
  S.traverse(o => { if (o !== S && skip(o) && o.visible) { o.visible = false; hidden.push(o); } });
  const old = []; S.traverse(o => { if (!o.userData.bname) o.userData.bname = `${o.type}~n${old.length}`; old.push([o, o.name]); o.name = o.userData.bname; });
  const ab = await new GLTFExporter().parseAsync(S, {binary: true, onlyVisible: false, maxTextureSize: 2048});
  old.forEach(([o, n]) => o.name = n); hidden.forEach(o => o.visible = true);
  let s = ''; const u = new Uint8Array(ab); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
}
export async function frameData(t) {
  prepare(); await window.renderAt(t);
  const {scene, cam} = st(); cam.updateMatrixWorld(true);
  const q = new THREE.Quaternion(), p = new THREE.Vector3(), s3 = new THREE.Vector3(); cam.matrixWorld.decompose(p, q, s3);
  let sun = null; scene.traverse(o => { if (o.isDirectionalLight && (!sun || o.intensity > sun.intensity)) sun = o; });
  const sd = sun ? sun.position.clone().sub(sun.target.position).normalize() : new THREE.Vector3(.45, .8, .55).normalize();
  const vis = o => { for (let q = o; q; q = q.parent) if (!q.visible) return 0; return 1; };
  const nodes = {}; scene.traverse(o => { if (o === scene || skip(o)) return; if (!o.userData.bname) return; nodes[o.userData.bname] = [...o.position.toArray(), ...o.quaternion.toArray(), ...o.scale.toArray(), vis(o)]; });   // effective visibility (parents included)
  return {t, cam: {pos: p.toArray(), quat: q.toArray(), fov: cam.fov, aspect: cam.aspect}, sun: {dir: sd.toArray(), intensity: sun ? sun.intensity : 2, color: sun ? sun.color.getHexString() : 'ffffff'}, nodes};
}
