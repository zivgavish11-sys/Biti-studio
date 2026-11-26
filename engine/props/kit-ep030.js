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
  const RY = 1.46, cr = grp('ceilingRadar'); at(cr, 0, RY - .045, -1.0); inn.add(cr);
  cr.add(RB(.14, .025, .1, .01, CMAT.head, 0, 0, 0, 'ceilingRadarShell'), B(.1, .004, .07, P.pcb, 0, -.014, 0, 'ceilingRadarBoard'));
  for (let i = 0; i < 6; i++) cr.add(B(.016, .002, .016, P.acc, -.03 + (i % 3) * .03, -.017, -.012 + Math.floor(i / 3) * .024));
  cr.add(spot('ceilingRadarSpot', 0, -.03, 0));
  g.add(spot('rearSeatSpot', -.4, .47, -.95, Math.PI), spot('rearEye', -1.7, 1.25, -.8), spot('doorOut', -1.6, 0, -.2));
  return g;
}

/** **everyday/infantSeat** — rear-facing infant carrier (0.44 × 0.62 × 0.58 m): 'shell' (grey bucket), 'pad' (soft insert), 'harness' (straps + 'buckle'), **'handle'** (carry arc, .rotation.x to fold), **'canopy'** (light-blue sun shade, .rotation.x open/closed), 'base' (click-in base).
 * Origin = bottom centre of the base; the baby's head is toward −z (front of the carrier, the raised end). Spot **'babySpot'** inside the tilted shell: baby.position = babySpot world pos, baby.quaternion = babySpot world quaternion (same for the blanket, +2 cm up). */
export function infantSeat() {
  const g = grp('infantSeat');
  g.add(RB(.4, .1, .6, .04, P.seatShell, 0, .05, 0, 'base'));
  const sh = grp('shell'); at(sh, 0, .1, 0, .3, 0, 0); g.add(sh);   // reclined: head end (−z) up
  const bowl = mesh(new THREE.SphereGeometry(.3, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), P.seatShell, 'bucket'); bowl.material = P.seatShell; bowl.scale.set(.72, .7, 1.05); at(bowl, 0, .22, 0); sh.add(bowl);
  bowl.geometry = bowl.geometry.clone(); bowl.material = P.seatShell.clone(); bowl.material.side = THREE.DoubleSide; bowl.material.userData.real = true;
  const rim = mesh(new THREE.TorusGeometry(.3, .018, 10, 64), P.seatShell, 'rimTop'); rim.scale.set(.72, 1.05, 1); at(rim, 0, .22, 0, Math.PI / 2); sh.add(rim);
  const pad = mesh(new THREE.SphereGeometry(.27, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), P.seatPad, 'pad'); pad.scale.set(.7, .55, 1.0); at(pad, 0, .225, 0); pad.material = P.seatPad.clone(); pad.material.side = THREE.DoubleSide; pad.material.userData.real = true; sh.add(pad);
  const hr = grp('harness'); sh.add(hr); for (const x of [-.06, .06]) hr.add(B(.025, .005, .26, P.strap, x, .2, -.04)); hr.add(RB(.05, .015, .05, .008, P.buckle, 0, .205, .07, 'buckle'));
  const hd = grp('handle'); at(hd, 0, .3, .02); g.add(hd); hd.add(tube([[-.23, 0, 0], [-.21, .22, 0], [0, .3, 0], [.21, .22, 0], [.23, 0, 0]], .018, P.seatShell, 'handleArc'));
  const cp = grp('canopy'); at(cp, 0, .3, .02, -.25, 0, 0); g.add(cp);   // hood over the head end (−z); fold back = .rotation.x +1.2, hide for clear shots
  const c = mesh(new THREE.SphereGeometry(.24, 32, 12, Math.PI, Math.PI, 0, Math.PI / 2), P.canopy, 'canopyFabric'); c.material = P.canopy.clone(); c.material.side = THREE.DoubleSide; c.material.userData.real = true; c.scale.set(.95, .7, 1.1); cp.add(c);
  sh.add(spot('babySpot', 0, .16, .02));   // inside the tilted shell → copy its WORLD position + quaternion onto the baby / blanket
  return g;
}

/** **people/mannequin-baby** — sleeping infant (~0.6 m, grey silhouette like our mannequins), lying slightly reclined along z, head at −z. Origin = bottom centre.
 * Nodes: 'head', **'chest'** (animate breathing: .scale.z/.x small — fx-radar.js breathe()), 'belly', armL/armR, legL/legR, spot **'chestSpot'** (top of the chest — the echo dot / graph anchor). */
export function mannequinBaby() {
  const g = grp('mannequinBaby'), S = P.skin;
  const hd = mesh(new THREE.SphereGeometry(.07, 24, 16), S, 'head'); hd.scale.set(1, .95, 1.1); at(hd, 0, .1, -.24); g.add(hd);
  const ch = mesh(new THREE.CapsuleGeometry(.07, .08, 6, 16), S, 'chest'); ch.scale.set(1.1, .8, 1); at(ch, 0, .08, -.1, Math.PI / 2); g.add(ch);
  const bl = mesh(new THREE.SphereGeometry(.075, 20, 14), S, 'belly'); bl.scale.set(1, .75, 1); at(bl, 0, .075, .02); g.add(bl);
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) { g.add(at(mesh(new THREE.CapsuleGeometry(.025, .1, 4, 10), S, 'arm' + k), s * .09, .09, -.1, Math.PI / 2 - .3, 0, s * .3));
    g.add(at(mesh(new THREE.CapsuleGeometry(.032, .13, 4, 10), S, 'leg' + k), s * .04, .06, .13, Math.PI / 2 + .2, 0, 0)); }
  g.add(spot('chestSpot', 0, .14, -.1));
  return g;
}

/** **everyday/blanket** — soft knitted baby blanket draped over a lying baby (0.34 × 0.42 m — fits inside the infantSeat shell, bump in the middle, edges falling). Origin = centre bottom; put it on infantSeat babySpot.
 * One mesh 'blanket' (fade with fx-radar seeThrough for "waves pass the fabric"), + 'blanketEdge' fold. */
export function blanket() {
  const g = grp('blanket'), geo = new THREE.PlaneGeometry(.34, .42, 40, 40); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x / .12, (z - .03) / .17);
    let y = .14 * Math.exp(-r * r * .9) + .02; if (Math.abs(x) > .11) y -= (Math.abs(x) - .11) * 1.1; y += .004 * Math.sin(x * 90) * Math.sin(z * 70); p.setY(i, Math.max(-.02, y)); }
  geo.computeVertexNormals(); const m = mesh(geo, P.blanket, 'blanket'); m.material = P.blanket.clone(); m.material.side = THREE.DoubleSide; m.material.userData.real = true; g.add(m);
  g.add(at(mesh(new THREE.CapsuleGeometry(.015, .24, 4, 10), P.blanketB, 'blanketEdge'), 0, .12, -.15, 0, 0, Math.PI / 2));
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
