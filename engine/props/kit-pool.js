// Backyard pool kit (Media pro 2026-11-22 run 13, for ep023-poolbot — pro-v3 test #1, outdoor, real Tel-Aviv backyard).
// Generic, no brand, our own work → CC0. Real metres, y-up. REAL-WORLD colours built in: every material carries userData.real = true,
// so look-pro.js realWorld() keeps it as is (no hero → real recolour). Brand colours: light blue #8ea6ff = signal / low voltage, deep blue #4f6fe0 = 230 V / force. No glow.
// Export: python3 tools/make_props.py pool/   (also people/mannequin-tread, people/mannequin-childTread)
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mannequin} from './kit.js';

const R = (color, rough = .8, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
export const PM = {
  plaster: R(0xd8d3ca, .9), plaster2: R(0xcbc5ba, .9), stone: R(0xc9bda6, .85), coping: R(0xd9d3c7, .7), deck: R(0x9c7656, .75), deck2: R(0x8c6a4c, .75),
  poolWall: R(0xbcd6d9, .6), poolFloor: R(0xaacbcf, .65), tile: R(0x3f8aa6, .35), grout: R(0xcfe2e4, .7),
  water: R(0x2f9fbf, .04, 0, {transparent: true, opacity: .6, depthWrite: false, side: THREE.DoubleSide}),
  glass: R(0x1c2a33, .06, .2, {transparent: true, opacity: .75}), frame: R(0x3a3d42, .45, .6), steel: R(0xc9ced4, .22, .9), chrome: R(0xe2e6ea, .12, 1),
  leaf: R(0x4f6b33, .9), leaf2: R(0x5f7f3d, .9), leaf3: R(0x6f8a52, .9), olive: R(0x7c8a5f, .9), trunk: R(0x6b5744, .95), soil: R(0x4b3a2c, 1), pot: R(0xc9b8a2, .85),
  fabric: R(0xf3efe7, .9), fabric2: R(0xd9d3c8, .9), wood: R(0xa57a52, .7),
  // electrical
  plastic: R(0xe7e8e6, .45), plastic2: R(0xcfd1d0, .5), greyDark: R(0x3b3e43, .55), black: R(0x141518, .7), rubber: R(0x0f1012, .9),
  copper: R(0xb87333, .32, .85), core: R(0x585e66, .45, .7), lam: R(0x4a4f56, .5, .6), pcb: R(0x1f4d3a, .6), solder: R(0xc9cdd2, .3, .9),
  cableGrey: R(0x2f3338, .55), floatGrey: R(0xe3e5e8, .5), smoke: R(0x2a3640, .1, .1, {transparent: true, opacity: .55}),
  white: R(0xf7f7f5, .38, .02), botTop: R(0x283846, .28, .1), brush: R(0xb7bec6, .85), seal: R(0x1a1b1e, .9),
  acc: R(0x8ea6ff, .55), force: R(0x4f6fe0, .55), paper: R(0xfbfaf6, .9),
};
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...kids) => { const g = new THREE.Group(); if (name) g.name = name; kids.forEach(k => g.add(k)); return g; };
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);
const rbox = (w, h, d, r, m, name) => mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name);
const cyl = (rt, rb, h, m, name, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const spot = (name, x, y, z) => at(grp(name), x, y, z);
const tube = (pts, r, m, name, seg = 64) => { const v = pts.map(p => new THREE.Vector3(...p)); const o = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v, false, 'centripetal'), seg, r, 8), m, name); o.userData.path = pts.flat(); return o; };
const rng = seed => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };

// ---------- the backyard ----------
/** Tel-Aviv backyard with a pool. ORIGIN = deck top (y 0); load with st.model() + scene.add (st.prop would lift the basin onto y 0).
 * Plot x −7..7, z −6..6 (house wall at the back, z −6, facing +z; camera side +z open). Pool basin x −4..4, z −1..3, floor y −1.5, water surface y −0.12.
 * Nodes: house (wall, 'slidingDoor', windows), deck, coping, poolBasin (walls + 'poolFloor' + tile band), 'water' (plane 8×4, 96×48 segs, y −0.12 — fx-pool.js poolWater() animates it),
 * 'causticFloor' (plane on the floor for fx caustics, hidden until fx), ladder, steps (shallow end +x), poolLight0/1, gardenWallL/R, plants (bushes, 'olive' tree, planters), lounger0/1, 'outdoorShower'.
 * Spots (empty groups, read .getWorldPosition): socketSpot (on the house wall, y .45 — place pool/wallSocket here, back = −z), psuSpot (deck, 3.8 m from the water),
 * panelSpot (house wall next to the door, y 1.5 — pool/electricPanel), robotSpot (pool floor, deep end), copingSpot (where the cable goes over the edge), swimSpot (water, for the swimmer/child). */
export function backyard() {
  const g = grp('backyard');
  // house back wall with a sliding door + window
  const house = grp('house'); g.add(house);
  const wallShape = new THREE.Shape(); wallShape.moveTo(-7, 0); wallShape.lineTo(7, 0); wallShape.lineTo(7, 3.3); wallShape.lineTo(-7, 3.3); wallShape.lineTo(-7, 0);
  const hole = (x0, y0, x1, y1) => { const h = new THREE.Path(); h.moveTo(x0, y0); h.lineTo(x0, y1); h.lineTo(x1, y1); h.lineTo(x1, y0); h.lineTo(x0, y0); wallShape.holes.push(h); };
  hole(-3.6, 0, -.6, 2.4); hole(1.0, 1.0, 2.6, 2.3);
  const wg = new THREE.ExtrudeGeometry(wallShape, {depth: .3, bevelEnabled: false}); wg.translate(0, 0, -6.3); house.add(mesh(wg, PM.plaster, 'wall'));
  house.add(B(14.2, .14, .45, PM.plaster2, 0, 3.37, -6.1, 'parapet'));
  const door = grp('slidingDoor'); house.add(door);
  door.add(B(3.0, 2.4, .05, PM.glass, -2.1, 1.2, -6.12, 'doorGlass'));
  for (const x of [-3.6, -2.1, -.6]) door.add(B(.06, 2.4, .09, PM.frame, x, 1.2, -6.1));
  door.add(B(3.0, .06, .09, PM.frame, -2.1, 2.37, -6.1)); door.add(B(3.0, .05, .09, PM.frame, -2.1, .025, -6.1));
  house.add(B(1.6, 1.3, .05, PM.glass, 1.8, 1.65, -6.12, 'windowGlass')); house.add(B(1.7, .05, .2, PM.plaster2, 1.8, .98, -5.98, 'sill'));
  for (let i = 0; i < 9; i++) house.add(B(1.6, .02, .04, PM.frame, 1.8, 1.05 + i * .145, -6.08, i ? null : 'shutter'));   // half-open trisol
  house.add(B(3.4, .12, 1.4, PM.plaster2, -2.1, 2.75, -5.4, 'pergolaBeam'));
  house.add(B(.06, .06, .9, PM.frame, -4.7, 2.65, -5.6));   // outdoor lamp arm
  house.add(at(cyl(.09, .07, .14, PM.greyDark, 'wallLamp', 16), -4.7, 2.55, -5.15));
  // deck = stone around the pool + wooden strip by the house
  const ds = new THREE.Shape(); ds.moveTo(-7, -6); ds.lineTo(7, -6); ds.lineTo(7, 6); ds.lineTo(-7, 6); ds.lineTo(-7, -6);
  const ph = new THREE.Path(); ph.moveTo(-4, -1); ph.lineTo(-4, 3); ph.lineTo(4, 3); ph.lineTo(4, -1); ph.lineTo(-4, -1); ds.holes.push(ph);
  const dg = new THREE.ExtrudeGeometry(ds, {depth: .25, bevelEnabled: false}); dg.rotateX(Math.PI / 2); g.add(mesh(dg, PM.stone, 'deck'));   // top at y 0
  const wood = grp('woodDeck'); g.add(wood); for (let i = 0; i < 22; i++) wood.add(B(.13, .03, 2.2, i % 2 ? PM.deck : PM.deck2, -6.9 + i * .14 + 3.6, .015, -4.85));
  // stone joints (thin lines) so the deck reads as real slabs
  const jm = R(0xb3a68e, .95), seg = (a0, a1, f) => { if (a1 - a0 > .01) f((a0 + a1) / 2, a1 - a0); };   // joints skip the pool opening (x −4.3..4.3, z −1.3..3.3)
  for (let x = -6.4; x < 7; x += .6) { if (Math.abs(x) > 4.3) g.add(B(.008, .004, 12, jm, x, .002, 0)); else { seg(-6, -1.3, (c, l) => g.add(B(.008, .004, l, jm, x, .002, c))); seg(3.3, 6, (c, l) => g.add(B(.008, .004, l, jm, x, .002, c))); } }
  for (let z = -5.4; z < 6; z += .6) { if (z < -1.3 || z > 3.3) g.add(B(14, .004, .008, jm, 0, .002, z)); else { g.add(B(2.7, .004, .008, jm, -5.65, .002, z)); g.add(B(2.7, .004, .008, jm, 5.65, .002, z)); } }
  // coping
  const cop = grp('coping'); g.add(cop);
  cop.add(B(8.6, .05, .3, PM.coping, 0, .025, -1.15)); cop.add(B(8.6, .05, .3, PM.coping, 0, .025, 3.15)); cop.add(B(.3, .05, 4.0, PM.coping, -4.15, .025, 1)); cop.add(B(.3, .05, 4.0, PM.coping, 4.15, .025, 1));
  // basin
  const bas = grp('poolBasin'); g.add(bas);
  const D = 1.5, Y = -D / 2;
  bas.add(B(8, D, .05, PM.poolWall, 0, Y, -1.025)); bas.add(B(8, D, .05, PM.poolWall, 0, Y, 3.025));
  bas.add(B(.05, D, 4, PM.poolWall, -4.025, Y, 1)); bas.add(B(.05, D, 4, PM.poolWall, 4.025, Y, 1));
  bas.add(B(8, .05, 4, PM.poolFloor, 0, -D - .025, 1, 'poolFloor'));
  // waterline tile band (with grout cuts)
  const tb = grp('tileBand'); bas.add(tb);
  tb.add(B(8, .15, .012, PM.tile, 0, -.14, -.994)); tb.add(B(8, .15, .012, PM.tile, 0, -.14, 2.994)); tb.add(B(.012, .15, 4, PM.tile, -3.994, -.14, 1)); tb.add(B(.012, .15, 4, PM.tile, 3.994, -.14, 1));
  for (let x = -3.85; x < 4; x += .15) { tb.add(B(.006, .15, .004, PM.grout, x, -.14, -.987)); tb.add(B(.006, .15, .004, PM.grout, x, -.14, 2.987)); }
  // floor lane line (classic pool detail)
  bas.add(B(6.4, .006, .2, PM.tile, 0, -D + .004, 1, 'laneLine')); bas.add(B(.2, .006, 1.0, PM.tile, 3.2, -D + .004, 1)); bas.add(B(.2, .006, 1.0, PM.tile, -3.2, -D + .004, 1));
  // shallow-end steps (+x)
  const steps = grp('steps'); bas.add(steps); for (let i = 0; i < 3; i++) steps.add(B(.42, .35 * (i + 1), 1.6, PM.poolWall, 3.79 - i * .42, -D + .175 * (i + 1), -.2));
  for (let i = 0; i < 3; i++) steps.add(B(.42, .012, 1.6, PM.tile, 3.79 - i * .42, -D + .35 * (i + 1) + .002, -.2));
  // lights (off, solid)
  [-2, 2].forEach((x, i) => bas.add(at(cyl(.12, .12, .02, PM.chrome, 'poolLight' + i, 24), x, -.7, 2.99, Math.PI / 2)));
  // water + caustic plane (fx)
  const wgeo = new THREE.PlaneGeometry(8, 4, 96, 48); wgeo.rotateX(-Math.PI / 2); g.add(at(mesh(wgeo, PM.water, 'water'), 0, -.12, 1));
  const cf = new THREE.PlaneGeometry(8, 4); cf.rotateX(-Math.PI / 2); const cfm = at(mesh(cf, R(0xffffff, 1, 0, {transparent: true, opacity: 0}), 'causticFloor'), 0, -D + .006, 1); cfm.castShadow = false; g.add(cfm);
  // ladder (deep end, −x)
  const lad = grp('ladder'); at(lad, -3.0, 0, -1.0); g.add(lad);
  for (const x of [-.25, .25]) lad.add(tube([[x, .05, -.3], [x, .8, -.3], [x, .95, -.05], [x, .3, .05], [x, -1.1, .06]], .022, PM.chrome, null, 40));
  for (let i = 0; i < 3; i++) lad.add(B(.46, .03, .08, PM.chrome, 0, -.25 - i * .3, .1));
  // garden walls + planting strip
  for (const [n, x] of [['gardenWallL', -7.1], ['gardenWallR', 7.1]]) { g.add(B(.2, 1.9, 12.3, PM.plaster, x, .95, -.05, n)); g.add(B(.26, .06, 12.3, PM.plaster2, x, 1.93, -.05)); }
  const pl = grp('plants'); g.add(pl); const rr = rng(23);
  for (const sx of [-1, 1]) { pl.add(B(.7, .3, 9.6, PM.plaster2, sx * 6.6, .15, .6)); pl.add(B(.62, .02, 9.5, PM.soil, sx * 6.6, .305, .6));
    for (let k = 0; k < 9; k++) { const s = .35 + rr() * .3; const b = mesh(new THREE.IcosahedronGeometry(s, 1), [PM.leaf, PM.leaf2, PM.leaf3][k % 3]); b.scale.set(1, .85, 1); pl.add(at(b, sx * (6.6 + (rr() - .5) * .2), .3 + s * .7, -3.6 + k * 1.05)); } }
  // olive tree in a big planter (front-left)
  const ol = grp('olive'); at(ol, -5.6, 0, 4.6); g.add(ol);
  ol.add(at(cyl(.55, .45, .6, PM.pot, null, 28), 0, .3, 0)); ol.add(at(cyl(.5, .5, .02, PM.soil, null, 28), 0, .6, 0));
  ol.add(tube([[0, .55, 0], [.08, 1.2, .05], [-.05, 1.8, 0], [.1, 2.2, -.05]], .07, PM.trunk, null, 24));
  for (let k = 0; k < 14; k++) { const a = k * 2.4, r = .25 + rr() * .55, s = .28 + rr() * .2; const b = mesh(new THREE.IcosahedronGeometry(s, 1), PM.olive); b.scale.set(1, .7, 1); ol.add(at(b, Math.cos(a) * r, 2.1 + rr() * .7, Math.sin(a) * r)); }
  // loungers on the +x side deck (pool ↔ garden wall)
  [1.0, 3.3].forEach((z, i) => { const l = grp('lounger' + i); at(l, 5.55, 0, z); g.add(l);
    l.add(B(.66, .05, 1.35, PM.wood, 0, .32, .25)); l.add(at(B(.66, .05, .75, PM.wood, 0, 0, 0), 0, .52, -.68, -.6)); l.add(B(.6, .06, 1.3, PM.fabric, 0, .37, .25)); l.add(at(B(.6, .05, .72, PM.fabric, 0, 0, 0), 0, .57, -.66, -.6));
    for (const [x, zz] of [[-.3, .85], [.3, .85], [-.3, -.4], [.3, -.4]]) l.add(B(.05, .3, .05, PM.wood, x, .15, zz)); });
  // outdoor shower post (Israeli backyard pool classic)
  const sh = grp('outdoorShower'); at(sh, -6.2, 0, -3.0); g.add(sh); sh.add(at(cyl(.035, .035, 2.2, PM.steel, null, 12), 0, 1.1, 0)); sh.add(B(.35, .03, .03, PM.steel, .17, 2.2, 0)); sh.add(at(cyl(.12, .1, .03, PM.chrome, null, 20), .34, 2.18, 0));
  sh.add(B(.8, .04, .8, PM.deck, .1, .02, 0));
  // spots
  g.add(spot('socketSpot', 3.4, .45, -6.0), spot('psuSpot', 4.7, 0, -4.9), spot('panelSpot', -4.9, 1.5, -6.0), spot('robotSpot', -1.4, -D, 1.6), spot('copingSpot', 2.6, .05, -1.0), spot('swimSpot', 1.2, -.12, 1.4));
  return g;
}

// ---------- outdoor wall socket ----------
/** outdoor IP44 wall socket (back = −z, faces +z, origin = wall surface centre). Nodes: base, 'cover' (hinged at the top, open = .rotation.x −1.4), face, holes, 'plug' (plugged in), 'plugCable' start ('cableOut' spot under the plug). */
export function wallSocket() {
  const g = grp('wallSocket');
  g.add(at(rbox(.09, .11, .045, .012, PM.plastic, 'base'), 0, 0, .022));
  g.add(at(cyl(.03, .03, .012, PM.plastic2, 'face', 32), 0, -.005, .048, Math.PI / 2));
  const holes = grp('holes'); g.add(holes); for (const [x, y] of [[-.009, -.012], [.009, -.012], [0, .006]]) holes.add(at(cyl(.0025, .0025, .002, PM.black, null, 8), x, y - .005, .055, Math.PI / 2));
  const cov = grp('cover'); at(cov, 0, .055, .05); g.add(cov); cov.add(at(rbox(.085, .1, .02, .01, PM.plastic, 'coverShell'), 0, -.05, .01)); cov.add(B(.03, .006, .004, PM.plastic2, 0, -.095, .021));
  cov.rotation.x = -1.35;
  const plug = grp('plug'); at(plug, 0, -.005, .06); g.add(plug); plug.add(at(cyl(.024, .028, .045, PM.greyDark, 'plugBody', 24), 0, 0, .02, Math.PI / 2));
  plug.add(at(cyl(.008, .006, .03, PM.black, null, 12), 0, -.02, .04, -.5));
  g.add(spot('cableOut', 0, -.035, .085));
  return g;
}

// ---------- the power supply box with a transformer cutaway ----------
/** pool-robot power supply on a short post (deck, origin = ground, faces +z). Box .32 × .42 × .17 at y .55–.97.
 * shell (ghost it for the cutaway): 'housing', 'lid' (front cover), 'screen' plane (aspect 1.6, st.screen: timer), 'ledOn' (light blue solid).
 * insides (aligned): 'core' (laminated steel ring), 'coilA' (left leg, 230 V side, band 'coilABand' deep blue #4f6fe0), 'coilB' (right leg, low-voltage side, band 'coilBBand' light blue),
 * 'gap' (spot between the two windings — they never touch), field0..5 (arcs coil A → coil B over the gap, opacity 0 — fx-pool.js fieldPulse() animates), 'board' (rectifier PCB),
 * 'wireA' (in-port → coil A, deep blue, userData.path) · 'wireB' (coil B → out-port, light blue). Spots 'inPort' (bottom-left, mains cable from the socket), 'outPort' (bottom-right, floating cable to the pool). */
export function powerBox() {
  const g = grp('powerBox');
  g.add(at(cyl(.035, .035, .55, PM.greyDark, 'post', 16), 0, .275, -.03)); g.add(B(.3, .025, .22, PM.greyDark, 0, .012, -.03, 'foot'));
  const sh = grp('shell'); g.add(sh);
  sh.add(at(rbox(.32, .42, .17, .025, PM.plastic, 'housing'), 0, .76, 0));
  const lid = at(rbox(.3, .3, .012, .012, PM.plastic2, 'lid'), 0, .78, .088); sh.add(lid);
  const scr = at(mesh(new THREE.PlaneGeometry(.16, .1), R(0x10161c, .3), 'screen'), 0, .86, .0947); scr.userData.aspect = 1.6; sh.add(scr);
  sh.add(at(cyl(.008, .008, .004, PM.acc, 'ledOn', 12), .11, .9, .095, Math.PI / 2));
  for (let i = 0; i < 6; i++) sh.add(B(.008, .12, .004, PM.greyDark, -.11 + i * .02, .68, .095, i ? null : 'vents'));
  sh.add(B(.34, .02, .19, PM.plastic2, 0, .98, 0, 'roofCap'));
  const ins = grp('insides'); at(ins, 0, .76, 0); g.add(ins);
  // laminated core: a rectangular ring with two legs
  const core = grp('core'); ins.add(core);
  core.add(B(.2, .03, .05, PM.core, 0, .085, 0)); core.add(B(.2, .03, .05, PM.core, 0, -.085, 0)); core.add(B(.03, .2, .05, PM.core, -.085, 0, 0)); core.add(B(.03, .2, .05, PM.core, .085, 0, 0));
  for (let i = 0; i < 9; i++) core.add(B(.202, .002, .052, PM.lam, 0, .072 + i * .003, 0));
  // windings (copper turns) — A on the left leg, B on the right leg, NOT touching
  const coil = (name, x, band, turns, r) => { const c = grp(name); at(c, x, 0, 0); for (let k = 0; k < turns; k++) c.add(at(mesh(new THREE.TorusGeometry(r, .0045, 6, 28), PM.copper), 0, -.05 + k * .1 / (turns - 1), 0, Math.PI / 2));
    c.add(at(mesh(new THREE.CylinderGeometry(r + .004, r + .004, .012, 28, 1, true), band, name + 'Band'), 0, .062, 0)); return c; };
  ins.add(coil('coilA', -.085, PM.force, 14, .034)); ins.add(coil('coilB', .085, PM.acc, 9, .034));
  ins.add(spot('gap', 0, 0, 0));
  // field arcs over the gap (A → B), hidden until the fx
  for (let i = 0; i < 6; i++) { const r = .05 + i * .012; const m = R(0x8ea6ff, .6, 0, {transparent: true, opacity: 0, depthWrite: false});
    const a = mesh(new THREE.TorusGeometry(r, .0025, 6, 40, Math.PI), m, 'field' + i); at(a, 0, -.02 + (i % 2) * .04, .03 + (i % 3) * .004); a.castShadow = false; ins.add(a); }
  // rectifier board under the core
  const bd = grp('board'); at(bd, 0, -.15, 0); ins.add(bd); bd.add(B(.24, .006, .1, PM.pcb)); for (let i = 0; i < 6; i++) bd.add(at(cyl(.008, .008, .02, PM.greyDark, null, 10), -.09 + i * .036, .013, .02));
  bd.add(B(.04, .02, .03, PM.black, .08, .013, -.025)); bd.add(B(.03, .03, .02, PM.core, -.08, .018, -.025));
  ins.add(tube([[-.12, -.2, .03], [-.12, -.12, .03], [-.12, -.03, .035], [-.085, -.05, .04]], .004, PM.force, 'wireA', 24));
  ins.add(tube([[.085, -.05, .04], [.12, -.03, .035], [.12, -.12, .03], [.12, -.2, .03]], .004, PM.acc, 'wireB', 24));
  // cable glands
  sh.add(at(cyl(.014, .014, .03, PM.black, 'glandA', 14), -.1, .54, 0)); sh.add(at(cyl(.014, .014, .03, PM.black, 'glandB', 14), .1, .54, 0));
  g.add(spot('inPort', -.1, .52, 0), spot('outPort', .1, .52, 0));
  return g;
}

// ---------- the pool robot with a sealed-motor cutaway ----------
/** realistic generic pool robot (0.44 × 0.27 × 0.42 m, faces +z, sits on y 0). White shell, smoked top, brand light-blue side stripe.
 * shell (ghost it for the x-ray): body, top, 'stripeL/R', handle, 'filterDoor'. Drive: trackL/R (with treads), brushF/B (spin .rotation.x).
 * insides: 'motorHousing' (sealed steel can along x) split into 'housingFront' (hide it = cutaway) + 'housingBack', 'sealL/R' (rubber O-rings), 'motor' (copper winding) with 'rotor' (spin .x),
 * 'dry' (pale air volume inside the can = dry), 'pump' with 'impeller' (spin .y) under the top outlet, 'board' (control PCB in its own sealed box 'boardBox'),
 * 'lowWire' (gland → board → motor, light blue, userData.path), 'cableGland' (back, where the floating cable enters) + spot 'cableIn'. */
export function poolBot() {
  const g = grp('poolBot');
  const sh = grp('shell'); g.add(sh);
  sh.add(at(rbox(.42, .17, .42, .06, PM.white, 'body'), 0, .15, 0));
  sh.add(at(rbox(.36, .06, .34, .03, PM.botTop, 'top'), 0, .245, -.01));
  sh.add(at(cyl(.06, .07, .03, PM.botTop, 'outlet', 28), 0, .285, -.03)); sh.add(at(mesh(new THREE.TorusGeometry(.058, .006, 8, 28), PM.greyDark), 0, .3, -.03, Math.PI / 2));
  for (const [n, x] of [['stripeL', .211], ['stripeR', -.211]]) sh.add(B(.004, .03, .34, PM.acc, x, .17, 0, n));
  sh.add(at(mesh(new THREE.TorusGeometry(.11, .016, 10, 28, Math.PI), PM.greyDark, 'handle'), 0, .28, .1, 0, 0, 0));
  sh.add(B(.3, .07, .012, PM.smoke, 0, .14, .212, 'filterDoor'));
  for (const [n, x] of [['trackL', .235], ['trackR', -.235]]) { const t = grp(n); at(t, x, .075, 0); g.add(t); t.add(rbox(.05, .15, .46, .07, PM.rubber));
    for (let k = 0; k < 14; k++) t.add(B(.054, .01, .014, PM.black, 0, -.072, -.21 + k * .032)); t.add(at(cyl(.055, .055, .052, PM.plastic2, null, 20), 0, 0, .16, 0, 0, Math.PI / 2)); t.add(at(cyl(.055, .055, .052, PM.plastic2, null, 20), 0, 0, -.16, 0, 0, Math.PI / 2)); }
  for (const [n, z] of [['brushF', .19], ['brushB', -.19]]) { const b = grp(n); at(b, 0, .05, z); g.add(b); b.add(at(cyl(.045, .045, .4, PM.brush, null, 20), 0, 0, 0, 0, 0, Math.PI / 2));
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; b.add(at(B(.4, .008, .02, PM.plastic, 0, 0, 0), 0, Math.cos(a) * .046, Math.sin(a) * .046, a)); } }
  // insides
  const ins = grp('insides'); g.add(ins);
  const mh = grp('motorHousing'); at(mh, 0, .12, -.02); ins.add(mh);
  const half = (name, a0) => mesh(new THREE.CylinderGeometry(.055, .055, .24, 32, 1, true, a0, Math.PI), R(0xc9ced4, .25, .9, {side: THREE.DoubleSide}), name);
  const hf = half('housingFront', -Math.PI / 2), hb = half('housingBack', Math.PI / 2); hf.rotation.z = hb.rotation.z = Math.PI / 2; mh.add(hf, hb);
  for (const [n, x] of [['sealL', .12], ['sealR', -.12]]) { mh.add(at(cyl(.056, .056, .012, PM.chrome, null, 32), x, 0, 0, 0, 0, Math.PI / 2)); mh.add(at(mesh(new THREE.TorusGeometry(.056, .006, 8, 32), PM.seal, n), x * .94, 0, 0, 0, Math.PI / 2)); }
  mh.add(at(cyl(.05, .05, .22, R(0xeaf6ff, .9, 0, {transparent: true, opacity: .25, depthWrite: false}), 'dry', 24), 0, 0, 0, 0, 0, Math.PI / 2));
  const mot = grp('motor'); mh.add(mot); for (let k = 0; k < 12; k++) mot.add(at(mesh(new THREE.TorusGeometry(.04, .005, 6, 24), PM.copper), -.07 + k * .0127, 0, 0, 0, Math.PI / 2));
  const rot = grp('rotor'); mot.add(rot); rot.add(at(cyl(.025, .025, .18, PM.core, null, 16), 0, 0, 0, 0, 0, Math.PI / 2)); for (let k = 0; k < 4; k++) rot.add(at(B(.17, .006, .05, PM.lam, 0, 0, 0), 0, 0, 0, k * Math.PI / 4));
  rot.add(at(cyl(.006, .006, .3, PM.steel, 'shaft', 10), 0, 0, 0, 0, 0, Math.PI / 2));
  const pump = grp('pump'); at(pump, 0, .2, -.03); ins.add(pump); pump.add(at(cyl(.05, .05, .02, PM.greyDark, null, 24), 0, -.015, 0));
  const imp = grp('impeller'); pump.add(imp); for (let k = 0; k < 6; k++) imp.add(at(B(.045, .03, .006, PM.plastic2, 0, 0, 0), Math.cos(k * 1.047) * .022, 0, Math.sin(k * 1.047) * .022, 0, -k * 1.047));
  const bb = grp('boardBox'); at(bb, 0, .2, -.15); ins.add(bb); bb.add(rbox(.16, .04, .07, .01, R(0xc9ced4, .3, .85), null)); const bd = at(B(.13, .004, .05, PM.pcb, 0, .022, 0, 'board'), 0, .022, 0); bb.add(bd);
  ins.add(tube([[0, .21, -.205], [0, .2, -.17], [.04, .19, -.12], [.08, .15, -.06], [.09, .13, -.02]], .004, PM.acc, 'lowWire', 32));
  g.add(at(cyl(.016, .016, .03, PM.black, 'cableGland', 14), 0, .21, -.215, Math.PI / 2));
  g.add(spot('cableIn', 0, .21, -.235));
  return g;
}

// ---------- home electrical panel with an RCD ----------
/** Israeli-style home panel (flush in the wall, faces +z, origin = centre of the box face). .46 × .62 × .1.
 * 'door' (hinge left, open = .rotation.y −1.9) with 'doorWindow' (smoked), rows: 'main' (4-module main switch), 'rcd' (ממסר פחת, 4 modules) with **'rcdLever'** (pivot; ON = .rotation.x −.45 (up), OFF = +.45 (down) — fx-pool.js rcdTrip()),
 * 'rcdTest' (light-blue test button), 'rcdWindow' (small status flag: 'rcdFlag' — set colour), breaker0..15 (1 module each, 'lever{i}'), 'labelPlate' plane over the RCD (aspect 3, st.screen: 'ממסר פחת'). Generic, no brand. */
export function electricPanel() {
  const g = grp('electricPanel');
  g.add(B(.5, .66, .02, PM.plastic, 0, 0, .01, 'frame')); g.add(B(.44, .6, .1, PM.plastic2, 0, 0, -.05, 'box'));
  const mod = .018, row = (y, items) => { let x = -.2; for (const it of items) { const w = it.w * mod; const o = grp(it.name); at(o, x + w / 2, y, .02); g.add(o);
      o.add(rbox(w - .001, .085, .06, .004, PM.white)); o.add(B(w - .002, .02, .01, PM.plastic2, 0, -.032, .031));
      const lv = grp(it.lever); lv.add(at(B(Math.min(.012, w * .5), .03, .014, it.leverMat || PM.greyDark, 0, .015, .0, it.lever + 'Knob'), 0, .015, 0)); at(lv, 0, .005, .031); lv.rotation.x = -.45; o.add(lv);
      if (it.extra) it.extra(o, w); x += w; } };
  g.add(B(.42, .012, .006, PM.steel, 0, .19, .0, 'rail0')); g.add(B(.42, .012, .006, PM.steel, 0, 0, .0, 'rail1')); g.add(B(.42, .012, .006, PM.steel, 0, -.19, .0, 'rail2'));
  row(.19, [{name: 'main', w: 4, lever: 'mainLever', leverMat: PM.force}, {name: 'rcd', w: 4, lever: 'rcdLever', leverMat: PM.greyDark, extra: (o, w) => {
      o.add(at(cyl(.006, .006, .006, PM.acc, 'rcdTest', 12), w * .3, -.018, .032, Math.PI / 2));
      o.add(B(.012, .008, .004, PM.black, -w * .3, -.018, .031, 'rcdWindow')); o.add(B(.01, .006, .003, R(0x3aa655, .6), -w * .3, -.018, .034, 'rcdFlag')); }},
    {name: 'spd', w: 2, lever: 'spdLever'}, {name: 'meterBlank', w: 2, lever: 'blankLever'}]);
  let i = 0; for (const y of [0, -.19]) row(y, Array.from({length: 12}, () => ({name: 'breaker' + i, w: 1, lever: 'lever' + (i++)})));
  const lp = at(mesh(new THREE.PlaneGeometry(.072, .024), PM.paper, 'labelPlate'), -.2 + 6 * mod, .255, .052); lp.userData.aspect = 3; g.add(lp);
  // door (hinged left)
  const d = grp('door'); at(d, -.24, 0, .03); g.add(d); d.add(B(.48, .64, .015, PM.plastic, .24, 0, 0, 'doorShell'));
  d.add(B(.38, .5, .006, PM.smoke, .24, 0, .009, 'doorWindow')); d.add(B(.02, .08, .02, PM.plastic2, .45, 0, .015, 'doorLatch'));
  d.rotation.y = -1.9;
  return g;
}

// ---------- people in the water (calm grey silhouettes in pro-v3) ----------
/** adult treading water / standing chest-deep: arms out on the surface, knees soft. Faces +z. Water line ≈ y 1.25 when standing on the floor. */
export function mannequinTread() { const g = mannequin('stand'); g.name = 'mannequinTread'; g.getObjectByName('phone').visible = false;
  const P = (n, x, y = 0, z = 0) => g.getObjectByName(n).rotation.set(x, y, z);
  P('shoulderR', -.2, 0, -1.15); P('shoulderL', -.2, 0, 1.15); P('elbowR', -.3); P('elbowL', -.3); P('hipR', -.25, 0, -.08); P('hipL', .2, 0, .08); P('kneeR', .5); P('kneeL', .35); P('head', -.05); return g; }
/** child (1.2 m) treading water, legs kicking (animate hipL/R + kneeL/R .rotation.x); 'ankleL'/'ankleR' spots on the shins for the cable tangle. Faces +z. */
export function mannequinChildTread() { const g = mannequinTread(); g.name = 'mannequinChildTread'; const s = grp('scaleRoot'); s.add(...g.children.slice()); s.scale.setScalar(.7); g.add(s);
  for (const k of ['L', 'R']) { const kn = g.getObjectByName('knee' + k); kn.add(spot('ankle' + k, 0, -.38, 0)); }
  g.getObjectByName('headMesh').scale.multiplyScalar(1.12); return g; }

export const KITPOOL = {
  'pool/backyard': backyard, 'pool/wallSocket': wallSocket, 'pool/powerBox': powerBox, 'pool/poolBot': poolBot, 'pool/electricPanel': electricPanel,
  'people/mannequin-tread': mannequinTread, 'people/mannequin-childTread': mannequinChildTread,
};
