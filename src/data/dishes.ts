/** Illustrative per-100 g values for the explorer. Final data is nutritionist-reviewed in the app. */
export type Unit = { label: string; grams: number };
export type Dish = {
  id: string;
  name: string;
  kind: 'Breakfast' | 'Mains' | 'Breads' | 'Rice' | 'Snacks' | 'Drinks' | 'Protein';
  per100: { kcal: number; p: number; c: number; f: number };
  units: Unit[];
};

const katori = (g = 150): Unit => ({ label: '1 katori', grams: g });

export const DISHES: Dish[] = [
  { id: 'poha', name: 'Poha', kind: 'Breakfast', per100: { kcal: 158, p: 3.1, c: 26.4, f: 4.6 }, units: [{ label: '1 plate', grams: 180 }, katori(120), { label: '100 g', grams: 100 }] },
  { id: 'upma', name: 'Upma', kind: 'Breakfast', per100: { kcal: 165, p: 4.2, c: 24.8, f: 5.4 }, units: [{ label: '1 plate', grams: 200 }, katori(130), { label: '100 g', grams: 100 }] },
  { id: 'idli', name: 'Idli', kind: 'Breakfast', per100: { kcal: 146, p: 4.5, c: 30.2, f: 0.6 }, units: [{ label: '1 idli', grams: 40 }, { label: '3 idli', grams: 120 }, { label: '100 g', grams: 100 }] },
  { id: 'dosa', name: 'Plain dosa', kind: 'Breakfast', per100: { kcal: 168, p: 3.9, c: 27.5, f: 4.7 }, units: [{ label: '1 dosa', grams: 90 }, { label: '2 dosa', grams: 180 }, { label: '100 g', grams: 100 }] },
  { id: 'paratha', name: 'Aloo paratha', kind: 'Breads', per100: { kcal: 260, p: 5.4, c: 36.0, f: 10.6 }, units: [{ label: '1 paratha', grams: 110 }, { label: '2 paratha', grams: 220 }, { label: '100 g', grams: 100 }] },
  { id: 'roti', name: 'Roti (whole wheat)', kind: 'Breads', per100: { kcal: 264, p: 8.7, c: 51.0, f: 3.4 }, units: [{ label: '1 roti', grams: 40 }, { label: '3 roti', grams: 120 }, { label: '100 g', grams: 100 }] },
  { id: 'dal', name: 'Toor dal', kind: 'Mains', per100: { kcal: 155, p: 9.1, c: 24.0, f: 2.0 }, units: [katori(), { label: '½ katori', grams: 75 }, { label: '100 g', grams: 100 }] },
  { id: 'rajma', name: 'Rajma', kind: 'Mains', per100: { kcal: 140, p: 6.8, c: 19.4, f: 3.9 }, units: [katori(), { label: '2 katori', grams: 300 }, { label: '100 g', grams: 100 }] },
  { id: 'chole', name: 'Chole', kind: 'Mains', per100: { kcal: 168, p: 7.4, c: 21.6, f: 5.8 }, units: [katori(), { label: '2 katori', grams: 300 }, { label: '100 g', grams: 100 }] },
  { id: 'paneer', name: 'Paneer bhurji', kind: 'Protein', per100: { kcal: 245, p: 14.2, c: 6.0, f: 18.3 }, units: [katori(120), { label: '½ katori', grams: 60 }, { label: '100 g', grams: 100 }] },
  { id: 'egg', name: 'Egg bhurji', kind: 'Protein', per100: { kcal: 178, p: 11.6, c: 3.4, f: 13.2 }, units: [{ label: '2 eggs', grams: 120 }, { label: '3 eggs', grams: 180 }, { label: '100 g', grams: 100 }] },
  { id: 'chicken', name: 'Chicken curry', kind: 'Protein', per100: { kcal: 175, p: 15.8, c: 4.2, f: 10.6 }, units: [katori(), { label: '2 katori', grams: 300 }, { label: '100 g', grams: 100 }] },
  { id: 'rice', name: 'Steamed rice', kind: 'Rice', per100: { kcal: 130, p: 2.7, c: 28.0, f: 0.3 }, units: [katori(), { label: '1 plate', grams: 250 }, { label: '100 g', grams: 100 }] },
  { id: 'khichdi', name: 'Khichdi', kind: 'Rice', per100: { kcal: 120, p: 4.4, c: 20.8, f: 2.3 }, units: [katori(200), { label: '1 plate', grams: 300 }, { label: '400 g', grams: 400 }] },
  { id: 'biryani', name: 'Veg biryani', kind: 'Rice', per100: { kcal: 165, p: 3.6, c: 25.2, f: 5.6 }, units: [{ label: '1 plate', grams: 300 }, katori(), { label: '100 g', grams: 100 }] },
  { id: 'samosa', name: 'Samosa', kind: 'Snacks', per100: { kcal: 308, p: 5.2, c: 32.4, f: 17.6 }, units: [{ label: '1 piece', grams: 60 }, { label: '2 pieces', grams: 120 }, { label: '100 g', grams: 100 }] },
  { id: 'dhokla', name: 'Dhokla', kind: 'Snacks', per100: { kcal: 160, p: 6.4, c: 25.2, f: 3.6 }, units: [{ label: '2 pieces', grams: 80 }, { label: '4 pieces', grams: 160 }, { label: '100 g', grams: 100 }] },
  { id: 'chai', name: 'Masala chai', kind: 'Drinks', per100: { kcal: 62, p: 1.8, c: 8.6, f: 2.2 }, units: [{ label: '1 cup', grams: 150 }, { label: '1 glass', grams: 250 }, { label: '100 ml', grams: 100 }] },
  { id: 'lassi', name: 'Sweet lassi', kind: 'Drinks', per100: { kcal: 98, p: 3.2, c: 15.2, f: 2.8 }, units: [{ label: '1 glass', grams: 250 }, { label: '½ glass', grams: 125 }, { label: '100 ml', grams: 100 }] },
  { id: 'curd', name: 'Curd (dahi)', kind: 'Protein', per100: { kcal: 61, p: 3.5, c: 4.7, f: 3.3 }, units: [katori(), { label: '½ katori', grams: 75 }, { label: '100 g', grams: 100 }] },
];

export const KINDS = ['All', 'Breakfast', 'Mains', 'Protein', 'Rice', 'Breads', 'Snacks', 'Drinks'] as const;
