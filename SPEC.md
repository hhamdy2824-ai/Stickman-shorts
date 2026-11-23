# Video spec format (specs/<id>.json)

One JSON = one finished short. Render: `npx remotion render Spec out/<id>.mp4 --props=specs/<id>.json --crf=21`
Check stills first: `npx remotion still Spec out/<id>-f<frame>.png --frame=<frame> --scale=0.4 --props=specs/<id>.json`
See `specs/sample.json` for a full 61 s example using all three segment types.

```jsonc
{
  "id": "V001-same-stone",
  "music": "reflective-piano.mp3" | "rising-hope.mp3" | "tense-pulse.mp3",
  "musicVolume": 0.32,
  "segments": [ ... 3–4 segments, durations add up to 1800–1860 frames (60–62 s at 30 fps) ... ],
  "end": {"question": "Which one are you?", "highlight": "you", "frames": 75},   // end card over the last 75 frames
  "sfx": [{"src": "whoosh.wav", "at": 600}]   // global frames; whoosh thud pop coin crack tick win
}
```

All frames inside a segment are LOCAL (0 = segment start). 30 frames = 1 s.

## Actions — real work with real contact (use these, never fake them with keys)
Put `"action": {...}` (or a list of them) on any actor. The engine generates the poses, puts the tool in BOTH hands at the right angle, makes it touch the ground/target on the contact frame and shows the consequence + sound. Keys outside the action window still work; keys after it keep the actor where the action left it.
- `{"type":"dig","from":0,"to":300,"every":30,"at":480,"waterAt":290,"pile":true}` → shovel cycle (bite in → lift a load → toss), Hole that deepens, DirtPile that grows, dirt bursts. `at` = x of the hole (actor is moved to fit). `waterAt` = frame the hole fills with water.
- `{"type":"hammer","from":0,"to":300,"every":24,"tool":"Sledgehammer","target":{"name":"Boulder","x":640,"s":1.4,"show":[0,280]}}` → overhead swing, the head lands on the target's top every hit (sparks + impact + small shake + thud). Tools: Sledgehammer, Hammer, Axe, Pickaxe. Targets: Boulder, Rock, Box, BrickWall, Tree, Bomb.
- `{"type":"water","from":200,"to":450,"at":480,"plant":{"name":"Tree","s":1,"params":{"grow":[0.3,1],"money":true}}}` → watering can tilted, stream down to the plant, splashes, the plant grows under the stream.
- `{"type":"drop","from":100,"to":560,"every":46,"tool":"Coin","target":{"name":"Jar","x":640,"s":1.5,"params":{"fill":[0.05,0.95]}}}` → hand over the open container, the coin falls in, fill rises per coin (+coin sound). Containers: Jar, PiggyBank, Bucket.
Held tools (`hold` Shovel/Sledgehammer/Hammer/Axe/Pickaxe) also follow both hands automatically. New props: Hole (depth, water), DirtPile (size), WateringCan (tilt, pour). New particles: dirt, water. New poses: digIn digLift digToss hammerUp hammerHit pour dropIn.

## Segment types
- `split` — top/bottom A vs B (Stick To It). Keys: `top`, `bottom` (Side), `divider {caption, prefix, from, to}` (counter on the middle line, e.g. "SAME STONE / DAY 1→100"), `story`, `fx`, `shakes`. Panel ground: x 0–1080, props `y` default = panel ground.
- `rows` — 3–4 stacked mindsets (Pathlight). Keys: `rows[]` (Side + `mindset`: discipline | motivation | obsession | anger → label color), `story`, `fx` (use `row: i`), `shakes`.
- `scene` — one stage, any number of actors and props (Simply Animated metaphors, everyday situations). Keys: `title` (small caps under the header), `ground` (default 1380), `lights` lamps|spot|none, `lampXs`, `actors[]`, `props[]`, `fx[]` (absolute canvas y), `story`, `shakes`.

## Side (split panel / row)
`{"label": "Doer", "color": "#hex"?, "actor": Actor, "props": [Prop], "counter": {"from":0,"to":14,"prefix":"","caption":""}?, "lights": "lamps"|"spot"|"none", "lampXs": [x, x]}`

## Actor
```jsonc
{"character": "hero" | "rival" | "heroGlow" | "rivalDim" | "discipline" | "motivation" | "obsession" | "anger" | "gold" | "ghost" | "stick" | "stickGrey",
 "x": 360,                                   // anchor x
 "keys": [[0, "stand"], [60, "point", 40], [70, "point", 40], [80, "jump", 40, "smooth"]],  // [frame, pose, xOffset?, ease?] — snap (default, small overshoot) | smooth | slow | linear. Repeat a pose to hold it.
 "loop": {"poses": ["push", "push2"], "every": 14, "from": 0, "to": 600, "move": [0, 240]},  // repeating cycle, optional travel
 "mood": "normal" | [[0, "normal"], [300, "sad"]],   // normal happy sad angry shocked
 "hold": {"name": "Phone", "s": 1.2},         // prop in the near hand
 "flip": false, "scale": 1.4}
```
hero = yellow cap (the one who does it right) · rival = red cap (the other side).
Poses: stand think sadStand walkA walkB runA runB push push2 carry carryHeavy cheer sit slump fallen pushupUp pushupDown lift liftLow swing swingHit wave point shrug facepalm phone typing sitPhone sleep kneel crouch jump dig pullRope climbA climbB throw throwRelease kick punch hug sweat.

## Prop
`{"name": "Boulder", "x": 680 | [from,to], "y": "ground" | number | [from,to], "s": 1.2 | [from,to], "r": deg | [from,to], "spin": degPerFrame, "at": [f0,f1], "show": [f0,f1], "flip": false, "front": false, "params": {...}}`
`"ease": "smooth"(default) | "drop" (falls with gravity + bounce, use on y) | "bounce" | "back" | "linear"`. `[from,to]` values animate over `at` (default the whole segment). Useful params: Boulder `round` 0→1 · BrickWall `rows cols built` 0→1 · Jar `fill` · Battery `level` · Whiteboard `drawing` 0→1 · Tree `grow` `money` · Sprout `grow` · Scale `tilt` · Door `open` · Clock `t` · Hourglass `t` · Calendar `day` · Laptop/Monitor/TV `glow` · Lightbulb/FloorLamp `on` · Heart `broken` · Wallet `empty` · Pipe `leak` · SpeechBubble `text` · RoadSign `text` · Blackboard `text` · CoinStack/Cash `n` · Wheel/Cart `square`.
All 104 names: see `src/props/Props.tsx` (PROPS) or render `PropSheet`.

## FX
- `{"type":"burst","kind":"dust|sparks|debris|confetti|coins|smoke|sweat","x":0,"y":0,"at":[f,...],"count":14,"power":1,"dir":-90,"spread":160,"panel":"top"|"bottom","row":0}` (in split/rows, y is relative to that panel's ground)
- `{"type":"impact","x":0,"y":0,"at":[f],"color":"#FF5252"}` · `{"type":"light","x":0,"y":0,"at":f}` · `{"type":"flash","at":f}` · `{"type":"speed","x":0,"y":0,"show":[f0,f1],"dirX":-1}`
- `shakes: [{"at": f, "power": 10}]` camera shake.

## Story lines
`{"from": 0, "to": 120, "text": "Same stone.\n100 days.", "highlight": "100 days.", "font": "hook"|"type"}` — max ~28 characters per line, 2 lines.
