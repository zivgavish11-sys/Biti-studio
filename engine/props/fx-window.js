// FX for the window-robot kit (Media pro 2026-11-25 run 16, ep025-windowbot). Matte, no glow. Our own code → CC0.
// import {spinBot, airField, fanStream, pressureArrows, sealPress, sensorLight, leakPuff, cables, flicker} from '/engine/props/fx-window.js';
//   const room = await M('buildings/tlvWindowRoom'); const bot = await M('robots/windowBotPro'); bot.position.copy(W3(room.getObjectByName('robotSpot')));
//   const air = airField(bot); const fs = fanStream(bot); const ar = pressureArrows(bot); const cb = cables(scene, room, bot);
//   in st.frame: spinBot(bot, t, {fan: 1, pads: 1}); air.update(t, {k, push, leak}); fs.update(t, k); ar.set(t, k); sealPress(bot, k); sensorLight(bot, k); cb.update({unplug: k})
// Particles = air (deep blue #4f6fe0 = force/air); the robot frame: back on the glass at local z 0, outside = +z.
import * as THREE from 'three';
const FORCE = 0x4f6fe0, ACC = 0x8ea6ff;
const ease = k => { k = Math.min(1, Math.max(0, k)); return k * k * (3 - 2 * k); };
const W3 = o => o.getWorldPosition(new THREE.Vector3());
const rng = seed => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
const mat = (c, extra = {}) => { const m = new THREE.MeshStandardMaterial({color: c, roughness: .5, ...extra}); m.userData.real = true; return m; };

/** fan + pads spin. fan/pads = speed factors (0 = stopped, e.g. the 'עצירה' moment). */
export function spinBot(bot, t, {fan = 1, pads = 1} = {}) { const F = bot.getObjectByName('fan'), L = bot.getObjectByName('padL'), R = bot.getObjectByName('padR');
  F.userData.a = (F.userData.a ?? 0); F.userData.t = F.userData.t ?? t; const dt = Math.max(0, t - F.userData.t); F.userData.t = t; F.userData.a += dt * 60 * fan; F.rotation.z = F.userData.a;
  L.userData.a = (L.userData.a ?? 0) + dt * 4 * pads; L.rotation.z = L.userData.a; R.rotation.z = -L.userData.a; }

/** the air around the robot as many tiny particles (re-hook 'air becomes visible'). Outside: dense, jiggling, push → drift toward the glass; under the robot (thin 'cavity', drawn 3× thicker so it reads): sparse.
 * update(t, {k: 0..1 visible, push: 0..1 drift toward the glass, leak: 0..1 cavity fills from 'cornerLeak'}). */
export function airField(bot, {n = 1400, nc = 14, r = .0045, box = [.5, .5, .4]} = {}) {
  const g = new THREE.SphereGeometry(r, 8, 6), m = mat(FORCE, {transparent: true, opacity: 0}), im = new THREE.InstancedMesh(g, m, n + nc + 60); im.frustumCulled = false; im.castShadow = false; bot.add(im);
  const rr = rng(17), P = [];
  while (P.length < n) { const x = (rr() - .5) * 2 * box[0], y = (rr() - .5) * 2 * box[1], z = .004 + rr() * box[2]; if (Math.abs(x) < .16 && Math.abs(y) < .16 && z < .1) continue; P.push([x, y, z, rr() * 6.28, .5 + rr()]); }
  const C = [...Array(nc)].map(() => [(rr() - .5) * .22, (rr() - .5) * .22, .0015 + rr() * .006, rr() * 6.28, 1]);   // cavity (sparse)
  const L = [...Array(60)].map(() => [(rr() - .5) * .22, (rr() - .5) * .22, .0015 + rr() * .006, rr() * 6.28, 1]);  // leak fill
  const corner = bot.getObjectByName('cornerLeak').position, M4 = new THREE.Matrix4(), S = new THREE.Vector3();
  return { mesh: im, update(t, {k = 1, push = 0, leak = 0} = {}) { m.opacity = ease(k); im.visible = k > .01; let i = 0;
    for (const [x, y, z, ph, sp] of P) { const j = .012 * Math.sin(t * 3 * sp + ph), dz = push * ((t * .25 * sp + ph / 6.28) % 1) * .3; let zz = z - dz; if (zz < .004) zz += box[2]; if (Math.abs(x) < .16 && Math.abs(y) < .16 && zz < .1) zz = .1 + (z % .05);
      M4.makeTranslation(x + j, y + .012 * Math.cos(t * 2.6 * sp + ph), zz); im.setMatrixAt(i++, M4); }
    for (const [x, y, z, ph] of C) { M4.makeTranslation(x + .004 * Math.sin(t * 3 + ph), y, z); im.setMatrixAt(i++, M4); }
    const kl = ease(leak); L.forEach(([x, y, z, ph], q) => { const f = Math.min(1, Math.max(0, kl * 1.4 - q / 60 * .4)); const px = corner.x + (x - corner.x) * f, py = corner.y + (y - corner.y) * f;
      M4.makeTranslation(px, py, f > 0 ? z : -1); if (f <= 0) M4.scale(S.set(0, 0, 0)); im.setMatrixAt(i++, M4); });
    im.instanceMatrix.needsUpdate = true; } };
}

/** air blown out by the fan through the top vent ('airOut'), streaming away from the glass and up; update(t, k 0..1). */
export function fanStream(bot, {n = 220, r = .006} = {}) {
  const im = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 8, 6), mat(FORCE, {transparent: true, opacity: 0}), n); im.frustumCulled = false; im.castShadow = false; bot.add(im);
  const o = bot.getObjectByName('airOut').position, rr = rng(29), P = [...Array(n)].map(() => [rr(), (rr() - .5) * .1, rr() * 6.28]), M4 = new THREE.Matrix4();
  return { update(t, k = 1) { im.material.opacity = ease(k); im.visible = k > .01;
    P.forEach(([u0, sx, ph], i) => { const u = (u0 + t * .6) % 1, d = u * .45; M4.makeTranslation(o.x + sx * (1 + 3 * u) + .01 * Math.sin(t * 5 + ph), o.y + d * .55, o.z + d * .8); im.setMatrixAt(i, M4); }); im.instanceMatrix.needsUpdate = true; } };
}

/** outside air pushing the robot onto the glass: arrows (deep blue) around and on top of the robot, pointing at the glass (−z). set(t, k 0..1). */
export function pressureArrows(bot, {n = 12} = {}) {
  const g = new THREE.Group(); bot.add(g); const m = mat(FORCE, {transparent: true, opacity: 0}), arr = [];
  const mk = () => { const a = new THREE.Group(); const s = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .08, 10), m); s.rotation.x = Math.PI / 2; s.position.z = .06; const h = new THREE.Mesh(new THREE.ConeGeometry(.016, .035, 14), m); h.rotation.x = -Math.PI / 2; h.position.z = .0175; a.add(s, h); g.add(a); return a; };
  for (let i = 0; i < n; i++) { const a = mk(), u = i / n * Math.PI * 2, top = i % 3 === 0; a.position.set(top ? Math.cos(u) * .07 : Math.cos(u) * .22, top ? Math.sin(u) * .07 : Math.sin(u) * .22, top ? .1 : .01); a.userData.p0 = a.position.clone(); arr.push(a); }
  return { group: g, set(t, k = 1) { m.opacity = ease(k); g.visible = k > .01; arr.forEach((a, i) => { a.position.z = a.userData.p0.z + .03 * (1 - ease(k)) + .008 * Math.sin(t * 4 + i); }); } };
}
/** seal pressed on the glass: light-blue mark on the rubber rim (k 0..1). */
export function sealPress(bot, k) { const s = bot.getObjectByName('sealMark'); s.visible = k > .02; s.scale.setScalar(1 + .02 * (1 - ease(k))); s.material.transparent = true; s.material.opacity = ease(k); }
/** pressure-sensor chip lights (lighter light blue) k 0..1; status LED follows. */
export function sensorLight(bot, k) { const c = bot.getObjectByName('sensorChip'); if (!c.userData.m) { c.material = c.material.clone(); c.userData.m = 1; } c.material.color.set(ACC).lerp(new THREE.Color(0xeef2ff), .6 * ease(k)); c.scale.setScalar(1 + .4 * ease(k)); }
/** room lamp flicker helper for the power cut: returns an intensity factor 0..1 (k 0..1 = moment of the cut). */
export const flicker = (t, k) => k <= 0 ? 1 : k >= 1 ? 1 : .35 + .65 * (Math.sin(t * 61) > .2 ? 1 : 0) * (1 - Math.sin(k * Math.PI) * .8);

/** power cable + safety rope from the robot's 'cableIn' through the open pane ('openingSpot') to the wall socket plug and the 'anchor'. Rebuilt each update (the robot may move).
 * update({unplug 0..1}) — plug pulls out of the socket and drops; power cable goes slack. Returns {power, rope, ropeCurve, powerCurve, point(k)} — point(k) = along the rope (camera follow, shot 10). */
export function cables(scene, room, bot, {power = 0xf1f1ef, rope = 0x2f3338, ropeAccent = false} = {}) {
  const pm = mat(power), rm = mat(ropeAccent ? ACC : rope), plug = room.getObjectByName('plug'), z0 = plug.position.z;
  const P = new THREE.Mesh(new THREE.BufferGeometry(), pm), Rp = new THREE.Mesh(new THREE.BufferGeometry(), rm); P.castShadow = Rp.castShadow = true; scene.add(P, Rp);
  const api = { power: P, rope: Rp, ropeCurve: null, powerCurve: null, update({unplug = 0} = {}) { const u = ease(unplug);
      plug.position.z = z0 - .14 * u; plug.position.y = -.25 * u * u; scene.updateMatrixWorld(true);
      const a = W3(bot.getObjectByName('cableIn')), o = W3(room.getObjectByName('openingSpot')), pOut = W3(room.getObjectByName('plugOut')), an = W3(room.getObjectByName('anchorRing'));
      const v = (x, y, z) => new THREE.Vector3(x, y, z);
      const pc = new THREE.CatmullRomCurve3([a, v(a.x, a.y + .12, a.z + .06), v(o.x - .1, o.y + .25, o.z + .1), v(o.x, o.y - .05, o.z), v(o.x + .05, o.y - .25, o.z - .25), v(pOut.x - .1, .02 + .05 * (1 - u), pOut.z - .3), v(pOut.x, pOut.y - .02, pOut.z - .03), pOut], false, 'centripetal');
      const rc = new THREE.CatmullRomCurve3([a.clone().add(v(.02, 0, 0)), v(a.x + .03, a.y + .14, a.z + .07), v(o.x - .08, o.y + .27, o.z + .1), v(o.x + .03, o.y - .02, o.z + .01), v(o.x + .1, o.y - .3, o.z - .2), v(an.x, an.y + .05, an.z - .08), an], false, 'centripetal');
      P.geometry.dispose(); P.geometry = new THREE.TubeGeometry(pc, 120, .0045, 8); Rp.geometry.dispose(); Rp.geometry = new THREE.TubeGeometry(rc, 120, .0035, 8); api.ropeCurve = rc; api.powerCurve = pc; },
    point: k => api.ropeCurve.getPointAt(Math.min(1, Math.max(0, k))) };
  api.update(); return api;
}
