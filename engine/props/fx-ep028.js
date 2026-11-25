// ep028-price FX (Media pro 2026-11-25). Our own code → CC0. Matte, light-blue accent, no glow. For pro/humanoidMini + pro/humanoidSoft (+ pro/humanoidXray, pro/servo for the joint cutaway).
//   acrobat(robot, {mode:'handstand'|'cartwheel', t, k, base})  mini robot tricks (k blends rest → trick; cartwheel spins with t). base = floor position (Vector3)
//   jointDots(robot) → .set(k) → n lit          light-blue rings appear on every joint one by one (fingers included) — returns how many are lit, for the counter
//   heightLine(scene, [x, z], h) → .set(k)       vertical measuring line with ticks + cap, grows to h
//   gripGlass(robot, glass, 'R') → .set(k)       glass in the hand, fingers + thumb close gently (k 0..1)
//   painters for st.screen: priceTag({text}) · gripGauge({k}) · leaseCard({k}) · priceGraph({k}, dashed = forecast) · regions({k}) (US pill lit, Israel pill dim — no claims)
import * as THREE from 'three';
const ACC = 0x8ea6ff, real = m => (m.userData.real = true, m), sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
const J = (r, n) => r.getObjectByName(n);

export function acrobat(robot, {mode = 'handstand', t = 0, k = 1, base = null} = {}) {
  const b = base || (robot.userData.base ??= robot.position.clone()); const sc = robot.getObjectByName('scaleRoot') ? .74 : 1;
  const set = (n, x = 0, y = 0, z = 0) => { const o = J(robot, n); if (o) o.rotation.set(x * k, y * k, z * k); };
  if (mode === 'handstand') { set('shoulderL', Math.PI * .98); set('shoulderR', Math.PI * .98); set('elbowL', 0); set('elbowR', 0); set('hipL', -.25, 0, .12); set('hipR', .2, 0, -.12); set('kneeL', .3); set('neck', -.4);
    robot.rotation.set(0, robot.rotation.y, Math.PI * k); robot.position.set(b.x, b.y + 2.3 * sc * k, b.z); }
  else { set('shoulderL', 0, 0, -1.55); set('shoulderR', 0, 0, 1.55); set('elbowL', 0); set('elbowR', 0); set('hipL', 0, 0, -.55); set('hipR', 0, 0, .55); set('kneeL', 0); set('kneeR', 0);
    const a = t * 3.2 * k; robot.rotation.set(0, robot.rotation.y, a);   // turns about the pelvis (≈ .95 m × scale)
    const c = new THREE.Vector3(0, .95 * sc, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), a); robot.position.x = b.x - c.x; robot.position.y = b.y + .95 * sc - c.y; }
}

const JOINTS = ['neck', 'torso', ...['L', 'R'].flatMap(s => ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle'].map(j => j + s)), ...['L', 'R'].flatMap(s => [0, 1, 2, 3].flatMap(f => [0, 1, 2].map(p => `f${s}${f}_${p}`)).concat([`thumb${s}_0`, `thumb${s}_1`]))];
export function jointDots(robot, {size = 1} = {}) {
  const m = real(new THREE.MeshStandardMaterial({color: ACC, roughness: .5})), rings = [];
  for (const n of JOINTS) { const o = J(robot, n); if (!o) continue; const small = n.startsWith('f') || n.startsWith('thumb'); const r = new THREE.Mesh(new THREE.TorusGeometry(small ? .014 : .05, small ? .003 : .007, 8, 32), m); r.scale.setScalar(size); o.add(r); r.visible = false; rings.push(r); }
  return { count: rings.length, set(k) { const n = Math.round(rings.length * k); rings.forEach((r, i) => { r.visible = i < n; r.quaternion.copy(r.parent.getWorldQuaternion(new THREE.Quaternion()).invert()); }); return n; } };
}

export function heightLine(scene, [x, z], h, {w = .03} = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const m = real(new THREE.MeshStandardMaterial({color: ACC, roughness: .5}));
  const bar = new THREE.Mesh(new THREE.BoxGeometry(w * .4, 1, w * .4), m); bar.geometry.translate(0, .5, 0); g.add(bar); const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 6, w * .6, w * .6), m); g.add(cap);
  const ticks = [...Array(Math.ceil(h / .25))].map((_, i) => { const t = new THREE.Mesh(new THREE.BoxGeometry(w * 2.5, w * .3, w * .3), m); t.position.y = (i + 1) * .25; g.add(t); return t; });
  return { group: g, set(k) { const y = Math.max(.001, h * k); bar.scale.y = y; cap.position.y = y; ticks.forEach(t => t.visible = t.position.y < y - .02); } };
}

export function gripGlass(robot, glass, side = 'R') {
  const wr = J(robot, 'wrist' + side); wr.add(glass); glass.position.set(0, -.115, .045); glass.rotation.set(0, 0, 0);
  const fingers = []; robot.traverse(o => { if (o.name.startsWith('f' + side) || o.name.startsWith('thumb' + side)) fingers.push([o, o.rotation.x]); });
  return { set(k) { fingers.forEach(([o, x0]) => { o.rotation.x = x0 - (o.name.startsWith('thumb') ? .5 : .75) * k; }); } };
}

// ---------- st.screen painters ----------
const card = (c, W, H, r = .22) => { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(4, 4, W - 8, H - 8, H * r); c.fill(); };
export function priceTag(c, t, W, H, {text = '6,000$'} = {}) { card(c, W, H, .3); c.fillStyle = '#0a0c1c'; c.font = `700 ${H * .56}px Rubik`; c.textAlign = 'center'; c.direction = 'ltr'; c.fillText(text, W / 2, H * .7); }
export function gripGauge(c, t, W, H, {k = .4, limit = .75} = {}) { card(c, W, H, .2); const x0 = W * .08, w = W * .84, y = H * .52, h = H * .22;
  c.fillStyle = '#e7e9f0'; c.beginPath(); c.roundRect(x0, y, w, h, h / 2); c.fill(); c.fillStyle = '#8ea6ff'; c.beginPath(); c.roundRect(x0, y, Math.max(h, w * k), h, h / 2); c.fill();
  c.fillStyle = '#f0502a'; c.fillRect(x0 + w * limit, y - h * .4, W * .012, h * 1.8); c.fillStyle = '#0a0c1c'; c.font = `700 ${H * .22}px Rubik`; c.direction = 'rtl'; c.textAlign = 'right'; c.fillText('כוח אחיזה', W - x0, H * .36); }
export function leaseCard(c, t, W, H, {k = 1} = {}) { card(c, W, H, .08); c.direction = 'rtl'; c.textAlign = 'right'; const p = W * .08;
  c.fillStyle = '#0a0c1c'; c.font = `700 ${H * .12}px Rubik`; c.fillText('הזמנה מוקדמת', W - p, H * .2); c.fillStyle = '#4f6fe0'; c.font = `700 ${H * .1}px Rubik`; c.fillText('מנוי חודשי', W - p, H * .34);
  c.fillStyle = '#d9dce6'; for (let i = 0; i < 4; i++) c.fillRect(p, H * (.46 + i * .1), (W - 2 * p) * (i === 3 ? .5 : .95), H * .025);
  c.strokeStyle = '#0a0c1c'; c.lineWidth = H * .012; c.beginPath(); const sx = p, sy = H * .9; for (let i = 0; i <= 40 * k; i++) { const u = i / 40; c.lineTo(sx + u * W * .4, sy - Math.sin(u * 18) * H * .03 - u * H * .02); } c.stroke(); }
export function priceGraph(c, t, W, H, {k = 1} = {}) { card(c, W, H, .08); const p = W * .1, x = u => p + u * (W - 2 * p), y = v => H * .15 + (1 - v) * H * .65;
  c.strokeStyle = '#d9dce6'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(p, y(i / 3)); c.lineTo(W - p, y(i / 3)); c.stroke(); }
  const pts = [[0, .95], [.2, .9], [.4, .78], [.6, .62], [.8, .45], [1, .32]], n = pts.length - 1; c.lineWidth = H * .025; c.lineCap = 'round'; c.strokeStyle = '#8ea6ff';
  for (let i = 0; i < n; i++) { if (i / n >= k) break; const e = Math.min(1, (k - i / n) * n); c.setLineDash(i >= 2 ? [H * .04, H * .035] : []); c.beginPath(); c.moveTo(x(pts[i][0]), y(pts[i][1]));
    c.lineTo(x(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * e), y(pts[i][1] + (pts[i + 1][1] - pts[i][1]) * e)); c.stroke(); } c.setLineDash([]);
  c.fillStyle = '#5c6176'; c.font = `500 ${H * .07}px Rubik`; c.direction = 'rtl'; c.textAlign = 'right'; c.fillText('מחיר', W - p, H * .1); c.textAlign = 'left'; c.fillText('תחזית', x(.45), H * .95); }
export function regions(c, t, W, H, {k = 1} = {}) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.direction = 'rtl'; c.textAlign = 'center';
  [['ארה״ב', true, .28], ['ישראל', false, .72]].forEach(([n, on, cx]) => { const w = W * .38, h = H * .5, x = W * cx - w / 2, y = H * .25; c.globalAlpha = on ? 1 : .45 + .1 * (1 - k);
    c.fillStyle = on ? '#8ea6ff' : '#ffffff'; c.beginPath(); c.roundRect(x, y, w, h, h * .3); c.fill(); c.fillStyle = '#0a0c1c'; c.font = `700 ${h * .42}px Rubik`; c.fillText(n, W * cx, y + h * .64); }); c.globalAlpha = 1; }
