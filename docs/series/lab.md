# Series: "המעבדה של העוקבים" (Biti's followers' lab) — approved by Ziv 2026-11-04

Inspired by a Hebrew creator's "gym of followers" series (comment a keyword → your name on a locker; every 25 followers a new machine).
Our version lives in the robot world. Owners: **video agent** builds the episodes, **community agent** runs the members list + counts, **media agent** supplies models.

## Mechanic
- Comment **"קהילה"** → you get a **charging station (עמדת טעינה) with your name** on the lab's charging wall.
- In the same comment, write **which robot to add next**.
- **Every 25 new followers** → a new robot joins the lab. Chosen by a **poll in the Instagram broadcast channel** of @robotics.israel (Ziv's choice: broadcast-only channel, no WhatsApp, nothing under his own name).
  Each new robot also gets its own explainer episode.
- **Every robot does something** (Ziv): a fixed action loop that repeats in every part — autonomous car drives a small track, stops at obstacles, lidar rays visible ·
  humanoid walks, lifts boxes, stocks a shelf · robot dog runs and climbs small stairs · arm assembles on the bench · drone hovers and circles the lab.
  **No branded replicas** (no Optimus/Tesla look, no car logos) — generic designs of the category.
- Part N shows the names of new members on their stations (list: `state/community-members.md`, kept by the community agent).

## Part 1 — script (approved; video agent adds niqqud/braces, `{אלאמד|אלמד}` rule doesn't apply here)
בניתי מעבדת רובוטים, וכל מי שמגיב "קהילה", מקבל בה עמדת טעינה עם השם שלו!
אני ביטי, וזו המעבדה שלי כרגע.
יש פה שולחן עבודה, זרוע רובוטית, ומדפסת תלת מימד.
כן, קצת ריק פה... בינתיים.
ופה, הקיר של עמדות הטעינה.
כרגע יש בו רק עמדה אחת... שלי.
כל השאר מחכות לכם.
וכל עשרים וחמישה עוקבים חדשים, נכנס למעבדה רובוט חדש.
אז תגיבו "קהילה", ותכתבו איזה רובוט להכניס ראשון!
את השם שלכם תמצאו בחלק שתיים.

## Part 1 — visuals
- Fixed top tag (whole video): "המעבדה של העוקבים · חלק 1".
- Frame 0: the lab from above with Biti, camera already moving (thumbnail).
- Tour: workbench → robot arm **assembling** → 3D printer **printing** (things move, not a static room). Biti moves around showing the lab.
- The charging wall: a row of empty stations with blank name plates; only one has a plate "ביטי" with Biti charging in it → dolly-in to it.
- On-screen counter "0/25 ← רובוט חדש".
- End card: "תגיבו: קהילה + איזה רובוט?" — last frame echoes frame 0 (loop).
- Classic look (no glow), real props from the library, Hebrew text on plates rendered as textures.
- Caption line 1 suggestion: "המעבדה של העוקבים: תגיבו קהילה וקבלו עמדת טעינה עם השם שלכם 🤖". Pinned comment: "איזה רובוט להכניס ראשון? 🤖🚗🐕🦾🚁".

## Order
One open episode at a time: build after the open episodes (ep003-vacuum, ep004-surgeon) are done.
