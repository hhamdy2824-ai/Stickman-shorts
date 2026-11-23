// ============================================================
//  THE ONE FILE TO CHANGE THE LOOK.
//  When a custom stickman reference image arrives, edit only
//  this file (body/outline colors, thickness, head, eyes, glow,
//  proportions). Every template, prop and video follows it.
// ============================================================

export type CharacterStyle = {
  look: "bean" | "line"; // "bean" = your cap character (oval body, thin limbs) · "line" = classic stickman
  body: string;          // body / head fill
  shade: string;         // shading on the dark side of head and body
  outline: string;       // contour line
  outlineWidth: number;
  limb: number;          // limb thickness (px at scale 1)
  limbColor: string;     // bean look: limbs are thin dark lines
  halo: string | null;   // soft light rim around dark limbs so they read on dark backgrounds
  headRadius: number;
  hand: number;          // hand/foot size multiplier (0 = none)
  eyes: "dots" | "none";
  eyeColor: string;
  smile: boolean;        // default mouth when mood is "normal"
  cap: string | null;    // cap color (null = no cap)
  aura: string | null;   // glow color around the figure (null = off)
  auraSize: number;
  opacity: number;
  // proportions
  torso: number;         // bean: body length · line: torso line length
  torsoWidth: number;    // bean body width
  neck: number;
  upperArm: number;
  foreArm: number;
  thigh: number;
  shin: number;
};

// Your character (reference sheets: white bean body, big round head,
// thin black limbs, black mitten hands and oval shoes, colored cap).
const bean: CharacterStyle = {
  look: "bean",
  body: "#FFFFFF",
  shade: "#D6D6D6",
  outline: "#111111",
  outlineWidth: 5,
  limb: 8,
  limbColor: "#111111",
  halo: "rgba(255,255,255,0.42)",
  headRadius: 54,
  hand: 1,
  eyes: "dots",
  eyeColor: "#111111",
  smile: true,
  cap: "#F2D22E",
  aura: null,
  auraSize: 14,
  opacity: 1,
  torso: 96,
  torsoWidth: 70,
  neck: -6,
  upperArm: 50,
  foreArm: 46,
  thigh: 62,
  shin: 60,
};

// Classic glowing stickman (kept for variety / ghosts / crowds).
const line: CharacterStyle = {
  ...bean,
  look: "line",
  body: "#F4F2EE",
  shade: "#C9C5BE",
  outline: "#2A2A2A",
  outlineWidth: 3,
  limb: 17,
  limbColor: "#F4F2EE",
  halo: null,
  headRadius: 27,
  hand: 0.62,
  smile: false,
  cap: null,
  aura: "rgba(255,255,255,0.35)",
  torso: 92,
  neck: 6,
  upperArm: 54,
  foreArm: 50,
  thigh: 66,
  shin: 62,
};

export const CHARACTERS = {
  hero: bean,                                   // yellow cap — the one who does it right
  rival: {...bean, cap: "#D8432B", smile: false}, // red cap — the other side
  heroGlow: {...bean, aura: "rgba(242,210,46,0.45)"},
  rivalDim: {...bean, cap: "#D8432B", smile: false, body: "#B9B9B9", shade: "#8F8F8F"},
  ghost: {...bean, opacity: 0.3, cap: null},
  // mindset archetypes (Pathlight style): same body, cap + aura in the mindset color
  discipline: {...bean, cap: "#4F8CFF", aura: "rgba(80,150,255,0.5)"},
  motivation: {...bean, cap: "#F2D22E", aura: "rgba(255,200,60,0.45)"},
  obsession: {...bean, cap: "#9B6BFF", aura: "rgba(170,110,255,0.5)"},
  anger: {...bean, cap: "#D8432B", smile: false, aura: "rgba(235,60,60,0.65)", auraSize: 18},
  gold: {...bean, body: "#F5C64A", shade: "#C98E1E", aura: "rgba(245,165,36,0.6)"},
  stick: line,
  stickGrey: {...line, body: "#9C9A96", shade: "#7A7874", limbColor: "#9C9A96", aura: null},
} satisfies Record<string, CharacterStyle>;

// Hip height of a standing figure (templates put the hip this far above the ground).
export const HIP_H = bean.thigh + bean.shin + 8;

export type CharacterName = keyof typeof CHARACTERS;

export const PALETTE = {
  bg: "#0A0A0A",
  bgVignette: "#000000",
  wall: "#121212",
  floor: "#1A1A1A",
  ground: "#2C2C2C",
  text: "#F4F2EE",
  textMuted: "#8F8C86",
  accent: "#F5A524",     // the ONE warm accent (coins, highlights)
  danger: "#E5484D",
  good: "#46A758",
  info: "#4F8CFF",
  lamp: "255,214,150",   // rgb of lamp light (used with alpha)
  // props
  propLight: "#E6E2DA",
  propMid: "#B9B4AA",
  propDark: "#77736C",
  propOutline: "#1C1C1C",
  wood: "#8A6747",
  woodDark: "#5E4430",
  metal: "#9BA3AC",
  metalDark: "#5F666E",
  stone: "#B8AE9E",
  stoneDark: "#8C8374",
  brick: "#C4643C",
  brickDark: "#8E4426",
  screen: "#7CC4FF",
  green: "#6DBF6A",
  greenDark: "#3F7D3D",
  paper: "#F3EFE6",
};

// Mindset label colors (Pathlight style)
export const MINDSET_COLORS: Record<string, string> = {
  discipline: "#5B9BFF",
  motivation: "#FFC23D",
  obsession: "#B07CFF",
  anger: "#FF5252",
};

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  watermark: "YOUR CHANNEL", // change to the channel name
};

export const TYPE = {
  hookFont: "Inter",          // story lines / hooks
  labelFont: "Courier Prime", // typewriter caps for names & counters (Stick To It look)
  labelSize: 40,
  counterSize: 64,
  titleSize: 62,
  letterSpacing: 6,
};
