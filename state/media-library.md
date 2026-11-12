# Media library (owned by Media pro)
What visual assets we have, where, license, and what they fit. Credits: engine/assets/models/CREDITS.md.

## Models (engine/assets/models/) — load with st.model('<folder>/<name>')
- robot/RobotExpressive — Biti stand-in, 14 clips. CC0.
- city/* (Kenney City Builder), vehicles/* (Kenney Racing + Car Kit: sedan, taxi, SUV, trucks). CC0. Fits: robotaxi, delivery robots, city news.
- **home/** (added 2026-11-04, 140 models, 2.2 MB, Kenney Furniture Kit, CC0): sofas (loungeSofa, loungeSofaLong, loungeSofaCorner), tableCoffee, table, chair*, bedDouble/bedSingle,
  kitchen* (Fridge, Cabinet, Stove, Sink, Bar, Microwave, CoffeeMachine), washer, dryer, televisionModern, cabinetTelevision, lamp*, rug*, pottedPlant, plantSmall*, bookcase*, desk, laptop, computerScreen, cardboardBox*, doorway*, wall*, floor*.
  Fits: robot vacuum (ep003), home robots, "robot in every home", laundry-folding (Moravec), "bring me the red cup".
  Tip: Kenney colours are pale pastels → multiply material colour by ~0.6 to sit in our dark navy world; fit to a box with Box3 (sizes are not in metres).
- **people/** (added 2026-11-04, 12 characters, 3 MB, Kenney Mini Characters, CC0, animated): character-male-a..f, character-female-a..f (male-c = police uniform).
  Clips: static idle walk sprint jump fall crouch sit drive die pick-up emote-yes emote-no holding-* interact-left/right wheelchair-*. Scale with Box3 to ~1.1–1.6.
  Fits: robots with families, surgeon (doctor/patient), delivery robots crossing a road, restaurants, warehouses.

- **medical/** (added 2026-11-04, in-house kit, CC0, ~3.6 MB, source `engine/props/kit.js`, re-export with `python3 tools/make_props.py [filter]`). Real metres → use `st.prop(name, {x, z, ry})` without h/fit for true scale.
  surgical-robot (4-arm patient-side cart, 2.5 m; animate nodes arm0..3 .rotation.y, elbow0..3, wrist0..3, tool0..3 .position.y, tip0..3 with jawA/jawB; arm1 = camera scope with 'lens'),
  surgeon-console (viewer hood + eyepieces 'viewerGlass', hand controllers handL/handR, foot pedals), operating-table (table rotated ry:π/2 so the robot reaches across), draped-patient (put on the table: {h:.27, y:.86, ry:π/2}),
  surgical-lamp (ceiling, heads lampA/lampB; place {y:1.95}), medical-monitor (rolling stand; mesh 'screen' takes a CanvasTexture — see engine/props/proposals/index.html for a Hebrew vitals UI),
  instrument-grasper (true scale ~0.3 m, jaws jawA/jawB — scale up for macro shots), suture-needle (with thread). Fits: ep004-surgeon, any medical-robot news.
  Showcase scene: `python3 tools/render.py frames engine/props/showcase 1,5,9,13,17`.
- **home/robotVacuum + robotVacuumDock** (in-house, CC0): generic round vacuum with lidar turret (node 'lidar' → spin), side 'brush', 'bumper', and real insides (battery, motors, dust bin, board, fan in group 'insides') for x-ray shots (make 'shell'/'shellTop' transparent). Use with tint:1 (already dark). Fits: ep003-vacuum, home robots.
- **home/phone** (Quaternius Survival Pack, CC0): simple smartphone. Fits: apps, "robot controlled from your phone".
- **space/** (Quaternius Ultimate Space Kit, CC0, ~1.2 MB): Rover_1, Rover_2, Rover_Round, SolarPanel_Ground, SolarPanel_Roof, SolarPanel_Structure. Fits: "the farthest robot from Earth", Mars rovers, solar-panel cleaning robots.

- **drone/quadcopter** (added 2026-11-04, in-house CC0, 0.4 MB, source engine/props/kit.js): generic X-frame quadcopter in real metres (~0.5 m motor-to-motor) with prop guards. Nodes: prop0..prop3 (spin .rotation.y, 0&2 vs 1&3 opposite), motor0..3, arm0..3,
  'shell'/'shellTop' (make transparent for x-ray), group 'insides' with 'imu' (chip on the flight board), 'battery', 'fc'; ledFront0/1 cyan, ledBack0/1 pink (solid). Front = +z. Use `scale` 3–4 for readable wide shots.
  Spinning props are soft discs by default (disc0..3 visible, blades0..3 hidden; Ziv approved 2026-11-04) — just spin prop{i}; for a parked drone hide disc{i} and show blades{i}. Fits: ep006-drone, delivery drones, drone news.
- **home/trayGlasses** (in-house CC0): round waiter tray Ø0.36 m with 5 stemmed glasses (glass0..4, drink0..4 wine/juice). Pair with a person using clip 'holding-both' (tray at ~45% of the person's height, a bit in front). Fits: the "waiter with a full tray" joke, restaurants, service robots.
- **outdoor/** (added 2026-11-04, Quaternius CC0, 1.8 MB): CommonTree_1..3, PalmTree_1/3 (Israeli feel), Bush_1/2, Flowers, Grass, Rock_1, Bench_1, Streetlight_Single,
  apartment blocks 2Story_Balcony, 3Story_Balcony, 4Story (backdrop with balconies). Fits: park / balcony / street scenes, wind gusts, delivery robots on sidewalks. Use tint ~.8 if too bright at night.
  Showcase: `python3 tools/render.py frames engine/props/showcase-drone 2,6,10,14` (park wide, drone, x-ray, waiter).

- **everyday/** (added 2026-11-07, in-house CC0, source engine/props/kit.js, real metres): smartphone (7.5×15.5 cm, plane 'screen' → st.screen; use scale 2–3 for hero shots),
  router (led0..3 solid, ant0..3), cellTower (18 m lattice, sector0..2 with panels, dish0..1), busStop (Israeli-style shelter; 'screen' arrival board aspect 3, 'sign' route plate aspect 1.6).
  Next for this kit: shikun apartment block, Shabbat elevator, supermarket till, coffee machine, ballot-box-style box (no state emblem replica unless public-domain), traffic light.

- **body/** (added 2026-11-08): **hand-right / hand-left** (MIT, W3C WebXR generic hand, 94 KB each, skinned, real metres ~20 cm; wrist at origin, fingers hang along −y). Bones: wrist, thumb-metacarpal/-phalanx-proximal/-phalanx-distal/-tip,
  {index,middle,ring,pinky}-finger-metacarpal/-phalanx-proximal/-phalanx-intermediate/-phalanx-distal/-tip — chained (we re-rigged it), so rotating a phalanx about its **local +x** curls the finger toward the palm (~0.3–0.6 rad per joint for a pinch).
  Use: `st.prop('body/hand-right', {tint:1})`, then `o.scale.setScalar(5)` for hero shots, set a matte skin material (hero: #c9c3f2) and `geometry.computeVertexNormals()`. Copy-paste helper `hand()` with `pose(k, pinch)` + receptor dots glued to the skin (applyBoneTransform): engine/props/showcase-touch/index.html.
  **gripper** (in-house CC0, 0.3 m): parallel 2-jaw robot gripper, flange on top; jawA/jawB slide .position.x (open ±0.06, closed ±0.012), padA/padB soft pads (recolour on contact), sensorA0..2/sensorB0..2 solid cyan dots, cam, led. Use scale 3–4.
  Fits: ep011-touch (pinch an egg, crush/drop), robot hands/grippers news, lab series (robot arm end-effector), "robot picks a strawberry/egg".
  Showcase: `python3 tools/render.py frames engine/props/showcase-touch 3.5,6.5,10` (hand pinch · gripper · receptor-dot hand).

- **robots/** (added 2026-11-08 run 4, in-house CC0, real metres, white shell + graphite + one cyan stripe = fits hero/classic, no brand look). `st.prop('robots/<name>', {tint:1, x, z, ry})` (no h = true size).
  **humanoid** (1.70 m): joints pelvis, torso (.y twist), neck, head, shoulderL/R, elbowL/R, wristL/R, hipL/R, kneeL/R, ankleL/R (rotate .x fwd/back, .z sideways); visor + eyeL/eyeR solid cyan; x-ray: make 'torsoShell' transparent → 'insides' (cell0..5 battery, computer, cooling). Fits: "why humanoids last 2 hours", "how a robot doesn't fall", humanoid news.
  **robotDog** (0.55 m back): hip{FL,FR,BL,BR}/knee{..} (.x), head with cam0/cam1, lidar (spin .y). Fits: robot-dog stories, inspection, stairs.
  **deliveryBot** (6 wheels, 0.7 m): wheel0..5 (.x), lid (open = rotation.x −0.6), flag, screen (st.screen for a Hebrew face/status), cam0..2. Fits: "how delivery robots cross the road", food delivery news.
  **robotArm** (6-axis, reach ~1.5 m): j1 (.y) j2 j3 (.x) j4 (.z roll) j5 (.x) j6 (.y) → 'tool' empty group: attach body/gripper there. Fits: factories, lab series, "first factory robot 1961".
  **driveUnit** (0.8 m square) + **shelfPod** (1×1×2.2 m, fabric bins, 0.35 m clearance): put the unit under the pod, raise 'lift' .position.y 0.05 and move both. Fits: warehouse/Amazon-style stories (generic).
- **vehicles/robotaxi** (in-house CC0, 4.7 m, generic): roof 'lidar' (spin 'lidarHead' .y), cam0..5 pods, radar, wheel0..3, headL/R tailL/R. **vehicles/forklift** (CC0, 2.3 m): 'forks' .position.y 0→1.5 carries 'pallet' with box0..3, beacon, wheel0..3. Fits: robotaxi news, autonomous trucks/warehouses.
- **everyday/servo** (CC0, real 40 mm → scale 10–15): horn (.y), shell/cap/tabs (make transparent for x-ray), insides: motor, gear0..3, pot, board, chip, wire0..2. Fits: "what is a servo and why every robot is full of them".
- **buildings/** — **factoryHall** (in-house CC0, 24×10×9 m interior corner backdrop: ribbed metal walls, high windows, columns, trusses, overhead 'crane' (.position.x), roller door, yellow floor lines; camera looks from +z) — a real-looking wall instead of filler boxes for factory/warehouse stories.
  Quaternius textured city blocks (CC0, 0.3–0.9 MB): Building1_Small, Building2_Large, Building3_Big, Building3_Small, Building4 — real-looking brick/stone facades with windows (European feel); use `{h: 7–16, tint: .9}` as a street backdrop 6–10 m behind the action.
- **street/** (Quaternius Modular Streets, CC0, tiny): TrafficLight, TrafficLight_2, Sign_Stop, Sign_NoParking, Sign_Triangle, Street_Straight, Street_4Way (crosswalk junction), Streetlight_Double. Fits: delivery robots crossing, robotaxi at a junction.
  Showcase of this whole batch: `python3 tools/render.py frames engine/props/showcase-robots 1,5,9,13` (robots · arm+servo x-ray · warehouse · street).
  Note: kit.js exports are big un-welded; after `make_props.py` run `npx @gltf-transform/cli weld F F && npx @gltf-transform/cli dedup F F` (10× smaller).

- **lab/** + **buildings/labRoom** (added 2026-11-12 run 5, in-house CC0, real metres, for the lab series 'המעבדה של העוקבים'):
  **labRoom** (corner backdrop 8×5×3.2 m: backWall + sideWall with a daylight 'window', 'shelves' with boxes, whiteboard 'board' plane aspect 2 → st.screen, ceiling light strips, yellow floor line; camera from +z).
  **workbench** (1.8×0.8 m, top at 0.925 m): pegboard with tools, 'monitor' with 'screen' (16:9 → st.screen), 'vise' ('viseJaw' .position.x), drawer0..2 (.position.z), desk 'lamp' ('lampArm'), parts0..5 bins.
  **printer3d** (0.5 m cube frame, put on the bench at y .925): 'gantry' (.position.y), 'head' (.position.x ±.17), 'nozzle', 'bed' (.position.z ±.12), 'print' (scale .y 0→1 = printing), 'spool' (.rotation.z), 'screen' (aspect 1.6).
  **chargingWall** (5 bays × 1 m, 2.4 m): per bay plate{i} (name plate, aspect 3 → st.screen with a Hebrew name), bar{i} (charge level: scale .x 0..1), plug{i}+cable, floor pad{i} with cyan ring{i} (robots stand ~0.55 m in front of the wall).
  Note: st.prop centres the bbox on x/z — the charging wall's centre is ~0.4 m in front of its wall plane (with ry π/2 place it at wallX+0.45).
- **vehicles/farmRobot** (in-house CC0, 3.6 m, generic cab-less electric tractor): wheelFL/FR/BL/BR (.z axis spin → rotation.z), 'lidar' → 'lidarHead' (.y spin), cam0..3, beacon, hitch, 'sprayer' with boomL/boomR (.rotation.x to fold). Fits: farm-robot news, "רובוטים בחקלאות". Crop rows: simple cones on soil strips (see showcase).
  Showcase: `python3 tools/render.py frames engine/props/showcase-lab 1,5,9` (lab + charging wall · printer on bench · farm robot).

## HDRI (engine/assets/hdri/, Poly Haven CC0)
- moonless_golf_1k.hdr — night sky; moodier, deeper image-based light for outdoor night scenes (tested on ep005: less washed-out stone).
- venice_sunset_1k.hdr — warm sunset; for "future/hopeful" endings.
  Use: RGBELoader → PMREM.fromEquirectangular → scene.environment (intensity ~1.4, hemisphere ~.35). Not the default yet (needs Ziv's OK).

## Fonts (engine/assets/fonts/)
- Rubik 400/700 (OFL) — UI/captions. Frank Ruhl Libre (OFL).

## Wanted next
- Done 2026-11-08: humanoid, robot dog, delivery bot, industrial arm, warehouse drive unit + pod, robotaxi, forklift, servo, factory hall, city facades, traffic lights. Still wanted: glass office tower, Israeli shikun block. Done 2026-11-12: lab room, workbench, 3D printer, charging wall, farm robot. Done 2026-11-04: drone, park/outdoor, tray, Mars rover, solar panels, operating room, robot vacuum.
- Note: only GitHub is reachable from sessions (poly.pizza, polyhaven.com, kenney.nl, quaternius.com are blocked). Good mirrors: github.com/trebeljahr/quaternius-showcase (all Quaternius packs, Draco → decode with `npx @gltf-transform/cli copy`), github.com/ETdoFresh/kenney.nl (older Kenney 3D kits: space, food, nature, tower-defense). When nothing exists, build it in engine/props/kit.js. Note: GitHub repo search is blocked in sessions; find repos via web search, then clone.
