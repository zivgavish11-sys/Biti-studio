// Biti helpers (Media pro 2026-11-25 run 17). Our own code → CC0. No glow: matte-lit screens only.
// bitiFace(c, t, W, H, {mood, look, talk, blinkAt}) — Biti's face for ANY screen (st.screen on bitiTile 'screen', a TV, a phone, the mid-follow card slot).
//   mood: 'calm' | 'smile' | 'wonder' · look: −1..1 (eyes slide left/right) · talk: 0..1 (small mouth opens) · blinks by itself every ~3.2 s.
// hover(obj, t, {base, amp}) — soft hover bob + tilt for bitiOrb / bitiTile.  point(orb, k) — bitiOrb's pointer arm extends (0..1).
export const BITI_ACC = '#8ea6ff';
export function bitiFace(c, t, W, H, {mood = 'smile', look = 0, talk = 0, bg = true} = {}) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.direction = 'ltr';
  if (bg) { const g = c.createRadialGradient(W / 2, H * .45, 0, W / 2, H / 2, Math.max(W, H) * .7); g.addColorStop(0, '#141a2e'); g.addColorStop(1, '#05070d'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  const S = Math.min(W, H), cx = W / 2 + look * S * .06, cy = H * .46;
  const ph = (t % 3.2) / 3.2, blink = ph > .955 ? Math.sin((ph - .955) / .045 * Math.PI) : 0;
  const ew = S * .11, eh = S * (mood === 'wonder' ? .24 : .2) * (1 - .9 * blink), dx = S * .16;
  c.fillStyle = BITI_ACC;
  for (const s of [-1, 1]) { const x = cx + s * dx - ew / 2, y = cy - eh / 2, r = ew / 2; c.beginPath(); c.roundRect(x, y, ew, Math.max(eh, S * .02), r); c.fill(); }
  c.strokeStyle = BITI_ACC; c.lineWidth = S * .028; c.lineCap = 'round';
  const my = cy + S * .2;
  if (talk > .05) { c.beginPath(); c.ellipse(cx, my, S * .055, S * .02 + S * .05 * talk, 0, 0, Math.PI * 2); c.fill(); }
  else if (mood === 'wonder') { c.beginPath(); c.arc(cx, my, S * .03, 0, Math.PI * 2); c.stroke(); }
  else { const w = mood === 'calm' ? .06 : .09; c.beginPath(); c.arc(cx, my - S * w, S * w * 1.25, Math.PI * .28, Math.PI * .72); c.stroke(); }
}
export function hover(o, t, {base = null, amp = .025} = {}) { if (!o.userData.base) o.userData.base = (base || o.position).clone(); const b = o.userData.base;
  o.position.y = b.y + Math.sin(t * 2.1) * amp; o.rotation.z = Math.sin(t * 1.3) * .05; o.rotation.x = Math.sin(t * 1.7 + 1) * .04; }
export function point(orb, k) { const a = orb.getObjectByName('pointerArm'); if (a) a.scale.x = Math.max(.001, k); }
