// VER PARA CRER · linguagem de fogo (vem da logo): palavras que queimam para dentro do papel com borda
// incandescente, brasas que sobem, e o rastro cromático laranja/azul dos traços da marca.
// Regra de uso: só em ênfases. Clean e sofisticado — o fogo é um acento, nunca o fundo.
import React from 'react';
import {staticFile} from 'remotion';
import {COLORS} from './tokens';
import {measure} from '../films/vpc-001/lib/measure';

export const EMBER = {core: '#E8742A', hot: '#FFB36B', white: '#FFF1DC', blue: '#79AEE0', char: '#1E1917'} as const;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const D = (t: number, a: number, d: number) => clamp((t - a) / d);
const ease = (u: number) => 1 - (1 - u) ** 3;
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

const thr = (u: number, K: number, inverse = false) => (['R', 'G', 'B'] as const).map((c) => React.createElement(`feFunc${c}`, {key: c, type: 'linear', slope: inverse ? K : -K, intercept: inverse ? -K * u : K * u}));

/** Texto que queima para dentro (e opcionalmente para fora). x = centro, y = linha de base. */
export const BurnText: React.FC<{t: number; id: string; text: string; x: number; y: number; size: number; family: string; weight?: number; italic?: boolean; tracking?: number; at: number; dur?: number; out?: number; outDur?: number; mode?: 'char' | 'lit' | 'gold'; stretch?: number; opacity?: number}> = ({t, id, text, x, y, size, family, weight = 800, italic = false, tracking = 0, at, dur = 0.9, out = 1e9, outDur = 0.9, mode = 'char', stretch = 1, opacity = 1}) => {
  if (t < at - 0.05 || t > out + outDur + 0.05) return null;
  const font = `${italic ? 'italic ' : ''}${weight} ${size}px ${family}`;
  const W = measure(text, font, tracking), H = size * 1.35, pad = size * 0.6;
  const uIn = ease(D(t, at, dur)) * 1.12, uOut = D(t, out, outDur) * 1.12;
  const burningOut = t >= out;
  const K = 22;
  const box = {x: -pad, y: -size * 1.05, w: W + pad * 2, h: H + pad};
  const front = burningOut ? uOut : uIn;
  const active = burningOut ? uOut < 1.1 : uIn < 1.1;
  const texK = size / 260;
  return (
    <svg style={{position: 'absolute', left: x - W / 2 - pad, top: y - size * 1.05 - pad * 0.5, overflow: 'visible', opacity, transformOrigin: `50% ${size * 1.05 + pad * 0.5}px`, transform: stretch !== 1 ? `scaleY(${stretch})` : undefined}} width={W + pad * 2} height={H + pad * 2}>
      <defs>
        <pattern id={`${id}-tex`} patternUnits="userSpaceOnUse" width={2048 * texK} height={512 * texK}><image href={staticFile('img/ember-texture.jpg')} width={2048 * texK} height={512 * texK} /></pattern>
        <linearGradient id={`${id}-lit`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF2D6" /><stop offset="0.45" stopColor="#F1C987" /><stop offset="1" stopColor="#D98E45" /></linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1={-size * 0.8} x2="0" y2={size * 0.1} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#E8C78C" /><stop offset="0.38" stopColor="#C99556" /><stop offset="0.7" stopColor="#A46C33" /><stop offset="1" stopColor="#7A4A22" /></linearGradient>
        <filter id={`${id}-m`} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB"><feComponentTransfer>{thr(burningOut ? uOut : uIn, K, burningOut)}</feComponentTransfer></filter>
        <filter id={`${id}-e`} x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
          <feComponentTransfer result="a">{thr(front, K, burningOut)}</feComponentTransfer>
          <feComponentTransfer in="SourceGraphic" result="b">{thr(front + (burningOut ? 0.07 : -0.07), K, burningOut)}</feComponentTransfer>
          <feComposite in="a" in2="b" operator="arithmetic" k2={1} k3={-1} />
        </filter>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={box.x} y={box.y} width={box.w} height={box.h}><image href={staticFile('img/dissolve.png')} x={box.x} y={box.y} width={box.w} height={box.h} preserveAspectRatio="none" filter={`url(#${id}-m)`} /></mask>
        <mask id={`${id}-edge`} maskUnits="userSpaceOnUse" x={box.x} y={box.y} width={box.w} height={box.h}><image href={staticFile('img/dissolve.png')} x={box.x} y={box.y} width={box.w} height={box.h} preserveAspectRatio="none" filter={`url(#${id}-e)`} /></mask>
        <filter id={`${id}-blur`} x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation={size * 0.06} /></filter>
        <filter id={`${id}-soft`} x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation={size * 0.02} /></filter>
      </defs>
      <g transform={`translate(${pad} ${size * 1.05 + pad * 0.5})`}>
        {/* calor por baixo das letras */}
        <text x={0} y={0} fontFamily={family} fontWeight={weight} fontStyle={italic ? 'italic' : 'normal'} fontSize={size} letterSpacing={tracking} fill={EMBER.core} filter={`url(#${id}-blur)`} opacity={(mode === 'lit' ? 0.5 : mode === 'gold' ? (active ? 0.4 : 0.08) : 0.18 + (active ? 0.35 : 0)) * (burningOut ? 1 - uOut * 0.8 : 1)} mask={`url(#${id}-mask)`}>{text}</text>
        <text x={0} y={0} fontFamily={family} fontWeight={weight} fontStyle={italic ? 'italic' : 'normal'} fontSize={size} letterSpacing={tracking} fill={mode === 'lit' ? `url(#${id}-lit)` : mode === 'gold' ? `url(#${id}-gold)` : `url(#${id}-tex)`} mask={`url(#${id}-mask)`}>{text}</text>
        {active && <>
          <text x={0} y={0} fontFamily={family} fontWeight={weight} fontStyle={italic ? 'italic' : 'normal'} fontSize={size} letterSpacing={tracking} fill={EMBER.hot} mask={`url(#${id}-edge)`} filter={`url(#${id}-soft)`}>{text}</text>
          <text x={0} y={0} fontFamily={family} fontWeight={weight} fontStyle={italic ? 'italic' : 'normal'} fontSize={size} letterSpacing={tracking} fill={EMBER.white} mask={`url(#${id}-edge)`} opacity={0.7}>{text}</text>
        </>}
        {/* brasas soltas pela frente do fogo */}
        {Array.from({length: 18}, (_, i) => {
          const t0 = (burningOut ? out : at) + rnd(i, 3) * (burningOut ? outDur : dur), age = t - t0, life = 0.7 + rnd(i, 4) * 0.8;
          if (age < 0 || age > life) return null;
          const k = age / life, x0 = rnd(i, 5) * W * (burningOut ? 1 : Math.min(1, (t0 - at) / dur * 1.1)), y0 = -size * (0.15 + rnd(i, 6) * 0.6);
          return <circle key={i} cx={x0 + age * (20 + rnd(i, 7) * 50)} cy={y0 - age * (40 + rnd(i, 8) * 70)} r={(1 + rnd(i, 9) * 2.2) * (size / 120) * Math.sin(Math.PI * k)} fill={i % 3 ? EMBER.core : EMBER.hot} opacity={0.9 * Math.sin(Math.PI * k)} />;
        })}
      </g>
    </svg>
  );
};

/** Brasas subindo de um ponto (tela ou mundo, depende do pai). */
export const Embers: React.FC<{t: number; x: number; y: number; a: number; b: number; n?: number; spread?: number; rise?: number; size?: number; seed?: number}> = ({t, x, y, a, b, n = 24, spread = 40, rise = 120, size = 3, seed = 1}) => {
  if (t < a || t > b + 1.6) return null;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const t0 = a + rnd(i, seed) * (b - a), age = t - t0, life = 0.8 + rnd(i, seed + 1) * 1.0;
        if (age < 0 || age > life) return null;
        const k = age / life, s = Math.sin(Math.PI * k);
        return <circle key={i} cx={x + (rnd(i, seed + 2) - 0.5) * spread + Math.sin(age * 4 + i) * spread * 0.15 + age * spread * 0.3} cy={y - age * rise * (0.6 + rnd(i, seed + 3) * 0.8)} r={size * (0.5 + rnd(i, seed + 4)) * s} fill={i % 3 ? EMBER.core : EMBER.hot} opacity={0.85 * s} />;
      })}
    </g>
  );
};

/** Anel cromático (borda de íris / onda de luz): laranja por fora, azul deslocado, núcleo claro. */
export const ChromaRing: React.FC<{cx: number; cy: number; r: number; o: number; w?: number}> = ({cx, cy, r, o, w = 14}) => {
  if (o <= 0.01 || r <= 0) return null;
  return (
    <g style={{mixBlendMode: 'screen'}} opacity={o}>
      <circle cx={cx + w * 0.35} cy={cy - w * 0.2} r={r + w * 0.6} fill="none" stroke={EMBER.blue} strokeWidth={w * 0.7} opacity={0.45} style={{filter: `blur(${w * 0.6}px)`}} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={EMBER.core} strokeWidth={w} opacity={0.75} style={{filter: `blur(${w * 0.45}px)`}} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={EMBER.white} strokeWidth={w * 0.18} opacity={0.9} />
    </g>
  );
};

/** Rastro cromático de um objeto em movimento (pontos de tela, do mais antigo ao atual). */
export const ChromaTrail: React.FC<{pts: [number, number][]; w: number; o?: number; light?: boolean}> = ({pts, w, o = 1, light = false}) => {
  if (pts.length < 2) return null;
  const d = `M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')}`;
  const shift = (dx: number, dy: number) => `M ${pts.map((p) => `${(p[0] + dx).toFixed(1)} ${(p[1] + dy).toFixed(1)}`).join(' L ')}`;
  return (
    <g style={{mixBlendMode: light ? 'normal' : 'screen'}} opacity={o}>
      <path d={shift(w * 0.5, -w * 0.3)} stroke={EMBER.blue} strokeWidth={w * 1.2} strokeLinecap="round" fill="none" opacity={0.35} style={{filter: `blur(${w * 0.5}px)`}} />
      <path d={d} stroke={EMBER.core} strokeWidth={w * 1.4} strokeLinecap="round" fill="none" opacity={0.55} style={{filter: `blur(${w * 0.45}px)`}} />
      <path d={d} stroke={EMBER.hot} strokeWidth={w * 0.4} strokeLinecap="round" fill="none" opacity={0.9} />
    </g>
  );
};
void COLORS;
