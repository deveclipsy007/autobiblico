// ScriptureToSeedMorph — "grão" se contrai: as letras correm para o centro e se fundem (filtro gooey) num ponto
// de tinta; "de mostarda" se desfaz em poeira de tinta. O ponto é o mesmo objeto que vira semente.
import React from 'react';
import {COLORS, FONTS} from '../../../brand/tokens';
import {D, EIN, EIO, EO, clamp, lerp, mixHex, rnd} from '../lib/math';
import {charXs} from '../lib/measure';
import {BODY_FONT, PAGE, Word} from './scripture';

export const DOT_R = 17;
export const grainCenter = (w: Word): [number, number] => [w.x + w.w / 2, w.y - PAGE.size * 0.3];

export const ScriptureToSeedMorph: React.FC<{t: number; at: number; grain: Word; rest: Word[]; handoff: number}> = ({t, at, grain, rest, handoff}) => {
  if (t < at - 0.05) return null;
  const [cx, cy] = grainCenter(grain);
  const xs = charXs(grain.text, BODY_FONT);
  const chars = [...grain.text];
  const order = [0, 2, 3, 1];
  const dotP = EO(D(t, at + 0.22, 0.55));
  const lift = EO(D(t, handoff - 0.15, 0.6));
  return (
    <>
      {/* sombra do ponto: quando ele se descola do papel, a sombra se afasta e abre */}
      {lift > 0 && <div style={{position: 'absolute', left: cx - DOT_R * 1.6 + lift * 34, top: cy - DOT_R * 0.9 + lift * 46, width: DOT_R * 3.2 * (1 + lift), height: DOT_R * 1.8 * (1 + lift), borderRadius: '50%', background: 'rgba(36,39,44,.55)', filter: `blur(${4 + lift * 16}px)`, opacity: 0.6 * (1 - EIN(D(t, handoff + 0.3, 0.6)))}} />}
      <div style={{position: 'absolute', left: 0, top: 0, filter: t < handoff + 0.1 ? 'url(#vpc-goo)' : undefined}}>
        {t < handoff && chars.map((ch, i) => {
          const u = EIO(D(t, at + order[i] * 0.05, 0.6));
          const x0 = grain.x + xs[i], lx = x0 + (i < xs.length - 1 ? xs[i + 1] - xs[i] : PAGE.size * 0.5) / 2;
          const dx = (cx - lx) * u;
          return <span key={i} style={{position: 'absolute', left: x0, top: grain.y - PAGE.size * 0.86, fontFamily: FONTS.serif, fontSize: PAGE.size, lineHeight: 1, color: mixHex(COLORS.ink, '#5A3A26', u), transform: `translate(${dx.toFixed(2)}px, ${(u * -4).toFixed(2)}px) scale(${lerp(1, 0.3, u).toFixed(3)})`, opacity: 1 - clamp((u - 0.75) * 4)}}>{ch}</span>;
        })}
        {t < handoff && dotP > 0 && <div style={{position: 'absolute', left: cx - DOT_R * dotP, top: cy - DOT_R * dotP, width: DOT_R * 2 * dotP, height: DOT_R * 2 * dotP, borderRadius: '50%', background: mixHex(COLORS.ink, '#5A3A26', dotP)}} />}
      </div>
      {/* "de mostarda," vira poeira de tinta */}
      {rest.map((w, wi) => [...w.text].map((ch, i) => {
        const xs2 = charXs(w.text, BODY_FONT);
        const k = wi * 4 + i, u = EIN(D(t, at + 0.12 + k * 0.022, 0.55));
        if (u >= 1) return null;
        return <span key={`${wi}-${i}`} style={{position: 'absolute', left: w.x + xs2[i], top: w.y - PAGE.size * 0.86, fontFamily: FONTS.serif, fontSize: PAGE.size, lineHeight: 1, color: COLORS.ink, opacity: (1 - u) * 0.5, transform: `translate(${(rnd(k, 2) - 0.3) * 40 * u}px, ${u * (30 + rnd(k, 3) * 40)}px) rotate(${(rnd(k, 5) - 0.5) * 40 * u}deg)`, filter: u > 0.02 ? `blur(${u * 6}px)` : undefined}}>{ch}</span>;
      }))}
    </>
  );
};

export const GooDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="vpc-goo" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
        <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="g" />
      </filter>
    </defs>
  </svg>
);
