// Acabamento: grão fino animado (camada separada, nunca sobre o texto em si) + vinheta suave.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {useFmt} from '../lib/format';

export const Finish: React.FC<{t: number}> = ({t}) => {
  const f = useFmt();
  const k = Math.floor(t * 24);
  const ox = ((k * 137) % 512), oy = ((k * 251) % 512);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(30,22,14,.22) 100%)', mixBlendMode: 'multiply', pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: -ox, top: -oy, width: f.W + 1024, height: f.H + 1024, opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none', overflow: 'hidden'}}>
        {Array.from({length: Math.ceil((f.W + 1024) / 512) * Math.ceil((f.H + 1024) / 512)}, (_, i) => {
          const cols = Math.ceil((f.W + 1024) / 512);
          return <Img key={i} src={staticFile('img/grain.png')} style={{position: 'absolute', left: (i % cols) * 512, top: Math.floor(i / cols) * 512, width: 512, height: 512}} />;
        })}
      </div>
    </>
  );
};
