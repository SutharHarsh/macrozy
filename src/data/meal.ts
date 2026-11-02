/** The one example lunch carried through the home story. Values are illustrative. */
export type Macros = { kcal: number; p: number; c: number; f: number };

export const DAL_PER_KATORI: Macros = { kcal: 232, p: 13.6, c: 36.0, f: 3.0 };
export const RICE_PER_100G: Macros = { kcal: 130, p: 2.733, c: 28.0, f: 0.267 };
export const SALAD: Macros = { kcal: 13, p: 0.5, c: 2.9, f: 0.1 };

export const DAL_STEPS = [0.5, 1, 1.5, 2, 2.5, 3];
export const RICE_STEPS = [50, 100, 150, 200, 250, 300];

const scale = (m: Macros, k: number): Macros => ({ kcal: m.kcal * k, p: m.p * k, c: m.c * k, f: m.f * k });
const add = (...ms: Macros[]): Macros =>
  ms.reduce((a, b) => ({ kcal: a.kcal + b.kcal, p: a.p + b.p, c: a.c + b.c, f: a.f + b.f }), { kcal: 0, p: 0, c: 0, f: 0 });

export function mealItems(dalKatori: number, riceGrams: number) {
  return [
    { id: 'dal', name: 'Toor dal', qty: fmtKatori(dalKatori), m: scale(DAL_PER_KATORI, dalKatori) },
    { id: 'rice', name: 'Steamed rice', qty: `${riceGrams} g`, m: scale(RICE_PER_100G, riceGrams / 100) },
    { id: 'salad', name: 'Kachumber salad', qty: '1 bowl', m: SALAD },
  ];
}

export function mealTotal(dalKatori: number, riceGrams: number): Macros {
  return add(...mealItems(dalKatori, riceGrams).map((i) => i.m));
}

export const fmtKatori = (k: number) => `${k % 1 === 0 ? k : k.toFixed(1)} katori`;
export const fmtKcal = (n: number) => Math.round(n).toLocaleString('en-IN');
export const fmtG = (n: number) => n.toFixed(1);

/** The day this lunch lands in. */
export const DAY = {
  target: 2100,
  breakfast: { name: 'Poha + chai', kcal: 410 },
  snack: { name: 'Banana + whey', kcal: 290 },
  dinner: { name: 'Paneer bhurji + 2 roti', kcal: 500 },
  protein: { now: 112, target: 140 },
  carbs: { now: 189, target: 262 },
  fat: { now: 36, target: 58 },
  fiber: { now: 17, target: 30 },
};
