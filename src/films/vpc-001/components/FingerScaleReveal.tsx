// FingerScaleReveal — a mão ilustrada que revela a escala: na macro só se vê a curva da ponta do dedo;
// quando a câmera recua, a semente vira um ponto quase invisível. Depois a mão se inclina e a semente cai.
import React from 'react';
import {COLORS} from '../../../brand/tokens';
import {D, EIN, EIO, EO, Pt, lerp} from '../lib/math';
import {SEED_R} from './SeedMacroScene';

export const HAND = {contact: [24, -2 - SEED_R] as Pt, at: [-24, -900 + 2 + SEED_R] as Pt, pivot: [700, 120] as Pt};

const OUTLINE = 'M -6 16 C -7 3 6 -3 24 -2 L 250 -5 C 292 -7 322 -16 352 -32 C 422 -64 562 -70 702 -60 L 1200 -44 L 1200 300 L 640 262 C 600 252 560 236 540 206 C 520 222 470 222 446 186 C 422 200 372 196 352 150 C 330 160 280 150 262 106 C 255 90 250 80 240 72 L 30 68 C 6 66 -5 46 -6 16 Z';
const DETAILS = ['M 16 8 C 34 3 62 3 78 10 C 70 24 34 26 18 20 Z', 'M 150 6 C 155 24 155 48 150 64', 'M 214 4 C 219 26 219 46 214 68', 'M 352 150 C 356 168 352 182 346 190', 'M 446 186 C 452 204 450 214 444 222', 'M 540 206 C 548 224 548 236 544 248', 'M 330 -28 C 360 -6 372 30 368 70'];

export const handPose = (t: number, enterAt: number, tiltAt: number, exitAt: number) => {
  const ein = EO(D(t, enterAt, 0.95));
  const tilt = -12 * EIO(D(t, tiltAt, 0.45));
  const ex = EIN(D(t, exitAt, 0.8));
  return {dx: lerp(900, 0, ein) + ex * 900, dy: ex * -420, tilt, o: ein > 0 && ex < 1 ? 1 : 0};
};

/** Ponto de contato da semente na ponta do dedo, no mundo, para uma pose. */
export const contactWorld = (pose: ReturnType<typeof handPose>): Pt => {
  const a = (pose.tilt * Math.PI) / 180, [px, py] = HAND.pivot, [cx, cy] = HAND.contact;
  const x = cx - px, y = cy - py;
  return [HAND.at[0] + pose.dx + px + x * Math.cos(a) - y * Math.sin(a), HAND.at[1] + pose.dy + py + x * Math.sin(a) + y * Math.cos(a)];
};

export const FingerScaleReveal: React.FC<{pose: ReturnType<typeof handPose>}> = ({pose}) => {
  if (!pose.o) return null;
  return (
    <g transform={`translate(${HAND.at[0] + pose.dx} ${HAND.at[1] + pose.dy}) rotate(${pose.tilt} ${HAND.pivot[0]} ${HAND.pivot[1]})`}>
      <defs>
        <linearGradient id="hand-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DDB28A" />
          <stop offset="1" stopColor="#C49470" />
        </linearGradient>
      </defs>
      <path d={OUTLINE} transform="translate(10 26)" fill={COLORS.graphite} opacity={0.1} />
      <path d={OUTLINE} fill="url(#hand-g)" stroke="#A9744F" strokeWidth={1.6} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <path d="M 660 -62 L 1200 -46 L 1200 300 L 700 268 C 690 160 680 40 660 -62 Z" fill={COLORS.deep} />
      <path d="M 660 -62 C 680 40 690 160 700 268" stroke={COLORS.gold} strokeWidth={2.2} vectorEffect="non-scaling-stroke" fill="none" />
      {DETAILS.map((d, i) => <path key={i} d={d} fill="none" stroke="#8E5C3C" strokeWidth={i === 0 ? 1.4 : 1.8} vectorEffect="non-scaling-stroke" strokeLinecap="round" opacity={i === 0 ? 0.5 : 0.55} />)}
      <path d="M 26 4 C 120 0 220 0 300 -6" fill="none" stroke={COLORS.goldLight} strokeWidth={2.4} vectorEffect="non-scaling-stroke" opacity={0.85} strokeLinecap="round" />
    </g>
  );
};
