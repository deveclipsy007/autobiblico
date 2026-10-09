// VER PARA CRER · a esfera dourada (marca). Reutilizável: aparições sutis ao longo dos filmes e assinatura final.
// A imagem gira no plano enquanto a luz fica parada (realce em cima à esquerda, sombra embaixo à direita):
// é isso que faz o giro parecer um objeto 3D de verdade. Brilho que varre, reflexo no chão e poeira em órbita.
import React from 'react';
import {Img, staticFile} from 'remotion';

const FILL = 0.9035; // fração do PNG ocupada pelo círculo
const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

export const BrandSphere: React.FC<{x: number; y: number; d: number; rot?: number; sheen?: number; glow?: number; reflection?: number; dust?: number; t?: number; o?: number; small?: boolean}> = ({x, y, d, rot = 0, sheen = -1, glow = 0.5, reflection = 0, dust = 0, t = 0, o = 1, small = false}) => {
  if (d <= 0.5 || o <= 0.003) return null;
  const S = d / FILL, src = staticFile(small ? 'img/sphere-96.png' : 'img/sphere.png');
  const orbit = (front: boolean) => dust > 0 && Array.from({length: 16}, (_, i) => {
    const a = rnd(i, 2) * Math.PI * 2 + t * (0.35 + rnd(i, 3) * 0.25), R = d * (0.62 + rnd(i, 4) * 0.22), tilt = 0.28;
    const z = Math.sin(a);
    if ((z > 0) !== front) return null;
    const px = x + Math.cos(a) * R, py = y + Math.sin(a) * R * tilt - d * 0.05, s = (1.6 + rnd(i, 5) * 2.6) * (0.75 + 0.35 * z) * (d / 500);
    return <div key={i} style={{position: 'absolute', left: px - s, top: py - s, width: s * 2, height: s * 2, borderRadius: '50%', background: '#F6D9A0', boxShadow: `0 0 ${s * 3}px #E9B970`, opacity: dust * (0.45 + 0.4 * z) * (0.6 + 0.4 * Math.sin(t * 2 + i))}} />;
  });
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
      {glow > 0 && <div style={{position: 'absolute', left: x - d * 1.1, top: y - d * 1.1, width: d * 2.2, height: d * 2.2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,185,112,.55) 0%, rgba(178,123,73,.18) 38%, rgba(0,0,0,0) 68%)', opacity: glow}} />}
      {reflection > 0 && <div style={{position: 'absolute', left: x - d * 0.75, top: y + d * 0.5 - d * 0.06, width: d * 1.5, height: d * 0.22, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 50%, rgba(233,185,112,.55) 0%, rgba(178,123,73,.18) 40%, rgba(0,0,0,0) 70%)', opacity: reflection * 2.2, filter: `blur(${d * 0.02}px)`}} />}
      {orbit(false)}
      <div style={{position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 ${d * 0.05}px ${d * 0.12}px rgba(0,0,0,.35)`}}>
        <Img src={src} style={{position: 'absolute', left: (d - S) / 2, top: (d - S) / 2, width: S, height: S, transform: `rotate(${rot}deg)`}} />
        {/* luz fixa: realce e sombra não giram com a esfera */}
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 34% 28%, rgba(255,246,222,.32) 0%, rgba(255,240,210,0) 38%)', mixBlendMode: 'screen'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 70% 76%, rgba(20,10,0,.42) 0%, rgba(20,10,0,0) 55%)', mixBlendMode: 'multiply'}} />
        {sheen >= 0 && sheen <= 1 && <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(115deg, rgba(255,255,255,0) ${sheen * 160 - 40}%, rgba(255,244,220,.75) ${sheen * 160 - 25}%, rgba(255,255,255,0) ${sheen * 160 - 10}%)`, mixBlendMode: 'screen'}} />}
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `inset ${-d * 0.02}px ${-d * 0.02}px ${d * 0.05}px rgba(255,220,160,.35)`}} />
      </div>
      {orbit(true)}
    </div>
  );
};
