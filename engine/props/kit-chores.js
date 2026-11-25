// ep027-chores kit (Media pro 2026-11-25): pro robot vacuum with mop pads + fold-out arm (the twist), self-emptying wash dock, socks, crumpled T-shirt, open dishwasher with dirty dishes,
// pan, remote teleoperator silhouette with headset. Generic, no brand → CC0. Real metres, REAL colours (userData.real) → pro-v3 ready. Pair with home2056/* house (realWorld) + pool/*, robots/windowBotPro, robots/lawnMower.
// Export: python3 tools/make_props.py vacuumPro / vacuumDockPro / sock / tshirtCrumpled / dishwasherOpen / panSkillet / mannequin-teleop
import * as THREE from 'three';
import {PROH} from './kit-pro.js';
import {mannequin} from './kit.js';
const {mesh, at, grp, rbox, cyl, ext, roundPoly, tube, lathe} = PROH;
const R = (color, rough = .6, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
const C = { white: R(0xf1f1ef, .35, .05), black: R(0x15161a, .4, .3), glossy: R(0x0c0d10, .12, .3), grey: R(0x6d7178, .5, .4), alu: R(0xb9bdc2, .3, .85), rubber: R(0x1b1c1f, .9),
  mop: R(0xd9dde2, 1), acc: R(0x8ea6ff, .45), led: R(0x8ea6ff, .4, 0, {emissive: 0x8ea6ff, emissiveIntensity: .5}), clear: R(0xd8e2ea, .05, 0, {transparent: true, opacity: .3, depthWrite: false}),
  dust: R(0x8b8478, 1), water: R(0x9fc2d6, .1, 0, {transparent: true, opacity: .55}), dirty: R(0x7d7360, .2, 0, {transparent: true, opacity: .6}),
  sock: R(0x3c4a63, .95), sock2: R(0xd8d3c8, .95), shirt: R(0x5f7f9a, .95), ceramic: R(0xf3f1ec, .3), food: R(0xa0643a, .8), steel: R(0xc8cacc, .3, .85), pan: R(0x2a2b2e, .45, .6) };
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);

/** **robots/vacuumPro** — robot vacuum-mop, Ø 0.35 × 0.1 m (+ lidar turret), front = +z. Nodes: 'shell' (white top + black glass top plate), 'lidar' (turret, spin .y), 'bumper', 'sideBrush' (spin .y), 'mopL'/'mopR' (spinning pads under the rear, spin .y, lift .position.y +.01),
 * 'bin' ('binDoor'), 'statusLed'; **'hatch'** (top flap, open = .rotation.x −1.9) + **'arm'** folded inside: 'armBase' (.rotation.y yaw), 'armA' (.rotation.x, 0 = folded flat, −1.3 = up), 'armB' (.rotation.x), 'wristG' → jaws 'jawA'/'jawB' (.position.x ±, open/close) + spot **'gripSpot'**. Drive with fx-chores.js armPose(vac, {...}) / pickSock(). */
export function vacuumPro() {
  const g = grp('vacuumPro'), r = .175;
  const sh = grp('shell'); g.add(sh);
  sh.add(at(lathe([[0, .012], [r - .01, .012], [r, .03], [r, .085], [r - .012, .095], [0, .096]], C.white, 'body', 96), 0, 0, 0));
  sh.add(at(cyl(r - .03, r - .03, .004, C.glossy, 'topPlate', 96), 0, .097, -.01));
  sh.add(at(rbox(.05, .01, .012, .004, C.grey, 'button'), 0, .1, .1));
  const bum = mesh(new THREE.CylinderGeometry(r + .004, r + .004, .05, 96, 1, true, -Math.PI * .42, Math.PI * .84), C.black, 'bumper'); at(bum, 0, .045, 0); g.add(bum);
  const ld = grp('lidar'); at(ld, 0, .099, .07); g.add(ld); ld.add(cyl(.04, .042, .028, C.black, null, 48), at(cyl(.036, .036, .012, C.glossy, 'lidarWindow', 48), 0, .02, 0), at(cyl(.041, .041, .004, C.alu, null, 48), 0, .028, 0));
  g.add(at(rbox(.02, .006, .006, .003, C.led, 'statusLed'), 0, .1, .13));
  const sb = grp('sideBrush'); at(sb, .12, .006, .11); g.add(sb); for (let k = 0; k < 3; k++) sb.add(at(cyl(.002, .002, .07, C.grey, null, 6), Math.cos(k * 2.1) * .035, 0, Math.sin(k * 2.1) * .035, Math.PI / 2, -k * 2.1, 0));
  for (const [n, x] of [['mopL', .07], ['mopR', -.07]]) { const m = grp(n); at(m, x, .006, -.08); g.add(m); m.add(cyl(.07, .07, .01, C.mop, null, 48)); for (let k = 0; k < 8; k++) m.add(at(B(.11, .002, .004, R(0xc3c8cf, 1)), 0, .006, 0, 0, k * .39, 0)); }
  const bin = grp('bin'); at(bin, 0, .05, -.15); g.add(bin); bin.add(rbox(.12, .05, .03, .008, C.black), at(rbox(.1, .036, .004, .004, C.clear, 'binDoor'), 0, 0, -.016));
  // fold-out arm (the twist)
  const hatch = grp('hatch'); at(hatch, 0, .1, -.02); g.add(hatch); hatch.add(at(rbox(.12, .004, .11, .02, C.glossy), 0, 0, -.055));
  const arm = grp('arm'); at(arm, 0, .085, .0); g.add(arm);
  const base = grp('armBase'); arm.add(base); base.add(cyl(.022, .025, .016, C.alu, null, 32));
  const A = grp('armA'); at(A, 0, .01, 0); base.add(A); A.rotation.x = 0;
  A.add(at(rbox(.018, .012, .12, .006, C.white, 'armALink'), 0, 0, -.06)); A.add(at(cyl(.012, .012, .024, C.grey, null, 24), 0, 0, 0, 0, 0, Math.PI / 2));
  const Bn = grp('armB'); at(Bn, 0, 0, -.12); A.add(Bn); Bn.rotation.x = Math.PI;
  Bn.add(at(rbox(.016, .011, .1, .005, C.white, 'armBLink'), 0, 0, -.05)); Bn.add(at(cyl(.011, .011, .022, C.grey, null, 24), 0, 0, 0, 0, 0, Math.PI / 2));
  const W = grp('wristG'); at(W, 0, 0, -.1); Bn.add(W); W.add(rbox(.03, .014, .018, .005, C.black));
  for (const [n, x] of [['jawA', -.008], ['jawB', .008]]) { const j = grp(n); at(j, x, 0, -.009); W.add(j); j.add(at(rbox(.005, .012, .03, .002, C.alu), 0, 0, -.015), at(rbox(.006, .013, .012, .002, C.acc), 0, 0, -.026)); }
  W.add(at(grp('gripSpot'), 0, 0, -.03));
  return g;
}

/** **robots/vacuumDockPro** — self-emptying + mop-washing base (0.42 w × 0.46 h × 0.45 d incl. ramp), front = +z (robot drives in backwards onto 'ramp'). Nodes: 'tower', 'cleanTank'/'dirtyTank' (water levels 'cleanWater'/'dirtyWater' .scale.y),
 * 'dustBag' window + 'dustLevel' (.scale.y), 'washTray' (+ 'brushRoller' spin .x), 'ramp', **'dustPath'** (tube robot bin → bag, userData.path for a dust pulse), 'screen' (small status display, st.screen), spot **'robotSpot'** (put vacuumPro here, rotate π). */
export function vacuumDockPro() {
  const g = grp('vacuumDockPro');
  g.add(at(rbox(.42, .02, .45, .02, C.black, 'ramp'), 0, .01, .1));
  const wt = grp('washTray'); at(wt, 0, .022, .14); g.add(wt); wt.add(rbox(.3, .012, .2, .02, C.grey)); for (let k = 0; k < 2; k++) { const br = grp(k ? 'brushRoller' : 'brushRoller0'); at(br, 0, .01, .1 * (k - .5)); wt.add(br); br.add(at(cyl(.012, .012, .26, C.acc, null, 16), 0, 0, 0, 0, 0, Math.PI / 2)); }
  const tw = grp('tower'); at(tw, 0, 0, -.1); g.add(tw); tw.add(at(rbox(.42, .44, .2, .03, C.white, 'towerBody'), 0, .24, 0), at(rbox(.42, .02, .2, .01, C.black), 0, .465, 0));
  for (const [n, x, wm] of [['cleanTank', -.105, C.water], ['dirtyTank', .105, C.dirty]]) { const tk = grp(n); at(tk, x, .32, .06); tw.add(tk); tk.add(rbox(.19, .22, .1, .02, C.clear)); const w = rbox(.17, .2, .08, .015, wm, n === 'cleanTank' ? 'cleanWater' : 'dirtyWater'); w.geometry.translate(0, .1, 0); at(w, 0, -.1, 0); w.scale.y = n === 'cleanTank' ? .8 : .25; tk.add(w); }
  const bag = grp('dustBag'); at(bag, 0, .12, .1); tw.add(bag); bag.add(rbox(.2, .12, .01, .015, C.clear, 'bagWindow')); const dl = rbox(.18, .1, .006, .01, C.dust, 'dustLevel'); dl.geometry.translate(0, .05, 0); at(dl, 0, -.05, -.004); dl.scale.y = .3; bag.add(dl);
  const sc = mesh(new THREE.PlaneGeometry(.1, .04), R(0x07090c, .2), 'screen'); sc.userData.aspect = 2.5; at(sc, 0, .44, .0); sc.rotation.x = -Math.PI / 2 + .3; sc.position.set(0, .456, -.04); g.add(sc);
  const dp = tube([[0, .06, .1], [0, .08, -.01], [0, .14, -.04], [0, .17, -.02]], .012, C.clear, 'dustPath', 30); dp.userData.path = [0, .06, .1, 0, .17, -.02]; dp.userData.pts = [[0, .06, .1], [0, .08, -.01], [0, .14, -.04], [0, .17, -.02]]; g.add(dp);
  g.add(at(grp('robotSpot'), 0, .022, .13));
  return g;
}

/** **everyday/sock** — single crumpled sock on the floor (~0.24 m), origin = floor contact. Two colours via userData: call with fx (sock.material swap) or use 'sockB' variant. */
function sockMesh(m, name) { const g = grp(name); const pts = [[0, .012, -.09], [0, .014, -.02], [.01, .016, .04], [.04, .015, .085], [.085, .014, .09]];
  const t = tube(pts, .022, m, name + 'Body', 40); t.scale.y = .6; g.add(t); g.add(at(mesh(new THREE.TorusGeometry(.022, .006, 8, 24), m), 0, .012, -.092, 0, 0, 0)); g.add(at(grp('grabSpot'), 0, .02, -.02)); return g; }
export const sock = () => sockMesh(C.sock, 'sock');
export const sockB = () => sockMesh(C.sock2, 'sockB');

/** **everyday/tshirtCrumpled** — crumpled T-shirt to drape over a sofa arm (~0.5 × 0.35 m), origin = centre bottom. */
export function tshirtCrumpled() {
  const g = grp('tshirtCrumpled'); const geo = new THREE.PlaneGeometry(.55, .62, 40, 44); const p = geo.attributes.position, v = new THREE.Vector3();
  const n = (x, y) => Math.sin(x * 23 + y * 7) * .5 + Math.sin(x * 9 - y * 31) * .35 + Math.cos(x * 41 + y * 17) * .2;
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const sleeve = Math.abs(v.x) > .17 && v.y > .1; if (!sleeve && Math.abs(v.x) > .2 && v.y < .1 || (sleeve && v.y < .14) || (Math.abs(v.x) < .07 && v.y > .29)) v.z = -1;   // cut T shape
    else { const fold = Math.sin(v.y * 5) * .06; p.setXYZ(i, v.x * .9, fold + .04 + .02 * n(v.x, v.y), v.y * .75); continue; } p.setXYZ(i, 0, -9, 0); }
  geo.computeVertexNormals(); const m = mesh(geo, Object.assign(C.shirt.clone(), {side: THREE.DoubleSide}), 'shirt'); g.add(m);
  // remove cut-away triangles (moved to y −9)
  const idx = geo.index.array, keep = []; for (let i = 0; i < idx.length; i += 3) { if ([0, 1, 2].every(k => p.getY(idx[i + k]) > -1)) keep.push(idx[i], idx[i + 1], idx[i + 2]); } geo.setIndex(keep);
  return g;
}

/** **home/dishwasherOpen** — built-in dishwasher, door open (0.6 × 0.82 m), front = +z, door folded down. Racks pulled half out with dirty plates/cups/cutlery. Nodes: 'door' (.rotation.x 0 = open flat, −π/2 closed), 'rackLow' / 'rackTop' (.position.z slide), 'dishes', 'tub'. */
export function dishwasherOpen() {
  const g = grp('dishwasherOpen');
  g.add(at(rbox(.6, .82, .58, .01, C.steel, 'tub'), 0, .41, -.29)); g.add(B(.54, .74, .02, R(0x9fa3a8, .35, .7), 0, .41, -.02));   // inner back look
  const door = grp('door'); at(door, 0, .1, .0); g.add(door); door.add(at(rbox(.6, .02, .72, .01, C.steel, 'doorPanel'), 0, 0, .36), at(rbox(.52, .012, .64, .01, R(0xa7abb0, .35, .7)), 0, .016, .36));
  const rack = (name, y, z) => { const r = grp(name); at(r, 0, y, z); g.add(r); for (let i = 0; i <= 10; i++) r.add(B(.004, .004, .5, C.grey, -.25 + i * .05, 0, -.25)); for (let i = 0; i <= 10; i++) r.add(B(.5, .004, .004, C.grey, 0, 0, -.5 + i * .05)); for (const x of [-.25, .25]) r.add(B(.004, .09, .5, C.grey, x, .045, -.25)); return r; };
  const lo = rack('rackLow', .14, .24), hi = rack('rackTop', .5, .02);
  const dishes = grp('dishes'); g.add(dishes);
  for (let i = 0; i < 7; i++) { const pl = grp(); at(pl, -.2 + i * .065, .27, .0, 0, 0, 0); lo.add(pl); pl.add(at(cyl(.11, .1, .012, C.ceramic, null, 40), 0, 0, -.2, Math.PI / 2 - .12, 0, 0)); if (i % 2) pl.add(at(cyl(.05, .05, .002, C.food, null, 20), 0, .02, -.193, Math.PI / 2 - .12, 0, 0)); }
  for (let i = 0; i < 5; i++) hi.add(at(lathe([[0, 0], [.035, 0], [.04, .09], [.036, .09], [.031, .006], [0, .006]], C.ceramic, null, 28), -.18 + i * .09, .1, -.25, Math.PI, 0, 0));
  return g;
}

/** **home/panSkillet** — frying pan (Ø 0.28 m + handle), origin = bottom centre; put on kitchenLiving 'cooktop' (cold, nothing cooking). */
export function panSkillet() { const g = grp('panSkillet'); g.add(lathe([[0, 0], [.13, 0], [.14, .045], [.135, .048], [.125, .006], [0, .006]], C.pan, 'pan', 64)); g.add(at(rbox(.18, .018, .03, .008, C.black, 'handle'), .23, .035, 0, 0, 0, .12)); return g; }

/** **people/mannequin-teleop** — remote operator (grey silhouette): standing, both hands forward holding two small controllers, over-ear 'headset' with a visor (the human behind "humanoids already try, but not alone yet"). Joints like people/* mannequins. */
export function mannequinTeleop() { const g = mannequin('stand'); g.name = 'mannequinTeleop'; g.getObjectByName('phone').visible = false;
  const P = (n, x, y = 0, z = 0) => g.getObjectByName(n).rotation.set(x, y, z);
  P('shoulderL', -.9, 0, .15); P('elbowL', -.8); P('shoulderR', -.9, 0, -.15); P('elbowR', -.8); P('head', .1);
  const hd = g.getObjectByName('head'); const hs = grp('headset'); at(hs, 0, .12, 0); hd.add(hs);
  hs.add(at(mesh(new THREE.TorusGeometry(.115, .012, 8, 40, Math.PI), C.black), 0, 0, 0, 0, Math.PI / 2, 0)); for (const s of [-1, 1]) hs.add(at(cyl(.045, .045, .03, C.black, null, 24), s * .11, -.02, 0, 0, 0, Math.PI / 2));
  hs.add(at(rbox(.17, .06, .06, .02, C.glossy, 'visor'), 0, 0, .1)); hs.add(at(rbox(.12, .006, .004, .002, C.acc), 0, -.01, .132));
  for (const k of ['L', 'R']) { const h = g.getObjectByName('hand' + k); h.add(at(rbox(.05, .03, .1, .012, C.black, 'controller' + k), 0, -.02, .03)); }
  return g; }

export const KITCHORES = { 'robots/vacuumPro': vacuumPro, 'robots/vacuumDockPro': vacuumDockPro, 'everyday/sock': sock, 'everyday/sockB': sockB, 'everyday/tshirtCrumpled': tshirtCrumpled,
  'home/dishwasherOpen': dishwasherOpen, 'home/panSkillet': panSkillet, 'people/mannequin-teleop': mannequinTeleop };
