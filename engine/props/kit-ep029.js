// Media pro 2026-11-27 run 19b — ep029-phantombrake kit (pro-v3, DAYTIME — a new world, not ep024's night highway).
// Generic (no brand/logo/real place names), our own work → CC0. Real metres, y-up. REAL colours (userData.real). No glow (lamps = lit surfaces).
// Export: python3 tools/make_props.py dayHighway / radarSedan / sedanLite
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {cabinCar, wheel} from './kit-cabin.js';
const R = (color, rough = .8, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
const LIT = (color, i = 1.2) => R(color, .5, 0, {emissive: color, emissiveIntensity: i});
const H = { asphalt: R(0x55585c, .92), asphaltB: R(0x4b4e52, .94), shoulder: R(0x6a6b6b, .95), paintW: R(0xf2f0e8, .6), paintY: R(0xe8c24a, .6), concrete: R(0xbdb8ae, .9), concreteD: R(0x9c978e, .9),
  steel: R(0xa9b0b6, .35, .85), steelD: R(0x7d848b, .4, .8), sign: R(0x1f6b45, .55), signW: R(0xf2f4f1, .5), iron: R(0x3b3a38, .55, .7), ironD: R(0x26252a, .7, .5),
  grass: R(0x8c9a5c, 1), dry: R(0xc2b48a, 1), oleander: R(0x4f6d3c, .9), pink: R(0xd98aa6, .9), wall: R(0xd8d1c2, .9), wallD: R(0xc4bcab, .9), city: R(0xe2dccf, .9), cityD: R(0xb9b3a7, .9), hill: R(0xa9a084, 1),
  sky: R(0xbfd6ea, 1), acc: R(0x8ea6ff, .5), pcb: R(0x1f4d3a, .6), ghost: R(0x9aa3ad, .4, .2, {transparent: true, opacity: .12, depthWrite: false}), brake: LIT(0xd0141b, .25), brakeOn: LIT(0xff2a2a, 2.2) };
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...k) => { const g = new THREE.Group(); if (name) g.name = name; k.forEach(c => g.add(c)); return g; };
const RB = (w, h, d, r, m, x, y, z, name) => at(mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name), x, y, z);
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);
const cyl = (rt, rb, h, m, name, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const spot = (name, x, y, z) => at(grp(name), x, y, z);
const rng = seed => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
const PAINTS = { silver: [0xb9bec4, .3, .6], white: [0xeeeeec, .3, .3], blue: [0x2f4f78, .3, .5], red: [0x8e2a2a, .3, .5], black: [0x1d1f22, .25, .5], sand: [0xc9b99a, .35, .4] };
function repaint(car, key) { const [c, r, m] = PAINTS[key]; const P = R(c, r, m); P.name = 'carPaint';
  car.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0x3d444c) o.material = P; });
  if (!car.getObjectByName('wheel0')) [[.78, 1.35], [-.78, 1.35], [.78, -1.35], [-.78, -1.35]].forEach(([x, z], i) => car.add(wheel('wheel' + i, x, z)));   // cabinCar has no wheels (ep024 was inside) → add them, spin 'wheel{i}Spin' .rotation.x
  return car; }

/** **car/radarSedan** — the ep029 hero: our generic sedan (car/cabinCar, full cabin) in silver, with a FRONT RADAR behind the bumper and real brake lights.
 * Faces +z, origin on the ground between the axles. Extra nodes: **'radarUnit'** at the front bumper centre (z 2.26, y .5): ghost **'radarShell'** (fade for x-ray), insides **'radarBoard'** (green PCB) + **'radarAntenna'** (light-blue patch array, 3×4 'patch{i}'),
 * spot **'radarSpot'** (wave origin, faces +z), **'brakeLights'** group: brakeL / brakeR / brakeTop (third light on the rear shelf) — set .material.emissiveIntensity .25 (off) → 2.2 (braking) or swap to material userData.on.
 * All cabinCar nodes stay (wheels wheel0..3, cluster, centerScreen, windshieldCenter …). */
export function radarSedan() {
  const g = repaint(cabinCar(), 'silver'); g.name = 'radarSedan';
  const tint = R(0x1c242c, .05, .3, {transparent: true, opacity: .62, depthWrite: false, side: THREE.DoubleSide}); tint.name = 'carGlass';   // daylight: darker glass reads as glass, not an empty frame
  g.traverse(o => { if (o.isMesh && o.material && o.material.transparent && o.material.opacity < .6) o.material = tint; });
  const ru = grp('radarUnit'); at(ru, 0, .5, 2.2); g.add(ru);
  ru.add(RB(.16, .1, .05, .02, H.ghost, 0, 0, .04, 'radarShell'), RB(.13, .08, .006, .004, H.pcb, 0, 0, .03, 'radarBoard'));
  const an = grp('radarAntenna'); at(an, 0, 0, .036); ru.add(an); for (let i = 0; i < 12; i++) an.add(B(.018, .012, .002, H.acc, -.03 + (i % 4) * .02, -.02 + Math.floor(i / 4) * .02, 0, 'patch' + i));
  ru.add(spot('radarSpot', 0, 0, .1));
  const bl = grp('brakeLights'); g.add(bl);
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) { const m = H.brake.clone(); m.userData.real = true; bl.add(at(new THREE.Mesh(new RoundedBoxGeometry(.3, .05, .02, 2, .01), m), s * .64, .86, -2.275, .1, s * .1, 0)); bl.children.at(-1).name = 'brake' + k; }
  const mt = H.brake.clone(); mt.userData.real = true; bl.add(at(new THREE.Mesh(new RoundedBoxGeometry(.28, .025, .02, 2, .008), mt), 0, 1.3, -1.7, .5, 0, 0)); bl.children.at(-1).name = 'brakeTop';
  return g;
}

/** **car/sedanLite** — the same sedan WITHOUT the interior (exterior only, dark tinted glass, ~4× lighter) for traffic / a jam / parked rows. Default paint white;
 * userData.paints lists the keys; in an episode recolour with sedanLite.getObjectByName('body') traverse, or with fx-radar.js paintCar(car, 'blue'|'red'|'black'|'sand'|'silver') (one GLB, recoloured at load). Brake lights 'tailL/tailR' as in cabinCar. */
export function sedanLite(key = 'white') {
  const g = repaint(cabinCar(), key); g.name = 'sedanLite'; const inn = g.getObjectByName('interior'); inn.parent.remove(inn);
  const dark = R(0x1a1f24, .1, .2, {transparent: true, opacity: .85, depthWrite: false}); g.traverse(o => { if (o.isMesh && o.material && o.material.transparent && o.material.opacity < .6) o.material = dark; });
  g.userData.paints = Object.keys(PAINTS); return g;
}

/** **road/dayHighway** — Israeli intercity highway in DAYLIGHT (Ayalon-style), 300 m along z (−150..150), our direction drives toward +z.
 * Our carriageway: 3 lanes, centres x **+3.6 / 0 / −3.6** (dashed lines x ±1.8, solid edges ±5.4), hard shoulder to −8, guard rail −8.6, noise wall −11 (beige panels);
 * concrete median (jersey) x +6.5 with low oleander behind it, opposite carriageway x +7.4..+18.4; sun-bleached grass verges, a far city skyline + hills, sky backdrop.
 * **'overpass'** at z **+60**: concrete deck (clearance 5.3 m, deck 1.4 m, 18 m wide), 3 pier walls (x −10, +6.5 median, +20), railings, its sharp shadow falls on the road — spots 'bridgeUnder' (lane 0 under the deck), 'bridgeEdge' (deck front edge, lane 0, y 5.3).
 * **'gantry'** at z **+25**: steel truss over our 3 lanes with 3 green panels 'signPanel0..2' (blank — add Hebrew with st.screen on 'signFace0..2', aspect 2.2) — spot 'gantryHit' (bottom of the truss over lane 0).
 * **'manhole'** in lane 0 at z **+12** (cast-iron cover Ø 0.7 with a ring frame) — spot 'manholeSpot'. Spots 'carStart' (lane 0, z −40), 'jamSpot0..3' (stopped cars, lane +3.6, z 70..92 — beyond the bridge), 'eyeSpot' (frame-0 camera on the shoulder, 1.6 m, z 0). Origin = road surface y 0. */
export function dayHighway() {
  const g = grp('dayHighway'), L = 300, mm = new THREE.Matrix4();
  g.add(B(14.8, .02, L, H.asphalt, -1.6, -.01, 0, 'asphalt'), B(11.4, .02, L, H.asphaltB, 12.9, -.01, 0, 'asphaltOpp'), B(2.6, .021, L, H.shoulder, -7.3, -.009, 0, 'shoulder'));
  const solid = new THREE.BoxGeometry(.15, .006, L); for (const x of [-5.4, 5.4, 7.6, 18.2]) g.add(at(mesh(solid, x === 5.4 ? H.paintY : H.paintW), x, .003, 0));
  const nD = L / 10, dm = new THREE.InstancedMesh(new THREE.BoxGeometry(.15, .006, 4), H.paintW, nD * 4); dm.name = 'laneDashes'; dm.receiveShadow = true; let k = 0;
  for (const x of [1.8, -1.8, 11.3, 14.8]) for (let i = 0; i < nD; i++) dm.setMatrixAt(k++, mm.makeTranslation(x, .003, -L / 2 + i * 10 + 2)); g.add(dm);
  const jp = new THREE.Shape(); jp.moveTo(-.3, 0); jp.lineTo(-.28, .08); jp.lineTo(-.2, .25); jp.lineTo(-.08, .81); jp.lineTo(.08, .81); jp.lineTo(.2, .25); jp.lineTo(.28, .08); jp.lineTo(.3, 0); jp.lineTo(-.3, 0);
  const jg = new THREE.ExtrudeGeometry(jp, {depth: L, bevelEnabled: false}); jg.translate(0, 0, -L / 2); g.add(at(mesh(jg, H.concrete, 'median'), 6.5, 0, 0));
  const rr = rng(11), bush = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.7, 1), H.oleander, 120), fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.18, 0), H.pink, 160);
  for (let i = 0; i < 120; i++) bush.setMatrixAt(i, mm.compose(new THREE.Vector3(6.5 + (rr() - .5) * .3, .9 + rr() * .2, -L / 2 + i * 2.5), new THREE.Quaternion(), new THREE.Vector3(1, .8 + rr() * .3, 1.4)));
  for (let i = 0; i < 160; i++) fl.setMatrixAt(i, mm.makeTranslation(6.5 + (rr() - .5) * 1.2, 1.2 + rr() * .5, -L / 2 + rr() * L)); g.add(bush, fl); bush.name = 'oleander';
  const gr = grp('guardRail'); g.add(gr); gr.add(B(.04, .32, L, H.steel, -8.6, .62, 0)); const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(.1, .75, .1), H.steel, L / 2); for (let i = 0; i < L / 2; i++) pm.setMatrixAt(i, mm.makeTranslation(-8.68, .37, -L / 2 + i * 2)); gr.add(pm);
  g.add(B(2.2, .02, L, H.dry, -9.8, -.02, 0, 'verge'));
  const nw = grp('noiseWall'); g.add(nw); for (let z = -L / 2; z < L / 2; z += 4) nw.add(B(.25, 4, 3.96, (z / 4) % 2 ? H.wall : H.wallD, -11, 2, z + 2)); for (let z = -L / 2; z <= L / 2; z += 4) nw.add(B(.3, 4.2, .2, H.steelD, -10.95, 2.1, z));
  g.add(B(40, .02, L, H.grass, 38, -.04, 0, 'fieldL'), B(30, .02, L, H.dry, -27, -.04, 0, 'fieldR'));
  // far city + hills + sky (static, no shadows)
  const far = grp('far'); g.add(far); for (let i = 0; i < 40; i++) { const a = (rr() - .5) * 1.4, d = 260 + rr() * 140, h = 10 + rr() * (rr() < .25 ? 70 : 25); far.add(at(B(10 + rr() * 14, h, 12, rr() > .5 ? H.city : H.cityD), Math.sin(a) * d, h / 2, Math.cos(a) * d)); }
  const ridge = new THREE.Shape(); ridge.moveTo(-900, -5); for (let i = 0; i <= 60; i++) ridge.lineTo(-900 + i * 30, 25 + 25 * Math.sin(i * .37) + 10 * Math.sin(i * 1.3)); ridge.lineTo(900, -5); ridge.lineTo(-900, -5);
  far.add(at(mesh(new THREE.ShapeGeometry(ridge), H.hill, 'hills'), 0, 0, 520, 0, Math.PI, 0), at(mesh(new THREE.PlaneGeometry(2400, 500), H.sky, 'sky'), 0, 200, 700, 0, Math.PI, 0));
  far.traverse(o => { if (o.isMesh) o.castShadow = false; });
  // overpass
  const ov = grp('overpass'); at(ov, 0, 0, 60); g.add(ov); const CL = 5.3, DT = 1.4;
  ov.add(B(46, DT, 18, H.concrete, 3, CL + DT / 2, 0, 'deck'), B(46, .25, 18.4, H.concreteD, 3, CL + .12, 0, 'deckSoffitEdge'));
  for (const s of [-1, 1]) { ov.add(B(46, .9, .25, H.concrete, 3, CL + DT + .45, s * 9, 'parapet')); for (let x = -19; x <= 25; x += 2) ov.add(B(.08, .9, .08, H.steelD, x, CL + DT + 1.3, s * 8.8)); ov.add(B(46, .06, .06, H.steelD, 3, CL + DT + 1.75, s * 8.8)); }
  for (const x of [-10, 6.5, 20]) ov.add(B(1.2, CL, 14, H.concreteD, x, CL / 2, 0, 'pier'));
  ov.add(spot('bridgeUnder', 0, 0, 0), spot('bridgeEdge', 0, CL, -9));
  // gantry
  const ga = grp('gantry'); at(ga, 0, 0, 25); g.add(ga);
  for (const x of [-9.2, 5.8]) ga.add(at(cyl(.2, .22, 7.2, H.steel, null, 16), x, 3.6, 0), at(cyl(.5, .5, .4, H.concreteD, null, 16), x, .2, 0));
  for (const y of [6.3, 7.1]) for (const z of [-.4, .4]) ga.add(B(15.3, .12, .12, H.steel, -1.7, y, z));
  for (let x = -9; x <= 5.6; x += .8) { ga.add(at(B(.06, 1.13, .06, H.steel), x, 6.7, -.4, 0, 0, .6), at(B(.06, 1.13, .06, H.steel), x, 6.7, .4, 0, 0, -.6)); }
  [-3.6, 0, 3.6].forEach((x, i) => { ga.add(RB(3.2, 1.5, .1, .03, H.sign, x, 5.45, -.55, 'signPanel' + i), B(3.0, .04, .02, H.signW, x, 6.1, -.61), B(3.0, .04, .02, H.signW, x, 4.8, -.61));
    const f = mesh(new THREE.PlaneGeometry(2.9, 1.3), H.sign, 'signFace' + i); f.userData.aspect = 2.2; f.castShadow = false; at(f, x, 5.45, -.611, 0, Math.PI, 0); ga.add(f); });
  ga.add(spot('gantryHit', 0, 4.7, 0));
  // manhole
  const mh = grp('manhole'); at(mh, 0, 0, 12); g.add(mh); mh.add(at(cyl(.43, .43, .012, H.ironD, 'manholeFrame', 40), 0, .006, 0), at(cyl(.35, .35, .016, H.iron, 'manholeCover', 40), 0, .008, 0));
  for (let i = -3; i <= 3; i++) mh.add(B(.6 * Math.cos(Math.asin(Math.min(.99, Math.abs(i) / 3.6))), .004, .025, H.ironD, 0, .017, i * .09));
  g.add(spot('manholeSpot', 0, 0, 12), spot('carStart', 0, 0, -40), spot('eyeSpot', -7.0, 1.6, 0));
  [70, 76.5, 83, 89.5].forEach((z, i) => g.add(spot('jamSpot' + i, 3.6, 0, z)));
  return g;
}

export const KIT029 = { 'road/dayHighway': dayHighway, 'car/radarSedan': radarSedan, 'car/sedanLite': () => sedanLite('white') };
