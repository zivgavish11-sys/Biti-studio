// ep028-price kit (Media pro 2026-11-25): two generic humanoids for the price comparison — a child-height developer robot (agile, dark) and a human-height home robot in a soft knit suit —
// plus a drinking glass, a front door, and FX for joints / height lines / gentle grip. Built on pro/humanoid (our own CC0 design), no brand look-alikes. REAL colours.
// Export: python3 tools/make_props.py humanoidMini / humanoidSoft / everyday/glass / frontDoor
import * as THREE from 'three';
import {humanoidPro, PROH} from './kit-pro.js';
const {mesh, at, grp, rbox, cyl, lathe} = PROH;
const R = (color, rough = .6, metal = 0, extra = {}) => { const m = new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal, ...extra}); m.userData.real = true; return m; };
function knitTex(base = '#b9b2a6', line = '#a69e90') { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); c.fillStyle = base; c.fillRect(0, 0, 128, 128);
  c.strokeStyle = line; c.lineWidth = 3; for (let y = 0; y < 128; y += 10) for (let x = 0; x < 128; x += 12) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y + 8); c.lineTo(x + 12, y); c.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); t.colorSpace = THREE.SRGBColorSpace; return t; }
const swap = (root, fn) => root.traverse(m => { if (m.isMesh && m.material) { const n = fn(m); if (n) m.material = n; } });
const hx = m => m.material.color ? m.material.color.getHex() : -1;
/** mark every material REAL so pro-v3 keeps them exactly (load WITHOUT proLook robots:[...]) */
const realAll = root => { const seen = new Map(); root.traverse(m => { if (m.isMesh && m.material && !m.material.userData.real) { if (!seen.has(m.material)) { const c = m.material.clone(); c.userData.real = true; seen.set(m.material, c); } m.material = seen.get(m.material); } }); return root; };

/** **pro/humanoidMini** — child-height developer humanoid (1.3 m = pro/humanoid × .74), dark graphite + alloy, exposed actuators, light-blue accent; same joint names as pro/humanoid (pose it into a handstand / cartwheel with fx-ep028.js acrobat()). */
export function humanoidMini() {
  const g = humanoidPro(); g.name = 'humanoidMini'; const sh = R(0x3a3d44, .45, .35), sh2 = R(0x2a2c31, .5, .3);
  swap(g, m => { const h = hx(m); if (h === 0xe4e6ea) return sh; if (h === 0xc9ccd2) return sh2; if (h === 0x2ee6ff) return R(0x8ea6ff, .45); return null; });
  const s = grp('scaleRoot'); s.add(...g.children.slice()); s.scale.setScalar(.74); g.add(s); return realAll(g); }

/** **pro/humanoidSoft** — human-height home humanoid (1.75 m) in a soft knit suit (warm grey fabric over torso/arms/legs, dark face visor, light-blue chest line), hands bare graphite (5 fingers × 3 joints + thumb = 20+ joints per hand).
 * Same joints as pro/humanoid; all materials REAL → don't pass it to proLook robots:. Nodes as pro/humanoid ('face', 'torso', fingers f{L|R}{0..3}_{0..2}, thumb{L|R}_{0..1}). */
export function humanoidSoft() {
  const g = humanoidPro(); g.name = 'humanoidSoft'; const knit = R(0xffffff, 1, 0, {map: knitTex()}), knit2 = R(0xffffff, 1, 0, {map: knitTex('#8f887d', '#7d766b')});
  swap(g, m => { const h = hx(m); if (h === 0xe4e6ea) return knit; if (h === 0xc9ccd2) return knit2; if (h === 0x2ee6ff) return R(0x8ea6ff, .45); return null; });
  return realAll(g); }

/** **everyday/glass** — clear drinking glass (Ø 7 cm × 11 cm) with a little water; origin = bottom. */
export function glass() { const g = grp('glass');
  g.add(lathe([[0, 0], [.033, 0], [.036, .11], [.034, .11], [.031, .006], [0, .006]], R(0xdfe8ee, .05, 0, {transparent: true, opacity: .28, depthWrite: false}), 'glassBody', 48));
  g.add(at(cyl(.031, .03, .05, R(0xa9cde0, .05, 0, {transparent: true, opacity: .45}), 'water', 40), 0, .031, 0)); g.add(at(grp('gripSpot'), 0, .06, 0)); return g; }

/** **buildings/frontDoor** — Israeli apartment front door (security door, wood-look panels, handle + lock, peephole, door mat, white wall, number plate 'plate' → st.screen), 3 × 2.7 m wall, origin = floor at the door centre, front = +z. 'door' opens (.rotation.y, hinge at x −.45). Spot 'robotSpot' (1.1 m in front). */
export function frontDoor() { const g = grp('frontDoor'); const wall = R(0xf1ede6, .9);
  g.add(at(rbox(3, 2.7, .2, .01, wall, 'wall'), 0, 1.35, -.1)); g.add(at(rbox(1.0, 2.15, .06, .01, R(0x3b3a38, .5, .4), 'frame'), 0, 1.075, .0));
  const d = grp('door'); at(d, -.45, 0, .03); g.add(d); d.add(at(rbox(.9, 2.07, .05, .01, R(0x6f5440, .55), 'leaf'), .45, 1.05, 0));
  for (const y of [.55, 1.15, 1.75]) d.add(at(rbox(.7, .45, .012, .01, R(0x5e4636, .6)), .45, y, .028));
  d.add(at(rbox(.16, .03, .04, .012, R(0xc0c3c7, .3, .9), 'handle'), .78, 1.02, .05), at(cyl(.018, .018, .03, R(0xc0c3c7, .3, .9), 'lock', 20), .8, 1.12, .04, Math.PI / 2), at(cyl(.008, .008, .02, R(0x111111, .2, .5), 'peephole', 12), .45, 1.55, .03, Math.PI / 2));
  const pl = mesh(new THREE.PlaneGeometry(.2, .1), R(0xeeeeee, .4), 'plate'); pl.userData.aspect = 2; at(pl, .72, 1.75, .011); g.add(pl);
  g.add(at(rbox(.8, .015, .5, .01, R(0x5a5148, 1), 'mat'), 0, .008, .35)); g.add(at(rbox(3, .002, 2.5, .001, R(0xd7d0c4, .35), 'floor'), 0, 0, 1.2));
  g.add(at(grp('robotSpot'), 0, 0, 1.1)); return g; }
export const KIT028 = { 'pro/humanoidMini': humanoidMini, 'pro/humanoidSoft': humanoidSoft, 'everyday/glass': glass, 'buildings/frontDoor': frontDoor };
