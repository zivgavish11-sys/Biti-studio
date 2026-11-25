// ep026-hebrew FX (Media pro 2026-11-25). Our own code → CC0. Matte light-blue brand accent, no glow. Pair with buildings/kitchenLiving + pro/humanoid + people/mannequin-sit.
//   soundWave(scene, from, to)            → .update(t, k)          arcs travel from the speaker's mouth to the robot's head (k = 0..1 visibility)
//   throwArcs(scene, from, [to1, to2])    → .set([k1, k2], {pulse}) dashed parabolas (bag → bin, bag → out of the window); k = drawn share; pulse 0..1 flashes them; .point(i, k) = point on arc i
//   pageStream(scene, target, {from, spread}) → .update(t, k)      ~90 text pages fly from a cloud into the robot's head and shrink
//   textTowers(st, pos)                   → .set({en, he, slang})  English tower (tall) vs Hebrew stack (small) + a thin light-blue slang sliver, labels on st.screen plates
//   holdBag(robot, bag, side='R') · binLid(room, k) · windowOpen(room, k)
import * as THREE from 'three';
const ACC = 0x8ea6ff;
const mat = (c = ACC, o = 1) => { const m = new THREE.MeshStandardMaterial({color: c, roughness: .55, transparent: o < 1, opacity: o, depthWrite: o >= 1}); m.userData.real = true; return m; };
const V = (a) => a.isVector3 ? a.clone() : new THREE.Vector3(...a);

export function soundWave(scene, from, to, {n = 5, speed = .7} = {}) {
  const A = V(from), B = V(to), g = new THREE.Group(); scene.add(g);
  const dir = B.clone().sub(A), dx = dir.clone().normalize(), up = new THREE.Vector3(0, 1, 0), dz = dx.clone().cross(up).normalize(), dy = dz.clone().cross(dx), q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(dx, dy, dz));   // ')' arcs in the vertical plane through the path, opening toward the robot
  const arcs = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, .09, 8, 40, Math.PI * .7), mat(ACC, 1)); m.material.transparent = true; m.quaternion.copy(q); m.rotateZ(-Math.PI * .35); g.add(m); arcs.push(m); }
  return { group: g, update(t, k = 1) { g.visible = k > .01; arcs.forEach((m, i) => { const p = ((t * speed) + i / n) % 1; m.position.copy(A).addScaledVector(dir, p); const s = .12 + .3 * p; m.scale.set(s, s, s);
    m.material.opacity = k * Math.sin(Math.PI * p) * .95; }); } };
}

export function throwArcs(scene, from, targets, {h = .7, dashes = 26} = {}) {
  const A = V(from), g = new THREE.Group(); scene.add(g);
  const arcs = targets.map(tt => { const B = V(tt), M = A.clone().lerp(B, .5); M.y = Math.max(A.y, B.y) + h; const curve = new THREE.QuadraticBezierCurve3(A.clone(), M, B);
    const geo = new THREE.CapsuleGeometry(.012, .05, 4, 8); geo.rotateX(Math.PI / 2); const ms = [];
    for (let i = 0; i < dashes; i++) { const m = new THREE.Mesh(geo, mat()); const u = (i + .5) / dashes; m.position.copy(curve.getPoint(u)); m.lookAt(curve.getPoint(Math.min(1, u + .01))); g.add(m); ms.push(m); }
    const end = new THREE.Mesh(new THREE.TorusGeometry(.09, .012, 8, 40), mat()); end.position.copy(B); end.rotation.x = Math.PI / 2; g.add(end);
    return {curve, ms, end}; });
  return { group: g, point: (i, k) => arcs[i].curve.getPoint(k),
    set(ks, {pulse = 0} = {}) { arcs.forEach((a, j) => { const k = ks[j] ?? 0; a.ms.forEach((m, i) => { m.visible = (i + .5) / a.ms.length <= k; m.scale.setScalar(1 + .5 * pulse); }); a.end.visible = k > .98; a.end.scale.setScalar(1 + .4 * pulse); }); } };
}

export function pageStream(scene, target, {from = null, spread = 2.2, n = 90} = {}) {
  const T = V(target), C = from ? V(from) : T.clone().add(new THREE.Vector3(1.5, 1.2, 1.5));
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 84; const c = cv.getContext('2d'); c.fillStyle = '#f6f4ef'; c.fillRect(0, 0, 64, 84); c.fillStyle = '#9aa0ab'; for (let y = 12; y < 76; y += 8) c.fillRect(8, y, 40 + (y * 7) % 10, 3);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const m = new THREE.MeshStandardMaterial({map: tex, roughness: .8, side: THREE.DoubleSide});
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(.16, .21), m, n); mesh.frustumCulled = false; scene.add(mesh);
  const R = (i, s) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
  const seeds = [...Array(n)].map((_, i) => ({p: C.clone().add(new THREE.Vector3((R(i, 1) - .5) * spread, (R(i, 2) - .5) * spread * .6, (R(i, 3) - .5) * spread)), ph: R(i, 4), sp: .25 + .2 * R(i, 5), rot: R(i, 6) * 6}));
  const o = new THREE.Object3D();
  return { mesh, update(t, k = 1) { mesh.visible = k > .01; seeds.forEach((s, i) => { const u = (s.ph + t * s.sp) % 1, e = u * u;
    o.position.copy(s.p).lerp(T, e); o.position.y += Math.sin(u * Math.PI) * .3; o.rotation.set(s.rot + u * 3, s.rot * .7 + u * 2, 0); o.scale.setScalar(k * (1 - .85 * e)); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); }); mesh.instanceMatrix.needsUpdate = true; } };
}

export function textTowers(st, pos = [0, 0, 0], {gap = 1.4} = {}) {
  const g = new THREE.Group(); g.position.copy(V(pos)); st.scene.add(g);
  const paper = new THREE.MeshStandardMaterial({color: 0xf3f1ec, roughness: .85}), edge = new THREE.MeshStandardMaterial({color: 0xc9c4ba, roughness: .9}); paper.userData.real = edge.userData.real = true;
  const stack = (x, N, mats) => { const geo = new THREE.BoxGeometry(.8, .05, .58); const im = new THREE.InstancedMesh(geo, [paper, edge][0], N); const o = new THREE.Object3D();
    for (let i = 0; i < N; i++) { o.position.set(x + Math.sin(i * 1.7) * .02, .028 + i * .052, Math.cos(i * 2.3) * .02); o.rotation.y = Math.sin(i * 3.1) * .04; o.updateMatrix(); im.setMatrixAt(i, o.matrix); } im.frustumCulled = false; g.add(im); im.count = 0; return im; };
  const EN = 70, HE = 3, en = stack(-gap / 2, EN), he = stack(gap / 2, HE);
  const slang = new THREE.Mesh(new THREE.BoxGeometry(.8, .012, .58), mat()); slang.position.set(gap / 2, HE * .052 + .012, 0); g.add(slang);
  const label = (txt, x, y, col = '#0a0c1c') => { const s = st.screen([.9, .24], (c, t, W, H) => { c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(0, 0, W, H, H * .25); c.fill(); c.fillStyle = col; c.font = `700 ${H * .55}px Rubik`; c.textAlign = 'center'; c.fillText(txt, W / 2, H * .7); }, {light: .5});
    s.mesh.position.set(x, y, .4); g.add(s.mesh); return s.mesh; };
  const lEn = label('English', -gap / 2, .3), lHe = label('עברית', gap / 2, .3), lSl = label('סלנג', gap / 2, .3, '#4f6fe0');
  return { group: g, set({en: ke = 1, he: kh = 1, slang: ks = 0} = {}) {
    en.count = Math.round(EN * ke); he.count = Math.round(HE * kh); slang.visible = ks > .01; slang.scale.x = Math.max(.01, ks);
    lEn.position.y = .3 + en.count * .052; lHe.position.y = .3 + he.count * .052; lSl.visible = ks > .5; lSl.position.y = lHe.position.y + .32; } };
}

export function holdBag(robot, bag, side = 'R') { const w = robot.getObjectByName('wrist' + side); w.add(bag); bag.position.set(0, -.11, .03); bag.rotation.set(0, 0, 0); return bag; }
export function binLid(room, k) { const l = room.getObjectByName('lid'); if (l) l.rotation.x = -1.1 * k; }
export function windowOpen(room, k) { const p = room.getObjectByName('paneSlide'); if (!p) return; if (p.userData.x0 === undefined) p.userData.x0 = p.position.x; p.position.x = p.userData.x0 + (p.userData.openDx ?? -.78) * k; }
