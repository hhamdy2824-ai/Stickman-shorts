import React from "react";
import {Audio, Sequence, interpolate, staticFile, useCurrentFrame} from "remotion";
import {Key, alive} from "../rig/poses";
import {Mood, Stickman, HeldTool} from "../rig/Stickman";
import {CharacterName, HIP_H, PALETTE, VIDEO} from "../style/theme";
import {Counter, Ground, Label, Line, Scene, StoryText} from "../components/Scene";
import {Camera, EndCard, Lamp, Spotlight} from "../fx/Effects";

// ---------- shared ----------
type F<T> = T | ((f: number) => T);
const at = <T,>(v: F<T> | undefined, f: number): T | undefined => (typeof v === "function" ? (v as (f: number) => T)(f) : v);

export type Actor = {
  track: Key[];            // x/y in keys are offsets from the lane anchor
  character?: F<CharacterName>;
  flip?: F<boolean>;
  scale?: number;
  mood?: F<Mood>;
  handProp?: F<React.ReactNode>;
  backHandProp?: F<React.ReactNode>;
  headProp?: F<React.ReactNode>;
  tool?: (f: number) => HeldTool | undefined;
};

export type Sound = {music?: string; musicVolume?: number; sfx?: {src: string; at: number; volume?: number}[]};
export type Ending = {endCard?: {from: number; question?: string; highlight?: string; follow?: string}};
export type CameraOpts = {zoomTo?: number; shakes?: {at: number; power?: number; dur?: number}[]};

export const Sounds: React.FC<Sound> = ({music, musicVolume = 0.5, sfx = []}) => (
  <>
    {music && <Audio src={staticFile(`music/${music}`)} volume={musicVolume} />}
    {sfx.map((s, i) => (
      <Sequence key={i} from={s.at} layout="none">
        <Audio src={staticFile(`sfx/${s.src}`)} volume={s.volume ?? 1} />
      </Sequence>
    ))}
  </>
);

export const ActorView: React.FC<{actor: Actor; ax: number; ay: number; scale?: number}> = ({actor, ax, ay, scale}) => {
  const frame = useCurrentFrame();
  const {pose, x, y, speed, ghost1, ghost2} = alive(actor.track, frame, Math.round(ax));
  const sc = scale ?? actor.scale ?? 1;
  const ch = at(actor.character, frame);
  const fl = at(actor.flip, frame);
  // smear trail on fast moves (punch, throw, jump) — like the reference channels' motion blur
  const trail = speed > 18 ? Math.min(1, (speed - 18) / 40) : 0;
  return (
    <>
    {trail > 0 && [ghost2, ghost1].map((g, i) => (
      <g key={i} opacity={(i ? 0.22 : 0.12) * trail}>
        <Stickman pose={g.pose} x={ax + g.x * sc} y={ay + g.y * sc} scale={sc} flip={fl} character={ch} style={{aura: null}} />
      </g>
    ))}
    <Stickman
      pose={pose}
      x={ax + x * sc}
      y={ay + y * sc}
      scale={sc}
      flip={at(actor.flip, frame)}
      character={at(actor.character, frame)}
      mood={at(actor.mood, frame)}
      handProp={at(actor.handProp, frame)}
      backHandProp={at(actor.backHandProp, frame)}
      headProp={at(actor.headProp, frame)}
      tool={actor.tool?.(frame)}
    />
    </>
  );
};

type Lights = "lamps" | "spot" | "none";

// ---------- Template 1: A vs B, split TOP / BOTTOM (Stick To It) ----------
// Each panel: wall + floor, optional hanging lamps, a label, a counter, props (`back` behind
// the figure, `front` in front of it). Coordinates in a panel: x 0..1080, groundY is passed in.
type Side = {
  label: string;
  labelColor?: string;
  actor: Actor;
  counter?: (f: number) => number | string;
  counterCaption?: string;
  back?: (f: number, groundY: number) => React.ReactNode;
  front?: (f: number, groundY: number) => React.ReactNode;
  lights?: Lights;
  lampXs?: number[];   // lamp positions (default: one over the figure + one to the side)
  x?: number;          // anchor x of the figure (default center)
};
export type SplitProps = Sound & Ending & CameraOpts & {
  story?: Line[];      // timed lines in the header
  top: Side;
  bottom: Side;
  divider?: (f: number) => {caption?: string; value?: string | number} | null; // "SAME STONE / DAY 16" on the divider
};

export const SPLIT = {headerY: 200, top: {y0: 300, ground: 930}, divider: 1000, bottom: {y0: 1070, ground: 1700}};

const Panel: React.FC<{side: Side; y0: number; groundY: number; delay: number}> = ({side, y0, groundY, delay}) => {
  const frame = useCurrentFrame();
  const lights = side.lights ?? "lamps";
  const ax = side.x ?? VIDEO.width / 2;
  const lamps = side.lampXs ?? [ax, ax + 380];
  const scale = side.actor.scale ?? 1.25;
  return (
    <g>
      <rect x={0} y={y0} width={VIDEO.width} height={groundY - y0} fill={PALETTE.wall} />
      <rect x={0} y={groundY} width={VIDEO.width} height={50} fill={PALETTE.floor} />
      {lights === "lamps" && lamps.map((lx, i) => <Lamp key={i} x={lx} top={y0 + 70} floorY={groundY} width={i === 0 ? 340 : 260} />)}
      {lights === "spot" && <Spotlight x={ax} floorY={groundY} />}
      <Ground y={groundY} />
      <Label x={VIDEO.width / 2} y={y0 + 52} text={side.label} delay={delay} glow={side.labelColor} size={36} />
      {side.counter && <Counter x={VIDEO.width - 70} y={y0 + 56} value={side.counter(frame)} anchor="end" caption={side.counterCaption} size={46} />}
      {side.back?.(frame, groundY)}
      <ActorView actor={side.actor} ax={ax} ay={groundY - HIP_H * scale} scale={scale} />
      {side.front?.(frame, groundY)}
    </g>
  );
};

export const SplitCompare: React.FC<SplitProps> = ({story = [], top, bottom, divider, endCard, zoomTo = 1.04, shakes, ...sound}) => {
  const frame = useCurrentFrame();
  const dv = divider?.(frame);
  return (
    <Scene overlay={endCard && <EndCard {...endCard} />}>
      <Camera zoomTo={zoomTo} shakes={shakes}>
        <Panel side={top} y0={SPLIT.top.y0} groundY={SPLIT.top.ground} delay={0} />
        <Panel side={bottom} y0={SPLIT.bottom.y0} groundY={SPLIT.bottom.ground} delay={4} />
        <rect x={0} y={SPLIT.top.ground + 50} width={VIDEO.width} height={SPLIT.bottom.y0 - SPLIT.top.ground - 50} fill={PALETTE.bg} />
        {dv && (
          <g>
            {dv.caption && <text x={VIDEO.width / 2} y={SPLIT.divider - 4} textAnchor="middle" fontFamily="Courier Prime" fontWeight={700} fontSize={26} letterSpacing={6} fill={PALETTE.textMuted}>{dv.caption.toUpperCase()}</text>}
            {dv.value !== undefined && <text x={VIDEO.width / 2} y={SPLIT.divider + 46} textAnchor="middle" fontFamily="Courier Prime" fontWeight={700} fontSize={50} letterSpacing={4} fill={PALETTE.text}>{dv.value}</text>}
          </g>
        )}
      </Camera>
      <StoryText lines={story} y={SPLIT.headerY} />
      <Sounds {...sound} />
    </Scene>
  );
};

// ---------- Template 2: stacked rows of mindsets (Pathlight) ----------
export type RowsProps = Sound & Ending & CameraOpts & {
  story?: Line[];
  rows: {label: string; color?: string; actor: Actor; back?: (f: number, groundY: number) => React.ReactNode; front?: (f: number, groundY: number) => React.ReactNode; x?: number}[];
  bg?: "concrete" | "plain";
};

export const StackedRows: React.FC<RowsProps> = ({story = [], rows, endCard, bg = "concrete", zoomTo = 1.03, shakes, ...sound}) => {
  const frame = useCurrentFrame();
  const top = 330;
  const bottom = 1720;
  const lane = (bottom - top) / rows.length;
  const scale = Math.min(1.1, lane / 340);
  return (
    <Scene bg={bg} overlay={endCard && <EndCard {...endCard} />}>
      <Camera zoomTo={zoomTo} shakes={shakes}>
        {rows.map((r, i) => {
          const groundY = top + lane * (i + 1) - 26;
          return (
            <g key={i}>
              <rect x={0} y={groundY} width={VIDEO.width} height={20} fill="#000" opacity={0.35} />
              <Ground y={groundY} />
              <Label x={VIDEO.width / 2} y={top + lane * i + 52} text={r.label} size={32} delay={i * 3} glow={r.color} />
              {r.back?.(frame, groundY)}
              <ActorView actor={r.actor} ax={r.x ?? VIDEO.width / 2} ay={groundY - HIP_H * scale} scale={scale} />
              {r.front?.(frame, groundY)}
            </g>
          );
        })}
      </Camera>
      <StoryText lines={story} y={200} size={56} />
      <Sounds {...sound} />
    </Scene>
  );
};

// ---------- Template 3: metaphor montage (Simply Animated) ----------
// 4–5 short scenes (~5–7 s each) on one theme, each with its own small labels.
// `render(f)` gets the LOCAL frame of the segment and draws on the full 1080x1920 canvas.
export type Segment = {dur: number; title?: string; render: (f: number) => React.ReactNode};
export type MontageProps = Sound & Ending & {
  story?: Line[];             // optional header lines across the whole video (global frames)
  segments: Segment[];
  fade?: number;              // crossfade frames
  lights?: "spot" | "none";
};

const SegmentView: React.FC<{seg: Segment; fade: number}> = ({seg, fade}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, fade, seg.dur - fade, seg.dur], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return (
    <g opacity={o}>
      {seg.title && <text x={VIDEO.width / 2} y={330} textAnchor="middle" fontFamily="Courier Prime" fontWeight={700} fontSize={34} letterSpacing={6} fill={PALETTE.textMuted}>{seg.title.toUpperCase()}</text>}
      {seg.render(f)}
    </g>
  );
};

export const Montage: React.FC<MontageProps> = ({story = [], segments, fade = 8, endCard, ...sound}) => {
  let start = 0;
  return (
    <Scene bg="plain" overlay={endCard && <EndCard {...endCard} />}>
      {segments.map((seg, i) => {
        const from = start;
        start += seg.dur;
        return (
          <Sequence key={i} from={from} durationInFrames={seg.dur} layout="none">
            <SegmentView seg={seg} fade={fade} />
          </Sequence>
        );
      })}
      <StoryText lines={story} y={200} />
      <Sounds {...sound} />
    </Scene>
  );
};
export const montageLength = (segments: Segment[]) => segments.reduce((a, s) => a + s.dur, 0);
