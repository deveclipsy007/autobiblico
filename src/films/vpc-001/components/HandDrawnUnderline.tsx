// HandDrawnUnderline — marcação dourada feita à mão: dois passes de pincel com leve tremor e pressão variável.
import React from 'react';
import {COLORS} from '../../../brand/tokens';
import {EO, EIN, D, rnd} from '../lib/math';

export const HandDrawnUnderline: React.FC<{t: number; at: number; x0: number; x1: number; y: number; out?: number; dur?: number; color?: string; width?: number}> = ({t, at, x0, x1, y, out = 1e9, dur = 0.75, color = COLORS.gold, width = 9}) => {
  const p = EO(D(t, at, dur)), p2 = EO(D(t, at + 0.16, dur * 0.9)), q = EIN(D(t, out, 0.45));
  if (p <= 0 || q >= 1) return null;
  const n = 9, pts = (k: number, yo: number) => Array.from({length: n}, (_, i) => {
    const u = i / (n - 1);
    return `${(x0 + (x1 - x0) * u + (rnd(i, k) - 0.5) * 6).toFixed(1)} ${(y + yo + Math.sin(u * 3.1 + k) * 3 + (rnd(i, k + 4) - 0.5) * 3).toFixed(1)}`;
  });
  const P1 = pts(1, 0), d1 = `M${P1.join(' L')}`, d2 = `M${pts(3, 9).join(' L')}`;
  const fi = p * (n - 1), i0 = Math.min(n - 2, Math.floor(fi)), fr = fi - i0;
  const [ax, ay] = P1[i0].split(' ').map(Number), [bx, by] = P1[i0 + 1].split(' ').map(Number);
  const tip = [ax + (bx - ax) * fr, ay + (by - ay) * fr], hot = q < 0.01 ? Math.sin(Math.PI * Math.min(1, p * 1.02)) : 0;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
      <path d={d1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={0.92} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p + q} />
      <path d={d2} fill="none" stroke={color} strokeWidth={width * 0.45} strokeLinecap="round" opacity={0.55} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p2 + q} />
      {hot > 0.02 && <g style={{mixBlendMode: 'screen'}}><circle cx={tip[0]} cy={tip[1]} r={width * 3.2} fill="#E8742A" opacity={0.35 * hot} style={{filter: `blur(${width * 1.2}px)`}} /><circle cx={tip[0]} cy={tip[1]} r={width * 0.8} fill="#FFE2B8" opacity={hot} /></g>}
    </svg>
  );
};
