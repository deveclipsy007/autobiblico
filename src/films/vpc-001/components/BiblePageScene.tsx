// BiblePageScene — entrar na Bíblia: câmera macro oblíqua sobre papel real (fibras, sombra da lombada),
// faixa de luz que abre o quadro, profundidade de campo, revelação da passagem no ritmo da voz,
// sublinhado dourado, a palavra "grão" que vira ponto e a página que se curva e cai.
import React, {useMemo} from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS, FONTS} from '../../../brand/tokens';
import {D, EIN, EIO, EO, ESM, clamp, lerp, rnd, win} from '../lib/math';
import {useFmt, pick} from '../lib/format';
import {camAt, CamKey} from './CinematicCamera';
import {A} from '../story';
import {PAGE, Word, layoutScripture} from './scripture';
import {ScriptureTypeReveal} from './ScriptureTypeReveal';
import {HandDrawnUnderline} from './HandDrawnUnderline';
import {DOT_R, ScriptureToSeedMorph, grainCenter} from './ScriptureToSeedMorph';
import {SeedSphere} from './SeedMacroScene';

export const PAGE_T = {handoff: A.mostrando - 0.25, irisA: A.mostrando + 0.08, irisB: A.aqui + 0.45};
const SPREAD = {x0: -1500, w: 3000, h: PAGE.h};
const HEADER = 'MATEUS 13';

type PK = {t: number; x?: number; y?: number; s?: number; rx?: number; ry?: number; rz?: number; d?: number; e?: (u: number) => number};
const pageCamAt = (t: number, keys: PK[]) => {
  // reaproveita o interpolador da câmera: x,y,z(=s) e r; rx/ry pelo mesmo progresso
  const c = camAt(t, keys.map((k) => ({t: k.t, x: k.x, y: k.y, z: k.s, r: k.rz, f: k.rx === undefined ? undefined : 100 + k.rx, d: k.d, e: k.e} as CamKey)));
  const c2 = camAt(t, keys.map((k) => ({t: k.t, r: k.ry, d: k.d, e: k.e} as CamKey)));
  return {x: c.x, y: c.y, s: c.z, rz: c.r, rx: c.f - 100, ry: c2.r};
};

const GreekLines: React.FC<{x: number; y0: number; y1: number; w: number; seed: number; o: number}> = ({x, y0, y1, w, seed, o}) => {
  const out: React.ReactNode[] = [];
  for (let y = y0, i = 0; y < y1; y += PAGE.lead, i++) {
    const para = rnd(i, seed) < 0.12, len = para ? w * (0.3 + rnd(i, seed + 1) * 0.4) : w * (0.86 + rnd(i, seed + 2) * 0.14);
    let cx = x + (para ? 60 : 0);
    while (cx < x + len) {
      const ww = 40 + rnd(cx, seed + i) * 150;
      out.push(<div key={`${i}-${cx}`} style={{position: 'absolute', left: cx, top: y - 30, width: Math.min(ww, x + len - cx), height: 22, borderRadius: 11, background: COLORS.ink, opacity: o * 0.13}} />);
      cx += ww + 18;
    }
  }
  return <>{out}</>;
};

const PageContent: React.FC<{t: number; words: Word[]; grain: Word; mostarda: Word[]; dimAll: number}> = ({t, words, grain, mostarda, dimAll}) => {
  const hl = (w: Word) => w.id === grain.id || mostarda.some((m) => m.id === w.id);
  const dim = (w: Word) => (hl(w) ? 1 : lerp(1, 0.2, dimAll)) * (w.kind === 'rest' ? 0.82 : 1);
  const morphing = t >= A.olha - 0.05;
  const pulse = Math.sin(Math.PI * D(t, A.mateus - 0.1, 1.3));
  const glow13 = Math.sin(Math.PI * D(t, A.treze - 0.25, 1.2));
  const gx = grainCenter(grain);
  const mEnd = mostarda[mostarda.length - 1];
  return (
    <div style={{position: 'absolute', left: SPREAD.x0, top: 0, width: SPREAD.w, height: SPREAD.h}}>
      <Img src={staticFile('img/paper.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      {/* lombada e curvatura das folhas */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(60,45,30,.18) 0%, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 40%, rgba(70,50,30,.22) 48.6%, rgba(40,28,18,.42) 50%, rgba(70,50,30,.2) 51.4%, rgba(0,0,0,0) 58%, rgba(0,0,0,0) 93%, rgba(60,45,30,.16) 100%)'}} />
      <div style={{position: 'absolute', left: 1500, top: 0, width: 1500, height: SPREAD.h}}>
        {/* cabeçalho impresso letra a letra + fio dourado */}
        <div style={{position: 'absolute', left: PAGE.left, top: 190, fontFamily: FONTS.display, fontWeight: 700, fontSize: 40, letterSpacing: '0.34em', color: COLORS.graphite, whiteSpace: 'pre', opacity: lerp(1, 0.35, dimAll)}}>
          {[...HEADER].map((ch, i) => { const p = EO(D(t, 0.3 + i * 0.075, 0.5)); return <span key={i} style={{opacity: p, filter: p < 0.97 ? `blur(${(1 - p) * 6}px)` : undefined, display: 'inline-block', transform: `translateY(${(1 - p) * 10}px)`, color: i >= 7 ? COLORS.gold : undefined, textShadow: pulse > 0 ? `0 0 ${18 * pulse}px rgba(217,168,111,${0.9 * pulse})` : undefined}}>{ch}</span>; })}
        </div>
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
          <path d={`M ${PAGE.left} 262 H ${1350}`} stroke={COLORS.gold} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - EIO(D(t, 0.55, 1.4))} opacity={lerp(1, 0.4, dimAll)} />
          {pulse > 0 && <path d={`M ${PAGE.left} 262 H ${1350}`} stroke="#FFE2B5" strokeWidth={5} pathLength={1} strokeDasharray="0.12 1" strokeDashoffset={0.12 - D(t, A.mateus - 0.1, 1.3) * 1.15} opacity={pulse} style={{filter: 'drop-shadow(0 0 8px #D9A86F)'}} />}
        </svg>
        <div style={{position: 'absolute', left: PAGE.left - 10, top: 300, fontFamily: FONTS.serif, fontWeight: 400, fontSize: 250, lineHeight: 1, color: COLORS.gold, opacity: EO(D(t, 1.0, 0.9)) * lerp(1, 0.3, dimAll), transform: `translateY(${(1 - EO(D(t, 1.0, 0.9))) * 26}px)`, textShadow: glow13 > 0 ? `0 0 ${40 * glow13}px rgba(217,168,111,${0.8 * glow13})` : undefined}}>13</div>
        <div style={{position: 'absolute', left: 520, top: 470, fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 46, color: COLORS.graphite, opacity: 0.8 * EO(D(t, 1.25, 0.9)) * lerp(1, 0.3, dimAll), whiteSpace: 'nowrap'}}>A parábola do grão de mostarda</div>
        <GreekLines x={PAGE.left} y0={PAGE.top + 8 * PAGE.lead + 40} y1={2040} w={1220} seed={4} o={lerp(1, 0.6, dimAll) * EO(D(t, 0.2, 1.5))} />
        <ScriptureTypeReveal t={t} words={words} dim={dim} hide={morphing ? (w) => hl(w) : undefined} />
        <HandDrawnUnderline t={t} at={A.grao - 0.05} x0={grain.x - 10} x1={mEnd.x + mEnd.w - 14} y={grain.y + 20} out={A.olha + 0.05} />
        {morphing && <ScriptureToSeedMorph t={t} at={A.olha} grain={grain} rest={mostarda} handoff={PAGE_T.handoff} />}
        <div style={{display: 'none'}}>{gx[0]}</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1500, height: SPREAD.h}}>
        <GreekLines x={170} y0={300} y1={2040} w={1180} seed={9} o={EO(D(t, 0.1, 1.5))} />
      </div>
    </div>
  );
};

export const BiblePageScene: React.FC<{t: number}> = ({t}) => {
  const f = useFmt();
  const words = useMemo(() => layoutScripture(), []);
  const grain = words.find((w) => w.text === 'grão')!;
  const mostarda = words.filter((w) => w.line === 2 && (w.text === 'de' || w.text === 'mostarda,')).slice(0, 2);
  const [gx, gy] = grainCenter(grain);
  // coordenadas da câmera no espaço do spread (origem na lombada → somar 1500 aos x da página direita)
  const R = (x: number) => x + 1500;
  const wide = pick(f, 1, 0.82);
  const keys: PK[] = [
    {t: 0, x: R(300), y: 235, s: 1.9, rx: 52, ry: -6, rz: -10},
    {t: 1.35, x: R(700), y: 250, s: 1.75, rx: 47, ry: -4, rz: -8, d: 1.35, e: ESM},
    {t: 3.3, x: R(640), y: PAGE.top + PAGE.lead - 30, s: 1.42, rx: 36, ry: -2, rz: -5, d: 1.95},
    {t: 4.5, x: R(gx + 110), y: gy, s: 1.5, rx: 30, ry: 0, rz: -4, d: 1.15},
    {t: 6.5, x: R(780), y: 1000, s: 0.62 * wide, rx: 24, ry: 6, rz: -2, d: 1.75},
    {t: 9.45, x: R(gx), y: gy, s: 2.55, rx: 9, ry: 0, rz: 0, d: 2.5},
    {t: 11.2, x: R(gx), y: gy, s: 3.1, rx: 9, ry: 0, rz: 0, d: 1.6, e: ESM},
  ];
  const c = pageCamAt(t, keys);
  const dimAll = EIO(D(t, A.parece + 0.25, 0.9));
  const curl = EIO(D(t, PAGE_T.handoff + 0.05, 1.25));
  const Rb = 620 / Math.max(curl, 1e-4);
  const xform = `translate(${f.cx}px, ${f.cy}px) perspective(1500px) rotateZ(${c.rz}deg) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)`;
  const fall = `translate3d(0, ${curl * 260}px, ${-curl * 520}px) rotateX(${curl * 28}deg)`;
  const content = <PageContent t={t} words={words} grain={grain} mostarda={mostarda} dimAll={dimAll} />;
  const N = 20, h = SPREAD.h / N, yc = gy + 120;
  // luz: faixa estreita que se abre
  const open = EIO(D(t, 0.1, 2.5));
  const bandC = lerp(34, 52, open), bandW = lerp(2.5, 120, open ** 1.6);
  const dof = clamp(c.rx / 50) * 7 + curl * 8;
  // ponto herói (tela): mesmo tamanho do ponto na página no instante da troca
  const sHand = pageCamAt(PAGE_T.handoff, keys).s;
  const app = EIO(D(t, PAGE_T.handoff, 0.95));
  const heroR = lerp(DOT_R * sHand, 162, app);
  const shade = EO(D(t, PAGE_T.handoff + 0.2, 0.7));
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0E0D0C', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1, transformOrigin: '0 0', transform: xform, transformStyle: 'preserve-3d'}}>
        <div style={{position: 'absolute', left: 0, top: 0, transformStyle: 'preserve-3d', transformOrigin: `${R(gx)}px ${gy}px`, transform: curl > 0 ? fall : undefined}}>
          {curl <= 0 ? (
            <div style={{position: 'absolute', left: 1500, top: 0}}>{content}</div>
          ) : (
            Array.from({length: N}, (_, k) => {
              const y = k * h, th = (y - yc) / Rb, th2 = (y + h - yc) / Rb;
              const ty = yc + Rb * Math.sin(th) - y, tz = -Rb * (1 - Math.cos(th));
              const sh = (a: number) => (0.6 * (1 - Math.cos(a)) + curl * 0.25).toFixed(3);
              return (
                <div key={k} style={{position: 'absolute', left: SPREAD.x0 + 1500, top: y, width: SPREAD.w, height: h + 8, overflow: 'hidden', transformOrigin: '0 0', transform: `translate3d(0, ${ty.toFixed(2)}px, ${tz.toFixed(2)}px) rotateX(${(-th * 180 / Math.PI).toFixed(3)}deg)`, backfaceVisibility: 'visible'}}>
                  <div style={{position: 'absolute', left: -SPREAD.x0, top: -y}}>{content}</div>
                  <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(20,16,12,${sh(th)}), rgba(20,16,12,${sh(th2)}))`}} />
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* luz quente que passeia sobre a página */}
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 60% at ${lerp(30, 62, D(t, 0, 10))}% ${lerp(42, 50, D(t, 0, 10))}%, rgba(255,214,160,0.10), rgba(40,26,14,0.42) 100%)`, mixBlendMode: 'multiply', opacity: 1 - curl * 0.3}} />
      {/* profundidade de campo: bordas fora de foco */}
      {dof > 0.3 && <>
        <div style={{position: 'absolute', left: 0, top: 0, width: f.W, height: f.H * 0.36, backdropFilter: `blur(${dof.toFixed(1)}px)`, WebkitMaskImage: 'linear-gradient(180deg, #000 0%, #000 30%, transparent 100%)', maskImage: 'linear-gradient(180deg, #000 0%, #000 30%, transparent 100%)'}} />
        <div style={{position: 'absolute', left: 0, bottom: 0, width: f.W, height: f.H * 0.34, backdropFilter: `blur(${(dof * 1.2).toFixed(1)}px)`, WebkitMaskImage: 'linear-gradient(0deg, #000 0%, #000 30%, transparent 100%)', maskImage: 'linear-gradient(0deg, #000 0%, #000 30%, transparent 100%)'}} />
      </>}
      {/* poeira na luz */}
      {Array.from({length: 26}, (_, i) => {
        const x = ((rnd(i, 1) * 1.2 - 0.1) * f.W + t * (12 + rnd(i, 2) * 26)) % (f.W * 1.1), y = rnd(i, 3) * f.H - t * (8 + rnd(i, 4) * 14), s = 3 + rnd(i, 5) * 12;
        const inBand = clamp(1 - Math.abs((x / f.W) * 100 - bandC) / (bandW + 10));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: '#FFE7C2', filter: `blur(${(s / 3).toFixed(1)}px)`, opacity: 0.55 * inBand * (1 - curl) * win(t, 0.2, 10.4, 1.2, 0.6)}} />;
      })}
      {/* faixa de luz: o quadro começa no escuro e se abre */}
      {open < 1 && <div style={{position: 'absolute', inset: 0, background: '#0B0A09', WebkitMaskImage: `linear-gradient(100deg, #000 0%, #000 ${bandC - bandW - 8}%, transparent ${bandC - bandW}%, transparent ${bandC + bandW}%, #000 ${bandC + bandW + 8}%)`, maskImage: `linear-gradient(100deg, #000 0%, #000 ${bandC - bandW - 8}%, transparent ${bandC - bandW}%, transparent ${bandC + bandW}%, #000 ${bandC + bandW + 8}%)`, opacity: 1 - EIN(D(t, 2.0, 0.8))}} />}
      {open < 1 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${bandC - bandW - 10}%, rgba(255,170,90,.18) ${bandC}%, transparent ${bandC + bandW + 10}%)`, mixBlendMode: 'screen', opacity: 1 - open}} />}
      {/* o ponto se descola e vem até a câmera */}
      {t >= PAGE_T.handoff && (
        <svg width={f.W} height={f.H} style={{position: 'absolute', inset: 0}}>
          <g transform={`translate(${f.cx} ${f.cy}) scale(${heroR / 4.5})`}>
            <SeedSphere id="hero" r={4.5} shade={shade} rot={t * 0.9} />
          </g>
        </svg>
      )}
    </div>
  );
};
