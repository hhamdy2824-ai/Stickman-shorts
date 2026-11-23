# Production playbook — read this, not the skills, on every run

Channel: English stickman self-improvement shorts for US/UK audiences (YouTube Shorts, Facebook Reels, TikTok).
Characters: hero = yellow cap (does it right), rival = red cap (the other side). Music + SFX only, no voiceover.

## Each run: 2 videos
1. Read `log/videos.jsonl` (last 4 lines) and `log/learnings.md`. Never repeat a scenario, metaphor or title pattern used in the last 20 videos.
2. Pick 2 different topic types from the bank (below); mix formats.
3. Write `specs/<id>.json` per `SPEC.md`. ID = `V<3-digit number>-<slug>`, continuing the log numbering.
4. Check before rendering: 5 stills per video (frames 90, ~25%, ~50%, ~75%, total-40) at `--scale=0.3`, combined in ONE image and looked at once. Fix overlaps, empty space, props not touching hands/ground, unreadable text. On the hit/dig/pour frames the tool must touch the target.
5. Render: `npx remotion render Spec out/<id>.mp4 --props=specs/<id>.json --crf=21` (one per command, ~9 min each).
6. Write `out/<id>.meta.md` (SEO below) and append one line to `log/videos.jsonl`.
7. Send both MP4s + both meta files to the user.

## Video rules
- Length 1800–1860 frames (60–62 s). 3–4 segments on ONE theme (like Simply Animated montages); each segment its own mini payoff.
- First 3 s: story line in the header + action already moving (no intro, no logo). Readable on mute.
- One idea per segment; the contrast must be visible without text (hero wins visibly, rival loses visibly).
- Every 5–8 s something changes: new pose, prop appears, counter jumps, shake, burst, light.
- End: lesson line (typewriter font) then end card "Which one are you?" (last 75 frames). Video should loop cleanly.
- Music: reflective-piano (discipline/patience), rising-hope (wins/progress), tense-pulse (money loss, fake friends, anger).
- Text: max ~28 characters per line, 2 lines, 1 highlighted word. Plain US English.

## Motion rules (the reference channels never stand still)
- A key pose every 10–20 frames; to HOLD a pose, repeat it as the next key (keys arrive fast with a small overshoot by default — "snap").
- No actor keeps the same pose more than ~45 frames; idle actors still shift (think → point → facepalm → shrug).
- Every segment: at least one actor TRAVELS (loop.move or keys with x offsets) and at least one prop MOVES (drop with ease "drop", roll with spin + x range, slide, grow, fill, build).
- Something enters, falls, breaks or changes every ~3 s. Pair every hit with impact + burst + shake + SFX on the same frame.
- Loops: walk 8–10 frames per step, run 6–7, push 12–14, typing 6–8. Fast moves (punch, throw, jump, fall) get automatic smear trails.
- Show the passage of time with a counter + visible change (stone rounds, wall builds, jar fills, tree grows), not with text alone.

## Standing quality rules — every run, no exceptions
1. Everything must look REAL: how things are made, how they move, how the action is done and how it ends (a wall is built brick by brick, a hole is dug scoop by scoop, a plant is watered and grows, a door is opened by a hand on the handle...).
2. If a scene needs a prop, pose, action or effect the engine doesn't have, BUILD IT in the engine during the run (props in src/props/Props.tsx, poses in src/rig/poses.ts, contact actions in src/spec/actions.tsx). Never shrink the idea to what already exists and never fake it.
3. Hands and feet must be real: hands actually grip/touch what they use (both hands on two-hand tools); feet stay planted on the ground while standing/working (no sliding, no floating, no sinking); walking/running steps match the travel distance; weight shifts with the effort (lean into a push, bend knees to lift, brace before a swing).
4. Every video must be better than the one before: in the review, name what was weakest in the previous video (log self_check) and fix it in this run; add at least ONE engine improvement per run (new prop/pose/action/realism fix) and log it in learnings.md ("Engine: ...").
5. Check stills specifically on contact frames (tool touching, coin entering, foot on ground) before rendering.

## Real contact rules (every video)
Every interaction must look physically real: the tool/hand TOUCHES the thing and the thing visibly CHANGES.
- Digging → `action: dig` (shovel in both hands, blade enters the ground, dirt flies onto a growing pile, hole deepens).
- Watering → `action: water` (can held by the handle, tilted, stream reaches the plant, plant grows under the stream).
- Hammer/axe/pickaxe → `action: hammer` (head lands on the target's top on the hit frame + sparks/impact/shake/sound).
- Saving coins → `action: drop` (hand over the open jar/piggy bank, coin falls in, fill rises per coin).
- Never fake these with plain keys + floating props (no coins flying from a distance, no tool pointing at the air, no plant growing with nobody touching it). If an action type doesn't exist for a new interaction, add it to the engine (src/spec/actions.tsx) instead of faking it, and re-zip the engine.
- Use `at` / `target.x` / `plant.x` to say WHERE the contact happens; the engine moves the actor so it lands there.

## Topic bank (8 types, rotate)
1 Discipline & consistency · 2 Overthinking vs action · 3 People & relationships (fake friends, boundaries, trust) · 4 Money habits (spender/saver/investor) · 5 Mindset battle — action/adventure (discipline vs motivation vs obsession vs anger, flying bricks, sparks) · 6 Patience & failure · 7 You vs you / ego · 8 Trends & relatable irony (current events — check the news only if needed).

## SEO — YouTube Shorts (youtube-publishing-and-metadata + youtube-shorts skills)
- Title ≤ 60 chars, primary keyword in the first ~40, rank + curiosity. Patterns: "Overthinker vs Doer: Same Stone" · "Same Paycheck, 3 Different Endings" · short aphorism "Discipline Beats Motivation". End with `#shorts`.
- Description: line 1 = the value/story in one sentence; lines 2–3 contain the primary keyword naturally; then the question "Which one are you? 👇"; then 3–5 hashtags (`#shorts #selfimprovement #mindset #motivation` + 1 topic tag). No keyword stuffing.
- Tags (minor signal): first tag = exact primary keyword, then 4–8 related (stickman animation, self improvement, discipline, motivation, topic terms).
- Category: Education. Made for kids: NO (adult self-improvement; truthful COPPA setting). Altered/synthetic content: not needed (stylised animation, nothing realistic).
- Thumbnail/A-B title tests: native in YouTube Studio.

## SEO — Facebook Reels
- First line = hook (5–10 words + 1 emoji). 2–4 short lines: setup, what each side did, the lesson. Share line ("Send this to someone who…"). Question. 4–5 hashtags incl. a brand tag.
- Original content only (no watermarks from other apps). Post via Meta Business Suite at the slot times.

## SEO — TikTok
- Caption 1–2 lines (≤150 chars before hashtags) + the question. 3–5 hashtags: `#stickman #selfimprovement #mindset` + 1–2 topic tags. Keyword in the caption text too (TikTok search reads captions and on-screen text).
- Content is original animation; no AI-generated-content label required (not realistic). Allow Duet/Stitch.

## Posting slots (US audience, New York time)
Video A → YouTube + TikTok 7:30 AM, Facebook 11:15 AM.
Video B → YouTube + TikTok 11:15 AM, Facebook 6:00 PM.
Convert to your own time zone and re-check after daylight-saving changes.

## Review (every run, last 4 videos)
Look at the last 4 log entries + any numbers the user added in `log/metrics.md`. Write 1–3 short, concrete lessons into `log/learnings.md` (keep the file ≤ 40 lines, merge duplicates). Apply them to the new specs. Never invent view counts.

## Meta file template (out/<id>.meta.md)
```
# <id>
Topic type: <n> · Music: <file> · Length: <s>
## YouTube
Title: … #shorts
Description: …
Tags: …
Category: Education · Made for kids: No
Post: <slot>
## Facebook
Caption: …
Post: <slot>
## TikTok
Caption: …
Post: <slot>
```
