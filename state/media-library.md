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

## HDRI (engine/assets/hdri/, Poly Haven CC0)
- moonless_golf_1k.hdr — night sky; moodier, deeper image-based light for outdoor night scenes (tested on ep005: less washed-out stone).
- venice_sunset_1k.hdr — warm sunset; for "future/hopeful" endings.
  Use: RGBELoader → PMREM.fromEquirectangular → scene.environment (intensity ~1.4, hemisphere ~.35). Not the default yet (needs Ziv's OK).

## Fonts (engine/assets/fonts/)
- Rubik 400/700 (OFL) — UI/captions. Frank Ruhl Libre (OFL).

## Wanted next
- Drone, robot arm/gripper (industrial), warehouse shelves/boxes, router/cell tower (grouper-style everyday props). Done 2026-11-04: Mars rover, solar panels, operating room, robot vacuum.
- Note: only GitHub is reachable from sessions (poly.pizza, polyhaven.com, kenney.nl, quaternius.com are blocked). Good mirrors: github.com/trebeljahr/quaternius-showcase (all Quaternius packs, Draco → decode with `npx @gltf-transform/cli copy`), github.com/ETdoFresh/kenney.nl (older Kenney 3D kits: space, food, nature, tower-defense). When nothing exists, build it in engine/props/kit.js. Note: GitHub repo search is blocked in sessions; find repos via web search, then clone.
