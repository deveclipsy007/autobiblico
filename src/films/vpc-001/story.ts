// VER PARA CRER · EP01 "O poder de algo quase invisível" (Mateus 13.31–32).
// Tudo ancorado na palavra falada: nenhuma cena usa segundos soltos.
import {VOICE_END, WORDS as RAW} from './data.ts';

/** Respiro de luz antes da primeira palavra (papel, faixa de luz). */
export const PRE = 1.2;
const WORDS: [string, number][] = RAW.map(([w, t]) => [w, +(t + PRE).toFixed(3)]);
const norm = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

export const T = (word: string, occ = 1): number => {
  let n = 0;
  for (const [w, t] of WORDS) if (norm(w) === norm(word) && ++n === occ) return t;
  throw new Error(`palavra não encontrada: ${word} #${occ}`);
};

/** Tempos de cada palavra de uma frase a partir de um instante (para revelar no ritmo da voz). */
export const sync = (phrase: string, from: number, lead = 0.04): number[] => {
  const want = phrase.split(/\s+/).filter(Boolean);
  let j = WORDS.findIndex(([, t]) => t >= from - 0.08);
  if (j < 0) j = WORDS.length;
  let last = from;
  return want.map((w) => {
    const k = WORDS.slice(j, j + 9).findIndex(([x]) => norm(x) === norm(w));
    if (k >= 0) { last = WORDS[j + k][1]; j = j + k + 1; } else last += 0.12;
    return Math.max(0, last - lead);
  });
};

/** Âncoras nomeadas (ocorrências conferidas: "mas", "uma", "começo", "pequeno", "grão" se repetem). */
export const A = {
  reino: T('reino'), grao: T('grão'), mostarda: T('mostarda.'), mateus: T('Mateus'), treze: T('13'),
  parece: T('Parece'), mas1: T('mas'), olha: T('olha'), mostrando: T('mostrando'), aqui: T('aqui.'),
  um: T('um', 2), grao2: T('grão', 2), pequeno: T('pequeno'), quase: T('quase'), desaparece: T('desaparece'), dedos: T('dedos.'),
  alguem: T('Alguém'), coloca: T('coloca'), terra: T('terra,'), tempo: T('tempo,'), ninguem: T('ninguém'), ve: T('vê'), acontecendo: T('acontecendo.'),
  mas2: T('mas', 2), debaixo: T('debaixo'), superficie: T('superfície,'), vida: T('vida'), comeca: T('começa'), desenvolver: T('desenvolver.'),
  primeiro: T('Primeiro,'), raiz: T('raiz.'), depois: T('Depois,'), broto: T('broto.'), ate: T('Até'), parecia: T('parecia'), insignificante: T('insignificante,'),
  cresce: T('cresce'), torna: T('torna'), abrigo: T('abrigo'), passaros: T('pássaros.'), percebe: T('Percebe?'),
  jesus2: T('Jesus', 2), reino2: T('reino', 2), ceus2: T('céus', 2), algo: T('Algo'), comecar: T('começar'), discreta: T('discreta,'),
  mas3: T('mas', 3), alcance: T('alcance'), muito: T('muito'), maior: T('maior'), comeco: T('começo'), anunciar: T('anunciar.'),
  imagem: T('imagem'), convida: T('convida'), pequenos: T('pequenos'), comecos: T('começos'), vida2: T('vida', 2),
  oracao: T('oração.'), gesto: T('gesto'), amor: T('amor.'), decisao: T('decisão'), recomecar: T('recomeçar.'),
  nem: T('Nem'), valor: T('valor'), atencao: T('atenção.'), vezes: T('vezes,'), hoje: T('hoje'), pequeno2: T('pequeno', 2), inicio: T('início'), historia: T('história.'),
  alguem2: T('alguém', 2), ama: T('ama'), dificil: T('difícil,'), compartilhe: T('compartilhe'), mensagem: T('mensagem.'),
  talvez: T('Talvez'), pessoa: T('pessoa'), lembrar: T('lembrar'), pequeno3: T('pequeno', 3), comeco3: T('começo', 3), esperanca: T('esperança.'),
  ver: T('Ver'), para: T('para', 3), crer: T('crer.'),
};

/** Seções do filme (cada uma nasce da anterior). */
export const S = {
  page: 0,
  morph: A.olha - 0.05,
  seed: A.aqui - 0.25,
  fall: A.coloca - 0.1,
  under: A.terra + 0.1,
  dive: A.mas2 - 0.1,
  roots: A.desenvolver - 0.2,
  diagram: A.depois - 0.1,
  grow: A.ate + 0.6,
  kingdom: A.jesus2 - 0.1,
  human: A.anunciar + 0.6,
  message: A.nem - 0.4,
  share: A.alguem2 - 0.5,
  brand: A.esperanca + 0.5,
};

/** v3: a narração termina em "esperança" (o "Ver para crer" falado foi cortado em 74,78 s da voz). */
export const VOICE_CUT = 74.78;
export const VOICE_OFF = Math.min(VOICE_END, VOICE_CUT) + PRE;

/** Assinatura (luz → esfera dourada). tum = a esfera aparece. */
export const BRAND = {a: A.esperanca + 0.42, dark: A.esperanca + 0.15, tum: A.esperanca + 1.0};
export const END = BRAND.tum + 4.6;
