// FX helpers for "how a robot knows where it is" scenes (Media pro 2026-11-14, ep015-pokemon). Matte, no glow. Our own code → CC0.
// import {photoCards, toDots, viewCone, edgeLines, errorCircle, dashLine, daylight, handPhone} from '/engine/props/fx-city.js';
import * as THREE from 'three';
import {MeshSurfaceSampler} from 'three/addons/math/MeshSurfaceSampler.js';

const ACC = 0x8ea6ff;
const ease = k => { k = Math.min(1, Math.max(0, k)); return k * k * (3 - 2 * k); };

/** tiny 'photo of a facade' texture (canvas), seed varies the picture. */
export function photoTexture(seed = 1) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 96; const x = c.getContext('2d');
  let s = seed * 9301 + 49297; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  x.fillStyle = '#9fb0ff'; x.fillRect(0, 0, 128, 96);                    // sky
  const n = 2 + Math.floor(r() * 3); let px = 0;
  for (let i = 0; i < n; i++) { const w = 128 / n, h = 40 + r() * 50; x.fillStyle = ['#3e4390', '#34397f', '#474ca0', '#575dae'][i % 4]; x.fillRect(px, 96 - h, w + 1, h);
    x.fillStyle = '#12143a'; for (let yy = 96 - h + 6; yy < 84; yy += 12) for (let xx = px + 4; xx < px + w - 6; xx += 10) x.fillRect(xx, yy, 6, 7); px += w; }
  x.fillStyle = '#1a1c45'; x.fillRect(0, 86, 128, 10);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
/** n photo cards (white frame + photo) as ONE InstancedMesh-pair (fast for 100s). w in metres.
 * api: cards.set(i, pos, quat|null, scale) · cards.flock(t, i => ({from, to, a, b, spin})) · cards.hideAll(). Photos cycle through 8 textures. */
export function photoCards(scene, n = 200, w = .6) {
  const h = w * .75, g = new THREE.Group(); g.name = 'photoCards'; scene.add(g);
  const frameM = new THREE.MeshStandardMaterial({color: 0xf2f3ff, roughness: .6});
  const frames = new THREE.InstancedMesh(new THREE.BoxGeometry(w, h, .01), frameM, n); frames.castShadow = true; frames.frustumCulled = false; g.add(frames);
  const pics = []; const per = Math.ceil(n / 8);
  for (let k = 0; k < 8; k++) { const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(w * .88, h * .84).translate(0, 0, .0055), new THREE.MeshStandardMaterial({map: photoTexture(k + 1), roughness: .7}), per); im.frustumCulled = false; g.add(im); pics.push(im); }
  const m4 = new THREE.Matrix4(), zero = new THREE.Matrix4().makeScale(0, 0, 0), one = new THREE.Vector3(1, 1, 1), q0 = new THREE.Quaternion();
  const set = (i, p, q, s = 1) => { const m = s <= 0 ? zero : m4.compose(p, q || q0, one.clone().setScalar(s)); frames.setMatrixAt(i, m); pics[i % 8].setMatrixAt(Math.floor(i / 8), m); };
  const hideAll = () => { for (let i = 0; i < n; i++) set(i, new THREE.Vector3(), null, 0); flush(); };
  const flush = () => { frames.instanceMatrix.needsUpdate = true; pics.forEach(p => p.instanceMatrix.needsUpdate = true); };
  const tmp = new THREE.Vector3(), eu = new THREE.Euler(), qq = new THREE.Quaternion();
  /** each card flies from→to between seconds a..b (arc up by 'lift'), pops in/out by scale; spec(i) returns {from:Vector3, to:Vector3, a, b, lift=1, spin=0, face:Vector3?(look-at point)} or null */
  function flock(t, spec) { for (let i = 0; i < n; i++) { const o = spec(i); if (!o || t < o.a) { set(i, tmp, null, 0); continue; }
      const k = ease((t - o.a) / (o.b - o.a)); tmp.lerpVectors(o.from, o.to, k); tmp.y += Math.sin(Math.PI * k) * (o.lift ?? 1);
      const s = Math.min(1, (t - o.a) / .25) * (o.shrink ? 1 - .7 * k : 1);
      if (o.face) { const d = new THREE.Matrix4().lookAt(tmp, o.face, new THREE.Vector3(0, 1, 0)); qq.setFromRotationMatrix(d); qq.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)); }
      else qq.setFromEuler(eu.set(0, (o.spin ?? 0) * k + (o.ry ?? 0), 0));
      set(i, tmp, qq, s); } flush(); }
  hideAll();
  return {group: g, set, flush, flock, hideAll, n};
}
/** city → dot map: samples N points on every mesh under roots, returns {points, set(k)}; k 0 = solid city, 1 = only dots (meshes fade out). */
export function toDots(scene, roots, {n = 60000, size = .07, color = ACC} = {}) {
  const meshes = []; roots.forEach(r => r.updateMatrixWorld(true)); roots.forEach(r => r.traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.geometry.attributes.position) meshes.push(o); }));
  const area = meshes.map(m => { const b = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3()); return Math.max(.01, b.x * b.y + b.y * b.z + b.x * b.z); });
  const tot = area.reduce((a, b) => a + b, 0), pos = []; const v = new THREE.Vector3();
  meshes.forEach((m, i) => { const k = Math.round(n * area[i] / tot); if (!k) return; let geo = m.geometry; if (geo.index) geo = geo.toNonIndexed();
    const sm = new MeshSurfaceSampler(new THREE.Mesh(geo)).build(); for (let j = 0; j < k; j++) { sm.sample(v); v.applyMatrix4(m.matrixWorld); pos.push(v.x, v.y, v.z); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({color, size, transparent: true, opacity: 0, depthWrite: false}); const pts = new THREE.Points(g, pm); pts.name = 'dotMap'; scene.add(pts);
  const mats = new Map(); meshes.forEach(m => { const ms = Array.isArray(m.material) ? m.material : [m.material]; ms.forEach(x => mats.set(x, x.opacity ?? 1)); });
  function set(k) { k = ease(k); pm.opacity = Math.min(1, k * 1.6); pts.visible = k > 0;
    for (const [mt, o0] of mats) { mt.transparent = k > 0 || o0 < 1; mt.opacity = o0 * (1 - k); mt.depthWrite = k < .5 && o0 >= 1; mt.visible = k < .999; } }
  return {points: pts, set};
}
/** camera view cone (see-through matte light-blue, wire edges) from 'from' toward 'to'; api aim(from,to), set(k) opacity/reach 0..1. */
export function viewCone(scene, {fov = .55, aspect = 1.4} = {}) {
  const g = new THREE.Group(); g.name = 'viewCone'; scene.add(g);
  const geo = new THREE.ConeGeometry(1, 1, 4, 1, true).rotateY(Math.PI / 4).translate(0, -.5, 0).rotateX(-Math.PI / 2); // apex at origin, opens toward −z
  const m = new THREE.MeshStandardMaterial({color: ACC, roughness: .9, transparent: true, opacity: .14, side: THREE.DoubleSide, depthWrite: false});
  const cone = new THREE.Mesh(geo, m); g.add(cone);
  const ed = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({color: ACC, transparent: true, opacity: .8})); g.add(ed);
  function aim(from, to, k = 1) { const L = from.distanceTo(to) * k; g.position.copy(from); g.lookAt(to); g.rotateY(Math.PI); const r = Math.tan(fov / 2) * L; g.scale.set(r * aspect / Math.SQRT2 * 1.0, r / Math.SQRT2, L); g.visible = k > .01; }
  function set(op) { m.opacity = .14 * op; ed.material.opacity = .8 * op; g.visible = op > .01; }
  return {group: g, aim, set};
}
/** edge lines of a building/object (what the robot 'recognises'); api set(k, snap): k = draw progress 0..1, snap = 0..1 (lines start offset by 'offset' and slide into place). */
export function edgeLines(scene, root, {angle = 30, color = ACC, offset = new THREE.Vector3(.6, .3, .8), filter = null} = {}) {
  root.updateMatrixWorld(true); const segs = [];
  root.traverse(o => { if (!o.isMesh || (filter && !filter(o))) return; const e = new THREE.EdgesGeometry(o.geometry, angle); const p = e.attributes.position; const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld); segs.push(v.x, v.y, v.z); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
  const lm = new THREE.LineBasicMaterial({color, transparent: true, opacity: .95, depthTest: true}); const ls = new THREE.LineSegments(g, lm); ls.name = 'edgeLines'; ls.renderOrder = 5; scene.add(ls);
  const N = segs.length / 3;
  function set(k, snap = 1) { k = Math.min(1, Math.max(0, k)); g.setDrawRange(0, Math.floor(N * k / 2) * 2); ls.visible = k > 0; const s = 1 - ease(snap); ls.position.copy(offset).multiplyScalar(s); lm.opacity = .45 + .5 * ease(snap); }
  set(0); return {lines: ls, set};
}
/** error circle on the ground: see-through disc + dashed rim + centre dot. api set(radius, opacity), at(x,z). */
export function errorCircle(scene, {color = ACC, y = .23} = {}) {
  const g = new THREE.Group(); g.name = 'errorCircle'; scene.add(g);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({color, roughness: .9, transparent: true, opacity: .2, depthWrite: false})); g.add(disc);
  const rim = new THREE.Group(); g.add(rim); for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; const d = new THREE.Mesh(new THREE.BoxGeometry(.02, .01, .11), new THREE.MeshStandardMaterial({color, roughness: .6})); d.position.set(Math.cos(a), 0, Math.sin(a)); d.rotation.y = -a; rim.add(d); }
  const dot = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .03, 24), new THREE.MeshStandardMaterial({color: 0xf2f3ff, roughness: .5})); g.add(dot);
  g.position.y = y;
  function set(r, op = 1) { disc.scale.setScalar(r); rim.scale.set(r, 1, r); rim.children.forEach(c => c.scale.set(1 / Math.max(r, .2) * 3, 1, Math.min(1, 3 / Math.max(r, .2)))); disc.material.opacity = .2 * op; rim.visible = r > .25 && op > .05; g.visible = op > .01; }
  return {group: g, set, at: (x, z) => g.position.set(x, y, z)};
}
/** dashed line between two points (e.g. satellite → ground). api set(a, b, k) (k = how far it has been drawn). */
export function dashLine(scene, {color = ACC, dash = .4, gap = .3} = {}) {
  const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 1, 0)]);
  const l = new THREE.Line(geo, new THREE.LineDashedMaterial({color, dashSize: dash, gapSize: gap, transparent: true})); scene.add(l);
  function set(a, b, k = 1) { const e = a.clone().lerp(b, k); geo.setFromPoints([a, e]); l.computeLineDistances(); l.visible = k > .01; }
  return {line: l, set};
}
/** daylight change on one stage: k 0 = sun (warm key light + sharp shadow), 1 = cloud (cool, dim, soft). Pass st (uses st.dl). Returns set(k). */
export function daylight(st, {sun = 2.6, cloud = .9} = {}) {
  const hemi = new THREE.HemisphereLight(0xdfe6ff, 0x1a1c4a, .25); st.scene.add(hemi);
  const cSun = new THREE.Color(0xfff1dc), cCloud = new THREE.Color(0xb8c2f0);
  return function set(k) { k = ease(k); st.dl.intensity = sun + (cloud - sun) * k; st.dl.color.copy(cSun).lerp(cCloud, k); st.dl.shadow.radius = 4 + 10 * k; hemi.intensity = .25 + .45 * k; };
}
/** a right hand holding a phone (body/hand-right MIT + everyday/smartphone CC0), screen faces the camera side (+z of the returned group), phone held portrait.
 * Returns {o, phone, screen}. Use o.scale for size (1 = real ~20 cm hand). */
export async function handPhone(st, {skin = 0xc9c3f2} = {}) {
  const g = new THREE.Group(); g.name = 'handPhone'; st.scene.add(g);
  const hand = (await st.prop('body/hand-right', {tint: 1})).object; const ph = (await st.prop('everyday/smartphone', {tint: 1})).object;
  st.scene.remove(hand, ph); hand.position.set(0, 0, 0); ph.position.set(0, 0, 0);
  hand.traverse(o => { if (o.isMesh) { o.material = new THREE.MeshStandardMaterial({color: skin, roughness: .7}); o.geometry.computeVertexNormals(); o.frustumCulled = false; } });
  const bone = n => { let b = null; hand.traverse(o => { if (o.isBone && o.name.endsWith(n)) b = o; }); return b; };
  const curl = (f, k, js) => js.forEach(j => { const b = bone(`${f}-${j}`); if (b) b.rotateX(k); });
  for (const [f, k] of [['index-finger', .55], ['middle-finger', .7], ['ring-finger', .8], ['pinky-finger', .85]]) curl(f, k, ['phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal']);
  curl('thumb', .35, ['phalanx-proximal', 'phalanx-distal']);
  // hand: palm faces −z (behind the phone), fingers wrap the phone's back; phone screen faces +z
  const hw = new THREE.Group(); hw.add(hand); hand.rotation.set(Math.PI, 0, 0); g.add(hw);   // fingers point up (+y)
  ph.position.set(0, .01, .03); g.add(ph);
  const screen = ph.getObjectByName('screen');
  return {o: g, hand: hw, phone: ph, screen, bone};
}

// ---------- Israeli street set: small variations every time (Ziv 2026-11-15: "we won't see the same thing every time, there will be small changes") ----------
const FACADES = [0x3e4390, 0x2f4f8f, 0x5a4f86, 0x8d90c9, 0x6a5a9e, 0x34397f, 0xa7a3d6, 0x474ca0];   // indigo family + one light 'Jerusalem stone' tone
const AWNINGS = [[0xd9ddf7, 0x6c72c6], [0x8ea6ff, 0xd9ddf7], [0x6c72c6, 0x2c2f6e], [0xd9ddf7, 0x8ea6ff], [0xb5524a, 0xd9ddf7]];
const KERBS = [0xb5524a, 0x3f63c9, 0xb5524a, 0xd9ddf7];                                          // red-white (no parking) · blue-white (paid) · plain
/** varyCity(root, seed): recolours facades + awnings, randomises roller shutters, AC units, solar heaters, balconies, cafe tables, kerb colours, trees.
 * Call once per prop after st.prop (streetCorner / storefront / cafe / bauhausCorner). Same seed = same look (repeatable). */
export function varyCity(root, seed = 1) {
  let s = (seed * 2654435761) >>> 0; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 4; i++) r(); const pick = a => a[Math.floor(r() * a.length)];
  const recol = (o, c) => { if (!o.isMesh) return; o.material = o.material.clone(); o.material.color.setHex(c); };
  const fac = pick(FACADES), awn = pick(AWNINGS), kerb = pick(KERBS);
  root.traverse(o => {
    const n = o.name || '';
    if (o.isMesh && n === 'body' && !o.parent?.name?.startsWith('cafeTable')) recol(o, fac);
    if (n === 'body' && !o.isMesh && o.parent?.name === 'bauhausCorner') o.traverse(q => recol(q, fac));
    if (n === 'awningCloth') { const h = o.children.length / 2; o.children.forEach((c, j) => recol(c, awn[(j % h) % 2])); }
    if (n === 'shutter') o.scale.y = Math.max(.001, [0, .25, .5, .9, .15][Math.floor(r() * 5)] * 1.55);
    if (/^ac_/.test(n)) o.visible = r() < .7;
    if (/^solarHeater/.test(n)) o.visible = r() < .8;
    if (/^balcony_/.test(n)) o.visible = r() < .85;
    if (/^cafeTable/.test(n)) o.visible = r() < .8;
    if (n === 'kerbRed') recol(o, kerb);
    if (n === 'tree') { o.visible = r() < .85; o.scale.setScalar(.8 + r() * .45); }
  });
  return {facade: fac, awning: awn, kerb};
}

/** robotVision(st, {roots, eye, target}): the recurring 'how a robot sees' signature — the world turns into light-blue dots + edge lines snap onto the
 * objects + a view cone from the robot's camera. Matte, no glow. set(k): 0 = normal world, 1 = full robot vision. (eye/target = Vector3 or functions) */
export function robotVision(st, {roots, eye, target, n = 50000, edgeRoots = null} = {}) {
  const dots = toDots(st.scene, roots, {n, size: .07});
  const edges = (edgeRoots || roots).map(r => edgeLines(st.scene, r, {angle: 35, color: 0xd9e2ff, offset: new THREE.Vector3(.4, .25, .5)}));
  const cone = viewCone(st.scene);
  return function set(k, t = 0) { k = Math.min(1, Math.max(0, k));
    dots.set(k); edges.forEach(e => e.set(Math.min(1, k * 1.6), Math.max(0, k * 1.4 - .3)));
    const E = typeof eye === 'function' ? eye(t) : eye, T = typeof target === 'function' ? target(t) : target;
    cone.set(Math.min(1, k * 2)); if (E && T) cone.aim(E, T, Math.min(1, k * 2)); };
}
