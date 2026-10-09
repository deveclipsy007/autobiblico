// Medição tipográfica com as mesmas fontes do render (para layouts letra a letra e reorganização de frases).
const cache = new Map<string, number>();
let ctx: CanvasRenderingContext2D | null = null;
export const measure = (text: string, font: string, tracking = 0): number => {
  const key = `${font}|${tracking}|${text}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  ctx!.font = font;
  const w = ctx!.measureText(text).width + Math.max(0, text.length - 1) * tracking;
  cache.set(key, w);
  return w;
};
/** Posições x de cada caractere (origem no início da linha). */
export const charXs = (text: string, font: string, tracking = 0): number[] => {
  const xs: number[] = [];
  for (let i = 0; i < text.length; i++) xs.push(measure(text.slice(0, i), font, 0) + i * tracking);
  return xs;
};
