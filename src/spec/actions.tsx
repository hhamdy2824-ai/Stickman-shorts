// =====================================================================
//  ACTIONS — real work with real contact. One line in the spec
//  ("action": {"type": "dig", ...}) becomes: the pose cycle, the tool
//  in BOTH hands at the right angle, the tool touching the ground or the
//  target on the contact frame, and the consequence (hole + dirt pile,
//  water stream + plant growing, sparks + impact, coin landing in the jar,
//  sound). Positions are computed from the rig, never guessed.
// =====================================================================
import React from "react";
import {Easing, interpolate} from "remotion";
import {Key, POSES, Pose, PoseName} from "../rig/poses";
import {HeldTool} from "../rig/Stickman";
import {dir, rigPoints, toolLocal, P} from "../rig/ik";
import {CHARACTERS, CharacterName, HIP_H} from "../style/theme";
import {PROPS, PropName} from "../props/Props";

type Range = [number, number];
type PropLike = {name: PropName; s?: number; params?: Record<string, unknown>; show?: Range; x?: number; front?: boolean};
export type ActionSpec = {
  type: "dig" | "hammer" | "water" | "drop";
  from?: number; to?: number;   // window inside the segment (default whole segment)
  every?: number;               // frames per cycle (dig 30, hammer 26, drop 40)
  x?: number;                   // actor x offset during the action
  tool?: PropName;              // dig: Shovel · hammer: Sledgehammer | Hammer | Axe | Pickaxe · water: WateringCan · drop: Coin
  s?: number;                   // tool scale (fitted automatically when omitted)
  target?: PropLike;            // hammer: the thing being hit (placed under the head) · drop: container (Jar | PiggyBank | Bucket)
  plant?: PropLike;             // water: what grows under the stream (Sprout | Tree | Plant)
  pile?: boolean;               // dig: dirt pile (default true)
  at?: number;                  // dig: x where the hole must be · water: x of the plant → the actor is moved so the contact lands there
  waterAt?: number;             // dig: frame the hole strikes water (fills + splash)
  sound?: boolean;              // default true
};
export type Ctx = {ground: number; scale: number; ax: number; flip?: boolean; character?: CharacterName; dur: number};
export type GenProp = {name: PropName; x: number | [number, number]; y?: number | [number, number] | "ground"; s?: number; r?: number; at?: Range; show?: Range; ease?: "fall" | "linear" | "smooth" | "drop" | "back" | "bounce"; front?: boolean; params?: Record<string, unknown>};
export type GenFx = {type: "burst"; kind: string; x: number; y: number; at: number[]; count?: number; power?: number; dir?: number; spread?: number; floor?: number} | {type: "impact"; x: number; y: number; at: number[]; color?: string};
export type Expanded = {keys: Key[]; window: Range; tool?: (f: number) => HeldTool | undefined; props: GenProp[]; fx: GenFx[]; sounds: {src: string; at: number; volume?: number}[]; shakes: {at: number; power: number}[]};

const TOOL_LEN: Record<string, {len: number; face: number}> = {
  Shovel: {len: 184, face: 0}, Sledgehammer: {len: 160, face: 40}, Hammer: {len: 99, face: 28}, Axe: {len: 113, face: 48}, Pickaxe: {len: 125, face: 70},
};
// height / half-width of common targets & containers (prop units, s = 1)
const SIZE: Record<string, {h: number; w: number; mouth?: number}> = {
  Boulder: {h: 140, w: 70}, Rock: {h: 62, w: 60}, Box: {h: 90, w: 50}, BrickWall: {h: 160, w: 90}, Tree: {h: 200, w: 30}, Bomb: {h: 70, w: 40},
  Jar: {h: 110, w: 40, mouth: 110}, PiggyBank: {h: 96, w: 60, mouth: 96}, Bucket: {h: 70, w: 34, mouth: 70},
};

const geom = (c: Ctx, off: number) => {
  const face = c.flip ? -1 : 1;
  const W = (p: P) => ({x: c.ax + off * c.scale + face * p.x * c.scale, y: c.ground - HIP_H * c.scale + p.y * c.scale});
  return {face, W};
};
const pose = (n: PoseName): Pose => POSES[n] as Pose;

export const expandAction = (a: ActionSpec, c: Ctx): Expanded => {
  const from = a.from ?? 0, to = a.to ?? c.dur;
  let off = a.x ?? 0;
  let {face, W} = geom(c, off);
  // move the actor so a contact point (currently at x) lands on wantX
  const align = (x: number, wantX: number | undefined) => {
    if (wantX === undefined) return;
    off += (wantX - x) / (c.scale * 1);
    ({face, W} = geom(c, off));
  };
  const ch = c.character ?? "hero";
  const out: Expanded = {keys: [], window: [from, to], props: [], fx: [], sounds: [], shakes: []};
  const snd = (src: string, at: number, volume = 0.4) => a.sound !== false && out.sounds.push({src, at, volume});
  const K = (f: number, p: PoseName | Pose, ease?: Key["ease"]) => out.keys.push({f, pose: p, x: off, ease});

  if (a.type === "dig") {
    const ev = a.every ?? 30;
    const tool = a.tool ?? "Shovel";
    const L = TOOL_LEN[tool]?.len ?? 184;
    const hand = rigPoints(pose("digIn"), CHARACTERS[ch]).handR;
    const ps = a.s ?? Math.min(1.4, Math.max(0.55, (HIP_H + 8 - hand.y) / (dir(pose("digIn").tool!).y * L)));
    align(W(toolLocal(pose("digIn"), ch, {x: 0, y: -L}, ps)).x, a.at);
    const tip = W(toolLocal(pose("digIn"), ch, {x: 0, y: -L}, ps));
    const head = W(toolLocal(pose("digToss"), ch, {x: 0, y: -L * 0.85}, ps));
    const pileX = tip.x + face * 120 * c.scale;
    const cycles: number[] = [];
    for (let t = from; t + ev * 0.7 <= to; t += ev) cycles.push(t);
    for (const t of cycles) {
      // blade bites in (arrives on t), pushed deeper, lifts a load, tosses it onto the pile
      K(t, "digIn"); K(t + Math.round(ev * 0.2), "digIn"); K(t + Math.round(ev * 0.45), "digLift"); K(t + Math.round(ev * 0.72), "digToss");
      const contact = t, toss = t + Math.round(ev * 0.72) + 1;
      out.fx.push({type: "burst", kind: "dirt", x: tip.x, y: c.ground - 4, at: [contact], count: 9, power: 0.5, dir: -90, spread: 110, floor: c.ground});
      out.fx.push({type: "burst", kind: "dirt", x: head.x, y: head.y, at: [toss], count: 10, power: 0.75, dir: face > 0 ? -35 : -145, spread: 50, floor: c.ground});
      snd("thud.wav", contact, 0.28);
    }
    const last = cycles.length ? cycles[cycles.length - 1] + ev : from;
    K(Math.min(to, last), "digIn");
    const n = Math.max(1, cycles.length);
    const done = (f: number) => Math.min(n, cycles.filter((t) => f >= t).length) / n;
    const wa = a.waterAt;
    out.props.push({name: "Hole", x: tip.x, s: c.scale * 0.9, params: {depth: (f: number) => 0.12 + 0.88 * done(f), w: 130, water: (f: number) => (wa === undefined ? 0 : interpolate(f, [wa, wa + 24], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}))}});
    if (wa !== undefined) { out.fx.push({type: "burst", kind: "water", x: tip.x, y: c.ground - 6, at: [wa, wa + 8, wa + 16], count: 12, power: 0.9, dir: -90, spread: 70, floor: c.ground}); snd("pop.wav", wa, 0.6); }
    if (a.pile !== false) out.props.push({name: "DirtPile", x: pileX, s: c.scale, params: {size: (f: number) => cycles.filter((t) => f >= t + Math.round(ev * 0.72) + 8).length / n}});
    const T = PROPS[tool] as React.FC<Record<string, unknown>>;
    out.tool = (f) => {
      if (f < from || f > to) return undefined;
      const cyc = [...cycles].reverse().find((t) => f >= t);
      const ph = cyc === undefined ? 0 : (f - cyc) / ev;
      const load = ph > 0.2 && ph < 0.72 ? 1 : ph >= 0.72 && ph < 0.8 ? 1 - (ph - 0.72) / 0.08 : 0;
      return {mode: "tool", render: () => <T s={ps} load={load} />};
    };
  }

  if (a.type === "hammer") {
    const ev = a.every ?? 26;
    const tool = a.tool ?? "Sledgehammer";
    const {len, face: fo} = TOOL_LEN[tool] ?? TOOL_LEN.Sledgehammer;
    const tg = a.target ?? {name: "Boulder" as PropName, s: 1.2};
    const sz = SIZE[tg.name] ?? {h: 100, w: 50};
    const ts = tg.s ?? 1;
    const topY = c.ground - sz.h * ts * c.scale;
    let ps = a.s ?? 1;
    // find the swing angle (and, if needed, tool size) that lands the striking face on the target's top
    let best = {ang: 95, err: 1e9, ps};
    for (const tryPs of a.s ? [a.s] : [1, 0.9, 1.1, 0.8, 1.25, 0.7, 1.4]) {
      for (let ang = 30; ang <= 135; ang += 1) {
        const p = {...pose("hammerHit"), tool: ang};
        const hit = W(toolLocal(p, ch, {x: fo, y: -len}, tryPs));
        const err = Math.abs(hit.y - topY - 6 * c.scale);
        if (err < best.err) best = {ang, err, ps: tryPs};
      }
      if (best.err < 6) break;
    }
    ps = best.ps;
    const hitPose: Pose = {...pose("hammerHit"), tool: best.ang};
    if (tg.x !== undefined) align(W(toolLocal(hitPose, ch, {x: fo, y: -len}, ps)).x, tg.x - face * sz.w * ts * c.scale * 0.45);
    const hit = W(toolLocal(hitPose, ch, {x: fo, y: -len}, ps));
    const tx = tg.x ?? hit.x + face * sz.w * ts * c.scale * 0.45;
    out.props.push({name: tg.name, x: tx, s: ts * c.scale, show: tg.show, front: tg.front, params: tg.params});
    const cycles: number[] = [];
    for (let t = from; t + ev * 0.6 <= to; t += ev) cycles.push(t);
    for (const t of cycles) {
      const h = t + Math.round(ev * 0.55);
      K(t, "hammerUp"); K(h, hitPose, "linear"); K(h + Math.round(ev * 0.25), hitPose);
      out.fx.push({type: "burst", kind: "sparks", x: hit.x, y: hit.y, at: [h], count: 8, power: 0.7, dir: -90, spread: 150});
      out.fx.push({type: "burst", kind: "dust", x: hit.x, y: hit.y, at: [h], count: 8, power: 0.5, dir: -90, spread: 120});
      out.fx.push({type: "impact", x: hit.x, y: hit.y, at: [h], color: "#FFD54F"});
      out.shakes.push({at: h, power: 3});
      snd("thud.wav", h, 0.45);
    }
    const T = PROPS[tool] as React.FC<Record<string, unknown>>;
    out.tool = (f) => (f < from || f > to ? undefined : {mode: "tool", render: () => <T s={ps} />});
  }

  if (a.type === "water") {
    const ps = a.s ?? 0.85;
    const pourPose = pose("pour");
    const hand = rigPoints(pourPose, CHARACTERS[ch]).handR;
    const th = (42 * Math.PI) / 180;
    const tipLocal = {x: hand.x + (118 * Math.cos(th) - 4 * Math.sin(th)) * ps, y: 0};
    align(W(tipLocal).x, a.at ?? a.plant?.x);
    const sx = W(tipLocal).x;
    K(from, "pour"); K(Math.round((from + to) / 2), "pour"); K(to, "pour");
    const tilt = (f: number) => interpolate(f, [from, from + 10, to - 10, to], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
    const pour = (f: number) => interpolate(f, [from + 8, from + 14, to - 12, to - 8], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
    if (a.plant) {
      const pl = a.plant;
      const params: Record<string, unknown> = {...(pl.params ?? {})};
      for (const [k, v] of Object.entries(params)) if (Array.isArray(v)) params[k] = (f: number) => interpolate(f, [from + 14, to], v as number[], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin)});
      if (!("grow" in params) && (pl.name === "Sprout" || pl.name === "Tree")) params.grow = (f: number) => interpolate(f, [from + 14, to], [0.15, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
      out.props.push({name: pl.name, x: sx, s: (pl.s ?? 1) * c.scale, show: pl.show, params});
    }
    for (let t = from + 16; t < to - 10; t += 12) out.fx.push({type: "burst", kind: "water", x: sx, y: c.ground - 4, at: [t], count: 4, power: 0.35, dir: -90, spread: 130, floor: c.ground + 2});
    const T = PROPS[a.tool ?? "WateringCan"] as React.FC<Record<string, unknown>>;
    out.tool = (f) => (f < from || f > to ? undefined : {mode: "hand", render: (ctx) => <T s={ps} tilt={tilt(f)} pour={pour(f)} toGround={ctx.toGround} />});
  }

  if (a.type === "drop") {
    const ev = a.every ?? 40;
    const item = a.tool ?? "Coin";
    const ct = a.target ?? {name: "Jar" as PropName, s: 1.2};
    const sz = SIZE[ct.name] ?? {h: 90, w: 40, mouth: 90};
    const cs = ct.s ?? 1;
    align(W(rigPoints(pose("dropIn"), CHARACTERS[ch]).handR).x, ct.x);
    const hand = W(rigPoints(pose("dropIn"), CHARACTERS[ch]).handR);
    const mouthY = c.ground - (sz.mouth ?? sz.h) * cs * c.scale;
    const cycles: number[] = [];
    for (let t = from; t + ev * 0.6 <= to; t += ev) cycles.push(t);
    const n = Math.max(1, cycles.length);
    for (const t of cycles) {
      const rel = t + Math.round(ev * 0.4);
      K(t, "carry"); K(rel, "dropIn"); K(rel + Math.round(ev * 0.35), "dropIn");
      out.props.push({name: item, x: hand.x, y: [hand.y + 10 * c.scale, mouthY + 14 * c.scale], at: [rel + 1, rel + 9], show: [rel + 1, rel + 9], ease: "fall", s: 0.8 * c.scale, front: true});
      out.fx.push({type: "burst", kind: "coins", x: hand.x, y: mouthY, at: [rel + 9], count: 4, power: 0.35, dir: -90, spread: 80});
      snd("coin.wav", rel + 9, 0.45);
    }
    const p0 = typeof ct.params?.fill === "object" ? (ct.params.fill as number[]) : [0.05, 1];
    const filled = (f: number) => cycles.filter((t) => f >= t + Math.round(ev * 0.4) + 9).length / n;
    out.props.push({name: ct.name, x: hand.x, s: cs * c.scale, show: ct.show, params: {...(ct.params ?? {}), lid: false, fill: (f: number) => p0[0] + (p0[1] - p0[0]) * filled(f)}});
    const T = PROPS[item] as React.FC<Record<string, unknown>>;
    out.tool = (f) => {
      if (f < from || f > to) return undefined;
      const cyc = [...cycles].reverse().find((t) => f >= t);
      if (cyc === undefined || f > cyc + Math.round(ev * 0.4)) return undefined; // released
      return {mode: "hand", render: () => <T s={0.8} />};
    };
  }
  return out;
};
