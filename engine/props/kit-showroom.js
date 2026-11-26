// Media pro 2026-11-26 run 18 — new worlds (news inbox 26.11 + video inbox: "a NEW, creative world for every episode").
// Generic, no brand/logo, our own work → CC0. Real metres, y-up, front = +z. REAL colours (userData.real) → pro-v3/look.js keep them. No glow.
// Export: python3 tools/make_props.py showroom / geofenceMap / restaurant
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
const R = (color, rough = .6, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
const M = { floor: R(0xb9b5ae, .22, .05), floorD: R(0x8f8b85, .3), white: R(0xf1efea, .45), wall: R(0xe4e0d8, .8), dark: R(0x24262b, .5, .3), alu: R(0xbfc4ca, .3, .85),
  glass: R(0xa9c3cf, .04, .1, {transparent: true, opacity: .22, depthWrite: false}), oak: R(0xb08a5e, .55), walnut: R(0x6b4a33, .55), brass: R(0xc2a36a, .3, .9),
  black: R(0x141518, .5, .2), steel: R(0xc8ccd0, .28, .9), stone: R(0xd8d2c8, .35), terr: R(0xd9cfc3, .5), tile: R(0xf4f2ee, .25), green: R(0x4e6b47, .7), pot: R(0x6d6a66, .8),
  lampW: R(0xfff1d8, .5, 0, {emissive: 0xfff1d8, emissiveIntensity: .6}), acc: R(0x8ea6ff, .5), accDeep: R(0x4f6fe0, .5), zone: R(0x8ea6ff, .7, 0, {transparent: true, opacity: .5, depthWrite: false}),
  zoneNew: R(0x4f6fe0, .7, 0, {transparent: true, opacity: .3, depthWrite: false}), road: R(0x3b3e44, .9), block: R(0xd6d2ca, .85), blockD: R(0xb7b2a9, .85), water: R(0x6f8fa8, .25, .1), park: R(0x8fa57f, .9),
  plate: R(0x1d2026, .6, .2), mBlock: R(0x5a606b, .8), mBlockD: R(0x474c56, .8), mRoad: R(0x30343b, .9), tomato: R(0xc0412e, .6), dough: R(0xe7cf9c, .8), red: R(0xa3392c, .6), chair: R(0x2f3135, .6, .2) };
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...k) => { const g = new THREE.Group(); if (name) g.name = name; k.forEach(c => g.add(c)); return g; };
const RB = (w, h, d, r, m, x, y, z, name) => at(mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name), x, y, z);
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);
const cyl = (rt, rb, h, m, name, seg = 32) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const spot = (name, x, y, z, ry = 0) => at(grp(name), x, y, z, 0, ry, 0);
function plant(h = 1.4) { const g = grp('plant'); g.add(at(cyl(.2, .16, .45, M.pot), 0, .225, 0));
  for (let i = 0; i < 9; i++) { const a = i * 2.4, l = mesh(new THREE.SphereGeometry(.22, 12, 8), M.green); l.scale.set(.6, 1.3, .25); at(l, Math.cos(a) * .12, .55 + (i % 4) * h * .18, Math.sin(a) * .12, .3 * Math.sin(a), a, .4 * Math.cos(a)); g.add(l); } return g; }
function pendant(y, name = 'pendant') { const g = grp(name); g.add(at(cyl(.004, .004, 1.2, M.black, null, 6), 0, y + .6, 0)); g.add(at(cyl(.06, .2, .2, M.brass, null, 32), 0, y, 0)); g.add(at(cyl(.15, .15, .01, M.lampW), 0, y - .1, 0)); return g; }

/** pro/showroom — modern retail / car showroom (12 × 8 m, 4.2 m high, open front = +z for the camera). For "robot as a store / showroom sales assistant".
 * Nodes: 'floor' (polished concrete, reflective-ish), 'facade' (back glass wall with alu mullions + a street hint behind), 'slatWall' (oak, left), 'podium' (round turntable Ø4 m for a car: .rotation.y spin) with spot 'carSpot',
 * 'counter' (white stone sales counter, brass kick band) with 'tablet' → 'screen' (st.screen, aspect 1.5) + spot 'robotSpot' (behind the counter, facing +z), 'customerSpot' (in front of it), 'kiosk' (standing info screen 'kioskScreen' aspect .56),
 * 'display' (low plinth with 3 product cubes for small robots), 'bench', plants, pendant0..2 over the counter, ceiling 'lights' (linear strips, matte). */
export function showroom() {
  const g = grp('showroom'), W = 12, D = 8, H = 4.2;
  g.add(B(W, .1, D, M.floor, 0, -.05, 0, 'floor'));
  const f = grp('facade'); g.add(f); f.add(B(W, H, .02, M.glass, 0, H / 2, -D / 2, 'facadeGlass'));
  for (let x = -W / 2; x <= W / 2 + .01; x += 2) f.add(B(.08, H, .12, M.alu, x, H / 2, -D / 2));
  f.add(B(W, .12, .14, M.alu, 0, H - .06, -D / 2), B(W, .12, .14, M.alu, 0, .06, -D / 2), B(W, .06, .12, M.alu, 0, 2.6, -D / 2));
  const out = grp('outside'); g.add(out); out.add(B(W + 8, .05, 8, M.road, 0, -.12, -D / 2 - 4.2));                                           // street + far blocks (soft, out of focus)
  for (let i = 0; i < 7; i++) out.add(B(3 + (i % 3), 6 + (i * 3.1 % 7), 4, i % 2 ? M.block : M.blockD, -10 + i * 3.6, 3, -D / 2 - 10));
  out.add(at(plant(2.2), -4, 0, -D / 2 - 1.2), at(plant(2.2), 3.5, 0, -D / 2 - 1.4));
  g.add(B(.12, H, D, M.wall, -W / 2, H / 2, 0, 'wallL'), B(W, .12, D, M.white, 0, H, 0, 'ceiling'));
  const sw = grp('slatWall'); g.add(sw); for (let z = -D / 2 + .3; z < D / 2 - .2; z += .12) sw.add(B(.05, H - .3, .07, M.oak, -W / 2 + .1, (H - .3) / 2 + .15, z));
  const lt = grp('lights'); g.add(lt); for (const x of [-3, 0, 3]) lt.add(B(.08, .03, D - 1.5, M.lampW, x, H - .07, 0));
  const pd = grp('podium'); at(pd, 1.6, 0, -.8); g.add(pd); pd.add(at(cyl(2, 2.02, .12, M.floorD, 'turntable', 96), 0, .06, 0), at(cyl(2.03, 2.03, .02, M.alu, 'rim', 96), 0, .11, 0)); pd.add(spot('carSpot', 0, .12, 0));
  const ct = grp('counter'); at(ct, -3.2, 0, .6, 0, .25, 0); g.add(ct);
  ct.add(RB(2.4, 1.02, .7, .04, M.stone, 0, .51, 0, 'counterTop'), B(2.3, .06, .66, M.brass, 0, .05, 0, 'kick'));
  const tb = grp('tablet'); at(tb, .5, 1.05, .12, -.9, 0, 0); ct.add(tb); tb.add(RB(.3, .2, .012, .01, M.black, 0, 0, 0)); const s = mesh(new THREE.PlaneGeometry(.28, .18), M.black, 'screen'); s.userData.aspect = 1.5; at(s, 0, 0, .007); tb.add(s);
  ct.add(spot('robotSpot', 0, 0, -.75), spot('customerSpot', -.1, 0, 1.0, Math.PI));
  for (let i = 0; i < 3; i++) { const p = pendant(2.3, 'pendant' + i); at(p, -3.9 + i * .7, 0, .45); g.add(p); }
  const k = grp('kiosk'); at(k, 4.6, 0, 2.2, 0, -.5, 0); g.add(k); k.add(RB(.6, .04, .4, .01, M.dark, 0, .02, 0), B(.08, 1.1, .08, M.alu, 0, .6, 0), RB(.62, 1.1, .05, .02, M.black, 0, 1.55, 0));
  const ks = mesh(new THREE.PlaneGeometry(.56, 1.0), M.black, 'kioskScreen'); ks.userData.aspect = .56; at(ks, 0, 1.55, .027); k.add(ks);
  const dp = grp('display'); at(dp, -1.6, 0, -2.6); g.add(dp); dp.add(RB(3, .35, 1.1, .03, M.white, 0, .175, 0)); for (let i = 0; i < 3; i++) dp.add(RB(.5, .5, .5, .02, i === 1 ? M.walnut : M.white, -1 + i, .6, 0, 'cube' + i), spot('displaySpot' + i, -1 + i, .85, 0));
  const bn = grp('bench'); at(bn, 3.8, 0, -3.2); g.add(bn); bn.add(RB(2, .08, .45, .02, M.oak, 0, .45, 0), B(.06, .45, .4, M.black, -.85, .22, 0), B(.06, .45, .4, M.black, .85, .22, 0));
  g.add(at(plant(1.6), -5.3, 0, -3.3), at(plant(1.3), 5.4, 0, -3.4));
  g.add(spot('heroSpot', 1.6, 0, -.8), spot('camSpot', 0, 1.6, 6));
  return g;
}

/** pro/geofenceMap — glow-free city service-area map plate (6 × 6 m, lies on y=0) for "robotaxi area expansion" stories. Put a robotaxi ON it (scaled) or above it.
 * Nodes: 'base' (dark plate + bevel), 'roads' (grid + 2 boulevards + ring road), 'blocks' (low extruded city blocks, heights vary), 'river', 'parks',
 * **'zoneOld'** (light-blue fill + solid outline 'zoneOldLine' = today's area) and **'zoneNew'** (deeper-blue fill + dashed outline 'zoneNewLine' = expansion; animate .scale 0→1 from its centre or fade opacity),
 * 'pins' (pin0..4 matte map pins, .scale for pop-in), spots 'carSpot' (centre of the old zone), 'newEdge' (a point in the new area). */
export function geofenceMap() {
  const g = grp('geofenceMap'), S = 6;
  g.add(RB(S + .2, .08, S + .2, .03, M.plate, 0, -.04, 0, 'base'));
  const rd = grp('roads'); g.add(rd);
  for (let i = -5; i <= 5; i++) { rd.add(B(S, .004, .035, M.mRoad, 0, .003, i * .55), B(.035, .004, S, M.mRoad, i * .55, .003, 0)); }
  rd.add(at(B(S * 1.3, .005, .09, M.road, 0, .004, 0), 0, .004, 0, 0, .62, 0), B(.09, .005, S, M.road, -.9, .004, 0));
  const ring = mesh(new THREE.TorusGeometry(2.3, .03, 6, 96), M.road, 'ringRoad'); at(ring, 0, .004, 0, Math.PI / 2); ring.scale.z = .15; rd.add(ring);
  const rv = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-3, 0, 2.4], [-1.5, 0, 1.6], [0, 0, 2.2], [1.6, 0, 1.4], [3, 0, 1.9]].map(p => new THREE.Vector3(...p))), 64, .12, 6), M.water, 'river'); rv.scale.y = .05; g.add(rv);
  const pk = grp('parks'); g.add(pk); pk.add(B(.9, .006, .5, M.park, 1.9, .005, -2.1), B(.5, .006, .5, M.park, -2.2, .005, -.6));
  const bl = grp('blocks'); g.add(bl); let sd = 7; const rnd = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  for (let i = -5; i < 5; i++) for (let j = -5; j < 5; j++) { const x = (i + .5) * .55, z = (j + .5) * .55; if (Math.abs(z - (1.8 + .3 * Math.sin(x))) < .45) continue; if (Math.hypot(x, z) > 2.9) continue;
    const h = .02 + rnd() * (Math.hypot(x, z) < 1.2 ? .22 : .08); bl.add(B(.44, h, .44, rnd() > .5 ? M.mBlock : M.mBlockD, x, h / 2 + .004, z)); }
  const shape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z)); s.closePath(); return s; };
  const OLD = [[-1.6, -1.3], [.9, -1.6], [1.5, -.2], [1.0, 1.1], [-.6, 1.3], [-1.8, .2]], NEW = [[-2.6, -2.2], [1.4, -2.7], [2.7, -.6], [2.4, 1.3], [.4, 2.6], [-2.2, 2.2], [-2.9, -.2]];
  const zone = (name, pts, fill, lineM, dashed, y) => { const z = grp(name); const f = mesh(new THREE.ShapeGeometry(shape(pts)), fill, name + 'Fill'); at(f, 0, y, 0, -Math.PI / 2); f.castShadow = false; z.add(f);
    const ln = grp(name + 'Line'); z.add(ln); const P = [...pts, pts[0]];
    for (let i = 0; i < P.length - 1; i++) { const a = new THREE.Vector3(P[i][0], y + .01, P[i][1]), b = new THREE.Vector3(P[i + 1][0], y + .01, P[i + 1][1]), L = a.distanceTo(b), n = dashed ? Math.floor(L / .16) : 1;
      for (let k = 0; k < n; k++) { const l = dashed ? .1 : L, c = a.clone().lerp(b, dashed ? (k + .5) / n : .5); const m = B(l, .018, .035, lineM, c.x, c.y, c.z); m.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); ln.add(m); } }
    return z; };
  g.add(zone('zoneNew', NEW, M.zoneNew, M.accDeep, true, .012), zone('zoneOld', OLD, M.zone, M.acc, false, .02));
  const pins = grp('pins'); g.add(pins); [[-1, -.5], [.6, .4], [-2.2, 1.6], [2.0, -1.4], [.9, 2.1]].forEach(([x, z], i) => { const p = grp('pin' + i); at(p, x, 0, z); pins.add(p);
    p.add(at(cyl(.004, .004, .22, M.dark, null, 8), 0, .11, 0), at(mesh(new THREE.SphereGeometry(.05, 20, 14), i < 2 ? M.acc : M.accDeep), 0, .24, 0)); });
  g.add(spot('carSpot', -.1, .03, -.1), spot('newEdge', 2.0, .03, -1.4));
  return g;
}

/** buildings/restaurant — Tel-Aviv bistro with an open kitchen (10 × 7 m, open front = +z). A fresh world for "robots in restaurants" / kitchen / service-robot episodes.
 * Nodes: 'floor' (terrazzo), 'walls' (+ 'windowBand' with street outside), 'kitchen' (behind the pass: 'line' steel counters, 'stove' (4 burners 'burner0..3'), 'hood', 'fryer' with 'basket' (.position.y lift),
 * 'pizzaOven' (dome, 'ovenMouth' spot), 'pass' (stainless pass shelf with heat-lamp bar, matte) + 'passSpot' (where plates land), 'tiles' wall),
 * 'bar' (walnut bar + 4 stools), tables table0..3 with chairs + plate/glass, 'menuBoard' → 'menuScreen' (st.screen, aspect 1.6), pendants, plants.
 * Spots: chefSpot (behind the line, facing +z), runnerStart (kitchen side of the pass), table0Spot..table3Spot (aisle side of each table), doorSpot (+z entrance), robotLane (centre aisle). */
export function restaurant() {
  const g = grp('restaurant'), W = 10, D = 7, H = 3.4;
  const tz = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); x.fillStyle = '#cbc3b6'; x.fillRect(0, 0, 512, 512);
    let s = 3; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < 1600; i++) { x.fillStyle = ['#a8927a', '#8b8f94', '#bfae94', '#6e6a66', '#e2dccf'][i % 5]; x.beginPath(); x.arc(r() * 512, r() * 512, .8 + r() * 2.2, 0, 7); x.fill(); } return c; })());
  tz.wrapS = tz.wrapT = THREE.RepeatWrapping; tz.repeat.set(5, 3.5); tz.colorSpace = THREE.SRGBColorSpace; const terr = R(0xffffff, .35); terr.map = tz;
  g.add(B(W, .1, D, terr, 0, -.05, 0, 'floor'));
  const wl = grp('walls'); g.add(wl); wl.add(B(W, H, .12, M.wall, 0, H / 2, -D / 2), B(.12, H, D, M.wall, -W / 2, H / 2, 0));
  const wr = grp('windowBand'); g.add(wr); wr.add(B(.12, .9, D, M.wall, W / 2, .45, 0), B(.12, .5, D, M.wall, W / 2, H - .25, 0), B(.02, H - 1.4, D, M.glass, W / 2, .9 + (H - 1.4) / 2, 0, 'windowGlass'));
  for (let z = -D / 2; z <= D / 2; z += 1.75) wr.add(B(.08, H - 1.4, .08, M.black, W / 2, .9 + (H - 1.4) / 2, z));
  wr.add(B(.05, .05, D, M.black, W / 2, H - .5, 0)); wr.add(B(6, .05, D + 4, M.road, W / 2 + 3.2, -.1, 0)); for (let i = 0; i < 4; i++) wr.add(at(plant(2), W / 2 + 1.2, 0, -3 + i * 2));
  // open kitchen along the back wall
  const k = grp('kitchen'); at(k, -.8, 0, -D / 2 + .9); g.add(k);
  const tl = grp('tiles'); k.add(tl); for (let i = 0; i < 30; i++) for (let j = 0; j < 9; j++) tl.add(B(.2, .1, .01, M.tile, -3 + i * .205 + (j % 2) * .1, .95 + j * .105, -.78));
  const line = grp('line'); k.add(line); line.add(B(6.2, .9, .7, M.steel, 0, .45, -.4), B(6.2, .04, .72, M.steel, 0, .92, -.4));
  const st = grp('stove'); at(st, -1.4, .94, -.4); k.add(st); for (let i = 0; i < 4; i++) { const b = grp('burner' + i); at(b, (i % 2 - .5) * .5, 0, (Math.floor(i / 2) - .5) * .35); st.add(b); b.add(cyl(.1, .1, .02, M.black), at(mesh(new THREE.TorusGeometry(.07, .008, 6, 24), M.dark), 0, .015, 0, Math.PI / 2)); }
  st.add(at(cyl(.15, .14, .05, M.dark, 'pan', 32), -.25, .04, -.17)); st.add(at(cyl(.12, .12, .25, M.steel, 'pot', 32), .25, .14, .17));
  k.add(RB(2.2, .5, .9, .03, M.steel, -1.4, 2.5, -.35, 'hood'));
  const fr = grp('fryer'); at(fr, .4, 0, -.4); k.add(fr); fr.add(B(.5, .02, .5, M.dark, 0, .935, 0)); const bk = grp('basket'); at(bk, 0, .98, 0); fr.add(bk); bk.add(B(.3, .14, .25, M.steel), at(cyl(.008, .008, .35, M.black, null, 8), 0, .07, .28, Math.PI / 2.4));
  const ov = grp('pizzaOven'); at(ov, 2.3, 0, -.2); k.add(ov); ov.add(B(1.4, .95, 1.2, M.terr, 0, .475, 0)); const dm = mesh(new THREE.SphereGeometry(.7, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), M.red, 'dome'); at(dm, 0, .95, 0); ov.add(dm);
  ov.add(at(mesh(new THREE.CircleGeometry(.24, 32, 0, Math.PI), M.black, 'mouth'), 0, .95, .62), spot('ovenMouth', 0, 1.0, .7));
  const ps = grp('pass'); at(ps, 0, 0, .55); k.add(ps); ps.add(B(4.2, 1.05, .45, M.steel, 0, .525, 0), B(4.2, .03, .5, M.steel, 0, 1.08, 0), B(4.2, .04, .35, M.steel, 0, 1.55, 0, 'shelf'));
  for (const x of [-2, 2]) ps.add(B(.04, .5, .04, M.steel, x, 1.32, 0)); ps.add(B(4, .05, .08, M.dark, 0, 1.75, 0, 'heatBar'));
  for (let i = 0; i < 3; i++) { const p = grp('dish' + i); at(p, -1 + i, 1.1, 0); ps.add(p); p.add(cyl(.14, .1, .025, M.white, null, 32), at(cyl(.09, .09, .01, i === 1 ? M.dough : M.tomato, null, 24), 0, .018, 0)); }
  k.add(spot('chefSpot', -1.4, 0, .2, 0), spot('passSpot', 0, 1.1, .55));
  g.add(spot('runnerStart', 1.2, 0, -D / 2 + 2.1, 0));
  // bar on the left
  const br = grp('bar'); at(br, -W / 2 + 1, 0, .8); g.add(br); br.add(RB(.7, 1.08, 3, .03, M.walnut, 0, .54, 0), B(.85, .04, 3.1, M.stone, .05, 1.1, 0));
  for (let i = 0; i < 4; i++) { const s = grp('stool' + i); at(s, .75, 0, -1.1 + i * .73); br.add(s); s.add(at(cyl(.2, .2, .05, M.walnut), 0, .76, 0), at(cyl(.02, .02, .74, M.black, null, 8), 0, .37, 0), at(cyl(.2, .22, .02, M.black), 0, .01, 0)); }
  // dining tables
  [[0, 1.0], [2.4, 1.0], [0, 2.8], [2.4, 2.8]].forEach(([x, z], i) => { const t = grp('table' + i); at(t, x - .3, 0, z - .3); g.add(t);
    t.add(at(cyl(.4, .4, .04, M.stone, null, 40), 0, .75, 0), at(cyl(.03, .03, .73, M.black, null, 8), 0, .37, 0), at(cyl(.25, .27, .02, M.black), 0, .01, 0));
    for (const [cx, cz, ry] of [[0, -.6, 0], [0, .6, Math.PI]]) { const c = grp(); at(c, cx, 0, cz, 0, ry, 0); t.add(c); c.add(RB(.42, .05, .42, .02, M.chair, 0, .46, 0), RB(.42, .42, .04, .02, M.chair, 0, .7, -.2)); for (const [a, b] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) c.add(B(.025, .45, .025, M.black, a, .22, b)); }
    t.add(at(cyl(.12, .09, .02, M.white, null, 28), 0, .78, -.15), at(cyl(.035, .03, .12, M.glass, null, 16), .2, .83, .1)); g.add(spot(`table${i}Spot`, x + .4, 0, z - .3, -Math.PI / 2)); });
  const mb = grp('menuBoard'); at(mb, -1.3, 2.2, -D / 2 + .08); g.add(mb); mb.add(RB(1.7, 1.08, .04, .02, M.black)); const ms = mesh(new THREE.PlaneGeometry(1.6, 1.0), M.black, 'menuScreen'); ms.userData.aspect = 1.6; at(ms, 0, 0, .025); mb.add(ms);
  for (let i = 0; i < 4; i++) { const p = pendant(2.0, 'pendant' + i); at(p, i % 2 ? 2.1 : -.3, 0, i < 2 ? .7 : 2.5); g.add(p); }
  g.add(at(plant(1.4), -W / 2 + .5, 0, -D / 2 + .5 + 2.4), at(plant(1.2), W / 2 - .5, 0, D / 2 - .5));
  g.add(spot('doorSpot', 3.5, 0, D / 2, Math.PI), spot('robotLane', 1.0, 0, 1.9));
  return g;
}
export const KITSHOW = { 'pro/showroom': showroom, 'pro/geofenceMap': geofenceMap, 'buildings/restaurant': restaurant };
