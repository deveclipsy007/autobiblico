// BrandSignature (v3) — sem logo escrita. A luz da semente fica sozinha no escuro e, num "tum",
// vira a esfera dourada da marca: entra com mola, gira desacelerando até assentar, um brilho a percorre,
// poeira dourada orbita e um reflexo discreto no chão. Clean e sofisticado.
import React from 'react';
import {COLORS} from '../../../brand/tokens';
import {D, EIN, EIO, EO, clamp, lerp, rnd, springT} from '../lib/math';
import {Fmt, pick, useFmt} from '../lib/format';
import {BRAND, END} from '../story';
import {BrandSphere} from '../../../brand/BrandSphere';
import {ChromaRing} from '../../../brand/fire';

export const BRAND_T = {a: BRAND.dark, tum: BRAND.tum, worldOff: BRAND.tum + 0.25};

/** Pose da esfera (para o motion blur medir a velocidade). */
export const brandPose = (t: number, f: Fmt) => {
  const T = BRAND_T.tum, d0 = pick(f, 640, 500);
  const s = t < T ? 0 : springT(t, T, {damping: 11, stiffness: 150});
  const push = 1 + Math.max(0, t - T) * 0.012;
  const rot = t < T ? -620 : -620 * (1 - EO(D(t, T, 2.8))) + 6 * (t - T);
  return {sc: Math.max(1e-3, s * push), x: f.cx, y: f.cy - pick(f, 40, 10), d: d0 * s * push, rot, r: (d0 * s) / 2};
};

export const BrandSignature: React.FC<{t: number}> = ({t}) => {
  const f = useFmt();
  const T = BRAND_T.tum;
  const P = brandPose(t, f);
  const dark = EIO(D(t, BRAND_T.a, T - BRAND_T.a - 0.05));
  const holeR = lerp(Math.hypot(f.W, f.H), 30, dark);
  const flash = t > T - 0.02 ? Math.exp(-(t - T) * 4.5) : 0;
  const ring = D(t, T, 1.1);
  const bg = EO(D(t, T - 0.1, 0.6));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 1 · o mundo escurece até sobrar a luz da semente */}
      {t < T + 0.4 && <div style={{position: 'absolute', inset: 0, background: '#0C0B0A', WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent ${holeR * 0.55}px, #000 ${holeR}px)`, maskImage: `radial-gradient(circle at 50% 50%, transparent ${holeR * 0.55}px, #000 ${holeR}px)`, opacity: dark}} />}
      {/* 2 · fundo do fim: preto quente com névoa dourada */}
      {bg > 0 && <div style={{position: 'absolute', inset: 0, opacity: bg, background: `radial-gradient(ellipse 70% 55% at 50% ${f.v ? 46 : 48}%, #2A2016 0%, #14110D 45%, #090807 100%)`}} />}
      {t < T + 0.2 && dark > 0 && <div style={{position: 'absolute', left: f.cx - 90, top: f.cy - 90, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, #FFF4DE 0%, rgba(255,205,140,.8) 16%, rgba(217,150,80,.25) 45%, rgba(0,0,0,0) 70%)', opacity: dark * (1 - EIN(D(t, T - 0.05, 0.2))), transform: `scale(${1 + 0.35 * EIN(D(t, T - 0.35, 0.33))})`}} />}
      {/* 3 · tum: a esfera */}
      {t >= T - 0.02 && (
        <>
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% ${(P.y / f.H) * 100}%, rgba(255,226,170,${(0.55 * flash).toFixed(3)}) 0%, rgba(255,200,120,${(0.18 * flash).toFixed(3)}) 30%, rgba(0,0,0,0) 60%)`}} />
          <svg width={f.W} height={f.H} style={{position: 'absolute', inset: 0}}>
            {ring < 1 && <ChromaRing cx={P.x} cy={P.y} r={P.r * 0.9 + ring * Math.hypot(f.W, f.H) * 0.45} o={0.85 * (1 - ring)} w={16 * (1 - ring * 0.5)} />}
            {Array.from({length: 46}, (_, i) => {
              const a = rnd(i, 1) * Math.PI * 2, sp = 300 + rnd(i, 2) * 700, age = t - T, life = 1.2 + rnd(i, 3) * 1.4;
              if (age < 0 || age > life) return null;
              const dist = (sp / 3) * (1 - Math.exp(-age * 3)), k = age / life;
              return <circle key={i} cx={P.x + Math.cos(a) * (P.r + dist)} cy={P.y + Math.sin(a) * (P.r + dist) * 0.9 - age * 20} r={(0.8 + rnd(i, 4) * 2.2) * (1 - k)} fill={i % 3 ? '#F2CF8E' : '#FFF1D6'} opacity={0.9 * (1 - k)} />;
            })}
          </svg>
          <BrandSphere x={P.x} y={P.y} d={P.d} rot={P.rot} t={t} glow={clamp(0.35 + flash * 0.6)} sheen={D(t, T + 1.25, 1.2) > 0 && D(t, T + 1.25, 1.2) < 1 ? EIO(D(t, T + 1.25, 1.2)) : D(t, T + 3.3, 1.1) > 0 && D(t, T + 3.3, 1.1) < 1 ? EIO(D(t, T + 3.3, 1.1)) : -1} reflection={0.22 * EO(D(t, T + 0.4, 1.2))} dust={EO(D(t, T + 0.6, 1.4))} />
        </>
      )}
      {void COLORS}{void END}
    </div>
  );
};
