// Media pro 2026-11-27 run 19 — ep031-homehub kit (concept reel: a Hebrew home hub on the kitchen counter). A NEW apartment (not the ep026–028 house).
// Generic, no brand/logo, our own work → CC0. Real metres, y-up, front = +z (open cutaway, no ceiling). REAL colours (userData.real). No glow (lamps = matte warm emissive only).
// Export: python3 tools/make_props.py apartment31 / homeHub / splitAC / mamadDoor / shabbatTable / milkCarton / fridgeOpen
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
const R = (color, rough = .6, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
const K = { tile: R(0xd6cfc4, .35), grout: R(0xb9b1a5, .8), plaster: R(0xeeebe5, .9), plasterB: R(0xe2ddd4, .9), oak: R(0xb48d62, .55), walnut: R(0x6e4d35, .55),
  front: R(0x5d6b5e, .55), quartz: R(0xf0ede8, .25), steel: R(0xc9cdd1, .28, .85), alu: R(0xc4c8cc, .3, .8), black: R(0x17181b, .5, .2), glass: R(0x9fb8c4, .05, .1, {transparent: true, opacity: .25, depthWrite: false}),
  fabric: R(0x8b8f93, .95), fabricD: R(0x4c5560, .95), linen: R(0xf3efe6, .95), duvet: R(0xdfe5ea, .95), cushion: R(0xc98f5a, .95), rug: R(0xb9ad99, 1),
  white: R(0xf6f4f0, .42), acW: R(0xf4f4f2, .35), acD: R(0x9aa1a8, .5), mamad: R(0xd9d4c8, .45, .35), mamadD: R(0x8f8a80, .4, .5), seal: R(0x2a2b2e, .8),
  silver: R(0xd6d8da, .18, .95), wax: R(0xfaf7ef, .6), flame: R(0xffc46b, .6, 0, {emissive: 0xffa53a, emissiveIntensity: .9}), challah: R(0xb87835, .7), cloth: R(0xf2efe8, .9), clothB: R(0x4f6fe0, .8),
  wine: R(0x5a1626, .2), lampW: R(0xfff1d8, .5, 0, {emissive: 0xfff1d8, emissiveIntensity: .6}), fridgeIn: R(0xf2f4f5, .6, 0, {emissive: 0xeef3ff, emissiveIntensity: .25}), shelf: R(0xdfe8ee, .05, .1, {transparent: true, opacity: .5}),
  milkW: R(0xf7f7f5, .6), milkB: R(0x5b8fd9, .6), red: R(0xb8463a, .6), green: R(0x4e6b47, .7), pot: R(0x6d6a66, .8), road: R(0x3a3d42, .9), facade: R(0xcfc8bc, .9), winWarm: R(0xf3c98b, .6, 0, {emissive: 0xe8a85a, emissiveIntensity: .5}),
  winDark: R(0x2a3440, .3), sky: R(0x2b3a55, 1), shutter: R(0xd8d4cc, .6), rimOff: R(0xd8dde8, .4) };
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...k) => { const g = new THREE.Group(); if (name) g.name = name; k.forEach(c => g.add(c)); return g; };
const RB = (w, h, d, r, m, x, y, z, name) => at(mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name), x, y, z);
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);
const cyl = (rt, rb, h, m, name, seg = 32) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const spot = (name, x, y, z, ry = 0) => at(grp(name), x, y, z, 0, ry, 0);
function plant(h = 1.3) { const g = grp('plant'); g.add(at(cyl(.18, .14, .4, K.pot), 0, .2, 0));
  for (let i = 0; i < 9; i++) { const a = i * 2.4, l = mesh(new THREE.SphereGeometry(.2, 12, 8), K.green); l.scale.set(.6, 1.3, .25); at(l, Math.cos(a) * .11, .5 + (i % 4) * h * .17, Math.sin(a) * .11, .3 * Math.sin(a), a, .4 * Math.cos(a)); g.add(l); } return g; }

/** **everyday/homeHub** — THE ep031 device (Ziv approved 2026-11-27): 7 stepped white discs (bottom Ø 13.5 cm → narrow top), 6 light-blue rims between them, soft dome cap. ~17 cm tall. Origin = bottom centre.
 * Nodes: disc0..6, **rim0..5** (each its OWN material, colour 0xd8dde8 off → 0x7f9bff on; light them bottom→top with the voice level), 'cap', spot 'voiceSpot' (front, mid height — start of command lines). No screen, no logo. */
export function homeHub() {
  const g = grp('homeHub'), N = 7, Rr = .045, H = .018, GAP = .005;
  for (let i = 0; i < N; i++) { const r = Rr * (1.5 - .17 * i);
    g.add(at(cyl(r, r, H, K.white, 'disc' + i, 64), 0, i * (H + GAP) + H / 2, 0));
    if (i < N - 1) { const m = K.rimOff.clone(); m.userData.real = true; const rim = mesh(new THREE.CylinderGeometry(r * .985, r * .985, GAP, 64, 1, true), m, 'rim' + i); rim.castShadow = false; at(rim, 0, i * (H + GAP) + H + GAP / 2, 0); g.add(rim); } }
  const cap = mesh(new THREE.SphereGeometry(Rr * (1.5 - .17 * (N - 1)), 48, 12, 0, Math.PI * 2, 0, Math.PI / 2), K.white, 'cap'); cap.scale.y = .18; at(cap, 0, N * (H + GAP) - GAP, 0); g.add(cap);
  g.add(spot('voiceSpot', 0, .09, .08));
  return g;
}

/** **everyday/splitAC** — Israeli wall split AC indoor unit (0.92 × 0.3 × 0.23 m), generic, no logo. Origin = back-centre on the wall (put it on the wall, face +z).
 * Nodes: 'body', **'flap'** (louvre, hinge at its top edge: closed .rotation.x 0 → open −1.0), 'vanes' (vertical vanes behind the flap, .rotation.y swing ±.4), 'display' (small dark window with 'led' — solid, no glow), spot **'airOut'** (outlet centre, cold-air lines start here, pointing down/forward). */
export function splitAC() {
  const g = grp('splitAC'), W = .92, H = .3, D = .23;
  g.add(RB(W, H, D, .05, K.acW, 0, 0, D / 2, 'body'));
  g.add(B(W - .08, .006, .004, K.acD, 0, .07, D + .001), B(W - .2, .004, .004, K.acD, 0, .1, D + .001));     // seams
  const vn = grp('vanes'); at(vn, 0, -.12, D * .55); g.add(vn); for (let i = 0; i < 9; i++) vn.add(B(.004, .05, .07, K.acD, -.36 + i * .09, 0, 0));
  g.add(B(W - .1, .06, .12, K.black, 0, -.125, D * .55));                                                   // dark outlet mouth
  const fl = grp('flap'); at(fl, 0, -.12, D - .005); g.add(fl); fl.add(RB(W - .1, .012, .1, .005, K.acW, 0, -.006, -.045, 'flapBlade'));
  const dp = grp('display'); at(dp, .3, -.04, D + .002); g.add(dp); dp.add(RB(.09, .035, .004, .006, K.winDark, 0, 0, 0)); dp.add(at(mesh(new THREE.CircleGeometry(.004, 12), K.lampW, 'led'), .03, 0, .003));
  g.add(spot('airOut', 0, -.16, D + .05));
  return g;
}

/** **everyday/mamadDoor** — Israeli safe-room (mamad) steel door in its thick frame, 0.8 × 2.0 m leaf, 8 cm thick, painted beige-grey, black rubber seal, two big lever handles + a peephole-less flat face. Generic.
 * Origin = floor centre of the doorway, face +z (outside of the mamad). Nodes: 'frame', **'leaf'** (hinge on the left edge: open = .rotation.y −1.4, opens outward toward +z), 'leverTop', 'leverBottom' (on the leaf, .rotation.z −.6 = unlocked),
 * 'inside' (a slice of the mamad room behind: walls, a bunk bed, water bottles shelf, blast-window 'blastWin' steel shutter), spots **'doorSpot'** (1 m in front), **'insideSpot'** (inside the room). */
export function mamadDoor() {
  const g = grp('mamadDoor'), W = .8, H = 2.0, T = .08, F = .09, WALL = .3;
  const fr = grp('frame'); g.add(fr); fr.add(B(F, H + F, WALL, K.mamadD, -W / 2 - F / 2, (H + F) / 2, 0), B(F, H + F, WALL, K.mamadD, W / 2 + F / 2, (H + F) / 2, 0), B(W + 2 * F, F, WALL, K.mamadD, 0, H + F / 2, 0));
  const lf = grp('leaf'); at(lf, -W / 2, 0, WALL / 2 + T / 2); g.add(lf);
  lf.add(RB(W, H, T, .01, K.mamad, W / 2, H / 2, 0, 'leafPlate'));
  for (const y of [.35, 1.0, 1.65]) lf.add(B(W - .16, .004, .004, K.mamadD, W / 2, y, T / 2 + .001));          // pressed ribs
  lf.add(B(W + .01, H + .01, .01, K.seal, W / 2, H / 2, -T / 2 - .004, 'seal'));
  const lever = (name, y) => { const l = grp(name); at(l, W - .12, y, T / 2 + .02); l.add(at(cyl(.03, .03, .04, K.mamadD, null, 20), 0, 0, 0, Math.PI / 2)); l.add(RB(.32, .04, .035, .015, K.mamadD, -.15, 0, .02)); return l; };
  lf.add(lever('leverTop', 1.25), lever('leverBottom', .8));
  lf.add(at(cyl(.012, .012, .5, K.mamadD, 'bolt', 10), W - .06, 1.5, T / 2 + .015));
  const ins = grp('inside'); g.add(ins); const D = 2.4;
  ins.add(B(2.6, .02, D, K.tile, 0, .01, -WALL / 2 - D / 2), B(2.6, 2.6, .2, K.plasterB, 0, 1.3, -WALL / 2 - D - .1), B(.2, 2.6, D, K.plasterB, -1.3, 1.3, -WALL / 2 - D / 2), B(.2, 2.6, D, K.plasterB, 1.3, 1.3, -WALL / 2 - D / 2));
  const bk = grp('bunk'); at(bk, -.75, 0, -WALL / 2 - 1.3); ins.add(bk); for (const y of [.4, 1.35]) bk.add(B(.85, .14, 1.9, K.linen, 0, y, 0), B(.9, .04, 1.95, K.oak, 0, y - .09, 0)); for (const [x, z] of [[-.43, -.95], [.43, -.95], [-.43, .95], [.43, .95]]) bk.add(B(.04, 1.7, .04, K.oak, x, .85, z));
  const sh = grp('waterShelf'); at(sh, .95, 0, -WALL / 2 - 1.6); ins.add(sh); for (const y of [.5, 1.0]) { sh.add(B(.4, .02, .9, K.oak, 0, y, 0)); for (let i = 0; i < 4; i++) sh.add(at(cyl(.04, .04, .3, K.glass, null, 12), 0, y + .16, -.33 + i * .22)); }
  const bw = grp('blastWin'); at(bw, 0, 1.6, -WALL / 2 - D + .01); ins.add(bw); bw.add(B(.8, .8, .04, K.mamadD), B(.7, .7, .02, K.mamad, 0, 0, .03));
  g.add(spot('doorSpot', 0, 0, 1.0), spot('insideSpot', .2, 0, -WALL / 2 - 1.0));
  return g;
}

/** **everyday/milkCarton** — 1 L gable-top carton (7 × 7 × 24 cm), white with a light-blue band + a simple drop mark, no brand. Origin = bottom centre. */
export function milkCarton() {
  const g = grp('milkCarton'), s = .07, h = .19;
  g.add(B(s, h, s, K.milkW, 0, h / 2, 0, 'box'), B(s + .001, .06, s + .001, K.milkB, 0, .08, 0, 'band'));
  const roof = new THREE.BufferGeometry(); const v = [-s / 2, h, -s / 2, s / 2, h, -s / 2, 0, h + .035, -s / 2, -s / 2, h, s / 2, s / 2, h, s / 2, 0, h + .035, s / 2];
  roof.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); roof.setIndex([0, 2, 1, 3, 4, 5, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 4]); roof.computeVertexNormals(); g.add(mesh(roof, K.milkW, 'roof'));
  g.add(B(.004, .012, s + .004, K.milkW, 0, h + .04, 0, 'seam'));
  const drop = mesh(new THREE.SphereGeometry(.012, 12, 10), K.milkW, 'drop'); drop.scale.set(1, 1.3, .2); at(drop, 0, .08, s / 2 + .002); g.add(drop);
  return g;
}

/** **home/fridgeOpen** — tall fridge (0.7 × 1.9 × 0.7 m, steel) with a DOOR THAT OPENS and a lit inside. Origin = floor centre, face +z.
 * Nodes: 'body', **'door'** (hinge on the right edge: open = .rotation.y 1.7), 'doorShelves' (bottles in the door), 'inside' (matte cool-white light panel 'innerLight', glass 'shelf0..3'),
 * **'milkSpot'** (where the milk carton stands on shelf 1 — empty by default: put everyday/milkCarton there, or leave it EMPTY for "the milk ran out"), food on the shelves (jars, bowl, eggs). */
export function fridgeOpen() {
  const g = grp('fridgeOpen'), W = .7, H = 1.9, D = .66;
  const bd = grp('body'); g.add(bd); bd.add(B(W, H, .03, K.steel, 0, H / 2, -D / 2 + .015), B(.03, H, D, K.steel, -W / 2 + .015, H / 2, 0), B(.03, H, D, K.steel, W / 2 - .015, H / 2, 0), B(W, .03, D, K.steel, 0, H - .015, 0), B(W, .06, D, K.steel, 0, .03, 0));
  const ins = grp('inside'); g.add(ins); ins.add(B(W - .07, H - .12, .01, K.fridgeIn, 0, H / 2, -D / 2 + .04, 'innerLight'));
  [.45, .8, 1.15, 1.5].forEach((y, i) => ins.add(B(W - .07, .008, D - .1, K.shelf, 0, y, 0, 'shelf' + i)));
  ins.add(at(cyl(.06, .05, .12, K.red, 'jar0', 20), -.2, .87, -.1), at(cyl(.05, .05, .14, K.green, 'jar1', 20), .18, 1.22, -.12), at(cyl(.12, .08, .08, K.white, 'bowl', 24), -.12, 1.19, 0));
  for (let i = 0; i < 6; i++) { const e = mesh(new THREE.SphereGeometry(.022, 12, 10), K.linen); e.scale.y = 1.25; at(e, .05 + (i % 3) * .05, .485, .1 + Math.floor(i / 3) * .05); ins.add(e); }
  ins.add(spot('milkSpot', .12, .808, .02));
  const dr = grp('door'); at(dr, W / 2, 0, D / 2); g.add(dr);
  dr.add(RB(W, H - .02, .06, .015, K.steel, -W / 2, H / 2, .03, 'doorPlate'), B(.025, .5, .03, K.black, -W + .06, 1.2, .075, 'handle'));
  const ds = grp('doorShelves'); dr.add(ds); for (const y of [.5, 1.0, 1.45]) { ds.add(B(W - .1, .1, .08, K.shelf, -W / 2, y, -.04)); for (let i = 0; i < 4; i++) ds.add(at(cyl(.03, .03, .2, i % 2 ? K.green : K.glass, null, 14), -W / 2 - .2 + i * .13, y + .1, -.04)); }
  return g;
}

/** **home/shabbatTable** — Friday-night dining table (1.8 × 0.9 m) with white cloth: two silver candlesticks with white candles (**'flame0','flame1'** matte warm teardrops — scale them, NO glow/bloom), covered challah ('challahCover' light-blue cloth, lift .position.y to reveal 'challah'), kiddush cup, 4 chairs, plates.
 * Origin = floor centre, long side along x. Spot 'candleSpot' (between the candles), 'tableTop'. Generic — no text, no symbols. */
export function shabbatTable() {
  const g = grp('shabbatTable'), L = 1.8, Wd = .9, Ht = .75;
  g.add(B(L, .04, Wd, K.oak, 0, Ht - .02, 0, 'top'), B(L + .1, .01, Wd + .1, K.cloth, 0, Ht + .005, 0, 'cloth'), B(L + .1, .25, .005, K.cloth, 0, Ht - .12, Wd / 2 + .05), B(L + .1, .25, .005, K.cloth, 0, Ht - .12, -Wd / 2 - .05));
  for (const [x, z] of [[-.8, -.38], [.8, -.38], [-.8, .38], [.8, .38]]) g.add(B(.05, Ht - .04, .05, K.walnut, x, (Ht - .04) / 2, z));
  for (const [x, z, r] of [[-.45, .78, Math.PI], [.45, .78, Math.PI], [-.45, -.78, 0], [.45, -.78, 0]]) { const c = grp(); at(c, x, 0, z, 0, r, 0); g.add(c); c.add(B(.44, .04, .44, K.walnut, 0, .46, 0), B(.44, .45, .03, K.walnut, 0, .7, -.21)); for (const [a, b] of [[-.19, -.19], [.19, -.19], [-.19, .19], [.19, .19]]) c.add(B(.03, .45, .03, K.walnut, a, .225, b)); }
  for (const [x, z] of [[-.45, .28], [.45, .28], [-.45, -.28], [.45, -.28]]) g.add(at(cyl(.13, .11, .015, K.white, null, 32), x, Ht + .022, z));
  g.traverse(o => { if (o.isMesh && o.position.y > Ht && o.position.y < Ht + .03) o.castShadow = false; });  // cloth + plates: no acne
  const cs = grp('candles'); at(cs, 0, Ht + .01, -.05); g.add(cs);
  [-.11, .11].forEach((x, i) => { cs.add(at(cyl(.05, .06, .015, K.silver, null, 24), x, .008, 0), at(cyl(.012, .016, .2, K.silver, null, 16), x, .11, 0), at(cyl(.03, .012, .03, K.silver, null, 20), x, .225, 0));
    cs.add(at(cyl(.011, .011, .14, K.wax, 'candle' + i, 14), x, .31, 0)); const f = mesh(new THREE.SphereGeometry(.011, 14, 10), K.flame, 'flame' + i); f.castShadow = false; f.scale.set(.8, 2, .8); at(f, x, .4, 0); cs.add(f); });
  cs.add(spot('candleSpot', 0, .35, 0));
  const ch = mesh(new THREE.CapsuleGeometry(.07, .2, 6, 16), K.challah, 'challah'); ch.scale.set(1, .6, .8); at(ch, .5, Ht + .055, -.05, 0, 0, Math.PI / 2); g.add(ch);
  const cv = RB(.42, .09, .24, .04, K.clothB, .5, Ht + .055, -.05, 'challahCover'); g.add(cv);
  const cup = grp('kiddushCup'); at(cup, -.5, Ht + .01, -.05); g.add(cup); cup.add(at(cyl(.035, .04, .01, K.silver), 0, .005, 0), at(cyl(.006, .006, .07, K.silver, null, 10), 0, .045, 0), at(cyl(.035, .022, .07, K.silver, null, 24), 0, .115, 0), at(cyl(.03, .03, .03, K.wine, null, 20), 0, .12, 0));
  g.add(spot('tableTop', 0, Ht + .01, 0));
  return g;
}

/** **buildings/apartment31** — NEW modern Israeli apartment at evening (ep031), dollhouse cutaway: no ceiling, front +z open, 14 × 7 m, floor y 0, x −7..7, z −4..3, walls 2.7 m.
 * Rooms (left→right): **bedroom** x −7..−3.2 (double bed, nightstands + lamps, wardrobe, wall **'ac'** = everyday splitAC above the bed, kids' bed in the corner) · partition wall at x −3.2 with **doorway** z .4..1.4 (see through it to the kitchen) ·
 * **living** x −3.2..2.6 (L-sofa facing the media wall, rug, coffee table, floor lamp, big aluminium slider window with trisim shutter → evening city outside, **'mamad'** = everyday mamadDoor in the back wall at x −1.6, **'table'** = shabbatTable at x .9 z .6) ·
 * **kitchen** x 2.6..7 (run along the back wall with sink, cooktop, hood, uppers; **'fridge'** = home/fridgeOpen in the back-right corner; **'island'** with quartz top: the device stands on **'deviceSpot'**).
 * Spots: deviceSpot (on the island, y = top), acSpot (= ac airOut), mamadSpot, sofaSpot (people/mannequin-sit origin, ry 0 faces −z), bedSpot (adult in bed), kidSpot (kid bed), hallSpot (bedroom doorway), fridgeSpot (in front of the fridge), frame0Spot (eye-level camera in the bedroom), wideSpot (high wide camera).
 * Alert paths (bedroom → mamad): use spots bedSpot → hallSpot → mamadSpot. Pendant lamps 'pendant0..2' over the island, 'floorLamp' → 'lampShade' (matte warm). */
export function apartment31() {
  const g = grp('apartment31'), H = 2.7, T = .16, Z0 = -4, Z1 = 3, X0 = -7, X1 = 7;
  const fl = grp('floor'); g.add(fl); fl.add(B(X1 - X0 + .3, .04, Z1 - Z0 + .2, K.tile, 0, -.01, (Z0 + Z1) / 2));  // top at y .01 (sits above the hero stage floor at 0 → no z-fighting)
  for (let x = X0; x <= X1 + .01; x += .8) fl.add(B(.006, .002, Z1 - Z0, K.grout, x, .0115, (Z0 + Z1) / 2)); for (let z = Z0; z <= Z1 + .01; z += .8) fl.add(B(X1 - X0, .002, .006, K.grout, 0, .0115, z));
  fl.add(B(3.8 - T, .012, Z1 - Z0 - .1, K.oak, (X0 - 3.2) / 2 + T / 2, .017, (Z0 + Z1) / 2, 'bedroomParquet'));
  // back wall with window opening (living x .2..2.4, sill .5, top 2.3) + mamad opening (x −2.09..−1.11, 0..2.09)
  const wb = grp('wallBack'); g.add(wb); const zc = Z0 - T / 2, wx0 = .2, wx1 = 2.4, s0 = .5, s1 = 2.3, mx0 = -1.6 - .49, mx1 = -1.6 + .49, mh = 2.09;
  wb.add(B(mx0 - X0, H, T, K.plaster, (X0 + mx0) / 2, H / 2, zc), B(wx0 - mx1, H, T, K.plaster, (mx1 + wx0) / 2, H / 2, zc), B(X1 - wx1, H, T, K.plaster, (wx1 + X1) / 2, H / 2, zc));
  wb.add(B(mx1 - mx0, H - mh, T, K.plaster, -1.6, (mh + H) / 2, zc), B(wx1 - wx0, s0, T, K.plaster, (wx0 + wx1) / 2, s0 / 2, zc), B(wx1 - wx0, H - s1, T, K.plaster, (wx0 + wx1) / 2, (s1 + H) / 2, zc));
  g.add(B(T, H, Z1 - Z0, K.plaster, X0 - T / 2, H / 2, (Z0 + Z1) / 2, 'wallLeft'), B(T, H, Z1 - Z0, K.plaster, X1 + T / 2, H / 2, (Z0 + Z1) / 2, 'wallRight'));
  // partition bedroom | living with doorway z .4..1.4
  const pw = grp('partition'); g.add(pw); pw.add(B(T, H, .4 - Z0, K.plaster, -3.2, H / 2, (Z0 + .4) / 2), B(T, H, Z1 - 1.4, K.plaster, -3.2, H / 2, (1.4 + Z1) / 2), B(T, H - 2.1, 1, K.plaster, -3.2, 2.1 + (H - 2.1) / 2, .9));
  pw.add(B(.04, 2.1, .06, K.white, -3.2, 1.05, .4), B(.04, 2.1, .06, K.white, -3.2, 1.05, 1.4), B(.04, .06, 1.06, K.white, -3.2, 2.1, .9));
  g.add(B(X1 - X0, .08, .012, K.white, 0, .04, Z0 + .006, 'skirting'));
  // window: alu frame, two panes, marble sill, shutter box
  const win = grp('window'); g.add(win); const fw = .05, wm = (wx0 + wx1) / 2;
  win.add(B(wx1 - wx0, fw, .12, K.alu, wm, s0 + fw / 2, zc), B(wx1 - wx0, fw, .12, K.alu, wm, s1 - fw / 2, zc), B(fw, s1 - s0, .12, K.alu, wx0 + fw / 2, (s0 + s1) / 2, zc), B(fw, s1 - s0, .12, K.alu, wx1 - fw / 2, (s0 + s1) / 2, zc), B(.05, s1 - s0, .1, K.alu, wm, (s0 + s1) / 2, zc));
  win.add(B(wx1 - wx0 - .1, s1 - s0 - .1, .006, K.glass, wm, (s0 + s1) / 2, zc, 'pane'));
  win.add(B(wx1 - wx0 + .16, .03, .26, K.quartz, wm, s0 - .015, zc + .06, 'sill'), B(wx1 - wx0 + .1, .22, .22, K.shutter, wm, s1 + .13, Z0 - T - .11, 'shutterBox'));
  const shu = grp('shutter'); at(shu, wm, s1 + .02, Z0 - T - .04); win.add(shu); for (let k = 0; k < 3; k++) shu.add(B(wx1 - wx0, .045, .015, K.shutter, 0, -k * .05, 0));
  // outside: evening sky + blocks across the street with warm windows (12 m below = 4th floor)
  const out = grp('outside'); g.add(out); const gy = -12;
  out.add(B(80, 60, .2, K.sky, 0, 10, -60, 'skyWall'), B(80, .1, 16, K.road, 0, gy, -14));
  let sd = 3; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 9; i++) { const bx = -26 + i * 6.5, bh = 14 + rnd() * 16, bz = -28 - rnd() * 10; out.add(B(5.4, bh, 6, K.facade, bx, gy + bh / 2, bz));
    for (let fy = 1.5; fy < bh - 1; fy += 3) for (let fx = -2; fx <= 2; fx += 1.4) out.add(B(.9, 1.1, .1, rnd() > .55 ? K.winWarm : K.winDark, bx + fx, gy + fy, bz + 3.02)); }
  out.traverse(o => { if (o.isMesh) o.castShadow = false; }); fl.traverse(o => { if (o.isMesh) o.castShadow = false; });  // no self-shadow acne on the big floor
  // ---- bedroom
  const bed = grp('bed'); at(bed, -5.4, 0, Z0 + 1.15); g.add(bed);
  bed.add(B(1.7, .35, 2.1, K.fabricD, 0, .175, 0), B(1.62, .2, 2.0, K.linen, 0, .45, .02, 'mattress'), RB(1.66, .12, 1.4, .05, K.duvet, 0, .58, .32, 'duvet'), B(1.8, 1.05, .1, K.fabricD, 0, .52, -1.06, 'headboard'));
  for (const x of [-.4, .4]) bed.add(RB(.6, .14, .38, .06, K.linen, x, .6, -.78));
  for (const x of [-1.2, 1.2]) { const n = grp(); at(n, x, 0, -.8); bed.add(n); n.add(B(.45, .5, .4, K.oak, 0, .25, 0), at(cyl(.07, .09, .05, K.white, null, 20), 0, .53, 0), at(cyl(.01, .01, .25, K.black, null, 8), 0, .68, 0), at(cyl(.08, .13, .16, K.lampW, null, 24), 0, .85, 0)); }
  const ac = splitAC(); ac.name = 'ac'; at(ac, -5.4, 2.25, Z0); g.add(ac);
  const wd = grp('wardrobe'); at(wd, -6.68, 0, -.4); g.add(wd); wd.add(B(.6, 2.4, 2.2, K.white, 0, 1.2, 0)); for (const z of [-.55, .55]) wd.add(B(.01, 2.3, .004, K.grout, .301, 1.2, z), B(.02, .3, .02, K.black, .31, 1.2, z + (z < 0 ? .5 : -.5)));
  const kb = grp('kidBed'); at(kb, -4.3, 0, 1.9, 0, Math.PI / 2, 0); g.add(kb); kb.add(B(.95, .3, 1.9, K.oak, 0, .15, 0), B(.9, .16, 1.85, K.linen, 0, .38, 0), RB(.9, .1, 1.1, .04, K.cushion, 0, .48, .3), RB(.5, .12, .3, .05, K.linen, 0, .5, -.7));
  g.add(at(plant(1.0), -6.6, 0, 2.5));
  // ---- living
  const sofa = grp('sofa'); at(sofa, -1.0, 0, 1.4); g.add(sofa);
  sofa.add(B(2.6, .42, .95, K.fabric, 0, .21, 0), B(2.6, .5, .2, K.fabric, 0, .62, .38), B(.95, .42, 1.7, K.fabric, -.83, .21, -.38), B(.2, .25, .95, K.fabric, 1.2, .55, 0));
  for (let i = 0; i < 3; i++) sofa.add(RB(.4, .38, .14, .05, i === 1 ? K.cushion : K.fabricD, -.7 + i * .7, .62, .25, 'pillow' + i));
  g.add(B(3.2, .012, 2.2, K.rug, -1.1, .007, .2, 'rug'), RB(1.0, .38, .6, .03, K.walnut, -1.0, .19, .1, 'coffeeTable'));
  const lamp = grp('floorLamp'); at(lamp, -2.7, 0, 2.3); g.add(lamp); lamp.add(at(cyl(.15, .17, .03, K.black), 0, .015, 0), at(cyl(.012, .012, 1.45, K.black, null, 10), 0, .74, 0), at(cyl(.16, .24, .32, K.lampW, 'lampShade', 28), 0, 1.55, 0));
  const md = mamadDoor(); md.name = 'mamad'; at(md, -1.6, 0, Z0 - T / 2); md.getObjectByName('frame').scale.z = T / .3; g.add(md);
  const tb = shabbatTable(); tb.name = 'table'; at(tb, .9, 0, .2); g.add(tb);
  g.add(at(plant(1.5), 2.25, 0, Z0 + .45));
  // ---- kitchen
  const kr = grp('kitchen'); g.add(kr); const kz = Z0 + .31, ka = 2.9, kb2 = 6.2, KL = kb2 - ka;
  kr.add(B(KL, .1, .58, K.black, (ka + kb2) / 2, .05, kz + .02), B(KL, .76, .6, K.front, (ka + kb2) / 2, .48, kz));
  for (let x = ka + .6; x < kb2; x += .6) kr.add(B(.004, .7, .005, K.grout, x, .48, kz + .301), B(.2, .012, .012, K.black, x - .3, .8, kz + .31));
  kr.add(B(KL + .02, .04, .64, K.quartz, (ka + kb2) / 2, .88, kz + .02, 'counter'), B(KL, .62, .02, K.quartz, (ka + kb2) / 2, 1.21, Z0 + .01, 'splash'));
  kr.add(B(.5, .02, .4, K.steel, 3.6, .9, kz), B(.44, .03, .34, K.black, 3.6, .905, kz)); const tap = grp('tap'); at(tap, 3.6, .9, kz - .22); kr.add(tap); tap.add(at(cyl(.016, .02, .3, K.steel, null, 16), 0, .15, 0), at(cyl(.01, .01, .16, K.steel, null, 10), 0, .3, .08, Math.PI / 2));
  kr.add(B(.58, .012, .5, K.black, 5.0, .906, kz, 'cooktop')); for (const [dx, dz] of [[-.13, -.11], [.13, -.11], [-.13, .11], [.13, .11]]) kr.add(at(mesh(new THREE.TorusGeometry(.08, .003, 6, 36), K.steel), 5.0 + dx, .914, kz + dz, Math.PI / 2));
  kr.add(B(.6, .16, .5, K.steel, 5.0, 1.6, Z0 + .25, 'hood'), B(KL, .7, .36, K.white, (ka + kb2) / 2, 1.95, Z0 + .18, 'upper'));
  for (let x = ka + .6; x < kb2; x += .6) kr.add(B(.004, .64, .004, K.grout, x, 1.95, Z0 + .361));
  const fr = fridgeOpen(); fr.name = 'fridge'; at(fr, 6.6, 0, Z0 + .36); g.add(fr);
  const isl = grp('island'); at(isl, 4.6, 0, -.6); g.add(isl);
  isl.add(B(2.4, .86, .9, K.front, 0, .43, 0), B(2.5, .04, 1.0, K.quartz, 0, .88, 0, 'islandTop'), B(2.4, .08, .85, K.black, 0, .04, -.02));
  for (const x of [-.7, 0, .7]) { const s = grp(); at(s, x, 0, .75); isl.add(s); s.add(at(cyl(.18, .18, .05, K.oak, null, 24), 0, .66, 0), at(cyl(.015, .015, .64, K.black, null, 8), 0, .32, 0), at(mesh(new THREE.TorusGeometry(.14, .008, 6, 24), K.black), 0, .24, 0, Math.PI / 2)); }
  isl.add(at(cyl(.045, .04, .1, K.fabricD, 'mug', 24), -.75, .95, .1), B(.36, .02, .24, K.oak, -.35, .91, -.1, 'board'), at(cyl(.07, .055, .12, K.pot, null, 20), .85, .96, -.2), at(mesh(new THREE.IcosahedronGeometry(.1, 1), K.green), .85, 1.09, -.2));
  for (let i = 0; i < 3; i++) { const p = grp('pendant' + i); at(p, 3.9 + i * .7, 0, -.6); g.add(p); p.add(at(cyl(.004, .004, .7, K.black, null, 6), 0, 2.35, 0), at(cyl(.05, .17, .18, K.black, null, 28), 0, 1.95, 0), at(cyl(.13, .13, .01, K.lampW), 0, 1.86, 0)); }
  // spots
  g.add(spot('deviceSpot', 4.75, .9, -.55), spot('acSpot', -5.4, 2.09, Z0 + .28), spot('mamadSpot', -1.6, 0, Z0 + 1.0), spot('sofaSpot', -.4, 0, 1.55, 0), spot('bedSpot', -5.4, .6, Z0 + 1.2), spot('kidSpot', -4.3, .5, 1.9),
    spot('hallSpot', -3.2, 0, .9), spot('fridgeSpot', 6.6, 0, Z0 + 1.4), spot('frame0Spot', -6.2, 1.5, 2.2), spot('wideSpot', 0, 9, 9.5));
  return g;
}

export const KIT031 = { 'buildings/apartment31': apartment31, 'everyday/homeHub': homeHub, 'everyday/splitAC': splitAC, 'everyday/mamadDoor': mamadDoor, 'everyday/milkCarton': milkCarton, 'home/fridgeOpen': fridgeOpen, 'home/shabbatTable': shabbatTable };
