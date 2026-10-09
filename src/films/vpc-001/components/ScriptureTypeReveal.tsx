// ScriptureTypeReveal — a tinta chega ao papel: cada letra sai de um leve desfoque e se assenta,
// com uma mancha de tinta que se espalha e recolhe. Nada de cursor de terminal.
import React from 'react';
import {COLORS, FONTS} from '../../../brand/tokens';
import {D, EO, clamp} from '../lib/math';
import {BODY_FONT, PAGE, VN_FONT, Word} from './scripture';
import {charXs} from '../lib/measure';

export const ScriptureTypeReveal: React.FC<{t: number; words: Word[]; dim: (w: Word) => number; hide?: (w: Word) => boolean}> = ({t, words, dim, hide}) => (
  <>
    {words.map((w) => {
      if (hide?.(w)) return null;
      const per = w.kind === 'voice' ? 0.045 : w.kind === 'pre' ? 0.03 : 0.012;
      const chars = [...w.text];
      if (t < w.at - 0.05) return null;
      const xs = charXs(w.text, w.vn ? VN_FONT : BODY_FONT);
      const op = dim(w);
      const done = t > w.at + chars.length * per + 0.6;
      return (
        <div key={w.id} style={{position: 'absolute', left: w.x, top: w.y - PAGE.size * (w.vn ? 1.05 : 0.86), whiteSpace: 'pre', fontFamily: w.vn ? FONTS.display : FONTS.serif, fontWeight: w.vn ? 700 : 400, fontSize: w.vn ? 30 : PAGE.size, color: w.vn ? COLORS.gold : COLORS.ink, opacity: op, lineHeight: 1}}>
          {done ? w.text : chars.map((ch, i) => {
            const p = EO(D(t, w.at + i * per, 0.42));
            if (p <= 0) return null;
            const ink = clamp(1 - p * 1.6);
            return (
              <span key={i} style={{position: 'absolute', left: xs[i], top: 0, opacity: clamp(p * 1.4), filter: p < 0.97 ? `blur(${((1 - p) * 5).toFixed(2)}px)` : undefined, transform: `translateY(${((1 - p) * 6).toFixed(2)}px) scale(${(1 + (1 - p) * 0.12).toFixed(3)})`, textShadow: ink > 0.02 ? `0 0 ${(6 * ink).toFixed(1)}px rgba(43,42,40,${(0.5 * ink).toFixed(2)})` : undefined}}>{ch}</span>
            );
          })}
        </div>
      );
    })}
  </>
);
