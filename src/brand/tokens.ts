// VER PARA CRER · tokens de marca (Minimalismo Narrativo Vivo). Fontes locais (licença OFL) carregadas antes de medir texto.
import {staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

export const COLORS = {
  cream: '#F5F0E7',
  cream2: '#EDE5D6',
  paper: '#F2EBDD',
  graphite: '#24272C',
  ink: '#2B2A28',
  gold: '#B27B49',
  goldLight: '#D9A86F',
  sage: '#819B87',
  sageDark: '#5F7766',
  deep: '#202A3A',
  night: '#141A25',
  soil0: '#4C4139',
  soil1: '#5B4C3F',
  soil2: '#6C5B4A',
  soil3: '#3A3431',
} as const;

export const FONTS = {
  serif: '"Cormorant Garamond", "Fraunces", Georgia, serif',
  display: '"Manrope", system-ui, sans-serif',
  body: '"DM Sans", system-ui, sans-serif',
} as const;

const FACES: {family: string; file: string; weight: string; style?: string}[] = [
  {family: 'Fraunces', file: 'fraunces-latin-400-normal', weight: '400'},
  {family: 'Fraunces', file: 'fraunces-latin-600-normal', weight: '600'},
  {family: 'Fraunces', file: 'fraunces-latin-400-italic', weight: '400', style: 'italic'},
  {family: 'Fraunces', file: 'fraunces-latin-300-italic', weight: '300', style: 'italic'},
  ...(['400', '500', '600', '700'] as const).map((w) => ({family: 'Cormorant Garamond', file: `cormorant-garamond-latin-${w}-normal`, weight: w})),
  ...(['400', '500', '600'] as const).map((w) => ({family: 'Cormorant Garamond', file: `cormorant-garamond-latin-${w}-italic`, weight: w, style: 'italic'})),
  {family: 'Manrope', file: 'manrope-latin-500-normal', weight: '500'},
  {family: 'Manrope', file: 'manrope-latin-600-normal', weight: '600'},
  {family: 'Manrope', file: 'manrope-latin-700-normal', weight: '700'},
  {family: 'Manrope', file: 'manrope-latin-800-normal', weight: '800'},
  {family: 'DM Sans', file: 'dm-sans-latin-400-normal', weight: '400'},
  {family: 'DM Sans', file: 'dm-sans-latin-500-normal', weight: '500'},
  {family: 'DM Sans', file: 'dm-sans-latin-600-normal', weight: '600'},
];

export const fontsReady: Promise<unknown> = Promise.all(
  FACES.map((f) => loadFont({family: f.family, url: staticFile(`fonts/${f.file}.woff2`), weight: f.weight, style: f.style ?? 'normal'})),
);

/** Ouro da marca em gradiente (texto e fios). deep = sobre creme · light = sobre escuro. */
export const GOLD = {
  deep: 'linear-gradient(176deg, #E8C78C 0%, #C99556 34%, #A46C33 64%, #7A4A22 100%)',
  light: 'linear-gradient(176deg, #FFF2D6 0%, #F1D196 38%, #D7A563 72%, #B27B49 100%)',
  stops: {deep: ['#E8C78C', '#C99556', '#A46C33', '#7A4A22'], light: ['#FFF2D6', '#F1D196', '#D7A563', '#B27B49']},
} as const;
export const goldText = (kind: 'deep' | 'light' = 'deep') => ({backgroundImage: GOLD[kind], WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent'} as const);
