// Radar FX for ep029-phantombrake + ep030-backseat (Media pro 2026-11-27 run 19b). Our own code → CC0.
// Matte light blue #8ea6ff = signal going out, deep blue #4f6fe0 = echo coming back. No glow, no bloom. Call the .update/.set helpers from st.frame(t => ...).
import * as THREE from 'three';
const mat = (c, o = 1, side = THREE.FrontSide) => { const m = new THREE.MeshStandardMaterial({color: c, roughness: .6, transparent: o < 1, opacity: o, depthWrite: o >= 1, side}); m.userData.real = true; return m; };
const ACC = 0x8ea6ff, DEEP = 0x4f6fe0;
const clamp = x => Math.max(0, Math.min(1, x));

/** paintCar(car, key) — recolour car/sedanLite or car/radarSedan ('carPaint' material): 'white'|'silver'|'blue'|'red'|'black'|'sand' or a hex number. */
const PAINT = {white: 0xeeeeec, silver: 0xb9bec4, blue: 0x2f4f78, red: 0x8e2a2a, black: 0x1d1f22, sand: 0xc9b99a};
export function paintCar(car, key) { let P = null; car.traverse(o => { if (o.isMesh && o.material && o.material.name === 'carPaint') { if (!P) { P = o.material.clone(); P.color.setHex(PAINT[key] ?? key); P.userData.real = true; } o.material = P; } }); return car; }

/** brakes(car) — car/radarSedan brake lights: .set(k 0..1) off → on (lit surface, no bloom). */
export function brakes(car) { const ms = ['brakeL', 'brakeR', 'brakeTop'].map(n => car.getObjectByName(n)).filter(Boolean).map(o => o.material);
  return { set(k) { for (const m of ms) { m.emissiveIntensity = .25 + 2 * k; m.emissive.setHex(k > .5 ? 0xff2a2a : 0xd0141b); } } }; }

/** waveFan(scene, origin, {mode, dir, hAngle, vAngle, range, n, speed}) — radar waves as thin see-through shells that travel out from origin and fade.
 *  mode 'flat' (car radar, ep029): wide across the lanes (hAngle ~1.0 rad), thin in height (vAngle ~.1) — "scans across, not up".
 *  mode 'cone' (ceiling radar, ep030): a cone around dir (vAngle = half-angle) — set dir (0,-1,0) for straight down.
 *  .update(t, k) — k 0..1 strength (0 hidden) · .pulse(u) — draw ONE wave at fraction u of the range (for the timing beat; pass null to go back to continuous) · .group (move/parent it, e.g. to the car). */
export function waveFan(scene, origin, {mode = 'flat', dir = new THREE.Vector3(0, 0, 1), hAngle = 1.0, vAngle = .1, range = 40, n = 5, speed = .6, color = ACC, thick = .02} = {}) {
  const g = new THREE.Group(); g.name = 'waveFan'; g.position.copy(origin); scene.add(g);
  g.quaternion.setFromUnitVectors(mode === 'flat' ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const geo = mode === 'flat' ? new THREE.SphereGeometry(1, 64, 4, Math.PI / 2 - hAngle / 2, hAngle, Math.PI / 2 - vAngle / 2, vAngle) : new THREE.SphereGeometry(1, 64, 12, 0, Math.PI * 2, 0, vAngle);
  const shells = []; for (let i = 0; i < n; i++) { const m = mat(color, 0, THREE.DoubleSide); const s = new THREE.Mesh(geo, m); s.castShadow = s.receiveShadow = false; s.renderOrder = 5; g.add(s); shells.push({s, m}); }
  let single = null;
  const api = { group: g,
    update(t, k) { shells.forEach(({s, m}, i) => { const u = single != null ? (i ? -1 : single) : (t * speed + i / n) % 1; const vis = u >= 0 && k > 0; s.visible = vis; if (!vis) return;
      s.scale.setScalar(Math.max(.01, u * range)); m.opacity = k * .45 * (1 - u) * Math.min(1, u * 8); }); },
    pulse(u) { single = u; } };
  return api;
}

/** echoDots(scene, {max=400, r=.07}) — instanced matte dots (echo points). .set(points[], {k, color, size}) shows the first ceil(k·N) of them;
 *  .flatten(points, h0, f) → a copy where every y is squashed toward h0 by f (old radar: no height → a bridge and a car look alike; new 4D radar: f=0 = true heights).
 *  Helpers: wallPoints(center, w, h, step) — a vertical "wall" grid facing ±z · boxPoints(obj, step) — dots on the faces of an object's bounding box (bridge, gantry, car) · discPoints(center, r, step) (manhole). */
export function echoDots(scene, {max = 400, r = .07, color = DEEP} = {}) {
  const m = mat(color); const im = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), m, max); im.castShadow = false; im.name = 'echoDots'; im.count = 0; scene.add(im);
  const M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), S = new THREE.Vector3();
  return { mesh: im,
    set(points, {k = 1, size = r, pop = 0, col} = {}) { const n = Math.min(max, Math.ceil(points.length * clamp(k))); im.count = n; if (col != null) m.color.setHex(col);
      for (let i = 0; i < n; i++) { const s = size * (1 + pop * Math.max(0, Math.sin((i * 1.7) % 6.28))); S.setScalar(s); M4.compose(points[i], q, S); im.setMatrixAt(i, M4); } im.instanceMatrix.needsUpdate = true; },
    flatten(points, h0, f) { return points.map(p => new THREE.Vector3(p.x, p.y + (h0 - p.y) * f, p.z)); } };
}
export function wallPoints(c, w, h, step = .45, y0 = null) { const out = [], yb = y0 ?? c.y - h / 2; for (let x = -w / 2; x <= w / 2 + 1e-6; x += step) for (let y = 0; y <= h + 1e-6; y += step) out.push(new THREE.Vector3(c.x + x, yb + y, c.z)); return out; }
export function boxPoints(obj, step = .5, {faces = ['-z', 'top', 'bottom']} = {}) { const b = new THREE.Box3().setFromObject(obj), out = [], [a, z] = [b.min, b.max];
  for (let x = a.x; x <= z.x; x += step) { for (let y = a.y; y <= z.y; y += step) if (faces.includes('-z')) out.push(new THREE.Vector3(x, y, a.z));
    for (let zz = a.z; zz <= z.z; zz += step) { if (faces.includes('top')) out.push(new THREE.Vector3(x, z.y, zz)); if (faces.includes('bottom')) out.push(new THREE.Vector3(x, a.y, zz)); } } return out; }
export function discPoints(c, r, step = .12) { const out = []; for (let x = -r; x <= r; x += step) for (let z = -r; z <= r; z += step) if (x * x + z * z <= r * r) out.push(new THREE.Vector3(c.x + x, c.y + .03, c.z + z)); return out; }

/** echoTrip(scene, from, to) — the timing beat: a light-blue pulse ball flies out, a deep-blue ball flies back. .at(u 0..1) (0...5 out, .5..1 back) → returns {pos, out:boolean};
 *  timer canvas: drawTimer(c, t, W, H, {u, dist}) — a clean stopwatch card "זמן הלוך־חזור" with the running time in nanoseconds and the distance tag when the echo is back. */
export function echoTrip(scene, from, to, {r = .12} = {}) {
  const out = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat(ACC)), back = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat(DEEP)); out.visible = back.visible = false; scene.add(out, back);
  return { at(u) { out.visible = u > 0 && u < .5; back.visible = u >= .5 && u < 1; const p = u < .5 ? from.clone().lerp(to, u * 2) : to.clone().lerp(from, (u - .5) * 2); (u < .5 ? out : back).position.copy(p); return {pos: p, out: u < .5}; } };
}
export function drawTimer(c, t, W, H, {u = 0, dist = 60} = {}) {
  c.clearRect(0, 0, W, H); c.fillStyle = 'rgba(255,255,255,.94)'; c.beginPath(); c.roundRect(0, 0, W, H, H * .18); c.fill();
  const ns = Math.round(clamp(u) * dist * 2 / .3);   // light: 0.3 m per ns
  c.direction = 'rtl'; c.textAlign = 'center'; c.fillStyle = '#1b2230'; c.font = `700 ${H * .2}px Rubik`; c.fillText('זמן הלוך־חזור', W / 2, H * .3);
  c.direction = 'ltr'; c.font = `700 ${H * .3}px Rubik`; c.fillStyle = u >= 1 ? '#4f6fe0' : '#1b2230'; c.fillText(`${ns} ns`, W / 2, H * .66);
  if (u >= 1) { c.direction = 'rtl'; c.font = `700 ${H * .17}px Rubik`; c.fillStyle = '#4f6fe0'; c.fillText(`= ${dist} מטר`, W / 2, H * .9); }
}

/** drawDoppler(c, t, W, H, {mode}) — side-view wave strip: 'still' (echo spacing = sent spacing, tag '0 קמ״ש') · 'toward' (echo squeezed) · 'away' (stretched). Light-blue sent waves on top, deep-blue echo below. */
export function drawDoppler(c, t, W, H, {mode = 'still', tag = null} = {}) {
  c.clearRect(0, 0, W, H); c.fillStyle = 'rgba(255,255,255,.94)'; c.beginPath(); c.roundRect(0, 0, W, H, H * .12); c.fill();
  const wave = (y, lam, col) => { c.strokeStyle = col; c.lineWidth = H * .035; c.beginPath(); for (let x = W * .06; x <= W * .94; x += 2) { const yy = y + Math.sin((x / lam - t * 3) * Math.PI * 2) * H * .1; x === W * .06 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); };
  const base = W * .12, f = mode === 'toward' ? .7 : mode === 'away' ? 1.4 : 1; wave(H * .3, base, '#8ea6ff'); wave(H * .66, base * f, '#4f6fe0');
  c.direction = 'rtl'; c.textAlign = 'center'; c.fillStyle = '#1b2230'; c.font = `700 ${H * .14}px Rubik`; c.fillText(tag ?? (mode === 'still' ? '0 קמ״ש' : mode === 'toward' ? 'מתקרב' : 'מתרחק'), W / 2, H * .94);
}

/** drawRadarView(c, t, W, H, {dots, mode}) — the floating "what the radar sees" screen (bird's-eye, car at the bottom): dots = [{x, d, v, h}] (x lateral m, d distance m, v speed km/h, h height m);
 *  mode 'top' (distance + speed tags) · 'side' (side view: old radar smears height into one band; pass {smear:1}) · {stack: 0..1} lifts dots to their true height (new 4D radar). */
export function drawRadarView(c, t, W, H, {dots = [], mode = 'top', smear = 0, stack = 0, maxD = 120} = {}) {
  c.clearRect(0, 0, W, H); c.fillStyle = 'rgba(16,22,34,.92)'; c.beginPath(); c.roundRect(0, 0, W, H, W * .05); c.fill();
  c.strokeStyle = 'rgba(142,166,255,.35)'; c.lineWidth = 2;
  if (mode === 'top') { const cx = W / 2, cy = H * .92; for (let r = 1; r <= 4; r++) { c.beginPath(); c.arc(cx, cy, H * .2 * r, Math.PI * 1.25, Math.PI * 1.75); c.stroke(); }
    c.fillStyle = '#eef0f2'; c.beginPath(); c.roundRect(cx - W * .04, cy - H * .03, W * .08, H * .07, 8); c.fill();
    for (const p of dots) { const y = cy - p.d / maxD * H * .8, x = cx + p.x / 20 * W * .4; c.fillStyle = '#8ea6ff'; c.beginPath(); c.arc(x, y, W * .018, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.font = `700 ${W * .035}px Rubik`; c.textAlign = 'left'; c.fillText(`${p.d}m · ${p.v} קמ״ש`, x + W * .03, y + W * .012); } }
  else { const gy = H * .85; c.beginPath(); c.moveTo(W * .05, gy); c.lineTo(W * .95, gy); c.stroke(); c.fillStyle = '#eef0f2'; c.beginPath(); c.roundRect(W * .05, gy - H * .08, W * .1, H * .08, 6); c.fill();
    if (smear > 0) { c.fillStyle = `rgba(142,166,255,${.25 * smear})`; c.fillRect(W * .15, gy - H * .5, W * .8, H * .5); }
    for (const p of dots) { const x = W * .15 + p.d / maxD * W * .8, hy = gy - p.h / 8 * H * .7, sy = gy - H * .25; const y = smear > 0 ? sy + (hy - sy) * stack : hy;
      c.fillStyle = '#8ea6ff'; c.beginPath(); c.arc(x, y, W * .014, 0, 7); c.fill(); } }
}

/** drawBreath(c, t, W, H, {mode, k, rate}) — echo line graph (ep030): 'baby' = small regular breathing waves (~40/min) · 'bag' = flat line · 'compare' = two rows (bag flat / baby waves) with labels.
 *  k 0..1 = how much of the line is drawn. Ruler callout 'פחות ממילימטר' with {ruler: 0..1}. */
export function drawBreath(c, t, W, H, {mode = 'baby', k = 1, rate = .7, ruler = 0} = {}) {
  c.clearRect(0, 0, W, H); c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.roundRect(0, 0, W, H, H * .1); c.fill();
  const row = (y0, amp, label, col) => { c.strokeStyle = 'rgba(27,34,48,.12)'; c.lineWidth = 2; c.beginPath(); c.moveTo(W * .06, y0); c.lineTo(W * .94, y0); c.stroke();
    c.strokeStyle = col; c.lineWidth = H * .03; c.beginPath(); const x1 = W * .06 + W * .88 * clamp(k);
    for (let x = W * .06; x <= x1; x += 2) { const ph = (x / W) * 6 - t * rate * 2; const yy = y0 - amp * Math.max(0, Math.sin(ph * Math.PI)) ** 1.5; x === W * .06 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke();
    if (label) { c.direction = 'rtl'; c.textAlign = 'right'; c.fillStyle = '#1b2230'; c.font = `700 ${H * .1}px Rubik`; c.fillText(label, W * .94, y0 - H * .2); } };
  if (mode === 'compare') { row(H * .45, 0, 'תיק', '#9aa3ad'); row(H * .88, H * .14, 'תינוק', '#4f6fe0'); }
  else row(H * .7, mode === 'bag' ? 0 : H * .3, null, mode === 'bag' ? '#9aa3ad' : '#4f6fe0');
  if (ruler > 0 && mode === 'baby') { c.globalAlpha = clamp(ruler); c.strokeStyle = '#1b2230'; c.lineWidth = 3; const x = W * .5; c.beginPath(); c.moveTo(x, H * .7); c.lineTo(x, H * .4); c.moveTo(x - 10, H * .7); c.lineTo(x + 10, H * .7); c.moveTo(x - 10, H * .4); c.lineTo(x + 10, H * .4); c.stroke();
    c.direction = 'rtl'; c.textAlign = 'center'; c.fillStyle = '#1b2230'; c.font = `700 ${H * .11}px Rubik`; c.fillText('פחות ממילימטר', W / 2, H * .28); c.globalAlpha = 1; }
}

/** breathe(baby, t, {rate=.7, amt=.06}) — people/mannequin-baby: 'chest' scales with breathing (rate in breaths/s; ~40/min = .67). Returns the 0..1 phase (sync the graph / the echo dot). */
export function breathe(baby, t, {rate = .7, amt = .06} = {}) { const ch = baby.getObjectByName('chest'); const ph = .5 + .5 * Math.sin(t * rate * Math.PI * 2);
  if (ch) { ch.userData.s0 ??= ch.scale.clone(); ch.scale.set(ch.userData.s0.x * (1 + amt * .4 * ph), ch.userData.s0.y, ch.userData.s0.z * (1 + amt * ph)); } return ph; }

/** seeThrough(obj, k, {min=.15}) — fade a soft object (the blanket) to see-through so the waves read through it (k 0 = solid, 1 = ghost). */
export function seeThrough(obj, k, {min = .15} = {}) { obj.traverse(o => { if (!o.isMesh) return; if (!o.userData.m0) { o.userData.m0 = o.material; o.material = o.material.clone(); o.material.transparent = true; }
  o.material.opacity = 1 - (1 - min) * clamp(k); o.material.depthWrite = k < .05; }); }
