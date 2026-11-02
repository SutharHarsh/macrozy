export const FAQ = [
  {
    q: 'Does the AI guess how much I ate from a photo?',
    a: 'No. A photo tells Macrozy what is on the plate: rice, dal, sabzi, roti. It never estimates quantity from how big things look, because that is where photo trackers go wrong. You set each portion in katori, roti, pieces or grams, and the numbers update before you log.',
    fig: 'split',
  },
  {
    q: 'Will it understand Indian home food?',
    a: 'That is the whole point. The database starts with raw ingredients, common home dishes and packaged foods, and is reviewed by a nutritionist before items go live. Composite dishes like rajma chawal or khichdi are broken into their ingredients, so the macros follow what is actually in them.',
    fig: 'katori',
  },
  {
    q: 'What happens if I miss a day?',
    a: 'Nothing dramatic. Streaks are weekly, not daily-or-die. A day counts once you log 200 kcal or more, and one rest day a week is built in. Five out of seven is a good week.',
    fig: 'week',
  },
  {
    q: 'How are my targets calculated?',
    a: 'From your age, sex, height, weight, activity and goal, using the Mifflin-St Jeor equation. Macrozy then splits calories 25% protein, 50% carbs and 25% fat, and never sets a target below a safe floor. You can see the maths on the How it works page.',
    fig: 'ring',
  },
  {
    q: 'Do you show BMI categories?',
    a: 'No. Macrozy shows your BMI as a number next to the neutral reference range of 18.5 to 24.9, with a note on what BMI can’t tell you. It never labels you.',
    fig: 'bmi',
  },
  {
    q: 'What does the free trial include, and how do I pay?',
    a: 'Every Pro feature for 14 days, starting when you sign up. No card is needed to start, and you get a reminder three days before it ends. After that, Pro is ₹299 a month or ₹1,999 a year, payable by UPI, card or netbanking.',
    fig: 'trial',
  },
] as const;

export type FaqFig = (typeof FAQ)[number]['fig'];

export const PLANS = {
  free: [
    'Meal logging with all four macros',
    'Snap, say and type',
    'Full Indian food database',
    'Weight logging and 30-day trend',
    '7-day history',
  ],
  pro: [
    'Everything in Free',
    '7 micronutrients',
    'Progress photos and side-by-side compare',
    '90-day history and calorie balance',
    'Protein adherence heatmap',
    '25 badges and CSV export',
  ],
};

export const COMPARE: [string, boolean, boolean][] = [
  ['Meal logging (all four macros)', true, true],
  ['Snap, say and type', true, true],
  ['Full food database', true, true],
  ['Weight logging', true, true],
  ['Macro rings on Today', true, true],
  ['History', true, true],
  ['Weight trend chart', true, true],
  ['Micronutrient tracking (7 nutrients)', false, true],
  ['Progress photos and compare', false, true],
  ['Calorie balance chart', false, true],
  ['Macro adherence heatmap', false, true],
  ['Achievement badges', false, true],
  ['CSV data export', false, true],
  ['Priority support', false, true],
];
