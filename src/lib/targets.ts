/** Mirror of the app's MacroCalculator (lib/shared/utils/macro_calculator.dart). */
export type Sex = 'male' | 'female';
export type Goal = 'lose_fat' | 'recomp' | 'maintain' | 'build_muscle';
export type Activity = 'sedentary' | 'lightly_active' | 'moderately_active' | 'active' | 'very_active' | 'extra';

export const ACTIVITY: { id: Activity; label: string; mult: number }[] = [
  { id: 'sedentary', label: 'Desk job, little exercise', mult: 1.2 },
  { id: 'lightly_active', label: 'Light exercise 1–3 days', mult: 1.375 },
  { id: 'moderately_active', label: 'Moderate, 3–4 days', mult: 1.465 },
  { id: 'active', label: 'Training 4–5 days', mult: 1.55 },
  { id: 'very_active', label: 'Hard training 6–7 days', mult: 1.725 },
  { id: 'extra', label: 'Athlete or physical job', mult: 1.9 },
];

export const GOALS: { id: Goal; label: string; adj: number }[] = [
  { id: 'lose_fat', label: 'Lose fat', adj: -550 },
  { id: 'recomp', label: 'Recomp', adj: -275 },
  { id: 'maintain', label: 'Maintain', adj: 0 },
  { id: 'build_muscle', label: 'Build muscle', adj: 550 },
];

export function calculate(input: { weightKg: number; heightCm: number; age: number; sex: Sex; goal: Goal; activity: Activity }) {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  const bmr = input.sex === 'male' ? base + 5 : base - 161;
  const mult = ACTIVITY.find((a) => a.id === input.activity)!.mult;
  const tdee = bmr * mult;
  const adj = GOALS.find((g) => g.id === input.goal)!.adj;
  const raw = Math.round(tdee + adj);
  const sexFloor = input.sex === 'male' ? 1500 : 1200;
  const target = Math.round(Math.max(raw, tdee * 0.75, sexFloor));
  const protein = Math.round((target * 0.25) / 4);
  const carbs = Math.round((target * 0.5) / 4);
  const fat = Math.round((target * 0.25) / 9);
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    adj,
    calories: protein * 4 + carbs * 4 + fat * 9,
    protein,
    carbs,
    fat,
    floored: target > raw,
    bmi: input.weightKg / Math.pow(input.heightCm / 100, 2),
  };
}
