// cam-v3.js — Media pro 2026-11-27 (Ziv: "higher-level camera moves, more eye-catching") — DEMO / test package, not a rule yet.
// One package = (1) motion blur (render.py --mblur), (2) ramp & hold timing, (3) real lens: focal length per shot + depth of field that racks focus with the target, (5) handheld breathing.
//   import {camV3} from '/engine/lib/cam-v3.js';
//   const C = camV3(st, {dof: true});                 // call AFTER proLook (it adds a BokehPass to the composer)
//   in st.frame: const {cp, ct, fov} = C.path(t, kfs);  return {cp, ct, fov, ...}   — kfs = same [t, V(pos), V(target)] list as camPath (optional 4th = fov)
// Timing (ramp & hold): a "flight" between two different shots is NOT spread over the whole gap — the camera holds (slow drift) and then
//   whips to the next shot in the last `whip` seconds (fast start, long soft landing), arriving exactly on the keyframe time. Drift segments (same shot) stay soft.
// Lens: close shots (target < 1.6 m) get a longer lens (fov 38) and the camera backs off so the framing stays → background compresses and falls out of focus;
//   wide shots (> 3.2 m) open to fov 62. Focus distance = camera → target every frame, so changing target = automatic rack focus.
import * as THREE from 'three';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const sstep = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
// whip easing: short ease-in (10%) then quartic ease-out — punchy start, long settle (C1 continuous)
const whipE = u => { u = Math.min(1, Math.max(0, u)); const w = u < .1 ? u * u / .2 : u - .05; return 1 - Math.pow(1 - w / .95, 4); };
export function camV3(st, {dof = true, aperture = .0045, maxblur = .006, breath = 1, whip = .62, lens = true} = {}) {
  let bokeh = null;
  if (dof) { bokeh = new BokehPass(st.scene, st.cam, {focus: 3, aperture, maxblur}); const ps = st.composer.passes; st.composer.insertPass(bokeh, Math.min(1, ps.length)); }
  const baseFov = 55, tanH = f => Math.tan(THREE.MathUtils.degToRad(f / 2));
  // lens per keyframe: keep the subject the same size while changing focal length (pull back along the view ray)
  const lensKf = kf => { const p = kf[1].clone(), c = kf[2].clone(); const d = p.distanceTo(c);
    let f = kf[3] ?? (!lens ? baseFov : d < 1.6 ? 38 : d > 3.2 ? 62 : 55);
    const k = tanH(baseFov) / tanH(f), off = p.clone().sub(c).multiplyScalar(k); return [kf[0], c.clone().add(off), c, f]; };
  let cache = null, src = null;
  return {
    bokeh,
    path(t, kfs) {
      if (src !== kfs.length || !cache) { cache = kfs.map(lensKf); src = kfs.length; }
      const K = cache, n = K.length;
      let i = 0; while (i < n - 2 && t > K[i + 1][0]) i++;
      const a = K[i], b = K[Math.min(i + 1, n - 1)], h = Math.max(1e-3, b[0] - a[0]);
      const far = a[1].distanceTo(b[1]) > .45 || a[2].distanceTo(b[2]) > .35;          // a real flight to a new shot
      let e;
      if (t <= K[0][0]) e = 0; else if (t >= K[n - 1][0]) e = 1;
      else if (far) { const w = Math.min(whip, h * .9), t0 = b[0] - w; e = t < t0 ? .04 * (t - a[0]) / Math.max(.001, t0 - a[0]) : .04 + .96 * whipE((t - t0) / w); }   // hold (4% creep) → whip
      else e = sstep((t - a[0]) / h);                                                                                                            // soft drift
      const cp = a[1].clone().lerp(b[1], e), ct = a[2].clone().lerp(b[2], e), fov = a[3] + (b[3] - a[3]) * e;
      // flights travel on a slight arc (camera has mass, not a straight rail)
      if (far) cp.y += Math.sin(Math.PI * Math.min(1, Math.max(0, e))) * Math.min(.25, a[1].distanceTo(b[1]) * .08);
      // handheld breathing (cm-scale, slow)
      if (breath) { const s = breath; cp.x += s * (.010 * Math.sin(t * 1.13) + .005 * Math.sin(t * 2.71 + 1)); cp.y += s * (.008 * Math.sin(t * 1.37 + 2) + .004 * Math.sin(t * 3.1));
        ct.x += s * .004 * Math.sin(t * .91 + 3); ct.y += s * .003 * Math.sin(t * 1.6 + 1); }
      if (bokeh) { bokeh.uniforms.focus.value = cp.distanceTo(ct); bokeh.uniforms.aperture.value = aperture * (fov < 45 ? 1.6 : 1); }
      return {cp, ct, fov};
    },
  };
}
