// Pro look kit for news slides (Media pro, 2026-11-20). Dark editorial studio, no glow.
// Tone: Bloomberg / The Verge product photography — one hero object, softbox reflections, real shadows, a hint of depth of field + film grain.
// Usage (engine/news/index.html, opt-in per slide: scene.look = 'studio' | 'cool' | 'warm'):
//   import * as LOOK from './look.js';
//   const L = LOOK.setup({THREE, renderer, scene, cam, composer, preset}); // replaces env/lights/floor/post
//   LOOK.pro(obj)                    // realistic PBR re-material of any library model (white satin polymer, brushed alloy, anodised dark metal, black glass, rubber)
//   LOOK.heroCam(cam, obj, {frac:.6, az:.5, el:.18, shift:.2}) // one object fills ~60% of the free upper area of the slide
//   L.focus(target)                  // depth of field focused on the hero
//   L.render()
// Everything here is our own code (CC0).
import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';

// ---------- presets: key softbox + two rim strips, colours of the light only (never on the objects) ----------
export const PRESETS = {
  studio: {key: 0xfff6ea, rimL: 0xdfe8ff, rimR: 0xdfe8ff, fill: 0x9aa6c8, bg: 0x07080c, sweep: 0x101115, floor: 0x0b0c10, exposure: 1.08, keyI: 240, rimI: 3.2},
  cool:   {key: 0xf2f6ff, rimL: 0x6f9bff, rimR: 0xa9c4ff, fill: 0x6c7fb0, bg: 0x05070d, sweep: 0x0d0f16, floor: 0x090b12, exposure: 1.0, keyI: 200, rimI: 4.0},
  warm:   {key: 0xffeedd, rimL: 0xffb46b, rimR: 0xcfdcff, fill: 0xa08f80, bg: 0x0a0808, sweep: 0x13110f, floor: 0x0d0b0a, exposure: 1.12, keyI: 260, rimI: 3.4},
};

/** studio environment for reflections: dark room + a big top softbox + two vertical strip boxes (only seen in reflections) */
function studioEnv(renderer, P) {
  const s = new THREE.Scene(); s.background = new THREE.Color(0x020203);
  const box = (w, h, c, k, pos, look) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide}));
    m.position.set(...pos); m.lookAt(...look); s.add(m); };
  box(6, 4, P.key, 6, [-2, 7, 4], [0, 0, 0]);          // big key softbox above-front-left
  box(.8, 7, P.rimL, 5, [-7, 3, -3], [0, 1, 0]);       // rim strip left-back
  box(.8, 7, P.rimR, 5, [7, 3, -3], [0, 1, 0]);        // rim strip right-back
  box(10, 1.2, 0xffffff, 1.2, [0, 1, 9], [0, 1, 0]);   // faint front bounce card
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({color: 0x050506})); floor.rotation.x = -Math.PI / 2; s.add(floor);
  const pm = new THREE.PMREMGenerator(renderer); const t = pm.fromScene(s, 0.02).texture; pm.dispose(); return t;
}

/** cyclorama: floor that bends up into a back wall (seamless studio sweep) */
function cyclorama(P, R = 4, depth = 9, width = 60, height = 18) {
  const sh = new THREE.Shape(); // profile in (z, y): front floor → curve → wall
  const pts = [new THREE.Vector2(14, 0), new THREE.Vector2(-depth + R, 0)];
  for (let k = 1; k <= 16; k++) { const a = k / 16 * Math.PI / 2; pts.push(new THREE.Vector2(-depth + R - Math.sin(a) * R, R - Math.cos(a) * R)); }
  pts.push(new THREE.Vector2(-depth, height));
  const geo = new THREE.BufferGeometry(); const pos = [], idx = [], nx = 2;
  for (const p of pts) for (let i = 0; i < nx; i++) pos.push((i - .5) * width, p.y, p.x);
  for (let j = 0; j < pts.length - 1; j++) { const a = j * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, c, b, b, c, d); }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color: P.sweep, roughness: .55, metalness: 0, side: THREE.DoubleSide}));
  m.receiveShadow = true; m.name = 'cyclorama'; return m;
}

/** procedural textures (canvas, CC0): fine noise for roughness, brushed streaks for alloy */
const TEX = {};
function noiseTex(kind = 'noise', size = 512) {
  if (TEX[kind]) return TEX[kind];
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); const im = g.createImageData(size, size);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const row = new Float32Array(size); for (let x = 0; x < size; x++) row[x] = rnd();
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let v = kind === 'brushed' ? .5 + (row[(x + (y * 0.02 | 0)) % size] - .5) * .5 + (rnd() - .5) * .12 : .5 + (rnd() - .5) * .35;
    v = Math.max(0, Math.min(1, v)) * 255; const o = (y * size + x) * 4; im.data[o] = im.data[o + 1] = im.data[o + 2] = v; im.data[o + 3] = 255; }
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(kind === 'brushed' ? 2 : 4, kind === 'brushed' ? 2 : 4);
  return (TEX[kind] = t);
}

// ---------- realistic material pass ----------
const hsl = {};
export const PRO = {
  satin: () => new THREE.MeshPhysicalMaterial({color: 0xd6d9de, roughness: .42, metalness: 0, clearcoat: .35, clearcoatRoughness: .35, roughnessMap: noiseTex()}),
  alloy: () => new THREE.MeshPhysicalMaterial({color: 0xa7acb4, roughness: .3, metalness: 1, roughnessMap: noiseTex('brushed'), anisotropy: .6}),
  anodised: () => new THREE.MeshPhysicalMaterial({color: 0x2a2d33, roughness: .38, metalness: .75, roughnessMap: noiseTex()}),
  graphite: () => new THREE.MeshPhysicalMaterial({color: 0x3a3e46, roughness: .5, metalness: .35, roughnessMap: noiseTex()}),
  rubber: () => new THREE.MeshStandardMaterial({color: 0x0f1013, roughness: .92, metalness: 0}),
  glass: () => new THREE.MeshPhysicalMaterial({color: 0x050608, roughness: .04, metalness: .1, clearcoat: 1, clearcoatRoughness: .02}),
  paint: (c) => new THREE.MeshPhysicalMaterial({color: c, roughness: .35, metalness: .5, clearcoat: 1, clearcoatRoughness: .08}),
  matte: (c) => new THREE.MeshStandardMaterial({color: c, roughness: .7, metalness: 0}),
  silhouette: () => new THREE.MeshStandardMaterial({color: 0x5b6070, roughness: .8, metalness: 0}), // abstract people
};
/** re-material any library model so it reads as a real product, not a toy.
 * opts.accent: keep accent stripes (default true, muted); opts.paint: body colour for vehicles (e.g. 0xd8dbe0); opts.people: true → faceless grey silhouettes */
export function pro(obj, opts = {}) {
  obj.traverse(m => {
    if (!m.isMesh) return; m.castShadow = m.receiveShadow = true; m.frustumCulled = false;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    const out = mats.map(src => {
      if (!src || src.map && /screen|plate|sign|art|board/i.test(m.name)) return src; // keep UI screens/labels
      if (src.transparent && src.opacity < .9) return src;                          // keep glass/frost
      if (opts.people) return PRO.silhouette();
      const c = (src.color || new THREE.Color(0x888888)).clone(); c.getHSL(hsl);
      const L = hsl.l, S = hsl.s, r = src.roughness ?? .5, mt = src.metalness ?? 0;
      let n;
      if (S > .6 && L > .3) n = opts.accent === false ? PRO.graphite() : PRO.matte(c.clone().lerp(new THREE.Color(0x9aa3b5), .35)); // accent: muted, matte
      else if (S > .18 && L > .12 && L < .85 && mt < .5) n = PRO.matte(c);                     // real coloured materials (wood, cardboard, caps, liquids)
      else if (r < .2 && L < .25) n = PRO.glass();
      else if (r > .8 && L < .2) n = PRO.rubber();
      else if (L > .62) n = opts.paint ? PRO.paint(opts.paint) : PRO.satin();
      else if (mt > .5 || (L > .35 && L <= .62)) n = PRO.alloy();
      else if (L < .14) n = PRO.anodised();
      else n = PRO.graphite();
      if (src.map) n.map = src.map;
      n.name = src.name; return n;
    });
    m.material = Array.isArray(m.material) ? out : out[0];
    if (m.geometry && !m.geometry.attributes.normal) m.geometry.computeVertexNormals();
  });
  return obj;
}

/** frame one hero object: it fills `frac` of the free upper part of the slide (text lives at the bottom).
 * frac = share of the free band (top..bottom px) the object's height fills.
 * az = orbit angle (rad, 0 = front), el = elevation (rad), fov from the camera. Returns {target, dist}. */
export function heroCam(cam, obj, {frac = .85, az = .55, el = .16, top = 150, bottom = 740, lift = 0, W = 1080, H = 1350} = {}) {
  // top/bottom = free band in slide pixels (under the top bar / stat, above the text block); the object is centred in it
  const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const band = (bottom - top) / H, shift = .5 - (top + bottom) / 2 / H;
  const tn = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
  const wide = Math.max(size.x, size.z * .7);
  const dist = Math.max(size.y / (frac * band * tn), wide / (.88 * tn * cam.aspect)) + Math.max(size.x, size.z) * .3;
  const t = c.clone(); t.y += lift;
  cam.position.set(t.x + Math.sin(az) * Math.cos(el) * dist, t.y + Math.sin(el) * dist, t.z + Math.cos(az) * Math.cos(el) * dist);
  cam.lookAt(t); cam.setViewOffset(W, H, 0, H * shift, W, H); cam.updateProjectionMatrix();
  return {target: t, dist};
}

// ---------- grain + vignette (sRGB, after tone mapping) ----------
const GrainVig = {
  uniforms: {tDiffuse: {value: null}, grain: {value: .045}, vig: {value: .55}, seed: {value: 1.7}},
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float grain, vig, seed; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - vec2(.5, .42); float v = smoothstep(.85, .25, length(d * vec2(1., .9)));
      c.rgb *= mix(1. - vig, 1., v); float n = h(vUv * 1350.) - .5; c.rgb += n * grain * (1. - c.rgb * .6); gl_FragColor = c; }`,
};

/** replace the slide's env/lights/floor/post with the pro studio. Removes existing lights + grid/ring/glow helpers. */
export function setup({renderer, scene, cam, composer, preset = 'studio', reflect = false, dof = true, ao = true, W = 1080, H = 1350}) {
  const P = PRESETS[preset] || PRESETS.studio;
  // clear previous lights + helpers
  const kill = []; scene.traverse(o => { if (o.isLight || o.isGridHelper) kill.push(o); });
  kill.forEach(o => o.parent && o.parent.remove(o));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = P.exposure;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.background = new THREE.Color(P.bg); scene.fog = new THREE.Fog(P.bg, 14, 34);
  scene.environment = studioEnv(renderer, P); scene.environmentIntensity = .9;
  // lights
  const key = new THREE.SpotLight(P.key, P.keyI, 30, .55, .9, 1.6); key.position.set(-3.2, 7.5, 5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 4; key.shadow.bias = -.0002; key.shadow.normalBias = .02; key.shadow.camera.near = 2; key.shadow.camera.far = 25;
  // rims: narrow spots from behind, aimed at the hero (edge light on the silhouette, not on the floor)
  const rimL = new THREE.SpotLight(P.rimL, P.rimI * 7, 30, .2, .7, 1.5), rimR = new THREE.SpotLight(P.rimR, P.rimI * 6, 30, .2, .7, 1.5);
  rimL.position.set(-5, 5, -6); rimR.position.set(5.5, 4, -5);
  const fill = new THREE.HemisphereLight(P.fill, 0x050506, .22);
  scene.add(key, key.target, rimL, rimL.target, rimR, rimR.target, fill);
  // floor + sweep
  const cyc = cyclorama(P); scene.add(cyc);
  let mirror = null;
  if (reflect) { // soft reflections: mirror just below a semi-transparent rough floor
    mirror = new Reflector(new THREE.PlaneGeometry(60, 30), {textureWidth: 1024, textureHeight: 1024, color: 0x1d1f24});
    mirror.rotation.x = -Math.PI / 2; mirror.position.set(0, -.002, 0); scene.add(mirror);
    cyc.material = new THREE.MeshStandardMaterial({color: P.sweep, roughness: .6, metalness: 0, transparent: true, opacity: .93, side: THREE.DoubleSide});
  }
  // post
  composer.passes.slice().forEach(p => composer.removePass(p));
  composer.addPass(new RenderPass(scene, cam));
  let gt = null; if (ao) { gt = new GTAOPass(scene, cam, W, H); gt.updateGtaoMaterial({radius: .35, distanceExponent: 1.4, thickness: 1, scale: 1.2, samples: 16}); gt.blendIntensity = .9; composer.addPass(gt); }
  let bokeh = null; if (dof) { bokeh = new BokehPass(scene, cam, {focus: 6, aperture: .0012, maxblur: .006}); composer.addPass(bokeh); }
  composer.addPass(new OutputPass());
  const gv = new ShaderPass(GrainVig); composer.addPass(gv);
  return {
    key, rimL, rimR, fill, cyc, mirror, P,
    /** aim the key light + DOF at the hero */
    focus(target) { const k = Math.max(1, cam.position.distanceTo(target) / 12); if (cam.far < cam.position.distanceTo(target) * 4) { cam.far = cam.position.distanceTo(target) * 4; cam.updateProjectionMatrix(); } key.distance = rimL.distance = rimR.distance = 30 * k; key.intensity = P.keyI * k ** 1.45; rimL.intensity = P.rimI * 7 * k ** 1.35; rimR.intensity = P.rimI * 6 * k ** 1.35; key.target.position.copy(target); key.position.copy(target).add(new THREE.Vector3(-3.2, 6.5, 5).multiplyScalar(k));
      rimL.target.position.copy(target); rimR.target.position.copy(target); rimL.position.copy(target).add(new THREE.Vector3(-4.5, 1.1, -4.5).multiplyScalar(k)); rimR.position.copy(target).add(new THREE.Vector3(4.8, .8, -4.2).multiplyScalar(k)); if (bokeh) bokeh.uniforms.focus.value = cam.position.distanceTo(target);
      if (scene.fog && scene.fog.isFog) { const d = cam.position.distanceTo(target); scene.fog.near = Math.max(14, d * 1.3); scene.fog.far = Math.max(34, d * 3); } },   // big heroes (eVTOL, towers) stay out of the fog
    aperture(a) { if (bokeh) bokeh.uniforms.aperture.value = a; },
    render() { composer.render(); },
  };
}
