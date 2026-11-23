// =====================================================================
//  PROP LIBRARY — every object a scene may need, drawn in one style:
//  light warm fills, soft shade, dark outline, one accent where useful.
//
//  Origin convention:
//   - floor props (chair, table, tree...) : (0,0) = bottom-center, sits on the ground
//   - held props (phone, hammer, ball...) : (0,0) = where the hand grips it
//  Every prop takes `s` (scale) and most take `on`/`fill`/`value` options.
//  Add new ones at the bottom and register them in PROPS.
// =====================================================================
import React from "react";
import {useCurrentFrame} from "remotion";
import {PALETTE as C} from "../style/theme";

type P = {s?: number};
const O = {stroke: C.propOutline, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const};
const POLE = {stroke: C.metal, strokeLinecap: "round" as const, strokeLinejoin: "round" as const};
const G: React.FC<{s?: number; children: React.ReactNode; r?: number}> = ({s = 1, r = 0, children}) => (
  <g transform={`scale(${s}) rotate(${r})`}>{children}</g>
);

// ---------------- FURNITURE ----------------
export const Chair: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-40} y={-150} width={14} height={150} rx={4} fill={C.wood} {...O} />
    <rect x={-44} y={-78} width={88} height={14} rx={4} fill={C.wood} {...O} />
    <rect x={30} y={-66} width={10} height={66} rx={3} fill={C.woodDark} {...O} />
    <rect x={-36} y={-66} width={10} height={66} rx={3} fill={C.woodDark} {...O} />
  </G>
);
export const OfficeChair: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-46} y={-170} width={20} height={100} rx={10} fill="#3A3A3A" {...O} />
    <rect x={-46} y={-84} width={92} height={18} rx={9} fill="#3A3A3A" {...O} />
    <rect x={-4} y={-66} width={8} height={50} fill={C.metal} {...O} />
    <path d="M-40,-6 L40,-6" {...POLE} strokeWidth={8} />
    <circle cx={-40} cy={-4} r={5} fill="#222" />
    <circle cx={40} cy={-4} r={5} fill="#222" />
  </G>
);
export const Table: React.FC<P & {w?: number}> = ({s, w = 220}) => (
  <G s={s}>
    <rect x={-w / 2} y={-110} width={w} height={16} rx={4} fill={C.wood} {...O} />
    <rect x={-w / 2 + 14} y={-94} width={12} height={94} fill={C.woodDark} {...O} />
    <rect x={w / 2 - 26} y={-94} width={12} height={94} fill={C.woodDark} {...O} />
  </G>
);
export const Desk: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-130} y={-112} width={260} height={16} rx={3} fill={C.propLight} {...O} />
    <rect x={40} y={-96} width={84} height={96} fill={C.propMid} {...O} />
    <path d="M52,-62 L112,-62 M52,-30 L112,-30" {...O} />
    <rect x={-122} y={-96} width={12} height={96} fill={C.propMid} {...O} />
  </G>
);
export const Bed: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-170} y={-60} width={340} height={44} rx={8} fill={C.propLight} {...O} />
    <rect x={-176} y={-130} width={18} height={130} rx={6} fill={C.wood} {...O} />
    <rect x={160} y={-90} width={18} height={90} rx={6} fill={C.wood} {...O} />
    <rect x={-152} y={-84} width={70} height={26} rx={12} fill={C.paper} {...O} />
    <path d="M-80,-62 Q40,-90 158,-62" fill={C.info} opacity={0.8} {...O} />
  </G>
);
export const Sofa: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-150} y={-130} width={300} height={70} rx={20} fill="#5A5F6B" {...O} />
    <rect x={-150} y={-74} width={300} height={50} rx={12} fill="#6B7180" {...O} />
    <rect x={-170} y={-100} width={36} height={80} rx={14} fill="#5A5F6B" {...O} />
    <rect x={134} y={-100} width={36} height={80} rx={14} fill="#5A5F6B" {...O} />
    <path d="M-140,-24 L-140,0 M140,-24 L140,0" {...POLE} stroke={C.woodDark} strokeWidth={8} />
  </G>
);
export const Door: React.FC<P & {open?: number}> = ({s, open = 0}) => (
  <G s={s}>
    <rect x={-60} y={-260} width={120} height={260} fill="#000" {...O} />
    <g transform={`translate(-60,0) scale(${1 - open},1)`}>
      <rect x={0} y={-260} width={120} height={260} fill={C.wood} {...O} />
      <rect x={16} y={-240} width={88} height={100} rx={4} fill={C.woodDark} />
      <circle cx={100} cy={-130} r={7} fill={C.accent} {...O} strokeWidth={2} />
    </g>
  </G>
);
export const Window: React.FC<P & {night?: boolean}> = ({s, night = true}) => (
  <G s={s}>
    <rect x={-80} y={-120} width={160} height={120} fill={night ? "#0E1A2E" : "#9FD3FF"} {...O} />
    {night && <circle cx={40} cy={-84} r={14} fill={C.paper} />}
    <path d="M0,-120 L0,0 M-80,-60 L80,-60" {...O} strokeWidth={6} />
  </G>
);
export const Shelf: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-80} y={-200} width={160} height={200} fill={C.wood} {...O} />
    <path d="M-80,-134 L80,-134 M-80,-67 L80,-67" {...O} />
    {[-60, -42, -24, 10, 30].map((x, i) => (
      <rect key={i} x={x} y={i < 3 ? -184 : -117} width={14} height={46} fill={[C.info, C.accent, C.danger, C.green, C.paper][i]} {...O} strokeWidth={2} />
    ))}
  </G>
);
export const FloorLamp: React.FC<P & {on?: boolean}> = ({s, on = true}) => (
  <G s={s}>
    {on && <ellipse cx={0} cy={-210} rx={60} ry={30} fill={`rgba(${C.lamp},0.25)`} />}
    <path d="M0,0 L0,-200" {...POLE} strokeWidth={6} />
    <path d="M-34,-200 L34,-200 L20,-250 L-20,-250 Z" fill={on ? "#FFE7B8" : C.propMid} {...O} />
    <ellipse cx={0} cy={-2} rx={30} ry={6} fill="#333" />
  </G>
);

// ---------------- TECH ----------------
export const Laptop: React.FC<P & {glow?: boolean; content?: React.ReactNode}> = ({s, glow = true, content}) => (
  <G s={s}>
    <path d="M-62,-8 L62,-8 L74,0 L-74,0 Z" fill={C.metal} {...O} />
    <rect x={-56} y={-86} width={112} height={78} rx={6} fill="#26282C" {...O} />
    <rect x={-48} y={-78} width={96} height={62} rx={3} fill={glow ? C.screen : "#111"} opacity={glow ? 0.9 : 1} />
    {content && <g transform="translate(0,-47)">{content}</g>}
  </G>
);
export const Monitor: React.FC<P & {glow?: boolean; content?: React.ReactNode}> = ({s, glow = true, content}) => (
  <G s={s}>
    <rect x={-90} y={-160} width={180} height={112} rx={8} fill="#26282C" {...O} />
    <rect x={-80} y={-150} width={160} height={92} rx={3} fill={glow ? C.screen : "#111"} opacity={glow ? 0.9 : 1} />
    {content && <g transform="translate(0,-104)">{content}</g>}
    <rect x={-8} y={-48} width={16} height={36} fill={C.metalDark} {...O} />
    <rect x={-40} y={-12} width={80} height={12} rx={4} fill={C.metal} {...O} />
  </G>
);
export const TV: React.FC<P & {glow?: boolean; content?: React.ReactNode}> = ({s, glow = true, content}) => (
  <G s={s}>
    <rect x={-150} y={-220} width={300} height={176} rx={8} fill="#1E1F22" {...O} />
    <rect x={-138} y={-208} width={276} height={152} rx={3} fill={glow ? C.screen : "#0D0D0D"} opacity={glow ? 0.85 : 1} />
    {content && <g transform="translate(0,-132)">{content}</g>}
    <path d="M-60,0 L-30,-44 M60,0 L30,-44" {...POLE} strokeWidth={8} />
  </G>
);
// held: grip = bottom-center of the phone
export const Phone: React.FC<P & {glow?: boolean}> = ({s, glow = true}) => (
  <G s={s}>
    <rect x={-16} y={-58} width={32} height={58} rx={6} fill="#1E1F22" {...O} strokeWidth={3} />
    <rect x={-11} y={-52} width={22} height={44} rx={3} fill={glow ? C.screen : "#111"} />
  </G>
);
export const Keyboard: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-70} y={-16} width={140} height={16} rx={4} fill={C.propMid} {...O} />
    {Array.from({length: 7}).map((_, i) => <rect key={i} x={-62 + i * 18} y={-12} width={12} height={6} rx={1} fill={C.propDark} />)}
  </G>
);
export const Camera: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-40} y={-56} width={80} height={52} rx={8} fill="#2B2D31" {...O} />
    <circle cx={0} cy={-30} r={17} fill="#111" {...O} />
    <circle cx={-6} cy={-36} r={5} fill="#fff" opacity={0.4} />
    <rect x={18} y={-64} width={16} height={10} rx={2} fill="#2B2D31" {...O} strokeWidth={2} />
  </G>
);
export const GameController: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-50,-10 Q-60,-50 -30,-50 L30,-50 Q60,-50 50,-10 Q46,6 30,0 L18,-14 L-18,-14 L-30,0 Q-46,6 -50,-10 Z" fill="#2B2D31" {...O} />
    <path d="M-34,-34 L-34,-22 M-40,-28 L-28,-28" stroke="#ddd" strokeWidth={4} strokeLinecap="round" />
    <circle cx={30} cy={-34} r={4} fill={C.danger} /><circle cx={38} cy={-26} r={4} fill={C.green} />
  </G>
);

// ---------------- OFFICE / SCHOOL ----------------
export const Whiteboard: React.FC<P & {drawing?: number}> = ({s, drawing = 0}) => (
  <G s={s}>
    <path d="M-70,0 L-50,-140 M70,0 L50,-140 M0,-140 L0,0" {...POLE} strokeWidth={6} />
    <rect x={-90} y={-260} width={180} height={130} rx={4} fill={C.paper} {...O} />
    {/* scribbles appear with `drawing` 0..1 (plans piling up) */}
    {drawing > 0.1 && <rect x={-76} y={-246} width={50} height={26} fill="none" {...O} strokeWidth={3} />}
    {drawing > 0.25 && <path d="M-18,-234 L10,-246 L32,-226 L62,-240" fill="none" {...O} strokeWidth={3} />}
    {drawing > 0.4 && <circle cx={-48} cy={-178} r={18} fill="none" {...O} strokeWidth={3} />}
    {drawing > 0.55 && <path d="M-16,-196 L-16,-152 M0,-180 L0,-152 M16,-170 L16,-152 M32,-188 L32,-152" {...O} strokeWidth={6} />}
    {drawing > 0.7 && <path d="M46,-200 L76,-150 M76,-200 L46,-150" {...O} strokeWidth={3} />}
    {drawing > 0.85 && <path d="M-76,-212 Q0,-190 76,-216" fill="none" stroke={C.danger} strokeWidth={3} />}
  </G>
);
export const Blackboard: React.FC<P & {text?: string}> = ({s, text}) => (
  <G s={s}>
    <rect x={-140} y={-280} width={280} height={170} rx={4} fill="#22352B" stroke={C.wood} strokeWidth={10} />
    {text && <text x={0} y={-188} textAnchor="middle" fill={C.paper} fontSize={30} fontFamily="Special Elite">{text}</text>}
  </G>
);
export const Book: React.FC<P & {color?: string; open?: boolean}> = ({s, color = C.info, open = false}) => (
  <G s={s}>
    {open ? (
      <>
        <path d="M0,-6 Q-30,-18 -60,-10 L-60,-56 Q-30,-64 0,-52 Z" fill={C.paper} {...O} strokeWidth={3} />
        <path d="M0,-6 Q30,-18 60,-10 L60,-56 Q30,-64 0,-52 Z" fill={C.paper} {...O} strokeWidth={3} />
      </>
    ) : (
      <rect x={-34} y={-14} width={68} height={14} rx={2} fill={color} {...O} strokeWidth={3} />
    )}
  </G>
);
export const BookStack: React.FC<P & {n?: number}> = ({s, n = 4}) => (
  <G s={s}>
    {Array.from({length: n}).map((_, i) => (
      <rect key={i} x={-36 + (i % 2) * 6} y={-16 * (i + 1)} width={72} height={16} rx={2} fill={[C.info, C.accent, C.danger, C.green, C.paper][i % 5]} {...O} strokeWidth={3} />
    ))}
  </G>
);
export const Paper: React.FC<P & {lines?: number}> = ({s, lines = 4}) => (
  <G s={s}>
    <rect x={-24} y={-64} width={48} height={64} rx={2} fill={C.paper} {...O} strokeWidth={3} />
    {Array.from({length: lines}).map((_, i) => <path key={i} d={`M-16,${-52 + i * 12} L16,${-52 + i * 12}`} stroke={C.propDark} strokeWidth={3} />)}
  </G>
);
export const Clock: React.FC<P & {t?: number}> = ({s, t = 0}) => (
  <G s={s}>
    <circle cx={0} cy={0} r={50} fill={C.paper} {...O} />
    <path d={`M0,0 L${Math.sin(t * 2 * Math.PI) * 30},${-Math.cos(t * 2 * Math.PI) * 30}`} {...O} strokeWidth={5} />
    <path d={`M0,0 L${Math.sin(t * 24 * Math.PI) * 40},${-Math.cos(t * 24 * Math.PI) * 40}`} stroke={C.danger} strokeWidth={3} strokeLinecap="round" />
    <circle r={4} fill={C.propOutline} />
  </G>
);
export const Calendar: React.FC<P & {day?: string | number}> = ({s, day = 1}) => (
  <G s={s}>
    <rect x={-50} y={-110} width={100} height={110} rx={6} fill={C.paper} {...O} />
    <rect x={-50} y={-110} width={100} height={28} rx={6} fill={C.danger} {...O} />
    <text x={0} y={-30} textAnchor="middle" fontSize={44} fontFamily="Courier Prime" fontWeight={700} fill={C.propOutline}>{day}</text>
  </G>
);
export const Backpack: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-30} y={-80} width={60} height={80} rx={16} fill={C.info} {...O} />
    <rect x={-20} y={-40} width={40} height={26} rx={6} fill="#3B6FD0" {...O} strokeWidth={3} />
    <path d="M-14,-80 Q0,-100 14,-80" fill="none" {...O} />
  </G>
);
export const Briefcase: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-40} y={-56} width={80} height={56} rx={6} fill={C.woodDark} {...O} />
    <path d="M-14,-56 L-14,-68 L14,-68 L14,-56" fill="none" {...O} />
  </G>
);
export const Mug: React.FC<P & {steam?: boolean}> = ({s, steam = true}) => (
  <G s={s}>
    <rect x={-18} y={-40} width={36} height={40} rx={6} fill={C.paper} {...O} strokeWidth={3} />
    <path d="M18,-30 Q34,-24 18,-10" fill="none" {...O} strokeWidth={3} />
    {steam && <path d="M-6,-48 Q-12,-60 -4,-72 M6,-48 Q0,-60 8,-72" stroke="#fff" strokeWidth={3} opacity={0.5} fill="none" />}
  </G>
);
export const Bottle: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-12,0 L-12,-48 Q-12,-58 -6,-62 L-6,-74 L6,-74 L6,-62 Q12,-58 12,-48 L12,0 Z" fill="#7FB8E6" opacity={0.85} {...O} strokeWidth={3} />
  </G>
);

// ---------------- SPORTS & FITNESS ----------------
export const SoccerBall: React.FC<P> = ({s}) => (
  <G s={s}>
    <circle r={26} fill={C.paper} {...O} />
    <path d="M0,-9 L9,-3 L6,8 L-6,8 L-9,-3 Z" fill={C.propOutline} />
    <path d="M0,-9 L0,-24 M9,-3 L22,-8 M6,8 L14,20 M-6,8 L-14,20 M-9,-3 L-22,-8" stroke={C.propOutline} strokeWidth={2.5} />
  </G>
);
export const Basketball: React.FC<P> = ({s}) => (
  <G s={s}>
    <circle r={26} fill="#E07B2E" {...O} />
    <path d="M-26,0 L26,0 M0,-26 L0,26 M-18,-18 Q-6,0 -18,18 M18,-18 Q6,0 18,18" stroke={C.propOutline} strokeWidth={2.5} fill="none" />
  </G>
);
export const Hoop: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M0,0 L0,-330" {...POLE} strokeWidth={10} />
    <rect x={-10} y={-360} width={100} height={70} fill={C.paper} {...O} />
    <ellipse cx={60} cy={-290} rx={34} ry={8} fill="none" stroke={C.danger} strokeWidth={6} />
    <path d="M28,-290 L40,-250 L80,-250 L92,-290" stroke="#ddd" strokeWidth={2} fill="none" />
  </G>
);
export const Goal: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-140,0 L-140,-150 L140,-150 L140,0" fill="none" stroke={C.paper} strokeWidth={10} strokeLinejoin="round" />
    {Array.from({length: 9}).map((_, i) => <path key={i} d={`M${-120 + i * 30},-150 L${-110 + i * 28},0`} stroke="#888" strokeWidth={1.5} />)}
  </G>
);
export const Dumbbell: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-30,0 L30,0" {...O} strokeWidth={8} />
    <rect x={-46} y={-16} width={18} height={32} rx={4} fill="#3A3A3A" {...O} strokeWidth={3} />
    <rect x={28} y={-16} width={18} height={32} rx={4} fill="#3A3A3A" {...O} strokeWidth={3} />
  </G>
);
// held at bar center
export const Barbell: React.FC<P & {plates?: number}> = ({s, plates = 2}) => (
  <G s={s}>
    <path d="M-170,0 L170,0" stroke={C.metal} strokeWidth={8} strokeLinecap="round" />
    {Array.from({length: plates}).map((_, i) => (
      <g key={i}>
        <rect x={-150 + i * 16} y={-44 + i * 6} width={14} height={88 - i * 12} rx={3} fill="#2E2E2E" {...O} strokeWidth={3} />
        <rect x={136 - i * 16} y={-44 + i * 6} width={14} height={88 - i * 12} rx={3} fill="#2E2E2E" {...O} strokeWidth={3} />
      </g>
    ))}
  </G>
);
export const PullUpBar: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-120,0 L-120,-380 M120,0 L120,-380" {...POLE} stroke={C.metalDark} strokeWidth={12} />
    <path d="M-130,-370 L130,-370" stroke={C.metal} strokeWidth={10} strokeLinecap="round" />
  </G>
);
export const PunchingBag: React.FC<P & {swing?: number}> = ({s, swing = 0}) => (
  <G s={s}>
    <g transform={`rotate(${swing})`}>
      <path d="M0,0 L0,40" {...POLE} strokeWidth={4} />
      <rect x={-38} y={40} width={76} height={180} rx={30} fill={C.danger} {...O} />
      <rect x={-38} y={70} width={76} height={10} fill="#000" opacity={0.25} />
    </g>
  </G>
);
export const Trophy: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-30} y={-16} width={60} height={16} rx={3} fill={C.woodDark} {...O} strokeWidth={3} />
    <path d="M-6,-16 L-6,-40 L6,-40 L6,-16" fill={C.accent} {...O} strokeWidth={3} />
    <path d="M-34,-110 L34,-110 Q34,-44 0,-40 Q-34,-44 -34,-110 Z" fill={C.accent} {...O} strokeWidth={3} />
    <path d="M-34,-98 Q-56,-90 -34,-66 M34,-98 Q56,-90 34,-66" fill="none" {...O} strokeWidth={3} />
  </G>
);
export const Medal: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-14,-60 L0,-24 L14,-60" fill="none" stroke={C.info} strokeWidth={8} />
    <circle cx={0} cy={-12} r={16} fill={C.accent} {...O} strokeWidth={3} />
  </G>
);
export const FinishLine: React.FC<P & {h?: number}> = ({s, h = 260}) => (
  <G s={s}>
    <path d={`M-150,0 L-150,${-h} M150,0 L150,${-h}`} {...POLE} strokeWidth={8} />
    <rect x={-150} y={-h} width={300} height={40} fill={C.paper} {...O} />
    {Array.from({length: 15}).map((_, i) => <rect key={i} x={-150 + i * 20} y={-h + (i % 2) * 20} width={20} height={20} fill={C.propOutline} />)}
  </G>
);
export const Flag: React.FC<P & {color?: string}> = ({s, color = C.danger}) => (
  <G s={s}>
    <path d="M0,0 L0,-160" {...POLE} strokeWidth={6} />
    <path d="M0,-160 L70,-140 L0,-118 Z" fill={color} {...O} strokeWidth={3} />
  </G>
);
export const Target: React.FC<P> = ({s}) => (
  <G s={s}>
    {[50, 36, 22, 8].map((r, i) => <circle key={r} r={r} fill={i % 2 ? C.paper : C.danger} {...O} strokeWidth={3} />)}
  </G>
);

// ---------------- TOOLS & WORK ----------------
// held at the end of the handle
export const Hammer: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M0,0 L0,-90" stroke={C.wood} strokeWidth={10} strokeLinecap="round" />
    <rect x={-28} y={-112} width={56} height={26} rx={4} fill={C.metalDark} {...O} />
  </G>
);
export const Sledgehammer: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M0,0 L0,-150" stroke={C.wood} strokeWidth={12} strokeLinecap="round" />
    <rect x={-40} y={-180} width={80} height={40} rx={6} fill="#3A3E44" {...O} />
  </G>
);
export const Shovel: React.FC<P & {load?: number}> = ({s, load = 0}) => (
  <G s={s}>
    <path d="M0,0 L0,-120" stroke={C.wood} strokeWidth={8} strokeLinecap="round" />
    <path d="M-20,-120 L20,-120 L16,-170 Q0,-184 -16,-170 Z" fill={C.metal} {...O} />
    {load > 0.05 && (
      <g opacity={Math.min(1, load * 2)}>
        <path d={`M-22,-128 Q-26,${-150 - 14 * load} 0,${-160 - 16 * load} Q26,${-150 - 14 * load} 22,-128 Z`} fill={DIRT} stroke={DIRT_DARK} strokeWidth={3} />
        <circle cx={-6} cy={-146} r={3} fill={DIRT_DARK} /><circle cx={8} cy={-152} r={2.5} fill={DIRT_DARK} />
      </g>
    )}
  </G>
);
export const Pickaxe: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M0,0 L0,-130" stroke={C.wood} strokeWidth={9} strokeLinecap="round" />
    <path d="M-70,-110 Q0,-160 70,-110 Q0,-140 -70,-110 Z" fill={C.metal} {...O} />
  </G>
);
export const Axe: React.FC<P & {sharp?: boolean}> = ({s, sharp = true}) => (
  <G s={s}>
    <path d="M0,0 L0,-120" stroke={C.wood} strokeWidth={9} strokeLinecap="round" />
    <path d="M0,-130 L40,-140 Q52,-112 40,-86 L0,-96 Z" fill={sharp ? C.metal : C.metalDark} {...O} />
    {sharp && <path d="M42,-136 Q52,-112 42,-90" stroke="#fff" strokeWidth={3} opacity={0.8} fill="none" />}
  </G>
);
export const Saw: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-18} y={-20} width={30} height={40} rx={8} fill={C.wood} {...O} />
    <path d="M12,-14 L130,-6 L130,10 L12,14 Z" fill={C.metal} {...O} strokeWidth={3} />
  </G>
);
export const Rope: React.FC<P & {len?: number; sag?: number}> = ({s, len = 300, sag = 20}) => (
  <G s={s}>
    <path d={`M0,0 Q${len / 2},${sag} ${len},0`} stroke="#C9A877" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="10 4" />
  </G>
);
export const Ladder: React.FC<P & {h?: number}> = ({s, h = 360}) => (
  <G s={s}>
    <path d={`M-40,0 L-40,${-h} M40,0 L40,${-h}`} stroke={C.wood} strokeWidth={10} strokeLinecap="round" />
    {Array.from({length: Math.floor(h / 50)}).map((_, i) => <path key={i} d={`M-40,${-30 - i * 50} L40,${-30 - i * 50}`} stroke={C.wood} strokeWidth={8} />)}
  </G>
);
export const Wheel: React.FC<P & {square?: boolean; spin?: number}> = ({s, square = false, spin = 0}) => (
  <G s={s} r={spin}>
    {square ? <rect x={-40} y={-40} width={80} height={80} rx={6} fill="#333" {...O} /> : <circle r={40} fill="#333" {...O} />}
    <circle r={12} fill={C.metal} {...O} strokeWidth={3} />
  </G>
);
export const Cart: React.FC<P & {square?: boolean; spin?: number}> = ({s, square = false, spin = 0}) => (
  <G s={s}>
    <rect x={-90} y={-130} width={180} height={70} rx={6} fill={C.wood} {...O} />
    <g transform="translate(-55,-40)"><Wheel square={square} spin={spin} s={0.9} /></g>
    <g transform="translate(55,-40)"><Wheel square={square} spin={spin} s={0.9} /></g>
  </G>
);
export const Toolbox: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-46} y={-50} width={92} height={50} rx={4} fill={C.danger} {...O} />
    <path d="M-20,-50 L-20,-64 L20,-64 L20,-50" fill="none" {...O} />
  </G>
);
export const Bucket: React.FC<P & {fill?: number}> = ({s, fill = 0.6}) => (
  <G s={s}>
    <path d="M-34,-70 L34,-70 L26,0 L-26,0 Z" fill={C.metal} {...O} />
    {fill > 0 && <ellipse cx={0} cy={-70 + (1 - fill) * 20} rx={30} ry={6} fill="#5AA9E6" />}
    <path d="M-34,-70 Q0,-120 34,-70" fill="none" {...O} strokeWidth={3} />
  </G>
);

// ---------------- NATURE & WORLD ----------------
export const Boulder: React.FC<P & {round?: number; spin?: number}> = ({s, round = 0, spin = 0}) => {
  // round 0 = rough cube, 1 = perfect ball (Stick To It "same stone" effect)
  const r = 70;
  const k = 8 + round * 62;
  return (
    <G s={s}>
      <g transform={`translate(0,${-r}) rotate(${spin})`}>
        <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={k} fill={C.stone} {...O} filter="url(#rough)" />
        <path d={`M${-r * 0.4},${-r * 0.3} l18,10 l-6,18 M${r * 0.3},${r * 0.2} l-14,12 l10,10`} stroke={C.stoneDark} strokeWidth={3} fill="none" />
        <circle cx={-r * 0.5} cy={r * 0.4} r={4} fill={C.stoneDark} />
        <circle cx={r * 0.45} cy={-r * 0.5} r={3} fill={C.stoneDark} />
      </g>
    </G>
  );
};
export const Rock: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-60,0 L-50,-40 L-14,-62 L30,-56 L58,-24 L62,0 Z" fill={C.stone} {...O} filter="url(#rough)" />
    <path d="M-20,-40 L0,-20 L-6,0" stroke={C.stoneDark} strokeWidth={3} fill="none" />
  </G>
);
export const Brick: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-26} y={-14} width={52} height={28} rx={3} fill={C.brick} {...O} strokeWidth={3} />
    <path d="M-16,-6 L-8,-6 M8,4 L16,4" stroke={C.brickDark} strokeWidth={3} />
  </G>
);
export const BrickWall: React.FC<P & {rows?: number; cols?: number; built?: number}> = ({s, rows = 6, cols = 5, built = 1}) => {
  const total = rows * cols;
  const n = Math.round(total * built);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const off = r % 2 ? 27 : 0;
    out.push(<rect key={i} x={-cols * 27 + c * 54 + off} y={-(r + 1) * 30} width={52} height={28} rx={3} fill={C.brick} {...O} strokeWidth={3} />);
  }
  return <G s={s}>{out}</G>;
};
export const Tree: React.FC<P & {grow?: number; money?: boolean}> = ({s, grow = 1, money = false}) => (
  <G s={s}>
    <g transform={`scale(${0.3 + grow * 0.7})`} style={{transformOrigin: "0 0"}}>
      <path d="M-12,0 L-8,-140 L8,-140 L12,0 Z" fill={C.woodDark} {...O} />
      <path d="M-4,-110 L-40,-150 M4,-120 L44,-160" stroke={C.woodDark} strokeWidth={8} strokeLinecap="round" />
      {[[-50, -190, 60], [40, -200, 64], [-4, -240, 70], [-70, -150, 44], [66, -150, 46]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={C.green} {...O} />
      ))}
      {money && [[-50, -190], [36, -214], [0, -250], [-70, -150], [70, -160], [10, -180]].map(([x, y], i) => (
        <circle key={`m${i}`} cx={x} cy={y} r={12} fill={C.accent} {...O} strokeWidth={2} />
      ))}
    </g>
  </G>
);
export const Sprout: React.FC<P & {grow?: number}> = ({s, grow = 1}) => (
  <G s={s}>
    <path d={`M0,0 L0,${-60 * grow}`} stroke={C.green} strokeWidth={6} strokeLinecap="round" />
    {grow > 0.4 && <path d={`M0,${-40 * grow} Q-30,${-60 * grow} -36,${-40 * grow} Q-20,${-30 * grow} 0,${-40 * grow}`} fill={C.green} {...O} strokeWidth={2} />}
    {grow > 0.7 && <path d={`M0,${-56 * grow} Q30,${-80 * grow} 36,${-58 * grow} Q20,${-46 * grow} 0,${-56 * grow}`} fill={C.green} {...O} strokeWidth={2} />}
    <ellipse cx={0} cy={0} rx={30} ry={6} fill="#3A2A1E" />
  </G>
);
export const Plant: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-24,0 L-30,-46 L30,-46 L24,0 Z" fill={C.brick} {...O} />
    <path d="M0,-46 Q-40,-100 -20,-120 M0,-46 Q10,-110 30,-120 M0,-46 Q-10,-90 6,-130" stroke={C.green} strokeWidth={8} fill="none" strokeLinecap="round" />
  </G>
);
// big background shapes
export const Hill: React.FC<P & {w?: number; h?: number}> = ({s, w = 900, h = 500}) => (
  <G s={s}>
    <path d={`M${-w / 2},0 Q${-w / 6},${-h * 0.1} 0,${-h} Q${w / 6},${-h * 0.1} ${w / 2},0 Z`} fill="#202020" stroke="#3A3A3A" strokeWidth={4} />
  </G>
);
export const Slope: React.FC<P & {w?: number; h?: number}> = ({s, w = 900, h = 500}) => (
  <G s={s}>
    <path d={`M${-w / 2},0 L${w / 2},${-h} L${w / 2},0 Z`} fill="#202020" stroke="#3A3A3A" strokeWidth={4} />
  </G>
);
export const Stairs: React.FC<P & {steps?: number; stepW?: number; stepH?: number}> = ({s, steps = 6, stepW = 90, stepH = 50}) => (
  <G s={s}>
    {Array.from({length: steps}).map((_, i) => (
      <rect key={i} x={i * stepW} y={-(i + 1) * stepH} width={(steps - i) * stepW} height={stepH} fill={i % 2 ? "#242424" : "#2A2A2A"} stroke="#3A3A3A" strokeWidth={3} />
    ))}
  </G>
);
export const Mountain: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-300,0 L-60,-420 L40,-300 L120,-380 L320,0 Z" fill="#1F1F1F" stroke="#3A3A3A" strokeWidth={4} />
    <path d="M-60,-420 L-100,-350 L-60,-370 L-30,-345 Z" fill={C.paper} opacity={0.8} />
    <Flag s={0.5} color={C.accent} />
  </G>
);
export const Cloud: React.FC<P & {dark?: boolean}> = ({s, dark = false}) => (
  <G s={s}>
    <path d="M-70,0 Q-90,-40 -50,-46 Q-40,-80 0,-70 Q40,-90 56,-50 Q94,-44 76,0 Z" fill={dark ? "#3A3D44" : C.paper} {...O} />
  </G>
);
export const Sun: React.FC<P> = ({s}) => (
  <G s={s}>
    <circle r={60} fill={C.accent} />
    {Array.from({length: 12}).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <path key={i} d={`M${Math.cos(a) * 76},${Math.sin(a) * 76} L${Math.cos(a) * 100},${Math.sin(a) * 100}`} stroke={C.accent} strokeWidth={8} strokeLinecap="round" />;
    })}
  </G>
);
export const Water: React.FC<P & {w?: number}> = ({s, w = 400}) => (
  <G s={s}>
    <rect x={-w / 2} y={0} width={w} height={120} fill="#1F3B57" />
    <path d={`M${-w / 2},0 Q${-w / 4},-10 0,0 Q${w / 4},10 ${w / 2},0`} stroke="#5AA9E6" strokeWidth={4} fill="none" />
  </G>
);
export const Fish: React.FC<P & {gold?: boolean}> = ({s, gold = false}) => (
  <G s={s}>
    <path d="M-30,0 Q0,-24 30,0 Q0,24 -30,0 Z M30,0 L50,-16 L50,16 Z" fill={gold ? C.accent : C.metal} {...O} strokeWidth={3} />
    <circle cx={-14} cy={-4} r={3} fill="#111" />
  </G>
);
export const FishingRod: React.FC<P & {line?: number}> = ({s, line = 200}) => (
  <G s={s}>
    <path d="M0,0 L120,-160" stroke={C.wood} strokeWidth={6} strokeLinecap="round" />
    <path d={`M120,-160 L130,${-160 + line}`} stroke="#ddd" strokeWidth={1.5} />
  </G>
);

// ---------------- MONEY ----------------
export const Coin: React.FC<P> = ({s}) => (
  <G s={s}>
    <circle r={20} fill={C.accent} {...O} strokeWidth={3} />
    <text y={8} textAnchor="middle" fontSize={22} fontWeight={800} fill="#8A5A00">$</text>
  </G>
);
export const CoinStack: React.FC<P & {n?: number}> = ({s, n = 5}) => (
  <G s={s}>
    {Array.from({length: n}).map((_, i) => <ellipse key={i} cx={0} cy={-8 - i * 10} rx={26} ry={9} fill={C.accent} {...O} strokeWidth={3} />)}
  </G>
);
export const Cash: React.FC<P & {n?: number}> = ({s, n = 1}) => (
  <G s={s}>
    {Array.from({length: n}).map((_, i) => (
      <g key={i} transform={`translate(0,${-i * 8})`}>
        <rect x={-44} y={-24} width={88} height={24} rx={3} fill={C.green} {...O} strokeWidth={3} />
        <circle cx={0} cy={-12} r={7} fill={C.greenDark} />
      </g>
    ))}
  </G>
);
export const MoneyBag: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-40,0 Q-56,-60 -16,-80 L-24,-96 L24,-96 L16,-80 Q56,-60 40,0 Z" fill="#C9A877" {...O} />
    <text y={-28} textAnchor="middle" fontSize={40} fontWeight={800} fill={C.woodDark}>$</text>
  </G>
);
export const Jar: React.FC<P & {fill?: number; lid?: boolean}> = ({s, fill = 0.3, lid = true}) => (
  <G s={s}>
    <rect x={-40} y={-110} width={80} height={110} rx={14} fill="rgba(200,230,255,0.15)" {...O} />
    {fill > 0 && <rect x={-34} y={-110 * fill + 4} width={68} height={110 * fill - 8} rx={10} fill={C.accent} opacity={0.9} />}
    {fill > 0.08 && Array.from({length: Math.floor(fill * 9)}).map((_, i) => <ellipse key={i} cx={-20 + (i % 3) * 20} cy={-10 - i * 10.5 * fill * 1.05} rx={11} ry={4} fill="none" stroke="#7A5200" strokeWidth={2} opacity={0.6} />)}
    {lid ? <rect x={-30} y={-124} width={60} height={14} rx={4} fill={C.metal} {...O} strokeWidth={3} />
      : <ellipse cx={0} cy={-110} rx={36} ry={7} fill="rgba(0,0,0,0.35)" {...O} strokeWidth={3} />}
  </G>
);
export const PiggyBank: React.FC<P> = ({s}) => (
  <G s={s}>
    <ellipse cx={0} cy={-50} rx={60} ry={44} fill="#F29CB0" {...O} />
    <circle cx={50} cy={-56} r={16} fill="#F29CB0" {...O} strokeWidth={3} />
    <path d="M-30,-6 L-30,4 M30,-6 L30,4" stroke="#D97F96" strokeWidth={10} strokeLinecap="round" />
    <rect x={-14} y={-96} width={28} height={6} rx={3} fill="#9E4C61" />
    <circle cx={30} cy={-64} r={4} fill="#111" />
  </G>
);
export const CreditCard: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-44} y={-56} width={88} height={56} rx={6} fill="#2F3A56" {...O} strokeWidth={3} />
    <rect x={-34} y={-40} width={18} height={13} rx={2} fill={C.accent} />
    <path d="M-34,-14 L20,-14" stroke="#aaa" strokeWidth={3} />
  </G>
);
export const Wallet: React.FC<P & {empty?: boolean}> = ({s, empty = false}) => (
  <G s={s}>
    <rect x={-40} y={-50} width={80} height={50} rx={8} fill={C.woodDark} {...O} />
    {!empty && <rect x={-30} y={-62} width={50} height={20} fill={C.green} {...O} strokeWidth={2} />}
    {empty && <path d="M-10,-26 Q0,-40 10,-26" stroke="#fff" strokeWidth={2} fill="none" opacity={0.6} />}
  </G>
);
export const Safe: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-60} y={-130} width={120} height={130} rx={8} fill={C.metalDark} {...O} />
    <circle cx={10} cy={-66} r={22} fill={C.metal} {...O} strokeWidth={3} />
    <path d="M10,-66 L26,-66" {...O} strokeWidth={3} />
  </G>
);
export const Pipe: React.FC<P & {leak?: boolean}> = ({s, leak = false}) => (
  <G s={s}>
    <path d="M-120,-60 L80,-60 Q100,-60 100,-40 L100,0" stroke={C.metal} strokeWidth={22} fill="none" strokeLinecap="round" />
    {leak && <path d="M-20,-48 Q-24,-20 -20,0" stroke={C.accent} strokeWidth={5} strokeDasharray="6 8" />}
  </G>
);

// ---------------- MISC / SYMBOLS ----------------
export const Box: React.FC<P & {color?: string}> = ({s, color = "#C79A5B"}) => (
  <G s={s}>
    <rect x={-36} y={-60} width={72} height={60} rx={3} fill={color} {...O} />
    <path d="M-36,-44 L36,-44 M0,-60 L0,-44" stroke="#7A5A33" strokeWidth={4} />
  </G>
);
export const Gift: React.FC<P> = ({s}) => (
  <G s={s}>
    <rect x={-34} y={-60} width={68} height={60} rx={3} fill={C.danger} {...O} />
    <path d="M0,-60 L0,0 M-34,-30 L34,-30" stroke={C.accent} strokeWidth={8} />
    <path d="M0,-60 Q-24,-84 -20,-62 M0,-60 Q24,-84 20,-62" stroke={C.accent} strokeWidth={6} fill="none" />
  </G>
);
export const Bag: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-34,0 L-28,-70 L28,-70 L34,0 Z" fill={C.paper} {...O} />
    <path d="M-14,-70 Q0,-96 14,-70" fill="none" {...O} strokeWidth={3} />
  </G>
);
export const Car: React.FC<P & {color?: string; spin?: number}> = ({s, color = C.info, spin = 0}) => (
  <G s={s}>
    <path d="M-150,-40 L-150,-80 L-90,-90 L-50,-140 L60,-140 L110,-90 L150,-80 L150,-40 Z" fill={color} {...O} />
    <path d="M-40,-128 L-10,-128 L-10,-92 L-76,-92 Z M2,-128 L54,-128 L90,-92 L2,-92 Z" fill="#BFE3FF" opacity={0.9} {...O} strokeWidth={3} />
    <g transform="translate(-90,-34)"><Wheel s={0.8} spin={spin} /></g>
    <g transform="translate(90,-34)"><Wheel s={0.8} spin={spin} /></g>
  </G>
);
export const Bike: React.FC<P & {spin?: number}> = ({s, spin = 0}) => (
  <G s={s}>
    {[-70, 70].map((x) => (
      <g key={x} transform={`translate(${x},-50) rotate(${spin})`}>
        <circle r={48} fill="none" stroke="#3A3A3A" strokeWidth={8} />
        <path d="M-48,0 L48,0 M0,-48 L0,48" stroke="#555" strokeWidth={2} />
      </g>
    ))}
    <path d="M-70,-50 L-10,-110 L50,-110 L70,-50 M-10,-110 L0,-50 L-70,-50 M50,-110 L56,-130" {...POLE} stroke={C.danger} strokeWidth={7} fill="none" />
  </G>
);
export const House: React.FC<P & {lit?: boolean}> = ({s, lit = true}) => (
  <G s={s}>
    <rect x={-130} y={-200} width={260} height={200} fill="#2A2A2A" {...O} />
    <path d="M-160,-196 L0,-320 L160,-196 Z" fill="#3A2E28" {...O} />
    <rect x={-30} y={-110} width={60} height={110} fill={C.wood} {...O} />
    <rect x={-104} y={-160} width={56} height={50} fill={lit ? "#FFD98A" : "#111"} {...O} />
    <rect x={48} y={-160} width={56} height={50} fill={lit ? "#FFD98A" : "#111"} {...O} />
  </G>
);
export const RoadSign: React.FC<P & {text?: string}> = ({s, text = "EXIT"}) => (
  <G s={s}>
    <path d="M0,0 L0,-200" {...POLE} strokeWidth={8} />
    <path d="M-80,-240 L60,-240 L90,-210 L60,-180 L-80,-180 Z" fill={C.green} {...O} />
    <text x={-6} y={-200} textAnchor="middle" fill="#fff" fontSize={28} fontFamily="Courier Prime" fontWeight={700}>{text}</text>
  </G>
);
export const Battery: React.FC<P & {level?: number}> = ({s, level = 1}) => {
  const col = level > 0.5 ? C.good : level > 0.2 ? C.accent : C.danger;
  return (
    <G s={s}>
      <rect x={-50} y={-30} width={100} height={60} rx={8} fill="#1C1C1C" {...O} />
      <rect x={50} y={-12} width={10} height={24} rx={3} fill={C.propOutline} />
      <rect x={-42} y={-22} width={84 * Math.max(0, Math.min(1, level))} height={44} rx={4} fill={col} />
    </G>
  );
};
export const Lightbulb: React.FC<P & {on?: boolean}> = ({s, on = true}) => (
  <G s={s}>
    {on && <circle cy={-50} r={56} fill={`rgba(${C.lamp},0.35)`} />}
    <circle cy={-56} r={34} fill={on ? "#FFE7A0" : "#666"} {...O} />
    <rect x={-14} y={-26} width={28} height={22} rx={3} fill={C.metal} {...O} strokeWidth={3} />
  </G>
);
export const Heart: React.FC<P & {broken?: boolean}> = ({s, broken = false}) => (
  <G s={s}>
    <path d="M0,0 L-44,-44 Q-64,-74 -36,-88 Q-14,-96 0,-70 Q14,-96 36,-88 Q64,-74 44,-44 Z" fill={C.danger} {...O} />
    {broken && <path d="M0,-70 L-10,-50 L8,-36 L-6,-14 L0,0" stroke="#000" strokeWidth={5} fill="none" />}
  </G>
);
export const Hourglass: React.FC<P & {t?: number}> = ({s, t = 0.5}) => (
  <G s={s}>
    <path d="M-34,-120 L34,-120 L4,-62 L34,-4 L-34,-4 L-4,-62 Z" fill="rgba(200,230,255,0.15)" {...O} />
    <path d={`M${-30 * (1 - t)},${-116 + t * 50} L${30 * (1 - t)},${-116 + t * 50} L0,-64 Z`} fill={C.accent} />
    <path d={`M-30,-8 L30,-8 L${18 * t},${-8 - 40 * t} L${-18 * t},${-8 - 40 * t} Z`} fill={C.accent} />
    <rect x={-42} y={-128} width={84} height={10} rx={3} fill={C.wood} {...O} strokeWidth={3} />
    <rect x={-42} y={-6} width={84} height={10} rx={3} fill={C.wood} {...O} strokeWidth={3} />
  </G>
);
export const Scale: React.FC<P & {tilt?: number; left?: React.ReactNode; right?: React.ReactNode}> = ({s, tilt = 0, left, right}) => {
  const a = (tilt * Math.PI) / 180;
  const lx = -150 * Math.cos(a), ly = -260 - 150 * Math.sin(a);
  const rx = 150 * Math.cos(a), ry = -260 + 150 * Math.sin(a);
  return (
    <G s={s}>
      <path d="M0,0 L0,-260 M-40,0 L40,0" {...POLE} strokeWidth={8} />
      <path d={`M${lx},${ly} L${rx},${ry}`} {...POLE} strokeWidth={8} />
      {[[lx, ly, left], [rx, ry, right]].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x as number},${(y as number) + 70})`}>
          <path d="M0,-70 L-44,0 M0,-70 L44,0" stroke="#999" strokeWidth={2} />
          <path d="M-56,0 Q0,24 56,0 Z" fill={C.accent} {...O} strokeWidth={3} />
          {c as React.ReactNode}
        </g>
      ))}
    </G>
  );
};
export const Key: React.FC<P> = ({s}) => (
  <G s={s}>
    <circle cx={-24} cy={0} r={16} fill="none" stroke={C.accent} strokeWidth={8} />
    <path d="M-8,0 L44,0 M30,0 L30,14 M42,0 L42,12" stroke={C.accent} strokeWidth={8} strokeLinecap="round" />
  </G>
);
export const Lock: React.FC<P & {open?: boolean}> = ({s, open = false}) => (
  <G s={s}>
    <path d={open ? "M-22,-50 L-22,-80 Q-22,-104 0,-104 Q22,-104 22,-84" : "M-22,-50 L-22,-80 Q-22,-104 0,-104 Q22,-104 22,-80 L22,-50"} fill="none" stroke={C.metal} strokeWidth={10} />
    <rect x={-36} y={-56} width={72} height={56} rx={6} fill={C.accent} {...O} />
  </G>
);
export const Chain: React.FC<P & {n?: number}> = ({s, n = 6}) => (
  <G s={s}>
    {Array.from({length: n}).map((_, i) => <ellipse key={i} cx={i * 30} cy={0} rx={18} ry={10} fill="none" stroke={C.metal} strokeWidth={6} />)}
  </G>
);
export const Bomb: React.FC<P> = ({s}) => (
  <G s={s}>
    <circle cy={-40} r={40} fill="#222" {...O} />
    <path d="M20,-74 Q40,-100 60,-90" stroke="#C9A877" strokeWidth={5} fill="none" />
    <circle cx={60} cy={-90} r={6} fill={C.accent} />
  </G>
);
export const Bell: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M-40,0 Q-40,-70 0,-76 Q40,-70 40,0 Z" fill={C.accent} {...O} />
    <circle cy={4} r={8} fill={C.accent} {...O} strokeWidth={3} />
  </G>
);
export const Mirror: React.FC<P> = ({s}) => (
  <G s={s}>
    <ellipse cx={0} cy={-140} rx={70} ry={110} fill="#2E3A44" stroke={C.wood} strokeWidth={10} />
    <path d="M-30,-200 L10,-230 M-40,-170 L20,-215" stroke="#fff" strokeWidth={3} opacity={0.3} />
    <path d="M-30,0 L0,-30 L30,0" {...POLE} stroke={C.wood} strokeWidth={6} fill="none" />
  </G>
);
export const SpeechBubble: React.FC<P & {text?: string; w?: number}> = ({s, text = "NO.", w = 110}) => (
  <G s={s}>
    <path d={`M${-w / 2},-80 L${w / 2},-80 L${w / 2},-20 L14,-20 L0,0 L-14,-20 L${-w / 2},-20 Z`} fill={C.paper} {...O} strokeWidth={3} />
    <text y={-40} textAnchor="middle" fontSize={30} fontFamily="Courier Prime" fontWeight={700} fill={C.propOutline}>{text}</text>
  </G>
);
export const ThoughtBubble: React.FC<P & {children?: React.ReactNode}> = ({s, children}) => (
  <G s={s}>
    <circle cx={6} cy={-10} r={6} fill={C.paper} />
    <circle cx={18} cy={-30} r={10} fill={C.paper} />
    <ellipse cx={40} cy={-90} rx={70} ry={50} fill={C.paper} {...O} strokeWidth={3} />
    {children && <g transform="translate(40,-90)">{children}</g>}
  </G>
);
export const Exclaim: React.FC<P & {text?: string}> = ({s, text = "!"}) => (
  <G s={s}>
    <text textAnchor="middle" fontSize={60} fontWeight={800} fill={C.accent} stroke={C.propOutline} strokeWidth={3} paintOrder="stroke">{text}</text>
  </G>
);
export const Zzz: React.FC<P> = ({s}) => (
  <G s={s}>
    <text fontSize={40} fontWeight={800} fill={C.paper} opacity={0.8}>z<tspan dy={-20} fontSize={30}>z</tspan><tspan dy={-16} fontSize={22}>z</tspan></text>
  </G>
);
export const Sweat: React.FC<P> = ({s}) => (
  <G s={s}>
    <path d="M0,-20 Q10,0 0,6 Q-10,0 0,-20 Z" fill="#7CC4FF" {...O} strokeWidth={2} />
  </G>
);
export const Arrow: React.FC<P & {len?: number; color?: string}> = ({s, len = 120, color = C.accent}) => (
  <G s={s}>
    <path d={`M0,0 L${len},0 M${len - 20},-16 L${len},0 L${len - 20},16`} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </G>
);
export const Checkmark: React.FC<P & {ok?: boolean}> = ({s, ok = true}) => (
  <G s={s}>
    <circle r={30} fill={ok ? C.good : C.danger} {...O} strokeWidth={3} />
    <path d={ok ? "M-12,0 L-2,10 L14,-10" : "M-10,-10 L10,10 M10,-10 L-10,10"} stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </G>
);

// --------- registry (for the PropSheet preview and for lookups by name) ---------

// ---------------- REAL-WORK PROPS (contact + consequence) ----------------
const DIRT = "#7A5534", DIRT_DARK = "#4E3420";
// Hole dug into the ground. depth 0 = scratch, 1 = deep pit. (0,0) = center on the ground line.
export const Hole: React.FC<P & {depth?: number; w?: number; water?: number}> = ({s, depth = 0.5, w = 120, water = 0}) => {
  const rx = (w / 2) * (0.45 + 0.55 * depth), ry = 8 + 16 * depth;
  return (
    <G s={s}>
      <ellipse cx={0} cy={4} rx={rx + 8} ry={ry + 5} fill={DIRT} stroke={DIRT_DARK} strokeWidth={3} />
      <ellipse cx={0} cy={4 + ry * 0.15} rx={rx} ry={ry} fill="#140D08" />
      {water > 0 && <ellipse cx={0} cy={4 + ry * 0.3} rx={rx * 0.8 * water} ry={ry * 0.55 * water} fill="#3E86C9" stroke="#7CC4FF" strokeWidth={2} />}
    </G>
  );
};
// Pile of dug-out dirt. size 0..1 grows with every shovel.
export const DirtPile: React.FC<P & {size?: number}> = ({s, size = 0.5}) => {
  if (size <= 0.02) return null;
  const w = 130 * (0.35 + 0.65 * size), h = 70 * size;
  return (
    <G s={s}>
      <path d={`M${-w / 2},0 Q${-w * 0.3},${-h * 0.9} 0,${-h} Q${w * 0.3},${-h * 0.9} ${w / 2},0 Z`} fill={DIRT} stroke={DIRT_DARK} strokeWidth={4} strokeLinejoin="round" />
      {[[-0.2, 0.4], [0.15, 0.6], [0.05, 0.25], [-0.05, 0.75]].map(([fx, fy], i) => <circle key={i} cx={fx * w} cy={-fy * h} r={3.5} fill={DIRT_DARK} />)}
    </G>
  );
};
// Watering can held at its handle (0,0). tilt 0..1 leans it forward; pour 0..1 shows the stream.
// `toGround` (given by the hand) makes the stream reach the floor.
export const WateringCan: React.FC<P & {tilt?: number; pour?: number; toGround?: number}> = ({s = 1, tilt = 0, pour = 0, toGround = 200}) => {
  const f = useCurrentFrame();
  const a = tilt * 42;
  const th = (a * Math.PI) / 180;
  const rot = (x: number, y: number) => ({x: x * Math.cos(th) - y * Math.sin(th), y: x * Math.sin(th) + y * Math.cos(th)});
  const tip = rot(118, 4);
  const len = Math.max(0, toGround / s - tip.y);
  const stream = pour > 0.05 && len > 0;
  return (
    <g transform={`scale(${s})`}>
      <g transform={`rotate(${a})`}>
        <path d="M-14,14 Q-12,-14 12,-12 Q32,-10 30,16" fill="none" stroke="#2F6E8E" strokeWidth={8} strokeLinecap="round" />
        <path d="M34,40 L112,-2 L120,8 L48,60 Z" fill="#4FA3C7" {...O} strokeWidth={3} />
        <ellipse cx={117} cy={3} rx={7} ry={11} transform="rotate(-30 117 3)" fill="#2F6E8E" {...O} strokeWidth={3} />
        <rect x={-34} y={12} width={78} height={66} rx={10} fill="#4FA3C7" {...O} />
        <path d="M-26,30 L36,30" stroke="#FFFFFF" strokeWidth={4} opacity={0.35} strokeLinecap="round" />
      </g>
      {stream && (
        <g opacity={Math.min(1, pour * 1.5)}>
          {[-6, 0, 6].map((dx, i) => (
            <path key={i} d={`M${tip.x + dx * 0.5},${tip.y} Q${tip.x + dx * 1.2},${tip.y + len * 0.5} ${tip.x + dx * 2.2},${tip.y + len}`} stroke="#7CC4FF" strokeWidth={4 - Math.abs(dx) * 0.3} fill="none" strokeLinecap="round" strokeDasharray="18 10" strokeDashoffset={-f * 9 - i * 7} opacity={0.85} />
          ))}
          {[0, 1, 2, 3].map((i) => {
            const k = ((f * 0.08 + i * 0.25) % 1);
            return <circle key={`d${i}`} cx={tip.x + (i - 1.5) * 9 * k + (i % 2 ? 6 : -6) * k} cy={tip.y + len - 14 * Math.sin(k * Math.PI)} r={4 * (1 - k)} fill="#7CC4FF" />;
          })}
          <ellipse cx={tip.x + 4} cy={tip.y + len + 2} rx={22} ry={5} fill="#3E86C9" opacity={0.55} />
        </g>
      )}
    </g>
  );
};

export const PROPS = {
  Chair, OfficeChair, Table, Desk, Bed, Sofa, Door, Window, Shelf, FloorLamp,
  Laptop, Monitor, TV, Phone, Keyboard, Camera, GameController,
  Whiteboard, Blackboard, Book, BookStack, Paper, Clock, Calendar, Backpack, Briefcase, Mug, Bottle,
  SoccerBall, Basketball, Hoop, Goal, Dumbbell, Barbell, PullUpBar, PunchingBag, Trophy, Medal, FinishLine, Flag, Target,
  Hammer, Sledgehammer, Shovel, Pickaxe, Axe, Saw, Rope, Ladder, Wheel, Cart, Toolbox, Bucket,
  Boulder, Rock, Brick, BrickWall, Tree, Sprout, Plant, Hill, Slope, Stairs, Mountain, Cloud, Sun, Water, Fish, FishingRod,
  Coin, CoinStack, Cash, MoneyBag, Jar, PiggyBank, CreditCard, Wallet, Safe, Pipe,
  Box, Gift, Bag, Car, Bike, House, RoadSign, Battery, Lightbulb, Heart, Hourglass, Scale, Key, Lock, Chain, Bomb, Bell, Mirror,
  SpeechBubble, ThoughtBubble, Exclaim, Zzz, Sweat, Arrow, Checkmark,
  Hole, DirtPile, WateringCan,
} as const;
export type PropName = keyof typeof PROPS;
