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
#brand{top:70px;display:flex;justify-content:center;align-items:center;gap:14px;direction:ltr;color:#fff;font:700 34px Rubik;opacity:.92;text-shadow:0 2px 12px #000}
#brand img{width:58px;height:58px;border-radius:50%}
#badge{position:absolute;top:150px;right:60px;padding:8px 22px;border-radius:30px;background:rgba(46,230,255,.16);border:2px solid #2ee6ff;color:#bff6ff;font:700 32px Rubik;direction:rtl;box-shadow:0 0 24px rgba(46,230,255,.35)}
#hook{top:215px;text-align:center;color:#fff;font:700 94px/1.2 Rubik;text-shadow:0 6px 30px rgba(0,0,0,.95),0 0 3px #000;padding:0 40px}
.pill{background:#2ee6ff;color:#04121f;border-radius:20px;padding:0 20px;text-shadow:none;box-shadow:0 0 40px rgba(46,230,255,.7)}
#cap{top:1290px;text-align:center;padding:0 60px;color:#fff;font:700 80px/1.3 Rubik;text-shadow:0 4px 18px rgba(0,0,0,.95),0 0 3px #000}
#cap span{display:inline-block;margin:0 9px}
#cap span.on{background:#2ee6ff;color:#04121f;border-radius:16px;padding:0 16px;text-shadow:none;transform:scale(1.07);box-shadow:0 0 30px rgba(46,230,255,.6)}
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
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  document.documentElement.lang = 'he'; document.documentElement.dir = 'rtl';
  const TL = await (await fetch('timeline.json')).json();
  const A = TL.segA, B = TL.segB, END = TL.end;
  const S = opts.scenes ? opts.scenes(A, B, END) : [0, END];
  const body = document.body;
  const c = el('<canvas id="c" width="1080" height="1920"></canvas>'); body.appendChild(c);
  const o = el('<canvas id="o" width="1080" height="1920"></canvas>'); body.appendChild(o);
  body.appendChild(el('<div id="vig" class="ov"></div>'));
  body.appendChild(el(`<div id="brand" class="ov"><img src="${ROOT}assets/logo.jpg"><span>Robotics Israel</span></div>`));
  if (opts.episode) body.appendChild(el(`<div id="badge">פרק #${opts.episode}</div>`));
  const hook = el(`<div id="hook" class="ov">${(opts.hook || []).map(l => `<div>${l}</div>`).join('')}</div>`); body.appendChild(hook);
  const chipsEl = el('<div id="chips"></div>'); body.appendChild(chipsEl);
  const extra = el('<div id="extra"></div>'); body.appendChild(extra);
  const follow = el(`<div id="follow"><div class="t">עקבו לעוד תוכן<br>וחדשות על רובוטים</div><div class="b"><img src="${ROOT}assets/logo.jpg">@robotics.israel</div></div>`); body.appendChild(follow);
  const capEl = el('<div id="cap" class="ov"></div>'); body.appendChild(capEl);
  const flash = el('<div id="flash" class="ov"></div>'); body.appendChild(flash);

  const renderer = new THREE.WebGLRenderer({canvas: c, antialias: true, preserveDrawingBuffer: true});
  renderer.setSize(W, H, false); renderer.setPixelRatio(1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(opts.bg ?? 0x05061a);
  const fog = new THREE.FogExp2(opts.fogColor ?? 0x070a24, opts.fog ?? 0.012); scene.fog = fog;
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = opts.env ?? 0.18;
  const cam = new THREE.PerspectiveCamera(55, W / H, 0.1, 800);
  const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), opts.bloom ?? 0.8, 0.5, opts.bloomThreshold ?? 0.55); composer.addPass(bloom); composer.addPass(new OutputPass());
  scene.add(new THREE.AmbientLight(0x7b7cff, opts.ambient ?? 0.4));
  const dl = new THREE.DirectionalLight(0xc8d0ff, opts.sun ?? 0.8); dl.position.set(-10, 30, 10); scene.add(dl);
  const ctx = o.getContext('2d');

  // ---------- models ----------
  const loader = new GLTFLoader(); const cache = {}; const mixers = [];
  /** load(name) e.g. 'robot/RobotExpressive' or 'city/building-small-a' -> {object, clips, play(name), mixer} */
  async function model(name, {scale = 1, anim = null} = {}) {
    if (!cache[name]) cache[name] = await loader.loadAsync(`${ROOT}assets/models/${name}.glb`);
    const g = cache[name]; const obj = SkeletonUtils.clone(g.scene); obj.scale.setScalar(scale);
    obj.traverse(m => { if (m.isMesh) { m.castShadow = false; m.frustumCulled = false; } });
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
  /** counter: animated number in a chip-like box at (x,y) */
  function counter(x, y, value, suffix, col = '#2ee6ff', al = 1, size = 80) { ctx.save(); ctx.globalAlpha = al; ctx.font = `700 ${size}px Rubik`; ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.fillStyle = '#fff'; ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.fillText(`${value}${suffix || ''}`, x, y); ctx.restore(); }

  // ---------- captions / chips ----------
  let capKey = '';
  function captions(t) {
    let ch = null; for (const c3 of TL.chunks) if (t >= c3.a && t < c3.b) { ch = c3; break; }
    if (!ch) { capEl.innerHTML = ''; capKey = ''; return; }
    const k = ch.words.map(x => x.w).join(' '); if (k !== capKey) { capEl.innerHTML = ch.words.map(x => `<span>${x.w}</span>`).join(' '); capKey = k; }
    [...capEl.children].forEach((s, i) => { const w = ch.words[i]; s.className = (t >= w.a && t < w.b + 0.08) ? 'on' : ''; });
    const p = sm(ch.a, ch.a + 0.1, t); capEl.style.opacity = p; capEl.style.transform = `translateY(${(1 - p) * 24}px) scale(${0.94 + 0.06 * p})`;
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

  const hookEnd = opts.hookEnd ?? ((S[1] ?? 4) + 0.6);
  let frameFn = () => {};
  const api = {
    THREE, scene, cam, renderer, composer, bloom, fog, ctx, TL, A, B, S, END,
    model, neon, proj, bbox, detBox, tag, counter, rr, sm, win, camKF, V, COL, extra,
    sfx: (t, k) => SFX.push({t, k}),
    frame(fn) { frameFn = fn; },
    ready() { window.ready = true; },
  };
  window.renderAt = async function (t) {
    ctx.clearRect(0, 0, W, H); bloom.strength = opts.bloom ?? 0.8; renderer.toneMappingExposure = 1.1; fog.density = opts.fog ?? 0.012;
    updateMixers(t);
    const r = frameFn(t) || {};
    if (r.cp) { cam.position.copy(r.cp); cam.lookAt(r.ct); }
    if (r.fov) { cam.fov = r.fov; } else cam.fov = 55;
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    if (r.overlay) r.overlay(t);
    hook.style.opacity = 1 - sm(hookEnd - 0.4, hookEnd, t);
    let fl = 0; for (let i = 1; i < S.length - 1; i++) fl += 0.22 * Math.max(0, 1 - Math.abs(t - S[i]) * 9); flash.style.opacity = r.noFlash ? 0 : fl;
    const fa = A[A.length - 1]; follow.style.opacity = sm(fa - 0.1, fa + 0.3, t); follow.style.transform = `scale(${0.85 + 0.15 * sm(fa - 0.1, fa + 0.4, t)})`;
    captions(t); chips(t);
    composer.render(); await new Promise(res => requestAnimationFrame(() => res())); return true;
  };
  await document.fonts.ready;
  return api;
}
