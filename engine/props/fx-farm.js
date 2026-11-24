// FX for the orchard kit (Media pro 2026-11-24 run 15). Generic, CC0. Real metres. No glow.
import * as THREE from 'three';
import {instanceModel} from './fx-tlv.js';

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const W = o => o.getWorldPosition(V());

/** fill every empty slot<row>_<i> of farm/orchard with an instanced low-poly tree (farm/appleTreeLow), each a bit different (scale/turn). Returns the group. */
export async function orchardTrees(st, orchard, {model = 'farm/appleTreeLow'} = {}) {
  const tree = (await st.model(model)).object; orchard.updateMatrixWorld(true);
  const place = [], q = new THREE.Quaternion(), e = new THREE.Euler(); let k = 0;
  orchard.traverse(o => { if (!/^slot\d+_\d+$/.test(o.name)) return; const p = W(o); o.getWorldQuaternion(q); e.setFromQuaternion(q);
    place.push({x: p.x, y: p.y, z: p.z, ry: e.y + (k % 3) * .4, s: .92 + ((k * 37) % 17) / 100}); k++; });
  return instanceModel(st.scene, tree, place);
}

/** soft white power/data cable from a ground-unit reel spot to a drone's tetherPort, with a gentle sag. api: .update() each frame (after you move the drone). */
export function droneTether(scene, from, drone, {r = .006, color = 0xe9eaec, sag = .25} = {}) {
  const m = new THREE.MeshStandardMaterial({color, roughness: .6}); m.userData.real = true;
  let mesh = null; const port = drone.getObjectByName('tetherPort');
  function update() {
    drone.updateMatrixWorld(true); from.updateMatrixWorld?.(true);
    const a = from.isObject3D ? W(from) : from.clone(), b = W(port), mid = a.clone().lerp(b, .5); mid.y -= sag * a.distanceTo(b) * .15;
    const g = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 32, r, 6);
    if (!mesh) { mesh = new THREE.Mesh(g, m); mesh.castShadow = true; mesh.name = 'droneTether'; scene.add(mesh); } else { mesh.geometry.dispose(); mesh.geometry = g; }
  }
  update(); return {update, get mesh() { return mesh; }};
}

/** one pick cycle on a hero apple: k 0..1 → 0–.35 arm reaches the apple, .35–.5 cup squeezes (grip), .5–.7 small twist + pull (apple leaves the branch), .7–1 arm retracts holding it.
 *  drone hovers in front of the apple (you place it); spin props with spinProps(drone, t). Returns the apple's world position. */
export function pickApple(drone, appleObj, k) {
  const arm = drone.getObjectByName('arm'), cup = drone.getObjectByName('suction'), fs = drone.getObjectByName('fruitSpot');
  const sm = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
  arm.position.z = .2 + .42 * (sm(0, .35, k) - sm(.7, 1, k));
  cup.scale.z = 1 - .3 * (sm(.35, .45, k) - sm(.9, 1, k) * 0);
  if (!appleObj.userData.home) appleObj.userData.home = {p: appleObj.position.clone(), parent: appleObj.parent};
  if (k > .5) { // attached to the cup
    if (appleObj.parent !== fs) { fs.add(appleObj); appleObj.position.set(0, 0, 0); }
    appleObj.rotation.z = sm(.5, .7, k) * 1.2;
  } else if (appleObj.parent !== appleObj.userData.home.parent) { appleObj.userData.home.parent.add(appleObj); appleObj.position.copy(appleObj.userData.home.p); appleObj.rotation.set(0, 0, 0); }
  return W(appleObj);
}

/** spin the 4 props (disc look, alternating directions) + tiny hover bob. */
export function spinProps(drone, t, base = null) {
  for (let i = 0; i < 4; i++) { const p = drone.getObjectByName('prop' + i); if (p) p.rotation.y = t * 40 * (i % 2 ? -1 : 1); }
  if (base) drone.position.y = base.y + Math.sin(t * 2.1) * .02;
}
