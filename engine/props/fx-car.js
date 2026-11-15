// FX helpers for the robotaxi x-ray brake shot (Media pro 2026-11-15 run 8, ep016-robotaxi). Matte, no glow. Our own code → CC0.
// import {xray, brakePulse} from '/engine/props/fx-car.js';
// const car = (await st.prop('vehicles/robotaxiXray', {tint: 1, x, z})).object;
// const xr = xray(car); const bp = brakePulse(car);   in st.frame: xr.set(k 0..1), bp.set(k 0..1)
import * as THREE from 'three';
const ACC = 0x8ea6ff;
const ease = k => { k = Math.min(1, Math.max(0, k)); return k * k * (3 - 2 * k); };
const under = (o, name) => { for (let p = o; p; p = p.parent) if (p.name === name) return true; return false; };

/** x-ray: everything outside 'insides' fades to a matte indigo ghost (opacity → op), insides stay solid and appear (scale-in fade). set(k): 0 = normal car, 1 = full x-ray. */
// note: toggling .transparent needs material.needsUpdate (three's OPAQUE define)
export function xray(car, {op = .12, ghost = 0x3b3f8a} = {}) {
  const shell = [], ins = [];
  car.traverse(o => { if (!o.isMesh) return; o.material = o.material.clone(); o.userData.c0 = o.material.color.clone(); o.userData.o0 = o.material.opacity;
    (under(o, 'insides') ? ins : shell).push(o); });
  const g = new THREE.Color(ghost), insides = car.getObjectByName('insides');
  return { set(k) { k = ease(k);
    for (const o of shell) { const m = o.material; const tr = k > 0 || o.userData.o0 < 1; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.opacity = THREE.MathUtils.lerp(o.userData.o0, Math.min(o.userData.o0, op), k);
      m.depthWrite = k < .5; m.color.copy(o.userData.c0).lerp(g, k * .8); o.castShadow = k < .5; }
    insides.visible = k > .02;
    for (const o of ins) { const m = o.material; if (!m.transparent) { m.transparent = true; m.needsUpdate = true; } m.opacity = o.userData.o0 * Math.min(1, k * 1.6); m.depthWrite = k > .6; } } };
}

/** brake pulse along the real path: computer → cable → brake motor → 4 fluid lines → calipers squeeze → (pedal stays empty).
 * Electric signal (cable) = accent; brake fluid in the 4 lines = deeper blue 'fluid' (factcheck 2026-11-15: show fluid/pressure, not the same electric pulse).
 * set(k): 0...15 computer LEDs · .15...45 pulse along 'cable' · .45...55 motor spins + lights · .55...85 fluid fills line0..3 · .85..1 calipers squeeze.
 * Returns also .phase(k) names for captions/camera: 'computer'|'cable'|'motor'|'lines'|'squeeze'. */
export function brakePulse(car, {color = ACC, fluid = 0x4f6fe0} = {}) {
  const col = new THREE.Color(color), fcol = new THREE.Color(fluid), N = n => car.getObjectByName(n);
  const curveOf = tube => { const p = tube.userData.path, v = []; for (let i = 0; i < p.length; i += 3) v.push(new THREE.Vector3(p[i], p[i + 1], p[i + 2])); return new THREE.CatmullRomCurve3(v, false, 'centripetal'); };
  /** accent overlay tube (a bit thicker) on the same path, grown with drawRange */
  const fill = (tube, r, c = col) => { const curve = curveOf(tube);
    const o = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, r, 10, false), new THREE.MeshStandardMaterial({color: c, roughness: .45}));
    o.userData.curve = curve; o.position.copy(tube.position); o.quaternion.copy(tube.quaternion); tube.parent.add(o); o.geometry.setDrawRange(0, 0); return o; };
  const cable = N('cable'), cFill = fill(cable, .02), dot = new THREE.Mesh(new THREE.SphereGeometry(.035, 16, 12), new THREE.MeshStandardMaterial({color: 0xffffff, roughness: .4}));
  cable.parent.add(dot); const cCurve = cFill.userData.curve;
  const lines = [0, 1, 2, 3].map(i => fill(N('line' + i), .014, fcol));
  const leds = [0, 1, 2, 3, 4, 5].map(i => N('computerLed' + i)), motor = N('motorCan'), shaft = N('motorShaft'), fluidLv = N('fluidLevel');
  const pads = [0, 1, 2, 3].map(i => [N('padIn' + i), N('padOut' + i)]); pads.forEach(pp => pp.forEach(p => p.userData.x0 = p.position.x));
  const m0 = motor.material.color.clone(), cnt = g => g.index ? g.index.count : g.attributes.position.count;
  const seg = (k, a, b) => Math.min(1, Math.max(0, (k - a) / (b - a)));
  const api = {
    set(k) {
      leds.forEach((l, i) => { l.material.color.set(seg(k, i * .02, i * .02 + .03) > 0 ? 0xffffff : ACC); });
      const kc = seg(k, .15, .45); cFill.geometry.setDrawRange(0, Math.floor(cnt(cFill.geometry) * kc)); dot.visible = kc > 0 && kc < 1; if (dot.visible) dot.position.copy(cCurve.getPointAt(kc));
      const km = seg(k, .45, .55); motor.material.color.copy(m0).lerp(new THREE.Color(0xffffff), km > 0 && km < 1 ? .6 : 0); shaft.rotation.x = km * 40 + seg(k, .55, .85) * 20;
      fluidLv.scale.y = 1 - .25 * seg(k, .55, .85);
      const kl = ease(seg(k, .55, .85)); lines.forEach((l, i) => l.geometry.setDrawRange(0, Math.floor(cnt(l.geometry) * Math.min(1, kl * (i < 2 ? 1.25 : 1)))));
      const ks = ease(seg(k, .85, 1)); pads.forEach(pp => pp.forEach(p => { p.position.x = p.userData.x0 * (1 - .45 * ks); }));
    },
    phase: k => k < .15 ? 'computer' : k < .45 ? 'cable' : k < .55 ? 'motor' : k < .85 ? 'lines' : 'squeeze',
    /** world point on the pulse path for the camera to follow, k 0..1 */
    point(k) { const p = k < .45 ? cCurve.getPointAt(seg(k, .15, .45)) : lines[0].userData.curve.getPointAt(seg(k, .55, .85)); return cable.parent.localToWorld(p.clone()); }
  };
  api.set(0); return api;
}
