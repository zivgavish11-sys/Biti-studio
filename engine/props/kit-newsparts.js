// News hero props (Media pro 2026-11-25 run 16, from the news inbox: "story hero must literally relate to the news").
// Generic, no brand/logo, our own work → CC0. Real metres, realistic PBR colours (userData.real). No glow.
// Export: python3 tools/make_props.py gpuRack  /  robotModules
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
const R = (color, rough = .6, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
const N = { rack: R(0x1b1d21, .55, .5), black: R(0x0e0f11, .6, .3), steel: R(0xa9b0b8, .3, .9), alu: R(0xc9cdd2, .32, .85), mesh: R(0x2a2d32, .5, .7), glass: R(0x1a2a33, .05, .2, {transparent: true, opacity: .25, depthWrite: false}),
  gold: R(0xc9a24a, .3, .9), pcb: R(0x1d3a2e, .6), cable: R(0x2b2e33, .7), cableB: R(0x3a4d7a, .6), led: R(0x8ea6ff, .4, 0, {emissive: 0x8ea6ff, emissiveIntensity: .5}), ledG: R(0x4fd18b, .4, 0, {emissive: 0x4fd18b, emissiveIntensity: .4}),
  white: R(0xeef0f2, .4, .05), grey: R(0x5b6068, .45, .4), orange: R(0xe0782a, .55), cell: R(0x3a6ea5, .45, .3), rubber: R(0x141517, .9), acc: R(0x8ea6ff, .5), lens: R(0x0a0c10, .05, .6) };
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...k) => { const g = new THREE.Group(); if (name) g.name = name; k.forEach(c => g.add(c)); return g; };
const RB = (w, h, d, r, m, x, y, z, name) => at(mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name), x, y, z);
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);
const cyl = (rt, rb, h, m, name, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);

/** AI-training GPU rack (generic data-centre 48U, 0.6 × 2.2 × 1.2 m, front = +z). Nodes: 'frame', 'door' (glass, hinge at x −.3, open = .rotation.y −1.6), node0..7 (4U GPU servers: front fan wall fan{i}_{j} spin .z, 'status{i}' LEDs, drive bays),
 * 'switch' (top network switch with ports), 'cables' (blue fibre bundle), 'pdu' (rear power strips), spot 'top'. Pair several racks in a row for an 'AI cluster' shot. */
export function gpuRack() {
  const g = grp('gpuRack'), W = .6, H = 2.2, D = 1.2;
  const fr = grp('frame'); g.add(fr); fr.add(B(W, .04, D, N.rack, 0, .02, 0), B(W, .04, D, N.rack, 0, H - .02, 0), B(.03, H, D, N.rack, -W / 2 + .015, H / 2, 0), B(.03, H, D, N.rack, W / 2 - .015, H / 2, 0), B(W, H, .02, N.rack, 0, H / 2, -D / 2 + .01));
  for (const x of [-.25, .25]) fr.add(B(.02, H - .1, .02, N.steel, x, H / 2, D / 2 - .06));
  fr.add(B(W, .1, D, N.black, 0, .05, 0, 'plinth'));
  for (let i = 0; i < 8; i++) { const n = grp('node' + i), y = .2 + i * .22; at(n, 0, y, .1); g.add(n);
    n.add(RB(.48, .17, .95, .01, N.alu, 0, 0, -.02)); n.add(B(.5, .17, .015, N.grey, 0, 0, .46));
    for (let j = 0; j < 4; j++) { const f = grp(`fan${i}_${j}`); at(f, -.18 + j * .12, .015, .47); n.add(f); f.add(at(cyl(.05, .05, .006, N.mesh, null, 24), 0, 0, 0, Math.PI / 2)); for (let b = 0; b < 7; b++) f.add(at(B(.045, .006, .004, N.black), Math.cos(b * .9) * .022, Math.sin(b * .9) * .022, .004, 0, 0, b * .9)); }
    for (let k = 0; k < 6; k++) n.add(B(.06, .025, .01, N.black, -.18 + k * .072, -.065, .47));
    n.add(B(.008, .008, .006, i % 3 ? N.ledG : N.led, .225, .06, .472, 'status' + i)); n.add(B(.004, .12, .004, N.gold, -.235, 0, .472)); }
  const sw = RB(.48, .045, .5, .005, N.black, 0, 2.03, .3, 'switch'); g.add(sw); for (let p = 0; p < 16; p++) g.add(B(.018, .012, .006, N.mesh, -.2 + p * .027, 2.03, .555));
  const cb = grp('cables'); g.add(cb); for (let c = 0; c < 8; c++) { const pts = [[-.2 + c * .055, 2.03, .56], [-.2 + c * .055, 1.95, .6], [.27, 1.6 - c * .1, .6], [.27, .2 + c * .22 + .05, .58]].map(v => new THREE.Vector3(...v)); cb.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, .005, 6), N.cableB)); }
  const pdu = grp('pdu'); g.add(pdu); for (const x of [-.22, .22]) pdu.add(B(.05, 1.9, .05, N.black, x, 1.1, -.55));
  const door = grp('door'); at(door, -W / 2, 0, D / 2 + .01); g.add(door); door.add(B(W, H - .1, .01, N.glass, W / 2, H / 2, 0, 'doorGlass'), B(W, .04, .02, N.rack, W / 2, H - .07, 0), B(W, .04, .02, N.rack, W / 2, .07, 0), B(.03, H - .1, .02, N.rack, W - .015, H / 2, 0), B(.015, .25, .03, N.steel, W - .05, 1.1, .02, 'doorHandle'));
  g.add(at(grp('top'), 0, H, 0));
  return g;
}

/** modular robot hardware kit, laid out like a product shot (each module ~0.1–0.2 m, real size; scale up for heroes). Generic, no brand.
 * Nodes: **actuator** (joint module: housing, 'output' flange spin .z, 'encoder' ring, connector), **batteryModule** (pack, 'cells' visible through a window, 'level' bar, quick-release 'latch'),
 * **sensorModule** (stereo depth camera: lensL/lensR, 'projector', mount), **computeModule** (board in an alu case with heatsink fins, 'ports'), **gripperModule** (2-finger: fingerA/fingerB slide .x),
 * 'connectors' (short cables between modules, userData.path). Each module also stands alone (place by name). */
export function robotModules() {
  const g = grp('robotModules');
  const act = grp('actuator'); at(act, -.28, .06, 0); g.add(act);
  act.add(at(cyl(.06, .06, .09, N.alu, 'housing', 40), 0, 0, 0, Math.PI / 2)); for (let i = 0; i < 16; i++) act.add(at(B(.004, .12, .01, N.grey), Math.cos(i * .39) * .06, Math.sin(i * .39) * .06, -.01, 0, 0, i * .39));
  const out = grp('output'); at(out, 0, 0, .05); act.add(out); out.add(at(cyl(.045, .045, .012, N.steel, null, 40), 0, 0, 0, Math.PI / 2)); for (let i = 0; i < 6; i++) out.add(at(cyl(.004, .004, .014, N.black, null, 8), Math.cos(i * 1.05) * .033, Math.sin(i * 1.05) * .033, 0, Math.PI / 2));
  act.add(at(mesh(new THREE.TorusGeometry(.061, .004, 8, 48), N.acc, 'encoder'), 0, 0, .03)); act.add(RB(.03, .02, .03, .004, N.black, 0, .065, -.02, 'connector'));
  const bat = grp('batteryModule'); at(bat, -.05, .045, -.02); g.add(bat); bat.add(RB(.16, .09, .1, .012, N.white, 0, 0, 0, 'pack')); bat.add(RB(.11, .05, .005, .006, N.glass, 0, .005, .051, 'window'));
  const cells = grp('cells'); bat.add(cells); for (let i = 0; i < 5; i++) cells.add(at(cyl(.009, .009, .05, N.cell, null, 14), -.04 + i * .02, .005, .04));
  bat.add(B(.1, .006, .003, N.acc, 0, -.03, .051, 'level'), RB(.04, .015, .02, .005, N.orange, .05, .05, 0, 'latch'));
  const sen = grp('sensorModule'); at(sen, .16, .05, 0); g.add(sen); sen.add(RB(.14, .035, .035, .012, N.black, 0, 0, 0, 'body')); for (const [n, x] of [['lensL', -.045], ['lensR', .045]]) sen.add(at(cyl(.009, .009, .004, N.lens, n, 20), x, 0, .018, Math.PI / 2));
  sen.add(at(cyl(.006, .006, .004, N.grey, 'projector', 16), 0, 0, .018, Math.PI / 2)); sen.add(at(cyl(.006, .01, .04, N.grey, 'mount', 12), 0, -.035, 0));
  const cmp = grp('computeModule'); at(cmp, .05, .02, .17); g.add(cmp); cmp.add(RB(.14, .035, .1, .006, N.grey, 0, 0, 0, 'case')); for (let i = 0; i < 9; i++) cmp.add(B(.003, .018, .09, N.alu, -.06 + i * .015, .026, 0));
  const ports = grp('ports'); cmp.add(ports); for (let i = 0; i < 4; i++) ports.add(B(.014, .008, .004, N.black, -.045 + i * .03, -.005, .051));
  const grip = grp('gripperModule'); at(grip, -.2, .03, .18); g.add(grip); grip.add(RB(.09, .05, .06, .008, N.alu, 0, 0, 0, 'base'));
  for (const [n, x] of [['fingerA', -.025], ['fingerB', .025]]) { const f = grp(n); at(f, x, .025, 0); grip.add(f); f.add(RB(.014, .07, .03, .004, N.grey, 0, .035, 0), RB(.016, .03, .032, .004, N.rubber, 0, .055, 0)); }
  const con = grp('connectors'); g.add(con);
  const link = (a, b, name) => { const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), M = A.clone().lerp(Bv, .5).add(new THREE.Vector3(0, -.02, 0)); const t = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([A, M, Bv]), 24, .003, 6), N.cable, name); t.userData.path = [...a, ...b]; con.add(t); };
  link([-.28, .125, -.02], [-.1, .09, -.02], 'linkActBat'); link([0, .09, -.02], [.12, .05, -.02], 'linkBatSen'); link([.16, .03, .02], [.07, .04, .12], 'linkSenCmp');
  return g;
}
export const KITNEWS = { 'pro/gpuRack': gpuRack, 'pro/robotModules': robotModules };
