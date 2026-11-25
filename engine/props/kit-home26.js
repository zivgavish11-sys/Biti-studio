// ep026-hebrew kit + news heroes (Media pro 2026-11-25 run 17). In-house, generic, no brand → CC0. Real metres, REAL colours (userData.real) → pro-v3 ready.
// Export: python3 tools/make_props.py kitchenLiving / crumpledBag / mannequin-sit / suvRobotaxi / conciergeDesk
import * as THREE from 'three';
import {PROH} from './kit-pro.js';
import {mannequin} from './kit.js';
const {mesh, at, grp, rbox, cyl, ext, roundPoly, tube} = PROH;
const R = (color, rough = .6, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
const K = {
  plaster: R(0xf2efe9, .9), tile: R(0xd9d3c8, .35), grout: R(0xb9b2a6, .9), front: R(0xf3f2ef, .5), quartz: R(0xd6d5d1, .22, .05), steel: R(0xc6c9cc, .3, .85), black: R(0x17181b, .5, .3),
  glassB: R(0x0b0c0f, .08, .2), alu: R(0xe4e4e2, .4, .6), aluDark: R(0x9a9c9e, .35, .8), glass: R(0xcfe0ea, .05, 0, {transparent: true, opacity: .16, depthWrite: false}),
  splash: R(0xe7ebe6, .3), wood: R(0x9b7653, .62), oak: R(0xb48d63, .6), fabric: R(0x8d8a84, .95), fabric2: R(0xb3aea4, .95), cushion: R(0x6f7a83, .95), rug: R(0xcfc6b6, 1),
  leaf: R(0x3f6b3a, .8), pot: R(0xe9e3d9, .7), facade: R(0xece7de, .9), winDark: R(0x29323a, .2, .3), road: R(0x3a3b3e, .95), walk: R(0xb9b3a8, .9), tree: R(0x4c7340, .85), trunk: R(0x5d4a39, .9),
  screen: R(0x07090c, .2, .2), shutter: R(0xd8d6d0, .6, .3), marble: R(0xe8e4dc, .25),
};
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);

/** **buildings/kitchenLiving** — Israeli apartment kitchen + living corner (3rd floor), cutaway (no ceiling, open front/right), 7 × 5 m, floor y 0, room x −3.5..3.5, z −2.8..2.2.
 * Back wall (z −2.8) with an **aluminium sliding window** (opening x .4..2.0, sill .9, top 2.2): 'window' → 'paneFixed' + **'paneSlide'** (open = .position.x −.78, userData.openDx), 'sill' (marble), 'shutterBox' + 'shutter' (Israeli trisim, rolled up; .scale.y to lower).
 * Outside (through the window): street 9 m below, a white block across with window rows, trees ('outside'). Left wall (x −3.5): kitchen run — lower cabinets, quartz top, 'sink' + 'tap', 'cooktop', subway-tile 'splash', upper cabinets, 'hood', 'fridge'.
 * **'bin'** — pedal bin (Ø .3 × .62 m, steel) with **'lid'** (hinge at the back: open = .rotation.x −1.1) + **'pedal'**; spot **'binMouth'**. Living: **'sofa'** (faces −x), coffee 'table', 'rug', 'plant', 'floorLamp' ('lampBulb' → warm light), media wall with **'tv'** → **'screen'** (16:9, st.screen) on the back wall.
 * Spots: **robotSpot** (by the window, inside), **windowOut** (2.3 m outside the opening — target for the 'out of the window' arc), **binMouth**, **seatSpot** (people/mannequin-sit origin; rotate it −π/2 like the sofa), eyeSpot (frame-0 camera), tvSpot. */
export function kitchenLiving() {
  const g = grp('kitchenLiving'), H = 2.7, WZ = -2.8, x0 = .4, x1 = 2.0, s0 = .9, s1 = 2.2;
  // floor: porcelain 60 cm tiles
  const fl = grp('floor'); g.add(fl); fl.add(B(7.2, .04, 5.2, K.tile, 0, -.02, -.3));
  for (let x = -3.5; x <= 3.5; x += .6) fl.add(B(.006, .002, 5, K.grout, x, .001, -.3)); for (let z = -2.8; z <= 2.2; z += .6) fl.add(B(7, .002, .006, K.grout, 0, .001, z));
  // walls
  const wb = grp('wallBack'); g.add(wb); const T = .2, zc = WZ - T / 2;
  wb.add(B(3.9 + .2, H, T, K.plaster, (-3.7 + x0) / 2, H / 2, zc), B(3.5 - x1, H, T, K.plaster, (x1 + 3.5) / 2, H / 2, zc), B(x1 - x0, s0, T, K.plaster, (x0 + x1) / 2, s0 / 2, zc), B(x1 - x0, H - s1, T, K.plaster, (x0 + x1) / 2, (s1 + H) / 2, zc));
  g.add(B(T, H, 5.1, K.plaster, -3.6, H / 2, -.25, 'wallLeft'));
  for (const [w, x] of [[7.1, -.05]]) g.add(B(w, .08, .012, K.plaster, x, .04, WZ + .006, 'skirting'));
  // window
  const win = grp('window'); g.add(win); const fw = .045;
  win.add(B(x1 - x0 + .1, fw, .12, K.alu, (x0 + x1) / 2, s0 + fw / 2, zc), B(x1 - x0 + .1, fw, .12, K.alu, (x0 + x1) / 2, s1 - fw / 2, zc), B(fw, s1 - s0, .12, K.alu, x0 + fw / 2, (s0 + s1) / 2, zc), B(fw, s1 - s0, .12, K.alu, x1 - fw / 2, (s0 + s1) / 2, zc));
  const pane = (name, xa, xb, z) => { const p = grp(name); at(p, (xa + xb) / 2, (s0 + s1) / 2, z); const w = xb - xa, h = s1 - s0 - fw * 2;
    p.add(B(w, .035, .035, K.alu, 0, h / 2 - .017, 0), B(w, .035, .035, K.alu, 0, -h / 2 + .017, 0), B(.04, h, .035, K.alu, -w / 2 + .02, 0, 0), B(.04, h, .035, K.alu, w / 2 - .02, 0, 0), B(w - .07, h - .07, .006, K.glass, 0, 0, 0, name + 'Glass'));
    return p; };
  const mid = (x0 + x1) / 2; win.add(pane('paneFixed', x0 + fw, mid + .04, zc - .03)); const ps = pane('paneSlide', mid - .04, x1 - fw, zc + .03); ps.userData.openDx = -.78; ps.add(B(.02, .25, .02, K.aluDark, -(x1 - fw - mid + .04) / 2 + .05, 0, .03, 'handle')); win.add(ps);
  win.add(B(x1 - x0 + .16, .03, .3, K.marble, (x0 + x1) / 2, s0 - .015, zc + .05, 'sill'));
  const sb = B(x1 - x0 + .1, .22, .22, K.shutter, (x0 + x1) / 2, s1 + .13, WZ - T - .11, 'shutterBox'); win.add(sb);
  const sh = grp('shutter'); at(sh, (x0 + x1) / 2, s1 + .02, WZ - T - .04); win.add(sh); for (let k = 0; k < 3; k++) sh.add(B(x1 - x0, .045, .015, K.shutter, 0, -k * .05, 0));
  // outside: street 9 m below + block across
  const out = grp('outside'); g.add(out); const gy = -9;
  out.add(B(60, .1, 14, K.road, 0, gy, -14), B(60, .2, 3, K.walk, 0, gy + .1, -5.5), B(60, .2, 3, K.walk, 0, gy + .1, -21.5));
  out.add(B(60, 12.5, 6, K.facade, 0, gy + 6.25, -26)); for (let fx = -26; fx <= 26; fx += 3.2) for (let fy = 1; fy < 11; fy += 3) out.add(B(1.5, 1.3, .1, K.winDark, fx, gy + fy + .9, -22.95));
  for (let fx = -25; fx <= 25; fx += 3.2) for (let fy = 1; fy < 11; fy += 3) out.add(B(2.2, .12, .5, K.facade, fx + .3, gy + fy + .2, -22.8));
  out.add(B(60, 12, .3, K.facade, 0, gy + 4, -3.1));   // our own facade below the window
  for (const tx of [-10, -4, 3, 9, 15]) { out.add(at(cyl(.12, .16, 4, K.trunk, null, 10), tx, gy + 2, -6.6)); const c = mesh(new THREE.IcosahedronGeometry(2.4, 1), K.tree); at(c, tx, gy + 5.2, -6.6); c.scale.y = .8; out.add(c); }
  // kitchen run along the left wall
  const kr = grp('kitchen'); g.add(kr); const kx = -3.5 + .31, za = -2.62, zb = .4, L = zb - za;
  kr.add(B(.58, .1, L, K.black, kx + .02, .05, (za + zb) / 2), B(.6, .76, L, K.front, kx, .48, (za + zb) / 2));
  for (let z = za + .3; z < zb; z += .6) { kr.add(B(.005, .7, .004, K.grout, kx + .302, .48, z)); kr.add(B(.012, .012, .2, K.black, kx + .31, .8, z - .3 + .02)); }
  kr.add(B(.64, .04, L + .02, K.quartz, kx + .02, .88, (za + zb) / 2, 'counter'));
  kr.add(B(.02, .6, L, K.splash, -3.49, 1.2, (za + zb) / 2, 'splash')); for (let y = .93; y < 1.5; y += .075) kr.add(B(.004, .003, L, K.grout, -3.478, y, (za + zb) / 2));
  const sk = grp('sink'); at(sk, kx + .02, .9, -1.6); kr.add(sk); sk.add(B(.42, .02, .55, K.steel, 0, .001, 0), B(.36, .03, .48, K.black, 0, .006, 0));
  const tap = grp('tap'); at(tap, -.22, 0, 0); sk.add(tap); tap.add(at(cyl(.018, .022, .3, K.steel, null, 20), 0, .15, 0), tube([[0, .3, 0], [.05, .38, 0], [.17, .33, 0]], .012, K.steel, 'spout', 20));
  kr.add(B(.52, .012, .58, K.glassB, kx + .02, .906, -.4, 'cooktop')); for (const [dx, dz] of [[-.12, -.13], [.12, -.13], [-.12, .13], [.12, .13]]) kr.add(at(mesh(new THREE.TorusGeometry(.085, .003, 6, 40), K.aluDark), kx + .02 + dx, .913, -.4 + dz, Math.PI / 2));
  kr.add(B(.36, .72, L, K.front, -3.5 + .18, 1.86, (za + zb) / 2, 'upper')); for (let z = za + .3; z < zb; z += .6) kr.add(B(.004, .66, .004, K.grout, -3.5 + .361, 1.86, z));
  kr.add(B(.5, .18, .7, K.steel, -3.5 + .25, 1.42, -.4, 'hood'));
  const fr = grp('fridge'); at(fr, -3.5 + .34, 0, zb + .38); kr.add(fr); fr.add(rbox(.66, 1.92, .72, .02, K.steel, 'fridgeBody'), B(.004, 1.8, .7, K.black, .332, .96, 0)); fr.children[0].position.y = .96;
  fr.add(B(.02, .5, .02, K.aluDark, .34, 1.2, -.3), B(.02, .5, .02, K.aluDark, .34, 1.2, .3));
  // pedal bin
  const bin = grp('bin'); at(bin, -2.45, 0, 1.25, 0, Math.PI / 2, 0); g.add(bin);
  bin.add(at(cyl(.15, .145, .6, K.steel, 'binBody', 48), 0, .32, 0), at(cyl(.152, .152, .03, K.black, null, 48), 0, .015, 0));
  const lid = grp('lid'); at(lid, 0, .62, -.15); bin.add(lid); lid.add(at(cyl(.153, .153, .025, K.steel, 'lidTop', 48), 0, .012, .15), at(mesh(new THREE.SphereGeometry(.153, 40, 12, 0, Math.PI * 2, 0, .45), K.steel), 0, -.02, .15));
  bin.add(at(rbox(.1, .02, .09, .01, K.black, 'pedal'), 0, .03, .17)); bin.add(at(grp('binMouth'), 0, .64, 0));
  // living side
  const sofa = grp('sofa'); at(sofa, 2.85, 0, .55, 0, -Math.PI / 2, 0); g.add(sofa);
  sofa.add(rbox(2.2, .42, .95, .06, K.fabric, 'base')); sofa.children[0].position.y = .23;
  sofa.add(at(rbox(2.2, .5, .22, .08, K.fabric, 'back'), 0, .62, -.38), at(rbox(.22, .25, .95, .08, K.fabric), -1.0, .55, 0), at(rbox(.22, .25, .95, .08, K.fabric), 1.0, .55, 0));
  for (const x of [-.45, .45]) sofa.add(at(rbox(.88, .14, .72, .06, K.fabric2), x, .5, .07)); sofa.add(at(rbox(.42, .38, .12, .06, K.cushion, 'pillow'), .65, .72, -.22, -.2, 0, .1));
  for (const [x, z] of [[-1, .4], [1, .4], [-1, -.4], [1, -.4]]) sofa.add(at(cyl(.02, .015, .04, K.black, null, 10), x, .02, z));
  g.add(at(rbox(1.1, .04, .6, .02, K.oak, 'table'), 1.75, .42, .55)); g.add(B(1.0, .38, .5, K.black, 1.75, .2, .55)).children;
  g.add(B(2.6, .01, 1.9, K.rug, 1.95, .005, .5, 'rug'));
  const pl = grp('plant'); at(pl, 2.55, 0, -2.4); g.add(pl); pl.add(at(cyl(.2, .16, .45, K.pot, null, 32), 0, .225, 0)); for (let k = 0; k < 9; k++) { const l = mesh(new THREE.SphereGeometry(.22, 12, 8), K.leaf); l.scale.set(.5, 1.2, .2); at(l, Math.cos(k * 2.4) * .12, .8 + (k % 3) * .22, Math.sin(k * 2.4) * .12, Math.sin(k) * .4, k * 2.4, .4); pl.add(l); }
  const fl2 = grp('floorLamp'); at(fl2, 3.25, 0, -.9); g.add(fl2); fl2.add(at(cyl(.15, .15, .02, K.black, null, 32), 0, .01, 0), at(cyl(.012, .012, 1.5, K.black, null, 12), 0, .76, 0), at(cyl(.15, .2, .26, R(0xefe6d6, .9), 'lampShade', 32), 0, 1.55, 0), at(grp('lampBulb'), 0, 1.5, 0));
  // media wall + tv on the back wall (left of the window)
  const tv = grp('tv'); at(tv, -1.4, 1.5, WZ + .04); g.add(tv); tv.add(rbox(1.25, .72, .035, .01, K.black, 'tvBody'));
  const sc = mesh(new THREE.PlaneGeometry(1.2, .675), K.screen, 'screen'); sc.userData.aspect = 16 / 9; at(sc, 0, 0, .019); tv.add(sc);
  g.add(B(1.8, .4, .4, K.oak, -1.4, .22, WZ + .2, 'console'));
  // spots
  const spot = (n, x, y, z) => g.add(at(grp(n), x, y, z));
  spot('robotSpot', 1.0, 0, -2.25); spot('windowOut', 1.2, 1.2, -5.2); spot('seatSpot', 2.95, 0, .35); spot('eyeSpot', -.6, 1.6, 1.6); spot('tvSpot', -1.4, 1.5, -2.7);
  g.getObjectByName('seatSpot').rotation.y = -Math.PI / 2;
  return g;
}

/** **everyday/crumpledBag** — crumpled empty snack bag (generic, no brand), ~0.2 m. Origin = the top crimp (grab point) → attach to a hand/grip spot; the bag hangs along −y. */
export function crumpledBag() {
  const g = grp('crumpledBag'); const geo = new THREE.BoxGeometry(.16, .2, .05, 14, 18, 4); const p = geo.attributes.position, v = new THREE.Vector3();
  const n = (x, y, z) => Math.sin(x * 61 + y * 23) * Math.cos(y * 47 - z * 71) + .5 * Math.sin(x * 113 - z * 37 + y * 89);
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const yy = (v.y + .1) / .2; const pinch = .55 + .45 * Math.sin(Math.PI * Math.min(1, yy * 1.15));
    v.x *= pinch * (1 + .12 * n(v.x, v.y, v.z)); v.z *= pinch * (.9 + .35 * n(v.z, v.x, v.y)); v.y += .012 * n(v.y, v.z, v.x); p.setXYZ(i, v.x, v.y - .11, v.z); }
  geo.computeVertexNormals(); const bag = mesh(geo, R(0xc8562c, .38, .35), 'bagBody'); g.add(bag);
  const band = mesh(new THREE.BoxGeometry(.165, .035, .052, 14, 2, 4), R(0xf1ede4, .5, .1), 'band'); { const q = band.geometry.attributes.position; for (let i = 0; i < q.count; i++) { v.fromBufferAttribute(q, i); v.x *= .9 + .1 * n(v.x, v.y, 1); v.z *= .8 + .4 * Math.abs(n(v.z, v.x, 2)); q.setXYZ(i, v.x, v.y, v.z); } band.geometry.computeVertexNormals(); }
  at(band, 0, -.13, 0); g.add(band);
  const cr = grp('crimp'); g.add(cr); for (let k = 0; k < 7; k++) cr.add(B(.15, .004, .006, R(0xb04a26, .4, .4), 0, -.004 - k * .0035, (k % 2 ? .002 : -.002)));
  return g;
}

/** **people/mannequin-sit** — seated person (grey silhouette under proLook people:[...]), talking with a small right-hand gesture. Origin = feet origin; put it on kitchenLiving 'seatSpot' (same rotation).
 * Joints like every people/* mannequin: head (nod = .rotation.x +, turn .y), torso, shoulder/elbow L/R, hip/knee L/R. */
export function mannequinSit() { const g = mannequin('stand'); g.name = 'mannequinSit'; g.getObjectByName('phone').visible = false;
  const P = (n, x, y = 0, z = 0) => g.getObjectByName(n).rotation.set(x, y, z);
  g.getObjectByName('pelvis').position.set(0, .5, -.35);
  P('torso', -.12); P('head', .05, .25); P('hipL', -1.5, 0, .08); P('hipR', -1.5, 0, -.08); P('kneeL', 1.45); P('kneeR', 1.5);
  P('shoulderL', .1, 0, .15); P('elbowL', -.9); P('shoulderR', -.55, 0, -.25); P('elbowR', -1.25, .3, 0); return g; }

// ---------- news heroes ----------
/** **pro/suvRobotaxi** — generic large electric SUV robotaxi (5.0 × 2.0 × 1.75 m + roof halo), front = +z. Roof **'halo'**: a sensor ring on 4 short posts with 'lidarTop' (spin .y), corner lidars lidar0..3, camera pods cam0..7.
 * Lighter tinted glass shows an **empty driver seat** + 'steeringWheel'. wheel0..3. No brand, no logo. */
export function suvRobotaxi() {
  const root = grp('suvRobotaxi'), body = grp('body'); root.add(body); const paint = R(0x2e3136, .28, .55), trim = R(0x111214, .5, .3);
  const prof = roundPoly([[-2.5, .38], [2.45, .38], [2.52, .62], [2.42, .9], [1.25, 1.06], [.55, 1.62], [-1.9, 1.68], [-2.45, 1.38], [-2.52, .9]], .14, 6);
  body.add(at(ext(prof, 1.96, paint, 'shell', .16), 0, 0, 0, 0, -Math.PI / 2, 0));
  const gl = roundPoly([[1.15, 1.08], [.56, 1.6], [-1.85, 1.64], [-2.32, 1.36], [-2.25, 1.1]], .06, 4);
  body.add(at(ext(gl, 1.98, R(0x1a2129, .05, .3, {transparent: true, opacity: .55}), 'glass', .1), 0, .005, 0, 0, -Math.PI / 2, 0));
  body.add(B(2.02, .12, 4.6, trim, 0, .44, 0, 'cladding')); body.add(B(1.7, .03, .03, R(0xf2f2f2, .3, 0, {emissive: 0xffffff, emissiveIntensity: .5}), 0, .82, 2.5, 'lightBar'));
  body.add(B(1.7, .03, .03, R(0xb3121a, .4, 0, {emissive: 0xb3121a, emissiveIntensity: .5}), 0, 1.05, -2.5, 'tailBar'));
  const seat = grp('seatDriver'); at(seat, .45, .55, -.1); body.add(seat); seat.add(rbox(.5, .14, .5, .05, R(0x3a3c40, .8)), at(rbox(.5, .7, .14, .05, R(0x3a3c40, .8)), 0, .38, -.25, -.15, 0, 0));
  const sw = grp('steeringWheel'); at(sw, .45, 1.05, .55, -1.1, 0, 0); body.add(sw); sw.add(mesh(new THREE.TorusGeometry(.18, .02, 10, 40), trim));
  for (const [i, x, z] of [[0, .88, 1.55], [1, -.88, 1.55], [2, .88, -1.55], [3, -.88, -1.55]]) { const w = grp('wheel' + i); at(w, x, .42, z); body.add(w);
    w.add(at(cyl(.42, .42, .27, R(0x141517, .9), null, 48), 0, 0, 0, 0, 0, Math.PI / 2), at(cyl(.3, .3, .28, R(0x8d9298, .3, .85), null, 40), 0, 0, 0, 0, 0, Math.PI / 2)); }
  const halo = grp('halo'); at(halo, 0, 1.72, -.35); root.add(halo); const ring = new THREE.Shape(); const hw = .82, hl = 1.0;
  halo.add(at(ext(roundPoly([[-hw, -hl], [hw, -hl], [hw, hl], [-hw, hl]], .3), .06, R(0x1b1d21, .4, .5), 'haloFrame', .02), 0, .1, 0, Math.PI / 2));
  for (const [x, z] of [[-.6, -.8], [.6, -.8], [-.6, .8], [.6, .8]]) halo.add(at(cyl(.025, .03, .12, trim, null, 12), x, .04, z));
  const lt = grp('lidarTop'); at(lt, 0, .18, .1); halo.add(lt); lt.add(at(cyl(.11, .12, .05, trim, null, 40), 0, 0, 0), at(cyl(.1, .1, .1, R(0x0a0b0d, .1, .4), 'lidarWindow', 40), 0, .075, 0), at(cyl(.105, .105, .02, R(0xd9dbde, .3, .7), null, 40), 0, .135, 0));
  for (const [i, x, z] of [[0, -.78, .95], [1, .78, .95], [2, -.78, -.95], [3, .78, -.95]]) { const l = grp('lidar' + i); at(l, x, .14, z); halo.add(l); l.add(at(cyl(.055, .055, .07, R(0x0a0b0d, .1, .4), null, 28), 0, 0, 0), at(cyl(.058, .058, .015, R(0xd9dbde, .3, .7), null, 28), 0, .04, 0)); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, c = grp('cam' + i); at(c, Math.sin(a) * .8, .1, Math.cos(a) * .98, 0, a, 0); halo.add(c); c.add(rbox(.08, .05, .05, .01, trim), at(cyl(.014, .014, .01, R(0x050608, .05, .5), null, 16), 0, 0, .028, Math.PI / 2)); }
  return root;
}

/** **pro/conciergeDesk** — hotel lobby concierge desk (generic): curved travertine desk 2.6 m with a brass band, slatted oak back wall 4 m, 'bell' (brass), 'tablet' → 'screen' (st.screen), orchid 'plant', two 'pendant' lights, marble floor.
 * Spots: **robotSpot** (behind the desk, put pro/humanoid there), guestSpot (in front). Front = +z. */
export function conciergeDesk() {
  const g = grp('conciergeDesk'); const trav = R(0xd8ccb8, .55), brass = R(0xb99a5b, .3, .9), oak = R(0x8f6a46, .6);
  g.add(B(8, .04, 6, R(0xe9e5df, .2, .05), 0, -.02, 0, 'floor'));
  const sh = new THREE.Shape(); sh.absarc(0, 0, 1.6, Math.PI * .25, Math.PI * .75, false); sh.absarc(0, 0, 1.0, Math.PI * .75, Math.PI * .25, true);
  const dg = new THREE.ExtrudeGeometry(sh, {depth: 1.05, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 3, curveSegments: 48}); dg.rotateX(-Math.PI / 2);
  const desk = mesh(dg, trav, 'desk'); at(desk, 0, 0, -1.0); g.add(desk);
  const bg = new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); s.absarc(0, 0, 1.62, Math.PI * .25, Math.PI * .75, false); s.absarc(0, 0, 1.6, Math.PI * .75, Math.PI * .25, true); return s; })(), {depth: .05, bevelEnabled: false, curveSegments: 48}); bg.rotateX(-Math.PI / 2);
  g.add(at(mesh(bg, brass, 'brassBand'), 0, .85, -1.0));
  const top = new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); s.absarc(0, 0, 1.66, Math.PI * .23, Math.PI * .77, false); s.absarc(0, 0, .95, Math.PI * .77, Math.PI * .23, true); return s; })(), {depth: .04, bevelEnabled: true, bevelThickness: .01, bevelSize: .01, curveSegments: 48}); top.rotateX(-Math.PI / 2);
  g.add(at(mesh(top, R(0xf0ece6, .18, .05), 'deskTop'), 0, 1.06, -1.0));
  const wall = grp('backWall'); at(wall, 0, 0, -2.4); g.add(wall); wall.add(B(4.2, 3.2, .1, R(0x2b2724, .7), 0, 1.6, -.06)); for (let k = 0; k < 40; k++) wall.add(B(.05, 3.1, .05, oak, -2 + k * .1025, 1.6, .02));
  const bell = grp('bell'); at(bell, -.35, 1.1, .45); g.add(bell); bell.add(at(cyl(.05, .055, .01, R(0x1a1a1a, .4, .3), null, 32), 0, .005, 0), at(mesh(new THREE.SphereGeometry(.045, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), brass), 0, .01, 0), at(cyl(.006, .006, .02, brass, null, 10), 0, .065, 0));
  const tb = grp('tablet'); at(tb, .35, 1.1, .4, -.6, -.15, 0); g.add(tb); tb.add(rbox(.26, .18, .01, .008, R(0x16171a, .3, .4)));
  const sc = mesh(new THREE.PlaneGeometry(.24, .16), R(0x07090c, .2), 'screen'); sc.userData.aspect = 1.5; at(sc, 0, 0, .006); tb.add(sc); g.add(at(cyl(.015, .03, .06, brass, null, 16), .35, 1.11, .37));
  const pl = grp('plant'); at(pl, .9, 1.1, .1); g.add(pl); pl.add(at(cyl(.07, .055, .14, R(0xf2efe9, .4), null, 24), 0, .07, 0));
  for (let k = 0; k < 4; k++) { pl.add(at(cyl(.003, .003, .4, R(0x4c6b3a, .7), null, 6), Math.cos(k * 1.6) * .03, .33, Math.sin(k * 1.6) * .03, Math.sin(k) * .2, 0, Math.cos(k) * .2)); for (let f = 0; f < 4; f++) { const fl = mesh(new THREE.SphereGeometry(.028, 12, 8), R(0xf4eef2, .6)); fl.scale.y = .4; at(fl, Math.cos(k * 1.6) * .06 + f * .025 - .04, .45 + f * .03, Math.sin(k * 1.6) * .06 + .02); pl.add(fl); } }
  for (const x of [-.8, .8]) { const p = grp(x < 0 ? 'pendant0' : 'pendant1'); at(p, x, 2.4, -.4); g.add(p); p.add(at(cyl(.003, .003, 1.2, R(0x111111, .5), null, 6), 0, .6, 0), at(mesh(new THREE.SphereGeometry(.14, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), brass), 0, 0, 0), at(mesh(new THREE.CircleGeometry(.13, 32), R(0xfff3dc, .5, 0, {emissive: 0xfff3dc, emissiveIntensity: .8})), 0, -.001, 0, Math.PI / 2)); }
  g.add(at(grp('robotSpot'), 0, 0, -1.6), at(grp('guestSpot'), 0, 0, 1.4));
  return g;
}
export const KITHOME26 = { 'buildings/kitchenLiving': kitchenLiving, 'everyday/crumpledBag': crumpledBag, 'people/mannequin-sit': mannequinSit, 'pro/suvRobotaxi': suvRobotaxi, 'pro/conciergeDesk': conciergeDesk };
