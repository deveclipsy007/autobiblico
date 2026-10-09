// BirdLandingAnimation — pássaros ilustrados que chegam em curva, batem asas, planam, pousam com amortecimento
// e ficam vivos (cabeça que vira, asa que acomoda).
import React from 'react';
import {COLORS} from '../../../brand/tokens';
import {D, EIO, Pt, cbez, clamp, springT} from '../lib/math';

export type Flight = {from: Pt; c1: Pt; c2: Pt; to: Pt; t0: number; t1: number; scale?: number};

export const Bird: React.FC<{t: number; fl: Flight; night?: number}> = ({t, fl}) => {
  if (t < fl.t0) return null;
  const u = EIO(D(t, fl.t0, fl.t1 - fl.t0));
  const p = cbez(fl.from, fl.c1, fl.c2, fl.to, u);
  const q = cbez(fl.from, fl.c1, fl.c2, fl.to, Math.min(1, u + 0.02));
  const flying = u < 1;
  const dir = fl.to[0] >= fl.from[0] ? 1 : -1;
  const heading = flying ? (Math.atan2(q[1] - p[1], Math.abs(q[0] - p[0]) + 1e-3) * 180) / Math.PI : 0;
  const landed = t - fl.t1;
  const settle = landed > 0 ? 1 - springT(t, fl.t1, {damping: 9, stiffness: 160}) : 0;
  const glide = clamp((u - 0.78) / 0.18);
  const wing = flying ? Math.sin(t * 44) * 55 * (1 - glide) - 20 * glide : -8 + settle * 30;
  const bob = landed > 0 ? Math.sin(landed * 2.2) * 1.5 : 0;
  const look = landed > 0.6 ? Math.sin(landed * 1.4) * 10 : 0;
  const s = fl.scale ?? 1;
  return (
    <g transform={`translate(${p[0].toFixed(1)} ${(p[1] + settle * 8 + bob).toFixed(1)}) scale(${dir * s} ${s}) rotate(${(heading * 0.6).toFixed(1)})`}>
      <path d="M -40 -6 L -64 -16 L -60 2 Z" fill={COLORS.graphite} />
      <ellipse cx={-6} cy={-8} rx={36} ry={19} fill={COLORS.graphite} />
      <ellipse cx={0} cy={-2} rx={22} ry={11} fill={COLORS.deep} opacity={0.7} />
      <g transform={`rotate(${look} 26 -22)`}>
        <circle cx={26} cy={-22} r={14} fill={COLORS.graphite} />
        <circle cx={31} cy={-25} r={2.6} fill={COLORS.cream} />
        <path d="M 38 -24 L 52 -20 L 38 -16 Z" fill={COLORS.gold} />
      </g>
      <g transform={`rotate(${wing.toFixed(1)} -4 -16)`}>
        <path d="M -4 -16 C -20 -46 -50 -52 -62 -40 C -46 -30 -24 -18 -4 -16 Z" fill={COLORS.ink} />
      </g>
      {landed > 0 && <path d="M -4 10 L -8 22 M 8 10 L 6 22" stroke={COLORS.graphite} strokeWidth={3} strokeLinecap="round" />}
    </g>
  );
};
