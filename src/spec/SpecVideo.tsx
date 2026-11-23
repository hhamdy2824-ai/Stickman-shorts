// =====================================================================
//  SPEC VIDEO — a whole short described in one small JSON file.
//  Writing a JSON (not code) per video keeps every production run cheap.
//  Format reference: SPEC.md · examples: specs/*.json
// =====================================================================
import React from "react";
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from "remotion";
import {ActionSpec, Ctx, Expanded, expandAction} from "./actions";
import {HeldTool} from "../rig/Stickman";
import {Key, KeyEase, PoseName, cycle} from "../rig/poses";
import {Easing} from "remotion";
import {Mood} from "../rig/Stickman";
import {CharacterName, HIP_H, MINDSET_COLORS, PALETTE, VIDEO} from "../style/theme";
import {PROPS, PropName} from "../props/Props";
import {Place, Line, Scene, StoryText, Ground} from "../components/Scene";
import {Burst, Camera, EndCard, Impact, Lamp, LightBurst, ParticleKind, SpeedLines, Spotlight, Flash} from "../fx/Effects";
import {Actor, ActorView, Sounds, SplitCompare, StackedRows} from "../templates/Templates";

// ---------- JSON types ----------
type Num = number | [number, number];           // fixed, or [from, to] animated over `at`
type Range = [number, number];                   // frames inside the segment
export type PropSpec = {
  name: PropName;
  x: Num; y?: Num | "ground";                    // y defaults to the ground line
  s?: Num; r?: Num; spin?: number;               // spin = degrees per frame
  at?: Range;                                    // animation window for [from,to] values (default whole segment)
  ease?: "smooth" | "bounce" | "back" | "linear" | "drop"; // how [from,to] values move (default smooth; drop = gravity + bounce)
  show?: Range;                                  // only visible in this window
  flip?: boolean; front?: boolean;               // front = drawn over the figures
  params?: Record<string, Num | string | boolean>; // prop options: round, built, fill, level, drawing, tilt, open, text...
};
export type ActorSpec = {
  character?: CharacterName;
  x?: number;                                    // anchor x (default center)
  keys?: [number, PoseName, number?, KeyEase?][]; // [frame, pose, xOffset?, ease?] ease: snap (default) | smooth | slow | linear
  loop?: {poses: PoseName[]; every: number; from?: number; to?: number; move?: [number, number]};
  flip?: boolean; scale?: number;
  mood?: Mood | [number, Mood][];
  hold?: {name: PropName; s?: number; params?: Record<string, Num | string | boolean>; mode?: "tool" | "hand"}; // tools (Shovel, hammers, Axe, Pickaxe) follow both hands automatically
  action?: ActionSpec | ActionSpec[];            // real work with contact: dig | hammer | water | drop (see SPEC.md)
};
export type FxSpec =
  | {type: "burst"; kind?: ParticleKind; x: number; y?: number; at: number | number[]; count?: number; power?: number; dir?: number; spread?: number; panel?: "top" | "bottom"; row?: number; floor?: number}
  | {type: "impact"; x: number; y: number; at: number | number[]; color?: string; panel?: "top" | "bottom"; row?: number}
  | {type: "light"; x: number; y: number; at: number}
  | {type: "flash"; at: number}
  | {type: "speed"; x: number; y: number; show: Range; dirX?: number};
type Side = {label: string; color?: string; actor: ActorSpec; props?: PropSpec[]; counter?: {from: number; to: number; caption?: string; prefix?: string}; lights?: "lamps" | "spot" | "none"; lampXs?: number[]};

export type Segment =
  | {type: "split"; dur: number; story?: Line[]; top: Side; bottom: Side; divider?: {caption?: string; from: number; to: number; prefix?: string}; fx?: FxSpec[]; shakes?: {at: number; power?: number}[]}
  | {type: "rows"; dur: number; story?: Line[]; rows: (Side & {mindset?: keyof typeof MINDSET_COLORS})[]; fx?: FxSpec[]; shakes?: {at: number; power?: number}[]}
  | {type: "scene"; dur: number; title?: string; story?: Line[]; ground?: number; lights?: "lamps" | "spot" | "none"; lampXs?: number[]; actors: ActorSpec[]; props?: PropSpec[]; fx?: FxSpec[]; shakes?: {at: number; power?: number}[]};

export type VideoSpec = {
  id: string;
  music?: string; musicVolume?: number;
  sfx?: {src: string; at: number; volume?: number}[];   // global frames
  segments: Segment[];
  end?: {question?: string; highlight?: string; follow?: string; frames?: number};
  fade?: number;
};

// ---------- helpers ----------
const EASE = {
  smooth: Easing.inOut(Easing.sin),
  bounce: Easing.bounce,
  drop: Easing.bounce,
  back: Easing.out(Easing.back(1.7)),
  linear: (t: number) => t,
  fall: Easing.in(Easing.quad),
};
const val = (v: Num | undefined, f: number, at: Range | undefined, dur: number, def = 0, ease: keyof typeof EASE = "smooth"): number => {
  if (v === undefined) return def;
  if (typeof v === "number") return v;
  const [a, b] = at ?? [0, dur];
  return interpolate(f, [a, b], v, {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE[ease]});
};
const params = (p: PropSpec["params"], f: number, at: Range | undefined, dur: number) => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p ?? {})) out[k] = typeof v === "function" ? (v as (f: number) => unknown)(f) : typeof v === "number" || Array.isArray(v) ? val(v as Num, f, at, dur) : v;
  return out;
};

export const renderProp = (p: PropSpec, f: number, groundY: number, dur: number, i: number) => {
  if (p.show && (f < p.show[0] || f > p.show[1])) return null;
  const Comp = PROPS[p.name] as React.FC<Record<string, unknown>>;
  if (!Comp) return null;
  const y = p.y === undefined || p.y === "ground" ? groundY : val(p.y, f, p.at, dur, 0, p.ease ?? "smooth");
  const r = val(p.r, f, p.at, dur);
  const extra = params(p.params, f, p.at, dur);
  const spinning = ["Boulder", "Wheel", "Cart", "Car", "Bike"].includes(p.name);
  if (spinning && p.spin) extra.spin = p.spin * f;
  return (
    <Place key={i} x={val(p.x, f, p.at, dur, 0, p.ease === "drop" ? "linear" : p.ease ?? "smooth")} y={y} s={val(p.s, f, p.at, dur, 1)} r={r + (!spinning && p.spin ? p.spin * f : 0)} flip={p.flip}>
      <Comp {...extra} />
    </Place>
  );
};

const TOOL_NAMES = ["Shovel", "Sledgehammer", "Hammer", "Axe", "Pickaxe", "Saw", "FishingRod"];
const toActor = (a: ActorSpec, dur: number, ex: Expanded[] = []): Actor => {
  let track: Key[] = [];
  if (a.keys?.length) track = a.keys.map(([f, pose, x, ease]) => ({f, pose, x, ease}));
  if (a.loop) {
    const from = a.loop.from ?? 0, to = a.loop.to ?? dur;
    const mv = a.loop.move;
    const loopKeys = cycle(a.loop.poses, from, to, a.loop.every, mv ? (f) => interpolate(f, [from, to], mv) : undefined);
    track = [...track.filter((k) => k.f < from), ...loopKeys, ...track.filter((k) => k.f > to)];
  }
  const actKeys = new Set<Key>(ex.flatMap((e) => e.keys));
  for (const e of ex) track = [...track.filter((k) => k.f < e.window[0] || k.f > e.window[1]), ...e.keys];
  track.sort((p, q) => p.f - q.f);
  // keys after an action without their own x stay where the action left the actor (no teleport)
  let cur: number | undefined;
  track = track.map((k) => {
    if (actKeys.has(k)) { cur = k.x; return k; }
    return k.x === undefined && cur !== undefined ? {...k, x: cur} : k;
  });
  if (!track.length) track = [{f: 0, pose: "stand"}];
  const mood = a.mood;
  const h = a.hold;
  const holdTool: HeldTool | undefined = h && {mode: h.mode ?? (TOOL_NAMES.includes(h.name) ? "tool" : "hand"), render: () => null};
  return {
    track,
    character: a.character ?? "hero",
    flip: a.flip,
    scale: a.scale,
    mood: Array.isArray(mood) ? (f: number) => [...mood].reverse().find(([fr]) => f >= fr)?.[1] ?? "normal" : mood,
    tool: (f: number) => {
      for (const e of ex) { const t = e.tool?.(f); if (t) return t; }
      if (ex.some((e) => f >= e.window[0] && f <= e.window[1] && e.tool)) return undefined;
      if (!h || !holdTool) return undefined;
      const C = PROPS[h.name] as React.FC<Record<string, unknown>>;
      const pr = params(h.params, f, undefined, dur);
      return {...holdTool, render: (ctx) => <C s={h.s ?? 1} toGround={ctx.toGround} {...pr} />};
    },
  };
};

// expand every actor's actions for one stage (ground line + actor scale known)
type Prepped = {actor: Actor; ex: Expanded[]};
const prep = (a: ActorSpec, c: Ctx): Prepped => {
  const acts = a.action ? (Array.isArray(a.action) ? a.action : [a.action]) : [];
  const ex = acts.map((x) => expandAction(x, c));
  return {actor: toActor(a, c.dur, ex), ex};
};
const exProps = (ex: Expanded[]) => ex.flatMap((e) => e.props) as unknown as PropSpec[];
const exFx = (ex: Expanded[], rel: number, tag: Partial<{panel: "top" | "bottom"; row: number}>) =>
  ex.flatMap((e) => e.fx).map((x) => ({...x, y: x.y - rel, ...("floor" in x && x.floor !== undefined ? {floor: x.floor - rel} : {}), ...tag})) as unknown as FxSpec[];
const exShakes = (ex: Expanded[]) => ex.flatMap((e) => e.shakes);
const ActionAudio: React.FC<{ex: Expanded[]}> = ({ex}) => (
  <>
    {ex.flatMap((e) => e.sounds).map((s, i) => (
      <Sequence key={i} from={s.at} layout="none"><Audio src={staticFile(`sfx/${s.src}`)} volume={s.volume ?? 0.4} /></Sequence>
    ))}
  </>
);

const fxAt = (fx: FxSpec, i: number, yOff: (fx: FxSpec) => number) => {
  const ats = "at" in fx ? (Array.isArray(fx.at) ? fx.at : [fx.at]) : [];
  switch (fx.type) {
    case "burst": return ats.map((t, k) => <Burst key={`${i}-${k}`} x={fx.x} y={(fx.y ?? 0) + yOff(fx)} at={t} kind={fx.kind} count={fx.count} power={fx.power} dir={fx.dir} spread={fx.spread} floor={fx.floor === undefined ? undefined : fx.floor + yOff(fx)} seed={`${i}`} />);
    case "impact": return ats.map((t, k) => <Impact key={`${i}-${k}`} x={fx.x} y={fx.y + yOff(fx)} at={t} color={fx.color} />);
    case "light": return <LightBurst key={i} x={fx.x} y={fx.y} at={fx.at} />;
    case "flash": return <Flash key={i} at={fx.at} />;
    case "speed": return <SpeedLinesWindow key={i} fx={fx} />;
    default: return null;
  }
};

const SpeedLinesWindow: React.FC<{fx: Extract<FxSpec, {type: "speed"}>}> = ({fx}) => {
  const f = useCurrentFrame();
  return f >= fx.show[0] && f <= fx.show[1] ? <SpeedLines x={fx.x} y={fx.y} dirX={fx.dirX} /> : null;
};

// ---------- segment renderers ----------
const SPLIT_G = {top: 930, bottom: 1700};
const SplitSeg: React.FC<{seg: Extract<Segment, {type: "split"}>}> = ({seg}) => {
  const P = {
    top: prep(seg.top.actor, {ground: SPLIT_G.top, scale: seg.top.actor.scale ?? 1.25, ax: seg.top.actor.x ?? VIDEO.width / 2, flip: seg.top.actor.flip, character: seg.top.actor.character, dur: seg.dur}),
    bottom: prep(seg.bottom.actor, {ground: SPLIT_G.bottom, scale: seg.bottom.actor.scale ?? 1.25, ax: seg.bottom.actor.x ?? VIDEO.width / 2, flip: seg.bottom.actor.flip, character: seg.bottom.actor.character, dur: seg.dur}),
  };
  const side = (sd0: Side, which: "top" | "bottom") => {
    const sd: Side = {...sd0, props: [...exProps(P[which].ex), ...(sd0.props ?? [])]};
    const fxs = [...(seg.fx ?? []), ...exFx(P[which].ex, SPLIT_G[which], {panel: which})];
    return {
    label: sd.label,
    labelColor: sd.color,
    x: sd.actor.x,
    actor: P[which].actor,
    lights: sd.lights,
    lampXs: sd.lampXs,
    counter: sd.counter ? (f: number) => `${sd.counter!.prefix ?? ""}${Math.round(interpolate(f, [0, seg.dur * 0.85], [sd.counter!.from, sd.counter!.to], {extrapolateRight: "clamp"}))}` : undefined,
    counterCaption: sd.counter?.caption,
    back: (f: number, g: number) => <>{(sd.props ?? []).filter((p) => !p.front).map((p, i) => renderProp(p, f, g, seg.dur, i))}</>,
    front: (f: number, g: number) => (
      <>
        {(sd.props ?? []).filter((p) => p.front).map((p, i) => renderProp(p, f, g, seg.dur, i))}
        {fxs.filter((x) => "panel" in x && x.panel === which).map((x, i) => fxAt(x, i, () => g))}
      </>
    ),
  };
  };
  return (
    <>
    <ActionAudio ex={[...P.top.ex, ...P.bottom.ex]} />
    <SplitCompare
      story={seg.story}
      top={side(seg.top, "top")}
      bottom={side(seg.bottom, "bottom")}
      divider={seg.divider ? (f) => ({caption: seg.divider!.caption, value: `${seg.divider!.prefix ?? ""}${Math.round(interpolate(f, [0, seg.dur * 0.85], [seg.divider!.from, seg.divider!.to], {extrapolateRight: "clamp"}))}`}) : undefined}
      shakes={[...(seg.shakes ?? []), ...exShakes([...P.top.ex, ...P.bottom.ex])]}
    />
    </>
  );
};

const RowsSeg: React.FC<{seg: Extract<Segment, {type: "rows"}>}> = ({seg}) => {
  const lane = (1720 - 330) / seg.rows.length;
  const sc = Math.min(1.1, lane / 340);
  const G = (i: number) => 330 + lane * (i + 1) - 26;
  const P = seg.rows.map((r, i) => prep(r.actor, {ground: G(i), scale: sc, ax: r.actor.x ?? VIDEO.width / 2, flip: r.actor.flip, character: r.actor.character, dur: seg.dur}));
  const fxs = [...(seg.fx ?? []), ...P.flatMap((p, i) => exFx(p.ex, G(i), {row: i}))];
  return (
  <>
  <ActionAudio ex={P.flatMap((p) => p.ex)} />
  <StackedRows
    story={seg.story}
    shakes={[...(seg.shakes ?? []), ...exShakes(P.flatMap((p) => p.ex))]}
    rows={seg.rows.map((r0, ri) => {
      const r = {...r0, props: [...exProps(P[ri].ex), ...(r0.props ?? [])]};
      return {
      label: r.label,
      color: r.color ?? (r.mindset ? MINDSET_COLORS[r.mindset] : undefined),
      x: r.actor.x,
      actor: P[ri].actor,
      back: (f: number, g: number) => <>{(r.props ?? []).filter((p) => !p.front).map((p, i) => renderProp(p, f, g, seg.dur, i))}</>,
      front: (f: number, g: number) => (
        <>
          {(r.props ?? []).filter((p) => p.front).map((p, i) => renderProp(p, f, g, seg.dur, i))}
          {fxs.filter((x) => "row" in x && x.row === ri).map((x, i) => fxAt(x, i, () => g))}
        </>
      ),
    };})}
  />
  </>
  );
};

const SceneSeg: React.FC<{seg: Extract<Segment, {type: "scene"}>; f: number}> = ({seg, f}) => {
  const g = seg.ground ?? 1380;
  const lights = seg.lights ?? "spot";
  const P = seg.actors.map((a) => prep(a, {ground: g, scale: a.scale ?? 1.4, ax: a.x ?? VIDEO.width / 2, flip: a.flip, character: a.character, dur: seg.dur}));
  const ex = P.flatMap((p) => p.ex);
  const props = [...exProps(ex), ...(seg.props ?? [])];
  const fxs = [...(seg.fx ?? []), ...exFx(ex, 0, {})];
  return (
    <Scene bg="plain">
      <ActionAudio ex={ex} />
      <Camera zoomTo={1.05} shakes={[...(seg.shakes ?? []), ...exShakes(ex)]} total={seg.dur}>
        {lights === "spot" && (seg.lampXs ?? [VIDEO.width / 2]).map((x, i) => <Spotlight key={i} x={x} floorY={g} width={420} />)}
        {lights === "lamps" && (seg.lampXs ?? [360, 720]).map((x, i) => <Lamp key={i} x={x} top={420} floorY={g} width={380} />)}
        <Ground y={g} x1={40} x2={VIDEO.width - 40} />
        {props.filter((p) => !p.front).map((p, i) => renderProp(p, f, g, seg.dur, i))}
        {seg.actors.map((a, i) => {
          const sc = a.scale ?? 1.4;
          return <ActorView key={i} actor={P[i].actor} ax={a.x ?? VIDEO.width / 2} ay={g - HIP_H * sc} scale={sc} />;
        })}
        {props.filter((p) => p.front).map((p, i) => renderProp(p, f, g, seg.dur, i))}
        {fxs.map((x, i) => fxAt(x, i, () => 0))}
      </Camera>
      {seg.title && <text x={VIDEO.width / 2} y={330} textAnchor="middle" fontFamily="Courier Prime" fontWeight={700} fontSize={36} letterSpacing={6} fill={PALETTE.textMuted}>{seg.title.toUpperCase()}</text>}
      <StoryText lines={seg.story ?? []} y={200} />
    </Scene>
  );
};

const SegView: React.FC<{seg: Segment; fade: number}> = ({seg, fade}) => {
    const f = useCurrentFrame();
    const o = interpolate(f, [0, fade, seg.dur - fade, seg.dur], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
    return (
      <AbsoluteFill style={{opacity: o}}>
        {seg.type === "split" && <SplitSeg seg={seg} />}
        {seg.type === "rows" && <RowsSeg seg={seg} />}
        {seg.type === "scene" && <SceneSeg seg={seg} f={f} />}
      </AbsoluteFill>
    );
};

export const specLength = (s: VideoSpec) => s.segments.reduce((a, g) => a + g.dur, 0);

export const SpecVideo: React.FC<VideoSpec> = (spec) => {
  const total = specLength(spec);
  const endFrames = spec.end?.frames ?? 75;
  let start = 0;
  return (
    <AbsoluteFill style={{backgroundColor: PALETTE.bg}}>
      {spec.segments.map((seg, i) => {
        const from = start;
        start += seg.dur;
        return (
          <Sequence key={i} from={from} durationInFrames={seg.dur}>
            <SegView seg={seg} fade={spec.fade ?? 7} />
          </Sequence>
        );
      })}
      {spec.end && <EndCard from={total - endFrames} question={spec.end.question} highlight={spec.end.highlight} follow={spec.end.follow} />}
      <Sounds music={spec.music} musicVolume={spec.musicVolume ?? 0.32} sfx={spec.sfx} />
    </AbsoluteFill>
  );
};
