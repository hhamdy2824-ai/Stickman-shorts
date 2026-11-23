import {Easing, interpolate} from "remotion";
import {byHands} from "./ik";

// Angles are absolute screen directions in degrees:
//   0 = pointing down, 90 = right, 180 = up, -90 = left.
// The figure hangs from the HIP. dx/dy move the whole body (px).
export type Pose = {
  torso: number;
  head?: number; // defaults to torso direction
  armL: [number, number]; // [upper, fore]
  armR: [number, number];
  legL: [number, number]; // [thigh, shin]
  legR: [number, number];
  dx?: number;
  dy?: number;
  tool?: number; // screen angle a held tool's head points to (tools follow it; default = near forearm)
};

// All poses face RIGHT. Use `flip` on <Stickman> to face left.
export const POSES = {
  stand: {torso: 180, armL: [-16, -8], armR: [16, 8], legL: [-8, -6], legR: [8, 6]},
  think: {torso: 178, head: 172, armL: [-15, 150], armR: [20, 4], legL: [-6, -4], legR: [8, 6]},
  sadStand: {torso: 168, head: 140, armL: [-4, 0], armR: [6, 2], legL: [-6, -4], legR: [6, 4]},
  walkA: {torso: 175, armL: [-30, -10], armR: [30, 50], legL: [-28, -10], legR: [26, -15]},
  walkB: {torso: 175, armL: [30, 50], armR: [-30, -10], legL: [26, -15], legR: [-28, -10]},
  runA: {torso: 160, armL: [-60, 20], armR: [50, 120], legL: [-50, 0], legR: [60, -40], dy: -6},
  runB: {torso: 160, armL: [50, 120], armR: [-60, 20], legL: [60, -40], legR: [-50, 0], dy: -6},
  push: {torso: 132, head: 128, armL: [74, 70], armR: [68, 64], legL: [-32, -14], legR: [-6, 4], dy: 14},
  push2: {torso: 128, head: 124, armL: [70, 66], armR: [74, 70], legL: [-6, 4], legR: [-34, -16], dy: 16},
  carry: {torso: 175, armL: [45, 125], armR: [55, 135], legL: [-8, -6], legR: [10, 6]},
  carryHeavy: {torso: 160, head: 150, armL: [140, 175], armR: [145, 178], legL: [-20, 0], legR: [20, 0], dy: 14},
  cheer: {torso: 180, armL: [-150, -170], armR: [150, 170], legL: [-14, -10], legR: [14, 10]},
  sit: {torso: 178, armL: [20, 70], armR: [30, 80], legL: [80, 10], legR: [85, 5], dy: 58},
  slump: {torso: 165, head: 125, armL: [20, 10], armR: [40, 20], legL: [85, 10], legR: [80, 5], dy: 62},
  fallen: {torso: 95, head: 95, armL: [150, 120], armR: [40, 60], legL: [-95, -90], legR: [-80, -100], dy: 120},
  pushupUp: {torso: 100, head: 105, armL: [5, -5], armR: [10, 0], legL: [-82, -82], legR: [-84, -84], dy: 68},
  pushupDown: {torso: 92, head: 96, armL: [-40, 40], armR: [-35, 45], legL: [-88, -88], legR: [-89, -89], dy: 104},
  lift: {torso: 180, armL: [-170, -178], armR: [170, 178], legL: [-14, -8], legR: [14, 8]},
  liftLow: {torso: 170, armL: [-60, -160], armR: [60, 160], legL: [-25, 10], legR: [25, -10], dy: 18},
  swing: {torso: 165, armL: [160, 150], armR: [155, 145], legL: [-18, -8], legR: [18, 8], tool: 195},
  swingHit: {torso: 150, armL: [70, 80], armR: [75, 85], legL: [-22, -8], legR: [22, 8], dy: 6, tool: 95},
  // real tool work (hands placed by IK; held tools follow `tool`, the far hand grips the shaft)
  digIn: byHands({torso: 152, head: 140, dy: 16, legL: [-25, -10], legR: [30, 5], tool: 25}, [78, 10], [60, -28]),
  digLift: byHands({torso: 165, head: 150, dy: 8, legL: [-22, -8], legR: [26, 4], tool: 100}, [70, -20], [29, -13]),
  digToss: byHands({torso: 172, head: 160, dy: 4, legL: [-18, -6], legR: [20, 4], tool: 140}, [60, -55], [33, -23]),
  hammerUp: byHands({torso: 172, head: 165, dy: 2, legL: [-20, -8], legR: [22, 8], tool: 200}, [30, -110], [20, -80]),
  hammerHit: byHands({torso: 150, head: 140, dy: 10, legL: [-28, -8], legR: [25, 8], tool: 95}, [88, -30], [48, -24]),
  pour: byHands({torso: 176, head: 165, legL: [-10, -6], legR: [10, 6]}, [80, -45]),
  dropIn: byHands({torso: 170, head: 155, legL: [-10, -6], legR: [12, 6]}, [88, -30]),
  // everyday
  wave: {torso: 180, armL: [-12, -6], armR: [150, 200], legL: [-8, -6], legR: [8, 6]},
  point: {torso: 180, armL: [-12, -6], armR: [95, 95], legL: [-8, -6], legR: [8, 6]},
  shrug: {torso: 180, armL: [-40, -150], armR: [40, 150], legL: [-8, -6], legR: [8, 6]},
  facepalm: {torso: 172, head: 155, armL: [-12, -6], armR: [40, 175], legL: [-8, -6], legR: [8, 6]},
  phone: {torso: 176, head: 150, armL: [30, 150], armR: [35, 145], legL: [-8, -6], legR: [8, 6]},
  typing: {torso: 172, armL: [40, 95], armR: [45, 100], legL: [85, 5], legR: [88, 0], dy: 58},
  sitPhone: {torso: 168, head: 145, armL: [30, 140], armR: [35, 135], legL: [82, 5], legR: [86, 0], dy: 58},
  sleep: {torso: -90, head: -90, armL: [0, 20], armR: [10, 30], legL: [88, 90], legR: [92, 92], dy: 110},
  kneel: {torso: 178, armL: [-10, -5], armR: [20, 10], legL: [-10, 85], legR: [70, 0], dy: 55},
  crouch: {torso: 140, head: 130, armL: [40, 20], armR: [55, 30], legL: [-40, 40], legR: [-30, 50], dy: 50},
  jump: {torso: 178, armL: [-160, -150], armR: [160, 150], legL: [-30, 30], legR: [30, -20], dy: -70},
  dig: {torso: 145, armL: [70, 20], armR: [80, 30], legL: [-20, 0], legR: [30, 0], dy: 12},
  pullRope: {torso: 205, head: 195, armL: [80, 90], armR: [85, 95], legL: [20, 10], legR: [50, 10], dy: 6},
  climbA: {torso: 180, armL: [160, 175], armR: [120, 150], legL: [60, -10], legR: [10, 0]},
  climbB: {torso: 180, armL: [120, 150], armR: [160, 175], legL: [10, 0], legR: [60, -10]},
  throw: {torso: 165, armL: [60, 90], armR: [200, 160], legL: [-25, -10], legR: [25, 10]},
  throwRelease: {torso: 150, armL: [-30, -20], armR: [110, 100], legL: [-30, -10], legR: [30, 0]},
  kick: {torso: 190, armL: [-50, -30], armR: [40, 60], legL: [-10, -5], legR: [80, 90], dy: -4},
  punch: {torso: 165, armL: [50, 140], armR: [95, 92], legL: [-25, -10], legR: [25, 8], dy: 4},
  hug: {torso: 180, armL: [80, 120], armR: [85, 125], legL: [-8, -6], legR: [8, 6]},
  sweat: {torso: 160, head: 145, armL: [-20, 10], armR: [25, 15], legL: [-20, -10], legR: [20, 10], dy: 8},
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPair = (a: [number, number], b: [number, number], t: number): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  torso: lerp(a.torso, b.torso, t),
  head: lerp(a.head ?? a.torso, b.head ?? b.torso, t),
  armL: lerpPair(a.armL, b.armL, t),
  armR: lerpPair(a.armR, b.armR, t),
  legL: lerpPair(a.legL, b.legL, t),
  legR: lerpPair(a.legR, b.legR, t),
  dx: lerp(a.dx ?? 0, b.dx ?? 0, t),
  dy: lerp(a.dy ?? 0, b.dy ?? 0, t),
  tool: a.tool === undefined && b.tool === undefined ? undefined : lerp(a.tool ?? a.armR[1], b.tool ?? b.armR[1], t),
});

// A track = keyframes in time order. Each keyframe holds a pose and a position.
export type KeyEase = "snap" | "smooth" | "linear" | "slow";
export type Key = {f: number; pose: PoseName | Pose; x?: number; y?: number; ease?: KeyEase; cyc?: boolean};

const resolve = (p: PoseName | Pose): Pose => (typeof p === "string" ? POSES[p] : p);
// snap: arrives fast with a small overshoot (lively, like hand-animated key poses)
// smooth: sine in-out (continuous loops: walking, pushing, typing)
const EASES: Record<KeyEase, (t: number) => number> = {
  snap: Easing.out(Easing.back(1.5)),
  smooth: Easing.inOut(Easing.sin),
  linear: (t) => t,
  slow: Easing.inOut(Easing.cubic),
};

export type Sample = {pose: Pose; x: number; y: number; inCycle: boolean; phase: number};

export const sampleTrack = (track: Key[], frame: number): Sample => {
  if (frame <= track[0].f) {
    const k = track[0];
    return {pose: resolve(k.pose), x: k.x ?? 0, y: k.y ?? 0, inCycle: false, phase: 0};
  }
  for (let i = 0; i < track.length - 1; i++) {
    const a = track[i];
    const b = track[i + 1];
    if (frame >= a.f && frame <= b.f) {
      const raw = interpolate(frame, [a.f, b.f], [0, 1]);
      const cyc = !!(a.cyc && b.cyc);
      const e = EASES[b.ease ?? (cyc ? "smooth" : "snap")];
      const t = e(raw);
      const tl = cyc ? raw : Easing.inOut(Easing.sin)(raw); // travel never overshoots
      return {
        pose: mixPose(resolve(a.pose), resolve(b.pose), t),
        x: lerp(a.x ?? 0, b.x ?? a.x ?? 0, tl),
        y: lerp(a.y ?? 0, b.y ?? a.y ?? 0, tl),
        inCycle: cyc,
        phase: raw,
      };
    }
  }
  const k = track[track.length - 1];
  return {pose: resolve(k.pose), x: k.x ?? 0, y: k.y ?? 0, inCycle: false, phase: 0};
};

// Build a looping cycle (walk, run, push-ups) quickly.
export const cycle = (poses: (PoseName | Pose)[], from: number, to: number, every: number, x?: (f: number) => number, y = 0): Key[] => {
  const keys: Key[] = [];
  let i = 0;
  for (let f = from; f <= to; f += every) {
    keys.push({f, pose: poses[i % poses.length], x: x ? x(f) : undefined, y, cyc: true});
    i++;
  }
  return keys;
};

// ---------- "life" layer: makes figures feel hand-animated ----------
// breathing idle, head follow-through, step bob, and a speed value used for smear trails.
const angleSum = (p: Pose) => p.torso + (p.head ?? p.torso) + p.armL[0] + p.armL[1] + p.armR[0] + p.armR[1] + p.legL[0] + p.legL[1] + p.legR[0] + p.legR[1];
export const alive = (track: Key[], frame: number, seed = 0) => {
  const now = sampleTrack(track, frame);
  const lag = sampleTrack(track, Math.max(0, frame - 4));
  const prev = sampleTrack(track, Math.max(0, frame - 2));
  const p = {...now.pose};
  const b = (frame + seed * 17) * 0.12;
  // breathing / idle sway (always on, tiny)
  p.torso += Math.sin(b) * 1.6;
  p.armL = [p.armL[0] + Math.sin(b + 1) * 2.5, p.armL[1] + Math.sin(b + 1.6) * 3];
  p.armR = [p.armR[0] + Math.sin(b + 2) * 2.5, p.armR[1] + Math.sin(b + 2.6) * 3];
  // head follows the body a few frames late (follow-through)
  const headNow = now.pose.head ?? now.pose.torso;
  const headLag = lag.pose.head ?? lag.pose.torso;
  p.head = headNow * 0.55 + headLag * 0.45 + Math.sin(b - 0.7) * 2.5;
  // bob: body rises in the middle of each cycle step, dips at contact
  const bob = now.inCycle ? -Math.sin(now.phase * Math.PI) * 7 : Math.sin(b * 0.5) * 1.2;
  p.dy = (p.dy ?? 0) + bob;
  const speed = Math.abs(angleSum(now.pose) - angleSum(prev.pose)) + Math.abs(now.x - prev.x) * 2;
  return {pose: p, x: now.x, y: now.y, speed, ghost1: prev, ghost2: sampleTrack(track, Math.max(0, frame - 4))};
};
