// In-house procedural prop kit (Media pro, 2026-11-04). Generic designs, no real brands. Our own work → CC0.
// Each builder returns a THREE.Group in metres, y-up, standing on y=0, facing +z. Named nodes can be animated in episodes.
// Export: python3 tools/make_props.py  → engine/assets/models/<folder>/<name>.glb
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const M = (color, rough = .55, metal = .05) => new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal});
const MAT = {
  shell: M(0xe9edf3, .45), shell2: M(0xcfd6e0, .5), joint: M(0x2b3140, .5, .2), dark: M(0x161a24, .6, .1),
  steel: M(0xb9c1cc, .3, .85), cyan: M(0x2ee6ff, .45), pink: M(0xff5fd2, .5), orange: M(0xffa53a, .5),
  pad: M(0x2a4b6e, .8), green: M(0x3f8f7a, .85), screen: M(0x0b1626, .35), glass: M(0x8fb6d8, .15, .1),
  lampface: Object.assign(M(0xf4f7ff, .3), {emissive: new THREE.Color(0xfff3dd), emissiveIntensity: .35}),
  rubber: M(0x0e1016, .9),
};
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const rbox = (w, h, d, r, m, name) => mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name);
const cyl = (rt, rb, h, m, name, seg = 32) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const at = (o, x, y, z, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...kids) => { const g = new THREE.Group(); g.name = name; kids.forEach(k => g.add(k)); return g; };
/** a link from a to b (capsule-ish rounded bar) */
function link(a, b, r, m, name) {
  const d = new THREE.Vector3().subVectors(b, a); const L = d.length();
  const o = mesh(new THREE.CapsuleGeometry(r, Math.max(.001, L), 8, 24), m, name);
  o.position.copy(a).addScaledVector(d, .5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return o;
}
const wheel = (x, z) => grp('wheel', at(cyl(.06, .06, .05, MAT.rubber), 0, .06, 0, 0, 0, Math.PI / 2), at(cyl(.025, .025, .14, MAT.joint), 0, .14, 0)).translateX(x).translateZ(z);

// ---------- surgical robot: patient-side cart with 4 arms (generic, not a real product) ----------
// Named nodes: arm0..arm3 (rotate .y to swing), elbow0..3 (rotate .x), tool0..3 (slide .position.y), tip0..3 (jaws open: jawA/jawB .rotation.x)
export function surgicalRobot() {
  const g = grp('surgical-robot');
  g.add(at(rbox(.9, .22, 1.0, .08, MAT.shell), 0, .2, 0));
  for (const [x, z] of [[-.36, -.4], [.36, -.4], [-.36, .4], [.36, .4]]) g.add(wheel(x, z));
  g.add(at(rbox(.5, .06, .7, .03, MAT.joint), 0, .33, 0));
  g.add(at(rbox(.34, 1.95, .34, .1, MAT.shell), 0, 1.3, -.18));                    // column
  g.add(at(rbox(.36, .05, .36, .02, MAT.cyan), 0, .62, -.18));                     // brand stripe (solid colour)
  g.add(at(rbox(.42, .2, .42, .08, MAT.shell2), 0, 2.36, -.18));                    // head
  const boom = grp('boom', at(rbox(1.5, .14, .26, .07, MAT.shell), 0, 0, .18));
  boom.position.set(0, 2.42, -.05); g.add(boom);
  const xs = [-.62, -.21, .21, .62];
  xs.forEach((x, i) => {
    const arm = grp('arm' + i); arm.position.set(x, -.05, .2); boom.add(arm);       // shoulder hangs under boom
    arm.add(at(cyl(.075, .075, .1, MAT.joint), 0, 0, 0));
    const a0 = new THREE.Vector3(0, -.04, 0), a1 = new THREE.Vector3(0, -.12, .42);
    arm.add(link(a0, a1, .055, MAT.shell));
    const elbow = grp('elbow' + i); elbow.position.copy(a1); arm.add(elbow);
    elbow.add(at(cyl(.07, .07, .14, MAT.joint), 0, 0, 0, 0, 0, Math.PI / 2));
    elbow.add(at(rbox(.12, .1, .12, .03, i % 3 ? MAT.cyan : MAT.pink), 0, .08, 0)); // colour cap per arm
    const b1 = new THREE.Vector3(0, -.55, .12);
    elbow.add(link(new THREE.Vector3(), b1, .05, MAT.shell));
    const wrist = grp('wrist' + i); wrist.position.copy(b1); elbow.add(wrist);
    wrist.add(at(rbox(.13, .2, .1, .03, MAT.shell2), 0, -.05, 0));               // instrument carriage
    const tool = grp('tool' + i); wrist.add(tool);
    tool.add(at(cyl(.008, .008, .5, MAT.steel), 0, -.38, 0));
    const tip = grp('tip' + i); tip.position.set(0, -.64, 0); tool.add(tip);
    tip.add(at(cyl(.012, .012, .03, MAT.joint), 0, 0, 0));
    const jaw = (name, s) => grp(name, at(rbox(.006, .045, .012, .003, MAT.steel), 0, -.022, 0)).rotateX(s * .25);
    tip.add(jaw('jawA', 1), jaw('jawB', -1)); tip.children[1].position.y = tip.children[2].position.y = -.012;
    // camera arm (i===1): a thicker scope instead of jaws
    if (i === 1) { tip.visible = false; tool.add(at(cyl(.016, .016, .5, MAT.dark), 0, -.4, 0), at(cyl(.02, .02, .02, MAT.glass, 'lens'), 0, -.66, 0)); }
  });
  return g;
}

// ---------- surgeon console: seated, head in a 3D viewer, two hand controllers, foot pedals ----------
// Named: handL, handR (move .position), viewer (screen material slot 'viewerGlass')
export function surgeonConsole() {
  const g = grp('surgeon-console');
  g.add(at(rbox(1.0, .12, .9, .05, MAT.joint), 0, .06, 0));
  g.add(at(rbox(.9, 1.05, .45, .1, MAT.shell), 0, .64, -.25));                   // body
  g.add(at(rbox(.92, .06, .47, .03, MAT.cyan), 0, .3, -.25));
  g.add(at(rbox(.8, .34, .62, .12, MAT.shell), 0, 1.36, -.08));                  // viewer hood
  g.add(at(rbox(.5, .14, .06, .05, MAT.dark), 0, 1.33, .24));                    // face rest
  for (const x of [-.07, .07]) g.add(at(cyl(.035, .035, .05, MAT.glass, 'viewerGlass'), x, 1.33, .27, Math.PI / 2));
  g.add(at(rbox(.86, .07, .32, .03, MAT.shell2), 0, .9, .18));                   // arm rest
  const hand = (n, x) => grp(n, at(cyl(.02, .025, .14, MAT.joint), 0, .07, 0), at(rbox(.06, .05, .1, .02, MAT.steel), 0, .16, .02),
    at(rbox(.012, .03, .07, .006, MAT.pink), 0, .19, .04)).translateX(x).translateY(.94).translateZ(.12);
  g.add(hand('handL', -.2), hand('handR', .2));
  for (const x of [-.2, -.07, .07, .2]) g.add(at(rbox(.1, .03, .16, .015, MAT.dark), x, .14, .26, -.25));
  return g;
}

// ---------- operating table ----------
export function operatingTable() {
  const g = grp('operating-table');
  g.add(at(rbox(.55, .08, .8, .04, MAT.shell2), 0, .04, 0));
  g.add(at(rbox(.26, .6, .32, .08, MAT.shell), 0, .4, 0));
  g.add(at(rbox(.58, .08, 1.9, .03, MAT.steel), 0, .74, 0));
  g.add(at(rbox(.56, .08, 1.5, .04, MAT.pad), 0, .82, .1));
  g.add(at(rbox(.36, .07, .34, .035, MAT.pad), 0, .82, -.8));                    // head rest
  for (const x of [-.31, .31]) g.add(at(cyl(.012, .012, 1.7, MAT.steel), x, .74, 0, Math.PI / 2));
  return g;
}

/** patient under a green drape (generic, no face) — lies on the table, top at ~1.05 m */
export function drapedPatient() {
  const g = grp('draped-patient');
  const d = mesh(new THREE.CapsuleGeometry(.22, 1.1, 8, 24), MAT.green); d.scale.set(1, 1, .55); at(d, 0, .98, .1, Math.PI / 2); g.add(d);
  g.add(at(rbox(.62, .03, 1.5, .015, MAT.green), 0, .875, .12));
  g.add(at(mesh(new THREE.SphereGeometry(.11, 24, 16), MAT.green), 0, .95, -.78));
  g.add(at(rbox(.24, .006, .2, .003, MAT.shell), 0, 1.1, .05, 0, 0, 0));          // incision window
  return g;
}

// ---------- surgical lamp (ceiling, two heads) — faces are matte with a soft warm tint (no bloom) ----------
export function surgicalLamp() {
  const g = grp('surgical-lamp');
  g.add(at(cyl(.12, .12, .06, MAT.shell2), 0, 2.97, 0));
  g.add(at(cyl(.03, .03, .5, MAT.shell), 0, 2.7, 0));
  const head = (n, x, z, tilt) => {
    const h = grp(n); h.position.set(x, 2.25, z);
    h.add(link(new THREE.Vector3(-x, .2, -z), new THREE.Vector3(0, .12, 0), .025, MAT.shell));
    h.add(at(mesh(new THREE.SphereGeometry(.34, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2.6), MAT.shell), 0, -.08, 0));
    h.add(at(cyl(.27, .27, .02, MAT.lampface, 'lampFace'), 0, .0, 0));
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; h.add(at(cyl(.045, .045, .022, MAT.glass), Math.cos(a) * .16, -.004, Math.sin(a) * .16)); }
    h.add(at(cyl(.03, .03, .12, MAT.joint), 0, -.06, 0));
    h.rotation.x = tilt; return h;
  };
  g.add(head('lampA', -.45, .1, .25), head('lampB', .5, -.1, -.2));
  return g;
}

// ---------- vital-signs monitor on a rolling stand; 'screen' mesh takes a CanvasTexture in episodes ----------
export function medicalMonitor() {
  const g = grp('medical-monitor');
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.add(link(new THREE.Vector3(), new THREE.Vector3(Math.cos(a) * .28, 0, Math.sin(a) * .28), .018, MAT.joint).translateY(.08)); const w = wheel(Math.cos(a) * .28, Math.sin(a) * .28); w.scale.setScalar(.6); g.add(w); }
  g.add(at(cyl(.022, .022, 1.2, MAT.steel), 0, .7, 0));
  g.add(at(rbox(.62, .42, .08, .03, MAT.shell), 0, 1.45, 0));
  const scr = mesh(new THREE.PlaneGeometry(.54, .34), MAT.screen.clone(), 'screen'); at(scr, 0, 1.45, .041); g.add(scr);
  return g;
}

// ---------- tiny instruments (true scale ~0.3 m; scale up for close-ups) ----------
export function grasper() {
  const g = grp('instrument-grasper');
  g.add(at(cyl(.004, .004, .3, MAT.steel), 0, .15, 0));
  g.add(at(cyl(.006, .006, .015, MAT.joint, 'wrist'), 0, .0, 0));
  const jaw = (n, s) => grp(n, at(rbox(.003, .022, .006, .0015, MAT.steel), 0, -.011, 0)).rotateZ(s * .3);
  g.add(jaw('jawA', 1), jaw('jawB', -1)); return g;
}
export function needle() {
  const g = grp('suture-needle');
  g.add(mesh(new THREE.TorusGeometry(.012, .0012, 8, 32, Math.PI * 1.1), MAT.steel));
  const thr = new THREE.CatmullRomCurve3([new THREE.Vector3(.012, 0, 0), new THREE.Vector3(.03, -.01, .005), new THREE.Vector3(.05, .005, -.01), new THREE.Vector3(.08, -.005, 0)]);
  g.add(mesh(new THREE.TubeGeometry(thr, 40, .0007, 6), MAT.cyan)); return g;
}

// ---------- robot vacuum + dock (generic) ----------
// Named: lidar (spin .rotation.y), brush (spin), bumper
export function robotVacuum() {
  const g = grp('robot-vacuum');
  const body = mesh(new THREE.CylinderGeometry(.17, .17, .07, 64), MAT.dark, 'shell'); at(body, 0, .045, 0); g.add(body);
  g.add(at(mesh(new THREE.CylinderGeometry(.165, .17, .012, 64), MAT.joint, 'shellTop'), 0, .085, 0));
  // insides (hidden by the shell; for x-ray shots make 'shell'/'shellTop' transparent): battery, 2 wheel motors, dust bin, board, fan
  const inner = grp('insides'); g.add(inner);
  inner.add(at(rbox(.13, .03, .05, .008, MAT.orange, 'battery'), 0, .035, -.02));
  for (const x of [-.09, .09]) inner.add(at(cyl(.018, .018, .04, MAT.steel, 'motor'), x, .03, .0, 0, 0, Math.PI / 2));
  inner.add(at(rbox(.16, .045, .07, .015, MAT.glass, 'dustbin'), 0, .045, -.1));
  inner.add(at(rbox(.12, .006, .08, .002, M(0x1f7a4a, .6), 'board'), 0, .072, .05));
  inner.add(at(cyl(.03, .03, .03, MAT.pink, 'fan'), .06, .05, -.1));
  g.add(at(mesh(new THREE.TorusGeometry(.168, .012, 8, 64, Math.PI * .9), MAT.joint, 'bumper'), 0, .045, 0, Math.PI / 2, 0, Math.PI * .55));
  const lidar = grp('lidar', at(cyl(.045, .048, .03, MAT.joint), 0, 0, 0), at(rbox(.03, .014, .006, .003, MAT.cyan), 0, 0, .045));
  lidar.position.set(0, .107, .06); g.add(lidar);
  g.add(at(cyl(.012, .012, .004, MAT.cyan), 0, .093, -.08));                      // status light (solid colour)
  const brush = grp('brush'); brush.position.set(.12, .012, .1);
  for (let i = 0; i < 3; i++) brush.add(link(new THREE.Vector3(), new THREE.Vector3(Math.cos(i * 2.1) * .07, 0, Math.sin(i * 2.1) * .07), .003, MAT.shell2));
  g.add(brush);
  for (const x of [-.11, .11]) g.add(at(cyl(.03, .03, .02, MAT.rubber), x, .03, 0, 0, 0, Math.PI / 2));
  return g;
}
export function vacuumDock() {
  const g = grp('vacuum-dock');
  g.add(at(rbox(.36, .02, .22, .01, MAT.joint), 0, .01, .08));
  g.add(at(rbox(.34, .42, .16, .06, MAT.dark), 0, .21, -.06));
  g.add(at(rbox(.2, .015, .01, .005, MAT.cyan), 0, .36, .021));
  for (const x of [-.06, .06]) g.add(at(rbox(.03, .012, .03, .004, MAT.steel), x, .03, .04));
  return g;
}

// ---------- quadcopter drone (generic X-frame, no real brand) — added 2026-11-04 for ep006-drone ----------
// Real metres (~0.5 m motor-to-motor). Nodes: prop0..prop3 (spin .rotation.y; 0&2 one way, 1&3 the other) each holding disc{i} (visible, default look) + blades{i} (hidden; show for a parked/slow-spin drone), motor0..3, arm0..3,
// 'shell' + 'shellTop' (make transparent for the x-ray shot), 'insides' group with 'imu' (small board + chip), 'battery', 'fc' (flight computer),
// ledFront0/1 (cyan) + ledBack0/1 (pink) — solid colours, no glow. Front = +z.
export function drone() {
  const g = grp('drone');
  const legH = .11, by = legH + .045;                                             // body centre height
  const body = rbox(.16, .06, .22, .03, MAT.dark, 'shell'); at(body, 0, by, 0); g.add(body);
  g.add(at(rbox(.13, .018, .18, .009, MAT.shell, 'shellTop'), 0, by + .036, -.005));
  g.add(at(rbox(.02, .004, .14, .002, MAT.cyan), 0, by + .046, -.005));          // brand stripe on top
  const inner = grp('insides'); g.add(inner);
  inner.add(at(rbox(.09, .028, .14, .008, MAT.orange, 'battery'), 0, by - .008, -.02));
  const fc = grp('fc', at(rbox(.075, .004, .075, .002, M(0x1f7a4a, .6)), 0, 0, 0)); fc.position.set(0, by + .014, .03); inner.add(fc);
  const imu = grp('imu', at(rbox(.022, .006, .022, .002, MAT.dark), 0, .005, 0), at(rbox(.008, .002, .008, .001, MAT.cyan), 0, .009, 0));
  imu.position.set(0, by + .014, .03); inner.add(imu);
  for (let i = 0; i < 6; i++) inner.add(at(rbox(.006, .003, .01, .001, MAT.steel), -.025 + i * .01, by + .018, .06));
  // camera bump at the front (generic)
  g.add(at(rbox(.05, .04, .03, .012, MAT.joint), 0, by - .02, .115));
  g.add(at(cyl(.012, .012, .01, MAT.glass, 'lens'), 0, by - .02, .132, Math.PI / 2));
  const R = .25;                                                                   // centre → motor
  [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([sx, sz], i) => {
    const a = new THREE.Vector3(sx * .05, by, sz * .07), b = new THREE.Vector3(sx * R * .7071, by + .005, sz * R * .7071);
    g.add(link(a, b, .012, MAT.shell2, 'arm' + i));
    const m = grp('motor' + i, at(cyl(.022, .024, .03, MAT.joint), 0, 0, 0), at(cyl(.016, .016, .006, MAT.steel), 0, .018, 0));
    m.position.copy(b).add(new THREE.Vector3(0, .012, 0)); g.add(m);
    const pr = grp('prop' + i, at(cyl(.006, .006, .012, MAT.steel), 0, 0, 0));
    const bl = grp('blades' + i); bl.visible = false; pr.add(bl);                // real blades (hidden: at 30 fps they strobe/look frozen)
    for (const k of [0, 1]) bl.add(at(rbox(.115, .004, .022, .002, i % 2 ? MAT.shell : MAT.shell2), (k ? -1 : 1) * .06, 0, 0, (k ? -1 : 1) * .12));
    // spinning-prop disc (Ziv approved 2026-11-04): soft see-through disc + thin cyan rim, matte, no glow
    const disc = grp('disc' + i,
      at(mesh(new THREE.CircleGeometry(.12, 48), Object.assign(M(0xdfe6f0, .6), {transparent: true, opacity: .22, depthWrite: false, side: THREE.DoubleSide})), 0, 0, 0, -Math.PI / 2),
      at(mesh(new THREE.RingGeometry(.112, .12, 48), Object.assign(M(0x2ee6ff, .5), {transparent: true, opacity: .55, side: THREE.DoubleSide})), 0, .001, 0, -Math.PI / 2));
    disc.children.forEach(c => c.castShadow = false); pr.add(disc);
    pr.position.copy(m.position).add(new THREE.Vector3(0, .028, 0)); pr.rotation.y = i * .7; g.add(pr);
    // prop guard ring (keeps it generic, reads well on camera)
    g.add(at(mesh(new THREE.TorusGeometry(.13, .005, 6, 48), MAT.joint), m.position.x, m.position.y + .02, m.position.z, Math.PI / 2));
    // arm LEDs: front cyan, back pink (solid, no glow)
    const led = at(rbox(.014, .01, .014, .004, sz > 0 ? MAT.cyan : MAT.pink, (sz > 0 ? 'ledFront' : 'ledBack') + (sx > 0 ? 0 : 1)), m.position.x, m.position.y - .022, m.position.z);
    g.add(led);
    // landing leg under each motor
    g.add(link(new THREE.Vector3(m.position.x * .9, by - .02, m.position.z * .9), new THREE.Vector3(m.position.x * .95, .006, m.position.z * .95), .005, MAT.joint));
    g.add(at(mesh(new THREE.SphereGeometry(.009, 12, 8), MAT.rubber), m.position.x * .95, .008, m.position.z * .95));
  });
  return g;
}

// ---------- waiter tray with glasses (for 'כמו מלצר עם מגש מלא בחתונה') ----------
// Real metres, tray Ø 0.36 m standing on y=0 (tray top at y≈0.015). Nodes: 'tray', glass0..glass4 (wobble them), drink0..4.
export function trayGlasses() {
  const g = grp('tray-glasses');
  g.add(at(cyl(.18, .175, .012, MAT.steel, 'tray', 64), 0, .006, 0));
  g.add(at(mesh(new THREE.TorusGeometry(.178, .006, 8, 64), MAT.steel), 0, .013, 0, Math.PI / 2));
  const glassM = Object.assign(M(0xcfe6ff, .08, 0), {transparent: true, opacity: .38, depthWrite: false});
  const wine = M(0x8e1f3f, .25), juice = M(0xffa53a, .3);
  const spots = [[0, 0], [.1, .06], [-.1, .06], [.07, -.1], [-.08, -.09]];
  spots.forEach(([x, z], i) => {
    const gl = grp('glass' + i); gl.position.set(x, .012, z); g.add(gl);
    gl.add(at(cyl(.03, .032, .004, glassM, null, 24), 0, .002, 0));              // foot
    gl.add(at(cyl(.004, .004, .07, glassM, null, 12), 0, .039, 0));              // stem
    gl.add(at(cyl(.034, .018, .08, glassM, null, 24), 0, .114, 0));              // bowl
    gl.add(at(cyl(.028, .017, .04, i % 2 ? juice : wine, 'drink' + i, 24), 0, .095, 0));
  });
  return g;
}


// ---------- everyday Israeli props (Media pro, 2026-11-07 workshop — Ziv approved "Israeli everyday prop kit") ----------
// Screens are flat planes named 'screen'/'sign' with clean 0..1 UVs → paint Hebrew UI with st.screen(obj.getObjectByName('screen'), draw).
const bar = (a, b, r, m) => { const d = new THREE.Vector3().subVectors(b, a); const o = mesh(new THREE.CylinderGeometry(r, r, d.length(), 6), m); o.position.copy(a).addScaledVector(d, .5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return o; };
const plane = (w, h, m, name) => mesh(new THREE.PlaneGeometry(w, h), m, name);
/** smartphone, 7.5 x 15.5 cm, screen faces +z. Nodes: body, screen (aspect .46) */
export function smartphone() {
  const g = grp('smartphone', at(rbox(.075, .155, .008, .009, M(0x15172e, .35, .4), 'body'), 0, .0775, 0));
  const scr = at(plane(.069, .149, MAT.screen, 'screen'), 0, .0775, .0041); scr.userData.aspect = .069 / .149; g.add(scr);
  g.add(at(cyl(.004, .004, .002, MAT.dark, 'camera'), .025, .145, -.0045, Math.PI / 2));
  return g;
}
/** home Wi-Fi router, 26 cm wide. Nodes: body, led0..3 (solid colours, set material colour for on/off), ant0..3 (rotate .x) */
export function router() {
  const body = at(rbox(.26, .045, .17, .02, M(0x1b1e2c, .45, .2), 'body'), 0, .03, 0);
  const g = grp('router', body);
  [-.075, -.025, .025, .075].forEach((x, i) => { const led = at(cyl(.005, .005, .003, M(i < 3 ? 0x5fe39a : 0x2ee6ff, .4), 'led' + i, 12), x, .03, .086, Math.PI / 2); g.add(led); });
  [-.11, -.04, .04, .11].forEach((x, i) => { const a = grp('ant' + i, at(rbox(.018, .17, .009, .004, M(0x1b1e2c, .5, .1)), 0, .085, 0)); a.position.set(x, .05, -.08); a.rotation.x = -.12; a.rotation.z = (i - 1.5) * .08; g.add(a); });
  for (let i = 0; i < 9; i++) g.add(at(mesh(new THREE.BoxGeometry(.012, .004, .1), MAT.dark), -.08 + i * .02, .053, 0));
  return g;
}
/** cell tower, 18 m lattice mast with 3 antenna sectors + microwave dishes. Nodes: mast, sector0..2 (groups, each with panel{i}a/b), dish0..1 */
export function cellTower() {
  const steel = M(0x9aa3b2, .45, .7), white = M(0xe6e9ef, .55);
  const g = grp('cellTower'); const mast = grp('mast'); g.add(mast);
  const H = 18, legs = [0, 1, 2].map(i => i * Math.PI * 2 / 3);
  const leg = (k, y) => { const r = .9 - .55 * (y / H); return new THREE.Vector3(Math.cos(legs[k]) * r, y, Math.sin(legs[k]) * r); };
  for (let k = 0; k < 3; k++) mast.add(bar(leg(k, 0), leg(k, H), .05, steel));
  for (let y = 0; y < H; y += 1.5) for (let k = 0; k < 3; k++) { const n = (k + 1) % 3; mast.add(bar(leg(k, y), leg(n, y), .025, steel)); mast.add(bar(leg(k, y), leg(n, y + 1.5), .018, steel)); }
  mast.add(at(cyl(.6, .6, .12, steel), 0, H - 1.8, 0));
  legs.forEach((a, i) => { const s = grp('sector' + i); s.position.set(0, H - 1.2, 0); s.rotation.y = -a + Math.PI / 2;
    [-.22, .22].forEach((dx, j) => s.add(at(rbox(.3, 1.4, .12, .04, white, 'panel' + i + 'ab'[j]), dx, 0, .7)));
    s.add(at(rbox(.7, .06, .06, .02, steel), 0, .5, .6)); s.add(at(rbox(.7, .06, .06, .02, steel), 0, -.5, .6)); g.add(s); });
  [0, 1].forEach(i => { const d = grp('dish' + i, at(cyl(.4, .25, .2, white, null, 32), 0, 0, 0, Math.PI / 2), at(cyl(.05, .05, .3, steel), 0, 0, -.2, Math.PI / 2));
    d.position.set(Math.cos(i * 2.2) * .55, H - 4 - i * 1.2, Math.sin(i * 2.2) * .55); d.rotation.y = -i * 2.2 + Math.PI / 2; g.add(d); });
  g.add(at(rbox(2.6, .3, 2.6, .05, M(0x6d7482, .9)), 0, .15, 0));
  return g;
}
/** Israeli-style bus stop shelter, 3.6 m wide. Nodes: roof, bench, sign (route-number plate on a pole, aspect 1.6), screen (arrival board, aspect 3), glassL/glassR, back */
export function busStop() {
  const frame = M(0x9aa3b2, .4, .6), roof = M(0xd9dde6, .5), seat = M(0xc7ccd6, .45, .4);
  const g = grp('busStop');
  [[-1.75, -.6], [1.75, -.6], [-1.75, .55], [1.75, .55]].forEach(([x, z]) => g.add(at(cyl(.04, .04, 2.5, frame), x, 1.25, z)));
  g.add(at(rbox(3.8, .08, 1.5, .03, roof, 'roof'), 0, 2.54, 0));
  const back = at(rbox(3.5, 2, .03, .01, Object.assign(M(0x8fb6d8, .1, .1), {transparent: true, opacity: .35}), 'back'), 0, 1.3, -.6); g.add(back);
  [-1, 1].forEach(s => g.add(at(rbox(.03, 2, 1.0, .01, Object.assign(M(0x8fb6d8, .1, .1), {transparent: true, opacity: .3}), s < 0 ? 'glassL' : 'glassR'), s * 1.75, 1.3, -.05)));
  g.add(at(rbox(2.4, .06, .4, .02, seat, 'bench'), 0, .5, -.35)); [-1, 1].forEach(s => g.add(at(rbox(.05, .5, .3, .01, frame), s * 1.0, .25, -.35)));
  const board = at(rbox(1.2, .42, .08, .02, MAT.dark), .8, 2.2, .45); g.add(board);
  const scr = at(plane(1.12, .3733, MAT.screen, 'screen'), .8, 2.2, .491); scr.userData.aspect = 3; g.add(scr);
  g.add(at(cyl(.05, .05, 3.2, frame), 2.4, 1.6, .7));
  g.add(at(rbox(.62, .4, .04, .03, M(0xf2f4f8, .5)), 2.4, 2.9, .73));
  const sign = at(plane(.58, .3625, M(0xf2f4f8, .5), 'sign'), 2.4, 2.9, .752); sign.userData.aspect = 1.6; g.add(sign);
  return g;
}


/** parallel 2-jaw robot gripper (generic), hangs DOWN from y=0.30 (flange on top) to fingertips at y=0. ~0.30 m tall, opening up to ~0.12 m.
 * Nodes: flange, body, jawA (x<0) / jawB (x>0) → slide .position.x (closed ±0.012, open ±0.06), padA/padB (soft fingertip pads → recolour on contact),
 * sensor0..2 (small solid force-sensor dots on each pad: sensorA0..2 / sensorB0..2), cam (wrist camera), led (solid status light). */
export function gripper() {
  const g = grp('gripper');
  g.add(at(cyl(.045, .045, .03, MAT.joint, 'flange'), 0, .285, 0));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.add(at(cyl(.005, .005, .006, MAT.steel, null, 10), Math.cos(a) * .034, .302, Math.sin(a) * .034)); }
  g.add(at(rbox(.15, .09, .07, .014, MAT.shell, 'body'), 0, .225, 0));
  g.add(at(rbox(.16, .018, .06, .006, MAT.joint, 'rail'), 0, .172, 0));
  g.add(at(rbox(.03, .012, .072, .004, MAT.cyan, 'stripe'), 0, .245, 0));
  g.add(at(cyl(.012, .012, .02, MAT.dark, 'cam', 20), 0, .21, .04, Math.PI / 2));
  g.add(at(cyl(.006, .006, .004, MAT.cyan, 'led', 12), .055, .245, .0355, Math.PI / 2));
  const jaw = (sx, tag) => {
    const j = grp('jaw' + tag);
    j.add(at(rbox(.034, .03, .05, .006, MAT.joint), 0, .165, 0));
    j.add(at(rbox(.018, .14, .044, .006, MAT.shell2, 'finger' + tag), sx * .004, .085, 0));
    const pad = at(rbox(.008, .07, .04, .004, MAT.pad, 'pad' + tag), -sx * .009, .045, 0); j.add(pad);
    [0, 1, 2].forEach(k => j.add(at(cyl(.004, .004, .003, MAT.cyan, 'sensor' + tag + k, 12), -sx * .0135, .02 + k * .025, 0, 0, 0, Math.PI / 2)));
    j.position.x = sx * .05; return j;
  };
  g.add(jaw(-1, 'A'), jaw(1, 'B'));
  return g;
}

// ================= 2026-11-12 batch (Media pro run 4): robots, autonomous machines, servo, factory hall =================
const MAT2 = { white: M(0xe6e9ef, .42, .05), gray: M(0x8a93a3, .5, .3), graphite: M(0x3a4150, .5, .25), visor: M(0x0a0f1a, .12, .4),
  amber: M(0xf2b134, .5, .1), wood: M(0x9a7a55, .85), fabric: M(0x4a5872, .9), concrete: M(0x6d7280, .9), panel: M(0x8c95a4, .6, .35),
  winGlass: M(0x7f97b5, .12, .3), tire: M(0x111318, .85), pcb: M(0x1f6b4e, .6), copper: M(0xb87333, .35, .8), yellowLine: M(0xd9b23a, .7) };
/** joint group at p with an optional child link to q (in the joint's local space) */
const bx = (w, h, d, r, m, name) => mesh(new THREE.BoxGeometry(w, h, d), m, name);
const joint = (name, p, ...kids) => at(grp(name, ...kids), ...p);
const tire = (r, w, name) => { const g = grp(name); g.add(at(cyl(r, r, w, MAT2.tire, null, 28), 0, 0, 0, 0, 0, Math.PI / 2)); g.add(at(cyl(r * .62, r * .62, w + .004, MAT2.gray, null, 20), 0, 0, 0, 0, 0, Math.PI / 2)); return g; };

/** generic humanoid robot, 1.70 m, faces +z. Joints (rotate .x to swing forward/back, .z sideways):
 * pelvis, torso (.y twist), neck, head, shoulderL/R, elbowL/R, wristL/R, hipL/R, kneeL/R, ankleL/R.
 * visor + eyeL/eyeR (solid cyan bars, no glow), chestLight. X-ray: make 'torsoShell' transparent → group 'insides' (battery = 6 cells 'cell0..5', 'computer', 'cooling'). */
export function humanoid() {
  const W = MAT2.white, J = MAT.joint, D = MAT2.graphite;
  const root = grp('humanoid');
  const pelvis = joint('pelvis', [0, .95, 0], at(rbox(.3, .14, .2, .05, D, 'pelvisShell'), 0, 0, 0));
  root.add(pelvis);
  const torso = joint('torso', [0, .08, 0]); pelvis.add(torso);
  torso.add(at(rbox(.22, .12, .16, .04, J, 'waist'), 0, .06, 0));
  const shell = at(rbox(.38, .42, .24, .09, W, 'torsoShell'), 0, .34, 0); torso.add(shell);
  torso.add(at(rbox(.2, .18, .02, .02, D, 'chestPlate'), 0, .38, .121));
  torso.add(at(rbox(.12, .012, .006, .004, MAT.cyan, 'chestLight'), 0, .44, .132));
  const ins = grp('insides'); torso.add(ins);
  for (let i = 0; i < 6; i++) ins.add(at(cyl(.022, .022, .16, MAT.cyan, 'cell' + i, 16), -.1 + i * .04, .26, -.02));
  ins.add(at(rbox(.26, .03, .1, .01, D, 'batteryCase'), 0, .17, -.02));
  ins.add(at(rbox(.16, .1, .03, .01, MAT2.pcb, 'computer'), 0, .45, .02));
  ins.add(at(cyl(.035, .035, .015, MAT2.gray, 'cooling', 20), 0, .45, -.06, Math.PI / 2));
  const neck = joint('neck', [0, .57, 0], at(cyl(.04, .05, .07, J, null, 20), 0, .03, 0)); torso.add(neck);
  const head = joint('head', [0, .07, 0]); neck.add(head);
  head.add(at(rbox(.22, .25, .23, .09, W, 'headShell'), 0, .12, 0));
  head.add(at(rbox(.19, .1, .03, .04, MAT2.visor, 'visor'), 0, .13, .105));
  head.add(at(rbox(.04, .012, .006, .005, MAT.cyan, 'eyeL'), -.045, .135, .122));
  head.add(at(rbox(.04, .012, .006, .005, MAT.cyan, 'eyeR'), .045, .135, .122));
  [-1, 1].forEach(s => head.add(at(cyl(.03, .03, .02, D, null, 20), s * .115, .12, 0, 0, 0, Math.PI / 2)));
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    const sh = joint('shoulder' + k, [s * .25, .5, 0]); torso.add(sh);
    sh.add(at(mesh(new THREE.SphereGeometry(.065, 24, 16), D), 0, 0, 0));
    sh.add(link(new THREE.Vector3(0, -.03, 0), new THREE.Vector3(0, -.24, 0), .048, W, 'upperArm' + k));
    const el = joint('elbow' + k, [0, -.28, 0], at(mesh(new THREE.SphereGeometry(.045, 20, 14), J), 0, 0, 0)); sh.add(el);
    el.add(link(new THREE.Vector3(0, -.02, 0), new THREE.Vector3(0, -.2, 0), .04, W, 'forearm' + k));
    const wr = joint('wrist' + k, [0, -.25, 0]); el.add(wr);
    wr.add(at(rbox(.05, .09, .075, .02, D, 'hand' + k), 0, -.05, .005));
    [0, 1, 2, 3].forEach(f => wr.add(at(rbox(.012, .05, .014, .005, J), -.018 + f * .012, -.115, .03)));
    wr.add(at(rbox(.014, .04, .014, .005, J, 'thumb' + k), -s * .03, -.07, .035, 0, 0, s * .4));
  }
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    const hp = joint('hip' + k, [s * .1, -.05, 0], at(mesh(new THREE.SphereGeometry(.06, 20, 14), J), 0, 0, 0)); pelvis.add(hp);
    hp.add(link(new THREE.Vector3(0, -.03, 0), new THREE.Vector3(0, -.36, 0), .06, W, 'thigh' + k));
    const kn = joint('knee' + k, [0, -.42, 0], at(mesh(new THREE.SphereGeometry(.052, 20, 14), D), 0, 0, 0)); hp.add(kn);
    kn.add(link(new THREE.Vector3(0, -.02, 0), new THREE.Vector3(0, -.34, 0), .05, W, 'shin' + k));
    const an = joint('ankle' + k, [0, -.42, 0]); kn.add(an);
    an.add(at(rbox(.1, .055, .22, .025, D, 'foot' + k), 0, -.035, .035));
  }
  return root;
}

/** generic quadruped robot dog, ~0.55 m to the back, 0.8 m long, faces +z.
 * Nodes: body, head (cam0/cam1 stereo eyes), lidar (spin .y), legFL/FR/BL/BR → hip{FL..} (rotate .x), knee{FL..} (rotate .x), foot{FL..}. */
export function robotDog() {
  const W = MAT2.white, D = MAT2.graphite, J = MAT.joint;
  const root = grp('robotDog'); const body = joint('body', [0, .5, 0]); root.add(body);
  body.add(at(rbox(.3, .14, .62, .05, W, 'bodyShell'), 0, 0, 0));
  body.add(at(rbox(.26, .03, .5, .015, D), 0, .08, 0));
  body.add(at(rbox(.31, .015, .3, .006, MAT.cyan, 'stripe'), 0, -.02, 0));
  const lid = joint('lidar', [0, .1, -.1], at(cyl(.045, .05, .05, D, null, 24), 0, .025, 0), at(cyl(.03, .03, .02, MAT.cyan, null, 20), 0, .055, 0)); body.add(lid);
  const head = joint('head', [0, .02, .34], at(rbox(.2, .1, .1, .035, W, 'headShell'), 0, 0, 0), at(rbox(.17, .06, .02, .02, MAT2.visor), 0, 0, .05)); body.add(head);
  [-1, 1].forEach((s, i) => head.add(at(cyl(.014, .014, .01, MAT.cyan, 'cam' + i, 16), s * .045, 0, .062, Math.PI / 2)));
  for (const [x, z, k] of [[-.17, .24, 'FL'], [.17, .24, 'FR'], [-.17, -.24, 'BL'], [.17, -.24, 'BR']]) {
    const leg = joint('leg' + k, [x, -.02, z]); body.add(leg);
    const hip = joint('hip' + k, [0, 0, 0], at(cyl(.05, .05, .07, D, null, 20), 0, 0, 0, 0, 0, Math.PI / 2)); leg.add(hip);
    hip.rotation.x = -.55; hip.add(link(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -.23, 0), .035, W, 'thigh' + k));
    const kn = joint('knee' + k, [0, -.25, 0], at(cyl(.03, .03, .055, J, null, 16), 0, 0, 0, 0, 0, Math.PI / 2)); hip.add(kn);
    kn.rotation.x = 1.1; kn.add(link(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -.22, 0), .022, D, 'shin' + k));
    kn.add(at(mesh(new THREE.SphereGeometry(.03, 16, 12), MAT.rubber, 'foot' + k), 0, -.24, 0));
  }
  return root;
}

/** six-wheel sidewalk delivery robot (generic), 0.7 m long, faces +z. Nodes: wheel0..5 (spin .x), lid (open: rotation.x negative, hinge at the back),
 * flag (orange pennant on a pole), cam0..2, screen (front plane → st.screen for a Hebrew face/status), stripe. */
export function deliveryBot() {
  const root = grp('deliveryBot');
  root.add(at(rbox(.56, .34, .7, .08, MAT2.white, 'body'), 0, .33, 0));
  root.add(at(rbox(.57, .05, .71, .02, MAT2.graphite, 'skirt'), 0, .17, 0));
  root.add(at(rbox(.575, .03, .5, .01, MAT.cyan, 'stripe'), 0, .3, 0));
  const lid = joint('lid', [0, .5, -.34], at(rbox(.54, .08, .68, .07, MAT2.white, 'lidShell'), 0, .03, .34)); root.add(lid);
  const sc = mesh(new THREE.PlaneGeometry(.34, .14), MAT.screen, 'screen'); at(sc, 0, .37, .353); root.add(sc);
  [[-.18, .42, .35], [.18, .42, .35], [0, .44, -.355]].forEach(([x, y, z], i) => root.add(at(cyl(.016, .016, .012, MAT.dark, 'cam' + i, 16), x, y, z, Math.PI / 2)));
  const pole = at(cyl(.006, .006, .9, MAT2.gray, 'pole', 8), .22, .95, -.3); root.add(pole);
  const fl = mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -.14, 0), new THREE.Vector3(0, -.07, -.22)]), M(0xffa53a, .6), 'flag');
  fl.geometry.computeVertexNormals(); fl.material.side = THREE.DoubleSide; at(fl, .22, 1.4, -.3); root.add(fl);
  [-.3, 0, .3].forEach((z, i) => [-1, 1].forEach((s, j) => { const w = tire(.085, .06, 'wheel' + (i * 2 + j)); at(w, s * .3, .085, z); root.add(w); }));
  return root;
}

/** generic 6-axis industrial robot arm on a base, reach ~1.5 m (white + graphite, no brand colours). Each joint rotates its group:
 * j1 (.y base turn), j2 (.x shoulder), j3 (.x elbow), j4 (.z forearm roll), j5 (.x wrist pitch), j6 (.y flange) → 'tool' (empty group: attach body/gripper here, pointing −y after j5).
 * Default pose = upright L. Base 'base' 0.5 m Ø; cable along the arm. */
export function robotArm() {
  const W = MAT2.white, D = MAT2.graphite, J = MAT.joint;
  const root = grp('robotArm');
  root.add(at(cyl(.28, .3, .06, D, 'plate', 40), 0, .03, 0));
  root.add(at(cyl(.2, .24, .22, W, 'base', 40), 0, .17, 0));
  const j1 = joint('j1', [0, .28, 0], at(cyl(.19, .19, .12, J, null, 36), 0, .06, 0), at(rbox(.3, .26, .3, .07, W, 'turret'), 0, .25, 0)); root.add(j1);
  const j2 = joint('j2', [0, .32, 0], at(cyl(.13, .13, .36, D, null, 32), 0, 0, 0, 0, 0, Math.PI / 2)); j1.add(j2);
  j2.add(at(rbox(.2, .78, .2, .08, W, 'upperArm'), .02, .39, 0));
  j2.add(at(rbox(.06, .5, .02, .01, MAT.cyan, 'stripe'), .02, .42, .101));
  const j3 = joint('j3', [0, .78, 0], at(cyl(.1, .1, .3, D, null, 28), 0, 0, 0, 0, 0, Math.PI / 2)); j2.add(j3);
  j3.add(at(rbox(.16, .18, .22, .06, W, 'elbowHousing'), 0, 0, -.04));
  const j4 = joint('j4', [0, 0, .08]); j3.add(j4); j4.rotation.x = Math.PI / 2;
  j4.add(at(cyl(.07, .08, .62, W, 'forearm', 28), 0, .31, 0));
  const j5 = joint('j5', [0, .64, 0], at(cyl(.06, .06, .16, D, null, 24), 0, 0, 0, 0, 0, Math.PI / 2)); j4.add(j5);
  j5.add(at(rbox(.11, .1, .11, .04, W, 'wrist'), 0, .06, 0));
  const j6 = joint('j6', [0, .12, 0], at(cyl(.045, .045, .03, J, 'flange', 24), 0, .015, 0)); j5.add(j6);
  const tool = joint('tool', [0, .03, 0]); j6.add(tool);
  // cable
  const c = new THREE.CatmullRomCurve3([new THREE.Vector3(.17, .15, -.12), new THREE.Vector3(.2, .55, -.18), new THREE.Vector3(.14, 1.0, -.16), new THREE.Vector3(.13, 1.3, -.1)]);
  root.add(mesh(new THREE.TubeGeometry(c, 30, .016, 8), MAT.rubber, 'cable'));
  return root;
}

/** warehouse drive unit (generic, low square robot that lifts a shelf pod), 0.8×0.8×0.3 m. Nodes: lift (raise .position.y by ~0.05), wheelL/wheelR, led, cam. */
export function driveUnit() {
  const root = grp('driveUnit');
  root.add(at(rbox(.8, .24, .8, .08, M(0x3d4a63, .55, .15), 'body'), 0, .14, 0));
  root.add(at(rbox(.81, .03, .81, .02, MAT.cyan, 'stripe'), 0, .2, 0));
  root.add(at(cyl(.3, .3, .02, MAT2.graphite, 'liftBase', 40), 0, .265, 0));
  const lift = joint('lift', [0, .275, 0], at(cyl(.27, .27, .03, MAT2.gray, null, 40), 0, .015, 0)); root.add(lift);
  [-1, 1].forEach((s, i) => { const w = tire(.07, .06, i ? 'wheelR' : 'wheelL'); at(w, s * .33, .07, 0); root.add(w); });
  root.add(at(cyl(.012, .012, .01, MAT.cyan, 'led', 12), 0, .18, .405, Math.PI / 2));
  root.add(at(cyl(.015, .015, .01, MAT.dark, 'cam', 12), .25, .18, .405, Math.PI / 2));
  return root;
}

/** warehouse shelf pod (1 m square, 2.2 m tall, clearance 0.35 m for the drive unit to slide under). Nodes: shelf0..4, bin0..N (fabric bins, mixed sizes), box0.. */
export function shelfPod() {
  const root = grp('shelfPod'); const F = MAT2.graphite;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => root.add(at(bx(.05, 2.2, .05, .01, F), x * .475, 1.1, z * .475)));
  for (let i = 0; i < 5; i++) {
    const y = .38 + i * .44; root.add(at(bx(1, .025, 1, .01, MAT2.gray, 'shelf' + i), 0, y, 0));
    if (i === 4) continue;
    let x = -.46, n = 0; const cols = [MAT2.fabric, M(0x5d6b8a, .9), M(0x6f5e8a, .9), M(0x4f6e7a, .9)];
    while (x < .4) { const w = [.22, .3, .44][(i * 3 + n) % 3]; if (x + w > .47) break;
      for (const z of [-.25, .25]) root.add(at(bx(w - .02, .34, .46, .02, cols[(i + n + (z > 0)) % 4], 'bin' + (i * 10 + n) + (z > 0 ? 'b' : 'a')), x + w / 2, y + .18, z));
      x += w; n++; }
  }
  root.add(at(bx(1, .16, .02, .01, M(0xf1f3f7, .6), 'label'), 0, 2.27, .5));
  return root;
}

/** generic robotaxi (no brand), 4.7 m long, faces +z. Nodes: body, cabin (glass), lidar (roof dome: spin .y), lidarHead, cam0..5 (sensor pods), radar (front),
 * wheel0..3 (spin .x: FL FR BL BR), headL/headR + tailL/tailR (solid, light emissive), stripe. Paint the shell with .material.color if needed. */
export function robotaxi() {
  const W = MAT2.white, D = MAT2.graphite;
  const root = grp('robotaxi'); const body = grp('body'); root.add(body);
  body.add(at(rbox(1.86, .62, 4.7, .26, W, 'shell'), 0, .62, 0));
  body.add(at(rbox(1.7, .5, 2.5, .3, MAT2.winGlass, 'cabin'), 0, 1.12, -.15));
  body.add(at(rbox(1.66, .06, 2.0, .03, W, 'roof'), 0, 1.38, -.2));
  body.add(at(rbox(1.88, .06, 3.2, .02, MAT.cyan, 'stripe'), 0, .55, 0));
  body.add(at(rbox(1.9, .16, 4.72, .06, D, 'rocker'), 0, .36, 0));
  [-1, 1].forEach(s => { body.add(at(rbox(.36, .06, .04, .02, Object.assign(M(0xf4f7ff, .3), {emissive: new THREE.Color(0xdfe8ff), emissiveIntensity: .4}), s < 0 ? 'headL' : 'headR'), s * .62, .74, 2.35));
    body.add(at(rbox(.4, .06, .04, .02, Object.assign(M(0xb02a3a, .4), {emissive: new THREE.Color(0x6a1020), emissiveIntensity: .5}), s < 0 ? 'tailL' : 'tailR'), s * .6, .78, -2.35)); });
  body.add(at(rbox(.5, .1, .04, .02, D, 'radar'), 0, .5, 2.36));
  const lid = joint('lidar', [0, 1.41, -.1], at(cyl(.2, .22, .08, D, 'lidarBase', 32), 0, .04, 0)); body.add(lid);
  const lh = joint('lidarHead', [0, .08, 0], at(cyl(.15, .15, .16, MAT2.visor, null, 32), 0, .08, 0), at(cyl(.152, .152, .02, MAT.cyan, null, 32), 0, .11, 0), at(cyl(.12, .14, .03, W, null, 32), 0, .175, 0)); lid.add(lh);
  [[.95, 1.0, 1.15], [-.95, 1.0, 1.15], [.95, 1.0, -1.4], [-.95, 1.0, -1.4], [.7, 1.43, .75], [-.7, 1.43, .75]].forEach(([x, y, z], i) =>
    body.add(grp('cam' + i, at(rbox(.12, .12, .16, .04, D), x, y, z), at(cyl(.03, .03, .01, MAT2.visor, null, 16), x + Math.sign(x) * .061, y, z, 0, 0, Math.PI / 2))));
  [[-.84, 1.45], [.84, 1.45], [-.84, -1.5], [.84, -1.5]].forEach(([x, z], i) => { const w = tire(.36, .26, 'wheel' + i); at(w, x, .36, z); root.add(w); });
  return root;
}

/** generic warehouse forklift with a pallet of boxes, ~2.2 m tall. Nodes: forks (raise .position.y 0 → 1.5; carries 'pallet'), mast, wheel0..3, seat, guard, beacon (solid amber). */
export function forklift() {
  const Y = MAT2.amber, D = MAT2.graphite;
  const root = grp('forklift');
  root.add(at(rbox(1.1, .7, 1.9, .12, Y, 'chassis'), 0, .55, -.1));
  root.add(at(rbox(1.1, .55, .45, .14, D, 'counterweight'), 0, .62, -1.0));
  root.add(at(rbox(.5, .12, .5, .05, D, 'seat'), 0, .98, -.35));
  root.add(at(rbox(.45, .5, .1, .05, D), 0, 1.2, -.58));
  const gd = grp('guard'); root.add(gd);
  [[-.5, .25], [.5, .25], [-.5, -.75], [.5, -.75]].forEach(([x, z]) => gd.add(at(rbox(.05, 1.3, .05, .01, D), x, 1.55, z)));
  gd.add(at(rbox(1.08, .05, 1.08, .02, D), 0, 2.2, -.25));
  gd.add(at(cyl(.06, .06, .1, MAT.orange, 'beacon', 16), 0, 2.28, -.6));
  const mast = joint('mast', [0, 0, .9]); root.add(mast);
  [-1, 1].forEach(s => mast.add(at(rbox(.08, 2.1, .1, .01, MAT2.gray), s * .32, 1.12, 0)));
  mast.add(at(rbox(.72, .06, .08, .01, MAT2.gray), 0, 2.15, 0));
  const forks = joint('forks', [0, 0, 0]); mast.add(forks);
  forks.add(at(rbox(.8, .4, .05, .01, D, 'carriage'), 0, .32, .08));
  [-1, 1].forEach(s => forks.add(at(rbox(.1, .04, 1.1, .01, D), s * .25, .12, .62)));
  const pal = grp('pallet'); forks.add(pal);
  pal.add(at(rbox(1.0, .12, 1.1, .01, MAT2.wood), 0, .2, .66));
  [[-.25, -.25], [.25, -.25], [-.25, .27], [.25, .27]].forEach(([x, z], i) => pal.add(at(rbox(.46, .4, .5, .02, M(0xb08a5e, .9), 'box' + i), x, .47, .66 + z)));
  [[-.42, .9], [.42, .9], [-.42, -.75], [.42, -.75]].forEach(([x, z], i) => { const w = tire(.24, .2, 'wheel' + i); at(w, x * 1.2, .24, z); root.add(w); });
  return root;
}

/** hobby servo motor (real size 40×20×38 mm → scale 10–20 for hero shots). Nodes: horn (output arm: rotate .y), shell (make transparent for x-ray),
 * insides: motor, gear0..3 (rotate .y alternately), pot (position sensor), board (control chip), wires (3: brown/red/orange). */
export function servo() {
  const root = grp('servo'); const s = 1;
  root.add(at(rbox(.04, .032, .02, .002, M(0x2a3040, .5, .1), 'shell'), 0, .016, 0));
  root.add(at(rbox(.055, .0025, .02, .001, M(0x2a3040, .5, .1), 'tabs'), 0, .026, 0));
  root.add(at(rbox(.04, .006, .02, .002, M(0x353c4e, .5, .1), 'cap'), 0, .035, 0));
  root.add(at(cyl(.005, .005, .006, MAT2.white, null, 20), .01, .041, 0));
  const horn = joint('horn', [.01, .044, 0], at(cyl(.006, .006, .003, MAT2.white, null, 20), 0, 0, 0), at(rbox(.032, .003, .007, .0035, MAT2.white, 'arm'), .01, 0, 0)); root.add(horn);
  const ins = grp('insides'); root.add(ins);
  ins.add(at(cyl(.0065, .0065, .02, MAT2.gray, 'motor', 20), -.008, .013, 0));
  [[.01, .029, .0075], [-.002, .027, .005], [.006, .024, .0045], [-.008, .025, .004]].forEach(([x, y, r], i) => ins.add(at(cyl(r, r, .002, i % 2 ? MAT2.copper : MAT2.white, 'gear' + i, 24), x, y, 0)));
  ins.add(at(cyl(.004, .004, .008, MAT.cyan, 'pot', 16), .01, .012, 0));
  ins.add(at(rbox(.03, .001, .016, .0005, MAT2.pcb, 'board'), 0, .004, 0));
  ins.add(at(rbox(.005, .001, .005, .0005, MAT.dark, 'chip'), -.005, .0048, 0));
  [0x7a4a2a, 0xc0392b, 0xe08a2a].forEach((c, i) => { const w = new THREE.CatmullRomCurve3([new THREE.Vector3(-.02, .006, -.004 + i * .004), new THREE.Vector3(-.035, .005, -.004 + i * .004), new THREE.Vector3(-.06, .003, -.006 + i * .006)]);
    root.add(mesh(new THREE.TubeGeometry(w, 10, .0008, 6), M(c, .7), 'wire' + i)); });
  return root;
}

/** factory / warehouse hall backdrop (interior corner: back wall + left wall + roof trusses + floor markings), 24 × 10 m, 9 m high. Camera looks from +z.
 * Nodes: backWall, sideWall, windows (high strip, light emissive glass), columns, trusses, crane (overhead crane beam: slide .position.x), floorLines, door (roller door). */
export function factoryHall() {
  const root = grp('factoryHall'); const P = MAT2.panel, St = M(0x4a5468, .5, .5);
  const W = 24, Dp = 10, H = 9;
  const back = grp('backWall'); root.add(back);
  for (let x = -W / 2; x < W / 2 - .01; x += .4) back.add(at(bx(.36, H - 3, .06, .01, x % 1.2 === 0 ? P : P, null), x + .2, (H - 3) / 2, -Dp / 2));
  back.add(at(bx(W, 3, .2, .02, MAT2.concrete, 'plinth'), 0, -1.5 + 3, -Dp / 2 - .1).translateY(-1.5));
  const win = Object.assign(M(0xaebfd8, .2, .1), {emissive: new THREE.Color(0x7d93b8), emissiveIntensity: .35});
  const wins = grp('windows'); root.add(wins);
  for (let x = -W / 2 + 1.5; x < W / 2 - 1; x += 3) wins.add(at(bx(2.4, 1.2, .08, .02, win), x, H - 1.6, -Dp / 2 + .05));
  const door = at(grp('door'), 6, 0, -Dp / 2 + .06); root.add(door);
  for (let y = .1; y < 4.4; y += .18) door.add(at(bx(4, .16, .05, .01, MAT2.gray), 0, y, 0));
  door.add(at(bx(4.3, .3, .1, .02, MAT2.amber), 0, 4.55, 0));
  const side = grp('sideWall'); root.add(side);
  for (let z = -Dp / 2; z < Dp / 2 - .01; z += .4) side.add(at(bx(.06, H - 3, .36, .01, P), -W / 2, 3 + (H - 3) / 2 - 3, z + .2));
  const cols = grp('columns'); root.add(cols);
  for (let x = -W / 2 + 4; x < W / 2; x += 6) cols.add(at(bx(.35, H, .35, .02, St), x, H / 2, -Dp / 2 + .4));
  const tr = grp('trusses'); root.add(tr);
  for (let x = -W / 2 + 4; x < W / 2; x += 6) { tr.add(at(bx(.18, .5, Dp, .02, St), x, H - .25, 0)); }
  tr.add(at(bx(W, .3, .2, .02, St), 0, H - .8, -Dp / 2 + .5));
  const crane = joint('crane', [0, H - 1.3, 0], at(bx(.4, .5, Dp - .6, .03, MAT2.amber, 'beam'), 0, 0, 0), at(bx(.6, .4, .6, .04, MAT2.graphite, 'trolley'), 0, -.4, 0), at(cyl(.02, .02, 3, MAT.steel, 'hook', 8), 0, -2.1, 0)); root.add(crane);
  const fl = grp('floorLines'); root.add(fl);
  [-3, 3].forEach(z => fl.add(at(bx(W - 2, .005, .12, .002, MAT2.yellowLine), 0, .003, z)));
  return root;
}

// ---------- lab series kit (Media pro 2026-11-12, for 'המעבדה של העוקבים') ----------
/** workbench 1.8×0.8 m, top 0.92 m. Nodes: top, monitor + 'screen' (plane → st.screen, aspect 16:9), vise (jaw 'viseJaw' .position.x), drawer0..2 (.position.z to open), pegboard with tools, lamp (arm 'lampArm' .rotation.z), parts0..5 small bins. */
export function workbench() {
  const W = MAT2.white, D = MAT2.graphite, root = grp('workbench');
  root.add(at(bx(1.8, .05, .8, .01, MAT2.wood, 'top'), 0, .9, 0));
  [[-.85, -.35], [.85, -.35], [-.85, .35], [.85, .35]].forEach(([x, z]) => root.add(at(bx(.05, .88, .05, 0, D), x, .44, z)));
  root.add(at(bx(1.7, .03, .7, 0, D, 'shelf'), 0, .18, 0));
  const cab = at(grp('cabinet'), .55, 0, 0); root.add(cab);
  cab.add(at(bx(.55, .62, .7, 0, MAT2.gray), 0, .55, 0));
  for (let i = 0; i < 3; i++) { const d = joint('drawer' + i, [0, .75 - i * .2, .36], at(bx(.5, .17, .03, 0, W), 0, 0, 0), at(bx(.16, .02, .03, 0, D, 'handle'), 0, 0, .025)); cab.add(d); }
  // pegboard + tools
  const pb = at(grp('pegboard'), 0, 0, -.38); root.add(pb);
  pb.add(at(bx(1.8, .9, .02, 0, M(0x5b6478, .8)), 0, 1.4, 0));
  for (let x = -.85; x <= .86; x += .1) for (let y = 1.0; y < 1.84; y += .1) pb.add(at(cyl(.006, .006, .022, MAT.dark, null, 6), x, y, .005, Math.PI / 2));
  const tool = (x, y, h, m) => pb.add(at(rbox(.03, h, .02, .008, m), x, y, .025));
  tool(-.75, 1.5, .26, MAT.orange); tool(-.68, 1.52, .22, MAT.cyan); tool(-.61, 1.5, .24, D); tool(-.54, 1.53, .2, MAT.steel);
  pb.add(at(mesh(new THREE.TorusGeometry(.07, .012, 8, 24), D, 'tapeRoll'), -.3, 1.55, .03));
  pb.add(at(rbox(.18, .1, .04, .01, MAT.orange, 'drill'), -.05, 1.6, .04)); pb.add(at(rbox(.04, .14, .04, .01, D), -.1, 1.5, .04));
  // monitor
  const mon = at(grp('monitor'), -.45, .925, -.2); root.add(mon);
  mon.add(at(rbox(.22, .015, .15, .005, D), 0, .008, 0)); mon.add(at(bx(.04, .25, .03, 0, D), 0, .14, -.02));
  mon.add(at(rbox(.62, .37, .03, .01, D, 'bezel'), 0, .42, 0, -.05));
  const scr = mesh(new THREE.PlaneGeometry(.58, .326), MAT.screen.clone(), 'screen'); mon.add(at(scr, 0, .42, .017, -.05));
  // vise
  const vise = at(grp('vise'), .75, .925, .2); root.add(vise);
  vise.add(at(bx(.16, .06, .1, 0, MAT.steel), 0, .03, 0)); vise.add(at(bx(.03, .08, .1, 0, MAT2.gray, 'viseFixed'), .065, .1, 0));
  vise.add(at(grp('viseJaw', at(bx(.03, .08, .1, 0, MAT2.gray), 0, 0, 0)), -.03, .1, 0));
  vise.add(at(cyl(.008, .008, .16, MAT.steel, 'screw', 8), -.1, .06, 0, 0, 0, Math.PI / 2));
  // lamp
  const lamp = at(grp('lamp'), .85, .925, -.3); root.add(lamp);
  lamp.add(at(cyl(.07, .08, .02, D), 0, .01, 0));
  const la = joint('lampArm', [0, .02, 0], link(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-.12, .45, 0), .012, D)); lamp.add(la);
  la.add(at(link(new THREE.Vector3(-.12, .45, 0), new THREE.Vector3(-.35, .5, .05), .012, D), 0, 0, 0));
  la.add(at(cyl(.03, .07, .08, W, 'lampHead', 24), -.37, .46, .06, 0, 0, .3));
  la.add(at(cyl(.06, .06, .005, MAT.lampface, 'lampFace', 24), -.38, .42, .06, 0, 0, .3));
  // parts bins
  for (let i = 0; i < 6; i++) root.add(at(rbox(.1, .06, .14, .01, i % 2 ? MAT.cyan : MAT2.gray, 'parts' + i), -.85 + .1 + i * .11, .955, .28));
  return root;
}

/** FDM 3D printer (generic cube frame, 0.5 m). Nodes: gantry (.position.y, 0.12–0.42), head (.position.x −0.17..0.17 on gantry), nozzle, bed (.position.z −0.12..0.12), print (on bed — scale .y 0→1 to "grow"), spool (.rotation.z), screen (plane, aspect 1.6). */
export function printer3d() {
  const D = MAT2.graphite, root = grp('printer3d');
  const S = .5, t = .025;
  root.add(at(rbox(S, .06, S, .01, D, 'base'), 0, .03, 0));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => root.add(at(bx(t, S, t, 0, MAT2.gray), a * (S / 2 - t / 2), .06 + S / 2, b * (S / 2 - t / 2))));
  [-1, 1].forEach(b => { root.add(at(bx(S, t, t, 0, MAT2.gray), 0, .06 + S, b * (S / 2 - t / 2))); root.add(at(bx(t, t, S, 0, MAT2.gray), b * (S / 2 - t / 2), .06 + S, 0)); });
  const bed = joint('bed', [0, .1, 0], at(rbox(.36, .012, .36, .004, M(0x1d2330, .3, .4), 'bedPlate'), 0, 0, 0), at(bx(.34, .002, .34, 0, M(0x2a3346, .6), 'bedSheet'), 0, .007, 0)); root.add(bed);
  const pr = joint('print', [0, .008, 0], at(rbox(.1, .12, .1, .015, MAT.cyan, 'printPart'), 0, .06, 0)); bed.add(pr);
  const gan = joint('gantry', [0, .3, 0], at(bx(S - .02, .02, .03, 0, MAT.steel, 'rail'), 0, 0, 0)); root.add(gan);
  const head = joint('head', [0, 0, .035], at(rbox(.07, .08, .06, .01, MAT2.white, 'carriage'), 0, -.01, 0), at(rbox(.02, .05, .04, .004, MAT.cyan, 'fanStripe'), .036, -.01, 0)); gan.add(head);
  head.add(at(cyl(.004, .012, .03, MAT2.copper, 'nozzle', 12), 0, -.065, 0));
  const sp = joint('spool', [0, .45, -.3], at(cyl(.1, .1, .06, MAT.orange, 'filament', 32), 0, 0, 0, 0, 0, Math.PI / 2), at(cyl(.11, .11, .005, D, null, 32), .033, 0, 0, 0, 0, Math.PI / 2), at(cyl(.11, .11, .005, D, null, 32), -.033, 0, 0, 0, 0, Math.PI / 2)); root.add(sp);
  root.add(at(bx(.02, .2, .02, 0, D), 0, .35, -.27));
  root.add(at(rbox(.12, .075, .02, .006, D, 'panel'), .15, .06, S / 2 + .005, -.4));
  root.add(at(mesh(new THREE.PlaneGeometry(.1, .0625), MAT.screen.clone(), 'screen'), .15, .062, S / 2 + .017, -.4));
  return root;
}

/** charging wall: 5 bays (1 m each, 2.2 m tall). Per bay i: pad{i} (floor pad, cyan ring 'ring{i}'), plate{i} (name plate plane, aspect 3 → st.screen with a Hebrew name), bar{i} (charge bar — scale .x 0..1), plug{i}. */
export function chargingWall(n = 5) {
  const D = MAT2.graphite, root = grp('chargingWall'), w = 1;
  root.add(at(bx(n * w + .2, 2.4, .12, 0, M(0x2c3344, .7), 'wall'), 0, 1.2, -.06));
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * w, bay = at(grp('bay' + i), x, 0, 0); root.add(bay);
    bay.add(at(rbox(.82, 1.9, .05, .02, M(0x3a4356, .6), 'back' + i), 0, 1.05, .03));
    bay.add(at(mesh(new THREE.PlaneGeometry(.6, .2), MAT.screen.clone(), 'plate' + i), 0, 1.85, .06));
    bay.add(at(rbox(.64, .24, .02, .01, D, 'plateFrame' + i), 0, 1.85, .045));
    bay.add(at(rbox(.5, .05, .02, .01, MAT.dark, 'barBg' + i), 0, 1.6, .06));
    const bar = joint('bar' + i, [-.24, 1.6, .072], at(bx(.48, .034, .01, 0, MAT.cyan, 'barFill' + i), .24, 0, 0)); bay.add(bar);
    bay.add(at(rbox(.12, .18, .08, .02, MAT2.white, 'plug' + i), .3, .9, .09));
    bay.add(at(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(.3, .82, .1), new THREE.Vector3(.32, .5, .2), new THREE.Vector3(.2, .12, .3)]), 16, .012, 6), MAT.rubber, 'cable' + i)));
    bay.add(at(cyl(.36, .38, .03, D, 'pad' + i, 40), 0, .015, .55));
    bay.add(at(mesh(new THREE.TorusGeometry(.3, .012, 8, 48), MAT.cyan, 'ring' + i), 0, .032, .55, Math.PI / 2));
  }
  return root;
}

/** lab room: corner backdrop 8×5 m, 3.2 m high (back wall + left wall), camera from +z. Nodes: backWall, sideWall, window (cool daylight panel), shelves (with boxes), whiteboard ('board' plane, aspect 2 → st.screen), ceilingLights, floor (epoxy grey + safety lines 'floorLines'). */
export function labRoom() {
  const root = grp('labRoom'), W = 8, Dp = 5, H = 3.2, wall = M(0x4a5266, .85), D = MAT2.graphite;
  root.add(at(bx(W, .02, Dp, 0, M(0x3a4050, .5, .1), 'floor'), 0, -.01, 0));
  const fl = grp('floorLines'); root.add(fl);
  fl.add(at(bx(W - .6, .004, .08, 0, MAT2.yellowLine), 0, .002, .8));
  root.add(at(bx(W, H, .1, 0, wall, 'backWall'), 0, H / 2, -Dp / 2));
  root.add(at(bx(.1, H, Dp, 0, wall, 'sideWall'), -W / 2, H / 2, 0));
  root.add(at(bx(W, .12, .02, 0, D, 'skirting'), 0, .06, -Dp / 2 + .06));
  // window on side wall
  const win = Object.assign(M(0xaec3e0, .2, .1), {emissive: new THREE.Color(0x8aa0c4), emissiveIntensity: .3});
  root.add(at(bx(.04, 1.3, 2.2, 0, win, 'window'), -W / 2 + .06, 1.8, .3));
  [-.8, .3, 1.4].forEach(z => root.add(at(bx(.06, 1.36, .05, 0, D), -W / 2 + .08, 1.8, z)));
  // whiteboard
  root.add(at(rbox(2.06, 1.06, .04, .01, MAT2.gray, 'boardFrame'), 1.2, 1.65, -Dp / 2 + .07));
  root.add(at(mesh(new THREE.PlaneGeometry(2, 1), M(0xe8ecf2, .4), 'board'), 1.2, 1.65, -Dp / 2 + .095));
  // shelves with boxes
  const sh = at(grp('shelves'), -2.6, 0, -Dp / 2 + .25); root.add(sh);
  [-.7, .7].forEach(x => sh.add(at(bx(.04, 2.2, .4, 0, D), x, 1.1, 0)));
  for (let k = 0; k < 4; k++) { const y = .35 + k * .55; sh.add(at(bx(1.44, .03, .4, 0, MAT2.gray), 0, y, 0));
    for (let j = 0; j < 3; j++) sh.add(at(rbox(.36, .26, .3, .02, [MAT2.white, MAT.cyan, MAT2.fabric, MAT.orange][(k + j) % 4], 'box' + k + j), -.45 + j * .45, y + .145, 0)); }
  // ceiling light strips (soft, no glow halo)
  const cl = grp('ceilingLights'); root.add(cl);
  [-1.5, 1.5].forEach(z => cl.add(at(bx(W - 1, .04, .14, 0, MAT.lampface), .2, H - .05, z * .6)));
  // pipes
  root.add(at(cyl(.04, .04, W, MAT.steel, 'pipe', 12), 0, H - .3, -Dp / 2 + .15, 0, 0, Math.PI / 2));
  return root;
}

/** autonomous electric tractor / farm robot (generic, cab-less, 3.6 m). Nodes: wheelFL/FR/BL/BR (.x), lidar ('lidarHead' .y spin), cam0..3, hitch, sprayer (boom 'boomL'/'boomR' .rotation.z to fold), beacon. */
export function farmRobot() {
  const W = MAT2.white, D = MAT2.graphite, root = grp('farmRobot');
  root.add(at(rbox(2.4, .7, 1.2, .18, W, 'body'), 0, 1.15, 0));
  root.add(at(rbox(1.6, .3, 1.0, .12, D, 'battery'), -.1, 1.62, 0));
  root.add(at(bx(2.3, .06, .02, 0, MAT.cyan, 'stripeL'), 0, 1.05, .61)); root.add(at(bx(2.3, .06, .02, 0, MAT.cyan, 'stripeR'), 0, 1.05, -.61));
  // tires: axis along z
  [['wheelFL', .9, .85, .55], ['wheelFR', .9, -.85, .55], ['wheelBL', -.9, .85, .7], ['wheelBR', -.9, -.85, .7]].forEach(([n, x, z, r]) => {
    const g = grp(n); g.add(at(cyl(r, r, .45, MAT2.tire, null, 32), 0, 0, 0, Math.PI / 2)); g.add(at(cyl(r * .42, r * .42, .46, MAT2.graphite, null, 20), 0, 0, 0, Math.PI / 2)); g.add(at(cyl(r * .14, r * .14, .48, MAT.cyan, null, 12), 0, 0, 0, Math.PI / 2));
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; g.add(at(bx(.08, .04, .44, 0, MAT2.tire), Math.cos(a) * r, Math.sin(a) * r, 0, 0, 0, a)); }
    at(g, x, r, z); root.add(g); });
  const li = joint('lidar', [.95, 1.62, 0], at(cyl(.1, .1, .12, D, 'lidarBase', 24), 0, .06, 0)); root.add(li);
  li.add(joint('lidarHead', [0, .16, 0], at(cyl(.08, .08, .08, MAT.cyan, null, 24), 0, 0, 0)));
  [[1.21, 1.2, .3], [1.21, 1.2, -.3], [-1.21, 1.2, .3], [-1.21, 1.2, -.3]].forEach(([x, y, z], i) => root.add(at(rbox(.06, .08, .1, .02, MAT.dark, 'cam' + i), x, y, z)));
  root.add(at(cyl(.05, .06, .08, MAT.orange, 'beacon', 16), -.6, 1.81, .35));
  root.add(at(bx(.3, .1, .2, 0, D, 'hitch'), -1.3, .75, 0));
  const sp = joint('sprayer', [-1.55, .9, 0], at(rbox(.25, .5, .9, .04, D, 'tank'), 0, .1, 0)); root.add(sp);
  ['boomL', 'boomR'].forEach((n, k) => { const s = k ? -1 : 1; const b = joint(n, [0, -.05, s * .45], at(bx(.05, .05, 2.2, 0, MAT.steel), 0, 0, s * 1.1)); for (let j = 1; j < 6; j++) b.add(at(cyl(.015, .02, .08, MAT.cyan, null, 8), 0, -.06, s * j * .4)); sp.add(b); });
  return root;
}

// ================= 2026-11-14 batch (Media pro run 6): 'הבית בעוד 30 שנה' luxury villa kit (ep014+), hero-ready indigo palette =================
// All pieces are already in the hero palette → use st.prop(name, {tint: 1}) and DON'T run an indigo() recolour on them (it would kill the glass transparency).
const HM = { wall: M(0x3b3f8a, .85), cap: M(0x5a5fb0, .8), wood: M(0x34377a, .8), wood2: M(0x2c2f6e, .8), stone: M(0x2a2d68, .7, .05), dark: M(0x17193f, .8),
  light: M(0xd9ddf7, .55), mid: M(0x6c72c6, .75), fab: M(0x4b50a0, .95), fab2: M(0x7a80d0, .95), metal: M(0x9aa0d8, .35, .6), acc: M(0x8ea6ff, .5),
  leaf: M(0x4a6aa8, .9), soil: M(0x1d1f4a, .95), tile: M(0x5d86e0, .45), orange: M(0xffa53a, .6),
  glass: Object.assign(M(0xa9bcff, .08, .1), {transparent: true, opacity: .22, depthWrite: false}),
  frost: Object.assign(M(0xc9d1ff, .9), {transparent: true, opacity: .62}),
  water: Object.assign(M(0x6f93f0, .1, .15), {transparent: true, opacity: .88}) };
const hb = (w, h, d, m, x, y, z, name) => at(bx(w, h, d, 0, m, name), x, y, z);
const glassPane = (w, h, name) => { const g = grp(name); g.add(at(bx(w, h, .02, 0, HM.glass), 0, h / 2, 0)); g.add(at(bx(w, .04, .05, 0, HM.metal), 0, h, 0)); g.add(at(bx(w, .04, .05, 0, HM.metal), 0, .02, 0));
  for (const x of [-w / 2, w / 2]) g.add(at(bx(.04, h, .05, 0, HM.metal), x, h / 2, 0)); g.traverse(o => { if (o.isMesh && o.material === HM.glass) o.castShadow = false; }); return g; };
/** padlock (3D, matte): body + shackle. ~0.5 m tall at scale 1. */
function padlock(name = 'lock') { const g = grp(name); g.add(at(rbox(.36, .28, .12, .05, HM.light, 'lockBody'), 0, .14, 0));
  g.add(at(mesh(new THREE.TorusGeometry(.11, .028, 10, 32, Math.PI), HM.metal, 'shackle'), 0, .28, 0));
  g.add(at(cyl(.03, .03, .13, HM.dark, 'keyhole', 16), 0, .15, 0, Math.PI / 2)); return g; }

/** luxury villa shell, dollhouse cutaway (walls cut at 1.1 m), 16×10 m, front (+z) open with a glass railing; camera from above/front.
 * Rooms (floor_* nodes): front row living x−8..−2, dining −2..2, kitchen 2..8; back row bedroom −8..−3, HIDDEN rooms hiddenA −3..2.5 and hiddenB 2.5..8 (z −5..0).
 * Hidden rooms: frosted glass roofs 'hiddenRoofA/B' (hide to 'open' a room), padlocks 'lockA/lockB' on top, 'sealedDoorA/B' in the middle wall. Back wall has glass window strips (winBack0..3).
 * Front terrace 'terrace' (z 5..7). Sliding glass doors 'slideL'/'slideR' (move .position.x). */
export function villa() {
  const root = grp('villa'), H = 1.1, T = .14;
  const fl = (w, d, x, z, m, n) => root.add(hb(w, .08, d, m, x, .04, z, n));
  fl(6, 5, -5, 2.5, HM.wood, 'floor_living'); fl(4, 5, 0, 2.5, HM.wood, 'floor_dining'); fl(6, 5, 5, 2.5, HM.stone, 'floor_kitchen');
  fl(5, 5, -5.5, -2.5, HM.wood2, 'floor_bedroom'); fl(5.5, 5, -.25, -2.5, HM.dark, 'floor_hiddenA'); fl(5.5, 5, 5.25, -2.5, HM.dark, 'floor_hiddenB');
  // parquet lines on wood floors (subtle)
  for (const [x0, w] of [[-8, 10]]) for (let i = 1; i < 25; i++) root.add(hb(.01, .003, 4.9, HM.wood2, x0 + i * .4, .081, 2.5));
  root.add(hb(16.4, .12, 2.2, HM.stone, 0, .06, 6.1, 'terrace'));
  const wall = (w, d, x, z, n) => { root.add(hb(w, H, d, HM.wall, x, H / 2 + .08, z, n)); root.add(hb(w + .004, .03, d + .004, HM.cap, x, H + .095, z)); };
  // back wall with 4 window strips (glass between wall pieces)
  const segs = [[-8, -6.6], [-5.2, -3.6], [-2.2, 1.2], [2.6, 4.4], [5.8, 8]]; segs.forEach(([a, b], i) => wall(b - a, T, (a + b) / 2, -5, 'wallBack' + i));
  [[-6.6, -5.2], [-3.6, -2.2], [1.2, 2.6], [4.4, 5.8]].forEach(([a, b], i) => { const g = at(glassPane(b - a, H, 'winBack' + i), (a + b) / 2, .08, -5); root.add(g); });
  wall(T, 4, -8, -3); root.add(at(glassPane(3.6, H, 'winLeft'), -8, .08, 3.2)); root.children.at(-1).rotation.y = Math.PI / 2; wall(T, 1.4, -8, .2);
  wall(T, 10, 8, 0, 'wallRight');
  // middle wall z=0: bedroom doorway x −6.6..−5.6; sealed doors into the hidden rooms
  [[-8, -6.6], [-5.6, -.81], [.31, 4.74], [5.86, 8]].forEach(([a, b]) => wall(b - a, T, (a + b) / 2, 0));
  wall(T, 5, -3, -2.5); wall(T, 5, 2.5, -2.5);                        // back partitions (hidden rooms closed on all sides)
  wall(T, 1.0, -2, .5); wall(T, .8, -2, 4.6); wall(T, 1.0, 2, .5); wall(T, .8, 2, 4.6);  // front stubs = wide openings
  for (const [k, x] of [['A', -.25], ['B', 5.3]]) { const d = sealedDoor(); d.name = 'sealedDoor' + k; at(d, x, .08, .08); root.add(d);
    root.add(at(bx(5.36, .08, 4.86, 0, HM.frost, 'hiddenRoof' + k), x, H + .15, -2.5));
    const lk = padlock('lock' + k); lk.scale.setScalar(2.2); at(lk, x, H + .19, -2.5); root.add(lk); }
  // glass railing along the open front (with gaps for the sliding doors)
  [[-8, -5.6], [-3.4, 3.6], [5.8, 8]].forEach(([a, b]) => root.add(at(glassPane(b - a, .9, 'rail'), (a + b) / 2, .08, 5)));
  const sl = (n, x) => root.add(at(glassPane(1.1, 2.0, n), x, .08, 5.06));
  sl('slideL', -5.0); sl('slideR', 5.2);
  return root;
}
/** sealed door in a wall (1.0×2.1 m): frosted glass panel, steel frame, diagonal 'tape' bands, padlock 'lock'. Faces +z. */
export function sealedDoor() {
  const g = grp('sealedDoor');
  g.add(at(rbox(1.12, 2.16, .1, .02, HM.metal, 'frame'), 0, 1.08, 0)); g.add(at(bx(.96, 2.0, .06, 0, HM.frost, 'panel'), 0, 1.04, .03));
  for (const s of [1, -1]) g.add(at(bx(1.25, .12, .02, 0, HM.acc, 'tape'), 0, 1.15, .08, 0, 0, s * .9));
  const lk = padlock('lock'); lk.scale.setScalar(.6); at(lk, .33, .95, .1); g.add(lk);
  g.add(at(rbox(.04, .3, .05, .02, HM.light, 'handle'), .38, 1.15, .07));
  return g;
}
/** frosted 'locked room' cover: frosted glass box w×d×h with a padlock on top + "?" plate. For any room that isn't open yet. */
export function frostedRoom(w = 4, d = 4, h = 1.1) {
  const g = grp('frostedRoom'); g.add(at(bx(w, h, d, 0, HM.frost, 'box'), 0, h / 2, 0));
  g.add(at(rbox(w + .04, .05, d + .04, .02, HM.metal, 'rim'), 0, h, 0));
  const lk = padlock('lock'); lk.scale.setScalar(2.2); at(lk, 0, h + .03, 0); g.add(lk);
  g.add(at(mesh(new THREE.PlaneGeometry(1.4, 1.4), HM.dark.clone(), 'plate'), 0, h + .03, d / 2 - .9, -Math.PI / 2));
  return g;
}
/** raised infinity-style pool 7×3.4 m on a deck 10×6 m (deck top 0.35 m). Nodes: deck, water (40×20 segments: wave .position z of vertices), basin, steps, ladder, coping, poolLight0..3 (solid accent), edge. */
export function pool() {
  const g = grp('pool'), W = 7, D = 3.4, top = .35;
  // deck = 4 slabs around the hole
  const DW = 10, DD = 6;
  g.add(hb(DW, top, (DD - D) / 2, HM.wood, 0, top / 2, -(D / 2 + (DD - D) / 4), 'deck'));
  g.add(hb(DW, top, (DD - D) / 2, HM.wood, 0, top / 2, (D / 2 + (DD - D) / 4), 'deck2'));
  g.add(hb((DW - W) / 2, top, D, HM.wood, -(W / 2 + (DW - W) / 4), top / 2, 0, 'deck3')); g.add(hb((DW - W) / 2, top, D, HM.wood, (W / 2 + (DW - W) / 4), top / 2, 0, 'deck4'));
  for (let i = 1; i < 25; i++) { const x = -DW / 2 + i * .4; if (Math.abs(x) > W / 2 + .05) g.add(hb(.012, .004, DD, HM.wood2, x, top + .002, 0)); else for (const s of [1, -1]) g.add(hb(.012, .004, (DD - D) / 2, HM.wood2, x, top + .002, s * (D / 2 + (DD - D) / 4))); }
  const bas = grp('basin'); g.add(bas);
  bas.add(hb(W, .04, D, HM.tile, 0, .02, 0, 'basinFloor'));
  for (const s of [1, -1]) { bas.add(hb(W, top, .03, HM.tile, 0, top / 2, s * (D / 2 - .015))); bas.add(hb(.03, top, D, HM.tile, s * (W / 2 - .015), top / 2, 0)); }
  for (let i = -8; i <= 8; i++) bas.add(hb(.01, .002, D - .1, HM.light, i * .4, .045, 0));   // tile lines
  const steps = grp('steps'); g.add(steps); for (let k = 0; k < 3; k++) steps.add(hb(.4 * (3 - k), .1 * (k + 1), D * .5, HM.light, -W / 2 + .2 * (3 - k), .05 * (k + 1), -D / 4));
  const wat = mesh(new THREE.PlaneGeometry(W - .06, D - .06, 40, 20), HM.water, 'water'); at(wat, 0, top - .06, 0, -Math.PI / 2); wat.castShadow = false; g.add(wat);
  const cop = grp('coping'); g.add(cop); for (const s of [1, -1]) { cop.add(hb(W + .3, .05, .15, HM.light, 0, top + .025, s * (D / 2 + .075))); cop.add(hb(.15, .05, D, HM.light, s * (W / 2 + .075), top + .025, 0)); }
  const lad = grp('ladder'); g.add(at(lad, W / 2 - .45, 0, D / 2 - .05));
  for (const x of [-.22, .22]) { lad.add(at(cyl(.022, .022, .6, HM.metal, null, 12), x, top + .3, 0)); lad.add(at(mesh(new THREE.TorusGeometry(.14, .022, 8, 16, Math.PI), HM.metal), x, top + .6, -.14, 0, Math.PI / 2)); lad.add(at(cyl(.022, .022, .55, HM.metal, null, 12), x, top + .3, -.28)); }
  for (let k = 0; k < 2; k++) lad.add(at(bx(.44, .03, .08, 0, HM.metal), 0, .1 + k * .12, -.28));
  [-2.4, -.8, .8, 2.4].forEach((x, i) => g.add(at(rbox(.18, .1, .02, .02, HM.acc, 'poolLight' + i), x, .2, -D / 2 + .035)));
  return g;
}
/** round hot tub Ø2.1 m, 0.8 m high, wood cladding, water 'water', jet bubbles 'bubble0..11' (animate .position.y / scale), step 'step'. */
export function hotTub() {
  const g = grp('hotTub'); g.add(at(cyl(1.05, 1.05, .8, HM.wood, 'shell', 40), 0, .4, 0));
  for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; g.add(at(bx(.02, .8, .02, 0, HM.wood2), Math.cos(a) * 1.055, .4, Math.sin(a) * 1.055)); }
  g.add(at(mesh(new THREE.TorusGeometry(.98, .07, 10, 48), HM.light, 'rim'), 0, .8, 0, Math.PI / 2));
  g.add(at(cyl(.92, .92, .02, HM.water, 'water', 40), 0, .72, 0)); g.getObjectByName('water').castShadow = false;
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = .3 + (i % 3) * .2; g.add(at(mesh(new THREE.SphereGeometry(.035, 10, 8), HM.light, 'bubble' + i), Math.cos(a) * r, .74, Math.sin(a) * r)); }
  g.add(at(rbox(.8, .25, .4, .05, HM.wood, 'step'), 0, .125, 1.2));
  return g;
}
/** modern sun lounger 2.0 m with cushion and adjustable back 'back' (.rotation.x), side table. */
export function lounger() {
  const g = grp('lounger'); g.add(at(rbox(.75, .1, 1.5, .03, HM.mid, 'frame'), 0, .3, .2));
  for (const x of [-.3, .3]) for (const z of [-.45, .85]) g.add(at(bx(.06, .25, .06, 0, HM.metal), x, .125, z));
  g.add(at(rbox(.68, .08, 1.45, .04, HM.light, 'cushion'), 0, .39, .2));
  const b = joint('back', [0, .35, -.55], at(rbox(.68, .08, .75, .04, HM.light, 'backCushion'), 0, 0, -.37)); b.rotation.x = .75; g.add(b);
  g.add(at(rbox(.4, .04, .4, .02, HM.mid, 'sideTable'), .7, .42, -.2)); g.add(at(cyl(.025, .025, .4, HM.metal, null, 10), .7, .2, -.2));
  return g;
}
/** patio umbrella Ø2.6 m: pole, canopy 'canopy' (8 panels), base. */
export function umbrella() {
  const g = grp('umbrella'); g.add(at(cyl(.3, .32, .1, HM.dark, 'base', 24), 0, .05, 0)); g.add(at(cyl(.025, .025, 2.4, HM.metal, 'pole', 12), 0, 1.2, 0));
  g.add(at(mesh(new THREE.ConeGeometry(1.3, .45, 8, 1, true), Object.assign(HM.light.clone(), {side: THREE.DoubleSide}), 'canopy'), 0, 2.3, 0));
  g.add(at(cyl(.04, .04, .1, HM.acc, 'cap', 12), 0, 2.56, 0)); return g;
}
/** outdoor kitchen 3.2 m: stone counter, built-in grill 'grill' with lid 'lid' (.rotation.x to open), sink, bar stools ×2, pergola beams. */
export function outdoorKitchen() {
  const g = grp('outdoorKitchen'); g.add(at(rbox(3.2, .9, .75, .03, HM.stone, 'counter'), 0, .45, 0)); g.add(at(rbox(3.26, .05, .8, .02, HM.light, 'top'), 0, .925, 0));
  for (let i = 0; i < 4; i++) g.add(at(bx(.7, .7, .02, 0, HM.mid), -1.15 + i * .77, .45, .38));
  const gr = grp('grill'); at(gr, -.6, .95, 0); g.add(gr); gr.add(at(bx(1.0, .06, .55, 0, HM.dark), 0, .03, 0)); for (let i = 0; i < 9; i++) gr.add(at(bx(.012, .012, .5, 0, HM.metal), -.44 + i * .11, .07, 0));
  const lid = joint('lid', [0, .06, -.28], at(mesh(new THREE.CylinderGeometry(.28, .28, 1.0, 20, 1, false, 0, Math.PI), HM.metal), 0, 0, .28, 0, 0, Math.PI / 2)); lid.rotation.x = -1.2; gr.add(lid);
  g.add(at(bx(.5, .04, .35, 0, HM.dark, 'sink'), .8, .93, 0)); g.add(link(new THREE.Vector3(.8, .95, -.25), new THREE.Vector3(.8, 1.2, -.12), .015, HM.metal, 'tap'));
  for (const x of [.3, 1.2]) { const s = grp('stool'); at(s, x, 0, .85); s.add(at(cyl(.2, .2, .06, HM.fab2, null, 20), 0, .72, 0)); s.add(at(cyl(.025, .025, .7, HM.metal, null, 10), 0, .35, 0)); s.add(at(cyl(.18, .18, .02, HM.metal, null, 20), 0, .01, 0)); g.add(s); }
  const per = grp('pergola'); g.add(per); for (const x of [-1.6, 1.6]) for (const z of [-.45, 1.3]) per.add(at(bx(.1, 2.5, .1, 0, HM.wood), x, 1.25, z));
  for (let i = 0; i < 9; i++) per.add(at(bx(.06, .12, 1.95, 0, HM.wood), -1.6 + i * .4, 2.5, .42));
  return g;
}
/** fire pit Ø1.4 m with round bench; flames 'flame0..4' are matte orange shapes (animate .scale.y, no glow). */
export function firePit() {
  const g = grp('firePit'); g.add(at(cyl(.7, .75, .4, HM.stone, 'bowl', 32), 0, .2, 0)); g.add(at(cyl(.55, .55, .02, HM.dark, 'coals', 28), 0, .41, 0));
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const f = mesh(new THREE.ConeGeometry(.09 + (i % 2) * .04, .45 + (i % 3) * .12, 8), HM.orange, 'flame' + i); f.geometry.translate(0, .22, 0); at(f, Math.cos(a) * .15, .42, Math.sin(a) * .15); g.add(f); }
  const bench = mesh(new THREE.TorusGeometry(1.7, .2, 8, 48, Math.PI * 1.3), HM.wood, 'bench'); at(bench, 0, .4, 0, Math.PI / 2, 0, Math.PI * .85); g.add(bench);
  for (let i = 0; i < 6; i++) g.add(at(rbox(.42, .12, .38, .05, HM.fab2, 'pillow' + i), Math.cos(Math.PI * (1.0 + i * .2)) * 1.7, .66, -Math.sin(Math.PI * (1.0 + i * .2)) * 1.7));
  return g;
}
/** kitchen island 2.6×1.0 m with waterfall top, 3 bar stools, 3 pendant lamps 'pendant0..2' (hang from y 2.6). */
export function kitchenIsland() {
  const g = grp('kitchenIsland'); g.add(at(bx(2.6, .88, 1.0, 0, HM.mid, 'base'), 0, .44, 0));
  g.add(at(bx(2.7, .05, 1.1, 0, HM.light, 'top'), 0, .905, 0)); for (const x of [-1.33, 1.33]) g.add(at(bx(.05, .93, 1.1, 0, HM.light), x, .465, 0));
  g.add(at(bx(.6, .02, .4, 0, HM.dark, 'cooktop'), -.6, .935, -.15)); g.add(at(rbox(.35, .12, .35, .04, HM.light, 'bowl'), .5, .99, -.1));
  for (let i = 0; i < 3; i++) { const s = grp('stool' + i); at(s, -.8 + i * .8, 0, .85); s.add(at(rbox(.42, .08, .42, .04, HM.fab2), 0, .72, 0)); s.add(at(rbox(.42, .3, .05, .02, HM.fab2), 0, .9, .2)); s.add(at(cyl(.025, .025, .7, HM.metal, null, 10), 0, .35, 0)); s.add(at(cyl(.2, .2, .02, HM.metal, null, 20), 0, .01, 0)); g.add(s); }
  for (let i = 0; i < 3; i++) { const p = grp('pendant' + i); at(p, -.8 + i * .8, 0, 0); p.add(at(cyl(.006, .006, .9, HM.dark, null, 6), 0, 2.15, 0)); p.add(at(mesh(new THREE.SphereGeometry(.16, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), Object.assign(HM.light.clone(), {side: THREE.DoubleSide})), 0, 1.6, 0)); g.add(p); }
  return g;
}
/** kitchen wall run 4 m: base cabinets, tall fridge column, oven, sink 'sink', wall shelves, plants. Faces +z. */
export function kitchenRun() {
  const g = grp('kitchenRun'); g.add(at(bx(3.0, .88, .65, 0, HM.mid, 'base'), -.5, .44, 0)); g.add(at(bx(3.05, .05, .68, 0, HM.light, 'top'), -.5, .905, 0));
  for (let i = 0; i < 5; i++) g.add(at(bx(.56, .8, .02, 0, HM.fab2), -1.75 + i * .6 - .25 + .25, .45, .335));
  g.add(at(bx(1.0, 2.3, .7, 0, HM.light, 'fridge'), 1.5, 1.15, 0)); g.add(at(bx(.02, 2.2, .02, 0, HM.dark), 1.5, 1.15, .36));
  g.add(at(bx(.6, .5, .02, 0, HM.dark, 'oven'), -1.4, .55, .34)); g.add(at(bx(.5, .03, .4, 0, HM.dark, 'sink'), .3, .925, 0));
  g.add(link(new THREE.Vector3(.3, .93, -.25), new THREE.Vector3(.3, 1.25, -.05), .015, HM.metal, 'tap'));
  g.add(at(bx(2.0, .04, .3, 0, HM.wood, 'shelf'), -.9, 1.55, -.18)); for (let i = 0; i < 5; i++) g.add(at(cyl(.06, .05, .14, [HM.light, HM.acc, HM.fab2][i % 3], 'jar' + i, 14), -1.7 + i * .38, 1.64, -.18));
  return g;
}
/** modern L-sofa 3.2×2.1 m with cushions, throw pillows 'pillow0..3'. Long side faces +z. */
export function sofaModern() {
  const g = grp('sofaModern'), F = HM.fab, C = HM.fab2;
  g.add(at(rbox(3.2, .38, 1.0, .06, F, 'baseLong'), 0, .23, 0)); g.add(at(rbox(1.0, .38, 1.2, .06, F, 'baseShort'), -1.1, .23, 1.1));
  g.add(at(rbox(3.2, .45, .25, .08, F, 'backLong'), 0, .6, -.38)); g.add(at(rbox(.25, .45, 2.1, .08, F, 'backShort'), -1.48, .6, .55));
  for (let i = 0; i < 3; i++) g.add(at(rbox(.9, .14, .75, .06, C, 'seat' + i), -.75 + i * .95, .48, .07)); g.add(at(rbox(.85, .14, 1.0, .06, C, 'seatS'), -1.03, .48, 1.15));
  g.add(at(rbox(.22, .3, 1.0, .08, F, 'armR'), 1.5, .5, 0));
  [[-.9, -.2], [-.2, -.2], [.9, -.2], [-1.25, .8]].forEach(([x, z], i) => g.add(at(rbox(.42, .38, .14, .07, [HM.light, HM.acc, HM.light, HM.mid][i], 'pillow' + i), x, .72, z, -.25, i === 3 ? Math.PI / 2 : 0)));
  for (const [x, z] of [[-1.5, -.45], [1.55, -.45], [1.55, .45], [-1.55, 1.65]]) g.add(at(bx(.05, .06, .05, 0, HM.metal), x, .03, z));
  return g;
}
/** coffee table 1.3×0.7 + books + vase; rug 3×2.2 'rug' included (on y=0). */
export function loungeSet() {
  const g = grp('loungeSet'); g.add(at(rbox(3.0, .015, 2.2, .005, HM.mid, 'rug'), 0, .008, 0));
  g.add(at(rbox(1.3, .06, .7, .03, HM.light, 'table'), 0, .38, 0)); for (const x of [-.55, .55]) g.add(at(bx(.05, .35, .6, 0, HM.metal), x, .175, 0));
  g.add(at(bx(.3, .05, .22, 0, HM.acc, 'book0'), -.3, .435, .05)); g.add(at(bx(.28, .04, .2, 0, HM.fab2, 'book1'), -.3, .48, .05, 0, .2));
  g.add(at(cyl(.07, .05, .22, HM.mid, 'vase', 16), .35, .52, -.05)); return g;
}
/** media wall 3.2 m: low cabinet + slim TV 'tv' with 'screen' plane (16:9 → st.screen) + wall shelves. Faces +z. */
export function mediaWall() {
  const g = grp('mediaWall'); g.add(at(rbox(3.2, .4, .45, .03, HM.mid, 'cabinet'), 0, .25, 0));
  for (let i = 0; i < 4; i++) g.add(at(bx(.76, .32, .02, 0, HM.fab2), -1.2 + i * .8, .25, .23));
  g.add(at(rbox(1.66, .96, .05, .01, HM.dark, 'tv'), 0, 1.35, -.1)); g.add(at(mesh(new THREE.PlaneGeometry(1.6, .9), MAT.screen.clone(), 'screen'), 0, 1.35, -.07));
  g.add(at(rbox(.15, .5, .15, .04, HM.light, 'speakerL'), -1.3, .7, 0)); g.add(at(rbox(.15, .5, .15, .04, HM.light, 'speakerR'), 1.3, .7, 0));
  return g;
}
/** dining table 2.4×1.0 m + 6 chairs (chair0..5), centre bowl. */
export function diningSet() {
  const g = grp('diningSet'); g.add(at(rbox(2.4, .06, 1.0, .02, HM.light, 'top'), 0, .75, 0));
  for (const x of [-1.0, 1.0]) g.add(at(bx(.08, .72, .8, 0, HM.metal), x, .36, 0));
  const ch = (x, z, ry, i) => { const c = grp('chair' + i); at(c, x, 0, z, 0, ry); c.add(at(rbox(.46, .07, .46, .03, HM.fab2), 0, .47, 0)); c.add(at(rbox(.46, .45, .06, .03, HM.fab2), 0, .75, -.21, -.08));
    for (const a of [-.19, .19]) for (const b of [-.19, .19]) c.add(at(cyl(.016, .016, .45, HM.metal, null, 8), a, .225, b)); g.add(c); };
  [-.75, 0, .75].forEach((x, i) => { ch(x, -.75, 0, i); ch(x, .75, Math.PI, i + 3); });
  g.add(at(cyl(.2, .12, .1, HM.mid, 'bowl', 20), 0, .83, 0)); for (let i = 0; i < 3; i++) g.add(at(mesh(new THREE.SphereGeometry(.06, 12, 8), HM.orange, 'fruit' + i), -.06 + i * .06, .9, (i % 2) * .05));
  return g;
}
/** king bed 2.0×2.2 m with tall headboard, duvet, pillows, 2 nightstands with lamps (lamp0/1). Faces +z. */
export function bedModern() {
  const g = grp('bedModern'); g.add(at(rbox(2.0, .35, 2.2, .05, HM.fab, 'base'), 0, .2, 0)); g.add(at(rbox(2.3, 1.1, .12, .04, HM.fab, 'headboard'), 0, .55, -1.12));
  g.add(at(rbox(1.96, .16, 1.6, .07, HM.light, 'duvet'), 0, .44, .28)); g.add(at(rbox(1.96, .06, .5, .03, HM.acc, 'throw'), 0, .53, .8));
  for (const x of [-.48, .48]) g.add(at(rbox(.8, .16, .35, .07, HM.light, 'pillow'), x, .5, -.8, -.3));
  [-1.45, 1.45].forEach((x, i) => { g.add(at(rbox(.5, .45, .45, .03, HM.mid, 'nightstand' + i), x, .225, -.85)); const l = grp('lamp' + i); at(l, x, .45, -.85); l.add(at(cyl(.02, .02, .3, HM.metal, null, 8), 0, .15, 0)); l.add(at(cyl(.12, .15, .2, HM.light, null, 20), 0, .38, 0)); g.add(l); });
  g.add(at(rbox(1.4, .4, .45, .05, HM.fab2, 'bench'), 0, .2, 1.4));
  return g;
}
/** tall indoor plant in a planter (1.5 m). leaf0..9 (sway .rotation.z). */
export function planterTall() {
  const g = grp('planterTall'); g.add(at(cyl(.22, .17, .45, HM.light, 'pot', 20), 0, .225, 0)); g.add(at(cyl(.2, .2, .02, HM.soil, null, 16), 0, .44, 0));
  g.add(at(cyl(.02, .025, .8, HM.wood2, 'stem', 8), 0, .82, 0));
  for (let i = 0; i < 10; i++) { const a = i * 2.4, y = .7 + i * .08, L = mesh(new THREE.SphereGeometry(.18, 10, 6), HM.leaf, 'leaf' + i); L.scale.set(1.3, .18, .55); at(L, Math.cos(a) * .18, y, Math.sin(a) * .18, 0, -a, .4); g.add(L); }
  return g;
}
/** arc floor lamp 2 m: base, arc, shade 'shade' (matte, no glow). */
export function arcLamp() {
  const g = grp('arcLamp'); g.add(at(cyl(.18, .2, .05, HM.dark, 'base', 24), 0, .025, 0));
  const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .05, 0), new THREE.Vector3(0, 1.4, 0), new THREE.Vector3(.4, 2.0, 0), new THREE.Vector3(1.1, 1.95, 0), new THREE.Vector3(1.4, 1.65, 0)]);
  g.add(mesh(new THREE.TubeGeometry(c, 32, .018, 8), HM.metal, 'arc')); g.add(at(mesh(new THREE.SphereGeometry(.2, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), Object.assign(HM.light.clone(), {side: THREE.DoubleSide}), 'shade'), 1.4, 1.5, 0));
  return g;
}
/** framed art 1.2×0.8 m: 'art' plane (aspect 1.5 → st.screen for an abstract or Hebrew piece). Faces +z, hangs from y 0. */
export function artFrame() {
  const g = grp('artFrame'); g.add(at(rbox(1.26, .86, .04, .01, HM.light, 'frame'), 0, .43, 0));
  g.add(at(mesh(new THREE.PlaneGeometry(1.2, .8), HM.mid.clone(), 'art'), 0, .43, .021)); return g;
}
/** garage 4.4×6.4 m, 2.7 m high, roll door 'door' (.position.y up to open), roof drone pad 'pad' Ø2.8 with 'padRing' + H marking 'padH', driveway 'driveway' in front with a dashed parking bay 'bay'. Door faces +z. */
export function garage() {
  const g = grp('garage'), W = 4.4, D = 6.4, H = 2.7;
  g.add(at(bx(W, H, D, 0, HM.wall, 'body'), 0, H / 2, 0)); g.add(at(bx(W + .2, .12, D + .2, 0, HM.cap, 'roof'), 0, H + .06, 0));
  g.add(at(bx(W - .6, H - .3, .04, 0, HM.dark, 'opening'), 0, (H - .3) / 2, D / 2 + .01));
  const door = grp('door'); g.add(door); for (let i = 0; i < 8; i++) door.add(at(bx(W - .7, .27, .05, 0, HM.light), 0, .17 + i * .3, D / 2 + .03));
  g.add(at(cyl(1.4, 1.4, .04, HM.dark, 'pad', 48), 0, H + .14, 0));
  g.add(at(mesh(new THREE.TorusGeometry(1.25, .04, 10, 64), HM.acc, 'padRing'), 0, H + .17, 0, Math.PI / 2));
  const h = grp('padH'); g.add(h); for (const [w, d, x] of [[.14, 1.1, -.35], [.14, 1.1, .35], [.7, .14, 0]]) h.add(at(bx(w, .012, d, 0, HM.light), x, H + .165, 0)); 
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.add(at(rbox(.12, .05, .12, .02, HM.acc, 'padLight' + i), Math.cos(a) * 1.55, H + .145, Math.sin(a) * 1.55)); }
  g.add(at(bx(W, .02, 5.5, 0, HM.stone, 'driveway'), 0, .01, D / 2 + 2.75));
  const bay = grp('bay'); g.add(bay); const dz = D / 2 + 2.9;
  for (const [w, d, x, z] of [[.08, 4.6, -1.4, dz], [.08, 4.6, 1.4, dz]]) for (let k = 0; k < 8; k++) bay.add(at(bx(w, .006, .35, 0, HM.light), x, .025, z - 2.1 + k * .6));
  return g;
}
/** generic autonomous personal car 4.5 m (no brand): sleek body, glass roof, small roof sensor 'lidar' ('lidarHead' spin .y), cam0..3, wheels wheel0..3 (.rotation.x), light bars headBar/tailBar (solid). Faces +z. */
export function autoCar() {
  const g = grp('autoCar'), W = HM.light;
  g.add(at(rbox(1.9, .55, 4.5, .22, W, 'body'), 0, .55, 0));
  const cab = mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), Object.assign(M(0x2a2e6a, .1, .3), {}), 'cabin'); cab.scale.set(.88, .55, 1.75); at(cab, 0, .8, -.15); g.add(cab);
  g.add(at(bx(1.6, .05, .05, 0, HM.acc, 'headBar'), 0, .66, 2.25)); g.add(at(bx(1.6, .05, .05, 0, HM.orange, 'tailBar'), 0, .7, -2.25));
  const li = joint('lidar', [0, 1.36, .2], at(cyl(.12, .14, .06, HM.dark, null, 24), 0, 0, 0)); g.add(li); li.add(joint('lidarHead', [0, .06, 0], at(cyl(.09, .09, .07, HM.acc, null, 24), 0, 0, 0)));
  [[.96, .85, 1.6], [-.96, .85, 1.6], [.96, .85, -1.6], [-.96, .85, -1.6]].forEach(([x, y, z], i) => g.add(at(rbox(.05, .06, .1, .02, HM.dark, 'cam' + i), x, y, z)));
  [[.86, 1.45], [-.86, 1.45], [.86, -1.45], [-.86, -1.45]].forEach(([x, z], i) => { const w = grp('wheel' + i); at(w, x, .36, z); w.add(at(cyl(.36, .36, .26, MAT2.tire, null, 28), 0, 0, 0, 0, 0, Math.PI / 2)); w.add(at(cyl(.24, .24, .27, HM.metal, null, 20), 0, 0, 0, 0, 0, Math.PI / 2)); g.add(w); });
  return g;
}
/** delivery drone (~1.2 m, our quadcopter ×2.4) carrying a grocery box on a tether: 'drone' (spin prop0..3 inside), 'tether' (scale .y to lower), 'parcel' with 'box' + groceries (bread, milk, apple0..2, leaves). */
export function deliveryDrone() {
  const g = grp('deliveryDrone'); const d = drone(); d.name = 'drone'; d.scale.setScalar(2.4); d.position.y = .9; g.add(d);
  const teth = grp('tether'); teth.position.y = .95; g.add(teth); teth.add(at(cyl(.008, .008, .5, HM.dark, null, 6), 0, -.25, 0));
  const pc = grp('parcel'); pc.position.y = .45 - .02; g.add(pc);
  pc.add(at(rbox(.5, .32, .38, .02, M(0xc9b48a, .9), 'box'), 0, -.16, 0)); pc.add(at(bx(.52, .06, .02, 0, HM.acc, 'band'), 0, -.1, .19));
  pc.add(at(rbox(.12, .2, .12, .02, HM.light, 'milk'), -.14, .05, -.05)); pc.add(at(rbox(.3, .1, .12, .05, M(0xd29a5a, .8), 'bread'), .08, .03, .08, 0, 0, .25));
  for (let i = 0; i < 3; i++) pc.add(at(mesh(new THREE.SphereGeometry(.05, 12, 8), M(0xe0503a, .6), 'apple' + i), .1 + i * .07, .02, -.08));
  for (let i = 0; i < 3; i++) pc.add(at(mesh(new THREE.ConeGeometry(.03, .18, 6), HM.leaf, 'leaves' + i), -.02 + i * .03, .1, -.12, .2 * (i - 1)));
  pc.position.y = .45; return g;
}

export const KIT = {
  'medical/surgical-robot': surgicalRobot, 'medical/surgeon-console': surgeonConsole, 'medical/operating-table': operatingTable,
  'medical/draped-patient': drapedPatient, 'medical/surgical-lamp': surgicalLamp, 'medical/medical-monitor': medicalMonitor,
  'medical/instrument-grasper': grasper, 'medical/suture-needle': needle,
  'home/robotVacuum': robotVacuum, 'home/robotVacuumDock': vacuumDock,
  'drone/quadcopter': drone, 'home/trayGlasses': trayGlasses,
  'everyday/smartphone': smartphone, 'everyday/router': router, 'everyday/cellTower': cellTower, 'everyday/busStop': busStop, 'body/gripper': gripper,
  'robots/humanoid': humanoid, 'robots/robotDog': robotDog, 'robots/deliveryBot': deliveryBot, 'robots/robotArm': robotArm,
  'robots/driveUnit': driveUnit, 'robots/shelfPod': shelfPod, 'vehicles/robotaxi': robotaxi, 'vehicles/forklift': forklift,
  'everyday/servo': servo, 'buildings/factoryHall': factoryHall,
  'lab/workbench': workbench, 'lab/printer3d': printer3d, 'lab/chargingWall': chargingWall, 'buildings/labRoom': labRoom, 'vehicles/farmRobot': farmRobot,
  'home2056/villa': villa, 'home2056/sealedDoor': sealedDoor, 'home2056/frostedRoom': frostedRoom, 'home2056/pool': pool, 'home2056/hotTub': hotTub,
  'home2056/lounger': lounger, 'home2056/umbrella': umbrella, 'home2056/outdoorKitchen': outdoorKitchen, 'home2056/firePit': firePit,
  'home2056/kitchenIsland': kitchenIsland, 'home2056/kitchenRun': kitchenRun, 'home2056/sofaModern': sofaModern, 'home2056/loungeSet': loungeSet, 'home2056/mediaWall': mediaWall,
  'home2056/diningSet': diningSet, 'home2056/bedModern': bedModern, 'home2056/planterTall': planterTall, 'home2056/arcLamp': arcLamp, 'home2056/artFrame': artFrame,
  'home2056/garage': garage, 'vehicles/autoCar': autoCar, 'drone/deliveryDrone': deliveryDrone,
};
