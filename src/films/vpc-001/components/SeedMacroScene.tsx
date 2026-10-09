// SeedMacroScene — a semente como um pequeno mundo: esfera com retículo real girando (órbita de câmera),
// bokeh em profundidade orbitando junto, régua de escala que se desenha e mantém a proporção quando a câmera recua.
import React from 'react';
import {COLORS, FONTS} from '../../../brand/tokens';
import {D, EO, EIN, clamp, rnd} from '../lib/math';

export const SEED_R = 4.5;
const CELLS = Array.from({length: 150}, (_, i) => {
  const y = 1 - (i / 149) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.399963;
  return [Math.cos(th) * rr, y, Math.sin(th) * rr] as [number, number, number];
});

/** Esfera da semente em unidades do mundo. rot = giro (rad); shade 0 = ponto de tinta chapado, 1 = semente; crack 0..1; glow 0..1. */
export const SeedSphere: React.FC<{x?: number; y?: number; r?: number; rot?: number; shade?: number; crack?: number; glow?: number; id: string; stretch?: number}> = ({x = 0, y = 0, r = SEED_R, rot = 0, shade = 1, crack = 0, glow = 0, id, stretch = 1}) => {
  const tilt = 0.35;
  return (
    <g transform={`translate(${x} ${y}) scale(${1 / Math.sqrt(stretch)} ${stretch})`}>
      <defs>
        <radialGradient id={`${id}-b`} cx="0.36" cy="0.32" r="0.78">
          <stop offset="0" stopColor="#D8A877" />
          <stop offset="0.45" stopColor="#9C6A40" />
          <stop offset="1" stopColor="#3E2617" />
        </radialGradient>
        <radialGradient id={`${id}-g`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={COLORS.goldLight} stopOpacity="0.9" />
          <stop offset="0.35" stopColor={COLORS.gold} stopOpacity="0.35" />
          <stop offset="1" stopColor={COLORS.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow > 0 && <circle r={r * (2.2 + glow * 4)} fill={`url(#${id}-g)`} opacity={glow} />}
      <circle r={r} fill={COLORS.ink} opacity={1 - shade} />
      <g opacity={shade}>
        <circle r={r} fill={`url(#${id}-b)`} />
        {CELLS.map(([cx, cy, cz], i) => {
          const X = cx * Math.cos(rot) + cz * Math.sin(rot), Z0 = -cx * Math.sin(rot) + cz * Math.cos(rot);
          const Y = cy * Math.cos(tilt) - Z0 * Math.sin(tilt), Z = cy * Math.sin(tilt) + Z0 * Math.cos(tilt);
          if (Z < 0.05) return null;
          const s = r * 0.12, fx = Math.sqrt(Math.max(0.02, 1 - X * X)), fy = Math.sqrt(Math.max(0.02, 1 - Y * Y));
          return <ellipse key={i} cx={X * r * 0.97} cy={Y * r * 0.97} rx={s * fx} ry={s * fy} transform={`rotate(${(Math.atan2(Y, X) * 180) / Math.PI} ${X * r * 0.97} ${Y * r * 0.97})`} fill="none" stroke="#2E1B10" strokeOpacity={0.28 * Z} strokeWidth={r * 0.018} />;
        })}
        <ellipse cx={-r * 0.34} cy={-r * 0.38} rx={r * 0.32} ry={r * 0.2} transform={`rotate(-35 ${-r * 0.34} ${-r * 0.38})`} fill="#FFF3DF" opacity={0.42} />
        <path d={`M ${r * 0.62} ${-r * 0.7} A ${r} ${r} 0 0 1 ${r * 0.55} ${r * 0.83}`} fill="none" stroke={COLORS.cream} strokeWidth={r * 0.05} strokeOpacity={0.35} strokeLinecap="round" />
      </g>
      {crack > 0 && (
        <g>
          <path d={`M ${-r * 0.15} ${-r * 0.98} L ${r * 0.05} ${-r * 0.5} L ${-r * 0.12} ${-r * 0.1} L ${r * 0.1} ${r * 0.35} L ${-r * 0.04} ${r * 0.98}`} fill="none" stroke="#FFB36B" strokeWidth={r * 0.09} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(crack * 1.3)} style={{filter: `drop-shadow(0 0 ${r * 0.3}px #E8742A)`}} />
        </g>
      )}
    </g>
  );
};

/** Bokeh em profundidade (tela): partículas em 3D girando com a câmera em órbita. */
export const OrbitBokeh: React.FC<{t: number; rot: number; cx: number; cy: number; o: number; scale?: number}> = ({rot, cx, cy, o, scale = 1}) => {
  if (o <= 0.01) return null;
  return (
    <>
      {Array.from({length: 22}, (_, i) => {
        const a = rnd(i, 3) * Math.PI * 2 + rot, R = (260 + rnd(i, 4) * 520) * scale, h = (rnd(i, 5) - 0.5) * 900 * scale;
        const x = Math.cos(a) * R, z = Math.sin(a) * R, k = 900 / (900 + z);
        if (k <= 0) return null;
        const size = (8 + rnd(i, 6) * 26) * k, blur = Math.abs(z) / 60 + 2;
        return <div key={i} style={{position: 'absolute', left: cx + x * k - size, top: cy + h * k - size, width: size * 2, height: size * 2, borderRadius: '50%', background: i % 3 ? 'rgba(178,123,73,.22)' : 'rgba(129,155,135,.2)', filter: `blur(${blur.toFixed(1)}px)`, opacity: o * clamp(k * 0.9)}} />;
      })}
    </>
  );
};

/** Régua de escala ao lado da semente (desenhada no mundo; rótulo HTML nítido acompanhando). */
export const ScaleMarker: React.FC<{t: number; at: number; out: number; sx: number; sy: number; rPx: number}> = ({t, at, out, sx, sy, rPx}) => {
  const p = EO(D(t, at, 0.7)), q = EIN(D(t, out, 0.35));
  if (p <= 0 || q >= 1) return null;
  const x = sx + rPx + Math.max(26, rPx * 0.35), h = rPx * 2;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - q}}>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
        <path d={`M ${x - 9} ${sy - h / 2} H ${x + 9} M ${x} ${sy - h / 2} V ${sy + h / 2} M ${x - 9} ${sy + h / 2} H ${x + 9}`} stroke={COLORS.graphite} strokeWidth={2.2} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" />
        {[0.25, 0.5, 0.75].map((u, i) => <path key={i} d={`M ${x} ${sy - h / 2 + h * u} h ${i === 1 ? 14 : 8}`} stroke={COLORS.graphite} strokeWidth={1.6} opacity={clamp(p * 3 - 1.5 - i * 0.2)} />)}
      </svg>
      <div style={{position: 'absolute', left: x + 26, top: sy - 22, fontFamily: FONTS.body, fontWeight: 600, fontSize: 36, letterSpacing: '0.04em', color: COLORS.graphite, opacity: clamp(p * 2 - 0.6), transform: `translateX(${(1 - p) * -12}px)`, whiteSpace: 'nowrap'}}>
        ≈ 1 mm
      </div>
    </div>
  );
};
