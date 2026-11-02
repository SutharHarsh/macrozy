import type { ModelName } from '@/three/assets';

/** Illustrative macros for one typical piece or portion of each 3D ingredient. */
export const PRODUCE: Partial<Record<ModelName, { name: string; portion: string; kcal: number; p: number; c: number; f: number }>> = {
  onion: { name: 'Onion', portion: '1 medium, 110 g', kcal: 44, p: 1.2, c: 10.3, f: 0.1 },
  tomato: { name: 'Tomato', portion: '1 medium, 120 g', kcal: 22, p: 1.1, c: 4.7, f: 0.2 },
  garlic: { name: 'Garlic', portion: '3 cloves, 9 g', kcal: 13, p: 0.6, c: 3.0, f: 0 },
  potato: { name: 'Potato (aloo)', portion: '1 medium, 150 g', kcal: 116, p: 2.9, c: 26.2, f: 0.1 },
  baingan: { name: 'Baingan', portion: '1 medium, 250 g', kcal: 63, p: 2.5, c: 14.7, f: 0.5 },
  karela: { name: 'Karela', portion: '1 medium, 100 g', kcal: 17, p: 1.0, c: 3.7, f: 0.2 },
  lime: { name: 'Lime (nimbu)', portion: '1 whole, 67 g', kcal: 20, p: 0.5, c: 7.1, f: 0.1 },
  mango: { name: 'Mango', portion: '1 medium, 200 g', kcal: 120, p: 1.6, c: 30.0, f: 0.8 },
  naan: { name: 'Tandoori naan', portion: '1 piece, 90 g', kcal: 262, p: 8.7, c: 45.4, f: 5.1 },
};
