// VER PARA CRER · Persona — o rig de personagem da marca (reutilizável em todos os episódios).
// DNA: 6,5 cabeças de altura, formas geométricas suaves, sem contorno preto, sombra lateral discreta,
// rosto mínimo em 3/4 (nariz, olho, sobrancelha), e a assinatura: um fio de luz de brasa na borda iluminada.
// Esqueleto com cinemática direta: toda pose é um conjunto de ângulos, então qualquer gesto pode ser
// interpolado com suavidade (acting contínuo, sem trocar de desenho).
import React from 'react';
import {COLORS} from '../tokens';

export const SKIN = {a: '#E7C29C', b: '#CFA078', c: '#A9744F', d: '#7B5238'} as const;
export const OUTFIT = {
  deep: {top: COLORS.deep, low: COLORS.graphite},
  sage: {top: '#6E8A76', low: COLORS.graphite},
  cream: {top: '#E9DFCB', low: '#3A3F47'},
  ember: {top: '#8C4A2A', low: COLORS.graphite},
} as const;
export type Hair = 'short' | 'bun' | 'curly' | 'long';
export type Look = {skin: keyof typeof SKIN; outfit: keyof typeof OUTFIT; hair: Hair};

/** Ângulos em graus. Membros: 0 = pendendo para baixo, positivo = para a frente. lean: tronco inclinado à frente. */
export type Pose = {lean: number; head: number; shF: number; elF: number; shB: number; elB: number; hipF: number; knF: number; hipB: number; knB: number; eyes: number; handF: number; handB: number};
// eyes: 0 aberto · 1 olhando para baixo · 2 fechado. hand: 0 relaxada · 1 palma para cima (concha)
export const POSES: Record<string, Pose> = {
  stand: {lean: 0, head: 0, shF: -6, elF: 10, shB: 6, elB: 6, hipF: 3, knF: 0, hipB: -3, knB: 2, eyes: 0, handF: 0, handB: 0},
  lookUp: {lean: -3, head: -22, shF: -4, elF: 12, shB: 8, elB: 8, hipF: 3, knF: 0, hipB: -3, knB: 2, eyes: 0, handF: 0, handB: 0},
  lookSide: {lean: 2, head: 8, shF: 4, elF: 18, shB: 6, elB: 8, hipF: 3, knF: 0, hipB: -3, knB: 2, eyes: 0, handF: 0, handB: 0},
  offer: {lean: 4, head: 26, shF: 58, elF: 42, shB: 4, elB: 14, hipF: 3, knF: 0, hipB: -3, knB: 2, eyes: 1, handF: 1, handB: 0},
  sitHug: {lean: 30, head: 34, shF: 11, elF: 74, shB: 6, elB: 78, hipF: 140, knF: 115, hipB: 130, knB: 108, eyes: 2, handF: 0, handB: 0},
  sitReceive: {lean: 12, head: 18, shF: 7, elF: 125, shB: 2, elB: 128, hipF: 140, knF: 115, hipB: 130, knB: 108, eyes: 1, handF: 1, handB: 1},
  sitHope: {lean: 6, head: -6, shF: 9, elF: 122, shB: 4, elB: 126, hipF: 140, knF: 115, hipB: 130, knB: 108, eyes: 0, handF: 1, handB: 1},
};
export const mixPose = (a: Pose, b: Pose, u: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => { o[k] = a[k] + (b[k] - a[k]) * u; });
  return o;
};

// medidas (unidades = px na escala 1). Altura em pé ≈ 360.
export const BODY = {head: 29, neck: 10, torso: 118, upper: 64, fore: 58, thigh: 84, shin: 80, hipW: 9, shoulderDrop: 10};
export const STAND_Y = -(BODY.thigh + BODY.shin) - 8;
const rad = (d: number) => (d * Math.PI) / 180;
const dirDown = (a: number): [number, number] => [Math.sin(rad(a)), Math.cos(rad(a))];
const add = (p: [number, number], d: [number, number], k: number): [number, number] => [p[0] + d[0] * k, p[1] + d[1] * k];
const shade = (hex: string, k: number) => { const n = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) * (1 - k)); return `rgb(${n.map(Math.round).join(',')})`; };

/** Esqueleto: pontos das juntas a partir da pelve (0,0). */
export const skeleton = (p: Pose) => {
  const pel: [number, number] = [0, 0];
  const up: [number, number] = [Math.sin(rad(p.lean)), -Math.cos(rad(p.lean))];
  const neck = add(pel, up, BODY.torso);
  const sh = add(neck, up, -BODY.shoulderDrop);
  const headC = add(neck, [Math.sin(rad(p.lean + p.head * 0.4)), -Math.cos(rad(p.lean + p.head * 0.4))], BODY.neck + BODY.head);
  const arm = (s: number, e: number) => { const el = add(sh, dirDown(s + p.lean * 0.5), BODY.upper); const wr = add(el, dirDown(s + e + p.lean * 0.5), BODY.fore); return {el, wr, ang: s + e + p.lean * 0.5}; };
  const leg = (h: number, k: number, side: number) => { const hp: [number, number] = [side * BODY.hipW * 0.4, 0]; const kn = add(hp, dirDown(h), BODY.thigh); const an = add(kn, dirDown(h - k), BODY.shin); return {hp, kn, an, ang: h - k}; };
  return {pel, neck, sh, headC, F: arm(p.shF, p.elF), B: arm(p.shB, p.elB), LF: leg(p.hipF, p.knF, 1), LB: leg(p.hipB, p.knB, -1)};
};

const HAIR: Record<Hair, React.ReactNode> = {
  short: <path d="M -27 0 C -32 -30 -6 -42 15 -34 C 27 -29 29 -17 27 -12 C 15 -21 -1 -19 -9 -7 C -13 1 -20 7 -27 0 Z" />,
  bun: <><circle cx={-19} cy={-31} r={11} /><path d="M -27 2 C -32 -30 -6 -40 15 -33 C 27 -28 29 -18 27 -13 C 13 -21 -3 -18 -10 -6 C -14 3 -21 9 -27 2 Z" /></>,
  curly: <>{[[-20, -18, 12], [-10, -28, 12], [4, -31, 12], [16, -25, 10], [-25, -4, 10], [22, -16, 7]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</>,
  long: <path d="M -27 0 C -32 -34 0 -43 18 -31 C 27 -25 28 -16 26 -12 C 11 -19 1 -16 -6 -6 C -10 12 -10 34 -19 46 C -30 34 -30 14 -27 0 Z" />,
};

const Hand: React.FC<{at: [number, number]; ang: number; cup: number; skin: string}> = ({at, ang, cup, skin}) => (
  <>
  {cup > 0 && <g transform={`translate(${at[0].toFixed(2)} ${at[1].toFixed(2)})`} opacity={cup}>
    {/* concha: palma sempre para cima, dedos curvando na ponta */}
    <path d="M -4 -5 C -6 6 6 11 17 11 C 26 11 32 6 34 -2 C 35 -7 31 -9 29 -5 C 26 0 22 3 16 3 C 9 3 5 0 3 -5 Z" fill={skin} />
    <path d="M 0 -5 C 1 -11 6 -13 9 -10" stroke={skin} strokeWidth={5.5} strokeLinecap="round" fill="none" />
  </g>}
  <g transform={`translate(${at[0].toFixed(2)} ${at[1].toFixed(2)}) rotate(${(-ang).toFixed(2)})`}>
    {/* mão relaxada ↔ concha (palma para cima) */}
    <g opacity={1 - cup}><path d="M -7 -2 C -9 6 -8 16 -2 20 C 4 23 9 18 9 10 C 9 4 8 -1 6 -3 Z" fill={skin} /><path d="M 6 2 C 11 4 13 9 10 13" stroke={skin} strokeWidth={5} strokeLinecap="round" fill="none" /></g>
  </g>
  </>
);

/** O personagem. x,y = pelve. dir 1 = olha para a direita. t = tempo (piscar, respiração). */
export const Persona: React.FC<{x: number; y: number; pose: Pose; look: Look; t: number; s?: number; dir?: 1 | -1; rim?: number; id?: string; shadow?: boolean}> = ({x, y, pose, look, t, s = 1, dir = 1, rim = 1, shadow = true}) => {
  const k = skeleton(pose);
  const skin = SKIN[look.skin], o = OUTFIT[look.outfit];
  const breathe = Math.sin(t * 1.6) * 1.2;
  const blinkPh = (t * 0.27 + (look.skin.charCodeAt(0) % 7) * 0.13) % 1;
  const eyes = pose.eyes >= 1.5 || blinkPh < 0.035 ? 2 : pose.eyes >= 0.5 ? 1 : 0;
  const limb = (a: [number, number], b: [number, number], w: number, c: string) => <path d={`M ${a[0].toFixed(2)} ${a[1].toFixed(2)} L ${b[0].toFixed(2)} ${b[1].toFixed(2)}`} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" />;
  const foot = (an: [number, number]) => <ellipse cx={an[0] + 8} cy={an[1] + 4} rx={14} ry={6.5} fill={COLORS.graphite} />;
  const sit = pose.hipF > 60;
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
      {shadow && <ellipse cx={sit ? 40 : 6} cy={-groundY(pose) - 2} rx={sit ? 80 : 58} ry={8} fill={COLORS.graphite} opacity={0.16} />}
      <g transform={`translate(0 ${breathe * 0.3})`}>
        {/* perna e braço de trás (um tom mais escuro: profundidade) */}
        {limb(k.LB.hp, k.LB.kn, 25, shade(o.low, 0.18))}{limb(k.LB.kn, k.LB.an, 23, shade(o.low, 0.18))}{foot(k.LB.an)}
        {limb(k.sh, k.B.el, 17, shade(o.top, 0.2))}{limb(k.B.el, k.B.wr, 15, shade(o.top, 0.2))}
        <Hand at={k.B.wr} ang={k.B.ang} cup={pose.handB} skin={shade(skin, 0.12)} />
        {/* tronco */}
        <g transform={`rotate(${pose.lean})`}>
          <path d="M -23 4 C -25 -40 -29 -92 -26 -110 Q -24 -122 0 -124 Q 23 -122 26 -110 C 29 -92 26 -40 23 4 Z" fill={o.top} />
          <path d="M 8 -120 Q 24 -118 26 -108 C 28 -90 26 -40 23 4 L 10 4 C 14 -40 14 -90 8 -120 Z" fill="#000" opacity={0.1} />
          <path d="M -11 -117 Q 0 -108 11 -117" stroke={COLORS.gold} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          {rim > 0 && <path d="M 26 -108 C 28 -88 26 -44 23 0" stroke={COLORS.goldLight} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.75 * rim} />}
          <path d="M -24 -4 L 24 -4 L 23 6 L -23 6 Z" fill={o.low} />
        </g>
        {/* perna da frente */}
        {limb(k.LF.hp, k.LF.kn, 26, o.low)}{limb(k.LF.kn, k.LF.an, 24, o.low)}{foot(k.LF.an)}
        {/* cabeça */}
        <g transform={`translate(${k.headC[0].toFixed(2)} ${k.headC[1].toFixed(2)}) rotate(${(pose.head * 0.6 + pose.lean * 0.5).toFixed(2)})`}>
          <rect x={-7} y={18} width={15} height={16} rx={6} fill={shade(skin, 0.1)} />
          <ellipse cx={0} cy={0} rx={25} ry={29} fill={skin} />
          <ellipse cx={-5} cy={3} rx={5} ry={7} fill={shade(skin, 0.12)} />
          <path d="M 23 -7 L 31 4 L 23 7 Z" fill={skin} />
          {eyes === 0 && <circle cx={13} cy={-4} r={2.7} fill={COLORS.graphite} />}
          {eyes === 1 && <path d="M 9 -3 Q 13 0 17 -3" stroke={COLORS.graphite} strokeWidth={2.4} strokeLinecap="round" fill="none" />}
          {eyes === 2 && <path d="M 9 -2 Q 13 1 17 -2" stroke={COLORS.graphite} strokeWidth={2.4} strokeLinecap="round" fill="none" />}
          <path d={`M 8 ${eyes === 2 ? -9 : -12} L 18 -13`} stroke={COLORS.graphite} strokeWidth={2.2} strokeLinecap="round" />
          <g fill={COLORS.graphite}>{HAIR[look.hair]}</g>
          {rim > 0 && <path d="M 12 -25 C 22 -19 27 -8 26 4" stroke={COLORS.goldLight} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.8 * rim} />}
        </g>
        {/* braço da frente */}
        {limb(k.sh, k.F.el, 18, o.top)}{limb(k.F.el, k.F.wr, 16, o.top)}
        <Hand at={k.F.wr} ang={k.F.ang} cup={pose.handF} skin={skin} />
      </g>
    </g>
  );
};
/** Altura da pelve acima do chão para uma pose (pés apoiados). */
export const groundY = (pose: Pose) => { const k = skeleton(pose); return -Math.max(k.LF.an[1], k.LB.an[1]) - 9; };

/** Posição (no espaço do pai) da palma da mão da frente — para colocar objetos na mão. */
export const palmOf = (pose: Pose, x: number, y: number, s = 1, dir: 1 | -1 = 1): [number, number] => {
  const k = skeleton(pose), a = rad(k.F.ang);
  const off: [number, number] = [(Math.sin(a) * 6) * (1 - pose.handF) + 17 * pose.handF, (Math.cos(a) * 6) * (1 - pose.handF) - 1 * pose.handF];
  return [x + dir * s * (k.F.wr[0] + off[0]), y + s * (k.F.wr[1] + off[1])];
};

/** Elenco do episódio 1 (identidade padrão: reaparecem em outros vídeos). */
export const CAST = {
  semeador: {skin: 'b', outfit: 'deep', hair: 'short'} as Look,
  alguem: {skin: 'c', outfit: 'sage', hair: 'curly'} as Look,
  guardia: {skin: 'a', outfit: 'cream', hair: 'bun'} as Look,
  viajante: {skin: 'd', outfit: 'ember', hair: 'long'} as Look,
};
