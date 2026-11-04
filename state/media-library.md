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
  Tip: at 30 fps fast-spinning blades strobe / look frozen — see proposal "prop discs" (engine/props/showcase-drone-disc). Fits: ep006-drone, delivery drones, drone news.
- **home/trayGlasses** (in-house CC0): round waiter tray Ø0.36 m with 5 stemmed glasses (glass0..4, drink0..4 wine/juice). Pair with a person using clip 'holding-both' (tray at ~45% of the person's height, a bit in front). Fits: the "waiter with a full tray" joke, restaurants, service robots.
- **outdoor/** (added 2026-11-04, Quaternius CC0, 1.8 MB): CommonTree_1..3, PalmTree_1/3 (Israeli feel), Bush_1/2, Flowers, Grass, Rock_1, Bench_1, Streetlight_Single,
  apartment blocks 2Story_Balcony, 3Story_Balcony, 4Story (backdrop with balconies). Fits: park / balcony / street scenes, wind gusts, delivery robots on sidewalks. Use tint ~.8 if too bright at night.
  Showcase: `python3 tools/render.py frames engine/props/showcase-drone 2,6,10,14` (park wide, drone, x-ray, waiter).

## HDRI (engine/assets/hdri/, Poly Haven CC0)
- moonless_golf_1k.hdr — night sky; moodier, deeper image-based light for outdoor night scenes (tested on ep005: less washed-out stone).
- venice_sunset_1k.hdr — warm sunset; for "future/hopeful" endings.
  Use: RGBELoader → PMREM.fromEquirectangular → scene.environment (intensity ~1.4, hemisphere ~.35). Not the default yet (needs Ziv's OK).

## Fonts (engine/assets/fonts/)
- Rubik 400/700 (OFL) — UI/captions. Frank Ruhl Libre (OFL).

## Wanted next
- Robot arm/gripper (industrial), warehouse shelves/boxes, router/cell tower (grouper-style everyday props). Done 2026-11-04: drone, park/outdoor, tray, Mars rover, solar panels, operating room, robot vacuum.
- Note: only GitHub is reachable from sessions (poly.pizza, polyhaven.com, kenney.nl, quaternius.com are blocked). Good mirrors: github.com/trebeljahr/quaternius-showcase (all Quaternius packs, Draco → decode with `npx @gltf-transform/cli copy`), github.com/ETdoFresh/kenney.nl (older Kenney 3D kits: space, food, nature, tower-defense). When nothing exists, build it in engine/props/kit.js. Note: GitHub repo search is blocked in sessions; find repos via web search, then clone.
