import React from "react";
import {AbsoluteFill, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont} from "@remotion/fonts";
import {PALETTE, TYPE, VIDEO} from "../style/theme";
import {Background, BgKind, FxDefs, Grain} from "../fx/Effects";

// Fonts are bundled in public/fonts so rendering works offline.
export const FONT = TYPE.hookFont;
loadFont({family: "Inter", url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600"});
loadFont({family: "Inter", url: staticFile("fonts/inter-latin-800-normal.woff2"), weight: "800"});
loadFont({family: "Courier Prime", url: staticFile("fonts/courier-prime-latin-700-normal.woff2"), weight: "700"});
loadFont({family: "Special Elite", url: staticFile("fonts/special-elite-latin-400-normal.woff2"), weight: "400"});

// Base frame: background + shared filters + children + vignette + grain + watermark.
// `background` lets a template draw its own (panels with different floors).
export const Scene: React.FC<{children: React.ReactNode; overlay?: React.ReactNode; bg?: BgKind; background?: React.ReactNode; grain?: number}> = ({children, overlay, bg = "plain", background, grain = 0.07}) => (
  <AbsoluteFill style={{backgroundColor: PALETTE.bg, fontFamily: FONT}}>
    <svg viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`} width="100%" height="100%">
      <FxDefs />
      <defs>
        <radialGradient id="vignette" cx="50%" cy="48%" r="75%">
          <stop offset="55%" stopColor={PALETTE.bg} stopOpacity={0} />
          <stop offset="100%" stopColor={PALETTE.bgVignette} stopOpacity={0.85} />
        </radialGradient>
      </defs>
      {background ?? <Background kind={bg} />}
      {children}
      <rect width={VIDEO.width} height={VIDEO.height} fill="url(#vignette)" pointerEvents="none" />
      {grain > 0 && <Grain opacity={grain} />}
      <text x={VIDEO.width / 2} y={VIDEO.height - 90} textAnchor="middle" fill={PALETTE.text} opacity={0.28} fontSize={24} fontFamily={TYPE.labelFont} fontWeight={700} letterSpacing={8}>
        {VIDEO.watermark}
      </text>
    </svg>
    {overlay}
  </AbsoluteFill>
);

export const Ground: React.FC<{y: number; x1?: number; x2?: number}> = ({y, x1 = 0, x2 = VIDEO.width}) => (
  <line x1={x1} x2={x2} y1={y} y2={y} stroke={PALETTE.ground} strokeWidth={3} />
);

// Typewriter-caps label (Stick To It). `glow` = colored glowing label (Pathlight mindsets).
export const Label: React.FC<{x: number; y: number; text: string; delay?: number; color?: string; size?: number; anchor?: "start" | "middle" | "end"; glow?: string}> = ({x, y, text, delay = 0, color = PALETTE.text, size = TYPE.labelSize, anchor = "middle", glow}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 14}});
  const common = {x, y, textAnchor: anchor, fontSize: size, fontFamily: TYPE.labelFont, fontWeight: 700, letterSpacing: TYPE.letterSpacing};
  return (
    <g opacity={p} transform={`translate(0 ${(1 - p) * 16})`}>
      {glow && <text {...common} fill={glow} filter="url(#glow8)" opacity={0.9}>{text.toUpperCase()}</text>}
      <text {...common} fill={glow ?? color}>{text.toUpperCase()}</text>
    </g>
  );
};

// Counter in the typewriter font, small caption above ("SAME STONE" / "DAY").
export const Counter: React.FC<{x: number; y: number; value: number | string; caption?: string; color?: string; anchor?: "start" | "middle" | "end"; size?: number}> = ({x, y, value, caption, color = PALETTE.text, anchor = "middle", size = TYPE.counterSize}) => (
  <g transform={`translate(${x},${y})`}>
    {caption && (
      <text y={-size * 0.85} textAnchor={anchor} fill={PALETTE.textMuted} fontSize={26} fontFamily={TYPE.labelFont} fontWeight={700} letterSpacing={6}>
        {caption.toUpperCase()}
      </text>
    )}
    <text textAnchor={anchor} fill={color} fontSize={size} fontFamily={TYPE.labelFont} fontWeight={700}>
      {value}
    </text>
  </g>
);

// Centered line of text that fades in (payoff / question).
export const Caption: React.FC<{text: string; y: number; from: number; size?: number; highlight?: string; font?: string}> = ({text, y, from, size = TYPE.titleSize, highlight, font = TYPE.hookFont}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 10], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const parts = highlight ? text.split(highlight) : [text];
  return (
    <text x={VIDEO.width / 2} y={y} textAnchor="middle" fontSize={size} fontWeight={800} fontFamily={font} fill={PALETTE.text} opacity={o}>
      {parts[0]}
      {highlight && <tspan fill={PALETTE.accent}>{highlight}</tspan>}
      {parts[1]}
    </text>
  );
};

// Timed on-screen story lines ("Same floor. Same 15 seconds."). "\n" = second line.
// font "hook" = Inter bold (Pathlight hooks) · "type" = typewriter caps (Stick To It lessons)
export type Line = {from: number; to: number; text: string; highlight?: string; font?: "hook" | "type"};
export const StoryText: React.FC<{lines: Line[]; y: number; size?: number}> = ({lines, y, size = 60}) => {
  const frame = useCurrentFrame();
  const line = lines.find((l) => frame >= l.from && frame < l.to);
  if (!line) return null;
  const o = interpolate(frame, [line.from, line.from + 8, line.to - 6, line.to], [0, 1, 1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const typeFont = line.font === "type";
  const text = typeFont ? line.text.toUpperCase() : line.text;
  const hl = line.highlight && typeFont ? line.highlight.toUpperCase() : line.highlight;
  const rows = text.split("\n");
  const sz = typeFont ? size * 0.85 : size;
  return (
    <text x={VIDEO.width / 2} y={y - ((rows.length - 1) * sz * 1.2) / 2} textAnchor="middle" fontSize={sz} fontWeight={typeFont ? 700 : 800} fontFamily={typeFont ? TYPE.labelFont : TYPE.hookFont} letterSpacing={typeFont ? 3 : 0} fill={PALETTE.text} opacity={o} transform={`translate(0 ${(1 - o) * 12})`}>
      {rows.map((r, i) => {
        const parts = hl && r.includes(hl) ? r.split(hl) : [r];
        return (
          <tspan key={i} x={VIDEO.width / 2} dy={i === 0 ? 0 : sz * 1.2}>
            {parts[0]}
            {parts.length > 1 && <tspan fill={PALETTE.accent}>{hl}</tspan>}
            {parts[1]}
          </tspan>
        );
      })}
    </text>
  );
};

// Place any prop on the canvas.
export const Place: React.FC<{x: number; y: number; s?: number; r?: number; flip?: boolean; opacity?: number; children: React.ReactNode}> = ({x, y, s = 1, r = 0, flip = false, opacity = 1, children}) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${flip ? -s : s},${s})`} opacity={opacity}>{children}</g>
);
