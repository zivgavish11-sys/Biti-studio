// Car cabin + night highway kit (Media pro 2026-11-25 run 16, for ep024-drowsy — pro-v3 test #2, night, frame0 eye level).
// Generic compact sedan (no brand, no logo), our own work → CC0. Real metres, y-up. REAL colours built in (userData.real → look-pro keeps them).
// Brand: light blue #8ea6ff = signal (angle sensor, wire), deep blue #4f6fe0 = force. No glow (lamps are lit surfaces, no bloom).
// Export: python3 tools/make_props.py car/   (+ road/nightHighway, people/mannequin-driver)
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mannequin} from './kit.js';

const R = (color, rough = .8, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
const LIT = (color, i = 1.2) => R(color, .5, 0, {emissive: color, emissiveIntensity: i});
export const CMAT = {
  paint: R(0x3d444c, .28, .6), paintDark: R(0x2b3036, .45, .3), trim: R(0x15171a, .6), chrome: R(0xc9ced4, .18, .95), tyre: R(0x101113, .92), rim: R(0x9aa1a8, .3, .85),
  glass: R(0x0e1418, .04, .1, {transparent: true, opacity: .22, depthWrite: false, side: THREE.DoubleSide}),
  glassTint: R(0x0a0f12, .05, .1, {transparent: true, opacity: .55, depthWrite: false, side: THREE.DoubleSide}),
  dash: R(0x1d1f23, .75), dashSoft: R(0x2a2c31, .85), dashTrim: R(0x4a4d53, .35, .6), carpet: R(0x17181b, 1), seat: R(0x2c2e33, .9), seatStitch: R(0x3d4046, .9),
  head: R(0x3a3a3c, .95), plastic: R(0x26282c, .6), wheelRim: R(0x1a1b1e, .55), leather: R(0x222326, .7),
  ghost: R(0x2c3036, .5, .2), metal: R(0x8d949c, .35, .8), pcb: R(0x1f4d3a, .6), copper: R(0xb87333, .32, .85), wireGrey: R(0x2a2d31, .6),
  acc: R(0x8ea6ff, .5), force: R(0x4f6fe0, .5), screenOff: R(0x07090b, .25, .2),
  headLamp: LIT(0xf4f2ea, 1.6), tailLamp: LIT(0xb0141b, 1.4), amber: LIT(0xd98a1c, .2),
  // road
  asphalt: R(0x1f2125, .93), asphalt2: R(0x24262a, .95), shoulder: R(0x2b2c2e, .95), paint1: R(0xe8e6df, .6), concrete: R(0x8a8a86, .9), concrete2: R(0x6f706d, .9),
  steel: R(0x9ca3aa, .35, .85), dirt: R(0x15130f, 1), grass: R(0x161a12, 1), lamp: LIT(0xffe9c4, 2.2), far: LIT(0xffd9a0, 2.0), farW: LIT(0xe8eeff, 1.6), farR: LIT(0xc01820, 1.6),
  sign: R(0x0f5a34, .6), signW: R(0xe8eee9, .5),
};
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...kids) => { const g = new THREE.Group(); if (name) g.name = name; kids.forEach(k => g.add(k)); return g; };
const B = (w, h, d, m, x, y, z, name) => at(mesh(new THREE.BoxGeometry(w, h, d), m, name), x, y, z);
const rbox = (w, h, d, r, m, name) => mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name);
const RB = (w, h, d, r, m, x, y, z, name) => at(rbox(w, h, d, r, m, name), x, y, z);
const cyl = (rt, rb, h, m, name, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
const spot = (name, x, y, z) => at(grp(name), x, y, z);
const tube = (pts, r, m, name, seg = 64) => { const v = pts.map(p => new THREE.Vector3(...p)); const o = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v, false, 'centripetal'), seg, r, 8), m, name); o.userData.path = pts.flat(); return o; };
/** quad from 4 corners (counter-clockwise seen from the front) */
const quad = (a, b, c, d, m, name) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2)); g.computeVertexNormals(); const o = mesh(g, m, name); o.castShadow = false; return o; };
/** side-window polygon in the plane x = xx (z,y points) */
export const sidePoly = (xx, pts, m, name) => { const s = new THREE.Shape(); pts.forEach(([z, y], i) => i ? s.lineTo(z, y) : s.moveTo(z, y)); const g = new THREE.ShapeGeometry(s); g.rotateY(-Math.PI / 2); g.translate(xx, 0, 0); const o = mesh(g, m, name); o.castShadow = false; return o; };
const rng = seed => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };

// ---------- the car ----------
// car frame: faces +z, origin on the ground between the axles, driver on the LEFT (Israel) = +x. Wheelbase 2.7 (axles z ±1.35), length 4.5, width 1.8, roof 1.46.
const ARCH = [[1.35, .37], [-1.35, .37]], WR = .32;
const bottomY = z => { for (const [c, r] of ARCH) { const d = Math.abs(z - c); if (d < r) return .33 + Math.sqrt(r * r - d * d); } return .3; };
const topY = z => z > 2.05 ? .6 + .2 * Math.cos(Math.min(1, (z - 2.05) / .2) * Math.PI / 2) : z > .9 ? .8 + (.96 - .8) * Math.pow((2.05 - z) / 1.15, .7) : z > -1.7 ? .96 + .03 * (z - .9) / -2.6 : z > -2.1 ? .99 - .04 * (-1.7 - z) / .4 : .95 - .33 * Math.sin(Math.min(1, (-2.1 - z) / .15) * Math.PI / 2);
/** a body section between z0..z1 (side profile extruded over width w, centred at x) */
export function section(z0, z1, w, x, m, name, n = 40) {
  const s = new THREE.Shape(); const zs = []; for (let i = 0; i <= n; i++) zs.push(z0 + (z1 - z0) * i / n);
  zs.forEach((z, i) => i ? s.lineTo(z, bottomY(z)) : s.moveTo(z, bottomY(z))); for (let i = n; i >= 0; i--) s.lineTo(zs[i], topY(zs[i]));
  const g = new THREE.ExtrudeGeometry(s, {depth: w, bevelEnabled: true, bevelThickness: .06, bevelSize: .05, bevelSegments: 4, curveSegments: 4}); g.rotateY(-Math.PI / 2); g.translate(x + w / 2, 0, 0);
  return mesh(g, m, name);
}
export function wheel(name, x, z) { const g = grp(name); at(g, x, WR, z);
  const spin = grp(name + 'Spin'); g.add(spin);
  spin.add(at(mesh(new THREE.TorusGeometry(WR - .075, .075, 14, 32), CMAT.tyre), 0, 0, 0, 0, Math.PI / 2));
  spin.add(at(cyl(WR - .1, WR - .1, .2, CMAT.tyre, null, 32), 0, 0, 0, 0, 0, Math.PI / 2));
  const rim = grp('rim'); spin.add(rim); rim.position.x = Math.sign(x) * .1;
  rim.add(at(cyl(.2, .2, .03, CMAT.rim, null, 32), 0, 0, 0, 0, 0, Math.PI / 2));
  for (let i = 0; i < 5; i++) rim.add(at(B(.008, .17, .04, CMAT.rim), Math.sign(x) * .012, 0, 0, i * Math.PI * 2 / 5, 0, 0));
  rim.add(at(cyl(.045, .045, .04, CMAT.chrome, null, 16), Math.sign(x) * .015, 0, 0, 0, 0, Math.PI / 2));
  return g; }
/** generic compact sedan with a full cabin (camera can sit in the passenger seat and fly out through the windshield).
 * Faces +z, origin on the ground between the axles, driver seat on the LEFT (+x, Israel).
 * Nodes: body (shell parts: bodyFront, bodyRear, sideL/R, roof, pillars), 'windshield' (glass), 'rearWindow', 'sideGlass*', mirrorL/R, 'rearMirror',
 *  headL/headR (lit), tailL/tailR (lit red), wheel0..3 (FL FR RL RR; spin 'wheel{i}Spin' .rotation.x), interior: 'floor', 'dash', 'binnacle',
 *  **'cluster'** (instrument panel plane behind the wheel, faces the driver, userData.aspect 2.6 → st.screen; coffee-cup alert), 'centerScreen' (aspect 1.6),
 *  seats 'seatDriver' / 'seatPassenger' / 'rearBench', doorL/doorR (inner panels), 'console', pedals 'brakePedal'/'gasPedal', 'domeLight' (lit when on),
 *  **'columnAxis'** (group at the wheel centre, local +z = column axis toward the driver) → **'steeringWheel'** (steer = .rotation.z, + = turn left) with grip spots 'gripL'/'gripR' (10 and 2 o'clock),
 *  **'column'** → ghost **'shell'** (shroud; fade for the x-ray) + insides 'shaft', **'angleSensor'** (light-blue ring round the shaft) + 'sensorBoard', spot 'sensorSpot',
 *  **'ecu'** (computer box under the dash, 'ecuLed'), **'wire'** sensor → ecu (userData.path, car coords → pulse), spots 'driverSpot' (place people/mannequin-driver), 'passengerEye' (frame-0 camera), 'windshieldCenter', 'carTop'. */
export function cabinCar() {
  const g = grp('cabinCar'), body = grp('body'); g.add(body);
  // body shell: solid nose + tail, thin sides along the cabin, floor
  body.add(section(.86, 2.25, 1.8, 0, CMAT.paint, 'bodyFront', 48), section(-2.25, -1.12, 1.8, 0, CMAT.paint, 'bodyRear', 36));
  for (const [s, n] of [[1, 'sideL'], [-1, 'sideR']]) body.add(section(-1.14, .88, .06, s * .87, CMAT.paint, n, 40));
  body.add(B(1.74, .06, 2.0, CMAT.paintDark, 0, .32, -.13, 'underbody'));
  body.add(B(1.82, .12, 4.3, CMAT.trim, 0, .3, 0, 'sill'));          // dark rocker / bumper line
  body.add(RB(1.84, .16, .2, .06, CMAT.trim, 0, .42, 2.2, 'bumperF'), RB(1.84, .2, .2, .06, CMAT.trim, 0, .45, -2.2, 'bumperR'));
  body.add(RB(.9, .1, .04, .03, CMAT.trim, 0, .6, 2.27, 'grille'), RB(.95, .025, .03, .012, CMAT.tailLamp, 0, .885, -2.25, 'tailBar'));
  // lamps (lit surfaces, no glow)
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) {
    body.add(at(rbox(.4, .06, .1, .03, CMAT.headLamp, 'head' + k), s * .6, .74, 2.2, -.2, s * -.15, 0));
    body.add(at(rbox(.36, .06, .06, .025, CMAT.tailLamp, 'tail' + k), s * .64, .88, -2.24, .1, s * .1, 0));
    body.add(at(rbox(.05, .04, .12, .015, CMAT.amber), s * .9, .78, 1.6));
  }
  // greenhouse: A/B/C pillars, roof, glass
  const RY = 1.46, WZ0 = .88, WY0 = .955, WZ1 = .06, CZ1 = -1.06, CZ0 = -1.72;
  const pil = (a, b, r, name) => { const o = tube([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + .02, (a[2] + b[2]) / 2], b], r, CMAT.paint, name, 16); body.add(o); return o; };
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) {
    pil([s * .82, WY0, WZ0], [s * .7, RY - .02, WZ1], .035, 'pillarA' + k);
    pil([s * .84, WY0, -.42], [s * .72, RY - .02, -.42], .04, 'pillarB' + k);
    body.add(sidePoly(s * .805, [[CZ1, RY - .03], [CZ0 + .05, .97], [CZ0 + .25, .97], [CZ1 + .02, RY - .08]], CMAT.paint, 'pillarC' + k));
    body.add(sidePoly(s * .79, [[WZ0 - .06, .985], [WZ1 + .05, RY - .05], [-.4, RY - .05], [-.4, .985]], CMAT.glass, 'sideGlassF' + k));
    body.add(sidePoly(s * .79, [[-.45, .985], [-.45, RY - .05], [CZ1, RY - .05], [CZ0 + .22, .985]], CMAT.glassTint, 'sideGlassR' + k));
    // window frame strip (black trim)
    body.add(tube([[s * .8, .975, WZ0 - .04], [s * .8, .975, CZ0 + .2]], .012, CMAT.trim, null, 4));
    // side mirror
    const mi = grp('mirror' + k); at(mi, s * .95, 1.02, .72); body.add(mi); mi.add(RB(.2, .12, .09, .035, CMAT.paint, 0, 0, 0), B(.05, .03, .1, CMAT.trim, -s * .1, -.03, .02));
  }
  const roof = rbox(1.5, .07, CZ1 * -1 + WZ1 + .06, .035, CMAT.paint, 'roof'); at(roof, 0, RY, (WZ1 + CZ1) / 2); body.add(roof);
  body.add(B(1.36, .01, (WZ1 - CZ1) - .06, CMAT.head, 0, RY - .03, (WZ1 + CZ1) / 2, 'headliner'));
  body.add(quad([.8, WY0, WZ0], [-.8, WY0, WZ0], [-.69, RY - .02, WZ1], [.69, RY - .02, WZ1], CMAT.glass, 'windshield'));
  body.add(quad([-.79, .97, CZ0 + .03], [.79, .97, CZ0 + .03], [.69, RY - .03, CZ1], [-.69, RY - .03, CZ1], CMAT.glassTint, 'rearWindow'));
  body.add(B(1.62, .015, .05, CMAT.trim, 0, WY0 - .005, WZ0 - .02, 'cowl'));
  // ---------- interior ----------
  const inn = grp('interior'); g.add(inn);
  inn.add(B(1.66, .03, 2.05, CMAT.carpet, 0, .18, -.15, 'floor'));
  inn.add(B(1.66, .45, .05, CMAT.carpet, 0, .4, .86, 'firewall'));
  inn.add(B(.36, .16, 1.3, CMAT.carpet, 0, .26, -.2, 'tunnel'));
  // dashboard
  const dash = grp('dash'); inn.add(dash);
  dash.add(RB(1.64, .34, .5, .06, CMAT.dash, 0, .76, .63));
  dash.add(RB(1.66, .07, .42, .03, CMAT.dashSoft, 0, .93, .62, 'dashTop'));
  dash.add(B(1.6, .02, .015, CMAT.dashTrim, 0, .8, .375, 'dashTrimLine'));
  for (const x of [-.62, .74, -.12, .12]) dash.add(RB(.11, .045, .02, .01, CMAT.plastic, x, .855, .375));   // air vents
  const bin = RB(.44, .07, .16, .03, CMAT.dashSoft, .37, 1.0, .44, 'binnacle'); dash.add(bin);
  const cl = new THREE.PlaneGeometry(.34, .13); const clm = mesh(cl, CMAT.screenOff, 'cluster'); clm.castShadow = false; clm.userData.aspect = .34 / .13;
  const clg = grp('clusterMount'); at(clg, .37, .885, .365, 0, Math.PI, 0); clg.add(at(clm, 0, 0, 0, -.18)); dash.add(clg);
  const cs = mesh(new THREE.PlaneGeometry(.24, .15), CMAT.screenOff, 'centerScreen'); cs.userData.aspect = 1.6; cs.castShadow = false;
  const csg = grp('centerScreenMount'); at(csg, 0, .97, .47, 0, Math.PI, 0); csg.add(at(cs, 0, 0, 0, -.25)); dash.add(csg); dash.add(RB(.26, .17, .02, .01, CMAT.trim, 0, .97, .475));
  dash.add(RB(.5, .2, .06, .03, CMAT.dash, -.4, .66, .4, 'glovebox'));
  // lower dash knee panel (driver) – the ecu sits behind/below it
  dash.add(RB(.5, .12, .05, .02, CMAT.dash, .37, .56, .44, 'kneePanel'));
  // console
  const con = grp('console'); inn.add(con);
  con.add(RB(.26, .3, .9, .04, CMAT.dash, 0, .36, -.05), RB(.24, .03, .55, .015, CMAT.dashSoft, 0, .52, -.22, 'armrest'));
  con.add(at(cyl(.02, .025, .09, CMAT.trim, 'gearLever', 12), 0, .55, .22), at(mesh(new THREE.SphereGeometry(.03, 16, 12), CMAT.leather), 0, .61, .22));
  con.add(RB(.22, .05, .3, .02, CMAT.plastic, 0, .52, .2, 'gearPlate'));
  // seats
  const seat = (name, x, z, wide = .52) => { const s = grp(name); at(s, x, 0, z); inn.add(s);
    s.add(RB(wide, .14, .5, .05, CMAT.seat, 0, .37, 0, name + 'Cushion'), B(wide - .1, .012, .46, CMAT.seatStitch, 0, .445, 0));
    s.add(RB(wide * .2, .1, .48, .04, CMAT.seat, wide * .42, .43, 0), RB(wide * .2, .1, .48, .04, CMAT.seat, -wide * .42, .43, 0));   // bolsters
    const bk = grp(name + 'Back'); at(bk, 0, .42, -.24, -.22, 0, 0); s.add(bk);
    bk.add(RB(wide, .66, .13, .05, CMAT.seat, 0, .33, -.03), RB(wide * .18, .6, .1, .04, CMAT.seat, wide * .43, .32, .03), RB(wide * .18, .6, .1, .04, CMAT.seat, -wide * .43, .32, .03));
    bk.add(at(cyl(.008, .008, .12, CMAT.chrome, null, 8), .08, .72, -.03), at(cyl(.008, .008, .12, CMAT.chrome, null, 8), -.08, .72, -.03));
    bk.add(RB(.26, .17, .1, .045, CMAT.seat, 0, .82, -.03, name + 'Headrest'));
    s.add(B(.36, .2, .36, CMAT.trim, 0, .24, .02)); return s; };
  seat('seatDriver', .37, -.36); seat('seatPassenger', -.37, -.36);
  const rb = grp('rearBench'); at(rb, 0, 0, -1.04); inn.add(rb); rb.add(RB(1.4, .14, .5, .05, CMAT.seat, 0, .4, .1), at(RB(1.4, .6, .14, .05, CMAT.seat, 0, 0, 0), 0, .74, -.17, -.2, 0, 0));
  // doors (inner)
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) { const d = grp('door' + k); inn.add(d);
    d.add(B(.05, .66, 1.85, CMAT.dash, s * .825, .62, -.14), RB(.09, .05, .55, .02, CMAT.dashSoft, s * .79, .66, -.15, 'armrest' + k), B(.02, .14, 1.7, CMAT.dashSoft, s * .8, .86, -.14));
    d.add(RB(.02, .03, .12, .01, CMAT.chrome, s * .795, .78, .22, 'handle' + k), B(.02, .12, .3, CMAT.trim, s * .8, .38, .35, 'speaker' + k)); }
  // pedals
  inn.add(at(RB(.08, .1, .02, .01, CMAT.trim, 'brakePedal'), .43, .29, .52, -.6), at(RB(.05, .14, .015, .008, CMAT.trim, 'gasPedal'), .27, .29, .55, -.7));
  inn.add(RB(.16, .03, .05, .015, CMAT.head, 0, RY - .05, -.02, 'domeLight'));
  // rear-view mirror
  const rm = grp('rearMirror'); at(rm, 0, 1.33, .2); inn.add(rm); rm.add(at(cyl(.008, .008, .08, CMAT.trim, null, 8), 0, .05, 0), RB(.26, .07, .03, .02, CMAT.trim, 0, 0, 0), at(B(.24, .055, .002, R(0x6f7880, .05, .9)), 0, 0, -.016));
  // ---------- steering: column axis + wheel + x-ray insides ----------
  const WC = new THREE.Vector3(.37, .92, -.02), DIR = new THREE.Vector3(0, .426, -.905).normalize();
  const ax = grp('columnAxis'); ax.position.copy(WC); ax.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), DIR); inn.add(ax);
  const sw = grp('steeringWheel'); ax.add(sw);
  sw.add(mesh(new THREE.TorusGeometry(.185, .017, 16, 64), CMAT.wheelRim, 'rim'));
  sw.add(at(rbox(.13, .09, .05, .03, CMAT.wheelRim, 'hub'), 0, 0, .01), at(rbox(.08, .055, .012, .02, CMAT.dashTrim, 'hubBadge'), 0, 0, .036));   // plain, no logo
  for (const a of [0, Math.PI, -Math.PI / 2]) { const sp = rbox(.15, .03, .015, .012, CMAT.wheelRim, null); sp.position.set(Math.cos(a) * .1, Math.sin(a) * .1, 0); sp.rotation.z = a; sw.add(sp); }
  sw.add(at(B(.012, .02, .006, CMAT.acc, 'topMark'), 0, .185, .016));   // small marker at 12 o'clock (reads the turn angle)
  for (const [k, s] of [['L', 1], ['R', -1]]) sw.add(spot('grip' + k, s * .16, .09, 0));
  const col = grp('column'); ax.add(col);
  const shell = grp('shell'); col.add(shell); shell.add(RB(.12, .11, .3, .04, CMAT.ghost, 0, -.015, -.2, 'shroud'), at(cyl(.035, .045, .35, CMAT.ghost, 'shroudLower', 16), 0, -.02, -.45, Math.PI / 2));
  shell.add(RB(.25, .02, .05, .01, CMAT.trim, 0, .03, -.08, 'stalks'));
  col.add(at(cyl(.016, .016, .62, CMAT.metal, 'shaft', 16), 0, 0, -.33, Math.PI / 2));
  col.add(at(mesh(new THREE.TorusGeometry(.03, .009, 12, 32), CMAT.acc, 'angleSensor'), 0, 0, -.12));
  col.add(RB(.045, .02, .035, .006, CMAT.pcb, 0, -.042, -.12, 'sensorBoard'), B(.012, .006, .01, CMAT.acc, 0, -.03, -.12, 'sensorChip'));
  col.add(spot('sensorSpot', 0, -.045, -.12));
  // ecu + wire
  inn.add(RB(.2, .055, .15, .012, CMAT.metal, .12, .47, .58, 'ecu'));
  inn.add(B(.17, .003, .12, CMAT.pcb, .12, .5, .58, 'ecuTop'), B(.015, .006, .006, CMAT.acc, .2, .5, .52, 'ecuLed'));
  g.updateMatrixWorld(true); const sp = g.getObjectByName('sensorSpot').getWorldPosition(new THREE.Vector3());
  inn.add(tube([[sp.x, sp.y, sp.z], [sp.x, sp.y - .06, sp.z + .08], [.32, .58, .4], [.24, .52, .52], [.2, .5, .58]], .005, CMAT.wireGrey, 'wire', 48));
  // spots
  g.add(spot('driverSpot', .37, .47 - .98, -.47), spot('passengerEye', -.36, 1.19, -.62), spot('windshieldCenter', 0, 1.2, .5), spot('carTop', 0, 1.5, -.4));
  g.traverse(o => { if (o.isMesh && o.material.transparent) o.castShadow = false; });
  return g;
}

// ---------- seated driver ----------
/** seated driver mannequin (1.75 m, grey silhouette under proLook people:[...]). Origin = mannequin feet origin; put it on cabinCar 'driverSpot' (same rotation as the car).
 * Joints as people/* mannequins: pelvis/torso/head (nod = head.rotation.x +, slump = torso.rotation.x +), shoulder/elbow L/R (fx-cabin.js driverRig() solves the arms onto the wheel grips every frame), hip/knee L/R. */
export function mannequinDriver() { const g = mannequin('stand'); g.name = 'mannequinDriver'; g.getObjectByName('phone').visible = false;
  const P = (n, x, y = 0, z = 0) => g.getObjectByName(n).rotation.set(x, y, z);
  P('torso', -.24); P('head', .2); P('hipL', -1.72, 0, .05); P('hipR', -1.72, 0, -.05); P('kneeL', .95); P('kneeR', .9);
  P('shoulderL', -1.1, 0, .1); P('shoulderR', -1.1, 0, -.1); P('elbowL', -.5); P('elbowR', -.5); return g; }

// ---------- night highway ----------
/** Israeli-style intercity highway at night, 240 m segment along z (−120..120), repeats every 40 m (fx-cabin.js highway() scrolls it → endless drive).
 * Our carriageway x −9..+5.6 (car drives toward +z in the middle lane x 0; lanes x +3.6 / 0 / −3.6; dashed lane lines x ±1.8; solid edge lines x +5.4 and −5.4),
 * hard shoulder to −8, guard rail at −8.6; concrete median barrier at x +6.5 with streetlight poles every 40 m (double arms, lit LED heads 'lampHead{i}'), opposite carriageway x +7.4..+19.
 * Beyond: dark fields, a far town ('farLights', static, instanced dots on the horizon) and a far ridge. Spots 'lampSpot{i}' under each head (fx adds real light there). Origin = road surface y 0. */
export function nightHighway() {
  const g = grp('nightHighway'), L = 240, scroll = grp('scroll'); g.add(scroll);
  scroll.add(B(14.6, .02, L, CMAT.asphalt, -1.7, -.01, 0, 'asphalt'), B(11.6, .02, L, CMAT.asphalt2, 13.2, -.01, 0, 'asphaltOpp'));
  scroll.add(B(2.6, .021, L, CMAT.shoulder, -7.3, -.009, 0, 'shoulder'));
  const dashG = new THREE.BoxGeometry(.15, .006, 4), solidG = new THREE.BoxGeometry(.15, .006, L);
  scroll.add(at(mesh(solidG, CMAT.paint1, 'edgeR'), -5.4, .003, 0), at(mesh(solidG, CMAT.paint1, 'edgeL'), 5.4, .003, 0), at(mesh(solidG, CMAT.paint1), 7.6, .003, 0), at(mesh(solidG, CMAT.paint1), 18.6, .003, 0));
  const nD = L / 10, dm = new THREE.InstancedMesh(dashG, CMAT.paint1, nD * 4); dm.name = 'laneDashes'; dm.receiveShadow = true; const mm = new THREE.Matrix4(); let k = 0;
  for (const x of [1.8, -1.8, 11.3, 15.0]) for (let i = 0; i < nD; i++) dm.setMatrixAt(k++, mm.makeTranslation(x, .003, -L / 2 + i * 10 + 2)); scroll.add(dm);
  // median: jersey barrier (profile extruded along z)
  const jp = new THREE.Shape(); jp.moveTo(-.3, 0); jp.lineTo(-.28, .08); jp.lineTo(-.2, .25); jp.lineTo(-.08, .81); jp.lineTo(.08, .81); jp.lineTo(.2, .25); jp.lineTo(.28, .08); jp.lineTo(.3, 0); jp.lineTo(-.3, 0);
  const jg = new THREE.ExtrudeGeometry(jp, {depth: L, bevelEnabled: false}); jg.translate(0, 0, -L / 2); scroll.add(at(mesh(jg, CMAT.concrete, 'median'), 6.5, 0, 0));
  scroll.add(B(1.6, .03, L, CMAT.concrete2, 6.5, -.005, 0, 'medianStrip'));
  // guard rail (right edge)
  const gr = grp('guardRail'); scroll.add(gr); gr.add(B(.04, .32, L, CMAT.steel, -8.6, .62, 0), B(.02, .06, L, CMAT.steel, -8.58, .62, 0));
  const postG = new THREE.BoxGeometry(.1, .75, .1), pm = new THREE.InstancedMesh(postG, CMAT.steel, L / 2); for (let i = 0; i < L / 2; i++) pm.setMatrixAt(i, mm.makeTranslation(-8.68, .37, -L / 2 + i * 2)); gr.add(pm);
  // streetlights in the median every 40 m
  const nL = L / 40;
  for (let i = 0; i < nL; i++) { const z = -L / 2 + 20 + i * 40, p = grp('pole' + i); at(p, 6.5, 0, z); scroll.add(p);
    p.add(at(cyl(.09, .15, 11.5, CMAT.steel, null, 12), 0, 6.6, 0), at(cyl(.32, .32, .3, CMAT.concrete2, null, 16), 0, .95, 0));
    for (const s of [-1, 1]) { p.add(tube([[0, 11.9, 0], [s * .9, 12.25, 0], [s * 2.2, 12.35, 0]], .05, CMAT.steel, null, 12));
      const h = RB(.75, .12, .32, .05, CMAT.steel, s * 2.55, 12.3, 0, s < 0 ? 'lampHead' + i : null); p.add(h);
      p.add(B(.62, .02, .24, CMAT.lamp, s * 2.55, 12.235, 0)); if (s < 0) p.add(spot('lampSpot' + i, s * 2.55, 12.1, 0)); } }
  // overhead gantry sign (blank green panel, no real place names) once per segment
  const gs = grp('gantry'); at(gs, 0, 0, 30); scroll.add(gs);
  for (const x of [-8.9, 5.8]) gs.add(at(cyl(.15, .15, 7, CMAT.steel, null, 12), x, 3.5, 0));
  gs.add(B(14.9, .35, .35, CMAT.steel, -1.55, 6.8, 0), RB(5.2, 2.2, .12, .04, CMAT.sign, -2.0, 5.4, -.1, 'signPanel'), B(4.9, .04, .02, CMAT.signW, -2.0, 6.35, -.17), B(4.9, .04, .02, CMAT.signW, -2.0, 4.45, -.17));
  // fields either side
  scroll.add(B(60, .02, L, CMAT.dirt, -39, -.04, 0, 'fieldR'), B(60, .02, L, CMAT.grass, 49, -.04, 0, 'fieldL'));
  // distant cars' lights on the opposite carriageway are added by fx (they move); far town + ridge are static
  const far = grp('far'); g.add(far); const rr = rng(7);
  const dotG = new THREE.SphereGeometry(.35, 8, 6), N = 420, fm = new THREE.InstancedMesh(dotG, CMAT.far, N), fw = new THREE.InstancedMesh(dotG, CMAT.farW, N / 3); fm.name = 'farLights';
  for (let i = 0; i < N; i++) { const a = (rr() - .5) * 1.6, d = 260 + rr() * 260; fm.setMatrixAt(i, mm.makeTranslation(Math.sin(a) * d * 1.3, .4 + rr() * 6 * (rr() < .2 ? 3 : 1), Math.cos(a) * d)); }
  for (let i = 0; i < N / 3; i++) { const a = (rr() - .5) * 2.2, d = 200 + rr() * 300; fw.setMatrixAt(i, mm.makeTranslation(Math.sin(a) * d * 1.3, .4 + rr() * 4, Math.cos(a) * d)); }
  fm.castShadow = fw.castShadow = false; far.add(fm, fw);
  const ridge = new THREE.Shape(); ridge.moveTo(-900, -5); for (let i = 0; i <= 60; i++) { const x = -900 + i * 30; ridge.lineTo(x, 18 + 22 * Math.sin(i * .37) + 10 * Math.sin(i * 1.3)); } ridge.lineTo(900, -5); ridge.lineTo(-900, -5);
  const rgm = mesh(new THREE.ShapeGeometry(ridge), R(0x0b0d12, 1), 'ridge'); rgm.position.z = 620; rgm.rotation.y = Math.PI; rgm.castShadow = false; far.add(rgm);
  const rg2 = rgm.clone(); rg2.position.z = -620; rg2.rotation.y = 0; far.add(rg2);
  return g;
}

export const KITCABIN = { 'car/cabinCar': cabinCar, 'road/nightHighway': nightHighway, 'people/mannequin-driver': mannequinDriver };
