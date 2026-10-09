// Velocidade da câmera na tela (px por quadro): decide quando ligar o motion blur de obturador.
import {Fmt} from './format';
import {Cam} from '../components/CinematicCamera';
import {W_T, seedWorld, worldCam, worldPitch} from '../components/WorldScene';
import {HUMAN_T, humanCam} from '../components/HumanReflectionScene';
import {PAGE_T} from '../components/BiblePageScene';
import {BRAND_T, brandPose} from '../components/BrandSignature';

const camSpeed = (a: Cam, b: Cam, f: Fmt) => {
  const z = (a.z + b.z) / 2, diag = Math.hypot(f.W, f.H) / 2;
  return Math.hypot((b.x - a.x) * z, (b.y - a.y) * z) + Math.abs(Math.log(b.z / a.z)) * diag + (Math.abs(b.r - a.r) * Math.PI / 180) * diag;
};

export const motionAt = (t: number, f: Fmt, fps: number): number => {
  const dt = 1 / fps, t0 = t - dt;
  let s = 0;
  if (t > PAGE_T.irisA && t < BRAND_T.worldOff && !(t > HUMAN_T.a + 0.85 && t < HUMAN_T.b - 0.09)) {
    s = Math.max(s, camSpeed(worldCam(t0, f), worldCam(t, f), f) + Math.abs(worldPitch(t) - worldPitch(t0)) * 18);
    if (t > W_T.release && t < W_T.land) { const a = seedWorld(t0).p, b = seedWorld(t).p; s = Math.max(s, Math.hypot(b[0] - a[0], b[1] - a[1]) * worldCam(t, f).z * 0.5); }
  }
  if (t > HUMAN_T.a && t < HUMAN_T.b) s = Math.max(s, camSpeed(humanCam(t0, f), humanCam(t, f), f));
  if (t > BRAND_T.tum + dt) { const a = brandPose(t0, f), b = brandPose(t, f); s = Math.max(s, Math.abs(Math.log(b.sc / a.sc)) * b.r + (Math.abs(b.rot - a.rot) * Math.PI / 180) * b.r * 0.6); }
  return s;
};
