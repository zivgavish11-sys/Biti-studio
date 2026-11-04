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

## HDRI (engine/assets/hdri/, Poly Haven CC0)
- moonless_golf_1k.hdr — night sky; moodier, deeper image-based light for outdoor night scenes (tested on ep005: less washed-out stone).
- venice_sunset_1k.hdr — warm sunset; for "future/hopeful" endings.
  Use: RGBELoader → PMREM.fromEquirectangular → scene.environment (intensity ~1.4, hemisphere ~.35). Not the default yet (needs Ziv's OK).

## Fonts (engine/assets/fonts/)
- Rubik 400/700 (OFL) — UI/captions. Frank Ruhl Libre (OFL).

## Wanted next
- Drone, robot arm/gripper, Mars rover, warehouse shelves/boxes, solar panels, operating-room props (CC0). Note: GitHub repo search is blocked in sessions; find repos via web search, then clone.
