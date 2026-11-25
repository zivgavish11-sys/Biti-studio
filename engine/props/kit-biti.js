// Biti — 3 design directions for the on-screen character (Media pro 2026-11-25 run 17, boss inbox: Ziv approved Biti back on screen; classy, a short guest, the subject stays the star).
// Generic designs (no look-alike of any film/brand robot), our own work → CC0. Real metres, y-up, facing +z. Colours are REAL (userData.real) → pro-v3 keeps them.
// Brand: pearl-white satin shell, champagne alloy trim, black-glass face, light-blue #8ea6ff eyes (matte-lit, no glow).
// Export: python3 tools/make_props.py biti   → engine/assets/models/robots/biti*.glb
import * as THREE from 'three';
import {PROH} from './kit-pro.js';
const {mesh, at, grp, rbox, cyl, slathe, limb, roundPoly, ext} = PROH;
const R = (color, rough = .5, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
export const BM = {
  pearl: R(0xf3f1ec, .32, .02), pearl2: R(0xe6e2da, .38, .02), champ: R(0xcdbfa6, .28, .85), graphite: R(0x2a2c31, .5, .35), glass: R(0x07090f, .06, .3),
  eye: R(0x8ea6ff, .4, 0, {emissive: 0x8ea6ff, emissiveIntensity: .55}), acc: R(0x8ea6ff, .45), hover: R(0x8ea6ff, .6, 0, {transparent: true, opacity: .14, depthWrite: false, side: THREE.DoubleSide}),
  rubber: R(0x18191c, .9),
};
/** face segment on a sphere of radius r (front = +z): horizontal span ph (rad), vertical span th (rad), centre lift dy (rad) */
const faceCap = (r, ph, th, dy, m, name) => mesh(new THREE.SphereGeometry(r, 64, 40, Math.PI / 2 - ph / 2, ph, Math.PI / 2 - th / 2 - dy, th), m, name);
/** two eyes sitting on a sphere surface: rounded pills, blink = .scale.y */
function eyes(parent, r, dx, y, w, h, z0 = 0) {
  for (const [n, s] of [['eyeL', 1], ['eyeR', -1]]) { const x = s * dx, z = Math.sqrt(Math.max(1e-4, r * r - x * x - y * y)) + z0;
    const e = mesh(new THREE.CapsuleGeometry(w / 2, Math.max(.001, h - w), 6, 20), BM.eye, n); e.scale.z = .35; at(e, x, y, z + .001, 0, Math.atan2(x, z), 0); parent.add(e); }
}

/** A — **robots/bitiOrb**: small hovering pebble, Ø 0.32 m. Origin = centre of the body (hover it ~1.3–1.6 m high, next to the subject).
 * Nodes: 'body' (bob/tilt), 'shell', 'face' (black glass band), **eyeL/eyeR** (blink .scale.y → .1; look = move 'eyes' group .position.x ±.01), 'ring' (champagne equator + light-blue line; slow spin .rotation.y),
 * 'earL/earR', **'pointer'** (thin arm on her right: .scale.x 0 → 1 = extend, aim with .rotation.z/.y; spot 'tip'), 'hoverDisc' (see-through light-blue disc under her, no glow). Spots faceSpot, tip. */
export function bitiOrb() {
  const g = grp('bitiOrb'), b = grp('body'); g.add(b); const r = .16;
  const sh = mesh(new THREE.SphereGeometry(r, 72, 56), BM.pearl, 'shell'); sh.scale.y = .94; b.add(sh);
  const face = faceCap(r * 1.006, 1.25, .62, -.08, BM.glass, 'face'); face.scale.y = .94; b.add(face);
  const ey = grp('eyes'); b.add(ey); eyes(ey, r * 1.006, .042, .028, .02, .034);
  const ring = grp('ring'); at(ring, 0, -.052, 0); b.add(ring);
  ring.add(at(mesh(new THREE.TorusGeometry(r * .985, .006, 12, 96), BM.champ), 0, 0, 0, Math.PI / 2));
  ring.add(at(mesh(new THREE.TorusGeometry(r * .99, .0022, 8, 96), BM.acc, 'ringLine'), 0, -.008, 0, Math.PI / 2));
  for (const [n, s] of [['earL', 1], ['earR', -1]]) { const e = grp(n); at(e, s * r * .93, .01, 0, 0, 0, s * Math.PI / 2); b.add(e);
    e.add(cyl(.036, .04, .02, BM.champ, null, 48)); e.add(at(cyl(.028, .028, .004, BM.graphite, null, 40), 0, .011, 0)); e.add(at(cyl(.006, .006, .003, BM.acc, null, 16), 0, .0135, 0)); }
  const p = grp('pointer'); at(p, -r * .9, -.03, .03, 0, -.35, -.35); b.add(p);   // her right side = −x (she faces +z)
  const arm = grp('pointerArm'); p.add(arm); arm.add(at(cyl(.005, .006, .13, BM.champ, null, 16), -.065, 0, 0, 0, 0, Math.PI / 2));
  arm.add(at(mesh(new THREE.SphereGeometry(.011, 24, 16), BM.pearl), -.135, 0, 0)); arm.add(at(mesh(new THREE.TorusGeometry(.011, .0018, 8, 32), BM.acc), -.128, 0, 0, 0, Math.PI / 2, 0));
  arm.add(at(grp('tip'), -.147, 0, 0));
  b.add(at(cyl(.045, .05, .01, BM.graphite, 'hoverPad', 40), 0, -r * .94 + .002, 0));
  const hd = at(cyl(.11, .11, .002, BM.hover, 'hoverDisc', 64), 0, -.24, 0); hd.castShadow = false; g.add(hd);
  g.add(at(grp('faceSpot'), 0, .02, r + .02));
  return g;
}

/** B — **robots/bitiPetite**: petite humanoid, 1.12 m, slim and calm (bell-shaped hip shell like a short A-line dress, long neck, big round head with a black-glass face).
 * Joints as pro/humanoid: pelvis, torso (.y twist), neck, head (nod .x, turn .y), shoulderL/R, elbowL/R, wristL/R (hands = soft mitten + thumb, 'handL/handR', spots 'gripL/gripR'), hipL/R, kneeL/R, ankleL/R.
 * Face: 'face', eyeL/eyeR (blink .scale.y). Accent: 'chestLine' (light blue), 'hem' line. Natural rest pose. Point: shoulderR.x −1.3, elbowR −.2. */
export function bitiPetite() {
  const P = BM.pearl, G = BM.graphite, C = BM.champ, root = grp('bitiPetite');
  const pelvis = grp('pelvis'); at(pelvis, 0, .52, 0); root.add(pelvis);
  const skirt = slathe([[.075, .06], [.1, .02], [.125, -.06], [.15, -.15], [.158, -.2]], Object.assign(P.clone(), {side: THREE.DoubleSide}), 'hipShell', 24, 64); skirt.scale.z = .82; pelvis.add(skirt);
  { const hem = at(mesh(new THREE.TorusGeometry(.158, .004, 8, 80), C, 'hem'), 0, -.2, 0, Math.PI / 2); hem.scale.y = .82; pelvis.add(hem); }
  const torso = grp('torso'); at(torso, 0, .06, 0); pelvis.add(torso);
  for (let k = 0; k < 3; k++) torso.add(at(cyl(.058 - k % 2 * .006, .058 - k % 2 * .006, .016, G, null, 40), 0, .008 + k * .016, 0));
  const chest = slathe([[0, .04], [.07, .045], [.095, .12], [.112, .2], [.1, .27], [.06, .3], [0, .305]], P, 'torsoShell', 24, 64); chest.scale.z = .74; torso.add(chest);
  torso.add(at(rbox(.05, .005, .004, .002, BM.acc, 'chestLine'), 0, .235, .083));
  const neck = grp('neck'); at(neck, 0, .3, 0); torso.add(neck); neck.add(at(cyl(.022, .028, .07, C, null, 32), 0, .035, 0));
  const head = grp('head'); at(head, 0, .07, 0); neck.add(head);
  const hs = mesh(new THREE.SphereGeometry(.125, 72, 56), P, 'headShell'); hs.scale.set(1.04, .92, .96); at(hs, 0, .115, 0); head.add(hs);
  const face = faceCap(.126, 1.5, .78, -.1, BM.glass, 'face'); face.scale.set(1.04, .92, .96); at(face, 0, .115, 0); head.add(face);
  const ey = grp('eyes'); at(ey, 0, .115, 0); head.add(ey); eyes(ey, .126 * .97, .042, .02, .022, .036); ey.children.forEach(e => e.position.z *= .96);
  for (const s of [-1, 1]) head.add(at(cyl(.026, .03, .014, C, null, 40), s * .128, .115, -.01, 0, 0, Math.PI / 2));
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) {
    const sh = grp('shoulder' + k); at(sh, s * .118, .255, 0); torso.add(sh); sh.rotation.z = s * .08;
    sh.add(mesh(new THREE.SphereGeometry(.032, 32, 20), G));
    sh.add(at(limb(.03, .025, .19, P, 'upperArm' + k), 0, -.01, 0));
    const el = grp('elbow' + k); at(el, 0, -.215, 0); sh.add(el); el.rotation.x = -.15; el.add(mesh(new THREE.SphereGeometry(.024, 24, 16), G));
    el.add(at(limb(.025, .021, .17, P, 'forearm' + k), 0, -.008, 0)); el.add(at(mesh(new THREE.TorusGeometry(.022, .0025, 8, 40), C), 0, -.17, 0, Math.PI / 2));
    const wr = grp('wrist' + k); at(wr, 0, -.188, 0); el.add(wr);
    const hand = rbox(.022, .07, .05, .011, BM.pearl2, 'hand' + k); at(hand, 0, -.04, 0); wr.add(hand);
    const th = rbox(.016, .035, .016, .007, BM.pearl2, 'thumb' + k); at(th, s * .0, -.022, .03, .5, 0, 0); wr.add(th);
    wr.add(at(grp('grip' + k), 0, -.06, .0));
  }
  for (const [s, k] of [[1, 'L'], [-1, 'R']]) {
    const hp = grp('hip' + k); at(hp, s * .055, -.08, 0); pelvis.add(hp); hp.add(at(limb(.04, .032, .2, G, 'thigh' + k), 0, 0, 0));
    const kn = grp('knee' + k); at(kn, 0, -.21, 0); hp.add(kn); kn.add(mesh(new THREE.SphereGeometry(.032, 24, 16), G));
    kn.add(at(limb(.036, .026, .2, P, 'shin' + k), 0, -.01, 0));
    const an = grp('ankle' + k); at(an, 0, -.215, 0); kn.add(an);
    const foot = rbox(.07, .035, .12, .017, P, 'foot' + k); at(foot, 0, -.02, .025); an.add(foot); an.add(at(rbox(.072, .006, .122, .003, BM.rubber), 0, -.039, .025));
  }
  return root;
}

/** C — **robots/bitiTile**: Biti as a face that lives on screens. A small floating glass tile (0.2 × 0.2 m, champagne rim) whose **'screen'** (aspect 1) shows her face —
 * draw it with fx-biti.js bitiFace(c, t, W, H, {mood, look, talk}) via st.screen. The same face can appear on any in-scene screen (TV 'screen', phone, robot chest, fridge, car cluster).
 * Nodes: 'tile', 'screen', 'rim', 'hoverDisc'. Origin = tile centre. */
export function bitiTile() {
  const g = grp('bitiTile'), t = grp('tile'); g.add(t); const w = .2;
  t.add(rbox(w + .012, w + .012, .016, .03, BM.champ, 'rim'));
  t.add(at(rbox(w, w, .018, .026, BM.glass, 'glassBody'), 0, 0, .001));
  const sc = mesh(new THREE.PlaneGeometry(w * .9, w * .9), R(0x07090f, .3), 'screen'); sc.userData.aspect = 1; at(sc, 0, 0, .0105); t.add(sc);
  t.add(at(rbox(.04, .006, .006, .003, BM.acc, 'tab'), 0, -w / 2 - .004, .004));
  const hd = at(cyl(.07, .07, .002, BM.hover, 'hoverDisc', 48), 0, -.2, 0); hd.castShadow = false; g.add(hd);
  return g;
}
export const KITBITI = { 'robots/bitiOrb': bitiOrb, 'robots/bitiPetite': bitiPetite, 'robots/bitiTile': bitiTile };
