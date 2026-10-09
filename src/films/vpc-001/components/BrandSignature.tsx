// BrandSignature — a assinatura como conclusão: a luz da semente fica sozinha no escuro, explode na cruz-estrela
// da logo, a luz abre o quadro creme e o VER queima para dentro do papel (dissolução em brasa da esquerda para a
// direita, borda incandescente), "Para Crer" é escrito pela luz, brasas sobem na direção dos rastros da marca,
// um brilho percorre as letras e o subtítulo assenta. A câmera recua da cruz até o enquadramento final.
import React from 'react';
import {staticFile} from 'remotion';
import {COLORS, FONTS} from '../../../brand/tokens';
import {D, EIN, EIO, EO, clamp, lerp, rnd} from '../lib/math';
import {Fmt, pick, useFmt} from '../lib/format';
import {A, END} from '../story';
import {ChromaRing} from '../../../brand/fire';

export const BRAND_T = {a: A.esperanca + 0.1, ver: A.ver, para: A.para, crer: A.crer, worldOff: A.ver + 0.35, sub: A.crer + 1.35};
const IMG = 1254, CROSS = [835, 490] as const, CENTER = [627, 634] as const, SPLIT = 782;

/** Câmera da logo: da cruz (perto) ao enquadramento final. */
export const brandPose = (t: number, f: Fmt) => {
  const T0 = BRAND_T.ver;
  const base = pick(f, 0.78, 0.64);
  const lc = pick(f, [540, 880], [960, 500]);
  const pull = EO(D(t, T0 - 0.05, 1.9));
  const push = (t - T0) * 0.006;
  const sc = base * lerp(2.5, 1, pull) * (1 + Math.max(0, push));
  const camX = lerp(CROSS[0], CENTER[0], pull), camY = lerp(CROSS[1], CENTER[1], pull);
  const x = lc[0] + (CROSS[0] - camX) * sc + (1 - pull) * (f.cx - lc[0]), y = lc[1] + (CROSS[1] - camY) * sc + (1 - pull) * (f.cy - lc[1]);
  return {base, lc, pull, sc, camX, camY, x, y};
};

export const BrandSignature: React.FC<{t: number}> = ({t}) => {
  const f = useFmt();
  const T0 = BRAND_T.ver;
  const {base, lc, pull, sc, camX, camY} = brandPose(t, f);
  const toScreen = (x: number, y: number): [number, number] => [lc[0] + (x - camX) * sc + (1 - pull) * (f.cx - lc[0]), lc[1] + (y - camY) * sc + (1 - pull) * (f.cy - lc[1])];
  const [stx, sty] = toScreen(CROSS[0], CROSS[1]);
  // fases
  const dark = EIO(D(t, BRAND_T.a, T0 - BRAND_T.a - 0.02));
  const holeR = lerp(Math.hypot(f.W, f.H), 26, dark);
  const flare = EO(D(t, T0 - 0.02, 0.45)), flareOut = EIN(D(t, T0 + 0.5, 1.1));
  const light = EIO(D(t, T0 + 0.02, 0.75));
  const lightR = -20 + light * Math.hypot(f.W, f.H) * 0.7;
  const uA = EIO(D(t, T0 + 0.05, 0.95)) * 1.08;
  const uB = EIO(D(t, BRAND_T.para - 0.05, BRAND_T.crer + 0.5 - BRAND_T.para));
  const K = 26;
  const sweep = D(t, BRAND_T.crer + 0.75, 0.95);
  const sub = EO(D(t, BRAND_T.sub, 1.1));
  const logoXf = `translate(${(lc[0] + (1 - pull) * (f.cx - lc[0])).toFixed(2)} ${(lc[1] + (1 - pull) * (f.cy - lc[1])).toFixed(2)}) scale(${sc.toFixed(4)}) translate(${(-camX).toFixed(2)} ${(-camY).toFixed(2)})`;
  const ring = D(t, T0 - 0.02, 0.9);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {/* 1 · o mundo escurece até sobrar só a luz da semente */}
      {t < T0 + 0.8 && <div style={{position: 'absolute', inset: 0, background: '#111317', WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent ${holeR * 0.55}px, #000 ${holeR}px)`, maskImage: `radial-gradient(circle at 50% 50%, transparent ${holeR * 0.55}px, #000 ${holeR}px)`, opacity: dark}} />}
      {t < T0 + 0.8 && dark > 0 && <div style={{position: 'absolute', left: f.cx - 90, top: f.cy - 90, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, #FFF4DE 0%, rgba(255,200,130,.75) 18%, rgba(217,140,70,.25) 45%, rgba(0,0,0,0) 70%)', opacity: dark * (1 - light), transform: `scale(${1 + 0.15 * Math.sin(t * 9) * dark})`}} />}
      {/* 2 · a luz abre o papel creme a partir da cruz */}
      {light > 0 && (
        <div style={{position: 'absolute', inset: 0, clipPath: light < 1 ? `circle(${Math.max(0, lightR).toFixed(1)}px at ${stx.toFixed(1)}px ${sty.toFixed(1)}px)` : undefined}}>
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 85% 65% at 50% 45%, #FBF8F1 0%, ${COLORS.cream} 60%, #ECE3D2 100%)`}} />
          <svg width={f.W} height={f.H} style={{position: 'absolute', inset: 0}}>
            <defs>
              <filter id="thrA" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB"><feComponentTransfer>{(['R', 'G', 'B'] as const).map((c) => React.createElement(`feFunc${c}`, {key: c, type: 'linear', slope: -K, intercept: K * uA}))}</feComponentTransfer></filter>
              <filter id="edgeA" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
                <feComponentTransfer result="a">{(['R', 'G', 'B'] as const).map((c) => React.createElement(`feFunc${c}`, {key: c, type: 'linear', slope: -K, intercept: K * uA}))}</feComponentTransfer>
                <feComponentTransfer in="SourceGraphic" result="b">{(['R', 'G', 'B'] as const).map((c) => React.createElement(`feFunc${c}`, {key: c, type: 'linear', slope: -K, intercept: K * (uA - 0.07)}))}</feComponentTransfer>
                <feComposite in="a" in2="b" operator="arithmetic" k2={1} k3={-1} />
              </filter>
              <mask id="mA" maskUnits="userSpaceOnUse" x={0} y={0} width={IMG} height={SPLIT}><image href={staticFile('img/dissolve.png')} width={IMG} height={IMG} filter="url(#thrA)" /></mask>
              <mask id="mEdge" maskUnits="userSpaceOnUse" x={0} y={0} width={IMG} height={SPLIT}><image href={staticFile('img/dissolve.png')} width={IMG} height={IMG} filter="url(#edgeA)" /></mask>
              <linearGradient id="gB" x1="0" x2="1" y1="0" y2="0">
                <stop offset={clamp(uB * 1.15 - 0.15)} stopColor="#fff" />
                <stop offset={clamp(uB * 1.15)} stopColor="#000" />
              </linearGradient>
              <mask id="mB" maskUnits="userSpaceOnUse" x={100} y={SPLIT} width={1060} height={IMG - SPLIT}><rect x={100} y={SPLIT} width={1060} height={IMG - SPLIT} fill="url(#gB)" /></mask>
              <filter id="emberBlur"><feGaussianBlur stdDeviation="3" /></filter>
            </defs>
            <g transform={logoXf}>
              <image href={staticFile('img/logo-alpha.png')} width={IMG} height={IMG} mask="url(#mA)" />
              {uA < 1.08 && <rect x={0} y={0} width={IMG} height={SPLIT} fill="#E8742A" mask="url(#mEdge)" filter="url(#emberBlur)" />}
              <image href={staticFile('img/logo-alpha.png')} width={IMG} height={IMG} mask="url(#mB)" />
            </g>
          </svg>
          {/* brilho que percorre as letras */}
          {sweep > 0 && sweep < 1 && (
            <svg width={f.W} height={f.H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
              <defs>
                <filter id="invLum" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -0.6 -0.6 -0.6 0 1.5" /></filter>
                <mask id="mLetters" maskUnits="userSpaceOnUse" x={0} y={0} width={IMG} height={IMG}><image href={staticFile('img/logo.png')} width={IMG} height={IMG} filter="url(#invLum)" /></mask>
                <linearGradient id="gSweep" x1="0" x2="1" y1="0" y2="0.35">
                  <stop offset={clamp(sweep * 1.4 - 0.3)} stopColor="#000" stopOpacity="0" />
                  <stop offset={clamp(sweep * 1.4 - 0.15)} stopColor="#FFE6C2" stopOpacity="0.55" />
                  <stop offset={clamp(sweep * 1.4)} stopColor="#000" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g transform={logoXf}><rect x={0} y={0} width={IMG} height={IMG} fill="url(#gSweep)" mask="url(#mLetters)" /></g>
            </svg>
          )}
          {/* brasas subindo na direção dos rastros da marca */}
          <svg width={f.W} height={f.H} style={{position: 'absolute', inset: 0}}>
            {Array.from({length: 60}, (_, i) => {
              const t0 = T0 + 0.1 + rnd(i, 1) * (END - T0 - 1.2), age = t - t0, life = 1.4 + rnd(i, 2) * 1.2;
              if (age < 0 || age > life) return null;
              const x0 = 180 + rnd(i, 3) * 820, y0 = 340 + rnd(i, 4) * 420;
              const x = x0 + age * (60 + rnd(i, 5) * 140), y = y0 - age * (50 + rnd(i, 6) * 110) + Math.sin(age * 5 + i) * 6;
              const [sx, sy] = toScreen(x, y), k = Math.sin(Math.PI * (age / life));
              return <circle key={i} cx={sx} cy={sy} r={(1.2 + rnd(i, 7) * 2.6) * k * (sc / base)} fill={i % 3 ? '#F08A3C' : '#FFD39A'} opacity={0.85 * k} />;
            })}
          </svg>
          {/* subtítulo */}
          <div style={{position: 'absolute', left: 0, width: f.W, top: pick(f, 1238, 820), textAlign: 'center', fontFamily: FONTS.display, fontWeight: 600, fontSize: pick(f, 38, 34), letterSpacing: `${lerp(0.62, 0.3, sub)}em`, color: COLORS.graphite, opacity: sub, whiteSpace: 'nowrap', transform: `translateY(${(1 - sub) * 14}px)`, paddingLeft: '0.3em'}}>O ETERNO EM NOVAS PERSPECTIVAS</div>
          <svg width={f.W} height={f.H} style={{position: 'absolute', inset: 0}}>
            {[-1, 1].map((s) => <path key={s} d={`M ${f.cx + s * pick(f, 40, 30)} ${pick(f, 1318, 892)} h ${s * pick(f, 150, 120)}`} stroke={COLORS.gold} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - EO(D(t, BRAND_T.sub + 0.3, 1.0))} />)}
            <circle cx={f.cx} cy={pick(f, 1318, 892)} r={5 * EO(D(t, BRAND_T.sub + 0.2, 0.6))} fill={COLORS.gold} />
          </svg>
        </div>
      )}
      {/* 3 · a cruz-estrela: a luz da semente explode e encaixa na cruz da logo */}
      {t > T0 - 0.1 && (
        <svg width={f.W} height={f.H} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
          <defs>
            <radialGradient id="core"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.25" stopColor="#FFE3B3" stopOpacity="0.9" /><stop offset="1" stopColor="#F08A3C" stopOpacity="0" /></radialGradient>
            <linearGradient id="armV" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFF6E6" stopOpacity="0" /><stop offset="0.5" stopColor="#FFF6E6" /><stop offset="1" stopColor="#FFF6E6" stopOpacity="0" /></linearGradient>
            <linearGradient id="armH" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#FFC88A" stopOpacity="0" /><stop offset="0.5" stopColor="#FFF6E6" /><stop offset="1" stopColor="#FFC88A" stopOpacity="0" /></linearGradient>
          </defs>
          <g transform={`translate(${stx.toFixed(1)} ${sty.toFixed(1)})`} opacity={(1 - flareOut * 0.85) * flare}>
            <circle r={60 + 160 * flare * (1 - flareOut)} fill="url(#core)" opacity={0.9} />
            <path d={`M -4 0 L 0 ${-140 * sc / base * flare} L 4 0 L 0 ${300 * sc / base * flare} Z`} fill="url(#armV)" />
            <path d={`M 0 -4 L ${-110 * sc / base * flare} 0 L 0 4 L ${110 * sc / base * flare} 0 Z`} fill="url(#armH)" />
            <rect x={-f.W * 0.6 * flare} y={-1.5} width={f.W * 1.2 * flare} height={3} fill="url(#armH)" opacity={0.7 * (1 - flareOut)} />
          </g>
          {light > 0 && light < 1 && <ChromaRing cx={stx} cy={sty} r={Math.max(0, lightR)} o={Math.sin(Math.PI * light)} w={20} />}
          {ring > 0 && ring < 1 && <ChromaRing cx={stx} cy={sty} r={20 + ring * Math.hypot(f.W, f.H) * 0.5} o={0.9 * (1 - ring)} w={22 * (1 - ring * 0.6)} />}
          {t > T0 + 1.6 && <circle cx={stx} cy={sty} r={34 * (sc / base)} fill="url(#core)" opacity={0.35 + 0.2 * Math.sin((t - T0) * 2.2)} />}
        </svg>
      )}
    </div>
  );
};
