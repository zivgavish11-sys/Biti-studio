// Tel-Aviv neighbourhood helpers (Media pro 2026-11-20 run 12, ep021-dronedelivery). Our own code → CC0. Matte, hero palette, no glow.
// import {tlvCity, tlvSea, tether, podDoors, instanceModel} from '/engine/props/fx-tlv.js';
import * as THREE from 'three';

const rng = seed => { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
const M = (c, r = .9) => new THREE.MeshStandardMaterial({color: c, roughness: r});

/** draw many copies of one (baked) model with InstancedMesh — one draw call per material. place = [{x, y, z, ry, s}]; tints = optional colour per copy (multiplies). */
export function instanceModel(scene, obj, place, {tints = null, shadow = true} = {}) {
  obj.updateMatrixWorld(true); const g = new THREE.Group(); g.name = 'inst_' + (obj.name || 'model'); scene.add(g);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3();
  obj.traverse(o => { if (!o.isMesh) return; const im = new THREE.InstancedMesh(o.geometry, o.material, place.length); im.castShadow = shadow; im.receiveShadow = true; im.frustumCulled = false;
    place.forEach((p, i) => { m4.compose(new THREE.Vector3(p.x, p.y || 0, p.z), q.setFromEuler(e.set(0, p.ry || 0, 0)), one.setScalar(p.s || 1)); im.setMatrixAt(i, m4.multiply(o.matrixWorld)); if (tints) im.setColorAt(i, tints[i]); });
    g.add(im); });
  return g;
}

/** animated sea with soft swell + foam lines rolling to the shore. Shore at x = shoreX, sea toward −x. api: .update(t) */
export function tlvSea(scene, {shoreX = -34, w = 600, d = 900, y = -1.25, z = 0, color = 0x3d55c8, seg = 110} = {}) {
  const geo = new THREE.PlaneGeometry(w, d, seg, seg); geo.rotateX(-Math.PI / 2); geo.translate(shoreX - w / 2, y, z);
  const sea = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color, roughness: .32, metalness: .08})); sea.name = 'sea'; sea.receiveShadow = true; scene.add(sea);
  const base = Float32Array.from(geo.attributes.position.array);
  const foamM = new THREE.MeshStandardMaterial({color: 0xdfe3ff, roughness: .8, transparent: true, opacity: .5, depthWrite: false});
  const foam = []; for (let k = 0; k < 6; k++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.2, d * .9), foamM.clone()); f.rotation.x = -Math.PI / 2; f.position.set(shoreX, y + .12, z); scene.add(f); foam.push(f); }
  const lap = new THREE.Mesh(new THREE.PlaneGeometry(2.2, d * .9), foamM.clone()); lap.rotation.x = -Math.PI / 2; scene.add(lap);
  function update(t) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = base[i * 3], zz = base[i * 3 + 2], near = Math.min(1, (shoreX - x) / 30);
      p.array[i * 3 + 1] = y + near * (.14 * Math.sin(x * .09 + t * 1.1) + .08 * Math.sin(zz * .07 + x * .04 + t * .8) + .04 * Math.sin(zz * .3 - t * 1.7)); }
    p.needsUpdate = true; geo.computeVertexNormals();
    foam.forEach((f, k) => { const ph = ((t * .08 + k / 6) % 1); f.position.x = shoreX - 1 - (1 - ph) * 42; f.material.opacity = .2 * Math.sin(Math.PI * ph) * (k % 2 ? .7 : 1); f.scale.x = .6 + ph * 1.4; });
    const lp = (t * .25) % 1; lap.position.set(shoreX + .6 + Math.sin(lp * Math.PI) * 1.6, y + .14, z); lap.material.opacity = .55 * Math.sin(lp * Math.PI);
  }
  update(0); return {sea, foam, update};
}

/** the winch line between drone/winchDrone ('lineOut') and drone/droidPod ('hook' = pod origin).
 *  api: .set(len, t, sway=1) → pod hangs len metres below, gentle pendulum sway (bigger on a long line), spool turns, pod fans spin. .end() = pod hook world point. */
export function tether(scene, drone, pod, {r = .006, color = 0xe8ecff} = {}) {
  const line = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 6), new THREE.MeshStandardMaterial({color, roughness: .5})); line.name = 'tetherLine'; line.castShadow = true; scene.add(line);
  const out = drone.getObjectByName('lineOut'), spool = drone.getObjectByName('spool'), V = () => new THREE.Vector3();
  const rotors = [0, 1, 2, 3].map(i => pod.getObjectByName('rotor' + i)).filter(Boolean);
  const end = V();
  function set(len, t = 0, sway = 1) {
    drone.updateMatrixWorld(true); const a = out.getWorldPosition(V());
    const amp = Math.min(.6, .012 * len + .02) * sway;
    end.set(a.x + Math.sin(t * 1.3) * amp, a.y - Math.max(.0, len), a.z + Math.sin(t * .9 + 1) * amp * .7);
    pod.position.copy(end); pod.rotation.set(Math.sin(t * .9 + 1) * amp * .15, t * .2, -Math.sin(t * 1.3) * amp * .15);
    line.visible = len > .02; line.position.copy(a).lerp(end, .5); line.scale.set(1, Math.max(.001, a.distanceTo(end)), 1);
    line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a.clone().sub(end).normalize());
    if (spool) spool.rotation.x = -len / .06; rotors.forEach((ro, i) => ro.rotation.z = t * 30 * (i % 2 ? -1 : 1));
    return end; }
  return {line, set, end: () => end.clone()};
}
/** open the pod's clam-shell bay (k 0..1); drop: parcel slides down by dropM metres once open. */
export function podDoors(pod) { const L = pod.getObjectByName('doorL'), R = pod.getObjectByName('doorR'), P = pod.getObjectByName('parcel'), y0 = P.position.y;
  return {set(k, drop = 0) { k = Math.min(1, Math.max(0, k)); L.rotation.z = -1.25 * k; R.rotation.z = 1.25 * k; P.position.y = y0 - drop; }}; }

/** a whole Tel-Aviv neighbourhood (generic): Bauhaus blocks on a real street grid, a tree boulevard, beach + promenade + palms and an animated sea on the west, parked cars,
 *  optional far skyline in the east. One draw call per material (instanced) — fast enough for 0–100 m top-down flights.
 *  opts: cols × rows of city blocks (each 52×46 m with 6 buildings, streets 12 m), boulevardAfter (row index; a 30 m boulevard instead of the street after it),
 *  beach (west side), skyline, hero {col, row, slot 0..5} → that building is the full-detail 'tlv/blockHero' (rooftop terrace) and is returned.
 *  Returns {hero, heroSpot (world Vector3 on the terrace), sea, bounds, slots:[{x,z,ry,kind}]}. Origin (0,0) = centre of the hero block's cell. */
export async function tlvCity(st, {cols = 4, rows = 4, seed = 21, boulevardAfter = 1, beach = true, skyline = true, cars = true, hero = {col: 1, row: 1, slot: 1}} = {}) {
  const {scene} = st, r = rng(seed), CW = 52, CD = 46, ST = 12, BW = 30;
  const load = async n => (await st.model(n)).object;
  const kinds = ['tlv/blockA', 'tlv/blockB', 'tlv/blockC', 'tlv/blockD', 'tlv/blockE'];
  const objs = {}; for (const k of [...kinds, 'tlv/ficus', 'tlv/palm']) objs[k] = await load(k);
  // cell origins (x along cols, z along rows) — hero cell centred on 0,0
  const cx = c => (c - hero.col) * (CW + ST);
  const zs = []; { let z = 0; for (let rr = 0; rr < rows; rr++) { zs.push(z); z += CD + (rr === boulevardAfter ? BW : ST); } }
  const cz = rr => zs[rr] - zs[hero.row];
  const x0 = cx(0) - CW / 2 - ST, x1 = cx(cols - 1) + CW / 2 + ST, z0 = cz(0) - CD / 2 - ST, z1 = cz(rows - 1) + CD / 2 + ST;
  // ground: asphalt + raised sidewalks + inner gardens per cell
  const flat = (w, d, x, z, y, m, h = .02) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y + h / 2, z); o.receiveShadow = true; scene.add(o); return o; };
  flat(x1 - x0 + 60, z1 - z0 + 60, (x0 + x1) / 2, (z0 + z1) / 2, 0, M(0x1d1f4c, .95));
  const walkM = M(0x5a5fae), gardenM = M(0x2f3a86), curbM = M(0x9a9fe0, .8), lineM = M(0xd9ddf7, .7);
  const slots = [], dash = [], zebra = [], bush = [], trees = [], carP = [];
  for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) {
    const X = cx(c), Z = cz(rr); flat(CW + 5, CD + 5, X, Z, 0, walkM, .16); flat(CW + 5.2, CD + 5.2, X, Z, 0, curbM, .12); flat(CW - 2, CD - 2, X, Z, .16, gardenM, .03);
    // 3 buildings facing south (+z) and 3 facing north (−z)
    for (let i = 0; i < 6; i++) { const south = i < 3, k = i % 3, x = X - 17.5 + k * 17.5 + (r() - .5) * 1.2, z = Z + (south ? 1 : -1) * (CD / 2 - 9.5);
      slots.push({x, z, ry: south ? 0 : Math.PI, kind: kinds[Math.floor(r() * kinds.length)], hero: c === hero.col && rr === hero.row && i === hero.slot});
      for (let b = 0; b < 3; b++) bush.push({x: x + (r() - .5) * 12, z: z + (south ? 1 : -1) * (8.4 + r() * .8), s: .5 + r() * .5}); }
    // street trees on the sidewalks
    for (let x = X - CW / 2 + 3; x < X + CW / 2; x += 9) { trees.push({x: x + r(), z: Z + CD / 2 + 1.2, s: .7 + r() * .25, ry: r() * 6}); trees.push({x: x + r(), z: Z - CD / 2 - 1.2, s: .7 + r() * .25, ry: r() * 6}); }
    for (let z = Z - CD / 2 + 4; z < Z + CD / 2; z += 10) { trees.push({x: X + CW / 2 + 1.2, z, s: .7 + r() * .2, ry: r() * 6}); trees.push({x: X - CW / 2 - 1.2, z, s: .7 + r() * .2, ry: r() * 6}); }
    // lane dashes + zebras around the cell
    for (let x = X - CW / 2; x < X + CW / 2; x += 4) { dash.push({x, z: Z + CD / 2 + ST / 2, ry: 0}); dash.push({x, z: Z - CD / 2 - ST / 2, ry: 0}); }
    for (let z = Z - CD / 2; z < Z + CD / 2; z += 4) dash.push({x: X + CW / 2 + ST / 2, z, ry: Math.PI / 2});
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) for (let k = -2; k <= 2; k++) { zebra.push({x: X + sx * (CW / 2 + ST / 2) + k * 1.6, z: Z + sz * (CD / 2 - 1.6), ry: 0}); zebra.push({x: X + sx * (CW / 2 - 1.6), z: Z + sz * (CD / 2 + ST / 2) + k * 1.6, ry: Math.PI / 2}); }
    // parked cars along the kerbs
    if (cars) for (let x = X - CW / 2 + 4; x < X + CW / 2 - 3; x += 5.6) for (const sz of [1, -1]) if (r() < .7) carP.push({x: x + r() * .6, z: Z + sz * (CD / 2 + 3.6), ry: Math.PI / 2 + (r() < .5 ? Math.PI : 0)});
  }
  const strip = (w, d, m, place, h = .012) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.y = .03; return instanceModel(scene, o, place, {shadow: false}); };
  strip(2, .14, lineM, dash); strip(.5, 3.2, lineM, zebra);
  instanceModel(scene, new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), M(0x3d4799)), bush.map(b => ({...b, y: .7})));
  instanceModel(scene, objs['tlv/ficus'], trees.map(t => ({...t, y: .16})));
  // buildings: instanced per kind (+ the hero one in full detail)
  let heroObj = null, heroSpot = null;
  for (const k of kinds) { const pl = slots.filter(s => s.kind === k && !s.hero).map(s => ({x: s.x, z: s.z, ry: s.ry, y: .16}));
    if (pl.length) instanceModel(scene, objs[k], pl, {tints: pl.map(() => new THREE.Color(1, 1, 1).multiplyScalar(.9 + r() * .12))}); }
  const hs = slots.find(s => s.hero); if (hs) { heroObj = (await st.model('tlv/blockHero')).object; heroObj.position.set(hs.x, .16, hs.z); heroObj.rotation.y = hs.ry; scene.add(heroObj);
    heroObj.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); heroObj.updateMatrixWorld(true);
    const sp = heroObj.getObjectByName('terraceSpot'); heroSpot = sp ? sp.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(hs.x, 20, hs.z); }
  if (cars) { const car = (await st.model('vehicles/autoCar')).object; const sz = new THREE.Box3().setFromObject(car).getSize(new THREE.Vector3()); const s = 4.3 / Math.max(sz.x, sz.z);
    instanceModel(scene, car, carP.map(p => ({...p, y: .02, s})), {tints: carP.map(() => new THREE.Color().setHSL(.64 + r() * .06, .35, .45 + r() * .4))}); }
  // boulevard along the gap after row boulevardAfter
  if (boulevardAfter != null && boulevardAfter < rows - 1) { const bz = cz(boulevardAfter) + CD / 2 + BW / 2 + 1.5, bv = await load('tlv/boulevard');
    for (let x = x0 + 22; x < x1; x += 44) { const o = x === x0 + 22 ? bv : bv.clone(); o.position.set(x, 0, bz); scene.add(o); } }
  // beach: road + promenade + sand + sea on the west
  // the beach dips below street level, so the whole promenade sits on a 1.3 m raised edge (stays above the stage floor at y 0) — like the real raised promenade
  let sea = null; if (beach) { const pv = await load('tlv/promenade'); const px = x0 - 8, PY = 1.3; let first = true;
    for (let z = z0 - 22; z < z1 + 44; z += 44) { const o = first ? pv : pv.clone(); first = false; o.position.set(px, PY, z); scene.add(o); }
    const zc = (z0 + z1) / 2, zl = z1 - z0 + 140; flat(8.4, zl, px + 4, zc, 0, M(0x8a8fd6, .9), PY);   // raised promenade base
    sea = tlvSea(scene, {shoreX: px - 34.5, z: zc, y: .3}); }
  if (skyline) { const tw = ['tlv/towerRound', 'tlv/towerTri', 'tlv/towerSquare']; for (let i = 0; i < 7; i++) { const o = (await st.model(tw[i % 3])).object;
      o.position.set(x1 + 140 + r() * 160, 0, z0 - 60 + i * (z1 - z0 + 120) / 7 + r() * 20); o.scale.setScalar(.75 + r() * .4); o.rotation.y = r() * 6; scene.add(o); } }
  return {hero: heroObj, heroSpot, sea, slots, bounds: {x0, x1, z0, z1}};
}
