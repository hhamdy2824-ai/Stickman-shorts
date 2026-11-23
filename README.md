# Stickman Shorts — a Claude skill

Make 60-second stickman self-improvement shorts for YouTube Shorts, Facebook Reels and TikTok with Claude: cap-wearing characters, split-screen "A vs B" comparisons, mindset rows, metaphor montages, hanging lamps, particles, original music and sound effects, plus SEO for all three platforms. Everything is free and open source (Remotion + bundled fonts and music).

## Install
**Claude (web / desktop):** download this repo as a ZIP (Code → Download ZIP), then in Claude open Settings → Capabilities → Skills → Upload skill and pick the ZIP.
**Claude Code:** `git clone https://github.com/hhamdy2824-ai/stickman-shorts ~/.claude/skills/stickman-shorts`

Then ask Claude: *"Make a stickman short about overthinking vs taking action."* Claude reads `SKILL.md`, writes a JSON spec, checks stills and renders the MP4.

## Run it yourself
```bash
npm i
npx remotion studio                      # live preview
npx remotion render Spec out/sample.mp4 --props=specs/sample.json
```

## License
Code: MIT. Fonts: Inter, Courier Prime, Special Elite (SIL Open Font License). Music and sound effects in `public/` were synthesized for this project and are free to use. Remotion is free for individuals and teams of up to 3 people; larger companies need a Remotion company license (remotion.dev/license).

## Where things are

| Path | What |
| --- | --- |
| `src/style/theme.ts` | **The look.** Character styles (body, shade, outline, limb, head, eyes, aura, proportions), palette, mindset colors, fonts, watermark. A custom stickman design = edit this file. |
| `src/rig/Stickman.tsx` | Volumetric figure: outline + fill, far limbs shaded, hand/foot blobs, eyes with moods (`normal happy sad angry shocked`), colored aura, `handProp` / `backHandProp` / `headProp`. |
| `src/rig/poses.ts` | 40+ poses (stand, walk, run, push, carry, sit, sleep, typing, phone, punch, kick, throw, climb, pull rope, dig, jump, cheer, facepalm…), `cycle()` loops, `sampleTrack()` easing. Angles: 0 = down, 90 = right, 180 = up. |
| `src/props/Props.tsx` | **104 props**: furniture (chair, office chair, table, desk, bed, sofa, door, window, shelf, lamp), tech (laptop, monitor, TV, phone, keyboard, camera, controller), school/office (whiteboard that fills with plans, blackboard, books, paper, clock, calendar, bags, mug, bottle), sports (soccer ball, basketball, hoop, goal, dumbbell, barbell, pull-up bar, punching bag, trophy, medal, finish line, flag, target), tools (hammer, sledgehammer, shovel, pickaxe, axe, saw, rope, ladder, wheel incl. square wheel, cart, toolbox, bucket), nature (boulder that rounds over time, rock, brick, brick wall that builds, tree incl. money tree, sprout, plant, hill, slope, stairs, mountain, cloud, sun, water, fish, rod), money (coin, stacks, cash, money bag, jar that fills, piggy bank, card, wallet, safe, leaking pipe), misc (box, gift, car, bike, house, road sign, battery, bulb, heart, hourglass, balance scale, key, lock, chain, bomb, bell, mirror, speech/thought bubbles, !, zzz, sweat, arrow, check/cross). Preview: `PropSheet`. |
| `src/fx/Effects.tsx` | Hanging lamps with light cones + floor pools, spotlights, light burst, backgrounds (plain / concrete / stage), film grain, rough stone texture, particles (`dust sparks debris confetti coins smoke sweat`), speed lines, impact rings, camera push-in + shakes, white flash, `EndCard` (question + FOLLOW FOR MORE). |
| `src/components/Scene.tsx` | Base frame, typewriter labels (glowing in mindset colors), counters, timed `StoryText` (hook font or typewriter), `Place` for props. |
| `src/templates/Templates.tsx` | `SplitCompare` (top/bottom panels, lamps, divider counter "SAME STONE / DAY 16"), `StackedRows` (3–4 mindsets, concrete bg, glowing labels), `Montage` (4–5 metaphor segments, Simply Animated). |
| `src/videos/Sheets.tsx` | PropSheet, PoseSheet, CharacterSheet previews. |
| `src/videos/Tests.tsx` | Engine tests for all three templates — use as starting points. |
| `public/music/` | Original synthesized beds (MP3): `reflective-piano`, `rising-hope`, `tense-pulse` (`python3 scripts/make_music.py`). |
| `public/sfx/` | whoosh, thud, pop, coin, crack, tick, win. |
| `public/fonts/` | Inter, Courier Prime (typewriter), Special Elite — bundled for offline rendering. |

## Make a new video

1. Copy the matching test in `src/videos/Tests.tsx` into `src/videos/V001-Title.tsx`.
2. Write the story lines, tracks (poses over time), props (`back` / `front` per panel), effects and end card.
3. Register in `src/Root.tsx`, check stills: `npx remotion still V001-Title out/check.png --frame=120 --scale=0.4`
4. Render only when approved: `npx remotion render V001-Title out/V001-Title.mp4 --crf=20`
