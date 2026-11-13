// Biti Studio core: shared renderer, overlays, captions, chips, models and helpers.
// Every episode page imports this and only writes its own 3D world + camera per frame.
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';

export {THREE};
export const W = 1080, H = 1920;
export const COL = {cyan: 0x2ee6ff, pink: 0xff5fd2, orange: 0xffa53a, red: 0xff3355, purple: 0x6b5cff, navy: 0x05061a};
const ROOT = '/engine/';

// ---------- math helpers ----------
export const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
export const win = (t, a, b, f = 0.3) => Math.min(sm(a, a + f, t), 1 - sm(b - f, b, t));
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
/** keyframes: [[t,[px,py,pz],[tx,ty,tz]],...] -> eased camera position/target */
export function camKF(t, kfs) {
  for (let i = 1; i < kfs.length; i++) if (t <= kfs[i][0]) {
    const k = sm(kfs[i - 1][0], kfs[i][0], t);
    return [V(...kfs[i - 1][1]).lerp(V(...kfs[i][1]), k), V(...kfs[i - 1][2]).lerp(V(...kfs[i][2]), k)];
  }
  const l = kfs[kfs.length - 1]; return [V(...l[1]), V(...l[2])];
}
/** camPath: smooth continuous camera through keyframes [[t,[pos],[target]],...] (Catmull-Rom, never stops at a keyframe).
 *  Hero look (Ziv 2026-11-08, like grouper.explains): one world, the camera flies from object to object with constant zoom in/out instead of scene cuts. */
export function camPath(t, kfs) {
  const n = kfs.length; if (t <= kfs[0][0]) return [V(...kfs[0][1]), V(...kfs[0][2])]; if (t >= kfs[n - 1][0]) return [V(...kfs[n - 1][1]), V(...kfs[n - 1][2])];
  let i = 0; while (i < n - 2 && t > kfs[i + 1][0]) i++;
  const h = kfs[i + 1][0] - kfs[i][0], u = (t - kfs[i][0]) / h;
  // time-aware Hermite with clamped tangents: smooth and continuous, no overshoot after long flights
  const tan = (j, k) => { if (j <= 0 || j >= n - 1) return V(0, 0, 0); const pa = V(...kfs[j - 1][k]), pb = V(...kfs[j][k]), pc = V(...kfs[j + 1][k]);
    const ta = kfs[j][0] - kfs[j - 1][0], tc = kfs[j + 1][0] - kfs[j][0]; const m = pc.clone().sub(pa).divideScalar(ta + tc);
    const lim = Math.min(pb.distanceTo(pa) / ta, pc.distanceTo(pb) / tc) * 1.5; if (m.length() > lim) m.setLength(lim); return m; };
  const u2 = u * u, u3 = u2 * u, h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const hp = k => V(...kfs[i][k]).multiplyScalar(h00).add(tan(i, k).multiplyScalar(h10 * h)).add(V(...kfs[i + 1][k]).multiplyScalar(h01)).add(tan(i + 1, k).multiplyScalar(h11 * h));
  return [hp(1), hp(2)];
}
/** deterministic pseudo random */
export function rng(seed = 1) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// ---------- styles + DOM skeleton ----------
const CSS = `
@font-face{font-family:Rubik;src:url(${ROOT}assets/fonts/Rubik_700Bold.ttf);font-weight:700}
@font-face{font-family:Rubik;src:url(${ROOT}assets/fonts/Rubik_400Regular.ttf);font-weight:400}
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#04050c;font-family:Rubik}
canvas{position:absolute;inset:0;width:1080px;height:1920px}
.ov{position:absolute;left:0;right:0;pointer-events:none}
#vig{inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%)}
#brand{top:232px;display:flex;justify-content:center;align-items:center;gap:14px;direction:ltr;color:#fff;font:700 34px Rubik;opacity:.92;text-shadow:0 2px 12px #000}
#brand img{width:58px;height:58px;border-radius:50%}
#badge{padding:4px 18px;margin-left:6px;border-radius:30px;background:rgba(46,230,255,.16);border:2px solid #2ee6ff;color:#bff6ff;font:700 28px Rubik;direction:rtl;box-shadow:0 0 24px rgba(46,230,255,.35)}
#hook{top:322px;text-align:center;color:#fff;font:700 94px/1.2 Rubik;text-shadow:0 6px 30px rgba(0,0,0,.95),0 0 3px #000;padding:0 40px}
.pill{background:#2ee6ff;color:#04121f;border-radius:20px;padding:0 20px;text-shadow:none;box-shadow:0 0 40px rgba(46,230,255,.7)}
#cap{top:1290px;text-align:center;padding:0 60px;color:#fff;font:700 80px/1.3 Rubik;text-shadow:0 4px 18px rgba(0,0,0,.95),0 0 3px #000}
#cap span{display:inline-block;margin:0 1px;padding:0 16px;border-radius:16px}  /* fixed padding: highlight never reflows the line (no caption shake) */
#cap span.on{background:#2ee6ff;color:#04121f;text-shadow:none;box-shadow:0 0 30px rgba(46,230,255,.6)}
.chip{position:absolute;left:50%;padding:20px 40px;border-radius:28px;background:rgba(8,14,32,.84);border:3px solid #2ee6ff;color:#fff;font:700 58px Rubik;box-shadow:0 0 40px rgba(46,230,255,.45);white-space:nowrap;opacity:0}
.chip small{display:block;font:400 34px Rubik;color:#9fdcff;margin-top:4px}
.chip.red{border-color:#ff4d6d;box-shadow:0 0 50px rgba(255,77,109,.6)}
.chip.org{border-color:#ffa53a;box-shadow:0 0 40px rgba(255,165,58,.5)}
.chip.pnk{border-color:#ff5fd2;box-shadow:0 0 40px rgba(255,95,210,.5)}
.chip.grn{border-color:#7cffb0;box-shadow:0 0 40px rgba(124,255,176,.5)}
#flash{inset:0;background:#fff;opacity:0}
#follow{position:absolute;top:470px;left:0;right:0;text-align:center;opacity:0;color:#fff}
#follow .t{font:700 70px/1.25 Rubik;text-shadow:0 4px 24px #000}
#follow .b{display:inline-flex;align-items:center;gap:18px;margin-top:40px;padding:22px 50px;border-radius:60px;background:#2ee6ff;color:#04121f;font:700 58px Rubik;direction:ltr;box-shadow:0 0 60px rgba(46,230,255,.7)}
#follow .b img{width:72px;height:72px;border-radius:50%}
#cardfr{position:absolute;left:0;top:0;width:1080px;height:1920px;border-radius:0;border:0 solid rgba(190,200,255,.35);box-sizing:border-box;pointer-events:none;opacity:0}
#fbtn{position:absolute;left:50%;top:1110px;transform:translateX(-50%);padding:18px 64px;border-radius:60px;border:4px solid #fff;color:#fff;font:700 52px Rubik;direction:ltr;opacity:0;background:transparent}
`;
// ---------- CLASSIC style (default): same dark brand world, modern/classic finish — no glow, no neon edges, real lighting ----------
export const STYLE = new URLSearchParams(location.search).get('style') || 'classic'; // 2026-11-02 Ziv: classic is the house style (?style=neon for the old look)
export const CLASSIC = STYLE === 'classic';
const CSS_CLASSIC = `
#brand{text-shadow:0 2px 6px rgba(0,0,0,.6)}
#badge{background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.35);color:#e8ecff;box-shadow:none}
#hook{text-shadow:0 4px 14px rgba(0,0,0,.7)}
.pill{background:#2ee6ff;color:#04121f;box-shadow:none}
#cap{text-shadow:0 3px 10px rgba(0,0,0,.85)}
#cap span.on{background:#ffffff;color:#0b1022;box-shadow:none}
.chip{background:rgba(14,19,38,.92);border:2px solid rgba(255,255,255,.18);border-right:10px solid #2ee6ff;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.chip small{color:#aab4d6}
.chip.red{border-color:rgba(255,255,255,.18);border-right-color:#ff4d6d;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.chip.org{border-color:rgba(255,255,255,.18);border-right-color:#ffa53a;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.chip.pnk{border-color:rgba(255,255,255,.18);border-right-color:#ff5fd2;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.chip.grn{border-color:rgba(255,255,255,.18);border-right-color:#5fe39a;box-shadow:0 12px 30px rgba(0,0,0,.45)}
#follow .t{text-shadow:0 4px 14px rgba(0,0,0,.7)}
#follow .b{box-shadow:0 12px 30px rgba(0,0,0,.45)}
`;
// ---------- HERO look (Ziv approved 2026-11-07, workshop vs grouper.explains): opt-in with studio({look:'hero'}) — rollout from ep011 (12.11) ----------
// one hero object on a monochrome indigo stage, Hebrew UI inside the scene (st.screen), grouper-style captions (Ziv 2026-11-08): small white box, dark bold text, max 3 words, no highlight; accent = light blue HERO_ACC #8ea6ff. Matte, no glow.
const CSS_HERO = `
#cap{top:1270px;text-shadow:none;padding:0 24px;font:700 56px/1.2 Rubik}
#cap .box{display:inline-block;background:#fff;border-radius:16px;padding:10px 30px 14px;box-shadow:0 10px 26px rgba(0,0,0,.45);direction:rtl}
#cap span{color:#0a0c1c;padding:0 4px;margin:0}
#cap span.on{background:none;color:#0a0c1c;box-shadow:none}
#cap span.key{color:#f0502a}
.pill{background:#8ea6ff;color:#0a0c1c}
.chip{border-right-color:#8ea6ff}
`;
function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

/**
 * studio(opts)
 *  opts.episode   episode number (badge "פרק #N")
 *  opts.hook      array of 1-2 HTML lines for the opening title (use <span class="pill">word</span>)
 *  opts.hookEnd   seconds (render time) when the hook title fades out; default = S[1]+0.6
 *  opts.scenes    function(A,B,end)-> array of scene start times S (S[0]=0, last=end)
 *  opts.chips     function(A,B,S)-> [{a,b,y,c:'|red|org|pnk|grn',h:'html'}]
 *  opts.fog / opts.bg / opts.bloom
 */
export async function studio(opts = {}) {
  const HERO = CLASSIC && opts.look === 'hero';
  const st = document.createElement('style'); st.textContent = CSS + (CLASSIC ? CSS_CLASSIC : '') + (HERO ? CSS_HERO : ''); document.head.appendChild(st);
  document.documentElement.lang = 'he'; document.documentElement.dir = 'rtl';
  const TL = await (await fetch('timeline.json')).json();
  const A = TL.segA, B = TL.segB, END = TL.end;
  const S = opts.scenes ? opts.scenes(A, B, END) : [0, END];
  const body = document.body;
  const c = el('<canvas id="c" width="1080" height="1920"></canvas>'); body.appendChild(c);
  const o = el('<canvas id="o" width="1080" height="1920"></canvas>'); body.appendChild(o);
  body.appendChild(el('<div id="vig" class="ov"></div>'));
  body.appendChild(el(`<div id="brand" class="ov"><img src="${ROOT}assets/logo.jpg"><span>Robotics Israel</span>${opts.episode ? `<span id="badge">פרק #${opts.episode}</span>` : ''}</div>`));
  const hook = el(`<div id="hook" class="ov">${(opts.hook || []).map(l => `<div>${l}</div>`).join('')}</div>`); body.appendChild(hook);
  const chipsEl = el('<div id="chips"></div>'); body.appendChild(chipsEl);
  const extra = el('<div id="extra"></div>'); body.appendChild(extra);
  const follow = el(`<div id="follow"><div class="t">עקבו לעוד תוכן<br>וחדשות על רובוטים</div><div class="b"><img src="${ROOT}assets/logo.jpg">@robotics.israel</div></div>`); body.appendChild(follow);
  const cardfr = el('<div id="cardfr"></div>'); body.appendChild(cardfr);
  const fbtn = el('<div id="fbtn">Follow</div>'); body.appendChild(fbtn);
  const capEl = el('<div id="cap" class="ov"></div>'); body.appendChild(capEl);
  const flash = el('<div id="flash" class="ov"></div>'); body.appendChild(flash);

  const renderer = new THREE.WebGLRenderer({canvas: c, antialias: true, preserveDrawingBuffer: true});
  renderer.setSize(W, H, false); renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(HERO ? 0x0d0f2e : CLASSIC ? 0x0a0f22 : (opts.bg ?? 0x05061a));
  const fog = new THREE.FogExp2(HERO ? 0x0d0f2e : CLASSIC ? 0x0c1228 : (opts.fogColor ?? 0x070a24), CLASSIC ? 0.010 : (opts.fog ?? 0.012)); scene.fog = fog;
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = CLASSIC ? 0.45 : (opts.env ?? 0.18);
  // 2026-11-04 Ziv approved: real sky light (Poly Haven HDRI, CC0) in the classic look. opts.sky: 'night' (default) | 'sunset' | 'room' (old studio light)
  const SKY = {night: 'moonless_golf_1k', sunset: 'venice_sunset_1k'}; const sky = CLASSIC ? (opts.sky ?? 'night') : 'room';
  if (SKY[sky]) { const hdr = await new RGBELoader().loadAsync(`${ROOT}assets/hdri/${SKY[sky]}.hdr`); hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pm.fromEquirectangular(hdr).texture; hdr.dispose(); scene.environmentIntensity = opts.env ?? 1.4; }
  const cam = new THREE.PerspectiveCamera(55, W / H, 0.1, 800);
  const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), opts.bloom ?? 0.8, 0.5, opts.bloomThreshold ?? 0.55); composer.addPass(bloom); composer.addPass(new OutputPass());
  const HDRI = !!SKY[sky];
  scene.add(new THREE.AmbientLight(CLASSIC ? 0xb8c4ff : 0x7b7cff, CLASSIC ? (HDRI ? 0.15 : 0.35) : (opts.ambient ?? 0.4)));
  if (CLASSIC) { scene.add(new THREE.HemisphereLight(0xaab8ff, 0x0a0f22, HDRI ? 0.35 : 0.7)); const rim = new THREE.DirectionalLight(0x8fa2ff, 0.9); rim.position.set(15, 12, -25); scene.add(rim); }
  const dl = new THREE.DirectionalLight(CLASSIC ? 0xfff4e6 : 0xc8d0ff, CLASSIC ? 1.9 : (opts.sun ?? 0.8)); dl.position.set(-10, 30, 10); scene.add(dl); scene.add(dl.target);
  if (CLASSIC) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; dl.castShadow = true; dl.shadow.mapSize.set(2048, 2048);
    const sc = dl.shadow.camera; sc.left = sc.bottom = -30; sc.right = sc.top = 30; sc.near = 1; sc.far = 120; dl.shadow.bias = -0.0005; dl.shadow.radius = 4; }
  const ctx = o.getContext('2d');

  // ---------- models ----------
  const loader = new GLTFLoader(); const cache = {}; const mixers = [];
  /** load(name) e.g. 'robot/RobotExpressive' or 'city/building-small-a' -> {object, clips, play(name), mixer} */
  async function model(name, {scale = 1, anim = null} = {}) {
    if (!cache[name]) cache[name] = await loader.loadAsync(`${ROOT}assets/models/${name}.glb`);
    const g = cache[name]; const obj = SkeletonUtils.clone(g.scene); obj.scale.setScalar(scale);
    obj.traverse(m => { if (m.isMesh) { m.castShadow = CLASSIC; m.frustumCulled = false; } });
    const inst = {object: obj, clips: g.animations, mixer: null, actions: {}};
    if (g.animations.length) {
      inst.mixer = new THREE.AnimationMixer(obj); mixers.push(inst);
      for (const clip of g.animations) inst.actions[clip.name] = inst.mixer.clipAction(clip);
      inst.track = []; // [{a: startTime, name, fade}]
      /** schedule(name, startTime, fade) — deterministic animation timeline */
      inst.schedule = (n, a, fade = 0.25) => { inst.track.push({a, n, fade}); inst.track.sort((x, y) => x.a - y.a); return inst; };
      if (anim) inst.schedule(anim, 0, 0);
    }
    return inst;
  }
  /** prop(name, {h|fit, x, y, z, ry, tint, anim}) — place a library model (home/*, people/*, city/* ...) sized in metres.
   *  h: target height (m) · fit: [w, d] footprint to fit into · tint: colour multiplier (default .62 for home/ and people/ so Kenney pastels sit in our dark world; 1 = original).
   *  2026-11-04 Ziv approved: real furniture instead of boxes in home scenes + people in scenes. */
  async function prop(name, {h = null, fit = null, x = 0, y = 0, z = 0, ry = 0, tint = null, anim = null, scale = 1} = {}) {
    const m = await model(name, {anim}); const o = m.object; o.rotation.y = ry; o.scale.setScalar(scale);
    const size = () => new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3());
    if (fit) { const sz = size(); o.scale.multiplyScalar(Math.min(fit[0] / sz.x, fit[1] / sz.z)); }
    if (h) { o.scale.multiplyScalar(h / size().y); }
    const bb = new THREE.Box3().setFromObject(o); const c = bb.getCenter(new THREE.Vector3());
    o.position.set(x + o.position.x - c.x, y + o.position.y - bb.min.y, z + o.position.z - c.z);
    const k = tint ?? (/^(home|people)\//.test(name) ? 0.62 : 1);
    o.traverse(q => { if (q.isMesh) { q.castShadow = q.receiveShadow = true; if (k !== 1) { q.material = q.material.clone(); q.material.color.multiplyScalar(k); } } });
    scene.add(o); return m;
  }
  function updateMixers(t) {
    for (const m of mixers) {
      if (!m.track.length) continue;
      for (const a of Object.values(m.actions)) { a.enabled = false; a.setEffectiveWeight(0); }
      let cur = -1; for (let i = 0; i < m.track.length; i++) if (t >= m.track[i].a) cur = i;
      if (cur < 0) cur = 0;
      const set = (idx, w) => { const tr = m.track[idx]; const act = m.actions[tr.n]; if (!act) return; act.enabled = true; act.play(); act.setEffectiveWeight(w); act.time = Math.max(0, t - tr.a) % act.getClip().duration; };
      const tr = m.track[cur]; const k = tr.fade > 0 ? Math.min(1, Math.max(0, (t - tr.a) / tr.fade)) : 1;
      if (cur > 0 && k < 1) { set(cur - 1, 1 - k); set(cur, k); } else set(cur, 1);
      m.mixer.update(0);
    }
  }
  /** neon-ify a loaded model: keeps textures but adds emissive edge glow color */
  function neon(obj, color = COL.purple, edge = 0x9a8cff, emissive = 0.15) {
    if (CLASSIC) { obj.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return obj; }
    obj.traverse(m => {
      if (!m.isMesh) return;
      m.material = m.material.clone(); m.material.emissive = new THREE.Color(color); m.material.emissiveIntensity = emissive;
      if (edge != null) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), new THREE.LineBasicMaterial({color: edge, transparent: true, opacity: 0.55})); m.add(e); }
    });
    return obj;
  }

  // ---------- overlay drawing ----------
  function proj(v) { const p = v.clone().project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z]; }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function bbox(cx, cy, cz, sx, sy, sz) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, ok = false; for (const a of [-1, 1]) for (const b of [0, 1]) for (const c2 of [-1, 1]) { const [px, py, pz] = proj(V(cx + a * sx / 2, cy + b * sy, cz + c2 * sz / 2)); if (pz < 1 && pz > -1) { ok = true; x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); } } return ok ? [x0, y0, x1, y1] : null; }
  function detBox(b, label, col, al = 1) {
    if (!b) return; const [x0, y0, x1, y1] = b; if (x1 < 0 || x0 > W || y1 < 0 || y0 > H || x1 - x0 < 8) return;
    ctx.save(); ctx.globalAlpha = al; ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.shadowColor = col; ctx.shadowBlur = 18;
    const w = x1 - x0, h = y1 - y0, L = Math.min(w, h) * 0.3; ctx.beginPath();
    for (const [sx, sy, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { ctx.moveTo(sx + dx * L, sy); ctx.lineTo(sx, sy); ctx.lineTo(sx, sy + dy * L); }
    ctx.stroke(); ctx.fillStyle = col; ctx.globalAlpha = al * 0.12; ctx.fillRect(x0, y0, w, h); ctx.globalAlpha = al;
    if (label) { ctx.font = '700 36px Rubik'; ctx.direction = 'rtl'; const tw = ctx.measureText(label).width + 30; ctx.shadowBlur = 0; rr(x0, y0 - 58, tw, 50, 12); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = '#04121f'; ctx.textAlign = 'right'; ctx.fillText(label, x0 + tw - 15, y0 - 20); }
    ctx.restore();
  }
  function tag(x, y, label, col, al = 1) { ctx.save(); ctx.globalAlpha = al; ctx.font = '700 34px Rubik'; ctx.direction = 'rtl'; const tw = ctx.measureText(label).width + 28; rr(x - tw / 2, y - 26, tw, 52, 14); ctx.fillStyle = 'rgba(10,12,30,.85)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.shadowColor = col; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(label, x, y + 12); ctx.restore(); }
  /** callout (hero look, like grouper): white-bordered dark label at (x,y) with a thin leader line down to the object point (tx,ty). */
  function callout(x, y, label, tx, ty, al = 1, size = 46) { ctx.save(); ctx.globalAlpha = al; ctx.font = `700 ${size}px Rubik`; ctx.direction = 'rtl'; const tw = ctx.measureText(label).width + 56, th = size * 1.55;
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + th / 2); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.beginPath(); ctx.arc(tx, ty, 7, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    rr(x - tw / 2, y - th / 2, tw, th, 18); ctx.fillStyle = 'rgba(12,14,40,.92)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(label, x, y + size * .36); ctx.restore(); }
  /** counter: animated number in a chip-like box at (x,y) */
  function counter(x, y, value, suffix, col = '#2ee6ff', al = 1, size = 80) { ctx.save(); ctx.globalAlpha = al; ctx.font = `700 ${size}px Rubik`; ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.fillStyle = '#fff'; ctx.shadowColor = CLASSIC ? 'rgba(0,0,0,.7)' : col; ctx.shadowBlur = CLASSIC ? 12 : 30; ctx.fillText(`${value}${suffix || ''}`, x, y); if (CLASSIC) { ctx.shadowBlur = 0; ctx.fillStyle = col; ctx.fillRect(x - size * .9, y + size * .18, size * 1.8, size * .08); } ctx.restore(); }

  // ---------- captions / chips ----------
  let capKey = ''; const KEYS = new Set(opts.keys || []);  // hero: key words shown in grouper red #f0502a (Ziv 2026-11-08, like grouper's one coloured word)
  const CHUNKS = HERO ? TL.chunks.flatMap(c3 => { const out = [], n = c3.words.length, k = Math.ceil(n / 3); for (let i = 0; i < k; i++) { const ws = c3.words.slice(Math.round(i * n / k), Math.round((i + 1) * n / k)); out.push({a: i ? ws[0].a : c3.a, b: i < k - 1 ? c3.words[Math.round((i + 1) * n / k)].a : c3.b, words: ws}); } return out; }) : TL.chunks;
  function captions(t) {
    let ch = null; for (const c3 of CHUNKS) if (t >= c3.a && t < c3.b) { ch = c3; break; }
    if (!ch) { capEl.innerHTML = ''; capKey = ''; return; }
    const k = ch.words.map(x => x.w).join(' '); if (k !== capKey) { const inner = ch.words.map(x => `<span${KEYS.has(x.w.replace(/[.,!?:…"']/g, '')) && HERO ? ' data-k=1' : ''}>${x.w}</span>`).join(' '); capEl.innerHTML = HERO ? `<div class="box">${inner}</div>` : inner; capKey = k; }
    [...(HERO ? capEl.firstChild.children : capEl.children)].forEach((s, i) => { const w = ch.words[i]; s.className = s.dataset.k ? 'key' : (t >= w.a && t < w.b + 0.08) ? 'on' : ''; });
    const p = sm(ch.a, ch.a + 0.1, t); capEl.style.opacity = p; capEl.style.transform = 'none'; // calm captions: fade only (Ziv: no shake)
  }
  const CH = opts.chips ? opts.chips(A, B, S) : [];
  for (const ch of CH) { const d = document.createElement('div'); d.className = 'chip ' + (ch.c || ''); d.innerHTML = ch.h; d.style.top = (ch.y ?? 300) + 'px'; chipsEl.appendChild(d); ch.el = d; }
  function chips(t) { for (const ch of CH) { const op = win(t, ch.a, ch.b, 0.2); const p = sm(ch.a, ch.a + 0.3, t); ch.el.style.opacity = op; ch.el.style.transform = `translateX(-50%) scale(${0.7 + 0.3 * p + 0.07 * Math.sin(Math.min(1, Math.max(0, (t - ch.a) / 0.3)) * Math.PI)})`; } }

  // ---------- sfx cues (auto) ----------
  const SFX = [];
  for (let i = 1; i < S.length - 1; i++) SFX.push({t: S[i], k: 'whoosh'});
  for (const ch of CH) SFX.push({t: ch.a, k: 'blip'});
  SFX.push({t: A[A.length - 1], k: 'pop'});
  window.SFX = SFX;

  /** stage({r, grid, spot, target}) — hero look: matte indigo floor, faint matte grid, one soft spot light (real light + shadow, no bloom). */
  function stage({r = 30, grid = 4, floor = 0x1a1c4a, spot = [-.6, 2.4, 1.4], target = [0, 0, 0], power = 18, reach = 6} = {}) {
    const f = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshStandardMaterial({color: floor, roughness: .85})); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; scene.add(f);
    let g = null; if (grid) { g = new THREE.GridHelper(grid, grid * 4, 0x2c2f6e, 0x23265c); g.position.y = .002; scene.add(g); }
    let s2 = null; if (spot) { s2 = new THREE.SpotLight(0xffffff, power, reach, .5, .7); s2.position.set(...spot); s2.target.position.set(...target); s2.castShadow = true; s2.shadow.mapSize.set(1024, 1024); scene.add(s2, s2.target); }
    return {floor: f, grid: g, spot: s2};
  }
  /** screen(target, draw, {w, h, px, light}) — Hebrew UI on an in-scene screen. target = a mesh (e.g. prop.object.getObjectByName('screen')) or [width, height] in m for a new plane.
   *  draw(c, t, W, H) paints a canvas (RTL + right-aligned preset); call .update(t) each frame for live UI. light = how much the screen lights itself (matte, default .25 — no glow). */
  function screen(target, draw, {px = 1024, light = .25} = {}) {
    let m = target; let w = 1, h = 1;
    if (Array.isArray(target)) { [w, h] = target; m = new THREE.Mesh(new THREE.PlaneGeometry(w, h)); }
    else { m.geometry.computeBoundingBox(); const sz = m.geometry.boundingBox.getSize(new THREE.Vector3()); const a = [sz.x, sz.y, sz.z].sort((p, q) => q - p); w = a[0]; h = a[1]; if (m.userData.aspect) { w = m.userData.aspect; h = 1; } }
    const cv = document.createElement('canvas'); const ar = w / h; cv.width = ar >= 1 ? px : Math.round(px * ar); cv.height = ar >= 1 ? Math.round(px / ar) : px;
    const c = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    m.material = new THREE.MeshStandardMaterial({map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: light, roughness: .45});
    const update = (t = 0) => { c.save(); c.direction = 'rtl'; c.textAlign = 'right'; c.textBaseline = 'alphabetic'; draw(c, t, cv.width, cv.height); c.restore(); tex.needsUpdate = true; };
    update(0); return {mesh: m, canvas: cv, ctx: c, tex, update};
  }

  const hookEnd = opts.hookEnd ?? ((S[1] ?? 4) + 0.6);
  let frameFn = () => {};
  const api = {
    THREE, CLASSIC, STYLE, dl, scene, cam, renderer, composer, bloom, fog, ctx, TL, A, B, S, END,
    model, prop, stage, screen, HERO, HERO_ACC: 0x8ea6ff, neon, proj, bbox, detBox, tag, callout, counter, rr, sm, win, camKF, camPath, V, COL, extra,
    sfx: (t, k) => SFX.push({t, k}),
    frame(fn) { frameFn = fn; },
    ready() { window.ready = true; },
  };
  window.renderAt = async function (t) {
    ctx.clearRect(0, 0, W, H); bloom.strength = CLASSIC ? 0 : (opts.bloom ?? 0.8); bloom.enabled = !CLASSIC; renderer.toneMappingExposure = CLASSIC ? 1.0 : 1.1; fog.density = HERO ? (opts.fog ?? 0.05) : CLASSIC ? 0.009 : (opts.fog ?? 0.012);
    updateMixers(t);
    const r = frameFn(t) || {};
    if (r.cp) { cam.position.copy(r.cp); cam.lookAt(r.ct); if (CLASSIC) { dl.target.position.copy(r.ct); dl.position.copy(r.ct).add(V(-12, 30, 14)); dl.target.updateMatrixWorld(); } }
    if (r.fov) { cam.fov = r.fov; } else cam.fov = 55;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    if (r.overlay) r.overlay(t);
    hook.style.opacity = 1 - sm(hookEnd - 0.4, hookEnd, t);
    let fl = 0; for (let i = 1; i < S.length - 1; i++) fl += 0.22 * Math.max(0, 1 - Math.abs(t - S[i]) * 9); flash.style.opacity = r.noFlash ? 0 : fl;
    if (opts.outro === 'card') {
      // grouper-style ending (Ziv 2026-11-13): on the last spoken line the whole scene shrinks into a rounded card (scene keeps playing inside), a Follow button pops in (outline -> filled accent on "תעקבו")
      const la = A[A.length - 1], lb = B[B.length - 1], k = sm(la - 0.15, la + 0.35, t), f = sm(lb - 0.45, lb - 0.2, t);
      const sc = 1 - 0.38 * k, tf = `translateY(${-60 * k}px) scale(${sc})`, rad = `${70 * k / sc}px`;
      for (const cv of [c, o]) { cv.style.transform = tf; cv.style.borderRadius = rad; }
      cardfr.style.transform = tf; cardfr.style.borderRadius = rad; cardfr.style.borderWidth = `${3 * k / sc}px`; cardfr.style.opacity = k;
      fbtn.style.opacity = sm(la + 0.15, la + 0.45, t);
      fbtn.style.background = f > 0 ? `rgba(142,166,255,${f})` : 'transparent'; fbtn.style.borderColor = f > .5 ? '#8ea6ff' : '#fff'; fbtn.style.color = f > .5 ? '#0a0c1c' : '#fff';
      fbtn.style.transform = `translateX(-50%) scale(${1 + 0.08 * Math.sin(Math.PI * Math.min(1, f))})`;
      for (const id of ['vig', 'brand', 'chips', 'extra']) { const e = document.getElementById(id); if (e) e.style.opacity = 1 - k; }
    }
    const fa = opts.outro === 'short' ? END - 0.9 : A[A.length - 1]; if (opts.outro !== 'card') follow.style.opacity = sm(fa - 0.1, fa + 0.3, t); follow.style.transform = `scale(${0.85 + 0.15 * sm(fa - 0.1, fa + 0.4, t)})`;
    captions(t); chips(t);
    composer.render(); await new Promise(res => requestAnimationFrame(() => res())); return true;
  };
  await document.fonts.ready;
  return api;
}
