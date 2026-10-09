// KineticCaption — biblioteca de animações tipográficas SEMÂNTICAS. A palavra faz o que significa:
// PEQUENO encolhe até virar a semente · NINGUÉM VÊ some letra a letra · CRESCE estica na vertical ·
// ABRIGO se integra à copa · ALCANCE se espalha pelo espaço · MAIOR cresce · COMEÇO volta a ser semente.
// Cada letra é posicionada pela métrica real da fonte (mesmas fontes do render).
import React from 'react';
import {COLORS, FONTS, goldText} from '../../../brand/tokens';
import {D, EBACK, EIN, EIO, EO, Pt, clamp, lerp, rnd} from '../lib/math';
import {Fmt, pick, useFmt} from '../lib/format';
import {charXs, measure} from '../lib/measure';
import {A, BRAND, S} from '../story';
import {project} from './CinematicCamera';
import {P2H, W_T, worldCam} from './WorldScene';
import {TREE} from './BranchExpansion';
import {BurnText, EMBER} from '../../../brand/fire';

export type Fx = 'rise' | 'shrink' | 'vanish' | 'grow' | 'spread' | 'canopy' | 'seed' | 'swell';
type Style = 'sans' | 'serif' | 'serifUp' | 'micro';
export type Cap = {text: string; at: number; out: number; x: number; y: number; size: number; style?: Style; color?: string; fx?: Fx; act?: number; actEnd?: number; target?: Pt; targets?: Pt[]; opacity?: number; halo?: boolean; burn?: 'char' | 'lit' | 'gold'; burnOut?: boolean; ember?: boolean; gold?: 'deep' | 'light'; rule?: boolean};

const fontOf = (s: Style, size: number) => s === 'serif' ? `italic 500 ${size}px ${FONTS.serif}` : s === 'serifUp' ? `500 ${size}px ${FONTS.serif}` : s === 'micro' ? `600 ${size}px ${FONTS.body}` : `600 ${size}px ${FONTS.serif}`;
const trackOf = (s: Style, size: number) => (s === 'sans' ? 0.05 * size : s === 'micro' ? 0.3 * size : s === 'serifUp' ? 0.05 * size : 0);

export const KineticCaption: React.FC<{t: number; c: Cap}> = ({t, c}) => {
  if (t < c.at - 0.1 || t > c.out + 0.8) return null;
  const st = c.style ?? 'sans', font = fontOf(st, c.size), tr = trackOf(st, c.size);
  const xs = charXs(c.text, font, tr), W = measure(c.text, font, tr);
  const chars = [...c.text];
  const fx = c.fx ?? 'rise';
  const act = c.act ?? c.out, actEnd = c.actEnd ?? c.out;
  const au = EIO(D(t, act, Math.max(0.01, actEnd - act)));
  const q = fx === 'shrink' || fx === 'seed' || fx === 'canopy' ? 0 : EIN(D(t, c.out, 0.35));
  if (c.burn) {
    return <>
      <BurnText t={t} id={`burn-${c.text.replace(/[^A-Za-z]/g, '')}-${Math.round(c.at * 10)}`} text={c.text} x={c.x} y={c.y} size={c.size} family={FONTS.serif} weight={600} tracking={tr} at={c.at} dur={0.75} out={c.burnOut ? act : c.out} outDur={c.burnOut ? Math.max(0.3, actEnd - act) : 0.35} mode={c.burn} stretch={fx === 'grow' ? 1 + 0.2 * au : fx === 'swell' ? 1 + 0.2 * au : 1} opacity={c.burnOut ? 1 : 1 - q} />
      {c.rule && <GoldRule t={t} at={c.at + 0.35} out={c.burnOut ? act : c.out} x={c.x} y={c.y + c.size * 0.3} w={Math.min(W * 0.5, 240)} light={c.burn === 'lit'} />}
    </>;
  }
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: c.opacity ?? 1}}>
      {c.rule && <GoldRule t={t} at={c.at + 0.35} out={fx === 'shrink' || fx === 'seed' ? act : c.out} x={c.x} y={c.y + c.size * 0.3} w={Math.min(W * 0.5, 240)} light={c.gold === 'light'} />}
      {chars.map((ch, i) => {
        if (ch === ' ') return null;
        const cw = (i < xs.length - 1 ? xs[i + 1] - xs[i] : measure(ch, font)) - tr;
        const lx = c.x - W / 2 + xs[i], cx = lx + cw / 2;
        const p = EO(D(t, c.at + i * 0.035, 0.6));
        let tx = 0, ty = (1 - p) * c.size * 0.55, sx = 1, sy = 1, o = clamp(p * 1.6) * (1 - q), blur = (1 - p) * 8 + q * 6, rot = 0;
        let color = c.color ?? COLORS.graphite;
        if (fx === 'grow') { const g = EBACK(clamp(D(t, c.at + i * 0.05, 0.55))); sy = lerp(0.05, 1, g) * (1 + 0.18 * au); ty = 0; blur = q * 6; o = clamp(g * 3) * (1 - q); }
        if (fx === 'shrink' || fx === 'seed') {
          const T = c.target ?? [c.x, c.y];
          const k = fx === 'seed' ? EIO(D(t, act + (Math.abs(i - chars.length / 2) / chars.length) * 0.15, actEnd - act)) : au;
          tx = (T[0] - cx) * k; ty += (T[1] - (c.y - c.size * 0.35)) * k;
          sx = sy = lerp(1, fx === 'seed' ? 0.08 : 0.05, k);
          o *= 1 - clamp((k - 0.8) * 5);
          if (fx === 'seed') color = k > 0.3 ? COLORS.goldLight : color;
        }
        if (fx === 'vanish') { const v = EIN(D(t, act + rnd(i, 7) * (actEnd - act) * 0.7, 0.4)); o *= 1 - v; blur += v * 10; ty -= v * 20; }
        if (fx === 'spread') { const a = rnd(i, 3) * Math.PI * 2, R = au * (c.size * 3 + rnd(i, 4) * c.size * 4); tx = Math.cos(a) * R + (cx - c.x) * au * 2.2; ty += Math.sin(a) * R * 0.7; rot = (rnd(i, 5) - 0.5) * 60 * au; o *= 1 - au * 0.85; sx = sy = 1 - au * 0.3; }
        if (fx === 'swell') { sx = sy = 1 + 0.25 * au; }
        if (fx === 'canopy') {
          const T = c.targets?.[i % (c.targets?.length || 1)] ?? [cx, c.y];
          const k = EIO(D(t, act + i * 0.06, actEnd - act));
          tx = (T[0] - cx) * k; ty += (T[1] - (c.y - c.size * 0.35)) * k; sx = sy = lerp(1, 0.06, k); o *= 1 - clamp((k - 0.75) * 4);
        }
        if (o <= 0.003) return null;
        return (
          <span key={i} style={{position: 'absolute', left: lx, top: c.y - c.size * 0.82, fontSize: c.size, lineHeight: 1, whiteSpace: 'pre', font, letterSpacing: 0, color, ...(c.gold ? goldText(c.gold) : {}), opacity: o, transformOrigin: fx === 'grow' ? '50% 82%' : '50% 60%', transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`, filter: blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : undefined, textShadow: c.halo ? `0 0 18px ${COLORS.cream}, 0 0 36px ${COLORS.cream}, 0 0 6px ${COLORS.cream}` : c.ember ? `0 0 ${(c.size * 0.12).toFixed(1)}px ${EMBER.core}, 0 0 ${(c.size * 0.3).toFixed(1)}px rgba(232,116,42,.45)` : undefined}}>{ch}</span>
        );
      })}
    </div>
  );
};

/** Fio dourado com losango central: abre do centro para fora. */
export const GoldRule: React.FC<{t: number; at: number; out: number; x: number; y: number; w: number; light?: boolean}> = ({t, at, out, x, y, w, light}) => {
  const p = EO(D(t, at, 0.9)), q = EIN(D(t, out, 0.3));
  if (p <= 0 || q >= 1) return null;
  const c = light ? '#E9C88F' : '#B27B49';
  return (
    <svg style={{position: 'absolute', left: x - w / 2 - 10, top: y - 10, overflow: 'visible', opacity: 1 - q}} width={w + 20} height={20}>
      <defs><linearGradient id={`gr-${Math.round(x)}-${Math.round(y)}`} x1="0" x2="1"><stop offset="0" stopColor={c} stopOpacity="0" /><stop offset="0.5" stopColor={c} /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
      <rect x={10 + (w / 2) * (1 - p)} y={9.2} width={w * p} height={1.6} fill={`url(#gr-${Math.round(x)}-${Math.round(y)})`} />
      <rect x={10 + w / 2 - 4} y={6} width={8} height={8} fill={c} transform={`rotate(45 ${10 + w / 2} 10) scale(1)`} opacity={EO(D(t, at + 0.2, 0.5))} style={{transformOrigin: `${10 + w / 2}px 10px`}} />
    </svg>
  );
};

// ---------- frase que se reorganiza (letras viajam de uma frase para a outra) ----------
type Line = {text: string; gold?: [number, number]};
const layoutLines = (lines: Line[], font: string, size: number, tr: number, f: Fmt, x: number, y: number, align: 'center' | 'left') =>
  lines.flatMap((ln, li) => {
    const xs = charXs(ln.text, font, tr), W = measure(ln.text, font, tr);
    const x0 = align === 'center' ? x - W / 2 : x;
    return [...ln.text].map((ch, i) => ({ch, x: x0 + xs[i], y: y + li * size * 1.14, gold: !!ln.gold && i >= ln.gold[0] && i < ln.gold[1], k: li * 100 + i}));
  }).filter((c) => c.ch !== ' ');

export const ReflowStatement: React.FC<{t: number; a: Line[]; b: Line[]; at: number; swap: number; out: number}> = ({t, a, b, at, swap, out}) => {
  const f = useFmt();
  if (t < at - 0.1 || t > out + 0.6) return null;
  const size = pick(f, 86, 82), font = `500 ${size}px ${FONTS.serif}`, tr = 0.05 * size;
  const x = pick(f, f.cx, 150), y = pick(f, 420, 330), align = pick(f, 'center', 'left') as 'center' | 'left';
  const LA = layoutLines(a, font, size, tr, f, x, y, align), LB = layoutLines(b, font, size, tr, f, x, y, align);
  // casamento de letras iguais (na ordem de leitura)
  const used = new Set<number>(), match = new Map<number, number>();
  LB.forEach((cb, j) => { const i = LA.findIndex((ca, k) => !used.has(k) && ca.ch === cb.ch); if (i >= 0) { used.add(i); match.set(i, j); } });
  const u = EIO(D(t, swap, 1.25)), q = EIN(D(t, out, 0.45));
  const glyph = (ch: string, x0: number, y0: number, o: number, gold: number, key: string, extra = '') => (
    <span key={key} style={{position: 'absolute', left: x0, top: y0 - size * 0.82, font, fontSize: size, lineHeight: 1, color: COLORS.graphite, ...(gold > 0.5 ? goldText('deep') : {}), opacity: o, transform: extra, whiteSpace: 'pre'}}>{ch}</span>
  );
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - q}}>
      <GoldRule t={t} at={at + 0.1} out={out} x={align === 'center' ? x : x + 110} y={y - size * 1.05} w={220} />
      {LA.map((c, i) => {
        const p = EO(D(t, at + i * 0.022, 0.7));
        const j = match.get(i);
        if (j !== undefined) {
          const d = LB[j], k = EIO(clamp((u - (i / LA.length) * 0.25) / 0.75));
          const lift = Math.sin(Math.PI * k) * -size * 0.5;
          return glyph(c.ch, lerp(c.x, d.x, k), lerp(c.y, d.y, k) + lift + (1 - p) * size * 0.4, clamp(p * 1.5), lerp(c.gold ? 1 : 0, d.gold ? 1 : 0, k), `a${i}`, `translateZ(0)`);
        }
        const fo = EIN(clamp(u * 2.2 - (i / LA.length) * 0.4));
        return glyph(c.ch, c.x, c.y + (1 - p) * size * 0.4 - fo * 30, clamp(p * 1.5) * (1 - fo), c.gold ? 1 : 0, `a${i}`, `scale(${1 - fo * 0.3})`);
      })}
      {LB.map((c, j) => {
        if ([...match.values()].includes(j)) return null;
        const p = EO(clamp((u - 0.45 - (j / LB.length) * 0.3) / 0.4));
        return glyph(c.ch, c.x, c.y + (1 - p) * size * 0.4, p, c.gold ? 1 : 0, `b${j}`);
      })}
    </div>
  );
};

// ---------- o roteiro das legendas ----------
export const Captions: React.FC<{t: number}> = ({t}) => {
  const f = useFmt();
  const v = f.v;
  const cam = worldCam(t, f);
  const seedS = project(f, cam, 0, -900);
  const canopyT = TREE.tips.filter((_, i) => i % 9 === 0).map((p) => project(f, cam, p[0], p[1]).slice(0, 2) as Pt);
  const caps: Cap[] = [
    {text: 'PEQUENO', at: A.pequeno - 0.05, out: A.desaparece + 0.1, act: A.quase, actEnd: A.desaparece + 0.05, x: pick(f, 540, 960), y: pick(f, 1340, 905), size: pick(f, 168, 136), fx: 'shrink', target: [seedS[0], seedS[1]], gold: 'deep', rule: true},
    {text: 'NINGUÉM VÊ', at: A.ninguem - 0.05, out: A.mas2 - 0.2, act: A.acontecendo - 0.35, actEnd: A.mas2 - 0.3, x: f.cx, y: pick(f, 560, 300), size: pick(f, 132, 120), fx: 'vanish', burn: 'char', burnOut: true},
    {text: 'insignificante', at: A.insignificante - 0.05, out: A.cresce - 0.25, x: pick(f, 700, 1240), y: pick(f, 860, 470), size: pick(f, 62, 56), style: 'serif', opacity: 0.6},
    {text: 'CRESCE', at: A.cresce - 0.04, out: A.torna - 0.15, act: A.cresce + 0.2, actEnd: A.torna, x: pick(f, 540, 520), y: pick(f, 520, 380), size: pick(f, 210, 186), fx: 'grow', burn: 'gold', rule: true},
    {text: 'abrigo', at: A.abrigo - 0.06, out: A.percebe - 0.1, act: A.passaros - 0.2, actEnd: A.percebe - 0.15, x: f.cx, y: pick(f, 470, 250), size: pick(f, 190, 168), style: 'serif', fx: 'canopy', targets: canopyT, gold: 'deep'},
    {text: 'Percebe?', at: A.percebe - 0.02, out: A.jesus2 + 0.55, x: pick(f, 540, 330), y: pick(f, 420, 560), size: pick(f, 104, 96), style: 'serif'},
    {text: 'O REINO', at: A.reino2 - 0.35, out: A.algo - 0.15, x: pick(f, 540, 360), y: pick(f, 380, 450), size: pick(f, 112, 102), style: 'serifUp', color: COLORS.cream},
    {text: 'DOS CÉUS', at: A.ceus2 - 0.3, out: A.algo - 0.1, x: pick(f, 540, 360), y: pick(f, 500, 562), size: pick(f, 112, 102), style: 'serifUp', gold: 'light', rule: true},
    {text: 'de maneira discreta', at: A.discreta - 0.35, out: A.mas3 - 0.15, x: f.cx, y: pick(f, 1180, 760), size: pick(f, 56, 50), style: 'serif', color: COLORS.cream, opacity: 0.75},
    {text: 'ALCANCE', at: A.alcance - 0.06, out: A.maior, act: A.alcance + 0.35, actEnd: A.maior - 0.05, x: f.cx, y: pick(f, 760, 420), size: pick(f, 190, 168), fx: 'spread', gold: 'light'},
    {text: 'MUITO MAIOR', at: A.muito - 0.05, out: A.comeco - 0.25, act: A.maior - 0.1, actEnd: A.comeco - 0.2, x: f.cx, y: pick(f, 1150, 700), size: pick(f, 132, 132), fx: 'swell', burn: 'lit', rule: true},
    {text: 'começo', at: A.comeco - 0.06, out: A.anunciar + 0.5, act: A.comeco + 0.5, actEnd: A.anunciar + 0.35, x: f.cx, y: pick(f, 700, 330), size: pick(f, 170, 156), style: 'serif', fx: 'seed', target: [f.cx, f.cy], ember: true, gold: 'light'},
    {text: 'PEQUENOS', at: A.pequenos - 0.08, out: A.oracao - 0.45, x: pick(f, 540, 1400), y: pick(f, 330, 300), size: pick(f, 124, 112), burn: 'char'},
    {text: 'começos', at: A.comecos - 0.1, out: A.oracao - 0.4, x: pick(f, 540, 1400), y: pick(f, 460, 425), size: pick(f, 140, 128), style: 'serif', gold: 'deep', rule: true},
    {text: 'esperança', at: A.esperanca - 0.08, out: BRAND.a + 0.4, act: BRAND.a - 0.05, actEnd: BRAND.a + 0.45, x: f.cx, y: pick(f, 470, 250), size: pick(f, 160, 146), style: 'serif', fx: 'seed', target: [f.cx, f.cy], ember: true, gold: 'deep'},
  ];
  void P2H; void S; void W_T; void v;
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {caps.map((c, i) => <KineticCaption key={i} t={t} c={c} />)}
      <ReflowStatement t={t}
        a={[{text: 'NÃO DESPREZE OS'}, {text: 'PEQUENOS', gold: [0, 8]}, {text: 'COMEÇOS.', gold: [0, 7]}]}
        b={[{text: 'NEM TUDO QUE VOCÊ'}, {text: 'AINDA NÃO VÊ', gold: [6, 12]}, {text: 'ESTÁ PARADO.'}]}
        at={A.nem - 0.15} swap={A.vezes - 0.35} out={A.alguem2 - 0.6} />
    </div>
  );
};
