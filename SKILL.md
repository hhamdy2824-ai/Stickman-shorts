---
name: stickman-shorts
description: Make 60-second stickman self-improvement shorts (YouTube Shorts, Facebook Reels, TikTok) in the style of Stick To It, Simply Animated and Pathlight — cap-wearing characters, split-screen comparisons, mindset rows, metaphor montages, lamps, particles, music and SFX, plus SEO for all three platforms. Use when someone asks for a stickman / motivational / "overthinker vs doer" style short video.
---

# Stickman Shorts

A complete Remotion engine bundled with this skill. A whole video is ONE small JSON file (a "spec"); the engine turns it into a 1080×1920, 30 fps MP4 with music and sound effects. No voiceover, no paid APIs, no AI image generation.

## Setup (once per environment)
1. Copy this skill folder to a working directory, e.g. `cp -r <skill-folder> ~/stickman-shorts && cd ~/stickman-shorts`.
2. `npm i --no-audit --no-fund` (Node 18+). Remotion downloads its own headless Chrome on first render; if a system Chrome exists at `/usr/bin/google-chrome` it is used instead (`remotion.config.ts`).

## Make videos
1. Read `PLAYBOOK.md` (rules for story, motion, SEO, posting times) and `SPEC.md` (the JSON format). `specs/sample.json` is a full 61 s example.
2. Write `specs/<id>.json`: 3–4 segments on ONE theme (types `split`, `rows`, `scene`), 1800–1860 frames total, hero = yellow cap, rival = red cap.
3. Check before rendering — render a few stills and look at them:
   `npx remotion still Spec out/<id>-f300.png --frame=300 --scale=0.3 --props=specs/<id>.json`
4. Render: `npx remotion render Spec out/<id>.mp4 --props=specs/<id>.json --crf=21` (about 9 minutes per minute of video on 2 CPU cores).
5. Write the YouTube / Facebook / TikTok titles, captions and hashtags with the template in `PLAYBOOK.md`.
6. Optional learning loop: append a line per video to `log/videos.jsonl`, add view counts to `log/metrics.md`, and keep lessons in `log/learnings.md`; read the last 4 entries before writing new specs.

## Customize
- Characters, colors, fonts, watermark: `src/style/theme.ts` (set `VIDEO.watermark` to your channel name).
- 104 props: `src/props/Props.tsx` · 40+ poses: `src/rig/poses.ts` · effects: `src/fx/Effects.tsx` · templates: `src/templates/Templates.tsx` · JSON renderer: `src/spec/SpecVideo.tsx`.
- Previews: `npx remotion still PropSheet out/props.png`, `PoseSheet`, `CharacterSheet`.
- New original music: `python3 scripts/make_music.py` (needs numpy, scipy, ffmpeg).

## Rules
- Original scenes only — copy the style, never another channel's exact scenes (YouTube "reused content" and Facebook "unoriginal content" rules).
- Mark videos "not made for kids" only if true for your audience; never invent view counts in the log.
