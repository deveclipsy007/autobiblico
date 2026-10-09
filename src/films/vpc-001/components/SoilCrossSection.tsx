// SoilCrossSection — corte da terra em camadas orgânicas (grafite + dourado), pontilhado, pedras e superfície viva.
import React from 'react';
import {staticFile} from 'remotion';
import {COLORS} from '../../../brand/tokens';
import {mixHex, rnd} from '../lib/math';

const X0 = -30000, X1 = 30000;
const wave = (x: number, k: number, amp: number) => Math.sin(x * 0.0021 + k) * amp + Math.sin(x * 0.0057 + k * 2.3) * amp * 0.45 + Math.sin(x * 0.013 + k * 5.1) * amp * 0.18;
const band = (y0: number, k: number, amp: number) => {
  let d = `M ${X0} 40000 L ${X0} ${y0}`;
  for (let x = -6000; x <= 6000; x += 60) d += ` L ${x} ${(y0 + wave(x, k, amp)).toFixed(1)}`;
  return d + ` L ${X1} ${y0} L ${X1} 40000 Z`;
};
const LAYERS = [
  {y: 0, c: mixHex(COLORS.graphite, COLORS.gold, 0.32), k: 0, amp: 0},
  {y: 150, c: mixHex(COLORS.graphite, COLORS.gold, 0.42), k: 1.3, amp: 26},
  {y: 430, c: mixHex(COLORS.graphite, COLORS.gold, 0.5), k: 2.1, amp: 40},
  {y: 900, c: mixHex(COLORS.graphite, COLORS.gold, 0.38), k: 3.7, amp: 60},
  {y: 1500, c: mixHex(COLORS.graphite, COLORS.deep, 0.35), k: 4.4, amp: 80},
];
const PEBBLES = Array.from({length: 120}, (_, i) => ({x: (rnd(i, 1) - 0.5) * 5200, y: 60 + rnd(i, 2) ** 1.3 * 1900, rx: 10 + rnd(i, 3) * 34, ry: 6 + rnd(i, 4) * 18, a: rnd(i, 5) * 180, c: rnd(i, 6) < 0.5 ? mixHex(COLORS.graphite, COLORS.gold, 0.62) : mixHex(COLORS.graphite, COLORS.cream, 0.4)}));
const TUFTS = Array.from({length: 160}, (_, i) => ({x: (rnd(i, 7) - 0.5) * 7000, h: 10 + rnd(i, 8) * 26, a: (rnd(i, 9) - 0.5) * 40}));

export const SoilCrossSection: React.FC<{t: number; planted: number}> = ({planted}) => (
  <g>
    <defs>
      <pattern id="soil-speck" width={512} height={512} patternUnits="userSpaceOnUse">
        <image href={staticFile('img/soil-speck.png')} width={512} height={512} />
      </pattern>
      <linearGradient id="soil-shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.35" />
      </linearGradient>
    </defs>
    {LAYERS.map((l, i) => <path key={i} d={band(l.y, l.k, l.amp)} fill={l.c} />)}
    <rect x={X0} y={0} width={X1 - X0} height={4000} fill="url(#soil-speck)" opacity={0.75} />
    <rect x={X0} y={0} width={X1 - X0} height={2600} fill="url(#soil-shade)" />
    {PEBBLES.map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} transform={`rotate(${p.a} ${p.x} ${p.y})`} fill={p.c} opacity={0.55} />)}
    {/* bolsão úmido onde a semente foi plantada */}
    <ellipse cx={0} cy={112} rx={34} ry={26} fill="#2a221d" opacity={0.55 * planted} />
    <ellipse cx={0} cy={2} rx={46} ry={9 * planted} fill="#2a221d" opacity={0.35 * planted} />
    {/* superfície */}
    <path d={`M ${X0} 0 H ${X1}`} stroke={COLORS.graphite} strokeWidth={3.5} />
    {TUFTS.map((g, i) => <path key={i} d={`M ${g.x} 0 q ${g.a * 0.2} ${-g.h * 0.6} ${g.a * 0.5} ${-g.h} M ${g.x + 5} 0 q ${-g.a * 0.1} ${-g.h * 0.5} ${-g.a * 0.3 - 4} ${-g.h * 0.75}`} stroke={COLORS.sageDark} strokeWidth={2.4} fill="none" strokeLinecap="round" />)}
  </g>
);

/** Pedrinhas em primeiro plano (camada próxima): atravessam a câmera no mergulho. */
export const SoilForeground: React.FC = () => (
  <g>
    {Array.from({length: 26}, (_, i) => {
      const x = (rnd(i, 21) - 0.5) * 1400, y = 40 + rnd(i, 22) * 500, r = 14 + rnd(i, 23) * 30;
      return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill={mixHex(COLORS.graphite, COLORS.gold, 0.25)} opacity={0.9} />;
    })}
  </g>
);
