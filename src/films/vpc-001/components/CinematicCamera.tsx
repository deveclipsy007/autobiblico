// CinematicCamera — câmera virtual pinhole sobre um mundo 2.5D.
// Cada chave chega no seu t viajando por d segundos (zoom e foco em escala log). Camadas com profundidade
// recebem paralaxe real: o que está perto cresce e corre mais; o que está longe quase não se move.
// Dolly zoom = aumentar f (lente) enquanto a câmera recua: o plano de foco fica, o fundo cresce.
import React from 'react';
import {EIO, clamp, lerp} from '../lib/math';
import {Fmt, useFmt} from '../lib/format';

export type Cam = {x: number; y: number; z: number; r: number; f: number};
export type CamKey = Partial<Cam> & {t: number; d?: number; e?: (u: number) => number};

export const camAt = (t: number, keys: CamKey[]): Cam => {
  const base: Cam = {x: 0, y: 0, z: 1, r: 0, f: 1000};
  let P: Cam = {...base, ...keys[0]};
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i], d = k.d ?? 1.4, u = (k.e ?? EIO)(clamp((t - (k.t - d)) / d));
    if (u <= 0) break;
    const Q: Cam = {...P, ...k} as Cam;
    P = {x: lerp(P.x, Q.x, u), y: lerp(P.y, Q.y, u), z: Math.exp(lerp(Math.log(P.z), Math.log(Q.z), u)), r: lerp(P.r, Q.r, u), f: Math.exp(lerp(Math.log(P.f), Math.log(Q.f), u))};
  }
  return P;
};

/** Deriva viva: respiração lenta de câmera na mão firme (nunca tremida). */
export const drift = (c: Cam, t: number, amt = 1): Cam => ({
  ...c,
  x: c.x + (Math.sin(t * 0.37) * 4 + Math.sin(t * 0.91 + 1) * 1.5) * amt / c.z,
  y: c.y + (Math.cos(t * 0.29) * 3.5 + Math.sin(t * 0.73) * 1.2) * amt / c.z,
  r: c.r + Math.sin(t * 0.21 + 0.4) * 0.35 * amt,
});

/** Escala de uma camada na profundidade dz (0 = plano de foco; <0 perto; >0 longe). 0 = atrás da câmera. */
export const depthScale = (c: Cam, dz = 0) => {
  if (dz === 0) return c.z;
  const dist = c.f / c.z, zz = dist + dz;
  return zz > 1 ? c.f / zz : 0;
};

/** Ponto do mundo → tela [sx, sy, escala]. */
export const project = (f: Fmt, c: Cam, x: number, y: number, dz = 0): [number, number, number] => {
  const s = depthScale(c, dz), a = (c.r * Math.PI) / 180;
  const dx = (x - c.x) * s, dy = (y - c.y) * s;
  return [f.cx + dx * Math.cos(a) - dy * Math.sin(a), f.cy + dx * Math.sin(a) + dy * Math.cos(a), s];
};

/** Transformação SVG de um grupo do mundo para a tela. */
export const xf = (f: Fmt, c: Cam, dz = 0) => {
  const s = depthScale(c, dz);
  return `translate(${f.cx.toFixed(2)} ${f.cy.toFixed(2)}) rotate(${c.r.toFixed(3)}) scale(${s.toFixed(5)}) translate(${(-c.x).toFixed(2)} ${(-c.y).toFixed(2)})`;
};

/** Camada SVG do mundo (vetorial: nítida em qualquer zoom). */
export const WorldLayer: React.FC<{cam: Cam; dz?: number; children: React.ReactNode; style?: React.CSSProperties; opacity?: number; defs?: React.ReactNode}> = ({cam, dz = 0, children, style, opacity = 1, defs}) => {
  const f = useFmt();
  if (depthScale(cam, dz) <= 0 || opacity <= 0.002) return null;
  return (
    <svg width={f.W} height={f.H} viewBox={`0 0 ${f.W} ${f.H}`} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity, ...style}}>
      {defs && <defs>{defs}</defs>}
      <g transform={xf(f, cam, dz)}>{children}</g>
    </svg>
  );
};
