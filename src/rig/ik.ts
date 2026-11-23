// =====================================================================
//  RIG GEOMETRY — the same joint math the Stickman draws with, usable
//  outside the renderer: hand positions, 2-bone IK, tool tips.
//  Angles: 0 = down, 90 = right (forward), 180 = up, -90 = left.
//  Coordinates are actor-local (hip-anchored, facing right, unscaled):
//  the ground line is always at y = HIP_H in this space.
// =====================================================================
import {CHARACTERS, CharacterName, CharacterStyle} from "../style/theme";
import type {Pose} from "./poses";

export type P = {x: number; y: number};
const rad = (d: number) => (d * Math.PI) / 180;
export const dir = (a: number): P => ({x: Math.sin(rad(a)), y: Math.cos(rad(a))});
export const step = (from: P, a: number, len: number): P => {
  const d = dir(a);
  return {x: from.x + d.x * len, y: from.y + d.y * len};
};
export const angleOf = (v: P) => (Math.atan2(v.x, v.y) * 180) / Math.PI;

export const rigPoints = (pose: Pose, s: CharacterStyle) => {
  const hip = {x: pose.dx ?? 0, y: pose.dy ?? 0};
  const shoulder = step(hip, pose.torso, s.torso);
  const bean = s.look === "bean";
  const chest = step(hip, pose.torso, s.torso * 0.74);
  const armRoot = bean ? step(chest, pose.torso - 90, s.torsoWidth * 0.3) : shoulder;
  const armRootL = bean ? step(chest, pose.torso - 90, -s.torsoWidth * 0.12) : shoulder;
  const elbowR = step(armRoot, pose.armR[0], s.upperArm);
  const handR = step(elbowR, pose.armR[1], s.foreArm);
  const elbowL = step(armRootL, pose.armL[0], s.upperArm);
  const handL = step(elbowL, pose.armL[1], s.foreArm);
  return {hip, shoulder, chest, armRoot, armRootL, elbowR, handR, elbowL, handL};
};

// 2-bone IK: arm angles [upper, fore] that put the hand at `target`.
// The elbow bends DOWN (the natural choice for working arms).
export const ik2 = (root: P, target: P, a: number, b: number): [number, number] => {
  const v = {x: target.x - root.x, y: target.y - root.y};
  const d = Math.max(Math.abs(a - b) + 0.01, Math.min(a + b - 0.01, Math.hypot(v.x, v.y)));
  const base = angleOf(v);
  const alpha = (Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d)))) * 180) / Math.PI;
  const best = [base + alpha, base - alpha]
    .map((up) => {
      const e = step(root, up, a);
      const tip = {x: root.x + (v.x / Math.hypot(v.x, v.y)) * d, y: root.y + (v.y / Math.hypot(v.x, v.y)) * d};
      return {up, e, fore: angleOf({x: tip.x - e.x, y: tip.y - e.y})};
    })
    .sort((p, q) => q.e.y - p.e.y)[0];
  return [best.up, best.fore];
};

// A pose built from hand targets (actor-local). Uses the default (bean) proportions.
export const byHands = (base: Omit<Pose, "armL" | "armR"> & {armL?: [number, number]; armR?: [number, number]}, R?: [number, number], L?: [number, number]): Pose => {
  const s = CHARACTERS.hero;
  const p: Pose = {armL: [-16, -8], armR: [16, 8], ...base} as Pose;
  const pts = rigPoints(p, s);
  if (R) p.armR = ik2(pts.armRoot, {x: R[0], y: R[1]}, s.upperArm, s.foreArm);
  if (L) p.armL = ik2(pts.armRootL, {x: L[0], y: L[1]}, s.upperArm, s.foreArm);
  return p;
};

// Tools are drawn pointing "up" from the grip (local -y). This is the screen angle
// the tool head points to: pose.tool, or the near forearm direction.
export const toolAngle = (pose: Pose) => pose.tool ?? pose.armR[1];
// rotate a point given in the tool's own (unrotated) coords to actor-local coords
export const toolLocal = (pose: Pose, character: CharacterName | undefined, pt: P, ps: number): P => {
  const s = CHARACTERS[character ?? "hero"];
  const h = rigPoints(pose, s).handR;
  const th = rad(180 - toolAngle(pose));
  return {x: h.x + (pt.x * Math.cos(th) - pt.y * Math.sin(th)) * ps, y: h.y + (pt.x * Math.sin(th) + pt.y * Math.cos(th)) * ps};
};
