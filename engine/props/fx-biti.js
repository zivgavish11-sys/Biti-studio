// Biti helpers (Media pro 2026-11-25 run 17; personality pass after Ziv chose the orb: "1, but with a bit of personality"). Our own code → CC0. No glow: matte-lit screens only.
// bitiFace(c, t, W, H, {mood, look, talk}) — Biti's face for ANY screen (the orb's 'face', a TV, a phone, the mid-follow slot). Works for square and wide (2:1) screens.
//   mood: 'smile' | 'happy' (^ ^) | 'wink' | 'curious' (one eye bigger) | 'surprise' (round eyes, o-mouth) | 'think' (looks up, mouth to the side) | 'calm'
//   look: [x, y] or x, −1..1 (eyes slide) · talk: 0..1 (mouth opens) · blinks by itself every ~3.2 s (not in happy/wink).
// orbRig(st, orb) → .update(t, {mood, look, talk, point, base}) — face on the orb's screen + body language per mood (tilt, ear fins, bounce, hover). One call per frame.
export const BITI_ACC = '#8ea6ff';
export function bitiFace(c, t, W, H, {mood = 'smile', look = 0, talk = 0, bg = true} = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.direction = 'ltr';
  if (bg) { const g = c.createRadialGradient(W / 2, H * .45, 0, W / 2, H / 2, Math.max(W, H) * .6); g.addColorStop(0, '#131a2e'); g.addColorStop(1, '#04060c'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  const [lx, ly] = Array.isArray(look) ? look : [look, 0];
  const S = Math.min(W, H) * (W > H * 1.4 ? 1.45 : 1), cx = W / 2 + lx * S * .07, cy = H * (W > H * 1.4 ? .4 : .44) - ly * S * .06;
  const ph = (t % 3.2) / 3.2, bl = ph > .955 && !['happy', 'wink'].includes(mood) ? Math.sin((ph - .955) / .045 * Math.PI) : 0;
  const ew = S * .11, dx = S * .17, lw = S * .034;
  c.fillStyle = c.strokeStyle = BITI_ACC; c.lineCap = 'round'; c.lineJoin = 'round';
  const pill = (x, h) => { h = Math.max(S * .02, h * (1 - .9 * bl)); c.beginPath(); c.roundRect(x - ew / 2, cy - h / 2, ew, h, ew / 2); c.fill(); };
  const arcEye = (x) => { c.lineWidth = lw * 1.25; c.beginPath(); c.arc(x, cy + S * .045, S * .07, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); };
  const L = cx - dx, R = cx + dx;
  if (mood === 'happy') { arcEye(L); arcEye(R); }
  else if (mood === 'wink') { pill(L, S * .2); c.lineWidth = lw * 1.25; c.beginPath(); c.moveTo(R - S * .06, cy + S * .01); c.quadraticCurveTo(R, cy - S * .03, R + S * .06, cy + S * .01); c.stroke(); }
  else if (mood === 'surprise') { for (const x of [L, R]) { c.beginPath(); c.ellipse(x, cy, S * .068, S * .085 * (1 - .9 * bl), 0, 0, Math.PI * 2); c.fill(); } }
  else if (mood === 'curious' || mood === 'ask') { pill(L, S * .25); pill(R, S * (mood === 'ask' ? .2 : .15)); c.lineWidth = lw * .9; c.beginPath(); c.moveTo(R - S * .06, cy - S * .13); c.lineTo(R + S * .06, cy - S * .16); c.stroke(); }
  else if (mood === 'think') { pill(L, S * .17); pill(R, S * .17); }
  else { const h = S * (mood === 'calm' ? .16 : .2); pill(L, h); pill(R, h); }
  // mouth
  const my = cy + S * .2; c.lineWidth = lw;
  if (talk > .05) { c.beginPath(); c.ellipse(cx, my, S * .055, S * .018 + S * .05 * talk, 0, 0, Math.PI * 2); c.fill(); }
  else if (mood === 'surprise') { c.beginPath(); c.ellipse(cx, my, S * .03, S * .038, 0, 0, Math.PI * 2); c.stroke(); }
  else if (mood === 'think') { c.beginPath(); c.moveTo(cx + S * .02, my); c.lineTo(cx + S * .09, my - S * .012); c.stroke(); }
  else if (mood === 'curious') { c.beginPath(); c.arc(cx + S * .02, my - S * .07, S * .07, Math.PI * .35, Math.PI * .65); c.stroke(); }
  else { const w = mood === 'calm' ? .06 : mood === 'happy' || mood === 'wink' ? .11 : .09; c.beginPath(); c.arc(cx, my - S * w, S * w * 1.25, Math.PI * .26, Math.PI * .74); c.stroke(); }
}
export function hover(o, t, {base = null, amp = .025} = {}) { if (!o.userData.base) o.userData.base = (base || o.position).clone(); const b = o.userData.base;
  o.position.y = b.y + Math.sin(t * 2.1) * amp; o.rotation.z = Math.sin(t * 1.3) * .05; o.rotation.x = Math.sin(t * 1.7 + 1) * .04; }
export function point(orb, k) { const a = orb.getObjectByName('pointerArm'); if (a) a.scale.x = Math.max(.001, k); }
// body language per mood: [tilt z, nod x, earL, earR, bounce]
const POSE = { smile: [0, 0, 0, 0, 0], calm: [0, .04, -.15, -.15, 0], happy: [.06, -.05, .3, .3, 1], wink: [.14, -.03, .25, .05, .5],
  curious: [.26, .06, .3, -.25, 0], ask: [.18, .02, .35, .1, 0], surprise: [0, -.14, .45, .45, 0], think: [-.12, -.12, -.1, .25, 0] };
export function orbRig(st, orb) {
  const body = orb.getObjectByName('body'), eL = orb.getObjectByName('earL'), eR = orb.getObjectByName('earR'), e0 = [eL.rotation.z, eR.rotation.z];
  let state = {mood: 'smile', look: 0, talk: 0};
  const scr = st.screen(orb.getObjectByName('face'), (c, t, W, H) => bitiFace(c, t, W, H, state), {light: .35, px: 768});
  const base = orb.position.clone();
  return { screen: scr, update(t, {mood = 'smile', look = 0, talk = 0, point: pk = 0, amp = .022} = {}) {
    state = {mood, look, talk}; scr.update(t);
    const [tz, nx, a, b, bo] = POSE[mood] || POSE.smile;
    orb.position.y = base.y + Math.sin(t * 2.1) * amp + bo * Math.abs(Math.sin(t * 7)) * .018;
    body.rotation.z = tz + Math.sin(t * 1.3) * .04; body.rotation.x = nx + Math.sin(t * 1.7 + 1) * .03;
    eL.rotation.z = e0[0] + a + Math.sin(t * 3.1) * .03; eR.rotation.z = e0[1] - b - Math.sin(t * 2.7 + 1) * .03;
    point(orb, pk);
  } };
}
// ── Media pro 2026-11-26 (video inbox, Ziv): attention moments + "never covered" ─────────────────────────────
// flyIn(orb, t, {at, from, dur, dist, pop}) — Biti enters from the side (eased, small overshoot), arrives a bit bigger (pop) and settles to 1 in ~0.8 s.
//   Call every frame AFTER rig.update (it offsets position/scale on top of the hover). from: 'left'|'right'|'up'. Returns progress 0..1.
//   Before `at` she is hidden (visible=false), so she is never seen floating in place before the entrance.
const easeOutBack = (x, s = 1.4) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export function flyIn(orb, t, {at = 0, from = 'left', dur = .7, dist = 1.1, pop = 1.18, cam = null} = {}) {
  const k = Math.min(1, Math.max(0, (t - at) / dur)); orb.visible = t >= at;
  if (!orb.userData.s0) orb.userData.s0 = orb.scale.x;
  const e = easeOutBack(k), off = (1 - e) * dist;
  const dir = new orb.position.constructor(from === 'up' ? 0 : from === 'left' ? -1 : 1, from === 'up' ? 1 : 0, 0);
  if (cam) dir.applyQuaternion(cam.quaternion);              // 'left' = screen-left when a camera is given
  const prev = orb.userData.flyOff; if (prev) orb.position.sub(prev);   // safe to call every frame even if nothing resets x/z
  orb.userData.flyOff = dir.multiplyScalar(off).clone(); orb.position.add(orb.userData.flyOff);
  const settle = t < at + dur ? pop * Math.min(1, k * 1.6) + (1 - Math.min(1, k * 1.6)) * .6 : 1 + (pop - 1) * Math.max(0, 1 - (t - at - dur) / .8);
  orb.scale.setScalar(orb.userData.s0 * settle); orb.rotation.z = (1 - k) * (from === 'right' ? .5 : -.5);
  return k;
}
// attention(orb, t, {at, dur, amt}) — one-second "look here" beat in place: a small grow + ear perk + hop, then back. No glow, no flash.
export function attention(orb, t, {at = 0, dur = 1, amt = .14} = {}) {
  const x = (t - at) / dur; if (x < 0 || x > 1) return 0; const k = Math.sin(Math.PI * x);
  if (!orb.userData.s0) orb.userData.s0 = orb.scale.x;
  orb.scale.setScalar(orb.userData.s0 * (1 + amt * k)); orb.position.y += .03 * Math.sin(Math.PI * Math.min(1, x * 2));
  for (const n of ['earL', 'earR']) { const e = orb.getObjectByName(n); if (e) e.rotation.z += (n === 'earL' ? .35 : -.35) * k; }
  return k;
}
// screenBox(obj, cam, W=1080, H=1920) → {x0,y0,x1,y1} pixel rect of Biti on the frame — check it against overlay rects (follow card, captions y≈1290, hook):
//   Ziv 2026-11-26: Biti is NEVER covered. Use overlaps(screenBox(orb, cam), {x0,y0,x1,y1}) in QA or to slide her aside.
export function screenBox(obj, cam, W = 1080, H = 1920) {
  const box = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
  obj.updateWorldMatrix(true, true); const b3 = new (Object.getPrototypeOf(obj.position).constructor)();
  obj.traverse(o => { if (!o.isMesh || !o.visible) return; o.geometry.computeBoundingBox(); const g = o.geometry.boundingBox;
    for (let i = 0; i < 8; i++) { b3.set(i & 1 ? g.max.x : g.min.x, i & 2 ? g.max.y : g.min.y, i & 4 ? g.max.z : g.min.z).applyMatrix4(o.matrixWorld).project(cam);
      const x = (b3.x + 1) / 2 * W, y = (1 - b3.y) / 2 * H; box.x0 = Math.min(box.x0, x); box.x1 = Math.max(box.x1, x); box.y0 = Math.min(box.y0, y); box.y1 = Math.max(box.y1, y); } });
  return box;
}
export const overlaps = (a, b, pad = 12) => !(a.x1 + pad < b.x0 || b.x1 + pad < a.x0 || a.y1 + pad < b.y0 || b.y1 + pad < a.y0);
