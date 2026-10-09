// ProceduralRootGrowth — raízes desenhadas diante do espectador: uma frente de crescimento percorre a forma,
// cada ramo nasce quando a frente passa pelo seu ponto de origem e termina numa ponta de luz.
import React from 'react';
import {COLORS, FONTS} from '../../../brand/tokens';
import {Pt, clamp, smoothPath, win} from '../lib/math';
import {Root, genRoots} from '../lib/plant';

export const ROOTS = genRoots();
const STEP = (r: Root) => Math.hypot(r.pts[1][0] - r.pts[0][0], r.pts[1][1] - r.pts[0][1]);

const head = (r: Root, F: number): Pt[] => {
  const L = F - r.d0;
  if (L <= 0) return [];
  const st = STEP(r), n = L / st;
  const k = Math.min(r.pts.length - 1, Math.floor(n));
  const out = r.pts.slice(0, k + 1);
  if (k < r.pts.length - 1) {
    const f = n - k, a = r.pts[k], b = r.pts[k + 1];
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  return out;
};

export const rootFront = (t: number, a: {start: number; raiz: number}) => {
  const e = (x: number) => 1 - (1 - clamp(x)) ** 3;
  return 130 * e((t - a.start) / 1.6) + 520 * e((t - a.raiz + 0.15) / 1.1) + (ROOTS.maxD - 650) * e((t - a.raiz - 0.4) / 2.4);
};

export const ProceduralRootGrowth: React.FC<{t: number; F: number; raizAt: number; raizOut: number; night?: number}> = ({t, F, raizAt, raizOut}) => {
  const main = ROOTS.roots[0];
  const textPath = smoothPath(main.pts.map(([x, y]) => [x + 34, y] as Pt));
  const wr = win(t, raizAt - 0.05, raizOut, 0.5, 0.35);
  return (
    <g>
      <defs>
        <path id="raiz-path" d={textPath} />
        <filter id="tip-glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      {ROOTS.roots.map((r) => {
        const pts = head(r, F);
        if (pts.length < 2) return null;
        const growing = F - r.d0 < (r.pts.length - 1) * STEP(r);
        const tip = pts[pts.length - 1];
        return (
          <g key={r.id}>
            <path d={smoothPath(pts)} fill="none" stroke={COLORS.cream2} strokeOpacity={0.9 - r.depth * 0.12} strokeWidth={r.w} strokeLinecap="round" strokeLinejoin="round" />
            {growing && <>
              <circle cx={tip[0]} cy={tip[1]} r={r.w * 1.6 + 3} fill="#E8742A" opacity={0.6} filter="url(#tip-glow)" />
              <circle cx={tip[0]} cy={tip[1]} r={r.w * 0.6 + 1.5} fill="#FFE2B8" />
            </>}
          </g>
        );
      })}
      {wr > 0 && (
        <text fontFamily={FONTS.display} fontWeight={800} fontSize={54} letterSpacing={14} fill={COLORS.cream} opacity={wr}>
          <textPath href="#raiz-path" startOffset={`${(8 + (t - raizAt) * 9).toFixed(2)}%`}>RAIZ</textPath>
        </text>
      )}
    </g>
  );
};
