# ep016-robotaxi — visual script v1 (hero look, one world, camera flies)
World: the citycorner/streetCorner kit (reused from ep015 — same city, new story), a street with parked cars (car-suv, car-sedan) along the kerb. Hero = vehicles/robotaxi with 'lidar', 'lidarHead' and 'radar' HIDDEN (Tesla = cameras only), cam0..5 pods visible. Child = small mannequin-walk (h ~1.1) with a ball. No Tesla logo/name on the car, no brands. Indigo, one accent (light blue).
1. 0–3 s hook "ילד קופץ לכביש...": high 3/4, robotaxi driving toward camera; between two parked cars a small figure with a ball, frozen mid-step at the kerb. Title on screen. Two floating timers over the scene: "אתם" / "רכב אוטונומי" (both "?").
2. "אין לייזר ואין רדאר. רק מצלמות.": camera swings to the roof; ghost outlines of a lidar + radar appear, get a light-blue X and fade; the 6 camera pods light up in accent one by one. Callout "רק מצלמות".
3. "אז איך מצלמה יודעת...": close on one camera pod (front).
4. "מצלמות מכל צדי הרכב... עשרות פעמים בשנייה": crane up to top-down; 6 view cones around the car (viewCone from fx-city); small photo frames peel off each cone in a fast rhythm (photoCards) — no number on screen, just the fast rhythm.
5. "כל התמונות נכנסות למוח אחד, רשת עצבית ענקית": the frames fly into the car; x-ray the car body (opacity ~.2) → a glow-free node network (dots + lines, accent) inside, pulses travel through it.
6. "למדה מהמון סרטונים...": floating screen joined by a dashed line to the network: Hebrew UI, a strip of many small "driving clip" thumbnails scrolling, one marked "רגע מסוכן".
7. "מעריכה מרחק, קצת כמו העיניים שלכם": back to the street from behind the car; dashed distance lines from the car to parked cars and to the child with labels (callout "מרחק", no numbers); small eye icon next to the cameras.
8. "וכשילד קופץ מאחורי רכב חונה...": re-hook shift — light drops, camera low behind the parked SUV; the child starts running out; a light-blue box (detBox) snaps on him; dashed arrow predicts his path across the lane.
9. "אף אחד לא כתב לה חוק...": floating screen with a code line "אם ילד ← תבלמי" gets crossed out; a single arrow "תמונה → החלטה" replaces it.
10. "הפקודה עוברת בחשמל, בלי רגל": x-ray again — a pulse runs from the network to the 4 brake discs (wheels), car stops short of the child, tyre marks; ball rolls on.
11. "ולנהג אנושי לוקח בערך שנייה...": split beat — a second regular car beside it with a driver figure; timer "~1 שנייה" fills while a foot icon moves to the pedal; the robotaxi timer is already done. (Wording on screen only "בערך שנייה" — nothing faster claimed as a number for the robotaxi.)
12. outro card "עוד הסברים על רובוטים? תעקבו.": scene shrinks into the card, Follow button; composition echoes frame 0 for the loop.
Assets: all exist (robotaxi, streetCorner, car-suv/sedan, mannequin-walk, people, fx-city viewCone/photoCards). Need: a ball (sphere primitive is fine).
