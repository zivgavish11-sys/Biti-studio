// Media pro 2026-11-27 run 19c — ep030-backseat kit (pro-v3, sunny Israeli open-air parking lot — a new world, not ep024's night cabin).
// Generic, no brand/logo, our own work → CC0. Real metres, y-up. REAL colours (userData.real). No glow.
// Export: python3 tools/make_props.py familyCar / infantSeat / mannequin-baby / blanket / babyBag / parkingLot
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {cabinCar, section, CMAT} from './kit-cabin.js';
import {radarSedan} from './kit-ep029.js';
const R = (color, rough = .8, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
const P = { seatShell: R(0x3a4048, .6), seatPad: R(0x6f7782, .95), seatPadL: R(0x9aa6b4, .95), canopy: R(0x8ea6ff, .9), strap: R(0x1d1f22, .8), buckle: R(0xb9bec4, .3, .8),
  skin: R(0x8a8f96, .7), blanket: R(0xe9d9bf, .95), blanketB: R(0xd6c3a2, .95), bag: R(0x4b6a7d, .85), bagD: R(0x2e4250, .85),
  asphalt: R(0x5b5e62, .93), paintW: R(0xf2f0e8, .6), curb: R(0xc9c4ba, .9), curbY: R(0xe8c24a, .6), sand: R(0xd9c9a3, 1), trunk: R(0x8a7559, .95), frond: R(0x5d7a3e, .85),
  sail: R(0xf1ede4, .95, 0, {side: THREE.DoubleSide}), sailB: R(0xd9e2ea, .95, 0, {side: THREE.DoubleSide}), pole: R(0x9aa1a8, .4, .7), wall: R(0xe6dfd2, .9), wallD: R(0xcbc3b5, .9), glass: R(0x6f8796, .1, .3), sky: R(0xbfd6ea, 1),
  acc: R(0x8ea6ff, .5), pcb: R(0x1f4d3a, .6), grey: R(0x9aa1a8, .5) };
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...k) => { const g = new THREE.Group(); if (name) g.name = name; k.forEach(c => g.add(c)); return g; };
const RB = (w, h, d, r, m, x, y, z, name) => at(mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name), x, y, z);
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);
const cyl = (rt, rb, h, m, name, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const spot = (name, x, y, z, ry = 0) => at(grp(name), x, y, z, 0, ry, 0);
const sc = (o, x, y, z) => (o.scale.set(x, y, z), o);
const tube = (pts, r, m, name, seg = 32) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), seg, r, 8), m, name);

/** **car/familyCar** — our sedan (radarSedan base, no front radar) in light sand, wheels, daylight glass, with a RIGHT REAR DOOR THAT OPENS and a CEILING RADAR over the rear bench.
 * Faces +z, origin on the ground between the axles; right side = −x (pavement side in Israel). New nodes: **'rearDoorR'** (hinge at its front edge z −.42: open = .rotation.y +1.15) holding the outer skin, rear side glass and inner panel;
 * 'frontDoorR' (outer skin, fixed); **'ceilingRadar'** (small module in the headliner above the rear bench: 'ceilingRadarShell', 'ceilingRadarBoard' light-blue, spot **'ceilingRadarSpot'** = wave origin, aim straight down);
 * spots **'rearSeatSpot'** (right rear seat — put everyday/infantSeat here, rotation.y π = rear-facing), 'rearEye' (frame-0 camera outside the open rear window, 1.25 m), 'doorOut' (where the parent stands). Keeps brakeLights, cluster, centerScreen (memory icon / reminder). */
export function familyCar() {
  const g = radarSedan(); g.name = 'familyCar'; const ru = g.getObjectByName('radarUnit'); ru.parent.remove(ru);
  const sand = R(0xd8ccb4, .3, .35); sand.name = 'carPaint'; g.traverse(o => { if (o.isMesh && o.material && o.material.name === 'carPaint') o.material = sand; });
  const body = g.getObjectByName('body'), inn = g.getObjectByName('interior');
  const sR = g.getObjectByName('sideR'); sR.parent.remove(sR); const dR = g.getObjectByName('doorR'); dR.parent.remove(dR);
  const gl = g.getObjectByName('sideGlassRR');
  body.children.filter(o => o.isMesh && o.geometry.type === 'TubeGeometry' && !o.name && (o.geometry.computeBoundingBox(), o.geometry.boundingBox.max.x < -.7)).forEach(o => body.remove(o));   // right window trim would cross the open door
  body.add(section(-.42, .88, .06, -.87, sand, 'frontDoorR', 30)); inn.add(B(.05, .66, 1.28, CMAT.dash, -.825, .62, .23, 'doorRFrontInner'));
  const rd = grp('rearDoorR'); at(rd, -.87, 0, -.42); body.add(rd);
  const skin = section(-1.14, -.42, .06, -.87, sand, 'rearDoorSkin', 24); skin.position.set(.87, 0, .42); rd.add(skin);
  if (gl) { gl.parent.remove(gl); gl.position.set(gl.position.x + .87, gl.position.y, gl.position.z + .42); rd.add(gl); }
  rd.add(B(.05, .62, .7, CMAT.dash, .045, .62, -.36, 'rearDoorInner'), RB(.08, .05, .4, .02, CMAT.dashSoft, .07, .68, -.36), RB(.02, .03, .12, .01, CMAT.chrome, -.02, .78, -.12, 'rearHandle'));
  const RY = 1.46, cr = grp('ceilingRadar'); at(cr, 0, RY - .045, -.85); inn.add(cr);
  cr.add(RB(.14, .025, .1, .01, CMAT.head, 0, 0, 0, 'ceilingRadarShell'), B(.1, .004, .07, P.pcb, 0, -.014, 0, 'ceilingRadarBoard'));
  for (let i = 0; i < 6; i++) cr.add(B(.016, .002, .016, P.acc, -.03 + (i % 3) * .03, -.017, -.012 + Math.floor(i / 3) * .024));
  cr.add(spot('ceilingRadarSpot', 0, -.03, 0));
  g.add(spot('rearSeatSpot', -.4, .47, -.82, Math.PI), spot('rearEye', -1.7, 1.25, -.8), spot('doorOut', -1.6, 0, -.2));
  // run 20 — CUTAWAY groups (ep030 fix): hide them to look straight into the rear bench. All at identity, so nothing moves.
  const cut = (name, parent, names) => { let c = g.getObjectByName(name); if (!c) { c = grp(name); parent.add(c); } names.forEach(n => { const o = g.getObjectByName(n); if (o) c.add(o); }); return c; };
  cut('cutRoof', body, ['roof', 'headliner', 'pillarBL', 'pillarBR', 'pillarCL', 'pillarCR', 'rearWindow', 'brakeTop', 'domeLight', 'rearMirror']);   // windshield + A-pillars stay (frame the front)
  cut('cutSideR', body, ['frontDoorR', 'rearDoorR', 'sideGlassFR', 'pillarAR', 'mirrorR', 'doorRFrontInner']);
  // the rear quarter (bodyRear is one full-width block): a copy flattened at x −.64 stays when the right side is cut, the original hides with cutSideR
  const br = g.getObjectByName('bodyRear'), brc = br.clone(); brc.name = 'bodyRearCut'; brc.geometry = br.geometry.clone(); const bq = brc.geometry.attributes.position;
  for (let i = 0; i < bq.count; i++) if (bq.getX(i) < -.64) bq.setX(i, -.64); brc.geometry.computeVertexNormals(); body.add(brc);
  cut('cutSideR', body, ['bodyRear']);
  cut('cutFront', inn, ['seatPassenger']);   // passenger seat (in front of the infant seat) — hide for the 3/4 + chest shots
  // thin headliner strip that stays when the roof is cut: carries the ceiling radar, joined to the left roof edge
  inn.add(B(.98, .014, .44, CMAT.head, .36, RY - .046, -.85, 'radarStrip'), B(.98, .02, .02, CMAT.dashSoft, .36, RY - .046, -1.07), B(.98, .02, .02, CMAT.dashSoft, .36, RY - .046, -.63));
  cr.position.y = RY - .062;
  // the rear bench back: bodyRear's flat front face (z −1.07) used to show above the cushion as a pale wall → upholstered back cover in front of it
  const bc = grp('rearBackCover'); at(bc, 0, .74, -1.045, -.12, 0, 0); inn.add(bc); bc.add(RB(1.56, .58, .04, .03, CMAT.seat, 0, 0, 0, 'rearBackPanel'));
  for (const x of [-.4, .4]) bc.add(RB(.5, .5, .035, .05, CMAT.seat, x, -.02, .03), RB(.26, .14, .1, .04, CMAT.seat, x, .37, -.01, 'rearHeadrest'));
  const seatW = R(0x5a5651, .95); seatW.name = 'seatWarm'; ['rearBench', 'rearBackCover'].forEach(n => g.getObjectByName(n).traverse(o => { if (o.isMesh) o.material = seatW; }));   // lighter warm fabric → the rear bench is not a black hole
  // cut faces: a slim light sill cap along the open right side (reads as a clean section, not a hollow shell)
  const cap = R(0xe9e4da, .7); inn.add(B(.05, .03, 2.1, cap, -.84, .47, -.45, 'cutCapR'));
  return g;
}

/** **everyday/infantSeat** — rear-facing infant carrier (0.44 × 0.62 × 0.58 m): 'shell' (bucket), 'pad' (soft light insert), 'harness' (straps + 'buckle'), **'handle'** (carry arc — default FOLDED FLAT behind the head end; .rotation.x 0 = up for carrying), **'canopy'** (light-blue sun shade, .rotation.x open/closed — hide for clear shots), 'base' (click-in base).
 * Run 20 (ep030 fix): the bucket wall is LOW on the seat's local +x side (= the camera / open-door side when the seat sits rear-facing at rearSeatSpot, rotation.y π), so the baby reads from the side and from above.
 * Origin = bottom centre of the base; the baby's head is toward −z (the raised end). Spot **'babySpot'** inside the tilted shell: baby.position = babySpot world pos, baby.quaternion = babySpot world quaternion (blanket: same spot, +1 cm up). */
export function infantSeat() {
  const g = grp('infantSeat');
  g.add(RB(.4, .1, .6, .04, P.seatShell, 0, .05, 0, 'base'));
  const sh = grp('shell'); at(sh, 0, .1, 0, .3, 0, 0); g.add(sh);   // reclined: head end (−z) up
  const Rb = .3, drop = .15, hOf = (x, z) => { const c = Math.max(0, x / Math.hypot(x, z || 1e-6)); return -drop * Math.pow(c, 1.4); };   // rim height (≤0) — low toward +x
  const lowSide = (geo, R) => { const q = geo.attributes.position; for (let i = 0; i < q.count; i++) { const x = q.getX(i), y = q.getY(i), z = q.getZ(i); const h = hOf(x, z) * R / Rb; q.setY(i, -R + (y + R) * (R + h) / R); } geo.computeVertexNormals(); return geo; };
  const shellM = P.seatShell.clone(); shellM.side = THREE.DoubleSide; shellM.userData.real = true;
  const bowl = mesh(lowSide(new THREE.SphereGeometry(Rb, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), Rb), shellM, 'bucket'); bowl.scale.set(.72, .7, 1.05); at(bowl, 0, .22, 0); sh.add(bowl);
  const rp = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2, x = Math.cos(a) * Rb, z = Math.sin(a) * Rb; rp.push(new THREE.Vector3(x * .72, .22 + hOf(x, z) * .7, z * 1.05)); }
  sh.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rp, true), 120, .018, 8, true), P.seatShell, 'rimTop'));
  const padM = P.seatPadL.clone(); padM.side = THREE.DoubleSide; padM.userData.real = true;
  const pad = mesh(lowSide(new THREE.SphereGeometry(.27, 40, 18, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), .27), padM, 'pad'); pad.scale.set(.7, .55, 1.0); at(pad, 0, .225, 0); sh.add(pad);
  sh.add(at(mesh(new THREE.CapsuleGeometry(.05, .14, 6, 16), padM, 'headPillow'), 0, .13, -.2, 0, 0, Math.PI / 2));   // soft head-hugger under the baby's head
  const hr = grp('harness'); sh.add(hr); const strapS = R(0x6f7782, .85); for (const x of [-.055, .055]) hr.add(B(.016, .004, .08, strapS, x, .178, -.13)); hr.add(RB(.035, .01, .03, .006, P.buckle, 0, .18, -.09, 'buckle'));   // only the shoulder straps show above the blanket
  const hd = grp('handle'); at(hd, 0, .3, .02, -2.0, 0, 0); g.add(hd); hd.add(tube([[-.23, 0, 0], [-.21, .22, 0], [0, .3, 0], [.21, .22, 0], [.23, 0, 0]], .018, P.seatShell, 'handleArc'));   // folded flat back over the head end
  const cp = grp('canopy'); at(cp, 0, .3, .02, -.25, 0, 0); g.add(cp);
  const c = mesh(new THREE.SphereGeometry(.24, 32, 12, Math.PI, Math.PI, 0, Math.PI / 2), P.canopy, 'canopyFabric'); c.material = P.canopy.clone(); c.material.side = THREE.DoubleSide; c.material.userData.real = true; c.scale.set(.95, .7, 1.1); cp.add(c);
  sh.add(spot('babySpot', 0, .16, .02));
  return g;
}

/** **people/mannequin-baby** — sleeping infant (~0.6 m, light grey matte like our mannequins), lying slightly reclined along z, head at −z. Origin = bottom centre.
 * Run 20: a READABLE calm face (closed eyes as soft lash arcs, small nose, cheeks, ears, a little hair tuft), short arms resting ON the blanket with small hands (fingers) near the chest.
 * Nodes: 'head' (+ 'face'), **'chest'** (animate breathing: fx-radar.js breathe()), 'belly', armL/armR, handL/handR, legL/legR, spot **'chestSpot'** (top of the chest — echo dot / graph anchor). */
export function mannequinBaby() {
  const g = grp('mannequinBaby'), S = R(0xb5b0ab, .75), D = R(0x4a4542, .8), Ck = R(0xc4a9a2, .8);
  const head = grp('head'); at(head, 0, .105, -.235, 0, 0, -.55); g.add(head);   // turned a little toward +x (the camera / open-door side)
  const sk = mesh(new THREE.SphereGeometry(.072, 32, 24), S, 'skull'); sk.scale.set(1, .97, 1.08); head.add(sk);
  const face = grp('face'); head.add(face);   // face looks up (+y), slightly toward the feet
  for (const s of [-1, 1]) {
    const lid = []; for (let i = 0; i <= 10; i++) { const a = -.55 + 1.1 * i / 10; lid.push([s * .026 + Math.sin(a) * .013, .066 - (1 - Math.cos(a)) * .004, .012 + Math.cos(a) * .0]); }
    face.add(tube(lid.map(([x, y, z]) => [x, y, z + .0]), .0022, D, 'eye' + (s < 0 ? 'R' : 'L'), 12));
    face.add(sc(at(mesh(new THREE.SphereGeometry(.016, 12, 8), Ck), s * .036, .052, .03), 1, .35, 1));
    head.add(sc(at(mesh(new THREE.SphereGeometry(.016, 12, 8), S, 'ear' + (s < 0 ? 'R' : 'L')), s * .07, .0, .0), .45, 1, .8));
  }
  face.add(at(mesh(new THREE.SphereGeometry(.009, 12, 8), S, 'nose'), 0, .071, .03));
  const mo = []; for (let i = 0; i <= 8; i++) { const a = -.6 + 1.2 * i / 8; mo.push([Math.sin(a) * .008, .058 - (1 - Math.cos(a)) * .003, .045]); } face.add(tube(mo, .0016, D, 'mouth', 8));
  head.add(sc(at(mesh(new THREE.SphereGeometry(.03, 12, 8), R(0x8f8984, .9), 'hair'), 0, .03, -.05), 1.1, .5, .9));
  const ch = mesh(new THREE.CapsuleGeometry(.068, .07, 6, 16), S, 'chest'); ch.scale.set(1.12, .8, 1); at(ch, 0, .08, -.115, Math.PI / 2); g.add(ch);
  g.add(at(mesh(new THREE.CylinderGeometry(.035, .04, .04, 16), S, 'neck'), 0, .095, -.175, Math.PI / 2));
  const bl = mesh(new THREE.SphereGeometry(.075, 20, 14), S, 'belly'); bl.scale.set(1, .75, 1); at(bl, 0, .075, .02); g.add(bl);
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) {
    // upper arm from the shoulder down along the side, forearm bent up so the hand rests on the blanket at the chest
    g.add(tube([[s * .085, .1, -.15], [s * .1, .12, -.09], [s * .075, .152, -.05], [s * .035, .152, -.075]], .019, S, 'arm' + k, 16));
    const hn = grp('hand' + k); at(hn, s * .03, .153, -.08); g.add(hn);
    hn.add(sc(at(mesh(new THREE.SphereGeometry(.02, 14, 10), S), 0, 0, 0), 1, .7, 1.1));
    for (let f = 0; f < 4; f++) hn.add(at(mesh(new THREE.CapsuleGeometry(.0045, .012, 3, 6), S), -s * .006 + (f - 1.5) * .0085 * s * -1, -.002, -.022, Math.PI / 2 + .3, 0, 0));
    hn.add(at(mesh(new THREE.CapsuleGeometry(.005, .01, 3, 6), S), s * .02, 0, -.006, 0, 0, s * 1.2));
    g.add(at(mesh(new THREE.CapsuleGeometry(.032, .13, 4, 10), S, 'leg' + k), s * .04, .06, .13, Math.PI / 2 + .2, 0, 0)); }
  g.add(spot('chestSpot', 0, .14, -.1));
  return g;
}

/** **everyday/blanket** — soft knitted baby blanket, run 20: covers the belly + legs only, edge just below the chest (the face, chest and hands stay clear). 0.34 × 0.33 m, fits the infantSeat shell.
 * Origin = the same babySpot origin as the baby (put it on babySpot, +1 cm). One mesh 'blanket' (fade with fx-radar seeThrough), + 'blanketEdge' (rolled fold at the chest). */
export function blanket() {
  const g = grp('blanket'), z0 = -.075, z1 = .255, geo = new THREE.PlaneGeometry(.34, z1 - z0, 40, 40); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, (z0 + z1) / 2);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i);
    const top = .128 + .025 * Math.exp(-(((z - .02) / .07) ** 2)) - .03 * Math.max(0, (z - .14) / .11);   // over the belly, lower over the legs
    let y = top * Math.exp(-((x / .12) ** 6)); if (Math.abs(x) > .1) y = Math.min(y, top - (Math.abs(x) - .1) * 1.4);
    y += .003 * Math.sin(x * 90) * Math.sin(z * 70); p.setY(i, Math.max(-.02, y)); }
  geo.computeVertexNormals(); const m = mesh(geo, P.blanket, 'blanket'); m.material = P.blanket.clone(); m.material.side = THREE.DoubleSide; m.material.userData.real = true; g.add(m);
  g.add(at(mesh(new THREE.CapsuleGeometry(.014, .2, 4, 10), P.blanketB, 'blanketEdge'), 0, .132, z0 + .008, 0, 0, Math.PI / 2));
  return g;
}

/** **everyday/babyBag** — a soft shoulder bag (0.36 × 0.3 × 0.17 m) with two handles; stands on the seat in the "bag instead of a baby" beat. Origin = bottom centre. Nodes 'bag', 'flap', 'handles'. */
export function babyBag() {
  const g = grp('babyBag'); g.add(RB(.36, .28, .17, .05, P.bag, 0, .14, 0, 'bag'), RB(.34, .08, .175, .03, P.bagD, 0, .25, .005, 'flap'));
  const h = grp('handles'); g.add(h); for (const z of [-.06, .06]) h.add(tube([[-.11, .28, z], [-.08, .4, z], [.08, .4, z], [.11, .28, z]], .01, P.bagD, null, 16));
  return g;
}

/** **outdoor/parkingLot** — sunny Israeli open-air parking lot (40 × 28 m), floor y 0.
 * **Row A** bays at z −7.5 (cars nose toward −z, the mall), under 4 shade sails 'sail0..3'; **aisle** z −5..+3; **row B** bays at z +5.5 (cars nose toward +z, the camera side). Bay centres x = −15 … +15 step 2.5 → spots 'bayA0..12' / 'bayB0..12' (rotation.y = nose direction).
 * The family car's bay = **'carSpot'** (= bayB6, x 0, same rotation). Its right side is −x → keep bayB5 EMPTY so the rear door can open.
 * Around: kerbs (yellow/white painted), palms 'palm0..5' in sand islands, light poles, the mall wall with a glass 'entrance' at z −16, sky backdrop.
 * Spots: carSpot, walkEnd (the entrance — the parent walks there), eyeSpot (frame-0 camera by the rear window), wideSpot (high wide). */
export function parkingLot() {
  const g = grp('parkingLot'), W = 40, D = 28, mm = new THREE.Matrix4();
  g.add(B(W + 20, .04, D + 20, P.asphalt, 0, -.02, 0, 'asphalt'));
  const line = (x, z, l, ry = 0) => g.add(at(B(.12, .006, l, P.paintW), x, .003, z, 0, ry, 0));
  for (let x = -16.25; x <= 16.26; x += 2.5) { line(x, -7.5, 5); line(x, 5.5, 5); }
  line(0, -10, 32.5, Math.PI / 2); line(0, 8, 32.5, Math.PI / 2);
  g.add(B(34, .15, .3, P.curb, 0, .075, -10.2, 'kerbA'), B(34, .15, .3, P.curb, 0, .075, 8.2, 'kerbB'));
  for (let x = -16.5; x < 16.5; x += 1) g.add(B(.5, .152, .302, (Math.round(x) % 2) ? P.curbY : P.paintW, x + .25, .076, -10.2));
  const isl = (x, z) => { g.add(B(2.4, .14, 1.6, P.sand, x, .07, z)); };
  const palm = (name, x, z, h) => { const p = grp(name); at(p, x, 0, z); g.add(p);
    for (let i = 0; i < 16; i++) p.add(at(cyl(.2 - i * .004, .22 - i * .004, h / 16 + .01, P.trunk, null, 10), Math.sin(i * .12) * .15, (i + .5) * h / 16, 0));
    for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2, f = mesh(new THREE.ConeGeometry(.35, 2.6, 4, 1, true), P.frond); f.scale.set(1, 1, .12); f.position.set(Math.sin(a) * 1.1 + .15, h - .3, Math.cos(a) * 1.1); f.rotation.set(Math.cos(a) * 1.15, 0, -Math.sin(a) * 1.15); p.add(f); } };
  [[-18, -10.5, 7], [18, -10.5, 7.5], [-18, 8.8, 6.5], [18, 8.8, 7], [-9, -12, 8], [9, -12, 6.8]].forEach(([x, z, h], i) => { isl(x, z); palm('palm' + i, x, z, h); });
  // shade sails over row A
  [-11, -4, 3, 10].forEach((x, i) => { const s = grp('sail' + i); at(s, x, 0, -7.5); g.add(s); const pts = [[-3.2, 4.4, -2.8], [3.2, 3.6, -2.4], [.2, 4.0, 2.8]];
    for (const [px, py, pz] of pts) s.add(at(cyl(.07, .09, py + .3, P.pole, null, 10), px * 1.08, (py + .3) / 2, pz * 1.08));
    const geo = new THREE.BufferGeometry(); const v = pts.flat(); const c = [(v[0] + v[3] + v[6]) / 3, (v[1] + v[4] + v[7]) / 3 - .35, (v[2] + v[5] + v[8]) / 3];
    geo.setAttribute('position', new THREE.Float32BufferAttribute([...v.slice(0, 3), ...v.slice(3, 6), ...c, ...v.slice(3, 6), ...v.slice(6, 9), ...c, ...v.slice(6, 9), ...v.slice(0, 3), ...c], 3)); geo.computeVertexNormals();
    s.add(mesh(geo, i % 2 ? P.sailB : P.sail, 'sailFabric')); });
  for (const x of [-14, 0, 14]) { const lp = grp(); at(lp, x, 0, 1.2); g.add(lp); lp.add(at(cyl(.08, .12, 8, P.pole, null, 10), 0, 4, 0), RB(.9, .12, .3, .05, P.pole, .4, 8, 0)); }
  // mall wall + entrance + sky
  const wl = grp('mall'); g.add(wl); wl.add(B(W + 10, 9, .5, P.wall, 0, 4.5, -16.5, 'mallWall'), B(W + 10, .5, 1.2, P.wallD, 0, 9.2, -16.2));
  for (let x = -22; x <= 22; x += 4) if (Math.abs(x) > 3) wl.add(B(2.6, 1.6, .1, P.glass, x, 5.8, -16.22));
  const en = grp('entrance'); at(en, 0, 0, -16.2); wl.add(en); en.add(B(5, 3.2, .1, P.glass, 0, 1.6, 0), B(6, .4, 2, P.wallD, 0, 3.6, .8));
  g.add(at(mesh(new THREE.PlaneGeometry(600, 160), P.sky, 'sky'), 0, 50, -60));
  g.getObjectByName('sky').castShadow = false;
  for (let i = 0; i < 13; i++) { const x = -15 + i * 2.5; g.add(spot('bayA' + i, x, 0, -7.5, Math.PI), spot('bayB' + i, x, 0, 5.5, 0)); }
  g.add(spot('carSpot', 0, 0, 5.5, 0), spot('walkEnd', 0, 0, -15.4), spot('eyeSpot', -2.0, 1.25, 4.6), spot('wideSpot', -6, 14, 18));
  return g;
}

export const KIT030 = { 'car/familyCar': familyCar, 'everyday/infantSeat': infantSeat, 'people/mannequin-baby': mannequinBaby, 'everyday/blanket': blanket, 'everyday/babyBag': babyBag, 'outdoor/parkingLot': parkingLot };
