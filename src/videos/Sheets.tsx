// Preview stills: every prop, every pose, every character style.
import React from "react";
import {POSES, PoseName} from "../rig/poses";
import {Stickman} from "../rig/Stickman";
import {Scene} from "../components/Scene";
import {CHARACTERS, CharacterName, PALETTE} from "../style/theme";
import {PROPS, PropName} from "../props/Props";

// big floor props get scaled down to fit their cell
const SCALE: Partial<Record<PropName, number>> = {
  Bed: 0.45, Sofa: 0.5, Hill: 0.18, Slope: 0.18, Mountain: 0.28, Stairs: 0.32, House: 0.4, Car: 0.5, Bike: 0.6, TV: 0.55, Hoop: 0.36, Goal: 0.55,
  PullUpBar: 0.3, FinishLine: 0.45, Barbell: 0.45, Door: 0.5, Ladder: 0.4, Whiteboard: 0.6, Blackboard: 0.5, Shelf: 0.6, Desk: 0.6, Table: 0.6,
  Tree: 0.45, Cart: 0.6, BrickWall: 0.45, Boulder: 0.8, Mirror: 0.55, Rope: 0.5, Scale: 0.36, PunchingBag: 0.5, Water: 0.4, FloorLamp: 0.6, Monitor: 0.8, OfficeChair: 0.7, Chair: 0.8, Chain: 0.6, FishingRod: 0.8, Pipe: 0.7, Sledgehammer: 0.8, Pickaxe: 0.8, Saw: 0.7,
};
// held / floating props are drawn around their center, so lift them into the cell
const CENTERED: PropName[] = ["SoccerBall", "Basketball", "Coin", "Clock", "Target", "Dumbbell", "Barbell", "Wheel", "Key", "Brick", "Fish", "Sun", "Battery", "Exclaim", "Zzz", "Sweat", "Arrow", "Checkmark", "Chain", "Rope"];

export const PropSheet: React.FC = () => {
  const names = Object.keys(PROPS) as PropName[];
  const cols = 8;
  const cw = 1080 / cols;
  const ch = 1560 / Math.ceil(names.length / cols);
  return (
    <Scene grain={0}>
      {names.map((n, i) => {
        const Comp = PROPS[n] as React.FC<{s?: number}>;
        const cx = cw / 2 + (i % cols) * cw;
        const gy = 200 + Math.floor(i / cols) * ch + ch - 40;
        const sc = (SCALE[n] ?? 0.9) * 0.8;
        return (
          <g key={n}>
            <line x1={cx - cw / 2 + 8} x2={cx + cw / 2 - 8} y1={gy} y2={gy} stroke={PALETTE.ground} strokeWidth={2} />
            <g transform={`translate(${cx},${CENTERED.includes(n) ? gy - 40 : gy})`}>
              <Comp s={sc} />
            </g>
            <text x={cx} y={gy + 24} textAnchor="middle" fill={PALETTE.textMuted} fontSize={15}>{n}</text>
          </g>
        );
      })}
      <text x={540} y={120} textAnchor="middle" fill={PALETTE.text} fontSize={40} fontWeight={800}>{names.length} props</text>
    </Scene>
  );
};

export const PoseSheet: React.FC = () => {
  const names = Object.keys(POSES) as PoseName[];
  const cols = 7;
  const cw = 1080 / cols;
  return (
    <Scene grain={0}>
      {names.map((n, i) => {
        const cx = cw / 2 + (i % cols) * cw;
        const gy = 230 + Math.floor(i / cols) * 260;
        return (
          <g key={n}>
            <line x1={cx - cw / 2 + 6} x2={cx + cw / 2 - 6} y1={gy} y2={gy} stroke={PALETTE.ground} strokeWidth={2} />
            <Stickman pose={POSES[n]} x={cx} y={gy - 128 * 0.55} scale={0.55} character={i % 2 ? "rival" : "hero"} />
            <text x={cx} y={gy + 26} textAnchor="middle" fill={PALETTE.textMuted} fontSize={18}>{n}</text>
          </g>
        );
      })}
    </Scene>
  );
};

export const CharacterSheet: React.FC = () => {
  const names = Object.keys(CHARACTERS) as CharacterName[];
  const moods = ["normal", "happy", "sad", "angry", "shocked"] as const;
  return (
    <Scene grain={0}>
      {names.map((n, i) => {
        const cx = 135 + (i % 4) * 270;
        const gy = 520 + Math.floor(i / 4) * 460;
        return (
          <g key={n}>
            <Stickman pose={POSES.stand} x={cx} y={gy - 128 * 1.2} scale={1.2} character={n} mood={moods[i % moods.length]} />
            <text x={cx} y={gy + 40} textAnchor="middle" fill={PALETTE.textMuted} fontSize={26}>{n} · {moods[i % moods.length]}</text>
          </g>
        );
      })}
    </Scene>
  );
};
