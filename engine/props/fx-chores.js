// ep027-chores FX (Media pro 2026-11-25). Our own code → CC0. Matte, no glow; light blue #8ea6ff = can do, red #f0502a = can't yet.
//   spinVac(vac, t, {mop, brush, lidar})            mop pads / side brush / lidar spin (0 = stop)
//   sockPick(vac, sock) → .update(k, {slip})          k 0..1: hatch opens → arm unfolds → reaches the sock (2-link IK) → jaws close → lifts it (~0.3 m). slip 0..1 = it slips out and falls (the "not always" beat)
//   dockEmpty(scene, dock, vac) → .update(t, k)      dust specks run robot bin → bag ('dustPath'), bag fills; clean water drops while k runs
//   borderLine(scene, a, b, {to}) → .set(k)          a light-blue floor line between the ✓ side and the ✗ side; k slides it from a toward `to` ("הגבול זז")
//   tagCard(c, t, W, H, {ok, text})                  st.screen painter: white rounded card with ✓ (light blue) or ✗ (red) + Hebrew word — for st.screen([.5,.2], ...) above each robot/spot
import * as THREE from 'three';
const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const real = (m) => (m.userData.real = true, m);

export function spinVac(v, t, {mop = 1, brush = 1, lidar = 1} = {}) { const g = n => v.getObjectByName(n);
  g('mopL') && (g('mopL').rotation.y = t * 9 * mop); g('mopR') && (g('mopR').rotation.y = -t * 9 * mop); g('sideBrush') && (g('sideBrush').rotation.y = -t * 14 * brush); g('lidar') && (g('lidar').rotation.y = t * 6 * lidar); }

export function sockPick(vac, sock) {
  const g = n => vac.getObjectByName(n), base = g('armBase'), A = g('armA'), Bn = g('armB'), hatch = g('hatch'), jA = g('jawA'), jB = g('jawB'), grip = g('gripSpot');
  vac.updateMatrixWorld(true); sock.updateMatrixWorld(true);
  const home = sock.parent, sockW = sock.getWorldPosition(new THREE.Vector3()), grabW = (sock.getObjectByName('grabSpot') || sock).getWorldPosition(new THREE.Vector3());
  const L1 = .12, L2 = .13, ik = (d, y) => { const D = Math.min(L1 + L2 - 1e-3, Math.hypot(d, y)); const c2 = (D * D - L1 * L1 - L2 * L2) / (2 * L1 * L2), q2 = -Math.acos(Math.max(-1, Math.min(1, c2)));
    return [Math.atan2(y, d) - Math.atan2(L2 * Math.sin(q2), L1 + L2 * Math.cos(q2)), q2]; };
  const piv = () => A.getWorldPosition(new THREE.Vector3());
  let held = false; const sock0 = sock.position.clone(), rot0 = sock.quaternion.clone();
  return { update(k, {slip = 0} = {}) {
    hatch.rotation.x = -1.9 * sm(0, .15, k);
    // aim the base at the sock (vacuum's local frame)
    const loc = vac.worldToLocal(grabW.clone()); base.rotation.y = Math.atan2(-loc.x, -loc.z);
    const P = piv(), dH = Math.hypot(grabW.x - P.x, grabW.z - P.z), dy = grabW.y - P.y;
    const lift = sm(.6, 1, k), [a1, a2] = ik(dH * (1 - .45 * lift), dy + .32 * lift);
    const u = sm(.15, .5, k); A.rotation.x = a1 * u; Bn.rotation.x = Math.PI * (1 - u) + a2 * u;
    const close = sm(.5, .6, k) * (1 - sm(0, .3, slip)); jA.position.x = -.008 - .006 * (1 - close); jB.position.x = .008 + .006 * (1 - close);
    vac.updateMatrixWorld(true);
    const want = k >= .55 && slip < .15;
    if (want && !held) { grip.attach(sock); const gl = (sock.getObjectByName('grabSpot') || {position: new THREE.Vector3()}).position.clone().multiply(sock.scale); sock.position.copy(gl.applyQuaternion(sock.quaternion).negate()); held = true; }
    if (!want && held) { home.attach(sock); held = false; }
    if (!held) { if (slip > .15 && k >= .55) { const f = sm(.15, .7, slip); sock.position.y = Math.max(sock0.y, sock.position.y - .03 * f); if (f >= 1) sock.position.y = sock0.y; } else { sock.position.copy(sock0); sock.quaternion.copy(rot0); } }
  } };
}

export function dockEmpty(scene, dock, vac) {
  const path = dock.getObjectByName('dustPath'), dl = dock.getObjectByName('dustLevel'), cw = dock.getObjectByName('cleanWater');
  const curve = new THREE.CatmullRomCurve3(path.userData.pts.map(q => new THREE.Vector3(...q))), n = 40, specks = new THREE.InstancedMesh(new THREE.SphereGeometry(.004, 6, 4), real(new THREE.MeshStandardMaterial({color: 0x8b8478, roughness: 1})), n); path.add(specks); specks.frustumCulled = false;
  const o = new THREE.Object3D(), l0 = dl.scale.y, w0 = cw.scale.y;
  return { update(t, k = 1) { specks.visible = k > 0 && k < 1; for (let i = 0; i < n; i++) { const u = ((t * 1.6) + i / n) % 1; o.position.copy(curve.getPoint(u)); o.position.x += Math.sin(i * 7.1) * .006; o.scale.setScalar(.6 + (i % 3) * .3); o.updateMatrix(); specks.setMatrixAt(i, o.matrix); } specks.instanceMatrix.needsUpdate = true;
    dl.scale.y = l0 + (.85 - l0) * k; cw.scale.y = w0 - .15 * k; } };
}

export function borderLine(scene, a, b, {to = null, w = .05} = {}) {
  const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), T = to ? new THREE.Vector3(...to) : null, len = A.distanceTo(Bv);
  const m = new THREE.Mesh(new THREE.BoxGeometry(len, .006, w), real(new THREE.MeshStandardMaterial({color: 0x8ea6ff, roughness: .5}))); scene.add(m);
  const dir = Bv.clone().sub(A); m.rotation.y = -Math.atan2(dir.z, dir.x); const mid = A.clone().lerp(Bv, .5);
  return { mesh: m, set(k = 0) { m.position.copy(mid); if (T) m.position.lerp(T, k); m.position.y = .004; } };
}

export function tagCard(c, t, W, H, {ok = true, text = ''} = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(4, 4, W - 8, H - 8, H * .28); c.fill();
  const r = H * .32, cx = W - H * .5, cy = H / 2; c.fillStyle = ok ? '#8ea6ff' : '#f0502a'; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
  c.strokeStyle = ok ? '#0a0c1c' : '#ffffff'; c.lineWidth = H * .08; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath();
  if (ok) { c.moveTo(cx - r * .45, cy); c.lineTo(cx - r * .1, cy + r * .35); c.lineTo(cx + r * .5, cy - r * .35); } else { const q = r * .38; c.moveTo(cx - q, cy - q); c.lineTo(cx + q, cy + q); c.moveTo(cx + q, cy - q); c.lineTo(cx - q, cy + q); } c.stroke();
  if (text) { c.direction = 'rtl'; c.textAlign = 'right'; c.fillStyle = '#0a0c1c'; c.font = `700 ${H * .46}px Rubik`; c.fillText(text, W - H * 1.0, H * .66); }
}
