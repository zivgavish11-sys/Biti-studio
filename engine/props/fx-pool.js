// FX for the backyard pool kit (Media pro 2026-11-22 run 13, ep023-poolbot). Our own code → CC0. No glow: caustics are a soft real-light pattern, field arcs are matte.
//   import {poolWater, floatCable, fieldPulse, rcdTrip, instructionPage, V230, LOWV} from '/engine/props/fx-pool.js';
import * as THREE from 'three';
export const V230 = 0x4f6fe0, LOWV = 0x8ea6ff;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ss = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

/** animate the pool water (soft waves on 'water') + light caustics on the floor ('causticFloor'). yard = the pool/backyard object.
 *  const W = poolWater(yard, {amp: .012, caustics: .32});  st.frame: W.update(t, {disturb: [x, z, k]?}) — disturb = ripple rings at a point (robot / child), k 0..1. */
export function poolWater(yard, {amp = .012, caustics = .32} = {}) {
  const w = yard.getObjectByName('water'), pos = w.geometry.attributes.position, y0 = Float32Array.from(pos.array);
  w.material = w.material.clone(); Object.assign(w.material, {roughness: .03, opacity: .58}); w.material.userData.real = true; w.receiveShadow = false; w.castShadow = false;
  const cf = yard.getObjectByName('causticFloor');
  const cm = new THREE.ShaderMaterial({transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: {t: {value: 0}, k: {value: caustics}},
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: `uniform float t, k; varying vec2 vUv;
      float c(vec2 p){ vec2 i = p; float s = 1., inten = .005; for (int n = 0; n < 4; n++) { float tt = t * .55 * (1. - (3.5 / float(n + 1)));
        i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x)); s += 1. / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten))); }
        s /= 4.; s = 1.17 - pow(s, 1.4); return pow(abs(s), 8.); }
      void main(){ vec2 p = vUv * vec2(8., 4.) * 1.6; float v = clamp(c(mod(p * 6.28318, 6.28318) - 250.), 0., 1.); float edge = smoothstep(0., .04, vUv.x) * smoothstep(1., .96, vUv.x) * smoothstep(0., .06, vUv.y) * smoothstep(1., .94, vUv.y);
        gl_FragColor = vec4(vec3(.85, .97, 1.) * v * k * edge, 1.); }`});
  if (cf) { cf.material = cm; cf.visible = caustics > 0; }
  return { water: w, update(t, {disturb = null} = {}) {
    cm.uniforms.t.value = t;
    for (let i = 0; i < pos.count; i++) { const x = y0[i * 3], z = y0[i * 3 + 2];
      let y = amp * (Math.sin(x * 1.7 + t * 1.3) * .6 + Math.sin(z * 2.3 - t * 1.1) * .5 + Math.sin((x + z) * 4.1 + t * 2.2) * .18);
      if (disturb) { const [dx, dz, dk] = disturb; const r = Math.hypot(x - (dx - w.position.x), z - (dz - w.position.z)); y += dk * .02 * Math.sin(r * 9 - t * 7) * Math.exp(-r * 1.3); }
      pos.array[i * 3 + 1] = y0[i * 3 + 1] + y; }
    pos.needsUpdate = true; w.geometry.computeVertexNormals(); } };
}

/** the floating cable: power box out-port → over the deck → over the coping → floats on the water (floats every ~.45 m) → drops to the robot's cable gland.
 *  const C = floatCable(scene, {from: V3 outPort, edge: V3 copingSpot, robot: botObject, waterY: -.12, len: 7});
 *  st.frame: C.update(t, {tangle: 0..1, leg: V3 (child's ankle world pos), glow: 0..1 (light-blue low-voltage pulse running down the cable, matte)}).
 *  Nodes: C.cable (tube mesh), C.floats[], C.pulse (small light-blue bead). Colour stays real grey; only the pulse bead is brand light blue. */
export function floatCable(scene, {from, edge, robot, waterY = -.12, len = 7, floats = 10, r = .009} = {}) {
  const mat = new THREE.MeshStandardMaterial({color: 0x2f3338, roughness: .55}); mat.userData.real = true;
  const fm = new THREE.MeshStandardMaterial({color: 0xe3e5e8, roughness: .5}); fm.userData.real = true;
  const cable = new THREE.Mesh(new THREE.BufferGeometry(), mat); cable.castShadow = true; cable.name = 'floatCable'; scene.add(cable);
  const F = []; for (let i = 0; i < floats; i++) { const f = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .09, 16), fm); f.castShadow = true; scene.add(f); F.push(f); }
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(.022, 14, 10), new THREE.MeshStandardMaterial({color: LOWV, roughness: .5})); pulse.visible = false; scene.add(pulse);
  const tmp = V(0, 0, 0);
  function points(t, tangle, leg) {
    const gland = robot.getObjectByName('cableIn') || robot; gland.getWorldPosition(tmp); const G = tmp.clone();
    const P = [from.clone(), V(from.x, .03, from.z + .15), V((from.x + edge.x) / 2 + .2, .025, (from.z + edge.z) / 2), V(edge.x, .07, edge.z - .05), V(edge.x, waterY + .05, edge.z + .15)];
    // surface run: meanders from the edge toward the point above the robot, gently drifting with time
    const S = V(edge.x, waterY, edge.z + .3), E = V(G.x, waterY, G.z), n = 9, side = V(-(E.z - S.z), 0, E.x - S.x).normalize();
    const run = []; for (let i = 1; i <= n; i++) { const u = i / (n + 1); const p = S.clone().lerp(E, u); p.addScaledVector(side, Math.sin(u * Math.PI * 2 + t * .35) * .55 * Math.sin(u * Math.PI) + .35 * Math.sin(u * Math.PI));
      p.y = waterY + .012 + .006 * Math.sin(t * 1.4 + i); run.push(p); }
    if (leg && tangle > 0) { // pull the middle of the run into 1.5 turns around the leg
      const mid = [3, 4, 5, 6, 7]; mid.forEach((j, q) => { const a = q / (mid.length - 1) * Math.PI * 3 + t * .2; const h = V(leg.x + Math.cos(a) * .075, leg.y - .06 + q * .03, leg.z + Math.sin(a) * .075);
        run[j].lerp(h, ss(0, 1, tangle)); }); }
    P.push(...run, V(E.x, waterY - .05, E.z), V(G.x, (G.y + waterY) / 2, G.z - .25), V(G.x, G.y + .02, G.z - .06), G);
    return P; }
  let curve = null;
  return { cable, floats: F, pulse, curve: () => curve,
    update(t, {tangle = 0, leg = null, glow = 0} = {}) {
      const P = points(t, tangle, leg); curve = new THREE.CatmullRomCurve3(P, false, 'centripetal');
      cable.geometry.dispose(); cable.geometry = new THREE.TubeGeometry(curve, 260, r, 8, false);
      // floats sit on the surface part of the curve (u .28..0.86)
      F.forEach((f, i) => { const u = .3 + i / (F.length - 1) * .52; const p = curve.getPointAt(u), d = curve.getTangentAt(u); f.position.copy(p); f.quaternion.setFromUnitVectors(V(0, 1, 0), d); f.visible = p.y > -.4; });
      pulse.visible = glow > 0; if (glow > 0) { pulse.position.copy(curve.getPointAt((t * .35) % 1)); pulse.scale.setScalar(.6 + .4 * glow); } } };
}

/** magnetic-field jump inside pool/powerBox: arcs light up one after another from coil A (230 V) to coil B (low voltage), a bead runs over each arc.
 *  call every frame: fieldPulse(box, k) with k 0..1 (strength, fade in/out yourself) and t. Coil bands stay deep blue (A) / light blue (B). */
export function fieldPulse(box, t, k = 1) {
  for (let i = 0; i < 6; i++) { const a = box.getObjectByName('field' + i); if (!a) continue; const ph = (t * 1.6 - i * .14) % 1;
    if (!a.userData.own) { a.material = a.material.clone(); a.userData.own = 1; } a.material.opacity = k * (.25 + .55 * Math.max(0, Math.sin(ph * Math.PI))); a.material.color.setHex(ph < .5 ? V230 : LOWV); a.visible = k > .01;
    let bead = a.userData.bead; if (!bead) { bead = new THREE.Mesh(new THREE.SphereGeometry(.006, 10, 8), new THREE.MeshStandardMaterial({color: LOWV, roughness: .5})); a.add(bead); a.userData.bead = bead; }
    if (a.userData.r == null) { a.geometry.computeBoundingBox(); a.userData.r = a.geometry.boundingBox.max.x; } const r = a.userData.r, ang = Math.PI * (1 - ph); bead.position.set(Math.cos(ang) * r, Math.sin(ang) * r, 0); bead.visible = k > .2; }
}

/** RCD trips: k 0 = ON (lever up), 1 = OFF (down). Snaps fast in the last 15 %; the status flag turns from green to grey. */
export function rcdTrip(panel, k) {
  const lv = panel.getObjectByName('rcdLever'), fl = panel.getObjectByName('rcdFlag'); const e = k < .85 ? k * .1 : .085 + (k - .85) / .15 * .915;
  if (lv) lv.rotation.x = -.45 + .9 * e;
  if (fl) { if (!fl.userData.own) { fl.material = fl.material.clone(); fl.userData.own = 1; } fl.material.color.setHex(e > .5 ? 0x8a8f96 : 0x3aa655); }
}

/** floating instruction sheet (A4 paper, slightly curled) with Hebrew safety lines; the key line is highlighted in light blue with a red warning mark.
 *  const page = instructionPage(st, {w: .42, highlight: 'לא להיכנס לבריכה כשהרובוט במים'}); page.mesh.position.set(...); st.frame: page.update(t, k) (k 0..1 = highlight wipes in). */
export function instructionPage(st, {w = .42, title = 'הוראות בטיחות', lines = ['יש לחבר לשקע מוגן בממסר פחת', 'יש להציב את הספק רחוק מהמים', 'לא להיכנס לבריכה כשהרובוט במים', 'יש להוציא את הרובוט בסיום הניקוי'], highlight = 2} = {}) {
  const h = w * 1.414, geo = new THREE.PlaneGeometry(w, h, 12, 1); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) / (w / 2); p.setZ(i, .02 * x * x); } geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color: 0xffffff, roughness: .9, side: THREE.DoubleSide})); mesh.userData.aspect = w / h; mesh.castShadow = true; st.scene.add(mesh);
  let K = 0;
  const S = st.screen(mesh, (c, t, W, H) => {
    c.fillStyle = '#fbfaf6'; c.fillRect(0, 0, W, H); c.direction = 'rtl'; c.textAlign = 'right'; const m = W * .09;
    c.fillStyle = '#1b1d22'; c.font = `700 ${W * .075}px Rubik`; c.fillText(title, W - m, H * .1);
    c.fillStyle = '#c9ccd2'; c.fillRect(m, H * .125, W - 2 * m, 3);
    lines.forEach((ln, i) => { const y = H * (.2 + i * .1);
      if (i === highlight) { c.fillStyle = 'rgba(142,166,255,.55)'; c.fillRect(W - m - (W - 2 * m) * K, y - W * .06, (W - 2 * m) * K, W * .085);
        c.fillStyle = '#f0502a'; c.beginPath(); c.arc(m * .55, y - W * .02, W * .022, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = i === highlight ? '#111318' : '#5b5f68'; c.font = `${i === highlight ? 700 : 500} ${W * .046}px Rubik`; c.fillText('• ' + ln, W - m, y); });
    c.fillStyle = '#e4e6ea'; for (let i = 0; i < 9; i++) c.fillRect(m, H * (.64 + i * .035), (W - 2 * m) * (.55 + .4 * ((i * 37) % 10) / 10), H * .012);   // small print
  }, {light: .9});
  return { mesh, screen: S, update(t, k = 0) { K = Math.min(1, Math.max(0, k)); S.update(t); } };
}
