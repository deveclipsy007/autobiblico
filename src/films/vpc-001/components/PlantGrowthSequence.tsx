// PlantGrowthSequence — da semente ao broto ao abrigo: caule que atravessa a terra, cotilédones que abrem,
// e a árvore que cresce (BranchExpansion) enquanto a câmera sobe e recua acompanhando.
import React from 'react';
import {COLORS} from '../../../brand/tokens';
import {D, EBACK, EIO, EO, clamp, lerp} from '../lib/math';
import {BranchExpansion} from './BranchExpansion';

export const sproutAt = (t: number, a: {broto: number; insig: number; cresce: number}) => {
  const under = EIO(D(t, a.broto, 1.5));             // do grão (y 110) até a superfície
  const above = EO(D(t, a.insig - 0.55, 0.9));         // rompe a superfície e sobe um pouco
  const coty = EBACK(clamp(D(t, a.insig - 0.15, 0.6)));
  const y = lerp(110, 0, under) - 46 * above;
  return {y, coty, fade: 1 - EO(D(t, a.cresce + 0.35, 0.8))};
};

export const PlantGrowthSequence: React.FC<{t: number; g: number; sprout: ReturnType<typeof sproutAt>; nightR?: number; leafO?: number; flowerBoost?: number}> = ({t, g, sprout, nightR, leafO, flowerBoost}) => (
  <g>
    {sprout.fade > 0 && sprout.y < 108 && (
      <g opacity={sprout.fade}>
        <path d={`M 0 108 C -6 80 6 ${(sprout.y + 108) / 2} 0 ${sprout.y}`} fill="none" stroke={COLORS.sage} strokeWidth={4.5} strokeLinecap="round" />
        {sprout.coty > 0 && sprout.y < 0 && (
          <g transform={`translate(0 ${sprout.y})`}>
            <path d="M 0 0 C -6 -10 -24 -16 -30 -6 C -24 4 -8 4 0 0 Z" fill={COLORS.sage} transform={`scale(${sprout.coty}) rotate(${lerp(40, 0, sprout.coty)})`} />
            <path d="M 0 0 C 6 -10 24 -16 30 -6 C 24 4 8 4 0 0 Z" fill={COLORS.sageDark} transform={`scale(${sprout.coty}) rotate(${lerp(-40, 0, sprout.coty)})`} />
          </g>
        )}
      </g>
    )}
    {g > 0 && <BranchExpansion t={t} g={g} nightR={nightR} leafO={leafO} flowerBoost={flowerBoost} />}
  </g>
);
