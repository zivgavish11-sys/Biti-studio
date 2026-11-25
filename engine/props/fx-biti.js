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
  else if (mood === 'curious') { pill(L, S * .25); pill(R, S * .15); c.lineWidth = lw * .9; c.beginPath(); c.moveTo(R - S * .06, cy - S * .13); c.lineTo(R + S * .06, cy - S * .16); c.stroke(); }
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
  curious: [.26, .06, .3, -.25, 0], surprise: [0, -.14, .45, .45, 0], think: [-.12, -.12, -.1, .25, 0] };
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
