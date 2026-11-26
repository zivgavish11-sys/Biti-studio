// fx-path.js — Media pro 2026-11-26 (video inbox, Ziv: "moving robots must not pass through objects").
// Real-physics movement on the floor (XZ plane). Deterministic (same frame t → same pose), so renders are repeatable.
//
//   const obs = obstacles(scene, [sofa, table, bin], {pad: .02});      // XZ boxes from props' world bounds (or pass {x0,z0,x1,z1} rects)
//   const path = navPath([x,z], [gx,gz], obs, {radius: .18});          // grid A* around the props, smoothed → waypoints
//   const trk = track(path, {speed: .3, turn: 2.5});                    // timed track: drives straight, stops + turns on the spot at corners
//   const p = trk.at(t - t0); bot.position.x = p.x; bot.position.z = p.z; bot.rotation.y = p.ry;
//   Vacuum style: const trk = roam([x,z], obs, bounds, {radius: .17, speed: .25, seed: 3, dur: 20}) — goes straight, STOPS at an obstacle (bumper), turns, goes on.
//   Check any custom path: hits(path, obs, radius) → list of colliding segments (QA: must be []).
import * as THREE from 'three';
export function obstacles(scene, objs, {pad = 0, minH = .03} = {}) {
  return objs.map(o => { if (o.x0 !== undefined) return o; const b = new THREE.Box3().setFromObject(o);
    return b.max.y - b.min.y < minH ? null : {x0: b.min.x - pad, z0: b.min.z - pad, x1: b.max.x + pad, z1: b.max.z + pad}; }).filter(Boolean);
}
const inBox = (x, z, o, r) => x > o.x0 - r && x < o.x1 + r && z > o.z0 - r && z < o.z1 + r;
const blocked = (x, z, obs, r) => obs.some(o => inBox(x, z, o, r));
function segFree(a, b, obs, r) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.ceil(L / .02));
  for (let i = 0; i <= n; i++) { const k = i / n; if (blocked(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, obs, r)) return false; } return true; }
export function hits(path, obs, r = .15) { const out = []; for (let i = 1; i < path.length; i++) if (!segFree(path[i - 1], path[i], obs, r)) out.push(i - 1); return out; }
export function navPath(a, b, obs, {radius = .18, cell = .05, margin = 1} = {}) {
  if (segFree(a, b, obs, radius)) return [a, b];
  const xs = [a[0], b[0], ...obs.flatMap(o => [o.x0, o.x1])], zs = [a[1], b[1], ...obs.flatMap(o => [o.z0, o.z1])];
  const X0 = Math.min(...xs) - margin, Z0 = Math.min(...zs) - margin, nx = Math.ceil((Math.max(...xs) + margin - X0) / cell), nz = Math.ceil((Math.max(...zs) + margin - Z0) / cell);
  const id = (i, j) => j * nx + i, P = (i, j) => [X0 + i * cell, Z0 + j * cell], ix = p => Math.round((p[0] - X0) / cell), jz = p => Math.round((p[1] - Z0) / cell);
  const free = new Uint8Array(nx * nz); for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) free[id(i, j)] = blocked(...P(i, j), obs, radius) ? 0 : 1;
  const s = id(ix(a), jz(a)), g = id(ix(b), jz(b)); free[s] = free[g] = 1;
  const G = new Float32Array(nx * nz).fill(Infinity), from = new Int32Array(nx * nz).fill(-1), open = [s]; G[s] = 0;
  const H = k => Math.hypot(k % nx - g % nx, ((k / nx) | 0) - ((g / nx) | 0));
  while (open.length) { let bi = 0; for (let q = 1; q < open.length; q++) if (G[open[q]] + H(open[q]) < G[open[bi]] + H(open[bi])) bi = q;
    const k = open.splice(bi, 1)[0]; if (k === g) break; const i = k % nx, j = (k / nx) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const I = i + di, J = j + dj; if (I < 0 || J < 0 || I >= nx || J >= nz) continue;
      const m = id(I, J); if (!free[m] || (di && dj && (!free[id(i + di, j)] || !free[id(i, j + dj)]))) continue; const c = G[k] + Math.hypot(di, dj);
      if (c < G[m]) { G[m] = c; from[m] = k; if (!open.includes(m)) open.push(m); } } }
  if (from[g] < 0) { console.warn('navPath: no free path'); return [a, b]; }
  const raw = []; for (let k = g; k >= 0; k = from[k]) raw.unshift(P(k % nx, (k / nx) | 0)); raw[0] = a; raw[raw.length - 1] = b;
  const out = [raw[0]]; let i = 0; while (i < raw.length - 1) { let j = raw.length - 1; while (j > i + 1 && !segFree(raw[i], raw[j], obs, radius)) j--; out.push(raw[j]); i = j; }   // string-pulling
  return out;
}
/** timed track over waypoints: straight runs at `speed` (m/s, eased start/stop), on-the-spot turns at `turn` rad/s, optional `pause` s at each stop. */
export function track(path, {speed = .3, turn = 2.5, pause = 0, ry0 = null} = {}) {
  const seg = []; let t = 0, ry = ry0 ?? Math.atan2(path[1][0] - path[0][0], path[1][1] - path[0][1]);
  for (let i = 1; i < path.length; i++) { const a = path[i - 1], b = path[i], r1 = Math.atan2(b[0] - a[0], b[1] - a[1]); let d = r1 - ry; d = Math.atan2(Math.sin(d), Math.cos(d));
    if (Math.abs(d) > .01) { const dt = Math.abs(d) / turn; seg.push({t0: t, t1: t + dt, a, b: a, r0: ry, r1: ry + d}); t += dt; } ry += d;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), dt = L / speed + .3; seg.push({t0: t, t1: t + dt, a, b, r0: ry, r1: ry, move: true}); t += dt;
    if (pause) { seg.push({t0: t, t1: t + pause, a: b, b, r0: ry, r1: ry}); t += pause; } }
  const ez = k => k * k * (3 - 2 * k);
  return { dur: t, segs: seg, at(tt) { const s = seg.find(q => tt < q.t1) || seg[seg.length - 1]; const k = Math.min(1, Math.max(0, (tt - s.t0) / (s.t1 - s.t0))), e = s.move ? ez(k) : ez(k);
    return {x: s.a[0] + (s.b[0] - s.a[0]) * e, z: s.a[1] + (s.b[1] - s.a[1]) * e, ry: s.r0 + (s.r1 - s.r0) * e, moving: !!s.move && k > 0 && k < 1}; } };
}
/** robot-vacuum roaming: straight until the bumper meets a prop/wall (stops 2 cm before), small back-off, turn, go on. bounds = {x0,z0,x1,z1} room floor. */
export function roam(start, obs, bounds, {radius = .17, speed = .25, seed = 1, dur = 20, ry = 0} = {}) {
  let s = seed * 9301 + 49297; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const walls = [{x0: -1e3, z0: -1e3, x1: bounds.x0, z1: 1e3}, {x0: bounds.x1, z0: -1e3, x1: 1e3, z1: 1e3}, {x0: -1e3, z0: -1e3, x1: 1e3, z1: bounds.z0}, {x0: -1e3, z0: bounds.z1, x1: 1e3, z1: 1e3}];
  const all = [...obs, ...walls], pts = [start]; let p = start, a = ry, T = 0;
  while (T < dur && pts.length < 60) { let L = 0; while (L < 8 && !blocked(p[0] + Math.sin(a) * (L + .02), p[1] + Math.cos(a) * (L + .02), all, radius)) L += .02;
    if (L > .05) { const q = [p[0] + Math.sin(a) * (L - .02), p[1] + Math.cos(a) * (L - .02)]; pts.push(q); T += L / speed + .3; p = q; }
    a += (rnd() > .5 ? 1 : -1) * (Math.PI * (.45 + rnd() * .5)); T += 1; }
  return track(pts, {speed, turn: 2, pause: .35, ry0: ry});
}
