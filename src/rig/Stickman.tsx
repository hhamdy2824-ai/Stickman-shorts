import React, {useId} from "react";
import {CHARACTERS, CharacterName, CharacterStyle, HIP_H, PALETTE} from "../style/theme";
import {ik2, toolAngle} from "./ik";
import {Pose} from "./poses";

const rad = (d: number) => (d * Math.PI) / 180;
const dir = (a: number) => ({x: Math.sin(rad(a)), y: Math.cos(rad(a))});
type P = {x: number; y: number};

export type Mood = "normal" | "angry" | "sad" | "happy" | "shocked";

type Props = {
  pose: Pose;
  x: number;              // hip position on the 1080x1920 canvas
  y: number;
  scale?: number;
  flip?: boolean;         // face left
  character?: CharacterName;
  style?: Partial<CharacterStyle>; // one-off overrides
  mood?: Mood;
  handProp?: React.ReactNode;     // drawn at the near (right) hand, local coords
  backHandProp?: React.ReactNode; // drawn at the far (left) hand, behind the body
  headProp?: React.ReactNode;     // hat, thought bubble... drawn at head center
  tool?: HeldTool;                // a held object that follows the hands (see HeldTool)
};

// A held object. mode "tool": long tools (shovel, hammer, axe) rotate with pose.tool and the
// far hand grips the shaft (IK). mode "hand": drawn upright at the near hand (phone, can, cup).
// render() gets `toGround`: distance from the near hand down to the ground line (prop-local units
// before the prop's own scale), so a prop can reach the floor (water stream, rope...).
export type HeldTool = {mode: "tool" | "hand"; render: (ctx: {toGround: number; angle: number}) => React.ReactNode; grip?: number; handle?: number};

export const Stickman: React.FC<Props> = ({pose, x, y, scale = 1, flip = false, character = "hero", style, mood = "normal", handProp, backHandProp, headProp, tool}) => {
  const s: CharacterStyle = {...CHARACTERS[character], ...style};
  const id = useId().replace(/:/g, "");
  const sx = flip ? -1 : 1;

  const hip = {x: pose.dx ?? 0, y: pose.dy ?? 0};
  const step = (from: P, a: number, len: number): P => {
    const d = dir(a);
    return {x: from.x + d.x * len, y: from.y + d.y * len};
  };
  const shoulder = step(hip, pose.torso, s.torso);
  const neckTop = step(shoulder, pose.head ?? pose.torso, s.neck);
  const head = step(shoulder, pose.head ?? pose.torso, s.neck + s.headRadius);
  const bean = s.look === "bean";
  // bean: arms grow from inside the body near its top, line: from the shoulder point
  const chest = step(hip, pose.torso, s.torso * 0.74);
  const armRoot = bean ? step(chest, pose.torso - 90, s.torsoWidth * 0.3) : shoulder;      // near arm: front edge of the body
  const armRootL = bean ? step(chest, pose.torso - 90, -s.torsoWidth * 0.12) : shoulder;   // far arm: behind
  let elbowL = step(armRootL, pose.armL[0], s.upperArm);
  let handL = step(elbowL, pose.armL[1], s.foreArm);
  const elbowR = step(armRoot, pose.armR[0], s.upperArm);
  const handR = step(elbowR, pose.armR[1], s.foreArm);
  // held tool: far hand slides onto the shaft, so both hands really hold it
  const tAng = toolAngle(pose);
  const tDir = dir(tAng);
  const grip = tool?.grip ?? 40;
  if (tool?.mode === "tool" && grip > 0) {
    const target = {x: handR.x - tDir.x * grip, y: handR.y - tDir.y * grip};
    const [u, f] = ik2(armRootL, target, s.upperArm, s.foreArm);
    elbowL = step(armRootL, u, s.upperArm);
    handL = step(elbowL, f, s.foreArm);
  }
  const toolNode = tool && (
    <g>
      {tool.mode === "tool" && (tool.handle ?? 1) > 0 && (
        <path d={`M${handR.x},${handR.y} L${handR.x - tDir.x * (grip + 16)},${handR.y - tDir.y * (grip + 16)}`} stroke={PALETTE.wood} strokeWidth={9 * (tool.handle ?? 1)} strokeLinecap="round" />
      )}
      <g transform={`translate(${handR.x},${handR.y}) rotate(${tool.mode === "tool" ? 180 - tAng : 0})`}>{tool.render({toGround: HIP_H - handR.y, angle: tAng})}</g>
    </g>
  );
  const kneeL = step(hip, pose.legL[0], s.thigh);
  const footL = step(kneeL, pose.legL[1], s.shin);
  const kneeR = step(hip, pose.legR[0], s.thigh);
  const footR = step(kneeR, pose.legR[1], s.shin);

  const d = (...p: P[]) => p.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");
  const o = s.outlineWidth;
  const handR_ = s.limb * s.hand;

  // a limb = outline pass + color pass + end blob (hand/foot)
  const limb = (pts: P[], color: string, end: P | null, foot = false, key = "") => (
    <g key={key}>
      {o > 0 && <path d={d(...pts)} stroke={s.outline} strokeWidth={s.limb + o * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {end && s.hand > 0 && o > 0 && (foot
        ? <ellipse cx={end.x + handR_ * 0.5} cy={end.y} rx={handR_ * 1.45 + o} ry={handR_ * 0.85 + o} fill={s.outline} />
        : <circle cx={end.x} cy={end.y} r={handR_ + o} fill={s.outline} />)}
      <path d={d(...pts)} stroke={color} strokeWidth={s.limb} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {end && s.hand > 0 && (foot
        ? <ellipse cx={end.x + handR_ * 0.5} cy={end.y} rx={handR_ * 1.45} ry={handR_ * 0.85} fill={color} />
        : <circle cx={end.x} cy={end.y} r={handR_} fill={color} />)}
    </g>
  );

  // face: eyes look toward the facing direction (right), mood changes brows/mouth
  const hr = s.headRadius;
  const ex = head.x + hr * 0.28;
  const ey = head.y - hr * 0.05;
  const face = s.eyes === "dots" && (
    <g>
      {mood === "shocked" ? (
        <>
          <circle cx={ex - hr * 0.2} cy={ey} r={hr * 0.13} fill={s.eyeColor} />
          <circle cx={ex + hr * 0.25} cy={ey} r={hr * 0.13} fill={s.eyeColor} />
          <ellipse cx={ex + hr * 0.05} cy={ey + hr * 0.45} rx={hr * 0.1} ry={hr * 0.14} fill={s.eyeColor} />
        </>
      ) : (
        <>
          <ellipse cx={ex - hr * 0.2} cy={ey} rx={hr * 0.08} ry={mood === "happy" ? hr * 0.05 : hr * 0.11} fill={s.eyeColor} />
          <ellipse cx={ex + hr * 0.25} cy={ey} rx={hr * 0.08} ry={mood === "happy" ? hr * 0.05 : hr * 0.11} fill={s.eyeColor} />
        </>
      )}
      {mood === "angry" && <path d={`M${ex - hr * 0.38},${ey - hr * 0.3} L${ex - hr * 0.05},${ey - hr * 0.16} M${ex + hr * 0.42},${ey - hr * 0.3} L${ex + hr * 0.1},${ey - hr * 0.16}`} stroke={s.eyeColor} strokeWidth={hr * 0.1} strokeLinecap="round" />}
      {mood === "sad" && <path d={`M${ex - hr * 0.38},${ey - hr * 0.18} L${ex - hr * 0.05},${ey - hr * 0.3} M${ex + hr * 0.42},${ey - hr * 0.18} L${ex + hr * 0.1},${ey - hr * 0.3}`} stroke={s.eyeColor} strokeWidth={hr * 0.08} strokeLinecap="round" />}
      {(mood === "happy" || (mood === "normal" && s.smile)) && <path d={`M${ex - hr * 0.2},${ey + hr * 0.32} Q${ex + hr * 0.03},${ey + hr * 0.55} ${ex + hr * 0.28},${ey + hr * 0.32}`} stroke={s.eyeColor} strokeWidth={hr * 0.08} fill="none" strokeLinecap="round" />}
    </g>
  );

  // ---------- bean look (your cap character) ----------
  const ang = (a: number) => (Math.atan2(dir(a).y, dir(a).x) * 180) / Math.PI;
  const line = (pts: P[], key: string) => (
    <g key={key}>
      {s.halo && <path d={d(...pts)} stroke={s.halo} strokeWidth={s.limb + 7} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      <path d={d(...pts)} stroke={s.limbColor} strokeWidth={s.limb} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  const mitten = (h: P, e: P, key: string) => {
    const a = (Math.atan2(h.y - e.y, h.x - e.x) * 180) / Math.PI;
    const k = s.hand;
    return (
      <g key={key} transform={`translate(${h.x},${h.y}) rotate(${a})`}>
        {s.halo && <ellipse cx={8 * k} cy={0} rx={11 * k + 3.5} ry={9 * k + 3.5} fill={s.halo} />}
        <ellipse cx={8 * k} cy={0} rx={11 * k} ry={9 * k} fill={s.limbColor} />
        <ellipse cx={4 * k} cy={-9 * k} rx={4 * k} ry={6 * k} fill={s.limbColor} transform={`rotate(-30 ${4 * k} ${-9 * k})`} />
      </g>
    );
  };
  const shoe = (f: P, key: string) => (
    <g key={key}>
      {s.halo && <ellipse cx={f.x + 9 * s.hand} cy={f.y + 2} rx={19 * s.hand + 3.5} ry={10 * s.hand + 3.5} fill={s.halo} />}
      <ellipse cx={f.x + 9 * s.hand} cy={f.y + 2} rx={19 * s.hand} ry={10 * s.hand} fill={s.limbColor} />
    </g>
  );
  const mid = {x: (hip.x + shoulder.x) / 2, y: (hip.y + shoulder.y) / 2};
  const bodyAng = ang(pose.torso);
  const cap = s.cap && (
    <g transform={`translate(${head.x},${head.y}) rotate(${180 - (pose.head ?? pose.torso)})`}>
      <path d={`M${-hr * 1.02},${-hr * 0.12} A${hr * 1.03} ${hr * 0.98} 0 0 1 ${hr * 1.02},${-hr * 0.12} Z`} fill={s.cap} stroke={s.outline} strokeWidth={o} strokeLinejoin="round" />
      <path d={`M${hr * 0.55},${-hr * 0.2} Q${hr * 1.3},${-hr * 0.42} ${hr * 1.6},${-hr * 0.1} Q${hr * 1.1},${hr * 0.05} ${hr * 0.6},${-hr * 0.02} Z`} fill={s.cap} stroke={s.outline} strokeWidth={o} strokeLinejoin="round" />
      <path d={`M0,${-hr * 1.08} Q${-hr * 0.5},${-hr * 0.7} ${-hr * 0.45},${-hr * 0.14} M0,${-hr * 1.08} Q${hr * 0.45},${-hr * 0.7} ${hr * 0.42},${-hr * 0.16}`} stroke={s.outline} strokeWidth={o * 0.45} fill="none" />
      <path d={`M${-hr * 1.0},${-hr * 0.2} L${hr * 0.62},${-hr * 0.2}`} stroke={s.outline} strokeWidth={o * 0.5} opacity={0.5} />
      <ellipse cx={0} cy={-hr * 1.1} rx={hr * 0.12} ry={hr * 0.07} fill={s.cap} stroke={s.outline} strokeWidth={o * 0.5} />
    </g>
  );
  const beanBody = (
    <g>
      <defs>
        <linearGradient id={`shade-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.62" stopColor={s.body} />
          <stop offset="1" stopColor={s.shade} />
        </linearGradient>
      </defs>
      {backHandProp && <g transform={`translate(${handL.x},${handL.y})`}>{backHandProp}</g>}
      {line([footL, kneeL, hip], "legL")}
      {shoe(footL, "shoeL")}
      {line([handL, elbowL, armRootL], "armL")}
      {mitten(handL, elbowL, "handL")}
      <ellipse cx={mid.x} cy={mid.y} rx={s.torso / 2 + 8} ry={s.torsoWidth / 2} transform={`rotate(${bodyAng} ${mid.x} ${mid.y})`} fill={`url(#shade-${id})`} stroke={s.outline} strokeWidth={o} />
      {line([footR, kneeR, {x: hip.x + 4, y: hip.y - 4}], "legR")}
      {shoe(footR, "shoeR")}
      <circle cx={head.x} cy={head.y} r={hr} fill={`url(#shade-${id})`} stroke={s.outline} strokeWidth={o} />
      <g transform={`rotate(${180 - (pose.head ?? pose.torso)} ${head.x} ${head.y})`}>{face}</g>
      {cap}
      {toolNode}
      {line([handR, elbowR, armRoot], "armR")}
      {mitten(handR, elbowR, "handR")}
      {headProp && <g transform={`translate(${head.x},${head.y})`}>{headProp}</g>}
      {handProp && <g transform={`translate(${handR.x},${handR.y})`}>{handProp}</g>}
    </g>
  );

  const body = bean ? beanBody : (
    <g>
      {backHandProp && <g transform={`translate(${handL.x},${handL.y})`}>{backHandProp}</g>}
      {limb([footL, kneeL, hip], s.shade, footL, true, "legL")}
      {limb([handL, elbowL, shoulder], s.shade, handL, false, "armL")}
      {limb([hip, shoulder, neckTop], s.body, null, false, "torso")}
      {limb([footR, kneeR, hip], s.body, footR, true, "legR")}
      {/* head */}
      {o > 0 && <circle cx={head.x} cy={head.y} r={hr + o} fill={s.outline} />}
      <circle cx={head.x} cy={head.y} r={hr} fill={s.body} />
      <circle cx={head.x - hr * 0.3} cy={head.y - hr * 0.35} r={hr * 0.35} fill="#FFFFFF" opacity={0.25} />
      {face}
      {toolNode}
      {limb([handR, elbowR, shoulder], s.body, handR, false, "armR")}
      {headProp && <g transform={`translate(${head.x},${head.y})`}>{headProp}</g>}
      {handProp && <g transform={`translate(${handR.x},${handR.y})`}>{handProp}</g>}
    </g>
  );

  return (
    <g transform={`translate(${x},${y}) scale(${sx * scale},${scale})`} opacity={s.opacity}>
      {s.aura && (
        <>
          <defs>
            <filter id={`aura-${id}`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation={s.auraSize} />
            </filter>
          </defs>
          <g filter={`url(#aura-${id})`}>
            <path d={d(footL, kneeL, hip, kneeR, footR)} stroke={s.aura} strokeWidth={s.limb * 2.2} fill="none" strokeLinecap="round" />
            <path d={d(handL, elbowL, shoulder, elbowR, handR)} stroke={s.aura} strokeWidth={s.limb * 2.2} fill="none" strokeLinecap="round" />
            <path d={d(hip, shoulder)} stroke={s.aura} strokeWidth={s.limb * 2.6} />
            <circle cx={head.x} cy={head.y} r={hr * 1.5} fill={s.aura} />
          </g>
        </>
      )}
      {body}
    </g>
  );
};
