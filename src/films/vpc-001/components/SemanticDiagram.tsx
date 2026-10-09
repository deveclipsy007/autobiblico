// SemanticDiagram — uma raiz se estica e vira a linha de um diagrama explicativo (COMEÇO → CRESCIMENTO → TRANSFORMAÇÃO).
// Em 9:16 o eixo desce junto com as raízes; em 16:9 corre na horizontal. Depois a linha volta para dentro da raiz.
import React from 'react';
import {COLORS, FONTS} from '../../../brand/tokens';
import {D, EBACK, EIN, EIO, EO, ESM, Pt, clamp, lerp, polyHead, polyLen} from '../lib/math';
import {Fmt} from '../lib/format';
import {Cam, project} from './CinematicCamera';
import {ROOTS} from './ProceduralRootGrowth';

export const diagramGeo = (f: Fmt) => {
  const sp = ROOTS.special.pts, E = sp[sp.length - 1];
  const axis: Pt[] = f.v ? [[E[0] + 30, E[1] + 50], [E[0] + 40, E[1] + 140], [E[0] + 40, E[1] + 760]] : [[E[0] + 60, E[1] + 10], [E[0] + 160, E[1]], [E[0] + 1250, E[1]]];
  const nodes: Pt[] = f.v ? [140, 400, 660].map((dy) => [E[0] + 40, E[1] + dy] as Pt) : [300, 680, 1060].map((dx) => [E[0] + dx, E[1]] as Pt);
  const z = f.v ? 1.18 : 0.98;
  const cam = f.v ? {x: E[0] + 40 + (540 - 210) / z, y: E[1] + 400} : {x: E[0] + 680, y: E[1] + 90};
  return {trace: [...sp, ...axis], nodes, z, cam, E};
};

const LABELS = [
  {n: '01', w: 'COMEÇO'},
  {n: '02', w: 'CRESCIMENTO'},
  {n: '03', w: 'TRANSFORMAÇÃO'},
];

/** Traço dourado (no mundo). */
export const DiagramTrace: React.FC<{t: number; f: Fmt; a: number; out: number; z: number}> = ({t, f, a, out, z}) => {
  const g = diagramGeo(f);
  const p = ESM(D(t, a, 0.95)), q = EIO(D(t, out, 0.6));
  const u = p * (1 - q);
  if (u <= 0.001) return null;
  const pts = polyHead(g.trace, u);
  const d = `M ${pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L ')}`;
  const tip = pts[pts.length - 1];
  return (
    <g>
      <path d={d} fill="none" stroke={COLORS.goldLight} strokeWidth={10 / z} strokeOpacity={0.25} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={COLORS.goldLight} strokeWidth={3.6 / z} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={tip[0]} cy={tip[1]} r={22 / z} fill="#E8742A" opacity={0.35} style={{filter: `blur(${6}px)`}} />
      <circle cx={tip[0]} cy={tip[1]} r={6 / z} fill="#FFE2B8" />
      {void polyLen}
    </g>
  );
};

/** Nós e rótulos (na tela, tipografia cinética por significado). */
export const DiagramLabels: React.FC<{t: number; f: Fmt; cam: Cam; times: number[]; out: number}> = ({t, f, cam, times, out}) => {
  const g = diagramGeo(f);
  const q = EIN(D(t, out, 0.4));
  if (q >= 1) return null;
  return (
    <>
      {g.nodes.map((n, i) => {
        const [sx, sy] = project(f, cam, n[0], n[1]);
        const at = times[i], pn = EBACK(clamp(D(t, at - 0.1, 0.5)));
        if (t < at - 0.12) return null;
        const size = f.v ? 64 : 56;
        const lx = f.v ? sx + 46 : sx, ly = f.v ? sy - size * 0.62 : sy + 46;
        const chars = [...LABELS[i].w];
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: sx - 22, top: sy - 22, width: 44, height: 44, borderRadius: 22, border: `3px solid ${COLORS.goldLight}`, background: i === 2 ? COLORS.goldLight : COLORS.soil0, transform: `scale(${pn * (1 - q)})`, boxShadow: `0 0 ${24 * pn}px rgba(217,168,111,.7)`}} />
            <div style={{position: 'absolute', left: f.v ? lx : lx - 400, width: f.v ? undefined : 800, top: ly - 34, textAlign: f.v ? 'left' : 'center', fontFamily: FONTS.body, fontWeight: 600, fontSize: 26, letterSpacing: '0.3em', color: COLORS.goldLight, opacity: EO(D(t, at, 0.5)) * (1 - q)}}>{LABELS[i].n}</div>
            <div style={{position: 'absolute', left: f.v ? lx : lx - 500, width: f.v ? undefined : 1000, top: ly, textAlign: f.v ? 'left' : 'center', whiteSpace: 'nowrap', fontFamily: FONTS.display, fontWeight: 800, fontSize: size, letterSpacing: '-0.035em', color: COLORS.cream, lineHeight: 1}}>
              {chars.map((ch, k) => {
                const p = EO(D(t, at + k * 0.03, 0.55)), ex = EIN(D(t, out + k * 0.012, 0.3));
                const st: React.CSSProperties = i === 0
                  ? {transform: `translateY(${(1 - p) * 60 + ex * -40}%)`, opacity: p * (1 - ex)}
                  : i === 1
                    ? {transform: `scaleY(${lerp(0.05, 1, EBACK(clamp(D(t, at + k * 0.035, 0.5))))})`, transformOrigin: '50% 100%', opacity: clamp(p * 2) * (1 - ex)}
                    : {transform: `perspective(400px) rotateX(${(1 - p) * 90}deg)`, color: p > 0.8 ? COLORS.goldLight : COLORS.cream, opacity: p * (1 - ex)};
                return <span key={k} style={{display: 'inline-block', ...st}}>{ch}</span>;
              })}
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};
