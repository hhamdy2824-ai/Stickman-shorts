// =====================================================================
//  EFFECTS — lighting, textures, particles, camera, end card.
// =====================================================================
import React from "react";
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {PALETTE, TYPE, VIDEO} from "../style/theme";

// ---------- shared SVG filters: put <FxDefs/> once inside the scene <svg> ----------
export const FxDefs: React.FC = () => (
  <defs>
    {/* rough stone / concrete look for props */}
    <filter id="rough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={3} seed={3} result="n" />
      <feColorMatrix in="n" type="saturate" values="0" result="g" />
      <feComponentTransfer in="g" result="g2"><feFuncA type="linear" slope={0.35} /></feComponentTransfer>
      <feComposite in="g2" in2="SourceGraphic" operator="in" result="tex" />
      <feBlend in="SourceGraphic" in2="tex" mode="multiply" />
    </filter>
    {/* film grain over the whole frame */}
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={8} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    {/* concrete wall texture */}
    <filter id="concrete">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves={4} seed={11} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <filter id="softblur"><feGaussianBlur stdDeviation={18} /></filter>
    <filter id="glow8"><feGaussianBlur stdDeviation={8} /></filter>
    <radialGradient id="floorpool" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor={`rgba(${PALETTE.lamp},0.45)`} />
      <stop offset="100%" stopColor={`rgba(${PALETTE.lamp},0)`} />
    </radialGradient>
    <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={`rgba(${PALETTE.lamp},0.38)`} />
      <stop offset="100%" stopColor={`rgba(${PALETTE.lamp},0.02)`} />
    </linearGradient>
  </defs>
);

// ---------- backgrounds ----------
// "plain": black + vignette (Simply Animated) · "concrete": gritty wall (Pathlight) · "stage": dark wall + floor band (Stick To It)
export type BgKind = "plain" | "concrete" | "stage";
export const Background: React.FC<{kind?: BgKind; floorY?: number; y0?: number; h?: number}> = ({kind = "stage", floorY, y0 = 0, h = VIDEO.height}) => (
  <g>
    <rect x={0} y={y0} width={VIDEO.width} height={h} fill={PALETTE.bg} />
    {kind === "concrete" && <rect x={0} y={y0} width={VIDEO.width} height={h} filter="url(#concrete)" opacity={0.16} />}
    {kind === "stage" && floorY !== undefined && (
      <>
        <rect x={0} y={y0} width={VIDEO.width} height={floorY - y0} fill={PALETTE.wall} />
        <rect x={0} y={floorY} width={VIDEO.width} height={y0 + h - floorY} fill={PALETTE.floor} />
      </>
    )}
  </g>
);

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
  const frame = useCurrentFrame();
  // shift the noise each frame so it "crawls" like film grain
  const dx = (frame * 37) % 200;
  return <rect x={-dx} y={-dx} width={VIDEO.width + 400} height={VIDEO.height + 400} filter="url(#grain)" opacity={opacity} style={{mixBlendMode: "overlay"}} />;
};

// ---------- lighting ----------
// Hanging lamp with a light cone down to the floor and a pool of light (Stick To It look).
export const Lamp: React.FC<{x: number; top: number; floorY: number; width?: number; flicker?: boolean; on?: boolean}> = ({x, top, floorY, width = 300, flicker = false, on = true}) => {
  const frame = useCurrentFrame();
  const f = flicker ? 0.85 + 0.15 * Math.abs(Math.sin(frame * 0.9) * Math.sin(frame * 0.37)) : 1;
  const lampY = top + 60;
  return (
    <g opacity={on ? 1 : 0.15}>
      <path d={`M${x},${top} L${x},${lampY - 18}`} stroke="#333" strokeWidth={3} />
      {on && (
        <>
          <path d={`M${x - 26},${lampY} L${x + 26},${lampY} L${x + width / 2},${floorY} L${x - width / 2},${floorY} Z`} fill="url(#cone)" opacity={f} filter="url(#glow8)" />
          <ellipse cx={x} cy={floorY} rx={width * 0.62} ry={34} fill="url(#floorpool)" opacity={f} />
          <ellipse cx={x} cy={lampY + 2} rx={30} ry={14} fill={`rgba(${PALETTE.lamp},0.9)`} filter="url(#glow8)" />
        </>
      )}
      <path d={`M${x - 30},${lampY} Q${x},${lampY - 34} ${x + 30},${lampY} Z`} fill="#3A3A3A" stroke="#111" strokeWidth={2} />
    </g>
  );
};

// Soft spotlight from above with no lamp body (Simply Animated look).
export const Spotlight: React.FC<{x: number; floorY: number; width?: number; strength?: number}> = ({x, floorY, width = 360, strength = 1}) => (
  <g opacity={strength}>
    <path d={`M${x - 40},${floorY - 700} L${x + 40},${floorY - 700} L${x + width / 2},${floorY} L${x - width / 2},${floorY} Z`} fill="url(#cone)" opacity={0.6} filter="url(#softblur)" />
    <ellipse cx={x} cy={floorY} rx={width * 0.6} ry={30} fill="url(#floorpool)" />
  </g>
);

// Big burst of light behind a winner (ending moments).
export const LightBurst: React.FC<{x: number; y: number; at: number; color?: string; r?: number}> = ({x, y, at, color = "255,240,210", r = 260}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 20}});
  if (frame < at) return null;
  return (
    <g>
      <circle cx={x} cy={y} r={r * p * 1.6} fill={`rgba(${color},0.12)`} filter="url(#softblur)" />
      <circle cx={x} cy={y} r={r * p} fill={`rgba(${color},0.35)`} filter="url(#softblur)" />
      {Array.from({length: 14}).map((_, i) => {
        const a = (i / 14) * Math.PI * 2 + frame * 0.004;
        return <path key={i} d={`M${x},${y} L${x + Math.cos(a) * r * 2.2 * p},${y + Math.sin(a) * r * 2.2 * p}`} stroke={`rgba(${color},0.12)`} strokeWidth={22} />;
      })}
    </g>
  );
};

// ---------- particles (deterministic: same frame = same picture) ----------
export type ParticleKind = "dust" | "sparks" | "debris" | "confetti" | "coins" | "smoke" | "sweat" | "dirt" | "water";
export const Burst: React.FC<{x: number; y: number; at: number; kind?: ParticleKind; count?: number; power?: number; seed?: string | number; life?: number; dir?: number; spread?: number; floor?: number}> = ({x, y, at, kind = "dust", count = 18, power = 1, seed = "b", life = 28, dir = -90, spread = 160, floor}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > life) return null;
  const k = t / life;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const r = (n: number) => random(`${seed}-${at}-${i}-${n}`);
    const ang = ((dir + (r(1) - 0.5) * spread) * Math.PI) / 180;
    const speed = (kind === "smoke" ? 2 : kind === "sparks" ? 16 : 9) * (0.4 + r(2)) * power;
    const grav = kind === "smoke" ? -0.05 : kind === "sparks" ? 0.5 : kind === "confetti" ? 0.25 : 0.7;
    const px = x + Math.cos(ang) * speed * t;
    const py = y + Math.sin(ang) * speed * t + 0.5 * grav * t * t;
    const fade = 1 - k;
    if (floor !== undefined && py > floor) continue; // landed
    const size = (kind === "smoke" ? 22 + t * 1.5 : kind === "sparks" ? 3 : kind === "debris" ? 7 : kind === "coins" ? 9 : 5) * (0.6 + r(3));
    if (kind === "sparks") {
      const vx = Math.cos(ang) * speed, vy = Math.sin(ang) * speed + grav * t;
      items.push(<path key={i} d={`M${px},${py} L${px - vx * 1.4},${py - vy * 1.4}`} stroke={i % 3 ? "#FFD27A" : "#FFFFFF"} strokeWidth={size} strokeLinecap="round" opacity={fade} />);
    } else if (kind === "debris") {
      items.push(<rect key={i} x={px} y={py} width={size} height={size * 0.8} fill={i % 2 ? PALETTE.brick : PALETTE.stoneDark} transform={`rotate(${t * 20 * (r(4) - 0.5)} ${px} ${py})`} opacity={fade} />);
    } else if (kind === "confetti") {
      items.push(<rect key={i} x={px} y={py} width={size * 1.6} height={size * 0.7} fill={[PALETTE.accent, PALETTE.info, PALETTE.danger, PALETTE.good][i % 4]} transform={`rotate(${t * 25 * (r(4) - 0.5)} ${px} ${py})`} opacity={fade} />);
    } else if (kind === "coins") {
      items.push(<circle key={i} cx={px} cy={py} r={size} fill={PALETTE.accent} stroke="#7A5200" strokeWidth={2} opacity={fade} />);
    } else if (kind === "smoke") {
      items.push(<circle key={i} cx={px} cy={py} r={size} fill="#888" opacity={0.18 * fade} />);
    } else if (kind === "dirt") {
      items.push(<rect key={i} x={px} y={py} width={size * 1.3} height={size} rx={size * 0.3} fill={i % 3 ? "#7A5534" : "#4E3420"} transform={`rotate(${t * 18 * (r(4) - 0.5)} ${px} ${py})`} opacity={fade} />);
    } else if (kind === "water") {
      items.push(<ellipse key={i} cx={px} cy={py} rx={size * 0.7} ry={size} fill="#7CC4FF" opacity={0.9 * fade} />);
    } else if (kind === "sweat") {
      items.push(<circle key={i} cx={px} cy={py} r={size * 0.8} fill="#7CC4FF" opacity={fade} />);
    } else {
      items.push(<circle key={i} cx={px} cy={py} r={size} fill="#B8B0A2" opacity={0.6 * fade} />);
    }
  }
  return <g>{items}</g>;
};

// Speed lines behind a moving object.
export const SpeedLines: React.FC<{x: number; y: number; len?: number; dirX?: number; opacity?: number}> = ({x, y, len = 120, dirX = -1, opacity = 0.5}) => (
  <g opacity={opacity}>
    {[-18, 0, 18].map((dy, i) => <path key={i} d={`M${x},${y + dy} L${x + dirX * (len - i * 20)},${y + dy}`} stroke="#fff" strokeWidth={4} strokeLinecap="round" />)}
  </g>
);

// Impact ring (punch, landing, hit).
export const Impact: React.FC<{x: number; y: number; at: number; color?: string; size?: number}> = ({x, y, at, color = "#FFFFFF", size = 70}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > 10) return null;
  return <circle cx={x} cy={y} r={size * (0.3 + t / 10)} fill="none" stroke={color} strokeWidth={8 * (1 - t / 10)} opacity={1 - t / 10} />;
};

// ---------- camera ----------
// Wrap scene content: slow push-in plus optional shakes at given frames.
export const Camera: React.FC<{children: React.ReactNode; zoomFrom?: number; zoomTo?: number; focusX?: number; focusY?: number; shakes?: {at: number; power?: number; dur?: number}[]; total?: number}> = ({children, zoomFrom = 1, zoomTo = 1.06, focusX = VIDEO.width / 2, focusY = VIDEO.height / 2, shakes = [], total}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const z = interpolate(frame, [0, total ?? durationInFrames], [zoomFrom, zoomTo], {extrapolateRight: "clamp"});
  let sx = 0, sy = 0, punch = 0;
  for (const s of shakes) {
    const tp = frame - s.at;
    if (tp >= 0 && tp < 14) punch += 0.035 * (s.power ?? 14) / 14 * Math.sin((tp / 14) * Math.PI);
    const t = frame - s.at;
    const dur = s.dur ?? 10;
    if (t >= 0 && t < dur) {
      const p = (s.power ?? 14) * (1 - t / dur);
      sx += (random(`sx${s.at}${t}`) - 0.5) * 2 * p;
      sy += (random(`sy${s.at}${t}`) - 0.5) * 2 * p;
    }
  }
  return <g transform={`translate(${focusX + sx},${focusY + sy}) scale(${z + punch}) translate(${-focusX},${-focusY})`}>{children}</g>;
};

// White flash (cut / impact).
export const Flash: React.FC<{at: number; dur?: number}> = ({at, dur = 6}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > dur) return null;
  return <rect width={VIDEO.width} height={VIDEO.height} fill="#fff" opacity={0.6 * (1 - t / dur)} />;
};

// ---------- end card ----------
// Dims the scene and shows the question + a FOLLOW FOR MORE pill.
export const EndCard: React.FC<{from: number; question?: string; highlight?: string; follow?: string}> = ({from, question, highlight, follow = "FOLLOW FOR MORE"}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from) return null;
  const dim = interpolate(frame, [from, from + 10], [0, 0.6], {extrapolateRight: "clamp"});
  const p = spring({frame: frame - from - 4, fps, config: {damping: 13}});
  const parts = question && highlight ? question.split(highlight) : [question ?? ""];
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`} width="100%" height="100%">
        <rect width={VIDEO.width} height={VIDEO.height} fill="#000" opacity={dim} />
        <g transform={`translate(${VIDEO.width / 2},${VIDEO.height * 0.46}) scale(${0.85 + p * 0.15})`} opacity={p}>
          {question && (
            <text y={-40} textAnchor="middle" fontFamily={TYPE.hookFont} fontWeight={800} fontSize={72} fill={PALETTE.text}>
              {parts[0]}
              {highlight && <tspan fill={PALETTE.accent}>{highlight}</tspan>}
              {parts[1]}
            </text>
          )}
          <rect x={-230} y={20} width={460} height={84} rx={42} fill="none" stroke={PALETTE.text} strokeWidth={4} />
          <text y={76} textAnchor="middle" fontFamily={TYPE.labelFont} fontWeight={700} fontSize={38} letterSpacing={6} fill={PALETTE.text}>{follow}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
