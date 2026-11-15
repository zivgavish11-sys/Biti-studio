// FX helpers for the safe home humanoid (Media pro 2026-11-15 run 9, ep017-safehome). Matte, no glow. Our own code → CC0.
// import {xray, motor, signal, cover, stopRing, effortGraph, forceGauge} from '/engine/props/fx-arm.js';
// const bot = (await st.prop('robots/humanoidSafe', {tint: 1, x, z})).object;
// const xr = xray(bot), el = motor(bot, 'ElbowR'), sg = signal(bot, 'ElbowR'), cv = cover(bot), ring = stopRing(bot, 'elbowR');
// const scr = st.screen([1.2, .7], effortGraph(() => ({k, spike})));   in st.frame: xr.set(k) · el.set(effort, angle) · sg.set(k, 'out'|'back') · cv.set(k) · ring.set(k) · scr.update(t)
import * as THREE from 'three';
const ACC = 0x8ea6ff, FORCE = 0x4f6fe0;
const ease = k => { k = Math.min(1, Math.max(0, k)); return k * k * (3 - 2 * k); };
const clamp = k => Math.min(1, Math.max(0, k));
const isIn = o => { for (let p = o; p; p = p.parent) if (p.userData && p.userData.ins) return true; return false; };
const isCover = o => !!(o.userData && o.userData.cover);
const prep = o => { if (!o.userData.c0) { o.material = o.material.clone(); o.userData.c0 = o.material.color.clone(); o.userData.o0 = o.material.opacity; } };

/** x-ray: body shell → matte indigo ghost (opacity op); insides (motors, wires, brain, battery) stay solid. Soft cover is hidden while k > .5. set(k) 0..1 */
export function xray(bot, {op = .2, ghost = 0x8a90dc} = {}) {
  const shell = [], ins = []; const g = new THREE.Color(ghost);
  bot.traverse(o => { if (!o.isMesh || isCover(o)) return; prep(o); (isIn(o) ? ins : shell).push(o); });
  const api = { set(k) { k = ease(k);
    for (const o of shell) { const m = o.material, tr = k > 0 || o.userData.o0 < 1; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; }
      m.opacity = THREE.MathUtils.lerp(o.userData.o0, Math.min(o.userData.o0, op), k); m.depthWrite = k < .5; m.color.copy(o.userData.c0).lerp(g, k * .8); o.castShadow = k < .5; }
    for (const o of ins) { const m = o.material; if (!m.transparent) { m.transparent = true; m.needsUpdate = true; } m.opacity = Math.min(1, k * 1.6); m.depthWrite = k > .6; o.visible = k > .02; } } };
  api.set(0); return api;
}

/** one joint motor: set(effort 0..1, spin) — the can turns deeper blue (force) with effort, spin = rotor angle (pass a growing number to spin). Names: Shoulder|Elbow|Wrist + L|R */
export function motor(bot, id, {color = FORCE} = {}) {
  const can = bot.getObjectByName('can' + id), rotor = bot.getObjectByName('rotor' + id), c0 = can.material.color.clone(), c = new THREE.Color(color);
  return { set(effort = 0, spin = 0) { can.material.color.copy(c0).lerp(c, clamp(effort)); rotor.rotation.x = spin; }, can, rotor };
}

/** light-blue signal along the wire brain → motor (follows the arm as it bends). set(k 0..1, dir 'out' (brain → motor) | 'back' (motor → brain)).
 *  A white dot runs along, the wire fills accent behind it; .point(k) = world point for the camera/callout. */
export function signal(bot, id, {color = ACC, keep = true} = {}) {
  const segs = []; bot.traverse(o => { if (o.isMesh && o.userData.chain === id) segs.push(o); }); segs.sort((a, b) => a.userData.seg - b.userData.seg);
  const curves = segs.map(s => { const p = s.userData.path, v = []; for (let i = 0; i < p.length; i += 3) v.push(new THREE.Vector3(p[i], p[i + 1], p[i + 2])); return new THREE.CatmullRomCurve3(v, false, 'centripetal'); });
  const fills = segs.map((s, i) => { const o = new THREE.Mesh(new THREE.TubeGeometry(curves[i], 48, .0075, 8, false), new THREE.MeshStandardMaterial({color, roughness: .45}));
    o.userData.ins = 1; s.parent.add(o); o.geometry.setDrawRange(0, 0); return o; });
  const dot = new THREE.Mesh(new THREE.SphereGeometry(.014, 14, 10), new THREE.MeshStandardMaterial({color: 0xffffff, roughness: .4})); dot.userData.ins = 1; dot.visible = false;
  const lens = curves.map(c => c.getLength()), tot = lens.reduce((a, b) => a + b, 0), cnt = g => g.index ? g.index.count : g.attributes.position.count;
  const at = u => { let d = u * tot; for (let i = 0; i < curves.length; i++) { if (d <= lens[i] || i === curves.length - 1) return [i, clamp(d / lens[i])]; d -= lens[i]; } };
  const api = {
    set(k, dir = 'out') { k = clamp(k); const u = dir === 'out' ? k : 1 - k;
      fills.forEach((f, i) => { const a = lens.slice(0, i).reduce((x, y) => x + y, 0) / tot, b = a + lens[i] / tot;
        let fk = dir === 'out' ? clamp((u - a) / (b - a)) : clamp((b - u) / (b - a)); if (!keep && k >= 1) fk = 0;
        if (dir === 'out') f.geometry.setDrawRange(0, Math.floor(cnt(f.geometry) * fk)); else { const n = cnt(f.geometry), s = Math.floor(n * (1 - fk)); f.geometry.setDrawRange(s - s % 3, n - s + s % 3); } });
      dot.visible = k > 0 && k < 1; if (dot.visible) { const [i, t] = at(u); segs[i].parent.add(dot); dot.position.copy(curves[i].getPointAt(t)); } },
    point(k, dir = 'out') { const [i, t] = at(dir === 'out' ? k : 1 - k); return segs[i].parent.localToWorld(curves[i].getPointAt(t).clone()); },
    reset() { fills.forEach(f => f.geometry.setDrawRange(0, 0)); dot.visible = false; } };
  return api;
}

/** brain LEDs: set(k) 0 = idle accent, 1 = all white (thinking) */
export function brain(bot) { const leds = [0, 1, 2, 3, 4].map(i => bot.getObjectByName('brainLed' + i));
  return { set(k) { leds.forEach((l, i) => l.material.color.set(k > i / 5 ? 0xffffff : ACC)); } }; }

/** soft knit cover (sleeves, cuffs, hand pads, chest pad): set(k) 0 = off, 1 = on (fades in and settles from a slightly bigger size). */
export function cover(bot) {
  const parts = []; bot.traverse(o => { if (o.isMesh && isCover(o)) { prep(o); o.material.transparent = true; o.userData.s0 = o.scale.clone(); parts.push(o); } });
  const api = { set(k) { const e = ease(k); for (const o of parts) { o.visible = k > .01; o.material.opacity = e; o.material.depthWrite = e > .9; o.scale.copy(o.userData.s0).multiplyScalar(1 + .25 * (1 - e)); } } };
  api.set(0); return api;
}

/** matte 'stop' ring around a joint (elbowR, wristR ...): set(k) grows + fades in; ring faces the camera axis you pass (default: joint x axis). */
export function stopRing(bot, joint, {r = .11, color = ACC} = {}) {
  const j = bot.getObjectByName(joint), ring = new THREE.Mesh(new THREE.TorusGeometry(r, .006, 8, 48), new THREE.MeshStandardMaterial({color, roughness: .5, transparent: true}));
  ring.userData.ins = 1; ring.rotation.y = Math.PI / 2; j.add(ring);
  const api = { set(k) { const e = ease(k); ring.visible = k > .01; ring.scale.setScalar(.6 + .4 * e); ring.material.opacity = e; }, ring }; api.set(0); return api;
}

/** draw fn for st.screen: effort graph. get(t) → {k: 0..1 how much of the line is drawn, spike: 0..1 contact bump, stop: 0..1 line drops back after the stop}.
 *  Calm dashed line 'כוח צפוי' + live accent line that follows it, then jumps above it at the contact (deeper blue fill under the jump). */
export function effortGraph(get, {title = 'כוח במנוע', expected = 'כוח צפוי', live = 'כוח בפועל'} = {}) {
  return (c, t, W, H) => {
    const s = get(t), k = clamp(s.k ?? 1), sp = clamp(s.spike ?? 0), stop = clamp(s.stop ?? 0);
    c.fillStyle = '#14163a'; c.fillRect(0, 0, W, H);
    const L = W * .08, R = W * .94, T = H * .28, B = H * .84, base = B - (B - T) * .35, peakX = L + (R - L) * .62;
    c.fillStyle = '#ffffff'; c.font = `700 ${H * .1}px Rubik`; c.fillText(title, R, H * .15);
    c.strokeStyle = '#2c2f6e'; c.lineWidth = 2; for (let i = 0; i <= 4; i++) { const y = T + (B - T) * i / 4; c.beginPath(); c.moveTo(L, y); c.lineTo(R, y); c.stroke(); }
    const yExp = x => base - Math.sin((x - L) / (R - L) * Math.PI * 2) * (B - T) * .06;
    c.setLineDash([16, 12]); c.strokeStyle = '#9aa0d8'; c.lineWidth = 5; c.beginPath(); for (let x = L; x <= R; x += 4) x === L ? c.moveTo(x, yExp(x)) : c.lineTo(x, yExp(x)); c.stroke(); c.setLineDash([]);
    const bump = x => { const d = (x - peakX) / ((R - L) * .07); return Math.exp(-d * d) * (B - T) * .55 * sp * (x > peakX ? 1 - stop : 1); };
    const yLive = x => yExp(x) + Math.sin(x * .05) * 2 - bump(x);
    const xEnd = L + (R - L) * k;
    c.fillStyle = 'rgba(79,111,224,.45)'; c.beginPath(); c.moveTo(L, yExp(L)); for (let x = L; x <= xEnd; x += 3) c.lineTo(x, yLive(x)); for (let x = xEnd; x >= L; x -= 3) c.lineTo(x, yExp(x)); c.closePath(); c.fill();
    c.strokeStyle = '#8ea6ff'; c.lineWidth = 8; c.lineJoin = 'round'; c.beginPath(); for (let x = L; x <= xEnd; x += 3) x === L ? c.moveTo(x, yLive(x)) : c.lineTo(x, yLive(x)); c.stroke();
    if (k > 0 && k < 1) { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(xEnd, yLive(xEnd), 11, 0, Math.PI * 2); c.fill(); }
    c.font = `700 ${H * .075}px Rubik`; c.fillStyle = '#9aa0d8'; c.fillText(expected, R, B + H * .12);
    c.fillStyle = '#8ea6ff'; c.fillText(live, R - c.measureText(expected).width - W * .06, B + H * .12);
  };
}

/** draw fn for st.screen: small force gauge (shot 10 'the force stays small'). get(t) → {v: 0..1 needle, limit: 0..1 where the limit mark sits}. */
export function forceGauge(get, {title = 'כוח', low = 'קטן', high = 'גדול'} = {}) {
  return (c, t, W, H) => {
    const s = get(t), v = clamp(s.v ?? 0), lim = clamp(s.limit ?? .35); c.fillStyle = '#14163a'; c.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H * .78, r = Math.min(W * .4, H * .6), a = p => Math.PI + p * Math.PI;
    c.lineCap = 'round'; c.lineWidth = r * .14; c.strokeStyle = '#2c2f6e'; c.beginPath(); c.arc(cx, cy, r, Math.PI, 2 * Math.PI); c.stroke();
    c.strokeStyle = '#8ea6ff'; c.beginPath(); c.arc(cx, cy, r, Math.PI, a(lim)); c.stroke();
    c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a(v)) * r * .85, cy + Math.sin(a(v)) * r * .85); c.stroke();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(cx, cy, 14, 0, Math.PI * 2); c.fill();
    c.font = `700 ${H * .12}px Rubik`; c.textAlign = 'center'; c.fillText(title, cx, H * .2);
    c.font = `700 ${H * .08}px Rubik`; c.fillStyle = '#9aa0d8'; c.fillText(low, cx - r, cy + H * .14); c.fillText(high, cx + r, cy + H * .14);
  };
}
