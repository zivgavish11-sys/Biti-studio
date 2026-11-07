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

export const KIT = {
  'medical/surgical-robot': surgicalRobot, 'medical/surgeon-console': surgeonConsole, 'medical/operating-table': operatingTable,
  'medical/draped-patient': drapedPatient, 'medical/surgical-lamp': surgicalLamp, 'medical/medical-monitor': medicalMonitor,
  'medical/instrument-grasper': grasper, 'medical/suture-needle': needle,
  'home/robotVacuum': robotVacuum, 'home/robotVacuumDock': vacuumDock,
  'drone/quadcopter': drone, 'home/trayGlasses': trayGlasses,
  'everyday/smartphone': smartphone, 'everyday/router': router, 'everyday/cellTower': cellTower, 'everyday/busStop': busStop,
};
