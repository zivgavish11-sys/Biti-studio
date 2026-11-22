// "pro-v3" reel look (Ziv approved 2026-11-20, media proposals 1+2): the carousels' realistic look for reels — a REAL world (white plaster, wood, grass, asphalt, sea),
// real light (sky + sun outdoors, the carousel studio indoors), realistic robots (look.js pro()), people as calm grey silhouettes —
// while the brand stays: light-blue accent #8ea6ff on markers/rings/lines/pods, grouper captions and the red key word unchanged. No glow.
// Usage (one line after the scene is built, before st.ready()):
//   import {proLook} from '/engine/lib/look-pro.js';
//   const PL = await proLook(st, {mode: 'outdoor' | 'studio', preset: 'warm'|'cool'|'studio', robots: [bot], people: [kid, man], focus: V(x, y, z)});
//   exposure: outdoor only, e.g. .8 for bright white-plaster scenes (pool kit). in st.frame: PL.update(t, focusPoint?) (moves the sun shadow box / DOF with the camera target)
// Our own code → CC0.
import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import * as LOOK from '/engine/news/look.js';

const ACC = new Set([0x8ea6ff, 0x2ee6ff, 0xf0502a, 0x4f6fe0]);              // brand colours (+ deep blue 230V/force 2026-11-22; materials with userData.real are kept too) are never re-coloured
// hero-palette colours of our kits → real-world colours (tlv/*, citycorner/*, home2056/*, fx-tlv ground)
export const REAL = {
  0xc3c6f2: [0xf1ede6, .85], 0xaeb2ea: [0xe9e2d6, .85], 0x9a9fe2: [0xd8d0c3, .85], 0x6d74c4: [0x8b8680, .8], 0xd9dbf5: [0xf6f4ef, .75],
  0x14173f: [0x18222c, .08, .25], 0x1d2154: [0x22303b, .1, .25], 0x8a90dc: [0xb7babe, .5, .4], 0x23265a: [0x2c2c2f, .6], 0x7d83cf: [0xb8b1a6, .95], 0x8f95d8: [0xc6bfb3, .95],
  0x5b61b4: [0x8d6849, .7], 0x6a70bf: [0x9e7957, .7], 0xb3b8e6: [0xb9bdc3, .35, .8], 0x2b3a8f: [0x1b2a46, .2, .4], 0xd9ddf7: [0xeef0f2, .5],
  0x3d4799: [0x4d6b34, .9], 0x4a55aa: [0x5f7f3d, .9], 0x323d8c: [0x3d592b, .9], 0x4a4f9a: [0x6b5744, .9], 0x5560b4: [0x6e8c40, .85], 0x6b70b8: [0x8b7862, .9],
  0x1d1f4c: [0x3b3c40, .92], 0x5a5fae: [0xb8b0a3, .9], 0x4c519f: [0xa39a8d, .9], 0x9a9fe0: [0xd3cdc3, .8], 0x8a8fd6: [0xd9c8a2, .95],
  0x868ad0: [0xe4d4ad, .95], 0x7a7ec6: [0xd7c59c, .95], 0x6e74c6: [0xb8a27c, .6], 0xe3e5fa: [0xf3efe7, .85],
  0xe3e6f8: [0xeef0f3, .4], 0xc6cbef: [0xcbced4, .45], 0x2b2f6a: [0x2f3137, .5, .4], 0x101233: [0x111214, .9], 0x5d64b8: [0x9da5ae, .7], 0x4b52a8: [0x7f8792, .7], 0x2a2f78: [0x3e5269, .12, .35],
  0x2f3a86: [0x4f6d33, .95], 0x3d55c8: [0x2d6f93, .25, .1], 0xdfe3ff: [0xffffff, .8], 0x1a1c4a: [0x3b3c40, .92], 0x1a1c45: [0x3b3c40, .92], 0x2f3373: [0xb8b0a3, .9],
  0x3e4390: [0xe9e2d6, .85], 0x34397f: [0xddd5c8, .85], 0x474ca0: [0xf1ede6, .85], 0x6268bf: [0xf6f4ef, .75], 0x12143a: [0x18222c, .08, .25], 0x575dae: [0xc9c2b6, .8],
  0xe8ecff: [0xf2f2f2, .5],
};
const hx = c => c.getHex();   // sRGB hex (three converts from linear)
const near = (h) => { if (REAL[h]) return REAL[h]; let best = null, bd = 9e9; const r = h >> 16, g = (h >> 8) & 255, b = h & 255;
  for (const k of Object.keys(REAL)) { const K = +k, d = (r - (K >> 16)) ** 2 + (g - ((K >> 8) & 255)) ** 2 + (b - (K & 255)) ** 2; if (d < bd) { bd = d; best = REAL[K]; } } return bd < 900 ? best : null; };
/** recolour a hero-palette object to real-world materials (keeps screens with textures, transparent glass/discs and brand accents). Unknown indigo → warm neutral by brightness. */
export function realWorld(root) {
  root.traverse(m => { if (!(m.isMesh || m.isInstancedMesh)) return; const ms = Array.isArray(m.material) ? m.material : [m.material];
    const out = ms.map(src => { if (!src || !src.color || src.map || src.isShaderMaterial || (src.userData && src.userData.real)) return src; const h = hx(src.color);
      if (ACC.has(h)) return src; const t = near(h);
      if (src.transparent && src.opacity < .9 && !t) return src;
      let col, rough = .8, metal = 0;
      if (t) [col, rough = .8, metal = 0] = t; else { const L = src.color.r * .3 + src.color.g * .55 + src.color.b * .15; col = new THREE.Color(0xe9e2d8).multiplyScalar(Math.min(1, .22 + L * 1.3)).getHex(); }
      const n = new THREE.MeshStandardMaterial({color: col, roughness: rough, metalness: metal, transparent: src.transparent, opacity: src.opacity, side: src.side, depthWrite: src.depthWrite});
      return n; });
    m.material = Array.isArray(m.material) ? out : out[0];
    if (m.isInstancedMesh && m.instanceColor) { const c = new THREE.Color(); for (let i = 0; i < m.count; i++) { m.getColorAt(i, c); const L = c.r * .3 + c.g * .55 + c.b * .15; m.setColorAt(i, c.setScalar(Math.min(1, .35 + L * .8))); } m.instanceColor.needsUpdate = true; } });
  return root;
}
const GrainVig = {
  uniforms: {tDiffuse: {value: null}, grain: {value: .035}, vig: {value: .35}, seed: {value: 1.7}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float grain, vig, seed; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); float v = smoothstep(.9, .3, length((vUv - .5) * vec2(1., .8))); c.rgb *= mix(1. - vig, 1., v); c.rgb += (h(vUv * 1920.) - .5) * grain * (1. - c.rgb * .6); gl_FragColor = c; }`,
};
/** switch a built hero-look scene to pro-v3. */
export async function proLook(st, {mode = 'outdoor', preset = 'warm', robots = [], people = [], focus = null, sun = [-.55, .62, .45], haze = 0xd9e2ea, exposure = 1} = {}) {
  const {scene, renderer, cam, composer} = st;
  const skip = new Set([...robots, ...people]);
  scene.children.forEach(o => { if (!skip.has(o)) realWorld(o); });
  robots.forEach(o => { const keep = []; o.traverse(m => { if (m.isMesh && m.material && m.material.color && ACC.has(hx(m.material.color))) keep.push([m, m.material]); });
    LOOK.pro(o); keep.forEach(([m, mt]) => m.material = new THREE.MeshStandardMaterial({color: mt.color, roughness: .55, metalness: 0, transparent: mt.transparent, opacity: mt.opacity, side: mt.side})); });   // brand accent stays light blue
  people.forEach(o => LOOK.pro(o, {people: true}));
  // the hero stage floor/grid/spot are not part of a real world
  scene.traverse(o => { if (o.isGridHelper) o.visible = false; });
  if (mode === 'studio') {
    const L = LOOK.setup({renderer, scene, cam, composer, preset, W: 1080, H: 1920});
    if (focus) L.focus(focus);
    return {L, update(t, f) { if (f) L.focus(f); }};
  }
  // outdoor: physical sky (background + reflections) + sun with soft shadows + sky fill, light haze, grain/vignette (no bloom)
  const kill = []; scene.traverse(o => { if (o.isLight) kill.push(o); }); kill.forEach(o => o.parent && o.parent.remove(o));
  const sky = new Sky(); sky.scale.setScalar(4500); const U = sky.material.uniforms; U.turbidity.value = 4; U.rayleigh.value = 1.1; U.mieCoefficient.value = .004; U.mieDirectionalG.value = .8;
  const sd = new THREE.Vector3(...sun).normalize(); U.sunPosition.value.copy(sd);
  const envScene = new THREE.Scene(); envScene.add(sky.clone()); const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(envScene, .02).texture; pm.dispose();
  scene.add(sky); scene.background = null; scene.environmentIntensity = .55;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const S = new THREE.DirectionalLight(0xfff1de, 2.2); S.castShadow = true; S.shadow.mapSize.set(4096, 4096); S.shadow.bias = -.0003; S.shadow.normalBias = .03; S.shadow.radius = 3;
  scene.add(S, S.target); const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x8a7d6a, .45); scene.add(hemi);
  scene.fog = new THREE.Fog(haze, 260, 1400);
  composer.passes.slice().forEach(p => composer.removePass(p)); composer.addPass(new RenderPass(scene, cam)); composer.addPass(new OutputPass()); composer.addPass(new ShaderPass(GrainVig));
  // the shadow box follows what the camera looks at, sized to the view (sharp on a rooftop, wide over the city)
  function update(t, f) { renderer.toneMappingExposure = exposure; const tg = f || focus || new THREE.Vector3(); const dist = cam.position.distanceTo(tg); const R = Math.min(220, Math.max(8, dist * .9));
    const c = S.shadow.camera; c.left = c.bottom = -R; c.right = c.top = R; c.near = 1; c.far = R * 6 + 400; c.updateProjectionMatrix();
    S.target.position.copy(tg); S.position.copy(tg).addScaledVector(sd, R * 2 + 150); }
  update(0); return {sun: S, sky, update};
}
