// Window-robot kit (Media pro 2026-11-25 run 16, for ep025-windowbot — pro-v3 test #3, daylight, frame0 eye level inside the room).
// Generic (no brand), our own work → CC0. Real metres, y-up. REAL colours with userData.real → look-pro keeps them.
// Brand: light blue #8ea6ff = signal (pressure sensor), deep blue #4f6fe0 = force/air. No glow.
// Export: python3 tools/make_props.py window/   (robots/windowBotPro + buildings/tlvWindowRoom)
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const R = (color, rough = .8, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
export const WM = {
  white: R(0xf3f3f1, .35, .02), grey: R(0x9aa0a6, .45, .2), dark: R(0x24262a, .55), black: R(0x111214, .7), rubber: R(0x18191b, .92), cloth: R(0xd9dde2, 1),
  smoke: R(0x1d2630, .1, .1, {transparent: true, opacity: .5}), metal: R(0xb7bdc4, .3, .85), alu: R(0xd4d7da, .35, .7), pcb: R(0x1f4d3a, .6), copper: R(0xb87333, .32, .85),
  cell: R(0x3a6ea5, .45, .3), cellCap: R(0xc9ced4, .25, .9), acc: R(0x8ea6ff, .5), force: R(0x4f6fe0, .5), led: R(0x8ea6ff, .4, 0, {emissive: 0x8ea6ff, emissiveIntensity: .4}),
  // building / room
  plaster: R(0xf1eee8, .9), plaster2: R(0xe4e0d8, .9), shadowBand: R(0xd8d3ca, .9), glass: R(0xb8c6cf, .02, .1, {transparent: true, opacity: .08, depthWrite: false, side: THREE.DoubleSide}),
  glassDark: R(0x2a3640, .08, .3), frame: R(0xe9eaec, .35, .4), shutter: R(0xd6d6d2, .6), floor: R(0xc9ab84, .55), floor2: R(0xbd9f78, .55), ceiling: R(0xf7f6f3, .95),
  sofa: R(0x8f949a, .95), cushion: R(0xb9a487, .95), wood: R(0x8a6a4c, .6), leaf: R(0x4f6b33, .9), leaf2: R(0x5f7f3d, .9), pot: R(0xd8cfc2, .8), soil: R(0x4b3a2c, 1),
  curtain: R(0xeeeae2, 1, 0, {side: THREE.DoubleSide}), socket: R(0xf4f4f2, .4), cableW: R(0xf1f1ef, .5), rope: R(0x2f3338, .7),
  asphalt: R(0x3a3c40, .95), sidewalk: R(0xb9b2a6, .9), curb: R(0xd0cbc2, .8), tree: R(0x5a7a3a, .9), trunk: R(0x6b5744, .95), lane: R(0xeeeeea, .6),
  car: [R(0xe8e8e6, .3, .4), R(0x30343a, .3, .4), R(0x9aa3ad, .3, .5), R(0x7a1f22, .35, .4), R(0x22324a, .35, .4)], carGlass: R(0x1a2229, .1, .3),
};
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...kids) => { const g = new THREE.Group(); if (name) g.name = name; kids.forEach(k => g.add(k)); return g; };
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);
const rbox = (w, h, d, r, m, name) => mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name);
const RB = (w, h, d, r, m, x, y, z, name) => at(rbox(w, h, d, r, m, name), x, y, z);
const cyl = (rt, rb, h, m, name, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const spot = (name, x, y, z) => at(grp(name), x, y, z);
const rng = seed => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
/** rounded-square ring (seal) in the xy plane */
function squareRing(size, r, tube, m, name) { const s = size / 2 - r, pts = []; for (let i = 0; i < 4; i++) { const cx = (i === 0 || i === 3) ? s : -s, cy = i < 2 ? s : -s; for (let k = 0; k <= 8; k++) { const a = i * Math.PI / 2 + k / 8 * Math.PI / 2; pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0)); } }
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 96, tube, 10, true), m, name); }

/** pro window-cleaning robot (generic square type, 0.29 × 0.29 × 0.085 m). Back (−z) sits on the glass, faces +z (away from the glass).
 * Nodes: ghost **'shell'** (cover, sides, 'vent' grille on top, 'handle', 'statusLed'), insides **'fan'** (impeller, spin .rotation.z) in 'fanHousing' + 'motor',
 * **'battery'** (backup pack: cell0..5, 'batteryLevel' bar scale.x), **'pressureSensor'** (board + light-blue chip 'sensorChip', tube 'sensorTube' to the cavity), 'board';
 * glass side: **'seal'** (soft rubber rim, presses on the glass) + 'sealMark' (light-blue line; call fx sealPress(bot, 0) to hide it), **'cavity'** (the thin low-pressure space under the robot, invisible plane), 'padL'/'padR' (cleaning pads, spin .z),
 * spots 'airOut' (where the fan air leaves, top vent), 'cableIn' (power + safety cable), 'cornerLeak' (seal corner for the leak puff). */
export function windowBotPro() {
  const g = grp('windowBotPro'), S = .29, D = .085;
  const shell = grp('shell'); g.add(shell);
  shell.add(RB(S, S, .05, .045, WM.white, 0, 0, .055, 'cover'));
  shell.add(RB(S - .004, S - .004, .035, .04, WM.grey, 0, 0, .02, 'sides'));
  shell.add(RB(.12, .035, .01, .015, WM.dark, 0, .095, .083, 'vent')); for (let i = 0; i < 5; i++) shell.add(B(.1, .003, .004, WM.black, 0, .082 + i * .0065, .088));
  shell.add(RB(.14, .025, .018, .012, WM.dark, 0, -.1, .085, 'handle'));
  shell.add(at(cyl(.007, .007, .004, WM.led, 'statusLed', 16), .1, -.1, .081, Math.PI / 2));
  shell.add(at(cyl(.012, .012, .02, WM.dark, 'cablePort', 16), 0, .148, .05));
  // insides
  const fh = at(cyl(.07, .07, .045, WM.smoke, 'fanHousing', 40), 0, .02, .045, Math.PI / 2); g.add(fh);
  const fan = grp('fan'); at(fan, 0, .02, .05); g.add(fan); fan.add(at(cyl(.02, .02, .02, WM.metal, 'fanHub', 20), 0, 0, 0, Math.PI / 2));
  for (let i = 0; i < 9; i++) { const b = B(.05, .002, .016, WM.force); b.position.set(Math.cos(i * .698) * .038, Math.sin(i * .698) * .038, 0); b.rotation.set(0, .5, i * .698 + Math.PI / 2); fan.add(b); }
  g.add(at(cyl(.022, .022, .03, WM.metal, 'motor', 20), 0, .02, .075, Math.PI / 2));
  const bat = grp('battery'); at(bat, 0, -.085, .04); g.add(bat); bat.add(RB(.2, .04, .03, .006, WM.dark));
  for (let i = 0; i < 6; i++) bat.add(at(cyl(.009, .009, .03, WM.cell, 'cell' + i, 14), -.075 + i * .03, 0, .002, Math.PI / 2));
  const bl = B(.18, .006, .002, WM.acc, 'batteryLevel'); bl.position.set(0, -.025, .016); bat.add(bl);
  const ps = grp('pressureSensor'); at(ps, .095, .06, .03); g.add(ps); ps.add(RB(.04, .03, .004, .003, WM.pcb, 0, 0, 0, 'sensorBoard'), B(.012, .012, .004, WM.acc, 0, 0, .004, 'sensorChip'));
  ps.add(at(cyl(.003, .003, .03, WM.acc, 'sensorTube', 8), 0, 0, -.017, Math.PI / 2));
  g.add(RB(.07, .05, .004, .004, WM.pcb, -.09, .07, .03, 'board'));
  // glass side: seal + pads + cavity
  g.add(at(squareRing(S - .012, .04, .006, WM.rubber, 'seal'), 0, 0, -.0005));
  g.add(at(squareRing(S - .012, .04, .0065, WM.acc, 'sealMark'), 0, 0, -.0005));   // exported visible (GLTFExporter drops hidden nodes): fx sealPress(bot, 0) hides it
  for (const [k, x] of [['L', .065], ['R', -.065]]) { const p = grp('pad' + k); at(p, x, 0, .002); g.add(p); p.add(at(cyl(.055, .055, .006, WM.cloth, null, 32), 0, 0, 0, Math.PI / 2));
    for (let i = 0; i < 4; i++) p.add(B(.1, .004, .002, WM.grey, 0, 0, -.003).rotateZ(i * Math.PI / 4)); }
  const cav = mesh(new THREE.PlaneGeometry(S - .03, S - .03), R(0xffffff, 1, 0, {transparent: true, opacity: 0}), 'cavity'); cav.castShadow = false; at(cav, 0, 0, .004); g.add(cav);
  g.add(spot('airOut', 0, .095, .09), spot('cableIn', 0, .16, .05), spot('cornerLeak', S / 2 - .03, -S / 2 + .03, 0));
  return g;
}

/** 10th-floor Tel-Aviv living-room corner by a window + the white facade outside down to the street (30 m below).
 * Frame: window wall = plane z 0 (outside face); room inside z < 0 (floor y 0, ceiling 2.7, x −2.6..2.6, back to z −4.6); outside z > 0; street at y −30.
 * Window: aluminium slider 2.0 × 1.4 (sill y .9): fixed LEFT pane 'paneFixed' (x −1..0, glass outer face z −.06 — the robot sits outside on it) + RIGHT pane 'paneSlide' slid open behind it (opening x 0..1 = where the cables come in).
 * Nodes: room ('floor', 'ceiling', 'wallBack', 'wallSide', 'windowWall'), 'sofa', 'plant', 'curtain', 'ceilingLamp' (+ 'lampSpot'), **'socket'** (inside, on the window wall) with **'plug'** (pull = .position.z −) + spot 'plugOut',
 *  **'anchor'** (eye bolt fixed in the wall inside = safety-cable anchor), 'facade' (floors, window rows, balcony bands, shutter boxes, AC units), 'street' (road, sidewalks, trees, parked cars), 'opposite' (blocks across the street).
 * Spots: **robotSpot** (outer glass face of the fixed pane, eye height), **openingSpot** (where the cables pass the open pane), **eyeSpot** (frame-0 camera inside), streetSpot. */
export function tlvWindowRoom() {
  const g = grp('tlvWindowRoom'), FL = 3.0, NF = 10, TOP = 6.3, W0 = -1, W1 = 1, SY = .9, SH = 1.4;
  // ---- window wall with the opening (room side), thickness .25 (z −.25..0)
  const ws = new THREE.Shape(); ws.moveTo(-2.6, 0); ws.lineTo(2.6, 0); ws.lineTo(2.6, 2.7); ws.lineTo(-2.6, 2.7); ws.lineTo(-2.6, 0);
  const hole = new THREE.Path(); hole.moveTo(W0, SY); hole.lineTo(W0, SY + SH); hole.lineTo(W1, SY + SH); hole.lineTo(W1, SY); hole.lineTo(W0, SY); ws.holes.push(hole);
  const wg = new THREE.ExtrudeGeometry(ws, {depth: .25, bevelEnabled: false}); wg.translate(0, 0, -.25); g.add(mesh(wg, WM.plaster, 'windowWall'));
  // ---- room
  const room = grp('room'); g.add(room);
  room.add(B(5.2, .05, 4.4, WM.floor, 0, -.025, -2.45, 'floor')); for (let i = 0; i < 26; i++) room.add(B(.004, .002, 4.4, WM.floor2, -2.6 + i * .2, .001, -2.45));
  room.add(B(5.2, .05, 4.4, WM.ceiling, 0, 2.725, -2.45, 'ceiling'), B(5.2, 2.7, .1, WM.plaster2, 0, 1.35, -4.65, 'wallBack'), B(.1, 2.7, 4.4, WM.plaster2, -2.65, 1.35, -2.45, 'wallSide'), B(.1, 2.7, 4.4, WM.plaster2, 2.65, 1.35, -2.45, 'wallSide2'));
  room.add(B(5.2, .08, .02, WM.white, 0, .04, -.26, 'skirting'));
  // sill + window frames + glass
  room.add(B(2.1, .04, .32, WM.plaster2, 0, SY - .02, -.12, 'sill'));
  const win = grp('window'); g.add(win);
  win.add(B(2.0, .05, .14, WM.frame, 0, SY + .025, -.1), B(2.0, .05, .14, WM.frame, 0, SY + SH - .025, -.1), B(.05, SH, .14, WM.frame, W0 + .025, SY + SH / 2, -.1), B(.05, SH, .14, WM.frame, W1 - .025, SY + SH / 2, -.1));
  const pf = grp('paneFixed'); win.add(pf); pf.add(B(1.02, SH - .1, .012, WM.glass, -.5, SY + SH / 2, -.066, 'glassFixed'));
  pf.add(B(.05, SH - .1, .05, WM.frame, -.01, SY + SH / 2, -.07), B(1.02, .05, .05, WM.frame, -.5, SY + .075, -.07), B(1.02, .05, .05, WM.frame, -.5, SY + SH - .075, -.07));
  const pS = grp('paneSlide'); win.add(pS); pS.add(B(1.0, SH - .1, .012, WM.glass, -.45, SY + SH / 2, -.13, 'glassSlide'));
  pS.add(B(.05, SH - .1, .05, WM.frame, .03, SY + SH / 2, -.13), B(.05, SH - .1, .05, WM.frame, -.93, SY + SH / 2, -.13));
  // shutter box (trisol) above the window, outside
  win.add(B(2.1, .22, .2, WM.shutter, 0, SY + SH + .12, .04, 'shutterBox'));
  // curtain, sofa, plant, lamp
  const cu = mesh(new THREE.PlaneGeometry(.7, 2.4, 14, 1), WM.curtain, 'curtain'); { const p = cu.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 22) * .04); cu.geometry.computeVertexNormals(); } at(cu, -1.55, 1.3, -.38); room.add(cu);
  const so = grp('sofa'); at(so, -.3, 0, -3.6); room.add(so); so.add(RB(2.2, .42, .9, .08, WM.sofa, 0, .3, 0), RB(2.2, .5, .22, .08, WM.sofa, 0, .65, -.36), RB(.22, .35, .9, .08, WM.sofa, -1.05, .55, 0), RB(.22, .35, .9, .08, WM.sofa, 1.05, .55, 0));
  so.add(RB(.5, .38, .14, .07, WM.cushion, -.6, .68, -.22), RB(.5, .38, .14, .07, WM.cushion, .55, .68, -.22));
  room.add(RB(1.0, .05, .55, .02, WM.wood, -.3, .4, -2.4, 'coffeeTable')); for (const [x, z] of [[-.75, -2.2], [.15, -2.2], [-.75, -2.6], [.15, -2.6]]) room.add(B(.04, .38, .04, WM.wood, x, .19, z));
  const pl = grp('plant'); at(pl, 2.1, 0, -.75); room.add(pl); pl.add(at(cyl(.2, .16, .4, WM.pot, null, 24), 0, .2, 0)); const rr = rng(5);
  for (let k = 0; k < 9; k++) { const b = mesh(new THREE.IcosahedronGeometry(.16 + rr() * .1, 1), k % 2 ? WM.leaf : WM.leaf2); b.scale.set(1, 1.3, 1); pl.add(at(b, (rr() - .5) * .4, .6 + rr() * .7, (rr() - .5) * .4)); }
  const lp = grp('ceilingLamp'); at(lp, 0, 2.7, -2.4); room.add(lp); lp.add(at(cyl(.005, .005, .5, WM.black, null, 6), 0, -.25, 0), at(cyl(.12, .22, .2, WM.white, null, 28), 0, -.6, 0)); lp.add(spot('lampSpot', 0, -.72, 0));
  // socket + plug (inside, window wall, right of the window) + anchor eye bolt
  const sk = grp('socket'); at(sk, 1.75, .35, -.25); room.add(sk); sk.add(RB(.085, .085, .012, .01, WM.socket, 0, 0, -.006), at(cyl(.025, .025, .004, WM.plaster2, null, 20), 0, 0, -.013, Math.PI / 2));
  const plug = grp('plug'); at(plug, 0, 0, -.03); sk.add(plug); plug.add(at(cyl(.022, .02, .04, WM.cableW, null, 20), 0, 0, 0, Math.PI / 2), at(cyl(.007, .007, .03, WM.cableW, null, 10), 0, -.025, -.01)); plug.add(spot('plugOut', 0, -.04, -.01));
  const an = grp('anchor'); at(an, 1.3, .55, -.25); room.add(an); an.add(RB(.07, .07, .012, .01, WM.metal, 0, 0, -.006), at(cyl(.006, .006, .04, WM.metal, null, 10), 0, 0, -.02, Math.PI / 2), at(mesh(new THREE.TorusGeometry(.02, .005, 8, 24), WM.metal), 0, 0, -.045));
  an.add(spot('anchorRing', 0, -.02, -.045));
  // ---- facade outside (z 0 face), floors from the street (y −30) to the roof (y 6.3)
  const fa = grp('facade'); g.add(fa); const X0 = -9, X1 = 9;
  const fs = new THREE.Shape(); fs.moveTo(X0, -30); fs.lineTo(X1, -30); fs.lineTo(X1, TOP); fs.lineTo(X0, TOP); fs.lineTo(X0, -30); fs.holes.push(hole);
  const fg = new THREE.ExtrudeGeometry(fs, {depth: .02, bevelEnabled: false}); fa.add(mesh(fg, WM.plaster, 'facadeWall'));   // z 0..0.02 (in front of the room's window wall)
  const winG = new THREE.BoxGeometry(1.6, 1.3, .012), shG = new THREE.BoxGeometry(1.7, .2, .18), acG = new THREE.BoxGeometry(.8, .5, .3), bandG = new THREE.BoxGeometry(7.5, .14, .9), parG = new THREE.BoxGeometry(7.5, .9, .06);
  const cols = [-6.6, -3.6, 0, 3.6, 6.6], insts = {win: [], sh: [], ac: []}, m4 = new THREE.Matrix4(), r2 = rng(11);
  for (let f = -NF; f <= 1; f++) { const y = f * FL; for (const cx of cols) { if (f === 0 && cx === 0) continue; insts.win.push([cx, y + SY + .65, .027]); insts.sh.push([cx, y + SY + 1.45, .11]); if (r2() < .3) insts.ac.push([cx + 1.0, y + .5, .16]); } }
  const inst = (geo, mat, arr, name) => { const im = new THREE.InstancedMesh(geo, mat, arr.length); arr.forEach((p, i) => im.setMatrixAt(i, m4.makeTranslation(...p))); im.name = name; im.castShadow = im.receiveShadow = true; fa.add(im); };
  inst(winG, WM.glassDark, insts.win, 'windows'); inst(shG, WM.shutter, insts.sh, 'shutterBoxes'); inst(acG, WM.plaster2, insts.ac, 'acUnits');
  for (const f of [-9, -7, -5, -3, -1]) { const y = f * FL; fa.add(at(mesh(bandG, WM.plaster2), 5.1, y, .45), at(mesh(parG, WM.plaster), 5.1, y + .5, .88)); }   // balcony bands on odd floors, right half (kept out of the window column)
  fa.add(B(X1 - X0, .4, .9, WM.plaster2, 0, TOP + .2, .1, 'roofEdge'), B(X1 - X0, 3.2, .3, WM.shadowBand, 0, -28.4, .1, 'groundFloor'));
  fa.add(B(.25, TOP + 30, .25, WM.plaster2, X0, (TOP - 30) / 2, .1), B(.25, TOP + 30, .25, WM.plaster2, X1, (TOP - 30) / 2, .1));
  // ---- street (y −30)
  const st = grp('street'); at(st, 0, -30, 0); g.add(st);
  st.add(B(60, .1, 3.5, WM.sidewalk, 0, -.05, 1.75, 'sidewalk'), B(60, .16, .2, WM.curb, 0, .02, 3.5), B(60, .05, 7, WM.asphalt, 0, -.12, 7, 'road'), B(60, .1, 3.5, WM.sidewalk, 0, -.05, 12.25));
  for (let i = 0; i < 20; i++) st.add(B(1.6, .01, .12, WM.lane, -28 + i * 3, -.09, 7));
  const r3 = rng(3); for (let i = 0; i < 7; i++) { const x = -18 + i * 6 + r3() * 1.5, t = grp('tree' + i); at(t, x, 0, 2.6); st.add(t); t.add(at(cyl(.12, .16, 3, WM.trunk, null, 10), 0, 1.5, 0));
    for (let k = 0; k < 6; k++) { const b = mesh(new THREE.IcosahedronGeometry(1 + r3() * .6, 1), k % 2 ? WM.tree : WM.leaf); b.scale.set(1, .7, 1); t.add(at(b, (r3() - .5) * 2, 3.6 + r3() * 1.2, (r3() - .5) * 2)); } }
  for (let i = 0; i < 9; i++) { const c = grp('car' + i); at(c, -22 + i * 5 + r3() * 1.5, 0, i % 2 ? 4.6 : 9.4, 0, Math.PI / 2, 0); st.add(c); const m = WM.car[i % WM.car.length];
    c.add(RB(1.8, .7, 4.3, .2, m, 0, .5, 0), RB(1.6, .5, 2.2, .2, WM.carGlass, 0, 1.05, -.2), RB(1.62, .08, 2.0, .05, m, 0, 1.3, -.2)); for (const [x, z] of [[.8, 1.4], [-.8, 1.4], [.8, -1.4], [-.8, -1.4]]) c.add(at(cyl(.32, .32, .22, WM.black, null, 16), x, .32, z, 0, 0, Math.PI / 2)); }
  // ---- opposite blocks across the street
  const op = grp('opposite'); g.add(op); const r4 = rng(9);
  for (let i = 0; i < 6; i++) { const h = 14 + r4() * 18, w = 9 + r4() * 5, x = -27 + i * 11; op.add(B(w, h, 10, r4() < .5 ? WM.plaster : WM.plaster2, x, -30 + h / 2, 20 + r4() * 2));
    for (let f = 0; f < h / 3 - 1; f++) op.add(B(w - 1.5, 1.2, .1, WM.glassDark, x, -30 + 1.8 + f * 3, 14.9)); }
  // spots
  g.add(spot('robotSpot', -.48, 1.62, -.06), spot('openingSpot', .5, 1.15, -.1), spot('eyeSpot', .6, 1.55, -1.9), spot('streetSpot', 0, -30, 6));
  return g;
}

export const KITWINDOW = { 'robots/windowBotPro': windowBotPro, 'buildings/tlvWindowRoom': tlvWindowRoom };
