// KingdomExpansionMap — a planta vira mapa: a noite azul nasce do pé da árvore, os galhos viram linhas de luz,
// pontos dourados surgem entre os ramos, constelações se ligam e a rede se expande a partir de UM ponto
// muito além do quadro. Poético e legível; nada de dashboard.
import React, {useMemo} from 'react';
import {COLORS} from '../../../brand/tokens';
import {Pt, clamp, dist, rnd} from '../lib/math';
import {Fmt} from '../lib/format';
import {Cam, project} from './CinematicCamera';
import {NIGHT_C, TREE} from './BranchExpansion';
import {genNetwork} from '../lib/plant';

const NET = genNetwork();
const STARS = Array.from({length: 260}, (_, i) => [(rnd(i, 31) - 0.5) * 9000, -700 + (rnd(i, 32) - 0.5) * 9000, rnd(i, 33)] as [number, number, number]);

/** Fundo noturno no mundo (círculo que cresce do pé da árvore) + estrelas. */
export const NightField: React.FC<{R: number; t: number}> = ({R, t}) => {
  if (R <= 0) return null;
  return (
    <g>
      <circle cx={NIGHT_C[0]} cy={NIGHT_C[1]} r={R} fill={COLORS.deep} />
      <circle cx={NIGHT_C[0]} cy={NIGHT_C[1]} r={R} fill="none" stroke={COLORS.goldLight} strokeOpacity={0.25 * clamp(1 - R / 30000)} strokeWidth={R * 0.012} />
      {STARS.map(([x, y, k], i) => dist([x, y], NIGHT_C) < R && <circle key={i} cx={x} cy={y} r={2 + k * 4} fill={COLORS.cream} opacity={(0.15 + 0.35 * k) * (0.7 + 0.3 * Math.sin(t * (1 + k) + i))} />)}
    </g>
  );
};

/** Pontos entre os ramos e constelações (tela: tamanho constante, sempre nítido). */
export const KingdomExpansionMap: React.FC<{t: number; f: Fmt; cam: Cam; dots: number; links: number; waveR: number; o: number; originPulse: number}> = ({t, f, cam, dots, links, waveR, o, originPulse}) => {
  const nodes = useMemo(() => {
    const ns: Pt[] = TREE.segs.filter((s) => s.depth >= 2).map((s) => s.p1);
    return ns;
  }, []);
  const near = useMemo(() => nodes.map((p, i) => {
    const ds = nodes.map((q, j) => [j, dist(p, q)] as [number, number]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]);
    return ds.slice(0, 2).map(([j]) => j);
  }), [nodes]);
  if (o <= 0.01) return null;
  const P = (p: Pt) => project(f, cam, p[0], p[1]);
  // constelações entre os ramos
  let dl = '';
  nodes.forEach((p, i) => near[i].forEach((j) => {
    if (j < i) return;
    const u = clamp(links * 1.6 - (i / nodes.length) * 0.6);
    if (u <= 0) return;
    const a = P(p), b = P(nodes[j]);
    dl += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${(a[0] + (b[0] - a[0]) * u).toFixed(1)} ${(a[1] + (b[1] - a[1]) * u).toFixed(1)}`;
  }));
  // rede além da árvore: frente de onda a partir da origem
  let de = '';
  const circles: React.ReactNode[] = [];
  NET.nodes.forEach((n, i) => {
    if (i === 0) return;
    const dN = dist(n.p, [0, 0]), par = NET.nodes[n.parent], dP = dist(par.p, [0, 0]);
    const u = clamp((waveR - dP) / Math.max(1, dN - dP));
    if (u <= 0) return;
    const a = P(par.p), b = P(n.p);
    if (Math.max(a[0], b[0]) < -50 || Math.min(a[0], b[0]) > f.W + 50 || Math.max(a[1], b[1]) < -50 || Math.min(a[1], b[1]) > f.H + 50) return;
    de += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${(a[0] + (b[0] - a[0]) * u).toFixed(1)} ${(a[1] + (b[1] - a[1]) * u).toFixed(1)}`;
    if (u >= 1) {
      const fresh = clamp(1 - (waveR - dN) / (dN * 0.5 + 400));
      circles.push(<circle key={i} cx={b[0]} cy={b[1]} r={2.6 + fresh * 4} fill={fresh > 0.4 ? '#FFE3B3' : COLORS.goldLight} opacity={0.85} />);
      if (fresh > 0.05) circles.push(<circle key={`g${i}`} cx={b[0]} cy={b[1]} r={10 + fresh * 14} fill={COLORS.goldLight} opacity={0.16 * fresh} />);
    }
  });
  const O = P([0, 0]);
  return (
    <svg width={f.W} height={f.H} style={{position: 'absolute', inset: 0, opacity: o}}>
      <path d={de} stroke={COLORS.goldLight} strokeOpacity={0.42} strokeWidth={1.4} fill="none" />
      {circles}
      <path d={dl} stroke={COLORS.cream} strokeOpacity={0.35} strokeWidth={1.2} fill="none" />
      {nodes.map((p, i) => {
        const u = clamp(dots * 1.5 - (i / nodes.length) * 0.5 - rnd(i, 3) * 0.3);
        if (u <= 0) return null;
        const [x, y] = P(p);
        return <g key={i}><circle cx={x} cy={y} r={12 * u} fill={COLORS.goldLight} opacity={0.18} /><circle cx={x} cy={y} r={3.6 * u + 0.5} fill="#FFDCA6" /></g>;
      })}
      {originPulse > 0 && <g>
        {[0, 1, 2].map((k) => { const ph = ((t * 0.7 + k / 3) % 1); return <circle key={k} cx={O[0]} cy={O[1]} r={14 + ph * 150} fill="none" stroke={COLORS.goldLight} strokeWidth={2} opacity={originPulse * (1 - ph) * 0.8} />; })}
        <circle cx={O[0]} cy={O[1]} r={46} fill={COLORS.goldLight} opacity={originPulse * 0.22} />
        <circle cx={O[0]} cy={O[1]} r={12} fill="#FFE3B3" opacity={originPulse} />
      </g>}
    </svg>
  );
};
