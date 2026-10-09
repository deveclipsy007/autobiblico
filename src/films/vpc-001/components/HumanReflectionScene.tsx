// HumanReflectionScene — a semente agora está na palma de alguém. A câmera muda de perspectiva e revela a pessoa.
// Da semente saem fios de luz que desenham: uma oração, um gesto de amor, uma porta que se abre.
// Os três viram uma linha de acontecimentos que cresce, curva e vira galho.
import React from 'react';
import {COLORS, FONTS} from '../../../brand/tokens';
import {D, EBACK, EIN, EIO, EO, ESM, Pt, cbez, clamp, lerp} from '../lib/math';
import {Fmt, pick, useFmt} from '../lib/format';
import {A, S} from '../story';
import {CamKey, WorldLayer, camAt, drift, project} from './CinematicCamera';
import {SeedSphere} from './SeedMacroScene';
import {CAST, POSES, Persona, mixPose, palmOf} from '../../../brand/characters/Persona';

const HS = 2.4;
const PALM0 = palmOf(POSES.offer, 0, 0, HS);
const OFFER_UP = {...POSES.offer, head: -6, eyes: 0};
import {W_T} from './WorldScene';
import {ChromaRing} from '../../../brand/fire';

export const HUMAN_T = {a: S.human, b: W_T.messageIn};
export const humanKeys = (f: Fmt): CamKey[] => [
    {t: 0, x: 0, y: 0, z: 8, r: 0},
    {t: A.imagem + 0.95, x: -20, y: -10, z: 2.6, r: -4, d: 1.5},
    {t: A.pequenos + 0.25, x: pick(f, -60, 120), y: pick(f, -200, -150), z: pick(f, 1.1, 1.0), r: 0, d: 1.6},
    {t: A.nem - 0.2, x: pick(f, -40, 140), y: pick(f, -240, -170), z: pick(f, 1.04, 0.95), d: 3.8, e: ESM},
    {t: W_T.messageIn - 0.5, x: pick(f, 200, 420), y: pick(f, -560, -460), z: pick(f, 0.72, 0.68), d: 1.1},
    {t: W_T.messageIn, x: pick(f, 1900, 2300), y: pick(f, -1100, -1000), z: pick(f, 0.62, 0.6), d: 0.5, e: EIN},
  ];
export const humanCam = (t: number, f: Fmt) => drift(camAt(t, humanKeys(f)), t, 0.8);


const ICONS = {
  oracao: ['M 0 -46 C -9 -30 -14 -12 -14 6 L -26 30 L 0 42 L 26 30 L 14 6 C 14 -12 9 -30 0 -46 Z', 'M 0 -46 V 42', 'M -26 30 L -36 46 M 26 30 L 36 46'],
  amor: ['M 0 40 C -36 14 -46 -4 -44 -18 C -41 -36 -18 -42 -6 -26 L 0 -18 L 6 -26 C 18 -42 41 -36 44 -18 C 46 -4 36 14 0 40 Z'],
  porta: ['M -30 46 V -46 H 30 V 46', 'M -46 46 H 46'],
};

const Icon: React.FC<{t: number; at: number; kind: keyof typeof ICONS; p: Pt; label: string; reorg: number; z: number}> = ({t, at, kind, p, label, reorg, z}) => {
  const draw = EO(D(t, at + 0.3, 0.8));
  if (t < at) return null;
  const s = lerp(1, 0.55, reorg);
  const door = EIO(D(t, at + 0.75, 0.9));
  return (
    <g transform={`translate(${p[0]} ${p[1]}) scale(${s})`}>
      <circle r={74} fill={COLORS.cream} stroke={COLORS.gold} strokeWidth={2.2 / z} opacity={EO(D(t, at + 0.2, 0.6))} />
      {kind === 'porta' && door > 0 && <path d={`M -30 46 L -30 -46 L ${lerp(-30, 30, 1)} -46 L 30 46 Z`} fill={COLORS.goldLight} opacity={0.5 * door} />}
      {kind === 'porta' && door > 0 && <path d={`M 30 46 L ${30 + 60 * door} 64 L ${-30 + 40 * door} 64 L -30 46 Z`} fill={COLORS.goldLight} opacity={0.35 * door} />}
      {ICONS[kind].map((d, i) => <path key={i} d={d} fill="none" stroke={COLORS.graphite} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />)}
      {kind === 'porta' && <path d={`M -30 46 V -46 L ${lerp(30, -6, door)} ${lerp(-46, -56, door)} V ${lerp(46, 58, door)} Z`} fill={COLORS.deep} stroke={COLORS.graphite} strokeWidth={4} strokeLinejoin="round" opacity={draw} />}
      {kind === 'amor' && <path d={ICONS.amor[0]} fill={COLORS.gold} opacity={0.35 * EO(D(t, at + 0.9, 0.6))} />}
      <text y={122} textAnchor="middle" fontFamily={FONTS.serif} fontStyle="italic" fontSize={38 / Math.max(0.8, z * s)} fill={COLORS.graphite} opacity={EO(D(t, at + 0.55, 0.6)) * (1 - reorg)}>{label}</text>
    </g>
  );
};

export const HumanReflectionScene: React.FC<{t: number}> = ({t}) => {
  const f = useFmt();
  const IP: Pt[] = pick(f, [[-260, -560], [-40, -560], [180, -560]] as Pt[], [[220, -380], [450, -380], [680, -380]] as Pt[]);
  const cam = humanCam(t, f);
  const iris = EIO(D(t, HUMAN_T.a, 0.8));
  const irisR = -30 + iris * Math.hypot(f.W, f.H) * 0.6;
  const reorg = EIO(D(t, A.nem - 0.5, 0.9));
  const line = ESM(D(t, A.nem - 0.1, 1.4));
  const fade = 0;
  const times = [A.oracao - 0.3, A.gesto - 0.25, A.decisao - 0.15];
  const thread = (i: number) => {
    const u = EO(D(t, times[i], 0.45));
    if (u <= 0 || u >= 1 && t > times[i] + 0.9) return null;
    const P = IP[i], c1: Pt = [P[0] * 0.2, -120], c2: Pt = [P[0], P[1] + 220];
    const pts = Array.from({length: 24}, (_, k) => cbez([0, -6], c1, c2, [P[0], P[1] + 76], (k / 23) * u));
    return <path key={i} d={`M ${pts.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join(' L ')}`} fill="none" stroke={COLORS.gold} strokeWidth={3 / cam.z} opacity={1 - EIN(D(t, times[i] + 0.6, 0.4))} />;
  };
  // linha de acontecimentos → galho
  const L0: Pt = [IP[0][0] - 160, IP[0][1]], L1: Pt = [IP[2][0] + 140, IP[2][1]];
  const branchEnd: Pt = pick(f, [620, -1200] as Pt, [1100, -900] as Pt);
  const bpts = [L0, ...Array.from({length: 30}, (_, k) => cbez(L1, [L1[0] + 220, L1[1]], [branchEnd[0] - 80, branchEnd[1] + 260], branchEnd, k / 29))];
  const shown = Math.max(2, Math.round(bpts.length * line));
  return (
    <div style={{position: 'absolute', inset: 0, clipPath: iris < 1 ? `circle(${Math.max(0, irisR).toFixed(1)}px at 50% 50%)` : undefined, opacity: 1 - fade}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 55% 35%, #FBF7EF 0%, ${COLORS.cream} 60%, #EBE2D1 100%)`}} />
      <div style={{position: 'absolute', left: project(f, cam, 0, 0)[0] - 340, top: project(f, cam, 0, 0)[1] - 340, width: 680, height: 680, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,168,111,.35), rgba(217,168,111,0) 70%)', opacity: 0.8}} />
      <WorldLayer cam={cam}>
        <Persona x={-PALM0[0]} y={-PALM0[1]} s={HS} pose={mixPose(POSES.offer, OFFER_UP, Math.max(...times.map((a) => Math.sin(Math.PI * D(t, a - 0.1, 1.2)))) * 0.8)} look={CAST.semeador} t={t} shadow={false} />
        <SeedSphere id="palm-seed" x={0} y={-SEEDLIFT} rot={t * 0.8} glow={0.3 + 0.4 * Math.max(...times.map((a) => Math.sin(Math.PI * D(t, a - 0.1, 0.7))))} />
        {[0, 1, 2].map(thread)}
        {line > 0 && <path d={`M ${bpts.slice(0, shown).map((q) => q.map((v) => v.toFixed(1)).join(' ')).join(' L ')}`} fill="none" stroke={COLORS.graphite} strokeWidth={5} strokeLinecap="round" />}
        {line > 0.5 && bpts.slice(8).map((q, k) => k % 4 === 0 && k / bpts.length < line - 0.25 && <path key={k} d="M 0 0 C 8 -12 26 -14 34 -4 C 26 6 8 6 0 0 Z" fill={k % 8 ? COLORS.sage : COLORS.sageDark} transform={`translate(${q[0]} ${q[1]}) rotate(${-60 + (k % 3) * 50}) scale(${1.6 * EBACK(clamp((line - k / bpts.length - 0.25) * 4))})`} />)}
        <Icon t={t} at={times[0]} kind="oracao" p={IP[0]} label="oração" reorg={reorg} z={cam.z} />
        <Icon t={t} at={times[1]} kind="amor" p={IP[1]} label="amor" reorg={reorg} z={cam.z} />
        <Icon t={t} at={times[2]} kind="porta" p={IP[2]} label="recomeçar" reorg={reorg} z={cam.z} />
      </WorldLayer>
      {iris < 1 && <svg width={f.W} height={f.H} style={{position: 'absolute', inset: 0}}><ChromaRing cx={f.cx} cy={f.cy} r={Math.max(0, irisR)} o={Math.sin(Math.PI * iris)} w={16} /></svg>}
    </div>
  );
};
const SEEDLIFT = 0;
