// FX for the car cabin + night highway kit (Media pro 2026-11-25 run 16, ep024-drowsy). Matte, no glow. Our own code → CC0.
// import {highway, driverRig, columnXray, wirePulse, cabinLight, steerGraph} from '/engine/props/fx-cabin.js';
//   const car = await M('car/cabinCar'); const road = await M('road/nightHighway'); const drv = await M('people/mannequin-driver');
//   drv.position.copy(W3(car.getObjectByName('driverSpot')));   (car at the origin, facing +z)
//   const hw = highway(scene, road, {car}); const rig = driverRig(drv, car); const xr = columnXray(car); const wp = wirePulse(car); const cab = cabinLight(scene, car);
//   in st.frame:  hw.update(t, {speed: 25, laneX})  · rig.update({steer, nod, slump})  · xr.set(k) · wp.set(k) · cab.set(k)
import * as THREE from 'three';
const ACC = 0x8ea6ff, FORCE = 0x4f6fe0;
const ease = k => { k = Math.min(1, Math.max(0, k)); return k * k * (3 - 2 * k); };
const W3 = o => o.getWorldPosition(new THREE.Vector3());

/** endless night drive: scrolls the road's 'scroll' group (period 40 m = pole spacing) under a car that stays at z 0, adds real streetlight spots on the poles,
 * oncoming cars (white lamps) on the other side and a few tail lights ahead. update(t, {speed m/s (default 25 ≈ 90 km/h), dist (override), laneX: car x (drift)}). */
export function highway(scene, road, {car = null, lights = 6, speed = 25, oncoming = 5, ahead = 2} = {}) {
  const sc = road.getObjectByName('scroll'), mk = (c, i) => { const m = new THREE.MeshStandardMaterial({color: c, emissive: c, emissiveIntensity: i, roughness: .5}); m.userData.real = true; return m; };
  // lights: SpotLights fixed to the poles (children of scroll, so they ride with it); one in the middle casts shadows (the car's shadow under the lamp)
  const spots = []; for (let i = 0; i < 6 && spots.length < lights; i++) { const s = road.getObjectByName('lampSpot' + i); if (!s) continue;
    const L = new THREE.SpotLight(0xffe4bc, 900, 46, 1.05, .65, 1.6); L.position.set(0, 0, 0); L.userData.keep = true; s.add(L); const tg = new THREE.Object3D(); tg.position.set(-2, -12, 0); s.add(tg); L.target = tg;
    if (i === 3) { L.castShadow = true; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -.0004; } spots.push(L); }
  // oncoming cars (pairs of white headlamps + body) and cars ahead (red tails)
  const carG = new THREE.BoxGeometry(1.75, .9, 4.2), bodyM = new THREE.MeshStandardMaterial({color: 0x15171b, roughness: .5, metalness: .3}); bodyM.userData.real = true;
  const lampG = new THREE.BoxGeometry(.3, .1, .05), wM = mk(0xf4f2ea, 2.2), rM = mk(0xb0141b, 1.8);
  const mkCar = (front) => { const g = new THREE.Group(); const b = new THREE.Mesh(carG, bodyM); b.position.y = .75; g.add(b); for (const s of [-1, 1]) { const l = new THREE.Mesh(lampG, front ? wM : rM); l.position.set(s * .6, .72, front ? 2.11 : -2.11); g.add(l); } scene.add(g); return g; };
  const opp = [...Array(oncoming)].map((_, i) => ({o: mkCar(true), x: 11.3 + (i % 2) * 3.7, z0: 60 + i * 47, v: 26 + (i % 3) * 3}));
  opp.forEach(c => c.o.rotation.y = Math.PI);
  const fwd = [...Array(ahead)].map((_, i) => ({o: mkCar(false), x: i ? 3.6 : -3.6, z0: 70 + i * 55, v: -2 - i * 1.5}));
  return { spots, opp, fwd,
    update(t, {speed: v = speed, dist = null, laneX = 0} = {}) { const d = dist ?? t * v; sc.position.z = -(d % 40); sc.position.x = -laneX;
      for (const c of opp) { let z = (c.z0 - (c.v + v) * t) % 400; if (z < -120) z += 400; c.o.position.set(c.x - laneX, 0, z); }
      for (const c of fwd) { let z = c.z0 + c.v * t; c.o.position.set(c.x - laneX, 0, z); } } };
}

/** the seated driver: arms solved onto the wheel grips every frame (2-bone IK), head nod, slump, wheel steer.
 * update({steer (rad, + = left), nod 0..1 (head drops), slump 0..1 (torso sinks a little), drowsy 0..1 (= nod + slump together)}) */
export function driverRig(drv, car) {
  const N = n => drv.getObjectByName(n), sw = car.getObjectByName('steeringWheel'), head = N('head'), torso = N('torso'), h0 = head.rotation.x, t0 = torso.rotation.x;
  const UA = .3, FA = .33, down = new THREE.Vector3(0, -1, 0), q = new THREE.Quaternion();
  const arm = k => ({sh: N('shoulder' + k), el: N('elbow' + k), grip: car.getObjectByName('grip' + k), side: k === 'L' ? 1 : -1});
  const arms = [arm('L'), arm('R')];
  const aim = (j, worldDir) => { j.parent.getWorldQuaternion(q); const v = worldDir.clone().applyQuaternion(q.invert()).normalize(); j.quaternion.setFromUnitVectors(down, v); j.updateMatrixWorld(true); };
  const api = { update({steer = 0, nod = 0, slump = 0, drowsy = null} = {}) {
    if (drowsy != null) { nod = drowsy; slump = drowsy * .6; }
    sw.rotation.z = steer; head.rotation.x = h0 + .55 * ease(nod); torso.rotation.x = t0 + .1 * ease(slump);
    car.updateMatrixWorld(true); drv.updateMatrixWorld(true);
    for (const a of arms) { const S = W3(a.sh), T = W3(a.grip); const D = T.clone().sub(S); let d = D.length(); const u = D.clone().normalize(); d = Math.min(d, UA + FA - .01);
      const ca = (UA * UA + d * d - FA * FA) / (2 * UA * d), sa = Math.sqrt(Math.max(0, 1 - ca * ca));
      const pole = new THREE.Vector3(a.side * .7, -1, -.2).applyQuaternion(car.getWorldQuaternion(new THREE.Quaternion())); const w = pole.sub(u.clone().multiplyScalar(pole.dot(u))).normalize();
      const E = S.clone().addScaledVector(u, UA * ca).addScaledVector(w, UA * sa);
      aim(a.sh, E.clone().sub(S)); aim(a.el, T.clone().sub(E)); } } };
  api.update(); return api;
}

/** x-ray of the steering column: 'shell' (shroud) fades to a ghost, the shaft + light-blue angle sensor stay solid; set(k 0..1). lit(k) makes the sensor ring brighter (no glow: lighter colour). */
export function columnXray(car, {op = .1, light = .6} = {}) {
  const xl = new THREE.PointLight(0xdfe6ff, 0, 1.2, 2); xl.userData.keep = true; car.getObjectByName('sensorSpot').add(xl); xl.position.set(-.15, .12, -.25);   // soft 'x-ray' fill so the insides read in the dark cabin (no glow)
  const sh = []; car.getObjectByName('shell').traverse(o => { if (o.isMesh) { o.material = o.material.clone(); sh.push(o); } });
  const ring = car.getObjectByName('angleSensor'), chip = car.getObjectByName('sensorChip'); ring.material = ring.material.clone(); const c0 = ring.material.color.clone(), white = new THREE.Color(0xe6ecff);
  return { set(k, lit = k) { k = ease(k); for (const o of sh) { const m = o.material, tr = k > 0; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.opacity = 1 - (1 - op) * k; m.depthWrite = k < .5; o.castShadow = k < .5; }
    ring.material.color.copy(c0).lerp(white, .5 * ease(lit)); xl.intensity = light * k; ring.scale.setScalar(1 + .25 * ease(lit)); chip.visible = true; } };
}

/** pulse along the sensor → computer wire: light-blue fill grows along 'wire' + a white bead; set(k 0..1); at k = 1 the 'ecuLed' turns white. point(k) = world pos (camera follow). */
export function wirePulse(car, {color = ACC} = {}) {
  const wire = car.getObjectByName('wire'), p = wire.userData.path, v = []; for (let i = 0; i < p.length; i += 3) v.push(new THREE.Vector3(p[i], p[i + 1], p[i + 2]));
  const curve = new THREE.CatmullRomCurve3(v, false, 'centripetal'), fill = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, .0075, 10, false), new THREE.MeshStandardMaterial({color, roughness: .45}));
  fill.position.copy(wire.position); wire.parent.add(fill); const cnt = fill.geometry.index.count; fill.geometry.setDrawRange(0, 0);
  const bead = new THREE.Mesh(new THREE.SphereGeometry(.014, 16, 12), new THREE.MeshStandardMaterial({color: 0xffffff, roughness: .4})); wire.parent.add(bead);
  const led = car.getObjectByName('ecuLed'); led.material = led.material.clone();
  return { curve, set(k) { k = Math.min(1, Math.max(0, k)); fill.geometry.setDrawRange(0, Math.floor(cnt * k / 3) * 3); bead.visible = k > 0 && k < 1; if (bead.visible) bead.position.copy(curve.getPointAt(k)); led.material.color.set(k >= 1 ? 0xffffff : color); },
    point: k => wire.parent.localToWorld(curve.getPointAt(Math.min(1, Math.max(0, k))).clone()) };
}

/** cabin light: a soft dashboard/ambient glow-free fill inside the car (warm-neutral point light under the roof + cool cluster spill). set(k): 1 = normal, 0 = dimmed (re-hook visual shift). */
export function cabinLight(scene, car, {power = 1.2} = {}) {
  const dome = new THREE.PointLight(0xffe7cc, power, 2.6, 2); dome.userData.keep = true; dome.position.copy(car.getObjectByName('domeLight').getWorldPosition(new THREE.Vector3())).add(new THREE.Vector3(0, -.12, 0)); scene.add(dome);
  const dashL = new THREE.PointLight(0x9fb2ff, power * .5, 1.6, 2); dashL.userData.keep = true; dashL.position.set(.37, 1.0, .3).applyMatrix4(car.matrixWorld); scene.add(dashL);
  return { dome, dashL, set(k) { dome.intensity = power * k; dashL.intensity = power * .5 * (.35 + .65 * k); } };
}

/** steering-angle graph for an st.screen (floating screen or 'centerScreen'): draw(c, t, W, H, s) with s = {k: 0..1 how much is drawn, mode: 'awake'|'band'|'drowsy'|'compare', spike: 0..1, ring: 0..1}.
 * awake = small smooth wiggles · band = the wiggles squeezed into a light-blue band 'ככה אתם נוהגים ערניים' · drowsy = almost flat + a deep-blue spike (the jerk) · compare = band + drowsy line, mismatch circled.
 * Usage: const sg = st.screen([.9, .5], (c, t, W, H) => steerGraph(c, t, W, H, state)); in frame: state.k = ...; sg.update(t) */
export function steerGraph(c, t, W, H, {k = 1, mode = 'awake', spike = 0, ring = 0, label = 'ככה אתם נוהגים ערניים'} = {}) {
  c.save(); c.direction = 'ltr'; c.fillStyle = '#0c1018'; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(142,166,255,.14)'; c.lineWidth = Math.max(1, H * .004); for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(0, H * i / 4); c.lineTo(W, H * i / 4); c.stroke(); }
  const mid = H * .55, x0 = W * .06, x1 = W * .94, awakeY = x => mid + H * .09 * (Math.sin(x * 31) * .6 + Math.sin(x * 73 + 1) * .3 + Math.sin(x * 151 + 2) * .15);
  const drowsyY = x => { const flat = mid + H * .012 * Math.sin(x * 40); const sx = .78, s = Math.exp(-(((x - sx) / .018) ** 2)); return flat - H * .3 * s * spike; };
  const line = (f, col, lw, kk) => { c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = c.lineCap = 'round'; c.beginPath(); const n = 240; for (let i = 0; i <= n * kk; i++) { const x = i / n, X = x0 + (x1 - x0) * x; i ? c.lineTo(X, f(x)) : c.moveTo(X, f(x)); } c.stroke(); };
  if (mode === 'band' || mode === 'compare') { const b = mode === 'band' ? k : 1; c.fillStyle = 'rgba(142,166,255,.22)'; c.fillRect(x0, mid - H * .12, (x1 - x0) * b, H * .24);
    c.direction = 'rtl'; c.textAlign = 'right'; c.fillStyle = '#c9d4ff'; c.font = `700 ${Math.round(H * .085)}px Rubik`; c.fillText(label, x1, H * .2); c.direction = 'ltr'; }
  if (mode === 'awake') line(awakeY, '#8ea6ff', H * .018, k);
  if (mode === 'band') line(x => mid + (awakeY(x) - mid) * (1 - .6 * k), 'rgba(142,166,255,.7)', H * .012, 1);
  if (mode === 'drowsy' || mode === 'compare') line(drowsyY, '#4f6fe0', H * .02, mode === 'drowsy' ? k : 1);
  if (ring > 0) { c.strokeStyle = '#f0502a'; c.lineWidth = H * .014; c.beginPath(); c.arc(x0 + (x1 - x0) * .78, mid - H * .1, H * .22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease(ring)); c.stroke(); }
  c.restore();
}

/** coffee-cup alert for the 'cluster' screen: draw(c, t, W, H, {k}) — dark cluster with speed + a calm amber card 'הגיע הזמן להפסקה?' and a cup icon (k 0..1 = card in). */
export function clusterAlert(c, t, W, H, {k = 0, speed = 90} = {}) {
  c.save(); c.fillStyle = '#05070a'; c.fillRect(0, 0, W, H);
  c.direction = 'ltr'; c.textAlign = 'center'; c.fillStyle = '#e8ecf5'; c.font = `700 ${Math.round(H * .34)}px Rubik`; c.fillText(String(speed), W * .2, H * .58); c.font = `400 ${Math.round(H * .11)}px Rubik`; c.fillStyle = '#8b93a6'; c.fillText('קמ"ש', W * .2, H * .78);
  c.strokeStyle = 'rgba(142,166,255,.5)'; c.lineWidth = H * .02; c.beginPath(); c.arc(W * .2, H * .55, H * .4, Math.PI * .8, Math.PI * 2.2); c.stroke();
  const a = ease(k); if (a > 0) { c.globalAlpha = a; const x = W * .42, y = H * .14, w = W * .54, h = H * .72; c.fillStyle = '#1b1f2a'; c.beginPath(); c.roundRect(x, y, w, h, H * .08); c.fill(); c.strokeStyle = '#e0a23a'; c.lineWidth = H * .015; c.stroke();
    // cup icon
    const cx = x + w * .17, cy = y + h * .52, s = h * .28; c.strokeStyle = '#e0a23a'; c.lineWidth = H * .02; c.beginPath(); c.moveTo(cx - s * .6, cy - s * .4); c.lineTo(cx - s * .5, cy + s * .5); c.lineTo(cx + s * .4, cy + s * .5); c.lineTo(cx + s * .5, cy - s * .4); c.closePath(); c.stroke();
    c.beginPath(); c.arc(cx + s * .62, cy, s * .22, -Math.PI / 2, Math.PI / 2); c.stroke(); for (const dx of [-.2, .15]) { c.beginPath(); c.moveTo(cx + s * dx, cy - s * .6); c.quadraticCurveTo(cx + s * (dx + .15), cy - s * .85, cx + s * dx, cy - s * 1.05); c.stroke(); }
    c.direction = 'rtl'; c.textAlign = 'right'; c.fillStyle = '#f2f4f8'; c.font = `700 ${Math.round(H * .15)}px Rubik`; c.fillText('הגיע הזמן', x + w * .93, y + h * .45); c.fillText('להפסקה?', x + w * .93, y + h * .72); }
  c.restore();
}
