// ShareCard — o convite a compartilhar como microinteração: a mensagem vira um cartão, o botão é tocado,
// o cartão se recolhe numa luz e essa luz viaja até quem está num começo difícil.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS, FONTS} from '../../../brand/tokens';
import {D, EBACK, EIN, EIO, EO, clamp, lerp} from '../lib/math';
import {Fmt, pick} from '../lib/format';
import {A} from '../story';
import {Cam, project} from './CinematicCamera';
import {P1} from './WorldScene';

export const ShareCard: React.FC<{t: number; f: Fmt; cam: Cam}> = ({t, f, cam}) => {
  const a = A.compartilhe - 0.45, press = A.compartilhe + 0.2, fold = A.compartilhe + 0.5, gone = A.compartilhe + 0.8;
  if (t < a || t > gone + 0.1) return null;
  const inn = EBACK(clamp(D(t, a, 0.55))), pr = Math.sin(Math.PI * D(t, press, 0.22)), fo = EIO(D(t, fold, gone - fold));
  const [hx, hy] = project(f, cam, P1[0] + 6, -300);
  const w = pick(f, 720, 680), h = 150;
  const cx = Math.min(f.W - 40 - w / 2, Math.max(40 + w / 2, hx + w * 0.25)), cy = hy - 150;
  const ripple = D(t, press + 0.05, 0.5);
  return (
    <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, transformOrigin: `${w - 70}px ${h / 2}px`, transform: `translate(${(hx - (cx - w / 2 + w - 70)) * fo}px, ${(hy - cy) * fo}px) scale(${lerp(0.88, 1, inn) * (1 - fo * 0.97)})`, opacity: clamp(inn * 2) * (1 - EIN(D(t, gone - 0.15, 0.2)))}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 28, background: '#FBF8F2', boxShadow: '0 24px 60px rgba(36,39,44,.18), 0 0 0 1px rgba(178,123,73,.25)'}} />
      <Img src={staticFile('img/sphere-96.png')} style={{position: 'absolute', left: 32, top: 22, width: 30, height: 30, transform: `rotate(${t * 20}deg)`}} />
      <div style={{position: 'absolute', left: 34, top: 60, fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 500, fontSize: pick(f, 42, 40), color: COLORS.graphite, whiteSpace: 'nowrap'}}>Não despreze os pequenos começos.</div>
      <div style={{position: 'absolute', right: 26, top: h / 2 - 32, width: 64, height: 64, borderRadius: 32, background: COLORS.gold, transform: `scale(${1 - 0.12 * pr})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${30 * fo}px ${COLORS.goldLight}`}}>
        <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#FBF8F2" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 11.5L20.5 4l-7.5 17-2-7.5z" /></svg>
      </div>
      {ripple > 0 && ripple < 1 && <div style={{position: 'absolute', right: 26 + 32 - 32 * (1 + ripple * 1.6), top: h / 2 - 32 * (1 + ripple * 1.6), width: 64 * (1 + ripple * 1.6), height: 64 * (1 + ripple * 1.6), borderRadius: '50%', border: `2px solid ${COLORS.gold}`, opacity: 1 - ripple}} />}
      {void EO}
    </div>
  );
};
