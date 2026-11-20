// Tel-Aviv neighbourhood kit (Media pro 2026-11-20 run 12, for ep021-dronedelivery — Ziv: "הכי מקצועי שיש לנו").
// Generic (no real building, no logo), our own work → CC0. Real metres, y-up, standing on y=0. Hero palette: monochrome indigo + one light-blue accent, matte, no textures, no glow.
// Built to be seen from 0–100 m above: strong roof detail (solar heaters, tanks, terraces, pergolas), Bauhaus rounded corners + continuous balcony bands, real street grid via fx-tlv.js.
// Export: python3 tools/make_props.py tlv/   (also drone/winch, drone/droidPod, people/mannequin-reach)
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {mannequin} from './kit.js';

const S = (color, rough = .85, metal = 0) => new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal});
// hero palette by brightness (the episode's indigo() pass keeps these readable): light = 'white' Bauhaus plaster, dark = glass/shade
export const TM = {
  plaster: S(0xc3c6f2), plaster2: S(0xaeb2ea), plaster3: S(0x9a9fe2), shade: S(0x6d74c4), trim: S(0xd9dbf5, .8),
  glass: S(0x14173f, .3, .2), glass2: S(0x1d2154, .35, .2), frame: S(0x8a90dc, .7), dark: S(0x23265a, .8), roof: S(0x7d83cf, .9), roof2: S(0x8f95d8, .9),
  deck: S(0x5b61b4, .85), deck2: S(0x6a70bf, .85), metal: S(0xb3b8e6, .45, .5), panel: S(0x2b3a8f, .4, .3), tank: S(0xd9ddf7, .6, .1),
  leaf: S(0x3d4799, .9), leaf2: S(0x4a55aa, .9), leaf3: S(0x323d8c, .9), trunk: S(0x4a4f9a, .9), palm: S(0x5560b4, .85), palmTrunk: S(0x6b70b8, .9),
  asphalt: S(0x1d1f4c, .95), walk: S(0x5a5fae, .9), walk2: S(0x4c519f, .9), curb: S(0x9a9fe0, .8), line: S(0xd9ddf7, .7), path: S(0x8a8fd6, .95),
  sand: S(0x868ad0, .95), sand2: S(0x7a7ec6, .95), wet: S(0x6e74c6, .7), acc: S(0x8ea6ff, .6), fabric: S(0xe3e5fa, .85), fabric2: S(0x8ea6ff, .8),
  shell: S(0xe3e6f8, .45, .05), shell2: S(0xc6cbef, .5, .05), arm: S(0x2b2f6a, .55, .3), rubber: S(0x101233, .9), steel: S(0xb3b8e6, .35, .7),
  parcel: S(0xd9dbf5, .85), tower: S(0x5d64b8, .85), tower2: S(0x4b52a8, .85), towerGlass: S(0x2a2f78, .35, .2),
};
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...kids) => { const g = new THREE.Group(); if (name) g.name = name; kids.forEach(k => g.add(k)); return g; };
const bx = (w, h, d, m, name) => mesh(new THREE.BoxGeometry(w, h, d), m, name);
const B = (w, h, d, m, x, y, z, name) => at(bx(w, h, d, m, name), x, y, z);          // box by centre
const rbox = (w, h, d, r, m, name) => mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name);
const cyl = (rt, rb, h, m, name, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const rng = seed => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };

/** merge every mesh that is NOT inside a named 'keep' node into one mesh per material (fast for big cities). Keeps transforms of kept nodes. */
export function bake(root, keep = []) {
  root.updateMatrixWorld(true); const inv = root.matrixWorld.clone().invert();
  const isKept = o => { for (let p = o; p && p !== root; p = p.parent) if (keep.includes(p.name)) return true; return false; };
  const byMat = new Map(), dead = [];
  root.traverse(o => { if (!o.isMesh || isKept(o)) return; const g = o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    const gi = g.index ? g.toNonIndexed() : g; ['uv', 'uv1', 'uv2'].forEach(a => gi.deleteAttribute(a)); if (!gi.attributes.normal) gi.computeVertexNormals();
    if (!byMat.has(o.material)) byMat.set(o.material, []); byMat.get(o.material).push(gi); dead.push(o); });
  dead.forEach(o => o.parent.remove(o));
  // drop now-empty unnamed groups
  const empty = []; root.traverse(o => { if (o !== root && !o.isMesh && !o.name && !o.children.length) empty.push(o); }); empty.forEach(o => o.parent && o.parent.remove(o));
  let i = 0; for (const [m, gs] of byMat) root.add(mesh(mergeGeometries(gs, false), m, 'baked' + (i++)));
  return root;
}

// ---------- footprint helpers (plan view: x right, z toward the street/front) ----------
/** body footprint w×d with rounded FRONT corners (rL front-left, rR front-right); Shape in (x, −z). */
function footShape(w, d, rL = 0, rR = 0, inset = 0) {
  const W = w / 2 - inset, D = d / 2 - inset, L = Math.max(0, rL - inset), R = Math.max(0, rR - inset), s = new THREE.Shape();
  s.moveTo(-W, D); s.lineTo(W, D); s.lineTo(W, -D + R); if (R) s.absarc(W - R, -D + R, R, 0, -Math.PI / 2, true); else s.lineTo(W, -D);
  s.lineTo(-W + L, -D); if (L) s.absarc(-W + L, -D + L, L, -Math.PI / 2, -Math.PI, true); else s.lineTo(-W, -D); s.lineTo(-W, D); return s;
}
/** extrude a plan Shape upward: y0..y0+h */
function plan(shape, h, y0, m, name, holes = []) { holes.forEach(hh => shape.holes.push(hh)); const g = new THREE.ExtrudeGeometry(shape, {depth: h, bevelEnabled: false, curveSegments: 14}); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); return mesh(g, m, name); }
/** front path along the outline: [{x, z, ox, oz}] — offset direction o (mitred on square corners). opts: left/right = side length wrapped round the corner, cutL = start the front at this x (stair tower left of it). */
function frontPath(w, d, rL, rR, {sideL = 0, sideR = 0, cutL = null, cutR = null, n = 10} = {}) {
  const W = w / 2, D = d / 2, P = [];
  if (cutL == null) {
    if (sideL > 0) P.push({x: -W, z: D - rL - sideL, ox: -1, oz: 0});
    if (rL > 0) for (let k = 0; k <= n; k++) { const a = Math.PI - k / n * Math.PI / 2; P.push({x: -W + rL + rL * Math.cos(a), z: D - rL + rL * Math.sin(a), ox: Math.cos(a), oz: Math.sin(a)}); }
    else if (sideL > 0) P.push({x: -W, z: D, ox: -1, oz: 1});
    else P.push({x: -W, z: D, ox: 0, oz: 1});
  } else P.push({x: cutL, z: D, ox: 0, oz: 1});
  if (cutR == null) {
    if (rR > 0) for (let k = 0; k <= n; k++) { const a = Math.PI / 2 - k / n * Math.PI / 2; P.push({x: W - rR + rR * Math.cos(a), z: D - rR + rR * Math.sin(a), ox: Math.cos(a), oz: Math.sin(a)}); }
    else if (sideR > 0) P.push({x: W, z: D, ox: 1, oz: 1});
    else P.push({x: W, z: D, ox: 0, oz: 1});
    if (sideR > 0) P.push({x: W, z: D - rR - sideR, ox: 1, oz: 0});
  } else P.push({x: cutR, z: D, ox: 0, oz: 1});
  return P;
}
/** a band following a front path, between offsets e0..e1 (metres out from the wall), height h at y. */
function band(P, e0, e1, h, y, m, name) {
  const s = new THREE.Shape(); P.forEach((p, i) => { const X = p.x + p.ox * e0, Z = p.z + p.oz * e0; i ? s.lineTo(X, -Z) : s.moveTo(X, -Z); });
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; s.lineTo(p.x + p.ox * e1, -(p.z + p.oz * e1)); } s.closePath();
  return plan(s, h, y, m, name);
}
/** window with frame + shutter box, on a wall facing +z (local), w×h, bottom at y=0. */
function win(w = 1.2, h = 1.4, shut = .3) {
  const g = grp(null); g.add(B(w + .14, h + .14, .05, TM.frame, 0, h / 2, .02)); g.add(B(w, h, .05, TM.glass, 0, h / 2, .04));
  if (shut > 0) g.add(B(w, h * shut, .03, TM.shade, 0, h - h * shut / 2, .07)); g.add(B(w + .1, .16, .14, TM.trim, 0, h + .08, .07)); g.add(B(w + .24, .06, .16, TM.trim, 0, -.04, .08)); return g;
}
/** Israeli rooftop solar water heater ('dud shemesh'): two tilted collectors + tank on a frame. Faces +z. */
export function solarHeater() {
  const g = grp('solarHeater');
  for (const x of [-.55, .55]) { g.add(at(bx(1.0, .06, 2.0, TM.panel), x, .62, .1, -.62)); for (let k = 0; k < 6; k++) g.add(at(bx(.02, .065, 1.95, TM.frame), x - .45 + k * .18, .63, .1, -.62)); }
  g.add(at(cyl(.3, .3, 2.1, TM.tank, 'tank', 20), 0, 1.25, -.85, 0, 0, Math.PI / 2)); for (const x of [-.9, .9]) g.add(at(cyl(.31, .31, .06, TM.frame, null, 20), x, 1.25, -.85, 0, 0, Math.PI / 2));
  for (const [x, z, hh] of [[-1, -.85, 1], [1, -.85, 1], [-1, .9, .3], [1, .9, .3]]) g.add(B(.05, hh, .05, TM.metal, x, hh / 2, z));
  g.add(at(cyl(.025, .025, 1.2, TM.metal, null, 6), .3, .9, -.2, .9)); return g;
}
function waterTank(r = .55, h = 1.1) { const g = grp('waterTank'); g.add(at(cyl(r, r, h, TM.tank, null, 20), 0, h / 2 + .2, 0)); g.add(at(cyl(r * .3, r * .3, .08, TM.frame, null, 12), 0, h + .24, 0)); g.add(B(r * 2.1, .2, r * 2.1, TM.metal, 0, .1, 0)); return g; }
function acUnit() { const g = grp(null); g.add(rbox(.8, .55, .3, .03, TM.trim)); g.children[0].position.set(0, .275, .15); g.add(at(cyl(.2, .2, .02, TM.shade, null, 16), -.12, .275, .31, Math.PI / 2)); return g; }
function lounger(m = TM.fabric) { const g = grp('lounger'); g.add(B(.7, .12, 1.9, TM.deck2, 0, .3, 0)); g.add(B(.66, .08, 1.2, m, 0, .4, .3)); g.add(at(bx(.66, .08, .7, m), 0, .6, -.62, .7)); for (const [x, z] of [[-.3, -.85], [.3, -.85], [-.3, .85], [.3, .85]]) g.add(B(.05, .26, .05, TM.metal, x, .13, z)); return g; }
function planter(L = 2, seed = 1) { const r = rng(seed), g = grp('planter'); g.add(B(L, .5, .5, TM.shade, 0, .25, 0));
  for (let x = -L / 2 + .25; x < L / 2; x += .35) { const s = mesh(new THREE.IcosahedronGeometry(.22 + r() * .12, 0), r() > .5 ? TM.leaf : TM.leaf2); at(s, x, .6 + r() * .1, (r() - .5) * .1); g.add(s); } return g; }
function smallTable(chairs = 2) { const g = grp('table'); g.add(at(cyl(.4, .4, .04, TM.trim, null, 20), 0, .74, 0)); g.add(at(cyl(.04, .04, .72, TM.metal, null, 8), 0, .37, 0));
  for (let i = 0; i < chairs; i++) { const a = i / chairs * Math.PI * 2, c = grp(null); at(c, Math.sin(a) * .65, 0, Math.cos(a) * .65, 0, a + Math.PI); g.add(c); c.add(B(.44, .05, .44, TM.deck2, 0, .45, 0)); c.add(B(.44, .45, .04, TM.deck2, 0, .7, -.2)); for (const [x, z] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) c.add(B(.03, .45, .03, TM.metal, x, .22, z)); }
  return g; }
function umbrella(r = 1.3, m = TM.fabric) { const g = grp('umbrella'); g.add(at(cyl(.025, .025, 2.4, TM.metal, null, 8), 0, 1.2, 0)); const c = mesh(new THREE.ConeGeometry(r, .45, 8, 1, true), m); c.material = m; at(c, 0, 2.4, 0); g.add(c);
  g.add(at(cyl(r * .98, r * .98, .04, m, null, 8), 0, 2.18, 0)); return g; }

/** rooftop terrace kit (the hero roof): plank deck, pergola with slats, planters, loungers, table, glass rail. Local origin = terrace centre on the roof, w×d. 'terraceSpot' = where a person stands (open deck). */
function terrace(w = 8, d = 5, seed = 3) {
  const g = grp('terrace');
  g.add(B(w, .08, d, TM.deck, 0, .04, 0, 'deck')); for (let x = -w / 2 + .15; x < w / 2; x += .3) g.add(B(.02, .085, d - .05, TM.deck2, x, .045, 0));
  // pergola over the left third
  const pg = grp('pergola'); pg.position.set(-w / 2 + w * .22, 0, 0); g.add(pg); const pw = w * .4, pd = d - .4;
  for (const [x, z] of [[-pw / 2, -pd / 2], [pw / 2, -pd / 2], [-pw / 2, pd / 2], [pw / 2, pd / 2]]) pg.add(B(.14, 2.5, .14, TM.trim, x, 1.25, z));
  for (const z of [-pd / 2, pd / 2]) pg.add(B(pw + .3, .2, .12, TM.trim, 0, 2.55, z)); for (let x = -pw / 2; x <= pw / 2 + .01; x += .32) pg.add(B(.06, .14, pd + .3, TM.trim, x, 2.72, 0));
  const lg = grp(null); lg.add(at(lounger(), -.5, .08, 0)); lg.add(at(lounger(TM.fabric2), .5, .08, 0)); pg.add(lg);
  g.add(at(smallTable(3), w * .12, .08, -d * .18));
  g.add(at(planter(w * .9, seed), 0, .08, -d / 2 + .3)); const p2 = planter(d * .7, seed + 1); p2.rotation.y = Math.PI / 2; p2.position.set(w / 2 - .3, .08, .1); g.add(p2);
  g.add(at(umbrella(1.2, TM.fabric2), w * .12, .08, -d * .18));
  const spot = new THREE.Object3D(); spot.name = 'terraceSpot'; spot.position.set(w * .25, .08, d * .2); g.add(spot);
  return g;
}

/** Tel-Aviv Bauhaus apartment block (generic, 'White City' feel). Footprint w×d, front faces +z, centred on the origin.
 *  opts: floors (3–5), round 'R' | 'L' | 'both' | null (rounded front corners with wrapping balconies), pilotis (columns + recessed lobby) or a shop strip,
 *  stair = 'thermo' (vertical 'thermometer' stair window on the front-left), terrace (hero rooftop terrace), heaters (# solar heaters), seed.
 *  Nodes: body, balcony_<f>, roof, roofRoom, solarHeater*, waterTank*, terrace/terraceSpot (if terrace). userData.roofY, userData.footprint [w,d]. */
export function tlvBlock({w = 14, d = 15, floors = 4, round = 'R', pilotis = false, stair = null, terrace: ter = false, heaters = 4, seed = 1, plaster = TM.plaster} = {}) {
  const r = rng(seed), g = grp('tlvBlock'), G = 3.2, F = 3.0, H = G + floors * F, R = 3.4;
  const rL = round === 'L' || round === 'both' ? R : 0, rR = round === 'R' || round === 'both' ? R : 0;
  g.userData.roofY = H + .1; g.userData.footprint = [w, d];
  const body = grp('body'); g.add(body);
  // ground floor
  if (pilotis) { body.add(plan(footShape(w, d, rL, rR, 2.2), G, 0, TM.plaster3, 'lobby'));
    const fp = frontPath(w, d, rL, rR, {sideL: rL ? 3 : 0, sideR: rR ? 3 : 0}); for (let i = 0; i < fp.length; i += Math.max(1, Math.floor(fp.length / 7))) { const p = fp[i]; body.add(at(cyl(.22, .22, G, plaster, null, 14), p.x - p.ox * .5, G / 2, p.z - p.oz * .5)); }
    body.add(B(1.8, 2.5, .08, TM.glass2, -w * .15, 1.25, d / 2 - 2.15)); body.add(B(w * .6, .5, .5, TM.leaf, w * .1, .25, d / 2 + .9)); }
  else { body.add(plan(footShape(w, d, rL, rR), G, 0, TM.plaster3, 'ground'));
    body.add(band(frontPath(w, d, rL, rR, {sideL: rL ? 4 : 0, sideR: rR ? 4 : 0}), .0, .05, 2.4, .25, TM.glass2, 'shopGlass'));
    body.add(band(frontPath(w, d, rL, rR, {sideL: rL ? 4 : 0, sideR: rR ? 4 : 0}), .0, .9, .14, 2.85, plaster, 'canopy')); }
  // upper floors body
  body.add(plan(footShape(w, d, rL, rR), H - G, G, plaster, 'mass'));
  // front: stair tower ('thermometer' window) + continuous balcony bands
  const cutL = stair === 'thermo' && !rL ? -w / 2 + 2.6 : null;
  const P = frontPath(w, d, rL, rR, {sideL: rL ? 4.5 : 0, sideR: rR ? 4.5 : 0, cutL});
  for (let f = 0; f < floors; f++) { const y = G + f * F, bnd = grp('balcony_' + f); g.add(bnd);
    bnd.add(band(P, -.05, 1.25, .16, y, TM.trim));                       // slab
    bnd.add(band(P, 1.1, 1.25, .95, y + .16, plaster));                   // solid parapet
    bnd.add(band(P, 1.1, 1.27, .05, y + 1.06, TM.trim));                  // cap line
    bnd.add(band(P, -.01, .04, 1.45, y + .75, TM.glass));                 // ribbon window behind
    bnd.add(band(P, .03, .06, .3, y + 2.25, TM.shade));                   // shutter boxes line
    if (r() < .5) { const pl = mesh(new THREE.IcosahedronGeometry(.3, 0), TM.leaf2); const p = P[Math.floor(r() * P.length)]; at(pl, p.x + p.ox * .8, y + 1.2, p.z + p.oz * .8); bnd.add(pl); } }
  if (cutL != null) { const tx = -w / 2 + 1.3; body.add(B(1.3, H - G - .6, .1, TM.glass, tx, G + (H - G) / 2, d / 2 + .02, 'thermo'));
    for (let y = G + .3; y < H - .3; y += .45) body.add(B(1.36, .05, .14, TM.frame, tx, y, d / 2 + .04)); body.add(B(2.0, .15, .6, TM.trim, tx, G - .1, d / 2 + .3)); }
  // side walls: windows + AC units
  for (const s of [-1, 1]) { const zs = []; const r0 = s < 0 ? rL : rR; for (let z = -d / 2 + 1.6; z < d / 2 - r0 - (r0 ? 4.6 : 1.2); z += 2.8) zs.push(z);
    for (let f = 0; f < floors; f++) for (const z of zs) { const wn = win(1.1, 1.3, [.2, .6, 0, .9][Math.floor(r() * 4)]); wn.rotation.y = s * Math.PI / 2; wn.position.set(s * (w / 2 + .01), G + f * F + .9, z); body.add(wn);
      if (r() < .3) { const a = acUnit(); a.rotation.y = s * Math.PI / 2; a.position.set(s * (w / 2 + .02), G + f * F + .45, z + 1.0); body.add(a); } } }
  // back: windows
  for (let f = 0; f < floors; f++) for (let x = -w / 2 + 1.6; x < w / 2 - 1; x += 2.7) { const wn = win(1.1, 1.3, .5); wn.rotation.y = Math.PI; wn.position.set(x, G + f * F + .9, -d / 2 - .01); body.add(wn); }
  // roof: parapet, deck, stair room, heaters, tanks, mast
  const roof = grp('roof'); roof.position.y = H; g.add(roof);
  roof.add(plan(footShape(w, d, rL, rR), .1, 0, TM.roof, 'roofDeck'));
  roof.add(plan(footShape(w, d, rL, rR), .55, 0, TM.trim, 'parapet', [footShape(w, d, rL, rR, .2)]));
  const rr = grp('roofRoom'); rr.position.set(cutL != null ? -w / 2 + 1.6 : -w / 2 + 2.2, 0, -d / 2 + 2.4); roof.add(rr);
  rr.add(B(2.8, 2.5, 3, plaster, 0, 1.25, 0)); rr.add(B(3.1, .14, 3.3, TM.trim, 0, 2.55, 0)); rr.add(B(.95, 2.0, .06, TM.dark, .5, 1.0, 1.52, 'roofDoor'));
  const hz = ter ? -d / 2 + 2.1 : -d / 2 + 4.4; let hx = -w / 2 + 5.4;
  for (let i = 0; i < heaters; i++) { const sh = solarHeater(); sh.name = 'solarHeater' + i; const row = ter ? 0 : Math.floor(i / 3); sh.position.set(hx + (ter ? i : i % 3) * 2.45, .1, hz + row * 3.6); if (sh.position.x < w / 2 - 1.2) roof.add(sh); }
  for (let i = 0; i < 2; i++) { const t = waterTank(); t.name = 'waterTank' + i; t.position.set(w / 2 - 1.3 - i * 1.4, .1, -d / 2 + 1.3); roof.add(t); }
  roof.add(at(cyl(.03, .03, 3.5, TM.metal, 'mast', 6), -w / 2 + 3.2, 4.2, -d / 2 + 1.3)); for (let k = 0; k < 3; k++) roof.add(B(.9 - k * .2, .03, .03, TM.metal, -w / 2 + 3.2, 4.8 + k * .5, -d / 2 + 1.3));
  if (r() < .6) { const a = acUnit(); a.position.set(w * .1, .1, -d / 2 + .9); roof.add(a); const a2 = acUnit(); a2.position.set(w * .1 + 1, .1, -d / 2 + .9); roof.add(a2); }
  if (ter) { const tt = terrace(w - 2.2, d * .45, seed); tt.position.set(.3, .1, d / 2 - d * .25 - .3); roof.add(tt); }
  else { // simple pergola or plain gravel patches on non-hero roofs
    if (r() < .5) { const pg = grp('pergola'); pg.position.set(w * .18, .1, d * .22); roof.add(pg); const pw = 4, pd = 3; for (const [x, z] of [[-2, -1.5], [2, -1.5], [-2, 1.5], [2, 1.5]]) pg.add(B(.12, 2.4, .12, TM.trim, x, 1.2, z));
      for (let x = -2; x <= 2.01; x += .4) pg.add(B(.06, .12, pd + .3, TM.trim, x, 2.45, 0)); pg.add(B(pw, .06, pd, TM.deck, 0, .03, 0)); pg.add(at(smallTable(2), 0, .06, 0)); }
    else roof.add(B(w * .45, .03, d * .3, TM.roof2, w * .12, .12, d * .2)); }
  // hero roof: no bake for the terrace (people stand there); city copies get baked by fx-tlv
  return g;
}

/** generic big street tree (ficus/ 'shikma' feel): trunk + clustered canopy. h ≈ 7 m. */
export function ficus(seed = 2, h = 7) {
  const r = rng(seed), g = grp('ficus'); g.add(at(cyl(.22, .32, h * .45, TM.trunk, 'trunk', 10), 0, h * .225, 0));
  for (let k = 0; k < 3; k++) { const a = k * 2.1 + r(); g.add(at(cyl(.08, .14, h * .3, TM.trunk, null, 8), Math.cos(a) * .5, h * .5, Math.sin(a) * .5, Math.sin(a) * .5, 0, -Math.cos(a) * .5)); }
  const cm = [TM.leaf, TM.leaf2, TM.leaf3]; for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2 + r(), rr = k ? 1.5 + r() * 1.2 : 0;
    const c = mesh(new THREE.IcosahedronGeometry(1.5 + r() * .8, 1), cm[k % 3]); c.scale.set(1, .72, 1); at(c, Math.cos(a) * rr, h * .7 + r() * 1.2 + (k ? 0 : .8), Math.sin(a) * rr); g.add(c); }
  return g;
}
/** palm (promenade 'washingtonia' feel): curved ringed trunk + 14 drooping fronds. h ≈ 9 m. */
export function palm(seed = 4, h = 9) {
  const r = rng(seed), g = grp('palm'), lean = (r() - .5) * .9;
  const pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push(new THREE.Vector3(Math.sin(t * 1.4) * lean, t * h, 0)); }
  const cv = new THREE.CatmullRomCurve3(pts); g.add(mesh(new THREE.TubeGeometry(cv, 24, .2, 8, false), TM.palmTrunk, 'trunk'));
  for (let k = 1; k < 18; k++) { const p = cv.getPoint(k / 18); g.add(at(cyl(.23, .23, .06, TM.trunk, null, 8), p.x, p.y, p.z)); }
  const top = cv.getPoint(1); const crown = grp('crown'); crown.position.copy(top); g.add(crown);
  crown.add(mesh(new THREE.SphereGeometry(.42, 10, 8), TM.trunk));
  for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2 + r() * .3, L = 2.8 + r() * .8, up = k % 2 ? .35 : -.05;
    const fp = []; for (let i = 0; i <= 6; i++) { const t = i / 6; fp.push(new THREE.Vector3(t * L, Math.sin(t * Math.PI * .75) * (.9 + up) - t * t * 1.6, 0)); }
    const fc = new THREE.CatmullRomCurve3(fp); const pos = [], idx = []; const N = 12;
    for (let i = 0; i <= N; i++) { const t = i / N, p = fc.getPoint(t), wdt = Math.sin(Math.PI * Math.min(1, t * 1.15)) * .42 + .03; pos.push(p.x, p.y, -wdt, p.x, p.y - .05, 0, p.x, p.y, wdt); }
    for (let i = 0; i < N; i++) { const b = i * 3; idx.push(b, b + 3, b + 1, b + 1, b + 3, b + 4, b + 1, b + 4, b + 2, b + 2, b + 4, b + 5); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = TM.palm.clone(); m.side = THREE.DoubleSide; const fr = mesh(geo, m); fr.rotation.y = a; crown.add(fr); }
  return g;
}
function bench(m = TM.deck2) { const g = grp('bench'); g.add(B(1.8, .07, .45, m, 0, .45, 0)); g.add(at(bx(1.8, .4, .05, m), 0, .72, -.22, -.15)); for (const x of [-.75, .75]) g.add(B(.07, .45, .45, TM.metal, x, .22, 0)); return g; }
function lamp(h = 5.5) { const g = grp('lamp'); g.add(at(cyl(.06, .09, h, TM.metal, null, 10), 0, h / 2, 0)); g.add(at(rbox(.45, .12, .45, .05, TM.trim, 'lampHead'), 0, h + .05, 0)); return g; }

/** Tel-Aviv boulevard segment (Rothschild-style, generic), L along x, 30 m across z (centred). Central sand path + two tree rows + benches + lamps + kiosk (opt.),
 *  hedges, two one-way roads with lane dashes + parking lanes, sidewalks. Tiles end-to-end along x. Nodes: path, kiosk, treeRow*, roadN, roadS. */
export function boulevard(L = 44, {kiosk = true, seed = 7} = {}) {
  const r = rng(seed), g = grp('boulevard');
  g.add(B(L, .04, 30, TM.asphalt, 0, .02, 0, 'asphalt'));
  for (const s of [-1, 1]) { g.add(B(L, .18, 3.2, TM.walk, 0, .09, s * 13.4, s < 0 ? 'walkN' : 'walkS')); g.add(B(L, .2, .2, TM.curb, 0, .1, s * 11.8));
    for (let x = -L / 2 + 1; x < L / 2; x += 4) g.add(B(2, .01, .14, TM.line, x, .045, s * 8.6));                                  // lane dashes
    for (let x = -L / 2 + 2.5; x < L / 2; x += 5.5) g.add(B(.1, .01, 2.1, TM.line, x, .045, s * 10.7));                              // parking bay ticks
    for (let x = -L / 2; x < L / 2; x += 1.2) g.add(B(.02, .005, 3.1, TM.walk2, x, .182, s * 13.4)); }
  // central island
  g.add(B(L, .2, 12, TM.walk2, 0, .1, 0, 'island')); g.add(B(L, .03, 5.2, TM.path, 0, .215, 0, 'path'));
  for (const s of [-1, 1]) { g.add(B(L, .25, .3, TM.curb, 0, .12, s * 6)); g.add(B(L, .5, .6, TM.leaf3, 0, .45, s * 5.5, 'hedge'));
    const row = grp(s < 0 ? 'treeRowN' : 'treeRowS'); g.add(row); for (let x = -L / 2 + 3.5; x < L / 2; x += 7) row.add(at(ficus(seed + x * 3 + s, 7 + r() * 1.5), x + (r() - .5), .2, s * 3.9));
    for (let x = -L / 2 + 7; x < L / 2; x += 7) { const b = bench(); b.position.set(x, .2, s * 2.95); b.rotation.y = s < 0 ? 0 : Math.PI; g.add(b); }
    for (let x = -L / 2 + 0; x < L / 2; x += 14) g.add(at(lamp(4.5), x, .2, s * 2.85)); }
  if (kiosk) { const k = grp('kiosk'); k.position.set(0, .23, 0); g.add(k);
    const s = new THREE.Shape(); s.absarc(0, 0, 1.6, 0, Math.PI * 2); k.add(plan(s, 2.6, 0, TM.plaster, 'kioskBody')); k.add(at(cyl(2.6, 2.6, .18, TM.trim, 'kioskRoof', 28), 0, 2.75, 0));
    k.add(at(mesh(new THREE.CylinderGeometry(1.62, 1.62, 1.0, 28, 1, true, -.9, 1.8), TM.glass), 0, 1.6, 0));
    for (const [x, z] of [[-3.2, -1.2], [3.2, 1.2], [-3.4, 1.4], [3.4, -1.3]]) { k.add(at(smallTable(2), x, 0, z)); }
    k.add(at(umbrella(1.3), -3.2, 0, -1.2)); k.add(at(umbrella(1.3, TM.fabric2), 3.2, 0, 1.2)); }
  return g;
}

/** beach + promenade segment (Tel-Aviv 'tayelet', generic), runs along z (L), sea toward −x. x +8..0 promenade (wave paving, palms, benches, lamps, rail),
 *  0..−2.4 sea wall step down, −2.4..−34 sand sloping to the water line (umbrellas, loungers, lifeguard tower, wooden walkway). Pair with fx-tlv tlvSea() from x −34 out.
 *  Nodes: promenade, palms, beach, lifeguard, umbrellas, waterLine. */
export function promenade(L = 44, {seed = 11, lifeguard = true} = {}) {
  const r = rng(seed), g = grp('promenade');
  const pr = grp('promenade'); g.add(pr); pr.add(B(10, .3, L, TM.walk, 4, .15, 0, 'paving'));
  // wave paving: two-tone sine stripes along the promenade (a famous Tel-Aviv motif, drawn generically)
  for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 60; i++) { const z = -L / 2 + i / 60 * L; pts.push([1.6 + k * 2.3 + Math.sin(z * .45 + k) * .55, z]); }
    const s = new THREE.Shape(); pts.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z)); for (let i = pts.length - 1; i >= 0; i--) s.lineTo(pts[i][0] + .5, -pts[i][1]); pr.add(plan(s, .01, .3, k % 2 ? TM.walk2 : TM.path)); }
  pr.add(B(.12, 1.0, L, TM.metal, .15, .8, 0, 'rail')); for (let z = -L / 2; z <= L / 2; z += 2) pr.add(B(.06, 1.0, .06, TM.metal, .15, .8, z));
  const palms = grp('palms'); g.add(palms); for (let z = -L / 2 + 4; z < L / 2; z += 8) palms.add(at(palm(seed + z * 7, 8.5 + r() * 2), 7.5 + (r() - .5), .3, z + (r() - .5) * 2));
  for (let z = -L / 2 + 8; z < L / 2; z += 8) { const b = bench(); b.position.set(1.2, .3, z); b.rotation.y = -Math.PI / 2; pr.add(b); pr.add(at(lamp(5), 8.6, .3, z - 4)); }
  // sea wall + steps
  g.add(B(2.4, .3, L, TM.plaster3, -1.2, -.15, 0, 'seaWall')); for (let k = 0; k < 3; k++) g.add(B(.6, .3, 6, TM.plaster2, -.3 - k * .6, -.15 - k * .3 + .3, 0));
  // beach: sand sloping down to the water
  const bch = grp('beach'); g.add(bch); const sg = new THREE.PlaneGeometry(32, L, 16, 1); sg.rotateX(-Math.PI / 2); const pos = sg.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setY(i, -.3 - (16 - x) / 32 * .9); } sg.computeVertexNormals(); sg.translate(-18.4, 0, 0); bch.add(mesh(sg, TM.sand, 'sand'));
  const wl = mesh(new THREE.PlaneGeometry(3.5, L), TM.wet, 'waterLine'); wl.rotation.x = -Math.PI / 2; wl.position.set(-33, -1.19, 0); bch.add(wl);
  for (let z = -L / 2 + 3; z < L / 2; z += 18) { const w = grp('walkway'); w.position.set(-8, 0, z); bch.add(w); for (let x = 0; x < 14; x += .6) w.add(B(.5, .06, 1.6, TM.deck2, -x, -.32 - x / 32 * .9 * 1.0 - .02, 0)); }
  const um = grp('umbrellas'); bch.add(um); for (let i = 0; i < 9; i++) { const x = -10 - r() * 14, z = -L / 2 + 3 + r() * (L - 6), y = -.3 - (x + 34.4) / 32 * 0 - (16 - (x + 18.4)) / 32 * .9;
    um.add(at(umbrella(1.25, i % 3 ? TM.fabric : TM.fabric2), x, y, z)); um.add(at(lounger(), x + .8, y, z + .3, 0, -Math.PI / 2 + .3)); }
  if (lifeguard) { const lg = grp('lifeguard'); lg.position.set(-16, -.8, L * .1); bch.add(lg);
    for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) lg.add(B(.16, 3, .16, TM.trim, x, 1.5, z)); lg.add(B(3.2, .2, 3.2, TM.deck2, 0, 3.1, 0));
    lg.add(B(3, 2.2, 3, TM.plaster, 0, 4.3, 0)); lg.add(B(3.05, .9, .05, TM.glass, 0, 4.6, -1.53)); lg.add(B(3.6, .2, 3.6, TM.trim, 0, 5.5, 0)); lg.add(at(cyl(.03, .03, 2, TM.metal, null, 6), 1.3, 6.5, 1.3)); lg.add(B(.6, .4, .02, TM.acc, 1.6, 7.2, 1.3, 'flag'));
    for (let k = 0; k < 6; k++) lg.add(at(bx(1, .06, .3, TM.trim), 0, .4 + k * .45, 1.9 + k * .3 * 0, -.0)); }
  return g;
}

/** far skyline towers (generic, no real tower): 'round' Ø24 × 170 m, 'tri' rounded triangle 150 m, 'square' 26 m with set-backs 200 m. Floor bands every 3.6 m, crown. */
export function tower(kind = 'round', h = null) {
  const g = grp('tower_' + kind); h = h ?? {round: 170, tri: 150, square: 200}[kind];
  let sh; if (kind === 'round') { sh = new THREE.Shape(); sh.absarc(0, 0, 12, 0, Math.PI * 2); }
  else if (kind === 'tri') { sh = new THREE.Shape(); const R = 16, k = 3; for (let i = 0; i < k; i++) { const a = i / k * Math.PI * 2 - Math.PI / 2, b = a + .35, c = a - .35;
      i ? sh.lineTo(Math.cos(c) * R, Math.sin(c) * R) : sh.moveTo(Math.cos(c) * R, Math.sin(c) * R); sh.quadraticCurveTo(Math.cos(a) * R * 1.12, Math.sin(a) * R * 1.12, Math.cos(b) * R, Math.sin(b) * R); } sh.closePath(); }
  else sh = footShape(26, 26, 2, 2);
  if (kind === 'square') { g.add(plan(sh, h * .7, 0, TM.towerGlass)); g.add(plan(footShape(22, 22, 2, 2), h * .2, h * .7, TM.towerGlass)); g.add(plan(footShape(16, 16, 2, 2), h * .1, h * .9, TM.tower)); }
  else g.add(plan(sh, h, 0, TM.towerGlass));
  // floor bands (as thin scaled copies)
  const bands = []; const base = new THREE.ExtrudeGeometry(sh, {depth: .35, bevelEnabled: false, curveSegments: 14}); base.rotateX(-Math.PI / 2);
  for (let y = 3.6; y < (kind === 'square' ? h * .7 : h) - 2; y += 3.6) bands.push(base.clone().scale(1.012, 1, 1.012).translate(0, y, 0));
  g.add(mesh(mergeGeometries(bands), TM.tower, 'floors'));
  // vertical fins on two sides for scale
  for (let k = 0; k < 6; k++) g.add(B(.4, kind === 'square' ? h * .7 : h, .6, TM.tower2, -6 + k * 2.4, (kind === 'square' ? h * .7 : h) / 2, kind === 'tri' ? 8 : 12.2));
  g.add(plan(kind === 'square' ? footShape(16, 16, 2, 2) : sh, 6, h, TM.tower2, 'crown')); g.add(at(cyl(.4, .6, 18, TM.metal, 'spire', 8), 0, h + 15, 0));
  return g;
}

// ===================== drone/winch + drone/droidPod (tether delivery, generic — not a real product) =====================
/** heavy-lift hexacopter with a winch (~1.9 m across). Faces +z. Nodes: body, arm0..5, motor0..5, prop0..5 (spin .y; disc{i} visible, blades{i} hidden), skidL/R,
 *  winch (housing), spool (spin .x, the line winds on it), dock (funnel the pod docks into), lineOut (Object3D: where the line leaves, bottom of the funnel), statusLed. */
export function winchDrone() {
  const g = grp('winchDrone'), by = .55;
  const shell = mesh(new THREE.SphereGeometry(.34, 32, 18), TM.shell, 'body'); shell.scale.set(1, .42, 1.25); shell.position.y = by; g.add(shell);
  g.add(at(rbox(.42, .08, .62, .04, TM.shell2, 'deck'), 0, by + .1, 0)); g.add(at(rbox(.06, .012, .44, .006, TM.acc, 'stripe'), 0, by + .145, 0));
  g.add(at(mesh(new THREE.SphereGeometry(.06, 16, 10), TM.glass, 'camera'), 0, by - .06, .38));
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6, R = .82, x = Math.sin(a) * R, z = Math.cos(a) * R;
    const arm = mesh(new THREE.CylinderGeometry(.028, .034, R - .2, 10), TM.arm, 'arm' + i); arm.position.set(x * .56, by + .02, z * .56); arm.rotation.set(Math.PI / 2, 0, 0); arm.rotation.order = 'YXZ'; arm.rotation.y = a; g.add(arm);
    g.add(at(cyl(.055, .06, .08, TM.arm, 'motor' + i, 16), x, by + .05, z)); g.add(at(cyl(.03, .03, .02, TM.steel, null, 12), x, by + .1, z));
    const pr = grp('prop' + i); pr.position.set(x, by + .115, z); g.add(pr);
    const bl = grp('blades' + i); bl.visible = false; pr.add(bl); for (const k of [-1, 1]) bl.add(at(rbox(.3, .008, .045, .004, TM.shell2), k * .16, 0, 0, k * .1));
    const disc = grp('disc' + i, at(mesh(new THREE.CircleGeometry(.33, 48), Object.assign(S(0xdfe3ff, .6), {transparent: true, opacity: .2, depthWrite: false, side: THREE.DoubleSide})), 0, 0, 0, -Math.PI / 2),
      at(mesh(new THREE.RingGeometry(.318, .33, 48), Object.assign(S(0x8ea6ff, .5), {transparent: true, opacity: .6, side: THREE.DoubleSide})), 0, .001, 0, -Math.PI / 2));
    disc.children.forEach(c => c.castShadow = false); pr.add(disc);
    g.add(at(mesh(new THREE.TorusGeometry(.345, .012, 6, 48), TM.arm), x, by + .115, z, Math.PI / 2)); }
  for (const s of [-1, 1]) { const sk = grp(s < 0 ? 'skidL' : 'skidR'); g.add(sk);
    sk.add(at(cyl(.018, .018, .9, TM.arm, null, 8), s * .32, .02, 0, Math.PI / 2)); for (const z of [-.25, .25]) sk.add(at(cyl(.016, .016, .55, TM.arm, null, 8), s * .26, .27, z, 0, 0, s * .22)); }
  const wn = grp('winch'); wn.position.y = by - .17; g.add(wn); wn.add(at(rbox(.3, .14, .26, .04, TM.shell2, 'winchBox'), 0, 0, 0));
  const sp = grp('spool'); sp.position.set(0, 0, 0); wn.add(sp); sp.add(at(cyl(.055, .055, .2, TM.dark, null, 20), 0, 0, 0, 0, 0, Math.PI / 2)); for (const x of [-.1, .1]) sp.add(at(cyl(.08, .08, .015, TM.steel, null, 20), x, 0, 0, 0, 0, Math.PI / 2));
  sp.add(B(.2, .01, .02, TM.acc, 0, .056, 0));                                                                  // marker so the spin reads
  const dock = lathe([[.06, 0], [.11, -.04], [.17, -.12], [.18, -.14]], TM.arm, 'dock'); dock.position.y = -.07; wn.add(dock); dock.material = TM.arm.clone(); dock.material.side = THREE.DoubleSide;
  const lo = new THREE.Object3D(); lo.name = 'lineOut'; lo.position.set(0, -.08, 0); wn.add(lo);
  g.add(at(rbox(.05, .02, .02, .008, TM.acc, 'statusLed'), 0, by - .03, -.42));
  return g;
}
function lathe(pts, m, name, seg = 40, phi0 = 0, phiL = Math.PI * 2) { return mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-4), y)), seg, phi0, phiL), m, name); }
/** 'droid' delivery pod that hangs on the line (~0.55 m tall, Ø0.34 m). Origin = top hook point (line attach), body hangs below (−y). Faces +z.
 *  Nodes: hook, neck, body, fan0..3 (ducts on the waist, each 'rotor{i}' spins .z), fin0..3, doorL/doorR (clam-shell bay: rotate .z ±1.2 to open), parcel (inside, drops out), ring (accent band), eye. */
export function droidPod() {
  const g = grp('droidPod');
  const hk = grp('hook'); g.add(hk); hk.add(at(mesh(new THREE.TorusGeometry(.03, .008, 8, 20), TM.steel), 0, -.03, 0)); hk.add(at(cyl(.012, .012, .05, TM.steel, null, 8), 0, -.07, 0));
  const top = [[.001, -.09], [.06, -.095], [.12, -.12], [.16, -.17], [.175, -.24]], bot = [[.175, -.24], [.17, -.33], [.14, -.43], [.08, -.52], [.001, -.55]];
  g.add(lathe(top, TM.shell, 'body', 48)); g.add(at(cyl(.06, .07, .03, TM.arm, 'neck', 20), 0, -.095, 0));
  const ring = mesh(new THREE.TorusGeometry(.177, .012, 8, 48), TM.acc, 'ring'); ring.rotation.x = Math.PI / 2; ring.position.y = -.24; g.add(ring);
  g.add(at(mesh(new THREE.SphereGeometry(.03, 16, 10), TM.glass, 'eye'), 0, -.2, .155)); g.add(at(mesh(new THREE.TorusGeometry(.034, .006, 6, 20), TM.acc), 0, -.2, .158));
  // clam-shell parcel bay (bottom half), hinged at the waist on each side
  for (const [nm, ph, s] of [['doorR', 0, 1], ['doorL', Math.PI, -1]]) { const d = grp(nm); d.position.set(s * .175, -.24, 0); g.add(d);
    const m = TM.shell.clone(); m.side = THREE.DoubleSide; const sh = lathe(bot, m, null, 24, ph, Math.PI); sh.position.set(-s * .175, .24, 0); d.add(sh); }
  const pc = grp('parcel'); pc.position.y = -.4; g.add(pc); pc.add(at(rbox(.2, .16, .2, .015, TM.parcel, 'box'), 0, 0, 0)); pc.add(B(.205, .03, .205, TM.acc, 0, .02, 0, 'band'));
  // steering ducted fans on the waist (4) + tail fins (4)
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4, x = Math.sin(a) * .2, z = Math.cos(a) * .2;
    const f = grp('fan' + i); f.position.set(x, -.2, z); f.rotation.y = a + Math.PI / 2; g.add(f);
    const duct = mesh(new THREE.CylinderGeometry(.045, .045, .04, 20, 1, true), TM.arm); duct.material = TM.arm.clone(); duct.material.side = THREE.DoubleSide; duct.rotation.x = Math.PI / 2; f.add(duct);
    const ro = grp('rotor' + i); f.add(ro); for (let k = 0; k < 3; k++) ro.add(at(bx(.08, .012, .004, TM.steel), 0, 0, 0, 0, 0, k / 3 * Math.PI)); ro.add(at(cyl(.012, .012, .02, TM.dark, null, 10), 0, 0, 0, Math.PI / 2));
    const fin = mesh(new THREE.BoxGeometry(.006, .12, .07), TM.arm, 'fin' + i); fin.position.set(Math.sin(a + Math.PI / 4) * .12, -.48, Math.cos(a + Math.PI / 4) * .12); fin.rotation.y = a + Math.PI / 4; g.add(fin); }
  return g;
}
/** person reaching up (arm towards a parcel above), looking up. Same joints as people/mannequin-*. */
export function mannequinReach() { const g = mannequin('stand'); const P = (n, x, y = 0, z = 0) => g.getObjectByName(n).rotation.set(x, y, z);
  P('shoulderR', -2.75, 0, -.12); P('elbowR', -.2); P('shoulderL', -.25, 0, .18); P('elbowL', -.5); P('head', -.55); P('torso', -.08);
  const ph = g.getObjectByName('phone'); if (ph) ph.visible = false; g.name = 'mannequinReach'; return g; }

export const KITTLV = {
  'tlv/blockA': () => tlvBlock({w: 14, d: 15, floors: 4, round: 'R', seed: 1}),
  'tlv/blockB': () => tlvBlock({w: 13, d: 14, floors: 3, round: null, pilotis: true, stair: 'thermo', seed: 2, plaster: TM.plaster2}),
  'tlv/blockC': () => tlvBlock({w: 15, d: 15, floors: 4, round: 'both', pilotis: true, seed: 3}),
  'tlv/blockD': () => tlvBlock({w: 16, d: 13, floors: 5, round: 'L', seed: 4, plaster: TM.plaster2, heaters: 6}),
  'tlv/blockE': () => tlvBlock({w: 12, d: 14, floors: 3, round: null, stair: 'thermo', seed: 5, heaters: 3}),
  'tlv/blockHero': () => tlvBlock({w: 14, d: 15, floors: 4, round: 'R', terrace: true, seed: 6, heaters: 3}),
  'tlv/ficus': () => ficus(2), 'tlv/palm': () => palm(4), 'tlv/solarHeater': solarHeater,
  'tlv/boulevard': () => boulevard(44), 'tlv/promenade': () => promenade(44),
  'tlv/towerRound': () => tower('round'), 'tlv/towerTri': () => tower('tri'), 'tlv/towerSquare': () => tower('square'),
  'drone/winchDrone': winchDrone, 'drone/droidPod': droidPod, 'people/mannequin-reach': mannequinReach,
};
// city copies are baked (merged per material) for speed; hero objects keep all their nodes
export const BAKE = {'tlv/blockA': [], 'tlv/blockB': [], 'tlv/blockC': [], 'tlv/blockD': [], 'tlv/blockE': [], 'tlv/ficus': [], 'tlv/palm': [], 'tlv/boulevard': ['kiosk'], 'tlv/promenade': ['lifeguard'],
  'tlv/towerRound': [], 'tlv/towerTri': [], 'tlv/towerSquare': []};
