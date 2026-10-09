// Folha de personagens VER PARA CRER: elenco, poses e regras. Renderize como still para o guia de marca.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONTS} from '../tokens';
import {CAST, POSES, Persona, groundY, palmOf} from './Persona';

export const CharacterSheet: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const names: [keyof typeof CAST, string][] = [['semeador', 'O Semeador'], ['alguem', 'Alguém'], ['guardia', 'A Guardiã'], ['viajante', 'O Viajante']];
  const poses: [string, string][] = [['stand', 'em pé'], ['lookUp', 'olha para cima'], ['offer', 'oferece'], ['sitHug', 'começo difícil'], ['sitReceive', 'recebe'], ['sitHope', 'esperança']];
  return (
    <AbsoluteFill style={{background: COLORS.cream}}>
      <div style={{position: 'absolute', left: 80, top: 60, fontFamily: FONTS.display, fontWeight: 800, fontSize: 44, letterSpacing: '-0.03em', color: COLORS.graphite}}>Personagens · VER PARA CRER</div>
      <div style={{position: 'absolute', left: 80, top: 116, fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 26, color: COLORS.gold}}>formas suaves · rosto mínimo · fio de luz de brasa na borda</div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {names.map(([k], i) => <Persona key={k} x={200 + i * 230} y={700 + groundY(POSES.stand)} pose={POSES.stand} look={CAST[k]} t={t + i} s={1} />)}
        {poses.map(([p], i) => {
          const sit = false; void sit;
          const x = 1080 + (i % 3) * 270, y = (i < 3 ? 650 : 920) + groundY(POSES[p]);
          const pos = POSES[p];
          const palm = palmOf(pos, x, y + (sit ? -20 : 0));
          return <g key={p}><Persona x={x} y={y + (sit ? -20 : 0)} pose={pos} look={CAST.semeador} t={t} />{pos.handF > 0.5 && <circle cx={palm[0]} cy={palm[1]} r={4.5} fill="#9C6A40" />}</g>;
        })}
      </svg>
      {names.map(([, n], i) => <div key={n} style={{position: 'absolute', left: 120 + i * 230, width: 160, top: 740, textAlign: 'center', fontFamily: FONTS.body, fontWeight: 600, fontSize: 22, color: COLORS.graphite}}>{n}</div>)}
      {poses.map(([, n], i) => <div key={n} style={{position: 'absolute', left: 1000 + (i % 3) * 270, width: 160, top: i < 3 ? 680 : 950, textAlign: 'center', fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 22, color: COLORS.gold}}>{n}</div>)}
    </AbsoluteFill>
  );
};
