// ep031-homehub FX (Media pro 2026-11-27 run 19). Our own code → CC0. Matte light-blue brand accent (#8ea6ff / deep #4f6fe0), no glow, no bloom.
// Pair with buildings/apartment31 + everyday/homeHub. All helpers return objects with .update/.set — call them from st.frame(t => ...).
import * as THREE from 'three';
const mat = (c, o = 1) => { const m = new THREE.MeshStandardMaterial({color: c, roughness: .6, transparent: o < 1, opacity: o, depthWrite: o >= 1}); m.userData.real = true; return m; };
const clamp = (x) => Math.max(0, Math.min(1, x));

/** commandLine(scene, a, b, {lift=1.2, dash=.12, color}) — dashed light-blue arc from a (device voiceSpot) to b (e.g. AC airOut), drawn in on .set(k 0..1); a bead travels along it with .bead(u 0..1|null).
 *  Use: line.set(sm(3,4,t)); line.bead(sm(4,5,t)). */
export function commandLine(scene, a, b, {lift = 1.2, dash = .12, color = 0x8ea6ff} = {}) {
  const A = a.clone(), Bv = b.clone(), mid = A.clone().lerp(Bv, .5); mid.y = Math.max(A.y, Bv.y) + lift;
  const curve = new THREE.QuadraticBezierCurve3(A, mid, Bv), L = curve.getLength(), n = Math.max(4, Math.floor(L / (dash * 2)));
  const g = new THREE.Group(); g.name = 'commandLine'; scene.add(g); const m = mat(color), geo = new THREE.BoxGeometry(.018, .018, dash), segs = [];
  for (let i = 0; i < n; i++) { const u = (i + .5) / n, s = new THREE.Mesh(geo, m); s.position.copy(curve.getPointAt(u)); s.lookAt(curve.getPointAt(Math.min(1, u + .01))); s.visible = false; g.add(s); segs.push([u, s]); }
  const bead = new THREE.Mesh(new THREE.SphereGeometry(.045, 20, 14), mat(0x4f6fe0)); bead.visible = false; g.add(bead);
  return { group: g, curve, set(k) { for (const [u, s] of segs) s.visible = u <= k; }, bead(u) { bead.visible = u != null && u > 0 && u < 1; if (bead.visible) bead.position.copy(curve.getPointAt(u)); } };
}

/** coldAir(scene, airOut, {n=7, len=1.8}) — cold air as soft moving wind streaks: short see-through matte dashes that glide forward and slowly down from the AC outlet (not hanging strings).
 *  .update(t, k) — k 0..1 = strength (0 hidden). */
export function coldAir(scene, airOut, {n = 7, len = 1.8, color = 0xd6e4ff} = {}) {
  const g = new THREE.Group(); g.name = 'coldAir'; scene.add(g); const st = [];
  for (let i = 0; i < n; i++) { const x = (i / (n - 1) - .5) * .75, pts = [];
    for (let j = 0; j <= 10; j++) { const u = j / 10; pts.push(new THREE.Vector3(airOut.x + x * (1 + u * .5), airOut.y - .05 - u * u * len * .55, airOut.z + u * len)); }
    const c = new THREE.CatmullRomCurve3(pts);
    for (let d = 0; d < 2; d++) { const m = mat(color, 0); const s = new THREE.Mesh(new THREE.CapsuleGeometry(.012, .22, 4, 8), m); s.castShadow = false; g.add(s); st.push({s, m, c, ph: (i * .37 + d * .5) % 1}); } }
  return { group: g, update(t, k) { for (const o of st) { const u = (t * .45 + o.ph) % 1; o.s.position.copy(o.c.getPointAt(u)); const tg = o.c.getTangentAt(u); o.s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg);
    o.m.opacity = k * .5 * Math.sin(Math.PI * u); o.s.visible = o.m.opacity > .01; } } };
}

const GLYPHS = ['bulb', 'snow', 'cart', 'cal', 'cam', 'lock', 'note', 'therm', 'plug', 'blind'];
const TINTS = ['#f2b33d', '#6fb7e8', '#5bb381', '#e86f5b', '#6f7fe8', '#9a7be0', '#e88bb5', '#e8925b', '#58b8b0', '#8a95a3'];
function glyph(c, k, S) { c.strokeStyle = c.fillStyle = '#fff'; c.lineWidth = S * .06; c.lineCap = c.lineJoin = 'round'; const m = S / 2; c.beginPath();
  if (k === 'bulb') { c.arc(m, m * .85, S * .2, Math.PI * .8, Math.PI * 2.2); c.lineTo(m + S * .08, m * 1.35); c.lineTo(m - S * .08, m * 1.35); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(m - S * .08, m * 1.5); c.lineTo(m + S * .08, m * 1.5); }
  if (k === 'snow') for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; c.moveTo(m - Math.cos(a) * S * .28, m - Math.sin(a) * S * .28); c.lineTo(m + Math.cos(a) * S * .28, m + Math.sin(a) * S * .28); }
  if (k === 'cart') { c.moveTo(S * .2, S * .3); c.lineTo(S * .3, S * .3); c.lineTo(S * .38, S * .62); c.lineTo(S * .74, S * .62); c.lineTo(S * .8, S * .38); c.lineTo(S * .33, S * .38); c.stroke(); c.beginPath(); c.arc(S * .42, S * .74, S * .05, 0, 7); c.moveTo(S * .75, S * .74); c.arc(S * .7, S * .74, S * .05, 0, 7); }
  if (k === 'cal') { c.rect(S * .24, S * .28, S * .52, S * .46); c.moveTo(S * .24, S * .42); c.lineTo(S * .76, S * .42); c.moveTo(S * .36, S * .22); c.lineTo(S * .36, S * .32); c.moveTo(S * .64, S * .22); c.lineTo(S * .64, S * .32); }
  if (k === 'cam') { c.rect(S * .2, S * .34, S * .6, S * .38); c.moveTo(S * .62, S * .53); c.arc(S * .5, S * .53, S * .12, 0, 7); }
  if (k === 'lock') { c.rect(S * .28, S * .46, S * .44, S * .32); c.moveTo(S * .36, S * .46); c.arc(m, S * .44, S * .14, Math.PI, 0); }
  if (k === 'note') { c.moveTo(S * .42, S * .7); c.lineTo(S * .42, S * .26); c.lineTo(S * .7, S * .2); c.lineTo(S * .7, S * .62); c.stroke(); c.beginPath(); c.arc(S * .36, S * .7, S * .07, 0, 7); c.fill(); c.beginPath(); c.arc(S * .64, S * .63, S * .07, 0, 7); c.fill(); return; }
  if (k === 'therm') { c.moveTo(S * .45, S * .62); c.lineTo(S * .45, S * .24); c.arc(m, S * .24, S * .05, Math.PI, 0); c.lineTo(S * .55, S * .62); c.stroke(); c.beginPath(); c.arc(m, S * .7, S * .1, 0, 7); c.fill(); return; }
  if (k === 'plug') { c.rect(S * .32, S * .36, S * .36, S * .26); c.moveTo(S * .42, S * .36); c.lineTo(S * .42, S * .24); c.moveTo(S * .58, S * .36); c.lineTo(S * .58, S * .24); c.moveTo(m, S * .62); c.lineTo(m, S * .78); }
  if (k === 'blind') { for (let i = 0; i < 5; i++) { c.moveTo(S * .26, S * (.26 + i * .1)); c.lineTo(S * .74, S * (.26 + i * .1)); } }
  c.stroke(); }

/** appCloud(scene, center, {size=.22}) — 10 GENERIC smart-home app icons (bulb, AC, cart, calendar, camera, lock, music, thermostat, plug, blinds) as rounded matte tiles (no real app logos).
 *  .scatter(k, t) — k 0..1 from stacked at center → messy floating cloud around it (slow drift) · .gather(k, target) — fly into target (the device), shrinking · .tiles[i] for single moves. */
export function appCloud(scene, center, {size = .22} = {}) {
  const g = new THREE.Group(); g.name = 'appCloud'; scene.add(g); const tiles = [];
  GLYPHS.forEach((k, i) => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); const r = 28;
    c.fillStyle = TINTS[i]; c.beginPath(); c.roundRect(4, 4, 120, 120, r); c.fill(); glyph(c, k, 128);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const m = new THREE.MeshStandardMaterial({map: tx, roughness: .7, transparent: true}); m.userData.real = true;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(size, size), m); p.name = 'app_' + k; g.add(p);
    const a = i * 2.39996, rr = .35 + (i % 3) * .14; tiles.push({p, home: new THREE.Vector3(Math.cos(a) * rr * 1.4, Math.sin(a) * rr * .8 + .1, (i % 2 ? .08 : -.08)), spin: (i % 2 ? 1 : -1) * (.2 + i * .03)}); });
  const C = center.clone(), tmp = new THREE.Vector3();
  const api = { group: g, tiles,
    scatter(k, t = 0) { for (const [i, o] of tiles.entries()) { tmp.copy(o.home).multiplyScalar(k); tmp.y += Math.sin(t * 1.3 + i) * .03 * k; o.p.position.copy(C).add(tmp); o.p.rotation.z = o.spin * k * (1 + .2 * Math.sin(t + i)); o.p.scale.setScalar(.4 + .6 * k); o.p.visible = k > 0; } },
    gather(k, target, t = 0) { api.scatter(1, t); for (const [i, o] of tiles.entries()) { const kk = clamp(k * 1.6 - i * .06); o.p.position.lerp(target, kk * kk); o.p.scale.setScalar(1 - .85 * kk); o.p.visible = kk < .98; } },
    face(cam) { for (const o of tiles) o.p.quaternion.copy(cam.quaternion); } };
  return api;
}

/** floorPaths(scene, routes, {y=.02}) — dashed matte floor arrows (e.g. bedroom → hall → mamad). routes = [[V,V,V...], ...]. .set(k 0..1) draws them in; .march(t) slides the dashes toward the end. */
export function floorPaths(scene, routes, {y = .02, color = 0x4f6fe0, dash = .22} = {}) {
  const g = new THREE.Group(); g.name = 'floorPaths'; scene.add(g); const m = mat(color), all = [];
  routes.forEach(pts => { const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p.x, y, p.z)), false, 'centripetal'), L = c.getLength(), n = Math.floor(L / (dash * 1.8));
    for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(.09, .006, dash), m); s.castShadow = false; g.add(s); all.push({s, c, u0: i / n, n}); }
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.12, .28, 3), m); tip.rotation.x = Math.PI / 2; const end = c.getPointAt(1), pre = c.getPointAt(.97); const holder = new THREE.Group(); holder.position.copy(end); holder.lookAt(end.clone().add(end.clone().sub(pre))); holder.add(tip); tip.scale.y = .3; holder.visible = false; g.add(holder); all.push({tip: holder}); });
  let off = 0;
  return { group: g, set(k) { for (const o of all) { if (o.tip) { o.tip.visible = k >= .99; continue; } o.s.visible = o.u0 <= k; } },
    march(t) { off = (t * .5) % 1; for (const o of all) { if (o.tip) continue; const u = Math.min(.999, (o.u0 + off / o.n)); o.s.position.copy(o.c.getPointAt(u)); o.s.lookAt(o.c.getPointAt(Math.min(1, u + .01))); } } };
}

/** hubRims(hub) — light the homeHub rims like a voice level. .set(call 0..1, t, {level}) — call = how "awake" (0 off), rims rise bottom→top; full = all on (alert). */
export function hubRims(hub) {
  const rims = []; for (let i = 0; i < 6; i++) { const r = hub.getObjectByName('rim' + i); if (r) rims.push(r.material); }
  const OFF = new THREE.Color(0xd8dde8), ON = new THREE.Color(0x7f9bff), FULL = new THREE.Color(0x4f6fe0);
  return { set(call, t, {full = 0} = {}) { rims.forEach((m, i) => { const lvl = .5 + .5 * Math.sin(t * 6 - i * .9); m.color.copy(OFF).lerp(ON, call * (.45 + .55 * lvl)).lerp(FULL, full); }); } };
}
