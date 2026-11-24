// Orchard + fruit-picking drone kit and a deep-space probe (Media pro 2026-11-24 run 15, from the topic bank:
// "רובוטים בחקלאות: רחפן שקוטף פירות" and "הרובוט שנמצא הכי רחוק מכדור הארץ"). Generic, no brand, our own work → CC0.
// Real metres, y-up, REAL-WORLD colours (userData.real = true → look-pro realWorld() keeps them). Brand: light blue #8ea6ff = signal, deep blue #4f6fe0 = force. No glow.
// Export: python3 tools/make_props.py farm/   ·   python3 tools/make_props.py space/deepProbe
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const R = (color, rough = .8, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
export const FM = {
  soil: R(0x6b5440, 1), soil2: R(0x5c4736, 1), grass: R(0x5d7a3a, .95), grass2: R(0x6e8a45, .95), gravel: R(0x9a9184, .95),
  trunk: R(0x4f3f32, .95), leaf: R(0x2c4f22, .8), leaf2: R(0x37602a, .8), leaf3: R(0x456f30, .8),
  apple: R(0xb8322a, .45), apple2: R(0xc9543a, .45), appleY: R(0xd4b23e, .45), stem: R(0x4a3a2a, .9),
  post: R(0x8a8f94, .4, .7), wire: R(0x9aa0a6, .35, .8), net: R(0x2a2d30, .9, 0, {transparent: true, opacity: .35, side: THREE.DoubleSide}),
  drip: R(0x141518, .7),
  // machines
  white: R(0xf2f3f1, .35, .02), grey: R(0xb9bdc1, .45, .3), dark: R(0x2b2e33, .5, .3), black: R(0x121316, .7), rubber: R(0x0f1012, .9),
  alu: R(0xc4c9ce, .28, .85), glass: R(0x10161c, .05, .3), orange: R(0xe0782f, .55), wood: R(0xa57a52, .75), woodDark: R(0x7d5b3c, .8),
  acc: R(0x8ea6ff, .55), force: R(0x4f6fe0, .55), propDisc: R(0x9aa3ad, .4, .3, {transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide}),
  tether: R(0xe9eaec, .6),
  // space
  gold: R(0xc9a24a, .32, .9), foil: R(0xb08a3c, .45, .8), dish: R(0xeceae4, .5, .05), dishIn: R(0xdcd9d0, .6), bus: R(0x4a4e55, .45, .6), boom: R(0x6a6f77, .5, .6),
  rtg: R(0x3a3d42, .55, .7), fin: R(0x2e3136, .6, .5), record: R(0xd8b45a, .25, 1),
};
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...kids) => { const g = new THREE.Group(); if (name) g.name = name; kids.forEach(k => g.add(k)); return g; };
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);
const rbox = (w, h, d, r, m, name) => mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name);
const cyl = (rt, rb, h, m, name, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const spot = (name, x, y, z) => at(grp(name), x, y, z);
const rng = seed => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
// merge many transformed copies of one geometry into a single mesh (fast)
const many = (geo, mats, m, name) => { const gs = mats.map(M => geo.clone().applyMatrix4(M)); return mesh(mergeGeometries(gs), m, name); };
const mat4 = (x, y, z, s = 1, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(s, s, s));

// ---------- one trellised apple tree (modern high-density "fruit wall", ~3.4 m tall, 1 m wide along the row) ----------
/** Nodes: trunk, canopy (merged leaf clusters), fruit (merged apples, non-pickable), pick0..N-1 (separate apples on the camera side +z, each an Object3D you can fly away),
 *  spots pickSpot0..N-1 (= the apples' positions). opts.picks = how many separate apples (default 0). */
export function appleTree(seed = 1, picks = 0, lod = 0) {
  const r = rng(seed), g = grp('appleTree');
  g.add(at(cyl(.06, .09, 3.2, FM.trunk, 'trunk', 10), 0, 1.6, 0));
  // tiers of short branches along the trellis (x), leaf clusters on them
  const lm = [[], [], []], fm = [[], [], []], br = [];
  for (let y = .7; y < 3.3; y += .32) {
    const span = .55 - (y - .7) * .1;
    for (const s of [-1, 1]) {
      br.push(mat4(s * span / 2, y, 0, 1, 0, 0, s * (Math.PI / 2 - .25)));
      for (let k = 0; k < 16; k++) {   // small flattened leaf clusters → see-through fruit wall (branches + apples visible)
        const x = s * (.04 + r() * span), z = (r() - .5) * .5, yy = y + (r() - .3) * .24, sc = .06 + r() * .05;
        lm[k % 3].push(mat4(x, yy, z, sc, r() * 3, r() * 3, r() * 3).multiply(new THREE.Matrix4().makeScale(1.3, .45, 1)));
        if (k % 4 === 0 && r() < .8) { const zz = z + (z > 0 ? .06 : -.06); fm[(k / 4) % 3].push(mat4(x + (r() - .5) * .1, yy - .06, zz, .9 + r() * .25)); }
      }
    }
  }
  g.add(many(new THREE.CylinderGeometry(.022, .03, 1, 6), br.map(M => M.clone().multiply(new THREE.Matrix4().makeScale(1, .6, 1))), FM.trunk, 'branches'));
  const leafGeo = new THREE.IcosahedronGeometry(1, lod ? 0 : 1);
  const canopy = grp('canopy'); g.add(canopy);
  [FM.leaf, FM.leaf2, FM.leaf3].forEach((m, i) => lm[i].length && canopy.add(many(leafGeo, lm[i], m, 'leaves' + i)));
  const appleGeo = lod > 1 ? new THREE.IcosahedronGeometry(.04, 0) : new THREE.SphereGeometry(.04, 10, 7); appleGeo.scale(1, .92, 1);
  const fruit = grp('fruit'); g.add(fruit);
  [FM.apple, FM.apple2, FM.appleY].forEach((m, i) => fm[i].length && fruit.add(many(appleGeo, fm[i], m, 'apples' + i)));
  // separate pickable apples on the front (+z) face
  for (let i = 0; i < picks; i++) {
    const y = 1.2 + i * (1.8 / Math.max(1, picks - 1)) + (r() - .5) * .1, x = (r() - .5) * .7, z = .3 + r() * .06;
    const a = grp('pick' + i); at(a, x, y, z); g.add(a);
    a.add(mesh(appleGeo, i % 3 ? FM.apple : FM.apple2, 'apple'));
    a.add(at(cyl(.003, .003, .03, FM.stem, 'stem', 5), 0, .045, 0, .2, 0, .1));
    g.add(spot('pickSpot' + i, x, y, z));
  }
  return g;
}

/** Apple orchard block for top-down and row-level shots. ORIGIN = ground (y 0) at the centre. 5 rows along x (row spacing 3.5 m, z −7..7), 22 trees per row (1 m apart, x −11..11).
 *  Only the hero trees heroTree7..13 (row 2 = 'heroRow', z 0) are real meshes; heroTree10 has 12 separate apples pick0..11 + pickSpot0..11. All other tree slots are empty groups slot<row>_<i>:
 *  fill them with `await orchardTrees(st, orchard)` (engine/props/fx-farm.js, instanced farm/appleTreeLow).
 *  Nodes: ground (soil strips under the rows, grass alleys), row0..4, posts + 3 trellis wires per row, 'dripLine' per row, 'hailNet' (dark net roof, hide for top shots), bins (bin0..3 in the alley +z side),
 *  spots: alleySpot (centre of the alley in front of the hero row, z 1.75 — put farm/groundUnit here), heroSpot (= heroTree10 world pos). */
export function orchard() {
  const g = grp('orchard'), r = rng(7);
  const ground = grp('ground'); g.add(ground);
  ground.add(at(mesh(new THREE.PlaneGeometry(30, 20), FM.grass, 'grass'), 0, 0, 0, -Math.PI / 2));
  for (let k = 0; k < 5; k++) {
    const z = -7 + k * 3.5;
    ground.add(at(mesh(new THREE.PlaneGeometry(24, 1.1), FM.soil, null), 0, .004, z, -Math.PI / 2));
    for (let s = 0; s < 2; s++) ground.add(at(mesh(new THREE.PlaneGeometry(24, .35), FM.grass2, null), 0, .006, z + 1.75 + (s ? .5 : -.5) * 1.2, -Math.PI / 2)); // tractor wheel tracks look
    const row = grp('row' + k); g.add(row);
    // posts every 4 m + 3 wires + drip line
    const pm = []; for (let x = -11; x <= 11.01; x += 4) pm.push(mat4(x, 1.75, z));
    row.add(many(new THREE.CylinderGeometry(.045, .05, 3.5, 8), pm, FM.post, 'posts'));
    for (const y of [1.0, 2.0, 3.0]) row.add(at(cyl(.003, .003, 22.2, FM.wire, null, 4), 0, y, z, 0, 0, Math.PI / 2));
    row.add(at(cyl(.008, .008, 22.2, FM.drip, 'dripLine', 6), 0, .06, z + .12, 0, 0, Math.PI / 2));
    // trees: only the 7 hero trees (row 2, x −3.5..2.5) are in this file; every other tree slot is an empty spot 'slot<k>_<i>'
    // → fx-farm.js orchardTrees(scene, orchard, lowTree) fills them with instanced farm/appleTreeLow (keeps the GLB small and the render fast).
    if (k === 2) row.name = 'heroRow';
    for (let i = 0; i < 22; i++) {
      if (k === 2 && i >= 7 && i <= 13) { const t = appleTree(100 + i, i === 10 ? 12 : 0, i === 10 ? 0 : 1); t.name = 'heroTree' + i; at(t, -10.5 + i, 0, z); row.add(t); }
      else row.add(at(grp(`slot${k}_${i}`), -10.5 + i, 0, z, 0, r() < .5 ? 0 : Math.PI, 0));
    }
  }
  // hail net roof (dark, see-through) on cables above the rows
  const net = grp('hailNet'); g.add(net);
  net.add(at(mesh(new THREE.PlaneGeometry(23, 15.5), FM.net, 'netCloth'), 0, 3.7, 0, -Math.PI / 2));
  // fruit bins in the alley
  for (let i = 0; i < 4; i++) {
    const b = grp('bin' + i); at(b, -8 + i * 5.2, 0, 1.75 + .9, 0, (r() - .5) * .2, 0); g.add(b);
    b.add(B(1.2, .06, 1.0, FM.woodDark, 0, .1, 0)); for (const [x, z] of [[-.55, -.45], [.55, -.45], [-.55, .45], [.55, .45]]) b.add(B(.08, .1, .08, FM.woodDark, x, .04, z));
    for (let s = 0; s < 4; s++) { const w = s % 2 ? 1.0 : 1.2; const o = B(w, .55, .03, FM.wood, 0, .42, 0); o.rotation.y = s * Math.PI / 2; o.position.set(s === 1 ? .6 : s === 3 ? -.6 : 0, .42, s === 0 ? .5 : s === 2 ? -.5 : 0); b.add(o); }
    const fill = [], n = 70 + (i * 23) % 50; for (let k = 0; k < n; k++) fill.push(mat4((r() - .5) * 1.08, .2 + r() * .45 * (n / 120), (r() - .5) * .9));
    b.add(many(new THREE.IcosahedronGeometry(.04, 1), fill, i % 2 ? FM.apple : FM.apple2, 'binFruit'));
  }
  g.add(spot('alleySpot', 0, 0, 1.75)); g.add(spot('heroSpot', -.5, 0, 0));
  return g;
}

// ---------- tethered fruit-picking drone ----------
/** Picker drone ~1.3 m across (rotor tip to tip). Faces +z (the arm reaches +z). Generic, no brand.
 *  Nodes: body, prop0..3 (spin .y, 0&2 one way, 1&3 the other) each with disc{i} (see-through, visible) + blades{i} (hidden), arm (slide .position.z 0 → .42 = reach),
 *  'suction' (soft cup at the arm tip, scale .z .7 = grip squeeze), 'cam' + 'camLens' (vision unit under the arm), 'ledStatus' (acc), 'tetherPort' (spot on top: the cable to the ground unit), 'fruitSpot' (where a picked apple sits in the cup). */
export function pickerDrone() {
  const g = grp('pickerDrone'), body = grp('body'); g.add(body);
  body.add(rbox(.36, .14, .42, .05, FM.white, 'shell'));
  body.add(at(rbox(.3, .05, .34, .02, FM.dark, 'battery'), 0, -.09, -.02));
  body.add(B(.36, .012, .42, FM.acc, 0, .072, 0, 'stripe')); body.children.at(-1).scale.set(.15, 1, 1);
  body.add(at(cyl(.012, .012, .006, FM.acc, 'ledStatus', 12), 0, .075, .17));
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI / 2) + Math.PI / 4, L = .5, x = Math.sin(a) * L, z = Math.cos(a) * L;
    const arm = at(cyl(.016, .016, L, FM.dark, 'arm' + i, 10), x / 2, .02, z / 2, Math.PI / 2, 0, 0); arm.lookAt(new THREE.Vector3(x, .02, z)); arm.rotateX(Math.PI / 2); body.add(arm);
    body.add(at(cyl(.035, .035, .05, FM.black, 'motor' + i, 16), x, .04, z));
    const pr = grp('prop' + i); at(pr, x, .075, z); body.add(pr);
    const bl = grp('blades' + i); bl.visible = false; pr.add(bl);
    for (let k = 0; k < 2; k++) bl.add(at(rbox(.3, .006, .035, .003, FM.black), 0, 0, 0, 0, k * Math.PI, (i % 2 ? -1 : 1) * .08));
    const disc = grp('disc' + i, at(mesh(new THREE.CircleGeometry(.16, 40), FM.propDisc), 0, 0, 0, -Math.PI / 2), at(mesh(new THREE.TorusGeometry(.16, .003, 6, 48), FM.acc), 0, 0, 0, Math.PI / 2));
    disc.children.forEach(c => c.castShadow = false); pr.add(disc);
    body.add(at(mesh(new THREE.TorusGeometry(.175, .008, 8, 40), FM.grey, 'guard' + i), x, .075, z, Math.PI / 2));   // prop guard ring (picks between branches)
  }
  // telescopic picking arm with a soft suction cup
  const arm = grp('arm'); at(arm, 0, -.03, .2); body.add(arm);
  arm.add(at(cyl(.022, .022, .34, FM.alu, 'armTube0', 12), 0, 0, .1, Math.PI / 2));
  arm.add(at(cyl(.017, .017, .34, FM.grey, 'armTube1', 12), 0, 0, .3, Math.PI / 2));
  const cup = grp('suction'); at(cup, 0, 0, .48); arm.add(cup);
  cup.add(at(cyl(.05, .028, .07, FM.force, 'cup', 24), 0, 0, 0, Math.PI / 2));
  cup.add(at(mesh(new THREE.TorusGeometry(.048, .008, 8, 28), FM.rubber, 'lip'), 0, 0, .035));
  cup.add(spot('fruitSpot', 0, 0, .075));
  // vision unit
  const cam = at(rbox(.1, .05, .06, .015, FM.dark, 'cam'), 0, -.085, .2); body.add(cam);
  cam.add(at(cyl(.016, .016, .01, FM.glass, 'camLens', 16), -.025, 0, .031, Math.PI / 2)); cam.add(at(cyl(.016, .016, .01, FM.glass), .025, 0, .031, Math.PI / 2));
  g.add(spot('tetherPort', 0, .1, -.08));
  return g;
}

/** Ground unit that drives along the alley: a low electric platform carrying a fruit bin, a mast, and 4 tethered picker drones (power + data cables).
 *  ~2.6 × 1.6 m, faces +x (drives along the row). Nodes: chassis, wheel0..3 (spin .z), bin + 'binFruit' (grow: scale .y 0.2→1), mast, 'screen' (aspect 1.6, st.screen),
 *  'conveyor' (soft tube from the mast to the bin; apples run down it), 'reel0..3' (spin .x), spots tether0..3 (cable roots on the mast — run a tube to each drone's tetherPort), 'ledStatus'. */
export function groundUnit() {
  const g = grp('groundUnit'), ch = grp('chassis'); g.add(ch);
  ch.add(at(rbox(2.6, .32, 1.5, .06, FM.white, 'deck'), 0, .48, 0));
  ch.add(B(2.62, .05, 1.52, FM.acc, 0, .39, 0, 'stripe')); ch.children.at(-1).scale.set(1, 1, 1);
  ch.add(at(rbox(.5, .35, 1.3, .05, FM.dark, 'batteryBox'), -1.0, .82, 0));
  ch.add(at(cyl(.02, .02, .01, FM.acc, 'ledStatus', 12), -1.0, 1.0, .66, Math.PI / 2));
  for (let i = 0; i < 4; i++) {
    const w = grp('wheel' + i); at(w, i < 2 ? .9 : -.9, .3, i % 2 ? .72 : -.72); ch.add(w);
    w.add(at(cyl(.3, .3, .2, FM.rubber, 'tyre', 28), 0, 0, 0, Math.PI / 2)); w.add(at(cyl(.17, .17, .21, FM.grey, 'hub', 16), 0, 0, 0, Math.PI / 2));
  }
  // bin (same as the orchard bins)
  const bin = grp('bin'); at(bin, .45, .64, 0); ch.add(bin);
  for (let s = 0; s < 4; s++) { const o = B(s % 2 ? 1.0 : 1.2, .55, .03, FM.wood, 0, .28, 0); o.rotation.y = s * Math.PI / 2; o.position.set(s === 1 ? .6 : s === 3 ? -.6 : 0, .28, s === 0 ? .5 : s === 2 ? -.5 : 0); bin.add(o); }
  bin.add(B(1.2, .03, 1.0, FM.woodDark, 0, .015, 0));
  const r = rng(3), fill = []; for (let k = 0; k < 140; k++) fill.push(mat4((r() - .5) * 1.08, .06 + r() * .42, (r() - .5) * .9));
  const bf = many(new THREE.SphereGeometry(.04, 10, 8), fill, FM.apple, 'binFruit'); bin.add(bf);
  // mast with 4 reels
  const mast = grp('mast'); at(mast, -1.0, 1.0, 0); ch.add(mast);
  mast.add(at(cyl(.05, .06, 1.6, FM.alu, 'pole', 12), 0, .8, 0));
  mast.add(at(rbox(.36, .22, .06, .02, FM.dark, 'screenFrame'), 0, .55, .69 - .69 + .2));
  mast.add(at(mesh(new THREE.PlaneGeometry(.32, .2), FM.black, 'screen'), 0, .55, .231));
  for (let i = 0; i < 4; i++) {
    const y = 1.0 + i * .17, rl = grp('reel' + i); at(rl, 0, y, 0, 0, i * Math.PI / 2, 0); mast.add(rl);
    rl.add(at(cyl(.07, .07, .08, FM.dark, 'drum', 18), .11, 0, 0, 0, 0, Math.PI / 2));
    rl.add(at(cyl(.072, .072, .05, FM.tether, 'wound', 18), .11, 0, 0, 0, 0, Math.PI / 2));
    rl.add(spot('tether' + i, .16, 0, 0));
  }
  // conveyor tube from the mast top down into the bin (apples roll down softly)
  const pts = [[-1.0, 2.6, .15], [-.6, 2.2, .3], [-.1, 1.7, .25], [.3, 1.35, .05]].map(p => new THREE.Vector3(...p));
  const tube = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .07, 12), FM.tether, 'conveyor'); tube.userData.path = pts.flatMap(v => [v.x, v.y, v.z]); ch.add(tube);
  return g;
}

/** A picked apple as its own small model (for close-ups / flying into the bin). Nodes: apple, stem, leaf. ~8 cm. */
export function apple() {
  const g = grp('apple'), ag = new THREE.SphereGeometry(.04, 20, 14); ag.scale(1, .92, 1);
  g.add(mesh(ag, FM.apple, 'body')); g.add(at(cyl(.003, .002, .03, FM.stem, 'stem', 6), 0, .045, 0, .2, 0, .1));
  const lf = mesh(new THREE.CircleGeometry(.018, 12), FM.leaf2, 'leaf'); lf.scale.set(1, .45, 1); g.add(at(lf, .016, .05, 0, -.6, .3, .5));
  return g;
}

// ---------- deep-space probe (generic 1970s outer-planet probe; no mission name/logo) ----------
/** ~3.7 m dish, booms to ~13 m tip to tip. Faces: dish points +z (toward Earth). Nodes: dish (+ 'feed' horn), bus (10-sided body, gold 'foil' bays), 'record' (gold disc on the bus side + 'recordCover'),
 *  'rtgBoom' with rtg0..2 (finned power cylinders, red-hot nothing — matte), 'scienceBoom' with 'scanPlatform' (rotate .y/.x) + 'camWide'/'camNarrow', 'magBoom' (long thin lattice, 13 m) with 'magSensor',
 *  'antennaWhip0/1' (long thin wires), 'thruster0..3'. Spot 'earthDir' (a point 10 m in front of the dish — aim a signal line at it). */
export function deepProbe() {
  const g = grp('deepProbe');
  // dish
  const dish = grp('dish'); at(dish, 0, 0, .55); g.add(dish);
  const prof = []; for (let i = 0; i <= 24; i++) { const r = i / 24 * 1.83; prof.push(new THREE.Vector2(r, r * r * .14)); }
  const dg = new THREE.LatheGeometry(prof, 72); dg.rotateX(Math.PI / 2);
  const dOut = mesh(dg, FM.dish, 'dishShell'); dOut.material = FM.dish.clone(); dOut.material.side = THREE.DoubleSide; dOut.material.userData.real = true; dish.add(dOut);
  for (let k = 0; k < 3; k++) { const a = k * 2 * Math.PI / 3; const s = at(cyl(.012, .012, 1.0, FM.boom, 'strut' + k, 6), Math.cos(a) * .6, Math.sin(a) * .6, .75); s.lookAt(new THREE.Vector3(0, 0, 1.3).add(dish.position)); s.rotateX(Math.PI / 2); dish.add(s); }
  dish.add(at(cyl(.07, .1, .3, FM.dark, 'feed', 16), 0, 0, 1.2, Math.PI / 2));
  // bus
  const bus = grp('bus'); g.add(bus);
  bus.add(at(cyl(.95, .95, .45, FM.bus, 'busBody', 10), 0, 0, 0, Math.PI / 2));
  for (let i = 0; i < 10; i++) { const a = (i + .5) * Math.PI / 5; const p = B(.52, .44, .02, i % 2 ? FM.gold : FM.foil, Math.cos(a) * .9, Math.sin(a) * .9, 0, 'foil' + i); p.rotation.z = a + Math.PI / 2; bus.add(p); }
  bus.add(at(cyl(.18, .18, .5, FM.gold, 'propTank', 16), 0, 0, -.45, Math.PI / 2));
  const rec = grp('record'); at(rec, .93, .2, 0, 0, Math.PI / 2, 0); bus.add(rec);
  rec.add(at(cyl(.15, .15, .01, FM.record, 'disc', 40), 0, 0, .02, Math.PI / 2)); rec.add(at(cyl(.16, .16, .006, FM.alu, 'recordCover', 40), 0, 0, .03, Math.PI / 2));
  rec.children.at(-1).visible = false;
  for (let i = 0; i < 4; i++) bus.add(at(cyl(.02, .03, .07, FM.dark, 'thruster' + i, 10), (i % 2 ? 1 : -1) * .5, (i < 2 ? 1 : -1) * .5, -.25, Math.PI / 2));
  // RTG boom (−x, slightly down): 3 finned cylinders
  const rb = grp('rtgBoom'); at(rb, -.9, -.15, -.1, 0, 0, -.12); g.add(rb);
  rb.add(at(cyl(.025, .025, 2.6, FM.boom, 'rtgTruss', 6), -1.3, 0, 0, 0, 0, Math.PI / 2));
  for (let i = 0; i < 3; i++) {
    const c = grp('rtg' + i); at(c, -1.4 - i * .5, 0, 0, 0, 0, Math.PI / 2); rb.add(c);
    c.add(cyl(.2, .2, .42, FM.rtg, 'can', 20));
    for (let f = 0; f < 6; f++) { const fin = B(.02, .4, .3, FM.fin, 0, 0, 0); fin.rotation.y = f * Math.PI / 6; c.add(fin); }
  }
  // science boom (+x): scan platform with 2 cameras
  const sb = grp('scienceBoom'); at(sb, .95, -.1, -.1); g.add(sb);
  sb.add(at(cyl(.03, .03, 2.4, FM.boom, 'sciTruss', 6), 1.2, 0, 0, 0, 0, Math.PI / 2));
  sb.add(at(rbox(.35, .3, .3, .02, FM.foil, 'sciBox'), 1.4, .05, 0));
  const sp = grp('scanPlatform'); at(sp, 2.45, 0, 0); sb.add(sp);
  sp.add(rbox(.4, .28, .3, .03, FM.dark, 'platform'));
  sp.add(at(cyl(.06, .06, .35, FM.alu, 'camNarrow', 16), -.08, .05, .3, Math.PI / 2)); sp.add(at(cyl(.045, .045, .22, FM.alu, 'camWide', 16), .1, .05, .24, Math.PI / 2));
  // magnetometer boom (long thin lattice, up-back)
  const mb = grp('magBoom'); at(mb, 0, .9, -.2, -.35, 0, 0); g.add(mb);
  const L = 13, legs = []; for (let k = 0; k < 3; k++) { const a = k * 2 * Math.PI / 3; legs.push(mat4(Math.cos(a) * .06, L / 2, Math.sin(a) * .06)); }
  mb.add(many(new THREE.CylinderGeometry(.006, .006, L, 4), legs, FM.boom, 'magLattice'));
  const rings = []; for (let y = .5; y < L; y += .5) rings.push(mat4(0, y, 0));
  mb.add(many(new THREE.TorusGeometry(.065, .004, 4, 6), rings.map(M => M.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))), FM.boom, 'magRings'));
  mb.add(at(cyl(.05, .05, .15, FM.dark, 'magSensor', 12), 0, L, 0));
  // two long whip antennas (down-back)
  for (let i = 0; i < 2; i++) g.add(at(cyl(.008, .008, 10, FM.boom, 'antennaWhip' + i, 4), 0, -.5, -.3, -.9 - i * .5, i ? .6 : -.6, 0));
  g.add(spot('earthDir', 0, 0, 10));
  return g;
}

export const KITFARM = {
  'farm/orchard': orchard, 'farm/appleTree': () => appleTree(1, 12), 'farm/appleTreeLow': () => appleTree(5, 0, 2), 'farm/pickerDrone': pickerDrone, 'farm/groundUnit': groundUnit, 'farm/apple': apple,
  'space/deepProbe': deepProbe,
};
