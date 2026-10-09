// Formato da peça: 9:16 e 16:9 com recomposição real (não é recorte do mesmo quadro).
import React from 'react';

export type Fmt = {W: number; H: number; v: boolean; cx: number; cy: number; /** escala tipográfica base */ k: number};
export const makeFmt = (W: number, H: number): Fmt => ({W, H, v: H > W, cx: W / 2, cy: H / 2, k: H > W ? 1 : 0.92});
export const FmtCtx = React.createContext<Fmt>(makeFmt(1080, 1920));
export const useFmt = () => React.useContext(FmtCtx);
/** Zoom que encaixa uma caixa do mundo (w × h) no quadro. */
export const fit = (f: Fmt, w: number, h: number) => Math.min(f.W / w, f.H / h);
/** Escolhe valor por formato. */
export const pick = <T,>(f: Fmt, vertical: T, horizontal: T): T => (f.v ? vertical : horizontal);
