// Media pro 2026-11-28 run 21 — chip fab + apartment entrance kit (news inbox 27–28.11: Samsung fab robots, Yandex rover → humanoid hand-off; library 'wanted': Israeli shikun block).
// Generic, no brand/logo, our own work → CC0. Real metres, y-up, front = +z. REAL colours (userData.real) → pro-v3 keeps them. No glow.
// Export: python3 tools/make_props.py fab/   and   python3 tools/make_props.py aptEntrance
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {industrialArmPro} from './kit-pro.js';
const R = (color, rough = .6, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
const M = { white: R(0xeef0f2, .4), panel: R(0xe2e5e8, .5), seam: R(0xb8bdc3, .6), floor: R(0xd9dde1, .35, .1), floorD: R(0xa9afb6, .5, .2), steel: R(0xc5cad0, .28, .85),
  dark: R(0x22252b, .45, .4), black: R(0x121316, .5, .2), rubber: R(0x0e0f11, .9), glass: R(0xbfd3dc, .04, .1, {transparent: true, opacity: .2, depthWrite: false}),
  poly: R(0x9fb0bd, .12, 0, {transparent: true, opacity: .42, depthWrite: false}), polyFrame: R(0xd6dade, .45), waferBack: R(0xb9bcc2, .25, .35),
  ffu: R(0xf7f7f2, .5, 0, {emissive: 0xf7f7f2, emissiveIntensity: .45}), acc: R(0x8ea6ff, .5), accDeep: R(0x4f6fe0, .5),
  lampG: R(0x3f9a5c, .5), lampA: R(0xd99a2b, .5), lampR: R(0xb53b30, .5), yellowF: R(0xe8d9a0, .6),
  plaster: R(0xddd4c3, .9), plasterD: R(0xbdb3a1, .9), winGlass: R(0x34404b, .12, .4), stone: R(0xd8ccb4, .8), stoneD: R(0xb9ab90, .8), alu: R(0xbfc4ca, .3, .85), terr: R(0xcfc6b8, .5),
  mail: R(0x8a9096, .45, .6), green: R(0x55704a, .75), pot: R(0x6d6a66, .8), asph: R(0x45484d, .9), pave: R(0xbdb6aa, .85), wood: R(0x8a6a4a, .6) };
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...k) => { const g = new THREE.Group(); if (name) g.name = name; k.forEach(c => g.add(c)); return g; };
const RB = (w, h, d, r, m, x, y, z, name) => at(mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name), x, y, z);
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);
const cyl = (rt, rb, h, m, name, seg = 32) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const spot = (name, x, y, z, ry = 0) => at(grp(name), x, y, z, 0, ry, 0);
const screen = (w, h, name, aspect) => { const s = mesh(new THREE.PlaneGeometry(w, h), M.black, name); s.userData.aspect = aspect || w / h; s.castShadow = false; return s; };

// die-grid texture for the wafer face (generic, no layout of a real chip)
let WTEX = null;
function waferTex() {
  if (WTEX) return WTEX; const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#7d8590'; x.fillRect(0, 0, 512, 512);
  const n = 22, s = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const cx = (i + .5) * s - 256, cy = (j + .5) * s - 256; if (Math.hypot(cx, cy) > 238) continue;
    const hue = 210 + 50 * Math.sin(i * .35 + j * .2), l = 46 + 8 * Math.cos(i * .5 - j * .3);
    x.fillStyle = `hsl(${hue},28%,${l}%)`; x.fillRect(i * s + 1.2, j * s + 1.2, s - 2.4, s - 2.4);
    x.fillStyle = `hsla(${hue + 30},35%,${l + 14}%,.55)`; x.fillRect(i * s + 4, j * s + 4, s * .45, s * .3); }
  WTEX = new THREE.CanvasTexture(c); WTEX.colorSpace = THREE.SRGBColorSpace; return WTEX;
}

/** fab/wafer — 300 mm silicon wafer (Ø .30 m, drawn 2 mm thick so it reads). Nodes: 'face' (die grid, top), 'back' (mirror silicon), 'notch'. Hold it vertically for hero shots (rotation.x −π/2). */
export function wafer() {
  const g = grp('wafer');
  const fm = R(0xffffff, .3, .12, {map: waferTex()});
  const face = mesh(new THREE.CircleGeometry(.15, 96), fm, 'face'); at(face, 0, .0011, 0, -Math.PI / 2); g.add(face);
  g.add(at(cyl(.15, .15, .002, M.waferBack, 'back', 96), 0, 0, 0));
  g.add(B(.006, .003, .004, M.dark, 0, 0, .1485, 'notch'));
  return g;
}

/** fab/foup — front-opening wafer pod (.40 × .34 × .33 m, door = +z). Nodes: 'shell' (see-through grey polycarbonate), 'frame', 'topFlange' (robot/OHT handle) + spot 'grip',
 * 'handleL/R', **'door'** (opaque, open = .position.z +.25 or hide), 'wafers' wafer0..12 (thin discs), 'coupling' (bottom plate), spot 'bottom'. */
export function foup() {
  const g = grp('foup'), W = .4, H = .33, D = .34;
  g.add(RB(W, .025, D, .01, M.polyFrame, 0, .0125, 0, 'coupling'));
  g.add(RB(W, H - .03, D - .02, .05, M.poly, 0, .03 + (H - .03) / 2, -.01, 'shell'));
  const fr = grp('frame'); g.add(fr); fr.add(B(W + .01, .03, .02, M.polyFrame, 0, .04, D / 2 - .01), B(W + .01, .03, .02, M.polyFrame, 0, H - .01, D / 2 - .01),
    B(.03, H - .03, .02, M.polyFrame, -W / 2, .03 + (H - .03) / 2, D / 2 - .01), B(.03, H - .03, .02, M.polyFrame, W / 2, .03 + (H - .03) / 2, D / 2 - .01));
  const fl = grp('topFlange'); at(fl, 0, H, -.01); g.add(fl); fl.add(at(cyl(.03, .03, .04, M.polyFrame), 0, .02, 0), RB(.2, .015, .16, .02, M.polyFrame, 0, .047, 0), spot('grip', 0, .055, 0));
  for (const s of [-1, 1]) g.add(RB(.02, .05, .16, .01, M.polyFrame, s * (W / 2 + .012), .2, -.02, s < 0 ? 'handleL' : 'handleR'));
  const ws = grp('wafers'); g.add(ws); for (let i = 0; i < 13; i++) { const w = cyl(.148, .148, .0015, M.waferBack, 'wafer' + i, 64); at(w, 0, .06 + i * .018, -.015); w.castShadow = false; ws.add(w); }
  const dr = grp('door'); at(dr, 0, .035, D / 2 + .005); g.add(dr); dr.add(RB(W - .02, H - .05, .03, .015, M.polyFrame, 0, (H - .05) / 2, 0), B(.05, .05, .006, M.seam, -.11, (H - .05) / 2, .017), B(.05, .05, .006, M.seam, .11, (H - .05) / 2, .017));
  g.add(spot('bottom', 0, 0, 0));
  return g;
}

/** fab/processTool — generic wafer process tool (3.0 w × 2.5 h × 2.4 d, front = +z). Nodes: 'body' (white cabinet + seams), **'efem'** front module with 'efemWindow' (glass),
 * **'loadPort0..2'** (shelf at 0.9 m; each 'portDoor{i}' drops .position.y −.3, spot 'foupSpot{i}' = where a fab/foup sits, facing the tool), 'toolScreen' (st.screen aspect 1.33, on an arm),
 * 'lightTower' (lampG/lampA/lampR matte — no glow; scale up one to "light" it), **'servicePanel'** (right side door, hinge at the front edge: open .rotation.y +1.4) with 'serviceInside' (chamber, pipes), spots 'robotSpot' (in front), 'serviceSpot' (right side). */
export function processTool() {
  const g = grp('processTool'), W = 3, H = 2.5, D = 2.4;
  const b = grp('body'); g.add(b); b.add(RB(W, H, D - .5, .03, M.white, 0, H / 2, -.25, 'cabinet'));
  for (const x of [-.75, .75]) b.add(B(.01, H - .1, .005, M.seam, x, H / 2, D / 2 - .5 + .003));
  b.add(B(W - .2, .25, .02, M.panel, 0, H - .2, D / 2 - .5 + .01, 'vents')); for (let i = 0; i < 12; i++) b.add(B(.18, .012, .01, M.seam, -1.2 + i * .22, H - .2, D / 2 - .5 + .022));
  const e = grp('efem'); at(e, 0, 0, D / 2 - .25); g.add(e);
  e.add(RB(W, 1.9, .5, .02, M.panel, 0, .95 + .6, 0, 'efemBox')); e.add(B(W - .4, .5, .01, M.glass, 0, 2.0, .255, 'efemWindow'));
  e.add(B(W, .6, .5, M.white, 0, .3, 0, 'efemBase'));
  for (let i = 0; i < 3; i++) { const x = -1 + i; const lp = grp('loadPort' + i); at(lp, x, 0, .25); e.add(lp);
    lp.add(B(.5, .04, .45, M.steel, 0, .88, .2, 'shelf' + i), B(.46, .45, .02, M.dark, 0, 1.15, .005, 'portDoor' + i), B(.08, .03, .02, M.acc, .18, .8, .42, 'portLed' + i));
    for (const [px, pz] of [[-.12, .12], [.12, .12], [0, .32]]) lp.add(at(cyl(.012, .012, .015, M.steel, null, 12), px, .907, pz));
    lp.add(spot('foupSpot' + i, 0, .9, .21, Math.PI)); }
  const arm = grp('screenArm'); at(arm, 1.75, 1.45, .2); g.add(arm); arm.add(B(.04, .04, .4, M.steel, 0, 0, 0), at(B(.04, .5, .04, M.steel, 0, .25, .2)));
  const sc = grp('monitor'); at(sc, 0, .55, .25, -.15, -.35, 0); arm.add(sc); sc.add(RB(.46, .36, .04, .01, M.dark, 0, 0, 0)); sc.add(at(screen(.42, .315, 'toolScreen', 1.33), 0, 0, .021));
  const lt = grp('lightTower'); at(lt, -W / 2 + .15, H, .2); g.add(lt); lt.add(at(cyl(.015, .015, .15, M.steel, null, 12), 0, .075, 0));
  [['lampG', M.lampG], ['lampA', M.lampA], ['lampR', M.lampR]].forEach(([n, m], i) => lt.add(at(cyl(.035, .035, .07, m, n, 24), 0, .19 + i * .072, 0)));
  // right service door + inside
  const si = grp('serviceInside'); at(si, W / 2 - .35, 0, -.25); g.add(si); si.add(B(.3, 1.4, 1.4, M.dark, -.05, 1.0, 0, 'chamber'));
  for (let i = 0; i < 4; i++) si.add(at(cyl(.025, .025, 1.3, M.steel, 'pipe' + i, 16), .14, 1.0, -.5 + i * .3));
  si.add(at(cyl(.22, .22, .12, M.steel, 'chamberLid', 40), .12, 1.4, 0, 0, 0, Math.PI / 2));
  const sp = grp('servicePanel'); at(sp, W / 2 + .005, 0, D / 2 - .5); g.add(sp); sp.add(B(.02, 1.9, 1.5, M.white, 0, 1.15, -.75, 'panelSkin'), B(.03, .25, .04, M.steel, .02, 1.2, -1.35, 'panelHandle'));
  g.add(spot('robotSpot', 0, 0, D / 2 + 1.0, Math.PI), spot('serviceSpot', W / 2 + 1.0, 0, -.4, -Math.PI / 2));
  return g;
}

/** fab/cleanroomBay — clean-room fab bay (18 × 11 m, 4.6 m high, open front = +z). Nodes: 'floor' (raised perforated tiles), 'walls' (white panels with seams), **'ffu'** ceiling filter grid (soft white, matte),
 * **'ohtRail'** overhead track along x at y 4.1 over the tool row + **'oht'** carriage (.position.x moves; 'ohtHoist' lowers .position.y; 'ohtFoupSpot' under it), **'stocker'** (left wall FOUP storage, shelf0..3 with 'foupBox' pods),
 * 'yellowBay' (back-right lithography corridor with yellow-filtered light panels — real fabs light litho in yellow), spots toolSpot0..2 (back row, tools face +z), aisleSpot, camSpot, robotStart. */
export function cleanroomBay() {
  const g = grp('cleanroomBay'), W = 18, D = 11, H = 4.6;
  const tc = document.createElement('canvas'); tc.width = tc.height = 128; const x = tc.getContext('2d'); x.fillStyle = '#d9dde1'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#c3c8cd';
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.beginPath(); x.arc(8 + i * 16, 8 + j * 16, 3.2, 0, 7); x.fill(); } x.strokeStyle = '#a9afb6'; x.lineWidth = 2; x.strokeRect(1, 1, 126, 126);
  const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace; tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(W / .6, D / .6);
  g.add(B(W, .1, D, R(0xffffff, .4, .1, {map: tt}), 0, -.045, 0, 'floor'));   // top at y .005 (above the studio floor)
  const wl = grp('walls'); g.add(wl); wl.add(B(W, H, .1, M.panel, 0, H / 2, -D / 2, 'wallBack'), B(.1, H, D, M.panel, -W / 2, H / 2, 0, 'wallL'), B(.1, H, D, M.panel, W / 2, H / 2, 0, 'wallR'));
  for (let xx = -W / 2 + 1.2; xx < W / 2; xx += 1.2) wl.add(B(.01, H, .005, M.seam, xx, H / 2, -D / 2 + .055));
  wl.add(B(W, .1, .02, M.seam, 0, .1, -D / 2 + .06));
  const f = grp('ffu'); g.add(f); f.add(B(W, .06, D, M.white, 0, H + .03, 0, 'ceiling'));
  for (let i = 0; i < 12; i++) for (let j = 0; j < 7; j++) if ((i + j) % 2 === 0) f.add(B(1.1, .02, 1.1, M.ffu, -W / 2 + .75 + i * 1.5, H - .01, -D / 2 + .8 + j * 1.5));
  for (let i = 0; i <= 12; i++) f.add(B(.05, .05, D, M.steel, -W / 2 + i * 1.5, H - .03, 0));
  // OHT rail + carriage (over the tool row's load ports: tools at z −3.3, ports ≈ z −3.3+1.2+.46 = −1.64)
  const rz = -1.64, rail = grp('ohtRail'); g.add(rail); rail.add(B(W - 1, .1, .16, M.steel, 0, 4.15, rz, 'track'));
  for (let xx = -W / 2 + 1; xx < W / 2; xx += 3) rail.add(B(.05, H - 4.2, .05, M.steel, xx, 4.2 + (H - 4.2) / 2, rz));
  const oht = grp('oht'); at(oht, -2, 0, rz); g.add(oht); oht.add(RB(.7, .35, .55, .04, M.white, 0, 3.92, 0, 'ohtBody'), B(.5, .04, .4, M.acc, 0, 3.73, .28));
  const ho = grp('ohtHoist'); at(ho, 0, 3.7, 0); oht.add(ho); ho.add(RB(.24, .05, .2, .01, M.dark, 0, -.03, 0, 'hoistGripper')); ho.add(spot('ohtFoupSpot', 0, -.42, 0));
  for (const s of [-1, 1]) ho.add(at(cyl(.003, .003, .5, M.black, 'belt' + (s < 0 ? 'L' : 'R'), 6), s * .08, .2, 0));
  // stocker (left)
  const stc = grp('stocker'); at(stc, -W / 2 + .7, 0, -1); g.add(stc); stc.add(B(1.2, 3.6, 5, M.white, -.05, 1.8, 0, 'stockerBox'), B(.02, 3.0, 4.4, M.glass, .56, 1.9, 0, 'stockerGlass'));
  for (let r = 0; r < 4; r++) { const sh = grp('shelf' + r); stc.add(sh); sh.add(B(.9, .03, 4.4, M.steel, 0, .6 + r * .8, 0));
    for (let k = 0; k < 9; k++) sh.add(B(.34, .3, .38, M.poly, .05, .78 + r * .8, -2 + k * .5, 'foupBox')); }
  // yellow litho corridor (back right)
  const yb = grp('yellowBay'); at(yb, 6.4, 0, -D / 2 + .07); g.add(yb); for (let i = 0; i < 3; i++) yb.add(B(1.2, 2.4, .02, M.yellowF, -1.4 + i * 1.4, 1.6, 0, 'yellowPanel' + i));
  for (let i = 0; i < 3; i++) g.add(spot('toolSpot' + i, -4.2 + i * 3.6, 0, -3.3));
  g.add(spot('aisleSpot', 0, 0, .6), spot('robotStart', -6, 0, 1.4, Math.PI / 2), spot('camSpot', 0, 1.7, 6.5));
  return g;
}

/** fab/mobileManipulator — fab AMR (1.1 × .75 m) with a 6-axis arm and a FOUP nest (for "robots swap parts / move wafer pods / service tools").
 * Nodes: 'base' ('lidarF/B' dark glass, 'statusBar' light blue, 'bumper', wheelL/R), **'foupNest'** + spot 'deckSpot' (put a fab/foup here), 'mast' + 'armMount' → 'industrialArm' (j1..j6, 'tool' fingerA/B, scale .62),
 * 'spareBin' (consumables tray, part0..2 = spare rings/filters). Default arm pose = reaching forward at load-port height (j2/j3/j5 .rotation.x to animate). */
export function mobileManipulator({pose = [0, .55, 1.05, 0, 1.0, 0]} = {}) {
  const g = grp('mobileManipulator'), base = grp('base'); g.add(base);
  base.add(RB(1.1, .38, .75, .05, M.white, 0, .25, 0, 'chassis'), RB(1.12, .07, .77, .03, M.dark, 0, .07, 0, 'skirt'), B(1.08, .004, .73, M.seam, 0, .44, 0));
  for (const z of [-1, 1]) { base.add(RB(.45, .05, .012, .006, M.black, 0, .2, z * .377, z > 0 ? 'lidarF' : 'lidarB'), RB(.8, .012, .006, .003, M.acc, 0, .34, z * .378, z > 0 ? 'statusBar' : 'statusBarB')); }
  base.add(RB(1.12, .05, .08, .02, M.rubber, 0, .08, .36, 'bumper'));
  for (const s of [-1, 1]) { const w = grp(s < 0 ? 'wheelL' : 'wheelR'); at(w, s * .4, .07, 0); base.add(w); w.add(at(cyl(.07, .07, .05, M.rubber, null, 28), 0, 0, 0, 0, 0, Math.PI / 2)); }
  const nest = grp('foupNest'); at(nest, .22, .44, -.12); g.add(nest); nest.add(B(.46, .02, .4, M.steel, 0, .01, 0)); for (const [px, pz] of [[-.12, -.1], [.12, -.1], [0, .12]]) nest.add(at(cyl(.012, .012, .02, M.steel, null, 12), px, .03, pz));
  nest.add(spot('deckSpot', 0, .02, 0));
  const bin = grp('spareBin'); at(bin, .22, .44, .25); g.add(bin); bin.add(B(.42, .06, .18, M.dark, 0, .03, 0)); for (let i = 0; i < 3; i++) bin.add(at(mesh(new THREE.TorusGeometry(.045, .012, 10, 28), M.steel, 'part' + i), -.13 + i * .13, .075, 0, Math.PI / 2));
  const mast = grp('mast'); at(mast, -.3, .44, 0); g.add(mast); mast.add(RB(.3, .35, .3, .03, M.panel, 0, .175, 0, 'mastBox'));
  const mount = grp('armMount'); at(mount, 0, .35, 0); mast.add(mount); const arm = industrialArmPro({pose}); arm.scale.setScalar(.62); mount.add(arm);
  return g;
}

/** buildings/aptEntrance — Israeli residential block (shikun-style, 4 floors on pilotis), entrance side = +z. 14 m wide, ground floor open (pillars) with the lobby box in the middle.
 * Nodes: 'facade' (plaster floors 1–4 with window bands, 'shutter{i}' boxes, balconies + rails, AC units, roof 'solarHeaters'), 'pilotis' (pillars), **'lobby'** (stone-clad box, glass front),
 * **'door'** (glass + alu, hinge on the left: open .rotation.y −1.3) + 'doorHandle', **'intercom'** → 'intercomScreen' (st.screen aspect .7), 'mailboxes' (box0..11 inside the lobby), 'numberSign' (blank plate, st.screen aspect 1.4),
 * 'steps' + 'ramp', 'path' (paved walk to the sidewalk), 'sidewalk', 'road', planters, 'bench'. Spots: **roverSpot** (sidewalk end of the path, rover hands over here), **handoffSpot** (at the door, outside), doorSpot, lobbySpot (inside), mailSpot, eyeSpot, wideSpot. */
export function aptEntrance() {
  const g = grp('aptEntrance'), W = 14, FD = 10, FH = 2.9, NF = 4, P = 2.6;
  g.add(B(W + 12, .05, 6, M.asph, 0, -.2, 10.5, 'road'), B(W + 12, .18, 3, M.pave, 0, -.09, 6, 'sidewalk'));
  g.add(B(W + 12, .2, .18, M.plasterD, 0, -.1, 7.5, 'kerb'));
  g.add(B(1.8, .04, 4.2, M.pave, 0, .02, 3.1, 'path'));
  for (const s of [-1, 1]) { g.add(B(5.4, .5, .9, M.stoneD, s * 3.9, .25, 4.8, 'planterWall' + (s < 0 ? 'L' : 'R'))); for (let k = 0; k < 4; k++) { const b = mesh(new THREE.SphereGeometry(.45, 14, 10), M.green); b.scale.y = .7; at(b, s * (2 + k * 1.3), .75, 4.8); g.add(b); } }
  const pil = grp('pilotis'); g.add(pil); for (const xx of [-6.5, -3.3, 3.3, 6.5]) for (const zz of [-4.5, .6]) pil.add(B(.4, P, .4, M.plaster, xx, P / 2, zz));
  g.add(B(W, .25, FD, M.plasterD, 0, P + .125, -2, 'slab'));
  const f = grp('facade'); g.add(f); const z0 = 1.0;
  for (let i = 0; i < NF; i++) { const y = P + .25 + i * FH; f.add(B(W, FH, FD - 1, M.plaster, 0, y + FH / 2, z0 - 1 - (FD - 1) / 2));   // front face at z0 − 1
    f.add(B(W + .1, .12, .3, M.plasterD, 0, y + .06, z0 - .45));
    for (let k = 0; k < 6; k++) { const xx = -5.6 + k * 2.24; f.add(B(1.3, 1.25, .04, M.winGlass, xx, y + 1.45, z0 - .99), B(1.36, 1.31, .02, M.alu, xx, y + 1.45, z0 - .995), B(1.38, .2, .22, M.plasterD, xx, y + 2.2, z0 - .9, 'shutter' + (i * 6 + k)), B(1.4, .06, .14, M.plasterD, xx, y + .8, z0 - .93)); }
    for (const xx of [-4.5, 4.5]) { f.add(B(3.2, .14, 1.2, M.plasterD, xx, y + .07, z0 - .4, 'balcony')); f.add(B(3.2, .95, .03, M.plaster, xx, y + .6, z0 + .18)); f.add(B(3.2, .04, .05, M.alu, xx, y + 1.1, z0 + .18)); }
    f.add(RB(.8, .55, .3, .03, M.white, 2.3, y + .5, z0 - .82, 'acUnit' + i)); }
  const roofY = P + .25 + NF * FH; const sh = grp('solarHeaters'); g.add(sh);
  for (let k = 0; k < 5; k++) { const xx = -5 + k * 2.5; sh.add(at(B(1, .05, 2, M.dark, xx, roofY + .7, -3, 'collector' + k), xx, roofY + .7, -3, .7, 0, 0), at(cyl(.25, .25, 1.4, M.white, 'tank' + k, 20), xx, roofY + .9, -4.2, 0, 0, Math.PI / 2)); }
  // lobby box (stone clad) under the slab, glass front at z .6
  const lb = grp('lobby'); g.add(lb); lb.add(B(4.6, P, .2, M.stone, 0, P / 2, -4.6, 'lobbyBack'), B(.2, P, 5.2, M.stone, -2.3, P / 2, -2, 'lobbyL'), B(.2, P, 5.2, M.stone, 2.3, P / 2, -2, 'lobbyR'));
  for (let r = 0; r < 6; r++) lb.add(B(.21, .01, 5.2, M.stoneD, -2.3, .4 + r * .4, -2), B(.21, .01, 5.2, M.stoneD, 2.3, .4 + r * .4, -2));
  lb.add(B(4.4, .02, 5, M.terr, 0, .21, -2, 'lobbyFloor'), B(1.5, P - .3, .03, M.glass, -1.45, P / 2 + .1, .6, 'sideGlassL'), B(1.5, P - .3, .03, M.glass, 1.45, P / 2 + .1, .6, 'sideGlassR'), B(4.6, .3, .2, M.alu, 0, P - .15, .6, 'transom'));
  const dr = grp('door'); at(dr, -.7, .2, .62); lb.add(dr); dr.add(B(1.4, 2.1, .04, M.glass, .7, 1.05, 0, 'doorGlass'));
  for (const [w, h, x2, y2] of [[1.4, .06, .7, .03], [1.4, .06, .7, 2.07], [.06, 2.1, .03, 1.05], [.06, 2.1, 1.37, 1.05]]) dr.add(B(w, h, .06, M.alu, x2, y2, 0)); dr.add(B(.03, .5, .05, M.steel, 1.22, 1.05, .05, 'doorHandle'));
  const ic = grp('intercom'); at(ic, 1.45, 1.35, .64); lb.add(ic); ic.add(RB(.18, .3, .03, .01, M.steel, 0, 0, 0)); ic.add(at(screen(.1, .13, 'intercomScreen', .77), 0, .05, .016)); for (let k = 0; k < 6; k++) ic.add(at(cyl(.008, .008, .006, M.dark, null, 12), -.04 + (k % 2) * .08, -.05 - Math.floor(k / 2) * .035, .017, Math.PI / 2));
  const mb = grp('mailboxes'); at(mb, 2.19, .9, -2.3); lb.add(mb); for (let i = 0; i < 12; i++) mb.add(B(.04, .3, .42, M.mail, 0, (i % 4) * .32, -.9 + Math.floor(i / 4) * .45, 'box' + i));
  const ns = grp('numberSign'); at(ns, -1.45, 2.25, .66); lb.add(ns); ns.add(B(.5, .36, .02, M.white, 0, 0, 0)); ns.add(at(screen(.46, .33, 'numberScreen', 1.4), 0, 0, .011));
  // steps + ramp (entrance is 0.2 m up)
  g.add(B(1.8, .1, .35, M.stoneD, 0, .05, 1.35, 'steps'), B(1.8, .2, .35, M.stoneD, 0, .1, 1.0), B(4.6, .2, 1.2, M.stone, 0, .1, .2, 'landing'));
  const rp = B(1.1, .04, 2.2, M.stoneD, 2.6, .1, 1.3, 'ramp'); rp.rotation.x = .09; g.add(rp);
  const bn = grp('bench'); at(bn, -4.5, 0, 2.2); g.add(bn); bn.add(B(1.8, .06, .45, M.wood, 0, .45, 0), B(.08, .45, .4, M.dark, -.8, .22, 0), B(.08, .45, .4, M.dark, .8, .22, 0));
  g.add(spot('roverSpot', 0, -.0, 5.3, Math.PI), spot('handoffSpot', 0, .2, 1.0, Math.PI), spot('doorSpot', 0, .2, .62), spot('lobbySpot', 0, .22, -2, Math.PI), spot('mailSpot', 1.9, .22, -2.3, Math.PI / 2),
    spot('eyeSpot', 2.2, 1.5, 6.4), spot('wideSpot', 7, 6, 18));
  return g;
}

export const KITFAB = { 'fab/wafer': wafer, 'fab/foup': foup, 'fab/processTool': processTool, 'fab/cleanroomBay': cleanroomBay, 'fab/mobileManipulator': () => mobileManipulator(), 'buildings/aptEntrance': aptEntrance };
