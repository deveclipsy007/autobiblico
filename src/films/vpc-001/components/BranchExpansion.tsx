// BranchExpansion — a árvore de mostarda desenhada por uma frente de crescimento: galhos que engrossam,
// folhas que abrem com mola, flores douradas nas pontas. Com "night", cada galho vira linha de luz
// quando a frente da noite (o mapa do Reino) passa por ele.
import React from 'react';
import {COLORS} from '../../../brand/tokens';
import {EBACK, EO, clamp, dist, mixHex} from '../lib/math';
import {genTree} from '../lib/plant';

export const TREE = genTree();
const LEAF = 'M 0 0 C 0.28 -0.36 0.78 -0.34 1 0 C 0.78 0.34 0.28 0.36 0 0 Z';

export const NIGHT_C: [number, number] = [0, -700];
export const treeFront = (g: number) => g * (TREE.maxD + 260);

export const BranchExpansion: React.FC<{t: number; g: number; nightR?: number; leafO?: number; flowerBoost?: number}> = ({t, g, nightR = -1, leafO = 1, flowerBoost = 0}) => {
  const F = treeFront(g);
  const thick = 0.14 + 0.86 * clamp(g * 1.1) ** 1.6;
  const nightAt = (p: [number, number]) => (nightR < 0 ? 0 : clamp((nightR - dist(p, NIGHT_C)) / 500));
  return (
    <g>
      {TREE.segs.map((s) => {
        const u = clamp((F - s.d0) / (s.d1 - s.d0));
        if (u <= 0) return null;
        const n = nightAt(s.p0);
        const col = s.depth === 0 && g < 0.5 ? mixHex(COLORS.sage, COLORS.graphite, clamp(g * 2.5)) : mixHex(COLORS.graphite, COLORS.cream, n);
        const w = s.w * thick * (1 - n * 0.55);
        return <path key={s.id} d={`M ${s.p0[0].toFixed(1)} ${s.p0[1].toFixed(1)} Q ${s.c[0].toFixed(1)} ${s.c[1].toFixed(1)} ${s.p1[0].toFixed(1)} ${s.p1[1].toFixed(1)}`} fill="none" stroke={col} strokeOpacity={1 - n * 0.25} strokeWidth={Math.max(1.6, w)} strokeLinecap="round" pathLength={1} strokeDasharray={u < 1 ? 1 : undefined} strokeDashoffset={u < 1 ? 1 - u : undefined} />;
      })}
      {leafO > 0 && TREE.leaves.map((l) => {
        const p = clamp((F - l.at) / 140);
        if (p <= 0) return null;
        const n = nightAt(l.p);
        const s = l.size * EBACK(p) * (1 - n * 0.75);
        if (s <= 0.5) return null;
        const sway = Math.sin(t * 1.3 + l.id * 0.7) * 5;
        return <path key={l.id} d={LEAF} transform={`translate(${l.p[0].toFixed(1)} ${l.p[1].toFixed(1)}) rotate(${(l.ang + sway).toFixed(1)}) scale(${s.toFixed(2)})`} fill={mixHex(l.dark ? COLORS.sageDark : COLORS.sage, COLORS.sage, n)} opacity={leafO * (1 - n * 0.6)} />;
      })}
      {TREE.tips.map((p, i) => {
        const q = clamp((F - TREE.tipAt[i] - 40) / 160);
        if (q <= 0) return null;
        const n = nightAt(p), r = (5.5 + 2 * Math.sin(i)) * EBACK(q) * (1 + n * 0.6 + flowerBoost);
        return (
          <g key={i}>
            {n + flowerBoost > 0.05 && <circle cx={p[0]} cy={p[1]} r={r * 3.4} fill={COLORS.goldLight} opacity={0.22 * clamp(n + flowerBoost)} />}
            <circle cx={p[0]} cy={p[1]} r={r} fill={n > 0.5 ? COLORS.goldLight : '#D9A441'} />
          </g>
        );
      })}
    </g>
  );
};
