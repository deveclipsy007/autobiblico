// Curvas e utilitários determinísticos: tudo é função contínua de t (segundos).
import {Easing} from 'remotion';

export const EO = Easing.bezier(0.16, 1, 0.3, 1);
export const EIO = Easing.bezier(0.65, 0, 0.35, 1);
export const EIN = Easing.bezier(0.55, 0, 0.75, 0.2);
export const ESM = Easing.bezier(0.4, 0, 0.2, 1);
export const EBACK = Easing.bezier(0.34, 1.56, 0.64, 1);
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** Progresso 0..1 de um trecho que começa em a e dura d. */
export const D = (t: number, a: number, d: number) => clamp((t - a) / d);
/** Janela de presença: entra em a (fi s), sai em b (fo s). Saída mais rápida que a entrada. */
export const win = (t: number, a: number, b: number, fi = 0.5, fo = 0.35) => EO(D(t, a, fi)) * (1 - EIN(D(t, b, fo)));
export const rnd = (i: number, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
export const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mixHex = (a: string, b: string, u: number) => { const pa = hexRgb(a), pb = hexRgb(b); return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(u)))).join(',')})`; };
export const rgba = (h: string, a: number) => `rgba(${hexRgb(h).join(',')},${clamp(a).toFixed(3)})`;
/** Mola amortecida analítica (sem estado): 0 → 1 com overshoot controlado. */
export const springT = (t: number, a: number, {damping = 14, stiffness = 140, mass = 1} = {}) => {
  const x = t - a;
  if (x <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass), z = damping / (2 * Math.sqrt(stiffness * mass));
  if (z >= 1) return 1 - (1 + w0 * x) * Math.exp(-w0 * x);
  const wd = w0 * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w0 * x) * (Math.cos(wd * x) + (z * w0 / wd) * Math.sin(wd * x));
};
export const smoothstep = (a: number, b: number, x: number) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
export type Pt = [number, number];
export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** Ponto numa Bézier quadrática. */
export const qbez = (p0: Pt, p1: Pt, p2: Pt, u: number): Pt => [(1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]];
export const cbez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, u: number): Pt => {
  const v = 1 - u;
  return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]];
};
/** Polilinha → caminho suave (Catmull-Rom). */
export const smoothPath = (p: Pt[]) => {
  if (p.length < 2) return '';
  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)];
    d += ` C${(b[0] + (c[0] - a[0]) / 6).toFixed(1)} ${(b[1] + (c[1] - a[1]) / 6).toFixed(1)} ${(c[0] - (e[0] - b[0]) / 6).toFixed(1)} ${(c[1] - (e[1] - b[1]) / 6).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
  }
  return d;
};
/** Reamostra uma polilinha em n pontos igualmente espaçados (para morph entre formas). */
export const resample = (p: Pt[], n: number): Pt[] => {
  const acc = [0];
  for (let i = 1; i < p.length; i++) acc.push(acc[i - 1] + dist(p[i - 1], p[i]));
  const L = acc[acc.length - 1] || 1, out: Pt[] = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const want = (k / (n - 1)) * L;
    while (j < acc.length - 1 && acc[j] < want) j++;
    const a = acc[j - 1], b = acc[j], f = b > a ? (want - a) / (b - a) : 0;
    out.push([lerp(p[j - 1][0], p[j][0], f), lerp(p[j - 1][1], p[j][1], f)]);
  }
  return out;
};
export const polyLen = (p: Pt[]) => p.reduce((s, q, i) => (i ? s + dist(p[i - 1], q) : 0), 0);
/** Trecho inicial [0, u] de uma polilinha. */
export const polyHead = (p: Pt[], u: number): Pt[] => {
  if (u <= 0) return [p[0]];
  if (u >= 1) return p;
  const L = polyLen(p) * u, out: Pt[] = [p[0]];
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const l = dist(p[i - 1], p[i]);
    if (acc + l >= L) { const f = (L - acc) / l; out.push([lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)]); break; }
    out.push(p[i]); acc += l;
  }
  return out;
};
