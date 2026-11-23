// Engine test scenes — NOT final videos. They exercise every template and effect
// so the look can be checked with stills before real production starts.
import React from "react";
import {interpolate} from "remotion";
import {cycle, Key} from "../rig/poses";
import {MontageProps, montageLength, RowsProps, SplitProps, Montage, SplitCompare, StackedRows} from "../templates/Templates";
import {Boulder, BrickWall, Brick, Whiteboard, Scale, Coin, Paper, Slope, Laptop, Desk, OfficeChair, Phone, Sofa, TV} from "../props/Props";
import {Place} from "../components/Scene";
import {Burst, Impact, LightBurst, SpeedLines} from "../fx/Effects";
import {MINDSET_COLORS} from "../style/theme";
import {ActorView} from "../templates/Templates";

// ---------- 1) Split (Stick To It "same stone") ----------
const DAYS = 240;
const day = (f: number) => Math.max(1, Math.min(100, Math.round(interpolate(f, [10, DAYS], [1, 100]))));
const pushTrack: Key[] = cycle(["push", "push2"], 0, DAYS, 14);
const thinkTrack: Key[] = [{f: 0, pose: "point"}, {f: 40, pose: "think"}, {f: 80, pose: "point"}, {f: 140, pose: "facepalm"}, {f: 200, pose: "point"}, {f: 260, pose: "think"}];

export const testSplit: SplitProps = {
  story: [
    {from: 0, to: 90, text: "Same stone.\n100 days.", highlight: "100 days."},
    {from: 220, to: 330, text: "Ideas don't roll.\nMotion does.", font: "type"},
  ],
  top: {
    label: "Doer",
    x: 360,
    actor: {track: pushTrack, character: "hero", mood: "normal"},
    back: (f, g) => <Place x={690} y={g} s={1.3}><Boulder round={interpolate(f, [0, DAYS], [0, 1], {extrapolateRight: "clamp"})} spin={f * 0.6} /></Place>,
    front: (f, g) => <>{[20, 48, 76, 104, 132, 160, 188].map((a) => <Burst key={a} x={420} y={g - 4} at={a} kind="dust" count={10} power={0.6} dir={-150} spread={60} />)}</>,
    lampXs: [450, 860],
  },
  bottom: {
    label: "Overthinker",
    x: 360,
    actor: {track: thinkTrack, character: "rival", mood: (f) => (f > 140 && f < 200 ? "sad" : "normal")},
    back: (f, g) => <>
      <Place x={240} y={g}><Whiteboard drawing={interpolate(f, [0, DAYS], [0, 1])} /></Place>
      <Place x={640} y={g}><Boulder round={0} /></Place>
    </>,
    lampXs: [360, 760],
  },
  divider: (f) => ({caption: "Same stone", value: `DAY ${day(f)}`}),
  endCard: {from: 330, question: "Which one are you?", highlight: "you"},
  music: "reflective-piano.mp3",
  musicVolume: 0.35,
};
export const TestSplit: React.FC = () => <SplitCompare {...testSplit} />;
export const TEST_SPLIT_LEN = 400;

// ---------- 2) Rows (Pathlight mindsets) ----------
const throwBricks = (seed: string) => (f: number, g: number) => (
  <>
    {[10, 40, 70, 100, 130, 160].map((a, i) => {
      const t = f - a;
      if (t < 0 || t > 24) return null;
      const x = interpolate(t, [0, 24], [1100, 640]);
      const y = g - 150 + Math.sin((t / 24) * Math.PI) * -60;
      return <g key={i}><SpeedLines x={x + 50} y={y} dirX={1} len={90} opacity={0.4} /><Place x={x} y={y} r={t * 12}><Brick /></Place></g>;
    })}
  </>
);
export const testRows: RowsProps = {
  story: [{from: 0, to: 80, text: "When life throws bricks at you", highlight: "bricks"}],
  rows: [
    {
      label: "Discipline", color: MINDSET_COLORS.discipline,
      actor: {track: cycle(["carry", "stand"], 0, 240, 20), character: "discipline"},
      back: (f, g) => <><Place x={760} y={g}><BrickWall rows={4} cols={4} built={interpolate(f, [0, 220], [0, 1], {extrapolateRight: "clamp"})} /></Place>{throwBricks("d")(f, g)}</>,
    },
    {
      label: "Obsession", color: MINDSET_COLORS.obsession,
      actor: {track: cycle(["throw", "throwRelease"], 0, 240, 15), character: "obsession", mood: "angry"},
      back: throwBricks("o"),
      front: (f, g) => <>{[25, 55, 85, 115, 145].map((a) => <Burst key={a} x={640} y={g - 150} at={a} kind="sparks" count={14} dir={0} spread={300} />)}</>,
    },
    {
      label: "Anger", color: MINDSET_COLORS.anger,
      actor: {track: cycle(["punch", "stand"], 0, 240, 12), character: "anger", mood: "angry"},
      back: throwBricks("a"),
      front: (f, g) => <>{[34, 64, 94, 124, 154].map((a) => <g key={a}><Impact x={640} y={g - 150} at={a} color="#FF5252" /><Burst x={640} y={g - 150} at={a} kind="debris" count={12} dir={-60} spread={200} /></g>)}</>,
    },
  ],
  shakes: [{at: 34, power: 8}, {at: 94, power: 10}, {at: 154, power: 12}],
  endCard: {from: 200, question: "Which one are you?", highlight: "you"},
};
export const TestRows: React.FC = () => <StackedRows {...testRows} />;

// ---------- 3) Montage (Simply Animated) ----------
const segs: MontageProps["segments"] = [
  {
    dur: 150,
    title: "Your words vs your actions",
    render: (f) => {
      const tilt = interpolate(f, [20, 110], [0, 18], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
      return (
        <g>
          <Place x={540} y={1250}><Scale tilt={tilt} left={<g transform="translate(0,-14)"><Paper s={0.7} /><Paper s={0.7} /></g>} right={<g transform="translate(0,-10)">{[0, 1, 2].map((i) => <g key={i} transform={`translate(${(i - 1) * 24},${-i * 6})`}><Coin s={0.8} /></g>)}</g>} /></Place>
          <ActorView actor={{track: [{f: 0, pose: "stand"}, {f: 60, pose: "point"}], character: "rival", flip: true}} ax={250} ay={1250 - 128 * 1.1} scale={1.1} />
          <ActorView actor={{track: [{f: 0, pose: "stand"}, {f: 100, pose: "cheer"}], character: "gold"}} ax={830} ay={1250 - 128 * 1.1} scale={1.1} />
          <line x1={60} x2={1020} y1={1250} y2={1250} stroke="#2C2C2C" strokeWidth={3} />
        </g>
      );
    },
  },
  {
    dur: 180,
    title: "Easy now. Hard later.",
    render: (f) => {
      const p = interpolate(f, [0, 170], [0, 1], {extrapolateRight: "clamp"});
      // slope from (40,1400) up to (1040,880): y on the slope for any x
      const slopeY = (x: number) => 1400 - (x - 40) * 0.52;
      const ang = -Math.atan(0.52) * 180 / Math.PI;
      const fx = 180 + p * 560;
      const bx = fx + 215;
      return (
        <g>
          <Place x={540} y={1400}><Slope w={1000} h={520} /></Place>
          <g transform={`rotate(${ang} ${bx} ${slopeY(bx)})`}><Place x={bx} y={slopeY(bx)}><Boulder round={1} spin={f * 3} s={1.1} /></Place></g>
          <ActorView actor={{track: cycle(["push", "push2"], 0, 180, 12), character: "hero"}} ax={fx} ay={slopeY(fx) - 128} scale={1} />
          <LightBurst x={900} y={880} at={150} />
        </g>
      );
    },
  },
  {
    dur: 120,
    title: "Scrolling vs building",
    render: (f) => (
      <g>
        <Place x={300} y={1200}><Sofa s={0.7} /></Place>
        <ActorView actor={{track: [{f: 0, pose: "sitPhone"}], character: "rival", handProp: <Phone s={1.2} />}} ax={290} ay={1200 - 128 - 30} scale={1} />
        <Place x={300} y={950}><TV s={0.6} /></Place>
        <Place x={790} y={1200}><Desk s={0.8} /></Place>
        <Place x={700} y={1200}><OfficeChair s={0.8} /></Place>
        <Place x={790} y={1200 - 90}><Laptop s={0.9} /></Place>
        <ActorView actor={{track: cycle(["typing", {torso: 172, armL: [50, 100], armR: [40, 90], legL: [85, 5], legR: [88, 0], dy: 58}], 0, 120, 6), character: "hero"}} ax={690} ay={1200 - 128} scale={1} />
        <line x1={60} x2={1020} y1={1200} y2={1200} stroke="#2C2C2C" strokeWidth={3} />
      </g>
    ),
  },
];
export const testMontage: MontageProps = {story: [{from: 0, to: 60, text: "The power of\nconsistency", highlight: "consistency"}], segments: segs, endCard: {from: montageLength(segs) - 60}};
export const TestMontage: React.FC = () => <Montage {...testMontage} />;
export const TEST_MONTAGE_LEN = montageLength(segs);
