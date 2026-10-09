// Pessoas ilustradas: poucas formas, silhueta clara, gesto expressivo. Mesma espessura de linha e paleta do resto.
import React from 'react';
import {COLORS} from '../../../brand/tokens';

const SKIN = '#D6B08A';

/** Em pé, pés em (0,0), ~300 de altura, olhando para a direita. */
export const StandingFigure: React.FC<{x: number; y?: number; look?: number; s?: number}> = ({x, y = 0, look = 0, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={4} cy={2} rx={58} ry={8} fill={COLORS.graphite} opacity={0.18} />
    <path d="M -12 -128 L -16 -6 M 13 -128 L 18 -6" stroke={COLORS.graphite} strokeWidth={22} strokeLinecap="round" />
    <path d="M -40 -222 C -48 -170 -42 -140 -36 -116 L 36 -116 C 42 -140 48 -170 40 -222 C 28 -238 -28 -238 -40 -222 Z" fill={COLORS.deep} />
    <path d="M -36 -212 C -50 -170 -50 -140 -44 -110" stroke={COLORS.deep} strokeWidth={17} strokeLinecap="round" fill="none" />
    <path d="M 36 -212 C 52 -176 56 -150 62 -126" stroke={COLORS.deep} strokeWidth={17} strokeLinecap="round" fill="none" />
    <g transform={`rotate(${look} 2 -250)`}>
      <rect x={-8} y={-252} width={18} height={24} rx={6} fill={SKIN} />
      <circle cx={4} cy={-270} r={30} fill={SKIN} />
      <path d="M -26 -268 C -30 -300 6 -312 26 -292 C 14 -290 2 -284 -6 -270 C -12 -262 -20 -258 -26 -268 Z" fill={COLORS.graphite} />
      <path d="M 33 -270 l 6 6 l -6 2" fill={SKIN} />
    </g>
  </g>
);

/** Sentado abraçando os joelhos, ~190 de altura. lift 0 = cabeça baixa, 1 = olha para a frente. hands em (48,-64). */
export const SittingFigure: React.FC<{x: number; y?: number; lift: number; open: number}> = ({x, y = 0, lift, open}) => (
  <g transform={`translate(${x} ${y})`}>
    <ellipse cx={20} cy={2} rx={84} ry={9} fill={COLORS.graphite} opacity={0.2} />
    <path d="M -14 -12 L 46 -86 L 78 -6" stroke={COLORS.graphite} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M -40 -8 C -46 -60 -36 -110 -12 -132 C 4 -142 22 -136 26 -120 C 20 -80 10 -40 18 -8 Z" fill={COLORS.deep} />
    <path d={`M 8 -118 C 30 -100 ${40 + open * 6} ${-82 + open * 8} ${46 + open * 4} ${-66 + open * 4}`} stroke={COLORS.deep} strokeWidth={16} strokeLinecap="round" fill="none" />
    <path d={`M ${38 + open * 2} ${-60 + open * 2} q ${10 + open * 6} ${6} ${22 + open * 4} ${-4 - open * 4}`} stroke={SKIN} strokeWidth={10} strokeLinecap="round" fill="none" />
    <g transform={`rotate(${-34 + lift * 26} 4 -138)`}>
      <circle cx={10} cy={-158} r={27} fill={SKIN} />
      <path d="M -16 -156 C -20 -186 12 -196 32 -178 C 20 -176 8 -170 2 -158 C -4 -150 -12 -148 -16 -156 Z" fill={COLORS.graphite} />
    </g>
  </g>
);
export const SIT_HANDS: [number, number] = [56, -72];

/** Close: pessoa de perfil com a palma aberta (semente em 0,0). */
export const PalmFigure: React.FC<{lookDown: number}> = ({lookDown}) => (
  <g>
    {/* corpo e braço */}
    <path d="M -330 330 C -340 180 -330 40 -290 -40 C -270 -80 -220 -90 -190 -70 C -160 -30 -170 120 -160 330 Z" fill={COLORS.deep} />
    <path d="M -210 -40 C -200 60 -170 96 -120 70 C -90 56 -66 40 -48 22" stroke={COLORS.deep} strokeWidth={46} strokeLinecap="round" fill="none" />
    {/* palma em concha */}
    <path d="M -58 6 C -60 -6 -54 -16 -44 -16 C -38 -6 -40 2 -36 8 C -20 22 22 22 40 4 C 46 -4 52 -14 60 -14 C 66 -10 64 4 56 14 C 36 38 -18 44 -46 30 C -56 24 -64 18 -70 18 Z" fill={SKIN} stroke={COLORS.graphite} strokeWidth={2.4} strokeLinejoin="round" />
    <path d="M 12 22 C 26 20 38 12 46 2" stroke={COLORS.graphite} strokeWidth={1.4} fill="none" opacity={0.5} />
    {/* cabeça olhando para a palma */}
    <g transform={`rotate(${lookDown * 14} -255 -105)`}>
      <rect x={-268} y={-118} width={28} height={40} rx={10} fill={SKIN} />
      <circle cx={-250} cy={-160} r={52} fill={SKIN} />
      <path d="M -300 -150 C -312 -212 -240 -238 -200 -196 C -222 -194 -240 -184 -250 -166 C -262 -146 -282 -138 -300 -150 Z" fill={COLORS.graphite} />
      <path d="M -199 -156 l 10 10 l -10 4" fill={SKIN} />
    </g>
  </g>
);
