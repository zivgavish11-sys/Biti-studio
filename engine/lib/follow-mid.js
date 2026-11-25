// Mid-video follow moment (Media pro 2026-11-25 run 17, Ziv's request): ~1.5 s, right after the twist, under the recorded line "עוד הסברים כאלה? תעקבו".
// A calm white card in the caption family (white, rounded, dark bold Rubik, one red key colour stays in the caption): Biti slot · @robotics.israel · a follow button that "gets pressed"
// (dark → light blue "✓ עוקבים"). Top band (y ≈ 330), so the subject in the middle third and the caption at y 1270 stay free. No glow, no shake: fade + 24 px rise only.
// Usage (in an episode, after studio()):
//   import {midFollow} from '/engine/lib/follow-mid.js';
//   const MF = midFollow(st, {at: 21.4});           // render-time second where the voice says "עוד הסברים כאלה?"
//   st.frame(t => { MF.update(t); ... });
// Version B (Ziv 2026-11-25, to choose from previews): timer:true → the subtitle becomes 'ההסבר ממשיך בעוד 1.24' (real remaining time, hundredths, tabular digits)
//   + a thin light-blue line along the card's bottom edge that drains to 0 — calm, inside the card, no big numbers, no 'skip' look.
// Options: dur 1.6 · top 330 · slot 'biti' (Biti's face, live) | 'logo' (page logo) | 'empty' (ring only — a 3D Biti flies next to it) · side 'right'|'left' (slot side) · press .55 (share of dur when the button turns).
import {bitiFace} from '/engine/props/fx-biti.js';
const css = `
#mf{position:absolute;left:0;right:0;display:flex;justify-content:center;pointer-events:none;opacity:0;z-index:6}
#mf .card{display:inline-flex;align-items:center;gap:26px;background:#fff;border-radius:30px;padding:18px 20px 18px 30px;box-shadow:0 14px 34px rgba(0,0,0,.45);direction:rtl}
#mf.l .card{flex-direction:row-reverse;padding:18px 30px 18px 20px}
#mf .slot{width:112px;height:112px;border-radius:50%;background:#070910;box-shadow:inset 0 0 0 5px #8ea6ff;overflow:hidden;flex:none}
#mf .slot canvas,#mf .slot img{position:static;inset:auto;width:112px;height:112px;display:block;border-radius:50%}
#mf .slot.empty{background:none;box-shadow:inset 0 0 0 4px #8ea6ff}
#mf .tx{display:flex;flex-direction:column;align-items:flex-start;gap:2px}
#mf .h{font:700 46px/1.1 Rubik;color:#0a0c1c;direction:ltr}
#mf .s{font:500 28px/1.2 Rubik;color:#5c6176}
#mf .btn{flex:none;font:700 42px/1 Rubik;padding:20px 38px 22px;border-radius:999px;background:#0a0c1c;color:#fff;white-space:nowrap}
#mf .btn.on{background:#8ea6ff;color:#0a0c1c}
#mf .card{position:relative;overflow:hidden}
#mf .s b{font:700 40px/1 Rubik;color:#0a0c1c;font-variant-numeric:tabular-nums;direction:ltr;display:inline-block;min-width:86px;margin-right:6px;text-align:left}
#mf .bar{position:absolute;left:30px;right:30px;bottom:0;height:6px;border-radius:3px;background:#8ea6ff;transform-origin:left center}`;
export function midFollow(st, {at, dur = 1.6, top = 330, slot = 'biti', side = 'right', press = .55, root = '/engine/', timer = false} = {}) {
  if (!document.getElementById('mfcss')) { const s = document.createElement('style'); s.id = 'mfcss'; s.textContent = css; document.head.appendChild(s); }
  const el = document.createElement('div'); el.id = 'mf'; el.className = 'ov' + (side === 'left' ? ' l' : ''); el.style.top = top + 'px';
  el.innerHTML = `<div class="card"><div class="slot${slot === 'empty' ? ' empty' : ''}">${slot === 'logo' ? `<img src="${root}assets/logo.jpg">` : slot === 'biti' ? '<canvas width="224" height="224"></canvas>' : ''}</div>
    <div class="tx"><div class="h">@robotics.israel</div><div class="s">${timer ? 'ההסבר ממשיך בעוד <b>0.00</b>' : 'קהילת הרובוטיקה של ישראל'}</div></div><div class="btn">+ עקבו</div>${timer ? '<div class="bar"></div>' : ''}</div>`;
  document.body.appendChild(el);
  const tb = el.querySelector('.s b'), bar = el.querySelector('.bar'); const card = el.querySelector('.card'), btn = el.querySelector('.btn'), cv = el.querySelector('canvas'), c = cv && cv.getContext('2d');
  const sm = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  function update(t) {
    const k = sm(at, at + .25, t) * (1 - sm(at + dur - .25, at + dur, t)); el.style.opacity = k; card.style.transform = `translateY(${(1 - sm(at, at + .3, t)) * 24}px)`;
    const tp = at + dur * press, pk = sm(tp - .1, tp, t) * (1 - sm(tp, tp + .12, t));
    btn.style.transform = `scale(${1 - .06 * pk})`; const on = t >= tp; btn.classList.toggle('on', on); btn.textContent = on ? '✓ עוקבים' : '+ עקבו';
    if (tb) { const rem = Math.max(0, Math.min(dur, at + dur - t)); tb.textContent = rem.toFixed(2); bar.style.transform = `scaleX(${rem / dur})`; }
    if (c && k > 0) bitiFace(c, t, 224, 224, {mood: t < tp ? 'smile' : 'happy', talk: t < tp ? .35 + .3 * Math.sin(t * 18) : 0});
  }
  return {el, update};
}
