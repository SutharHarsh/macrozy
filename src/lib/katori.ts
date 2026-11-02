/* The katori mark (Round 5, concept #5): a steel disc holding three katoris,
   one per macro. Everything here is circles on paths, so the same maths drives
   the static icon, the loader, the nav hover, the preloader and page transitions. */

export const KATORI_COLORS = { carbs: '#30D158', protein: '#FF9230', fat: '#FFD600' } as const;
export type Macro = keyof typeof KATORI_COLORS;
/** carbs, protein, fat: the order of the katoris in the tin */
export const COL = [KATORI_COLORS.carbs, KATORI_COLORS.protein, KATORI_COLORS.fat];
export const STEEL = '#B4BAC1';

/** slot centre x, y and radius, in a 100×100 icon box */
const SL: [number, number, number][] = [
  [40.5, 55, 11],
  [59.5, 38.5, 8.5],
  [63, 60.5, 6],
];
const CX = (40.5 + 59.5 + 63) / 3;
const CY = (55 + 38.5 + 60.5) / 3;
const PA = SL.map(([x, y]) => (Math.atan2(y - CY, x - CX) * 180) / Math.PI);
const PD = SL.map(([x, y]) => Math.hypot(x - CX, y - CY));

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const eIn = (x: number) => x * x * x;
export const eOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const eOut4 = (x: number) => 1 - Math.pow(1 - x, 4);
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eBack = (x: number) => 1 + 2.6 * Math.pow(x - 1, 3) + 1.6 * Math.pow(x - 1, 2);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const n = (v: number) => Math.round(v * 100) / 100;
const cw = (a: number, b: number) => (((b - a) % 360) + 360) % 360;

export type Katori = { x: number; y: number; r: number; c: string };

export const circle = (x: number, y: number, r: number, fill: string) => (r <= 0.02 ? '' : `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}"/>`);

/** A full-screen black sheet with a round hole in it (even-odd fill). */
export const holePath = (w: number, h: number, x: number, y: number, r: number) =>
  `<path fill="#000" fill-rule="evenodd" d="M0 0H${n(w)}V${n(h)}H0Z${r > 0.5 ? `M${n(x - r)} ${n(y)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z` : ''}"/>`;

/** Ghumao: every katori orbits clockwise to the next slot. u = 1 is one step, u = 3 a full turn. */
export function ghumao(u: number): Katori[] {
  return [0, 1, 2].map((i) => {
    const v = (((i + u) % 3) + 3) % 3;
    const k = Math.floor(v) % 3;
    const f = v - Math.floor(v);
    const k2 = (k + 1) % 3;
    const ang = ((PA[k] + cw(PA[k], PA[k2]) * f) * Math.PI) / 180;
    const d = lerp(PD[k], PD[k2], f);
    return { x: CX + d * Math.cos(ang), y: CY + d * Math.sin(ang), r: lerp(SL[k][2], SL[k2][2], f), c: COL[i] };
  });
}

/** The icon's inner SVG (100×100 box): steel disc, then each katori with its black cut ring. */
export function iconSVG(items: Katori[] = ghumao(0), disc = true) {
  let g = disc ? circle(50, 50, 31, STEEL) : '';
  items.forEach((it) => {
    g += (disc ? circle(it.x, it.y, it.r + 2.5 * Math.min(1, it.r / 3), '#000') : '') + circle(it.x, it.y, it.r, it.c);
  });
  return g;
}

/** Looping loader: the katoris step clockwise one slot every 460 ms. */
export function loaderSVG(now: number, disc = true) {
  const tau = now / 460;
  const k = Math.floor(tau);
  const u = (k % 3) + eIO(clamp01((tau - k) / 0.72));
  return iconSVG(ghumao(u), disc);
}
