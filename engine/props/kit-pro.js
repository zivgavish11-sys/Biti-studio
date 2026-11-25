// "Pro" realistic kit (Media pro, 2026-11-20) — for the serious news carousels (tone: Bloomberg / The Verge, not a toy shop).
// Generic designs (no real brand, no replica), our own work → CC0. Real metres, y-up, standing on y=0, facing +z.
// Shapes: lathe-turned castings, bevelled extrusions, panel seams, actuator housings, bolts, cable dress — no capsule toys.
// Material colours are chosen so engine/news/look.js pro() maps them to: satin polymer (light), brushed alloy (mid/metal), anodised (dark), rubber (rough dark), black glass (glossy dark).
// Export: python3 tools/make_props.py pro/   → engine/assets/models/pro/<name>.glb
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const S = (color, rough, metal = 0) => new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal});
const MP = {
  shell: S(0xe4e6ea, .42), shell2: S(0xc9ccd2, .45), alloy: S(0x9da3ab, .32, .9), dark: S(0x1b1d22, .45, .6), graphite: S(0x34373e, .5, .3),
  rubber: S(0x0d0e10, .92), glass: S(0x06070a, .05, .1), seam: S(0x0a0b0d, .7), accent: S(0x2ee6ff, .5), amber: S(0xe0a030, .5),
  clear: Object.assign(S(0xcfd8e6, .05, 0), {transparent: true, opacity: .18}), white: S(0xf1f2f4, .55), plate: S(0xeceef1, .5),
  cap: [S(0x3d6fd1, .5), S(0xd14b3d, .5), S(0xe0b23a, .5), S(0x3fa36b, .5)], liquid: Object.assign(S(0xc9a46a, .15), {transparent: true, opacity: .7}),
  stone: S(0x2a2b2f, .35, .05), wood: S(0x6b4e36, .7), coffee: S(0x2b170c, .3), ceramic: S(0xf2f0ec, .3),
};
const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); if (name) o.name = name; o.castShadow = o.receiveShadow = true; return o; };
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const grp = (name, ...kids) => { const g = new THREE.Group(); if (name) g.name = name; kids.forEach(k => g.add(k)); return g; };
const rbox = (w, h, d, r, m, name, seg = 4) => mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) * .999), m, name);
const cyl = (rt, rb, h, m, name, seg = 40) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m, name);
/** lathe from [[r, y], ...] (bottom → top) */
const lathe = (pts, m, name, seg = 56) => mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-4), y)), seg), m, name);
/** smooth lathe: catmull through control pts */
const slathe = (pts, m, name, n = 28, seg = 56) => { const c = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y))); return lathe(c.getPoints(n).map(v => [v.x, v.y]), m, name, seg); };
/** bevelled extrusion of a 2D outline (x, y) with thickness d centred on z */
function ext(pts, d, m, name, bevel = .012, curveSeg = 0) {
  const sh = new THREE.Shape(); pts.forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y)); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, {depth: Math.max(.001, d - 2 * bevel), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 12});
  g.translate(0, 0, -(d - 2 * bevel) / 2); g.computeVertexNormals(); return mesh(g, m, name);
}
/** rounded outline helper: polygon with corner radius r (returns a Shape-compatible point list) */
function roundPoly(pts, r, n = 5) {
  const out = []; const N = pts.length;
  for (let i = 0; i < N; i++) {
    const p0 = new THREE.Vector2(...pts[(i - 1 + N) % N]), p1 = new THREE.Vector2(...pts[i]), p2 = new THREE.Vector2(...pts[(i + 1) % N]);
    const a = p0.clone().sub(p1).normalize(), b = p2.clone().sub(p1).normalize(); const rr = Math.min(r, p0.distanceTo(p1) / 2.2, p2.distanceTo(p1) / 2.2);
    const s = p1.clone().addScaledVector(a, rr), e = p1.clone().addScaledVector(b, rr);
    for (let k = 0; k <= n; k++) { const t = k / n; const q = s.clone().multiplyScalar((1 - t) ** 2).addScaledVector(p1, 2 * t * (1 - t)).addScaledVector(e, t * t); out.push([q.x, q.y]); }
  }
  return out;
}
/** tapered limb shell between two radii along −y, length L, with slight mid bulge */
const limb = (r0, r1, L, m, name, bulge = 1.08) => slathe([[0, 0], [r0 * .7, .004], [r0, -L * .08], [((r0 + r1) / 2) * bulge, -L * .45], [r1, -L * .9], [r1 * .7, -L + .004], [0, -L]], m, name);
/** actuator: motor can with end cap ring + bolt circle, axis along x */
function actuator(r, w, name, m = MP.dark) {
  const g = grp(name);
  g.add(at(cyl(r, r, w, m, null, 48), 0, 0, 0, 0, 0, Math.PI / 2));
  for (const s of [-1, 1]) { g.add(at(cyl(r * .78, r * .82, .006, MP.alloy, null, 48), s * (w / 2 + .003), 0, 0, 0, 0, Math.PI / 2));
    g.add(at(cyl(r * .3, r * .3, .008, MP.graphite, null, 24), s * (w / 2 + .006), 0, 0, 0, 0, Math.PI / 2));
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; g.add(at(cyl(r * .05, r * .05, .006, MP.alloy, null, 8), s * (w / 2 + .006), Math.cos(a) * r * .6, Math.sin(a) * r * .6, 0, 0, Math.PI / 2)); } }
  g.add(at(new THREE.Mesh(new THREE.TorusGeometry(r * 1.003, .0025, 6, 48), MP.seam), w * .25, 0, 0, 0, Math.PI / 2, 0));
  return g;
}
const seamRing = (r, y, name) => at(mesh(new THREE.TorusGeometry(r, .0018, 6, 56), MP.seam, name), 0, y, 0, Math.PI / 2);
function merged(geos, m, name) { const g = mergeGeometries(geos.map(x => x.toNonIndexed ? x.toNonIndexed() : x), false); return mesh(g, m, name); }
const tube = (pts, r, m, name, n = 60) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), n, r, 10), m, name);

// =====================================================================================================
/** pro/humanoid — 1.75 m general-purpose humanoid, realistic proportions (broad shoulders, narrow waist, long legs, small helmet head).
 * Same joint names as robots/humanoid: pelvis, torso (.y twist), neck, head, shoulderL/R, elbowL/R, wristL/R, hipL/R, kneeL/R, ankleL/R (rotate .x / .z);
 * fingers: f{L|R}{0..3}_{0..2}, thumb{L|R}_{0..1} (rotate .x to curl). 'face' = black glass visor. Natural rest pose (arms slightly out, elbows soft). */
export function humanoidPro() {
  const W = MP.shell, D = MP.dark, A = MP.alloy, G = MP.graphite;
  const root = grp('humanoidPro');
  const pelvis = grp('pelvis'); at(pelvis, 0, .98, 0); root.add(pelvis);
  // pelvis shell: front-view trapezoid, bevelled
  pelvis.add(at(ext(roundPoly([[-.12, .04], [.12, .04], [.1, -.06], [.035, -.1], [-.035, -.1], [-.1, -.06]], .03), .15, W, 'pelvisShell', .035), 0, 0, 0));
  pelvis.add(at(rbox(.2, .05, .16, .02, D, 'hipBlock'), 0, .07, 0));
  const torso = grp('torso'); at(torso, 0, .1, 0); pelvis.add(torso);
  // waist: bellows (stack of rings) = spine actuator
  for (let k = 0; k < 5; k++) torso.add(at(cyl(.085 - (k % 2) * .008, .085 - (k % 2) * .008, .022, k % 2 ? G : D, null, 40), 0, .012 + k * .021, 0));
  // chest: front outline (V taper), extruded deep, rounded
  const chest = ext(roundPoly([[-.075, .03], [.075, .03], [.15, .2], [.165, .32], [.11, .37], [-.11, .37], [-.165, .32], [-.15, .2]], .05), .25, W, 'torsoShell', .065);
  torso.add(at(chest, 0, .11, 0));
  torso.add(at(rbox(.2, .004, .02, .002, MP.seam, 'chestSeam'), 0, .3, .155)); torso.add(at(rbox(.004, .12, .02, .002, MP.seam), 0, .2, .155));
  torso.add(at(rbox(.07, .008, .004, .002, MP.accent, 'chestLight'), 0, .44, .14));
  // seams on the chest shell
    // back pack (battery)
  torso.add(at(rbox(.28, .26, .08, .03, G, 'backpack'), 0, .3, -.15));
  for (let k = 0; k < 4; k++) torso.add(at(rbox(.22, .006, .084, .002, MP.seam), 0, .2 + k * .06, -.15));
  // neck + head
  const neck = grp('neck'); at(neck, 0, .53, 0); torso.add(neck);
  neck.add(at(cyl(.042, .05, .07, D, null, 32), 0, .035, 0)); neck.add(at(cyl(.046, .046, .01, A, null, 32), 0, .02, 0));
  const head = grp('head'); at(head, 0, .07, .005); neck.add(head);
  const helm = mesh(new THREE.SphereGeometry(1, 64, 48), W, 'headShell'); helm.scale.set(.098, .125, .112); at(helm, 0, .12, 0); head.add(helm);
  const face = mesh(new THREE.SphereGeometry(1, 64, 48, Math.PI * .2, Math.PI * .6, Math.PI * .28, Math.PI * .34), MP.glass, 'face'); face.scale.set(.1, .127, .114); at(face, 0, .12, 0, 0, 0, 0); head.add(face);
  head.add(at(new THREE.Mesh(new THREE.TorusGeometry(.104, .003, 8, 64, Math.PI * 1.1), MP.seam), 0, .12, 0, 0, Math.PI / 2 - Math.PI * .55, Math.PI / 2));
  for (const s of [-1, 1]) head.add(at(cyl(.03, .03, .012, G, null, 32), s * .1, .12, -.005, 0, 0, Math.PI / 2));
  // arms
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    const sh = grp('shoulder' + k); at(sh, s * .245, .46, 0); torso.add(sh); sh.rotation.z = s * .06;
    sh.add(at(actuator(.058, .09, 'shoulderMotor' + k), s * .01, 0, 0));
    sh.add(at(slathe([[0, .0], [.06, -.01], [.064, -.06], [.05, -.12], [0, -.13]], W, 'deltoid' + k), 0, .01, 0));
    sh.add(at(limb(.05, .042, .23, W, 'upperArm' + k), 0, -.06, 0));
    sh.add(at(rbox(.012, .14, .03, .004, G), s * .045, -.17, 0));
    const el = grp('elbow' + k); at(el, 0, -.3, 0); sh.add(el); el.rotation.x = -.18;
    el.add(at(actuator(.042, .075, 'elbowMotor' + k), 0, 0, 0));
    el.add(at(limb(.042, .033, .21, W, 'forearm' + k), 0, -.03, 0));
    el.add(at(seamRing(.04, -.08), 0, 0, 0));
    const wr = grp('wrist' + k); at(wr, 0, -.255, 0); el.add(wr);
    wr.add(at(cyl(.03, .032, .03, D, null, 32), 0, -.005, 0));
    // hand: palm + 4 fingers × 3 phalanges + thumb
    const palm = ext(roundPoly([[-.04, 0], [.04, 0], [.045, -.085], [-.045, -.085]], .012), .032, G, 'palm' + k, .008); at(palm, 0, -.025, 0, 0, Math.PI / 2, 0); wr.add(palm);
    for (let f = 0; f < 4; f++) {
      let parent = grp(`f${k}${f}_0`); at(parent, 0, -.11, (f - 1.5) * .021); wr.add(parent); parent.rotation.z = -s * .1;
      const lens = [.036, .026, .022].map(v => v * (f === 0 || f === 3 ? .88 : 1));
      for (let j = 0; j < 3; j++) {
        parent.add(at(rbox(.018, lens[j], .017, .007, j % 2 ? D : G, null, 3), 0, -lens[j] / 2, 0));
        if (j < 2) { const nx = grp(`f${k}${f}_${j + 1}`); at(nx, 0, -lens[j] - .002, 0); parent.add(nx); nx.rotation.z = -s * .12; parent = nx; }
      }
    }
    let th = grp(`thumb${k}_0`); at(th, s * .005, -.04, .03); wr.add(th); th.rotation.set(.5, 0, s * .2);
    th.add(at(rbox(.019, .04, .019, .007, G, null, 3), 0, -.02, 0)); const th1 = grp(`thumb${k}_1`); at(th1, 0, -.042, 0); th.add(th1); th1.add(at(rbox(.017, .03, .017, .007, D, null, 3), 0, -.015, 0));
    wr.rotation.y = s * Math.PI / 2 * 0; sh.rotation.x = .04;
  }
  // legs
  for (const [s, k] of [[-1, 'L'], [1, 'R']]) {
    const hp = grp('hip' + k); at(hp, s * .095, -.08, 0); pelvis.add(hp);
    hp.add(at(actuator(.07, .085, 'hipMotor' + k), s * .01, 0, 0));
    hp.add(at(limb(.072, .056, .4, W, 'thigh' + k, 1.08), 0, -.02, 0));
    hp.add(at(rbox(.02, .2, .05, .006, G), s * .07, -.2, .01));
    hp.add(at(seamRing(.068, -.12), 0, 0, 0));
    const kn = grp('knee' + k); at(kn, 0, -.44, 0); hp.add(kn); kn.rotation.x = .06;
    kn.add(at(actuator(.046, .08, 'kneeMotor' + k, MP.graphite), 0, 0, 0));
    kn.add(at(ext(roundPoly([[-.04, .03], [.04, .03], [.05, -.03], [0, -.06], [-.05, -.03]], .015), .03, G, 'kneeCap' + k, .008), 0, 0, .05));
    kn.add(at(limb(.056, .038, .38, W, 'shin' + k, 1.12), 0, -.01, 0));
    kn.add(at(rbox(.05, .16, .012, .005, G), 0, -.18, .045));
    const an = grp('ankle' + k); at(an, 0, -.43, 0); kn.add(an); an.rotation.x = -.06;
    an.add(at(actuator(.032, .06, 'ankleMotor' + k), 0, 0, 0));
    // foot: side profile extruded across the width
    const foot = ext(roundPoly([[-.085, -.05], [.16, -.05], [.165, -.025], [.07, .005], [-.03, .02], [-.085, .0]], .015), .095, G, 'foot' + k, .01);
    at(foot, 0, -.03, 0, 0, -Math.PI / 2, 0); an.add(foot);
    an.add(at(rbox(.1, .012, .25, .005, MP.rubber, 'sole' + k), 0, -.083, .035));
  }
  return root;
}

// =====================================================================================================
/** pro/quadruped — inspection quadruped, ~0.62 m to the back, 1.0 m long (generic, no brand look). Nodes: body, sensorHead, hip{FL,FR,BL,BR} (.x), knee{..} (.x), foot{..}, handleRail. */
export function quadrupedPro() {
  const W = MP.shell, D = MP.dark, G = MP.graphite;
  const root = grp('quadrupedPro'); const body = grp('body'); at(body, 0, .52, 0); root.add(body);
  // body: side profile, extruded across width
  const side = roundPoly([[-.46, -.08], [.4, -.08], [.47, -.02], [.45, .07], [.36, .1], [-.42, .1], [-.47, .05]], .04);
  body.add(at(ext(side, .3, W, 'bodyShell', .03), 0, 0, 0, 0, -Math.PI / 2, 0));
  body.add(at(rbox(.31, .025, .7, .01, D, 'bellyPlate'), 0, -.085, 0));
  body.add(at(rbox(.302, .004, .86, .002, MP.seam), 0, .03, 0));
  for (const s of [-1, 1]) { body.add(at(rbox(.004, .1, .5, .002, MP.seam), s * .152, 0, 0)); body.add(at(rbox(.03, .05, .28, .01, G, null), s * .155, -.01, 0)); }
  // top rail + payload ports
  for (const s of [-1, 1]) body.add(at(rbox(.02, .02, .55, .006, D), s * .1, .115, 0));
  body.add(at(rbox(.16, .006, .2, .003, G, 'payloadPlate'), 0, .108, -.12));
  // sensor head (front)
  const head = grp('sensorHead'); at(head, 0, .0, .44); body.add(head);
  head.add(at(ext(roundPoly([[-.13, -.06], [.13, -.06], [.13, .06], [-.13, .06]], .035), .07, G, 'headBlock', .015), 0, 0, 0));
  head.add(at(rbox(.22, .06, .012, .012, MP.glass, 'sensorGlass'), 0, 0, .036));
  for (const s of [-1, 1]) head.add(at(cyl(.016, .016, .006, MP.dark, 'cam' + (s > 0 ? 1 : 0), 24), s * .06, 0, .043, Math.PI / 2));
  // rear sensor
  body.add(at(rbox(.18, .06, .012, .012, MP.glass, 'rearGlass'), 0, 0, -.47));
  for (const [x, z, k] of [[-.19, .3, 'FL'], [.19, .3, 'FR'], [-.19, -.3, 'BL'], [.19, -.3, 'BR']]) {
    const s = Math.sign(x), front = z > 0;
    const hip = grp('hip' + k); at(hip, x, -.02, z); body.add(hip);
    hip.add(at(actuator(.06, .07, 'hipMotor' + k), 0, 0, 0));
    hip.rotation.x = front ? -.75 : -.75;
    // thigh: flat bevelled plate with taper
    hip.add(at(ext(roundPoly([[-.05, .02], [.05, .02], [.035, -.3], [-.035, -.3]], .025), .05, W, 'thigh' + k, .012), s * .045, 0, 0, 0, Math.PI / 2, 0));
    hip.add(at(rbox(.004, .2, .03, .002, MP.seam), s * .072, -.14, 0));
    const kn = grp('knee' + k); at(kn, s * .045, -.3, 0); hip.add(kn); kn.rotation.x = 1.5;
    kn.add(at(cyl(.032, .032, .055, D, null, 32), 0, 0, 0, 0, 0, Math.PI / 2));
    kn.add(at(slathe([[0, .01], [.024, 0], [.019, -.15], [.014, -.29], [0, -.3]], G, 'shin' + k), 0, 0, 0));
    kn.add(at(mesh(new THREE.SphereGeometry(.03, 24, 16), MP.rubber, 'foot' + k), 0, -.3, 0));
  }
  return root;
}

// =====================================================================================================
/** pro/industrialArm — 6-axis industrial robot (reach ~1.6 m), cast-housing look, off-white + graphite, with a 2-finger gripper and cable dress pack.
 * Joints: j1 (.y) j2 (.x) j3 (.x) j4 (.y roll of the forearm) j5 (.x) j6 (.y) → 'tool' (gripper, fingerA/fingerB slide .position.x). Default pose: reaching forward-down. */
export function industrialArmPro({pose = [0, -.35, 1.2, 0, .9, 0]} = {}) {
  const W = MP.shell, D = MP.dark, G = MP.graphite, A = MP.alloy;
  const root = grp('industrialArm');
  root.add(at(cyl(.32, .34, .04, D, 'basePlate', 64), 0, .02, 0));
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; root.add(at(cyl(.014, .014, .02, A, null, 12), Math.cos(a) * .29, .05, Math.sin(a) * .29)); }
  root.add(at(slathe([[.27, .04], [.25, .1], [.2, .2], [.19, .3], [.2, .34]], W, 'base'), 0, 0, 0));
  root.add(seamRing(.195, .29));
  const j1 = grp('j1'); at(j1, 0, .34, 0); root.add(j1); j1.rotation.y = pose[0];
  j1.add(at(cyl(.2, .2, .03, D, null, 56), 0, .015, 0));
  // turret: cast body leaning to the shoulder axis
  j1.add(at(ext(roundPoly([[-.2, 0], [.2, 0], [.19, .22], [.1, .36], [-.12, .36], [-.2, .2]], .06), .34, W, 'turret', .03), 0, .03, 0, 0, Math.PI / 2, 0));
  const j2 = grp('j2'); at(j2, 0, .4, 0); j1.add(j2); j2.rotation.x = pose[1];
  j2.add(at(actuator(.15, .42, 'j2Motor', G), 0, 0, 0));
  // upper arm: long tapered cast link (side profile extruded)
  j2.add(at(ext(roundPoly([[-.13, -.05], [.13, -.05], [.1, .82], [-.1, .82]], .07), .2, W, 'upperArm', .035), 0, 0, 0, 0, Math.PI / 2, 0));
  j2.add(at(rbox(.004, .5, .14, .002, MP.seam), .1, .4, 0)); j2.add(at(rbox(.004, .5, .14, .002, MP.seam), -.1, .4, 0));
  j2.add(at(rbox(.012, .3, .05, .004, MP.accent, 'stripe'), .104, .45, 0));
  const j3 = grp('j3'); at(j3, 0, .82, 0); j2.add(j3); j3.rotation.x = pose[2];
  j3.add(at(actuator(.11, .34, 'j3Motor', G), 0, 0, 0));
  j3.add(at(ext(roundPoly([[-.12, -.08], [.16, -.08], [.16, .1], [-.12, .1]], .06), .24, W, 'elbowHousing', .03), 0, 0, 0, 0, Math.PI / 2, 0));
  const j4 = grp('j4'); at(j4, 0, .06, 0); j3.add(j4); j4.rotation.y = pose[3];
  j4.add(at(slathe([[.085, 0], [.08, .2], [.065, .5], [.06, .64]], W, 'forearm'), 0, 0, 0));
  j4.add(seamRing(.082, .08)); j4.add(seamRing(.07, .45));
  const j5 = grp('j5'); at(j5, 0, .68, 0); j4.add(j5); j5.rotation.x = pose[4];
  j5.add(at(actuator(.06, .15, 'j5Motor', G), 0, 0, 0));
  j5.add(at(rbox(.12, .1, .12, .04, W, 'wrist'), 0, .05, 0));
  const j6 = grp('j6'); at(j6, 0, .11, 0); j5.add(j6); j6.rotation.y = pose[5];
  j6.add(at(cyl(.045, .045, .025, A, 'flange', 40), 0, .012, 0));
  // tool: 2-finger gripper
  const tool = grp('tool'); at(tool, 0, .025, 0); j6.add(tool);
  tool.add(at(rbox(.1, .07, .07, .015, G, 'gripperBody'), 0, .035, 0));
  tool.add(at(rbox(.13, .016, .05, .006, A, 'rail'), 0, .078, 0));
  for (const [n, s] of [['fingerA', -1], ['fingerB', 1]]) { const f = grp(n); at(f, s * .03, .08, 0); tool.add(f);
    f.add(at(rbox(.018, .085, .04, .006, D), 0, .042, 0)); f.add(at(rbox(.008, .05, .036, .003, MP.rubber, 'pad' + n.slice(-1)), -s * .011, .055, 0)); }
  // dress pack: cable from base to the wrist (follows default pose roughly; static)
  root.add(tube([[.18, .3, -.12], [.22, .55, -.2], [.16, .95, -.2], [.06, 1.25, -.08]], .02, MP.rubber, 'cable'));
  return root;
}

// =====================================================================================================
/** pro/amr — warehouse autonomous mobile robot (1.2 × 0.8 × 0.32 m) with lift top. Nodes: body, liftPlate (.position.y +0.06 = lifted), lidarF/lidarB (dark glass windows), statusBar, bumper, wheelL/R. */
export function amrPro() {
  const root = grp('amr'); const body = grp('body'); root.add(body);
  body.add(at(rbox(1.2, .26, .8, .05, MP.shell2, 'chassis'), 0, .17, 0));
  body.add(at(rbox(1.21, .06, .81, .025, MP.dark, 'skirt'), 0, .06, 0));
  body.add(at(rbox(1.18, .004, .78, .002, MP.seam), 0, .26, 0));
  for (const z of [-1, 1]) { body.add(at(rbox(.5, .045, .012, .006, MP.glass, z > 0 ? 'lidarF' : 'lidarB'), 0, .13, z * .402));
    body.add(at(rbox(.9, .01, .006, .003, MP.accent, z > 0 ? 'statusBar' : 'statusBarB'), 0, .22, z * .403)); }
  for (const x of [-1, 1]) body.add(at(rbox(.012, .045, .5, .006, MP.glass, null), x * .602, .13, 0));
  body.add(at(rbox(1.22, .04, .1, .02, MP.rubber, 'bumper'), 0, .07, .38));
  const lift = grp('liftPlate'); at(lift, 0, .305, 0); root.add(lift);
  lift.add(at(rbox(1.0, .03, .66, .01, MP.alloy, 'top'), 0, 0, 0));
  for (let k = 0; k < 9; k++) lift.add(at(rbox(.96, .004, .02, .002, MP.graphite), 0, .016, -.3 + k * .075));
  body.add(at(rbox(.12, .03, .04, .01, MP.amber, 'estop'), .5, .29, .3));
  for (const s of [-1, 1]) { const w = grp(s < 0 ? 'wheelL' : 'wheelR'); at(w, s * .42, .06, 0); body.add(w); w.add(at(cyl(.06, .06, .05, MP.rubber, null, 32), 0, 0, 0, 0, 0, Math.PI / 2)); }
  return root;
}
/** pro/pallet + boxes — euro pallet with shrink-wrapped cartons. Nodes: pallet, load. */
export function palletLoad() {
  const g = grp('palletLoad'); const p = grp('pallet'); g.add(p);
  for (let k = 0; k < 5; k++) p.add(at(rbox(1.2, .022, .1, .004, MP.wood), 0, .133, -.35 + k * .175));
  for (const x of [-.55, 0, .55]) for (const z of [-.35, 0, .35]) p.add(at(rbox(.1, .078, .14, .006, MP.wood), x, .083, z));
  for (const z of [-.35, 0, .35]) p.add(at(rbox(1.2, .022, .1, .004, MP.wood), 0, .033, z));
  const load = grp('load'); g.add(load); const card = S(0xa9875c, .85);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) for (let l = 0; l < 3; l++) load.add(at(rbox(.39, .27, .39, .012, card), -.4 + i * .4, .29 + l * .275, -.2 + j * .4));
  load.add(at(rbox(1.22, .84, .82, .02, Object.assign(S(0xdfe6ee, .15), {transparent: true, opacity: .1}), 'wrap'), 0, .565, 0));
  return g;
}

// =====================================================================================================
/** pro/liquidHandler — automated lab workstation (1.3 × 0.75 × 0.95 m): alloy frame, glass hood, deck with 96-well plates, tip racks, tube racks; X/Y gantry with an 8-channel pipette head.
 * Nodes: gantryY (.position.z), carriage (.position.x), head (.position.y), tips (8 tips), deck, plate0..3, tipRack0/1, tubeRack0, hood (glass). */
export function liquidHandler() {
  const W = 1.3, Dp = .75, H = .95, A = MP.alloy, root = grp('liquidHandler');
  root.add(at(rbox(W, .28, Dp, .03, MP.shell, 'baseCabinet'), 0, .14, 0));
  root.add(at(rbox(W - .04, .004, .004, .002, MP.seam), 0, .2, Dp / 2 + .001));
  root.add(at(rbox(.24, .05, .004, .004, MP.glass, 'baseScreen'), .45, .17, Dp / 2 + .002));
  const deck = grp('deck'); at(deck, 0, .29, 0); root.add(deck);
  deck.add(at(rbox(W - .06, .02, Dp - .08, .006, A, 'deckPlate'), 0, 0, 0));
  // frame posts + top beams
  for (const x of [-1, 1]) for (const z of [-1, 1]) root.add(at(rbox(.04, H - .28, .04, .008, A), x * (W / 2 - .02), .28 + (H - .28) / 2, z * (Dp / 2 - .02)));
  for (const z of [-1, 1]) root.add(at(rbox(W, .05, .05, .01, A), 0, H, z * (Dp / 2 - .02)));
  for (const x of [-1, 1]) root.add(at(rbox(.05, .05, Dp, .01, A), x * (W / 2 - .02), H, 0));
  const hood = grp('hood'); root.add(hood);
  hood.add(at(rbox(W - .06, H - .32, .006, .002, MP.clear, 'glassFront'), 0, .28 + (H - .28) / 2, Dp / 2 - .02));
  for (const x of [-1, 1]) hood.add(at(rbox(.006, H - .32, Dp - .06, .002, MP.clear), x * (W / 2 - .02), .28 + (H - .28) / 2, 0));
  hood.add(at(rbox(W - .06, .006, Dp - .06, .002, MP.clear), 0, H + .02, 0));
  // labware: SBS footprint 0.128 × 0.085
  const plate96 = (name) => { const g = grp(name); g.add(at(rbox(.128, .014, .086, .003, MP.plate, 'body'), 0, .007, 0));
    const wells = []; for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) wells.push(new THREE.CylinderGeometry(.0035, .0035, .004, 12).translate(-.0495 + i * .009, .0145, -.0315 + j * .009));
    g.add(merged(wells, MP.seam, 'wells')); const liq = []; for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) if ((i * 7 + j * 3) % 5) liq.push(new THREE.CylinderGeometry(.0032, .0032, .002, 10).translate(-.0495 + i * .009, .0155, -.0315 + j * .009));
    g.add(merged(liq, MP.cap[(name.length) % 4], 'samples')); return g; };
  const tipRack = (name) => { const g = grp(name); g.add(at(rbox(.128, .05, .086, .004, MP.graphite, 'box'), 0, .025, 0));
    const t = []; for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) t.push(new THREE.CylinderGeometry(.0028, .0008, .05, 10).translate(-.0495 + i * .009, .07, -.0315 + j * .009));
    g.add(merged(t, Object.assign(S(0xeef0f2, .3), {transparent: true, opacity: .75}), 'tips')); return g; };
  const tubeRack = (name) => { const g = grp(name); g.add(at(rbox(.128, .04, .086, .004, MP.shell2, 'rack'), 0, .02, 0));
    for (let c = 0; c < 4; c++) { const tb = [], cp = []; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i + j) % 4 === c) { tb.push(new THREE.CylinderGeometry(.0055, .005, .07, 14).translate(-.05 + i * .02, .055, -.03 + j * .02)); cp.push(new THREE.CylinderGeometry(.0065, .0065, .012, 14).translate(-.05 + i * .02, .095, -.03 + j * .02)); }
      if (tb.length) { g.add(merged(tb, MP.liquid)); g.add(merged(cp, MP.cap[c])); } } return g; };
  const slots = [[-.45, .17], [-.25, .17], [-.05, .17], [.15, .17], [-.45, -.05], [-.25, -.05], [-.05, -.05], [.15, -.05], [.4, .1]];
  const items = [plate96('plate0'), plate96('plate1'), tipRack('tipRack0'), plate96('plate2'), tubeRack('tubeRack0'), plate96('plate3'), tipRack('tipRack1'), tubeRack('tubeRack1')];
  items.forEach((it, k) => { const [x, z] = slots[k]; deck.add(at(rbox(.14, .004, .098, .002, MP.graphite), x, .012, z)); deck.add(at(it, x, .014, z)); });
  // waste chute + shaker
  deck.add(at(rbox(.15, .08, .15, .01, MP.dark, 'waste'), .45, .05, -.15)); deck.add(at(cyl(.07, .07, .06, MP.shell2, 'shaker'), .42, .04, .17));
  // gantry: Y beam spans x, moves along z; carriage moves along x; head moves along y
  const gy = grp('gantryY'); at(gy, 0, H - .07, .05); root.add(gy);
  gy.add(at(rbox(W - .08, .07, .08, .012, MP.shell, 'beam'), 0, 0, 0));
  gy.add(at(rbox(W - .1, .006, .004, .002, MP.accent), 0, -.02, .041));
  const car = grp('carriage'); at(car, -.15, 0, .07); gy.add(car);
  car.add(at(rbox(.14, .12, .06, .012, MP.graphite, 'carriageBlock'), 0, -.02, 0));
  const head = grp('head'); at(head, 0, -.16, 0); car.add(head);
  head.add(at(rbox(.12, .16, .05, .01, MP.shell, 'headBody'), 0, 0, 0));
  head.add(at(rbox(.08, .02, .006, .003, MP.glass), 0, .03, .026));
  const tips = []; for (let k = 0; k < 8; k++) { head.add(at(cyl(.005, .005, .06, MP.alloy, 'channel' + k, 12), 0, -.11, -.0315 + k * .009)); tips.push(new THREE.CylinderGeometry(.0028, .0008, .05, 10).translate(0, -.165, -.0315 + k * .009)); }
  head.add(merged(tips, Object.assign(S(0xeef0f2, .3), {transparent: true, opacity: .8}), 'tips'));
  head.rotation.y = Math.PI / 2;
  return root;
}

// =====================================================================================================
/** pro/serviceRobot — restaurant / hotel service robot (1.25 m): round base, slim column, 3 tray shelves, tablet head (plane 'screen' → Hebrew UI). Nodes: tray0..2, screen, base, bumper. */
export function serviceRobot() {
  const root = grp('serviceRobot');
  root.add(at(slathe([[0, 0], [.25, .005], [.27, .06], [.26, .18], [.2, .24], [0, .25]], MP.shell, 'base'), 0, 0, 0));
  root.add(at(mesh(new THREE.TorusGeometry(.268, .012, 10, 64), MP.rubber, 'bumper'), 0, .07, 0, Math.PI / 2));
  root.add(at(rbox(.16, .03, .01, .01, MP.glass, 'sensorWindow'), 0, .15, .262));
  root.add(at(cyl(.06, .07, .9, MP.shell2, 'column'), 0, .68, -.05));
  for (let k = 0; k < 3; k++) { const t = grp('tray' + k); at(t, 0, .45 + k * .26, .04); root.add(t);
    t.add(at(cyl(.22, .22, .018, MP.shell, null, 64), 0, 0, 0)); t.add(at(new THREE.Mesh(new THREE.TorusGeometry(.22, .006, 8, 64), MP.graphite), 0, .012, 0, Math.PI / 2));
    t.add(at(rbox(.06, .02, .12, .006, MP.graphite), 0, 0, -.16)); }
  const hd = grp('head'); at(hd, 0, 1.18, 0); root.add(hd);
  hd.add(at(rbox(.3, .2, .035, .02, MP.shell, 'headShell'), 0, 0, 0, -.25));
  const sc = mesh(new THREE.PlaneGeometry(.27, .17), MP.glass, 'screen'); sc.userData.aspect = 27 / 17; at(sc, 0, .004, .019, -.25); hd.add(sc);
  return root;
}
/** pro/espressoBar — cafe counter (2.2 m) with stone top, espresso machine, grinder, cups; a robot-arm barista mounts on 'armMount'. Nodes: machine, portafilter, cup0..5, armMount. */
export function espressoBar() {
  const root = grp('espressoBar');
  root.add(at(rbox(2.2, .95, .7, .02, MP.graphite, 'counter'), 0, .475, 0));
  for (let k = 0; k < 11; k++) root.add(at(rbox(.006, .9, .004, .002, MP.seam), -1.0 + k * .2, .47, .352));
  root.add(at(rbox(2.26, .05, .76, .01, MP.stone, 'top'), 0, .975, 0));
  const m = grp('machine'); at(m, .45, 1.0, -.12); root.add(m);
  m.add(at(rbox(.62, .42, .45, .03, MP.alloy, 'machineBody'), 0, .21, 0));
  m.add(at(rbox(.6, .04, .43, .01, MP.dark), 0, .44, 0));
  for (const x of [-.15, .15]) { m.add(at(cyl(.035, .04, .06, MP.alloy, null, 32), x, .25, .23)); const pf = grp(x < 0 ? 'portafilter' : 'portafilter2'); at(pf, x, .2, .26); m.add(pf);
    pf.add(at(cyl(.035, .03, .03, MP.alloy, null, 32), 0, 0, 0)); pf.add(at(cyl(.008, .01, .14, MP.dark, null, 16), 0, -.005, .08, Math.PI / 2)); }
  m.add(at(rbox(.5, .02, .14, .005, MP.alloy, 'dripTray'), 0, .02, .26));
  for (const x of [-.22, .22]) m.add(at(cyl(.006, .006, .16, MP.alloy, null, 12), x * 1.2, .28, .22, .5));
  const gr = grp('grinder'); at(gr, -.05, 1.0, -.15); root.add(gr);
  gr.add(at(rbox(.16, .3, .2, .02, MP.dark), 0, .15, 0)); gr.add(at(slathe([[.03, 0], [.07, .06], [.08, .16], [0, .17]], MP.clear), 0, .3, 0));
  for (let k = 0; k < 6; k++) { const c = grp('cup' + k); at(c, -.8 + (k % 3) * .16, 1.0, .12 + Math.floor(k / 3) * .14); root.add(c);
    c.add(slathe([[0, 0], [.03, .002], [.042, .05], [.045, .09], [.043, .092]], MP.ceramic)); c.add(at(cyl(.04, .04, .004, MP.coffee, 'coffee' + k), 0, .078, 0));
    c.add(at(new THREE.Mesh(new THREE.TorusGeometry(.016, .005, 8, 20), MP.ceramic), .05, .05, 0)); c.add(at(cyl(.07, .07, .006, MP.ceramic, null, 32), 0, .003, 0)); }
  const mount = grp('armMount'); at(mount, -.55, 1.0, -.2); root.add(mount); mount.add(at(cyl(.15, .15, .02, MP.dark, null, 48), 0, .01, 0));
  return root;
}

// =====================================================================================================
/** pro/robotaxi — generic autonomous electric car (4.6 m), car-paint body with glass greenhouse, roof sensor crown with lidar, cameras, wheels with alloy rims. Nodes: body, glass, lidar/lidarHead, cam0..5, wheel0..3, headL/R, tailBar. */
export function robotaxiPro() {
  const root = grp('robotaxiPro'); const body = grp('body'); root.add(body);
  const paint = S(0xe9ebee, .3, .2);
  // side profile, extruded across width with big bevel = rounded body
  const prof = roundPoly([[-2.3, .32], [2.25, .32], [2.32, .55], [2.2, .78], [1.0, .9], [.5, 1.38], [-1.05, 1.42], [-1.95, 1.0], [-2.3, .85]], .12, 6);
  body.add(at(ext(prof, 1.72, paint, 'shell', .14), 0, 0, 0, 0, -Math.PI / 2, 0));
  const gl = roundPoly([[.9, .93], [.45, 1.36], [-1.0, 1.4], [-1.85, 1.0], [-1.75, .95]], .06, 4);
  body.add(at(ext(gl, 1.74, MP.glass, 'glass', .1), 0, .005, 0, 0, -Math.PI / 2, 0));
  body.add(at(rbox(1.76, .14, 4.5, .06, MP.dark, 'rocker'), 0, .36, 0));
  body.add(at(rbox(1.5, .05, .02, .01, MP.glass, 'headBar'), 0, .62, 2.3));
  body.add(at(rbox(1.5, .045, .02, .01, S(0x8a1b1b, .3), 'tailBar'), 0, .82, -2.3));
  for (const [n, x] of [['headL', -.62], ['headR', .62]]) body.add(at(rbox(.32, .05, .02, .02, S(0xeef2f7, .1), n), x, .7, 2.27, -.3));
  // roof sensor crown
  body.add(at(rbox(1.15, .08, .9, .04, MP.shell2, 'crown'), 0, 1.47, -.3));
  const lid = grp('lidar'); at(lid, 0, 1.51, -.15); body.add(lid);
  lid.add(at(cyl(.11, .12, .05, MP.dark, null, 48), 0, .025, 0)); const lh = grp('lidarHead'); at(lh, 0, .05, 0); lid.add(lh);
  lh.add(at(cyl(.09, .1, .12, MP.glass, null, 48), 0, .06, 0)); lh.add(at(cyl(.1, .1, .02, MP.shell2, null, 48), 0, .13, 0));
  [[.5, 1.48, .1], [-.5, 1.48, .1], [.55, 1.48, -.7], [-.55, 1.48, -.7]].forEach((p, i) => body.add(at(rbox(.1, .07, .1, .025, MP.dark, 'cam' + i), ...p)));
  for (const [i, s] of [[4, -1], [5, 1]]) body.add(at(rbox(.04, .08, .14, .02, MP.dark, 'cam' + i), s * .92, 1.0, 1.0));
  // wheels: tyre + alloy rim with spokes
  [[2, .82, 1.45], [3, -.82, 1.45], [0, .82, -1.45], [1, -.82, -1.45]].forEach(([i, x, z]) => { const w = grp('wheel' + i); at(w, x, .36, z); root.add(w);
    w.add(at(slathe([[.2, -.12], [.33, -.115], [.36, -.06], [.36, .06], [.33, .115], [.2, .12]], MP.rubber, null, 16, 48), 0, 0, 0, 0, 0, Math.PI / 2));
    w.add(at(cyl(.22, .22, .2, MP.dark, null, 40), 0, 0, 0, 0, 0, Math.PI / 2));
    const sg = []; for (let k = 0; k < 6; k++) sg.push(new THREE.BoxGeometry(.012, .2, .045).translate(0, .11, 0).rotateX(k / 6 * Math.PI * 2));
    w.add(at(merged(sg, MP.alloy), Math.sign(x) * .105, 0, 0)); w.add(at(cyl(.05, .05, .02, MP.alloy, null, 24), Math.sign(x) * .11, 0, 0, 0, 0, Math.PI / 2)); });
  return root;
}

// ---------- general pro additions (Media 2026-11-20 run 12, Ziv: "add general things") ----------
/** eVTOL air taxi (generic, 4 seats): fuselage, canopy glass, high wing + V-tail, 6 tilt-rotor pods ('tilt0..5' rotate .x 0 → −π/2 for cruise; 'rotor0..5' spin .y with see-through 'disc{i}'), skids. ~12 m span. Faces +z. */
function evtolPro() {
  const g = grp('evtol');
  const body = slathe([[0, -3.6], [.35, -3.3], [.75, -2.4], [.95, -1], [.95, .6], [.75, 1.8], [.4, 2.8], [0, 3.2]], MP.shell, 'fuselage', 30, 48);
  body.rotation.x = Math.PI / 2; body.scale.set(1.25, 1.2, 1.05); body.position.y = 1.45; g.add(body);
  const can = mesh(new THREE.SphereGeometry(.9, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2.1), MP.glass, 'canopy'); can.scale.set(1.1, .75, 2.0); can.position.set(0, 1.85, 1.45); g.add(can);
  for (const s of [-1, 1]) g.add(at(rbox(.02, .75, 1.0, .01, MP.seam, 'door'), s * .93, 1.35, .3));
  const wing = ext([[-6, 0], [6, 0], [5.6, -1.1], [-5.6, -1.1]], .16, MP.shell, 'wing'); wing.rotation.x = -Math.PI / 2; wing.position.set(0, 2.15, .2); g.add(wing);
  g.add(at(rbox(.5, .5, 1.3, .15, MP.shell2, 'pylon'), 0, 1.95, -.3));
  for (const s of [-1, 1]) { const t = rbox(.08, 1.5, 1.0, .04, MP.shell, 'tail'); t.rotation.set(-.35, 0, s * .6); t.position.set(s * .45, 2.0, -3.0); g.add(t); }
  const pods = [[-5.6, .2], [-3.2, .2], [-1.5, -2.6], [1.5, -2.6], [3.2, .2], [5.6, .2]];
  pods.forEach(([x, z], i) => { const tl = grp('tilt' + i); tl.position.set(x, 2.2, z + (i === 2 || i === 3 ? 0 : .5)); g.add(tl);
    if (i === 2 || i === 3) g.add(at(rbox(.22, .22, 3.2, .1, MP.shell2, 'boom'), x, 2.1, -1.2));
    tl.add(at(slathe([[0, -.6], [.17, -.4], [.19, .2], [.12, .55], [0, .65]], MP.shell2, 'nacelle', 12, 28), 0, 0, 0, Math.PI / 2));
    const r = grp('rotor' + i); r.position.set(0, .3, .1); tl.add(r); r.add(at(cyl(.09, .09, .1, MP.dark, null, 24), 0, 0, 0));
    for (let k = 0; k < 5; k++) { const b = rbox(1.25, .025, .14, .012, MP.graphite); b.position.set(Math.cos(k / 5 * Math.PI * 2) * .65, 0, Math.sin(k / 5 * Math.PI * 2) * .65); b.rotation.y = -k / 5 * Math.PI * 2; r.add(b); }
    const disc = mesh(new THREE.CircleGeometry(1.3, 48), Object.assign(S(0xdfe3ea, .6), {transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide}), 'disc' + i); disc.rotation.x = -Math.PI / 2; disc.castShadow = false; r.add(disc); });
  for (const s of [-1, 1]) { g.add(at(cyl(.05, .05, 3.2, MP.graphite, 'skid', 12), s * .7, .08, .2, Math.PI / 2)); for (const z of [-.6, 1]) g.add(at(cyl(.04, .04, 1.0, MP.graphite, null, 10), s * .62, .58, z, 0, 0, s * .2)); }
  g.add(at(rbox(.6, .03, .05, .01, MP.accent, 'navStripe'), 0, 1.0, 2.6));
  return g;
}
/** surgical robot (generic patient-side cart, 4 arms; no brand). arm i: 'a{i}j1' (.y), 'a{i}j2' (.x), 'a{i}j3' (.x), 'a{i}tool' (shaft + jaw). ~2.3 m. Faces +z. */
function surgicalPro() {
  const g = grp('surgicalRobot');
  g.add(at(rbox(1.0, .35, 1.2, .12, MP.shell2, 'base'), 0, .25, 0)); for (const [x, z] of [[-.4, -.5], [.4, -.5], [-.4, .5], [.4, .5]]) g.add(at(cyl(.07, .07, .06, MP.rubber, null, 20), x, .05, z, 0, 0, Math.PI / 2));
  g.add(at(slathe([[.2, 0], [.22, .6], [.18, 1.4], [.2, 1.55]], MP.shell, 'column', 12, 40), 0, .42, -.15));
  g.add(at(rbox(1.5, .18, .45, .08, MP.shell, 'boom'), 0, 2.05, .05)); g.add(at(rbox(.28, .1, .28, .05, MP.glass, 'boomCam'), 0, 1.92, .2));
  [-.6, -.2, .2, .6].forEach((x, i) => { const j1 = grp('a' + i + 'j1'); j1.position.set(x, 1.95, .1); j1.rotation.y = x * .25; g.add(j1);
    j1.add(at(actuator(.07, .1, null, MP.dark), 0, -.04, 0, 0, 0, Math.PI / 2));
    const j2 = grp('a' + i + 'j2'); j2.position.y = -.1; j1.add(j2); j2.rotation.x = .9; j2.add(limb(.06, .05, .55, MP.shell, 'a' + i + 'up'));
    const j3 = grp('a' + i + 'j3'); j3.position.y = -.55; j2.add(j3); j3.rotation.x = -1.6; j3.add(actuator(.055, .09, null, MP.dark)); j3.add(limb(.05, .04, .5, MP.shell2, 'a' + i + 'fore'));
    const tool = grp('a' + i + 'tool'); tool.position.y = -.5; j3.add(tool); tool.add(at(rbox(.07, .16, .07, .02, MP.graphite), 0, -.08, 0)); tool.add(at(cyl(.005, .005, .45, MP.alloy, 'shaft', 10), 0, -.38, 0)); tool.add(at(rbox(.012, .03, .008, .003, MP.alloy, 'jaw'), 0, -.62, 0));
    tool.add(at(cyl(.058, .058, .012, MP.accent, null, 24), 0, .01, 0)); });
  return g;
}
/** generic glass office tower (business-district feel, no real tower): curtain wall + mullions, lobby + canopy, setback crown, rooftop plant + mast. 30×30×120 m. Nodes: curtain, lobby, crown, plant. */
function officeTowerPro(h = 120) {
  const g = grp('officeTower'), W = 30, glass = S(0x1c2a38, .08, .6), mull = S(0x8d939b, .55, .45);
  g.add(at(rbox(W, h, W, 1.2, glass, 'curtain'), 0, h / 2, 0));
  const ms = []; for (let x = -W / 2; x <= W / 2 + .01; x += 1.5) for (const s of [-1, 1]) { ms.push(new THREE.BoxGeometry(.12, h, .25).translate(x, h / 2, s * (W / 2 + .05))); ms.push(new THREE.BoxGeometry(.25, h, .12).translate(s * (W / 2 + .05), h / 2, x)); }
  for (let y = 4.2; y < h; y += 3.9) for (const s of [-1, 1]) { ms.push(new THREE.BoxGeometry(W + .3, .35, .3).translate(0, y, s * (W / 2 + .08))); ms.push(new THREE.BoxGeometry(.3, .35, W + .3).translate(s * (W / 2 + .08), y, 0)); }
  g.add(merged(ms, mull, 'mullions'));
  g.add(at(rbox(W + 4, 7, W + 4, .5, S(0x2a2e34, .4, .5), 'lobby'), 0, 3.5, 0)); g.add(at(rbox(W + 6, .5, W + 6, .2, MP.shell2, 'canopy'), 0, 7.2, 0));
  g.add(at(rbox(W * .7, 10, W * .7, .8, glass, 'crown'), 0, h + 5, 0)); g.add(at(rbox(W * .72, .4, W * .72, .2, mull), 0, h + 10, 0));
  const pl = grp('plant'); pl.position.y = h; g.add(pl); for (let i = 0; i < 4; i++) pl.add(at(rbox(3, 2.2, 2.4, .2, MP.shell2), -W / 2 + 3 + (i % 2) * 4, 1.1, W / 2 - 3 - Math.floor(i / 2) * 3.2));
  pl.add(at(cyl(.15, .15, 12, mull, 'mast', 10), W / 2 - 3, 6, -W / 2 + 3));
  return g;
}

// ---------- pro additions for the pro-v3 reels (Media 2026-11-20 run 13: topic bank — humanoid battery, how a robot doesn't fall, servo, 'not a robot' on a phone) ----------
/** pro/humanoidXray — pro/humanoid + aligned insides for an x-ray shot (make the white shell see-through, insides stay solid).
 * torso: 'insides' → 'battery' (pack in the back, cell0..23 = 18650-style cells, 'bms' board), 'brain' (chest computer, 'brainLed'), 'imu' (small board with chip at the pelvis = balance sensor),
 * 'wire_*' tubes battery → shoulder/hip motors (userData.path = world-ish points in torso space for a pulse). Cells: scale .y or swap material to show charge draining. */
function humanoidXrayPro() {
  const h = humanoidPro(); h.name = 'humanoidXray';
  const torso = h.getObjectByName('torso'), pelvis = h.getObjectByName('pelvis');
  const ins = grp('insides'); torso.add(ins);
  const bat = grp('battery'); at(bat, 0, .3, -.15); ins.add(bat);
  bat.add(at(rbox(.25, .23, .062, .01, S(0x2b2f36, .6, .2), 'batteryCase'), 0, 0, 0));
  const cellM = S(0x3d6fd1, .35, .3), capM = S(0xb8bec6, .3, .9); let n = 0;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const cell = grp('cell' + n++); at(cell, -.1 + c * .04, -.08 + r * .054, 0); bat.add(cell);
    cell.add(cyl(.0175, .0175, .048, cellM, null, 18)); cell.add(at(cyl(.012, .012, .004, capM, null, 14), 0, .026, 0)); }
  bat.add(at(rbox(.22, .012, .05, .003, S(0x1f6b3a, .6), 'bms'), 0, .122, 0));
  const brain = grp('brain'); at(brain, 0, .3, .03); ins.add(brain);
  brain.add(rbox(.15, .1, .05, .008, S(0x22252b, .4, .6), 'brainBox'));
  for (let k = 0; k < 7; k++) brain.add(at(rbox(.004, .085, .02, .001, MP.alloy), -.06 + k * .02, 0, -.03));
  brain.add(at(rbox(.03, .006, .004, .002, MP.accent, 'brainLed'), .04, .035, .026));
  const imu = grp('imu'); at(imu, 0, .02, .02); pelvis.add(imu);
  imu.add(rbox(.045, .006, .035, .002, S(0x1f6b3a, .6), 'imuBoard')); imu.add(at(rbox(.014, .005, .014, .001, MP.dark, 'imuChip'), 0, .005, 0));
  const wm = S(0xd14b3d, .55);
  for (const [k, s] of [['L', -1], ['R', 1]]) {
    const pts = [[s * .08, .38, -.12], [s * .16, .44, -.06], [s * .24, .46, 0]]; ins.add(Object.assign(tube(pts, .005, wm, 'wire_shoulder' + k, 24), {userData: {path: pts}}));
    const pl = [[s * .06, .2, -.12], [s * .08, .02, -.06], [s * .095, -.17, 0]]; ins.add(Object.assign(tube(pl, .005, wm, 'wire_hip' + k, 24), {userData: {path: pl}}));
  }
  const pb = [[0, .38, -.12], [0, .34, -.04], [0, .3, .005]]; ins.add(Object.assign(tube(pb, .005, MP.accent, 'wire_brain', 16), {userData: {path: pb}}));
  return h;
}
/** pro/smartphone — generic modern phone (no brand): 0.072×0.150×0.008 m, glass front, alloy frame, 3-lens camera bump, side buttons.
 * 'screen' = plane in front (+z) for st.screen (userData.aspect = .48), 'frame', 'back', 'camBump', 'btnPower', 'btnVol'. Stands upright facing +z, bottom at y 0. */
function smartphonePro() {
  const g = grp('smartphone'), W = .072, H = .15, D = .008;
  g.add(at(rbox(W, H, D, .009, S(0x9da3ab, .3, .9), 'frame', 6), 0, H / 2, 0));
  g.add(at(rbox(W - .002, H - .002, .001, .0085, MP.glass, 'glassFront', 6), 0, H / 2, D / 2 - .0002));
  g.add(at(rbox(W - .002, H - .002, .001, .0085, S(0x30343b, .25, .2), 'back', 6), 0, H / 2, -D / 2 + .0002));
  const sc = mesh(new THREE.PlaneGeometry(W - .006, H - .006), S(0x05060a, .2), 'screen'); sc.userData.aspect = (W - .006) / (H - .006); sc.castShadow = false; at(sc, 0, H / 2, D / 2 + .0006); g.add(sc);
  const cb = grp('camBump'); at(cb, -.014, H - .02, -D / 2 - .0015); g.add(cb); cb.add(rbox(.03, .03, .003, .007, S(0x30343b, .2, .3)));
  [[-.006, .006], [.006, .006], [-.006, -.006]].forEach(([x, y], i) => { cb.add(at(cyl(.0045, .0045, .002, MP.alloy, null, 24), x, y, -.0018, Math.PI / 2)); cb.add(at(cyl(.0032, .0032, .0022, MP.glass, 'lens' + i, 24), x, y, -.002, Math.PI / 2)); });
  cb.add(at(cyl(.0015, .0015, .001, S(0xf0e6c8, .4), 'flash', 12), .006, -.006, -.0018, Math.PI / 2));
  g.add(at(rbox(.0015, .018, .003, .0007, MP.alloy, 'btnPower'), W / 2 + .0006, H * .68, 0));
  g.add(at(rbox(.0015, .03, .003, .0007, MP.alloy, 'btnVol'), -W / 2 - .0006, H * .7, 0));
  g.add(at(mesh(new THREE.CircleGeometry(.0018, 16), MP.dark, 'frontCam'), 0, H - .01, D / 2 + .0008));
  return g;
}
/** pro/servo — hobby/robot servo with a cutaway: case (front half 'caseFront' can be hidden for x-ray), output 'horn' (spin .z), gear train 'gear0..3' (spin .z, alternate directions, ratios 1 : 3 : 9 : 27),
 * 'motor' (small DC can, 'motorShaft' spin .z), 'pot' (potentiometer under the output = position sensor), 'board' (control PCB), 'cable' (3 wires, userData.path). ~0.04×0.04×0.02 m → scale up for close-ups. Faces +z, bottom at y 0. */
function servoPro() {
  const g = grp('servo'), cm = S(0x1b1d22, .5, .1);
  g.add(at(rbox(.04, .036, .02, .002, cm, 'caseBack'), 0, .018, -.0001));
  const front = rbox(.0405, .0365, .0102, .002, Object.assign(S(0x1b1d22, .5, .1), {transparent: true, opacity: 1}), 'caseFront'); at(front, 0, .018, .0052); g.add(front);
  g.add(at(rbox(.054, .0025, .02, .001, cm, 'mountTab'), 0, .028, 0));
  for (const s of [-1, 1]) g.add(at(cyl(.0018, .0018, .003, MP.seam, null, 10), s * .024, .028, 0));
  const gearM = S(0xe8e2d4, .45), gm2 = S(0xb8bec6, .3, .9);
  const gear = (R, teeth, t, m, name) => { const pts = []; for (let i = 0; i < teeth * 2; i++) { const a = i / (teeth * 2) * Math.PI * 2, r = i % 2 ? R : R * .86; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    const o = ext(pts, t, m, name, .0002); return o; };
  [[.01, .028, 30, .0085, 0], [-.004, .02, 22, .0065, 1], [.006, .012, 18, .0055, 0], [-.008, .009, 14, .004, 1]].forEach(([x, y, n, R, k], i) => {
    const o = gear(R, n, .0022, i === 0 ? gm2 : gearM, 'gear' + i); at(o, x, y, .004 + (i % 2) * .0025); g.add(o); });
  const horn = grp('horn'); at(horn, .01, .028, .013); g.add(horn); horn.add(at(cyl(.0042, .0042, .004, MP.white, null, 24), 0, 0, 0, Math.PI / 2));
  horn.add(at(rbox(.03, .006, .002, .003, MP.white, 'hornArm'), 0, 0, .0025));
  const mot = grp('motor'); at(mot, -.008, .012, -.002); g.add(mot); mot.add(at(cyl(.006, .006, .018, MP.alloy, null, 24), 0, 0, 0, Math.PI / 2));
  mot.add(at(cyl(.0007, .0007, .006, MP.alloy, 'motorShaft', 8), 0, 0, .011, Math.PI / 2));
  g.add(at(cyl(.005, .005, .004, S(0x3d6fd1, .5), 'pot', 20), .01, .028, -.004, Math.PI / 2));
  g.add(at(rbox(.034, .0012, .016, .0005, S(0x1f6b3a, .6), 'board'), 0, .003, 0));
  const cp = [[-.02, .006, 0], [-.035, .004, 0], [-.06, .0, .01]]; const cab = grp('cable'); cab.userData.path = cp; g.add(cab);
  [S(0x6b3a2a, .6), S(0xd14b3d, .6), S(0xe0a030, .6)].forEach((m, i) => cab.add(at(tube(cp, .0007, m, null, 16), 0, 0, (i - 1) * .0016)));
  return g;
}

export const KITPRO = {
  'pro/humanoid': humanoidPro, 'pro/quadruped': quadrupedPro, 'pro/industrialArm': () => industrialArmPro(), 'pro/amr': amrPro, 'pro/palletLoad': palletLoad,
  'pro/liquidHandler': liquidHandler, 'pro/serviceRobot': serviceRobot, 'pro/espressoBar': espressoBar, 'pro/robotaxi': robotaxiPro,
  'pro/evtol': evtolPro, 'pro/surgicalRobot': surgicalPro, 'pro/officeTower': () => officeTowerPro(),
  'pro/humanoidXray': humanoidXrayPro, 'pro/smartphone': smartphonePro, 'pro/servo': servoPro,
};
export const KITPRO_FN = Object.fromEntries(Object.entries(KITPRO).map(([k, v]) => [k.slice(4), v]));
export const PROH = {MP, S, mesh, at, grp, rbox, cyl, lathe, slathe, ext, roundPoly, limb, actuator, seamRing, tube};
