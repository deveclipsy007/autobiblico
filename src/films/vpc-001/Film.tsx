// VER PARA CRER · EP01 — o diretor: decide o que existe em cada instante (janelas), a câmera e as passagens.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, fontsReady} from '../../brand/tokens';
import {FmtCtx, makeFmt} from './lib/format';
import {PRE} from './story';
import {BiblePageScene, PAGE_T} from './components/BiblePageScene';
import {GooDefs} from './components/ScriptureToSeedMorph';
import {WorldScene} from './components/WorldScene';
import {HumanReflectionScene, HUMAN_T} from './components/HumanReflectionScene';
import {BrandSignature, BRAND_T} from './components/BrandSignature';
import {Captions} from './components/KineticCaption';
import {Finish} from './components/Finish';
import {D, EIO} from './lib/math';
import {ChromaRing} from '../../brand/fire';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {motionAt} from './lib/motion';

export type FilmProps = {audio: 'none' | 'voice' | 'mix'};

const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [ok, setOk] = useState(false);
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => { fontsReady.then(() => { setOk(true); continueRender(h); }); }, [h]);
  return ok ? <>{children}</> : null;
};

const FilmFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  // íris: o mundo creme nasce do ponto que saiu da página
  const iris = EIO(D(t, PAGE_T.irisA, PAGE_T.irisB - PAGE_T.irisA));
  const irisR = -40 + iris * Math.hypot(width, height) * 0.62;
  const showPage = t < PAGE_T.irisB + 0.05;
  const showWorld = t > PAGE_T.irisA && t < BRAND_T.worldOff;
  return (
    <AbsoluteFill style={{background: COLORS.cream, overflow: 'hidden'}}>
      {showPage && <BiblePageScene t={t} />}
      {showWorld && (
        <AbsoluteFill style={{clipPath: t < PAGE_T.irisB ? `circle(${Math.max(0, irisR).toFixed(1)}px at 50% 50%)` : undefined}}>
          <WorldScene t={t} />
        </AbsoluteFill>
      )}
      {t > PAGE_T.irisA && t < PAGE_T.irisB && <svg width={width} height={height} style={{position: 'absolute', inset: 0}}><ChromaRing cx={width / 2} cy={height / 2} r={Math.max(0, irisR)} o={Math.sin(Math.PI * iris)} w={18} /></svg>}
      {t > HUMAN_T.a && t < HUMAN_T.b && <HumanReflectionScene t={t} />}
      {t > BRAND_T.a && <BrandSignature t={t} />}
      <Captions t={t} />
      <Finish t={t} />
    </AbsoluteFill>
  );
};

/** Motion blur de obturador (200°) só quando a câmera se move rápido na tela. */
export const BLUR_PX = 13;

export const Film: React.FC<FilmProps> = ({audio}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  const fmt = makeFmt(width, height);
  const blur = motionAt(t, fmt, fps) > BLUR_PX;
  return (
    <FmtCtx.Provider value={fmt}>
      <AbsoluteFill style={{background: COLORS.cream, overflow: 'hidden'}}>
        <GooDefs />
        <FontGate>{blur ? <CameraMotionBlur shutterAngle={200} samples={6}><FilmFrame /></CameraMotionBlur> : <FilmFrame />}</FontGate>
        {audio === 'mix' && <Html5Audio src={staticFile('audio/vpc-001/mix-master.wav')} />}
        {audio === 'voice' && <Sequence from={Math.round(PRE * fps)}><Html5Audio src={staticFile('audio/vpc-001/vo/voz.wav')} /></Sequence>}
      </AbsoluteFill>
    </FmtCtx.Provider>
  );
};
