// Mateus 13.31–32 (Almeida Revista e Atualizada) diagramado em linhas fixas, palavra a palavra.
// A frase lida pela narração aparece no tempo exato da voz; o restante é impresso em cascata.
import {FONTS} from '../../../brand/tokens';
import {measure} from '../lib/measure';
import {A, sync} from '../story';

export const PAGE = {w: 1500, h: 2100, left: 150, size: 62, lead: 104, top: 760};
export const BODY_FONT = `400 ${PAGE.size}px ${FONTS.serif}`;
export const VN_FONT = `700 30px ${FONTS.display}`;
export const REFERENCE = 'Mateus 13.31–32 (ARA)';

const LINES: string[][] = [
  ['³¹', 'Outra', 'parábola', 'lhes', 'propôs,', 'dizendo:'],
  ['O', 'reino', 'dos', 'céus', 'é', 'semelhante', 'a', 'um'],
  ['grão', 'de', 'mostarda,', 'que', 'um', 'homem', 'tomou'],
  ['e', 'plantou', 'no', 'seu', 'campo;', '³²', 'o', 'qual', 'é,'],
  ['na', 'verdade,', 'a', 'menor', 'de', 'todas', 'as', 'sementes,'],
  ['e,', 'crescida,', 'é', 'maior', 'do', 'que', 'as', 'hortaliças,'],
  ['e', 'se', 'faz', 'árvore,', 'de', 'modo', 'que', 'as', 'aves'],
  ['do', 'céu', 'vêm', 'aninhar-se', 'nos', 'seus', 'ramos.'],
];

export type Word = {text: string; x: number; y: number; w: number; line: number; vn: boolean; at: number; kind: 'pre' | 'voice' | 'rest'; id: number};

export const layoutScripture = (): Word[] => {
  const out: Word[] = [];
  const space = measure(' ', BODY_FONT);
  const voiceTimes = sync('O reino dos céus é semelhante a um grão de mostarda', A.reino - 0.35);
  let vi = 0, id = 0, restK = 0;
  LINES.forEach((ln, li) => {
    let x = PAGE.left;
    const y = PAGE.top + li * PAGE.lead;
    ln.forEach((text, wi) => {
      const vn = text.startsWith('³');
      const w = vn ? measure('00', VN_FONT) + 4 : measure(text, BODY_FONT);
      let kind: Word['kind'] = 'rest', at = 0;
      if (li === 0) { kind = 'pre'; at = 0.55 + wi * 0.1; }
      else if ((li === 1) || (li === 2 && wi < 3)) { kind = 'voice'; at = voiceTimes[vi++] - 0.06; }
      else { at = A.mostarda + 0.45 + restK++ * 0.034; }
      out.push({text, x, y, w, line: li, vn, at, kind, id: id++});
      x += w + space * (vn ? 0.5 : 1);
      void wi;
    });
  });
  return out;
};
