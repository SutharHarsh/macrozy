import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Odometer } from '../Odometer';
import { CaptureScreen, GenericScreen, MealScreen, ProgressScreen, SplashScreen, TodayScreen } from '../phone/screens';
import { DAL_STEPS, RICE_STEPS, fmtG, fmtKatori, fmtKcal, mealTotal } from '@/data/meal';
import { CH, useBeat } from '@/lib/story';

export type DecideState = {
  dal: number;
  rice: number;
  logged: boolean;
  setDal: (v: number) => void;
  setRice: (v: number) => void;
  setLogged: (v: boolean) => void;
};

/** One fact in the strip at the top right: a source chip, a number, a unit, a caption. */
export type Fact = { src: string; value: ReactNode; unit?: string; caption: string };

type ChapterCopy = {
  /** headline in two lines; the second takes the chapter's tone */
  lines: [string, string];
  /** text colour for line two and the chapter dot */
  tone: string;
  /** soft background wash for the whole stage */
  wash: [number, number, number];
  body: string;
  facts: (s: DecideState) => Fact[];
  figure?: { value: string; caption: string };
  extra?: (s: DecideState) => ReactNode;
  /** phone screen used by the reduced-motion story */
  phone: (s: DecideState) => ReactNode;
};

const MODES = ['Snap', 'Say', 'Type'] as const;

function Stepper({ label, value, steps, format, onChange }: { label: string; value: number; steps: number[]; format: (v: number) => string; onChange: (v: number) => void }) {
  const i = steps.indexOf(value);
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-ctl">
        <button type="button" aria-label={`Less ${label.toLowerCase()}`} disabled={i <= 0} onClick={() => onChange(steps[Math.max(0, i - 1)])}>
          −
        </button>
        <span className="stepper-value tabular" aria-live="polite">
          {format(value)}
        </span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={i >= steps.length - 1} onClick={() => onChange(steps[Math.min(steps.length - 1, i + 1)])}>
          +
        </button>
      </div>
    </div>
  );
}

export function CaptureModes() {
  const beat = useBeat(CH.capture, 3);
  return (
    <div className="mode-chips" aria-label="Three ways to log">
      {MODES.map((m, i) => (
        <span key={m} className={`mode-chip ${i === beat ? 'is-on' : ''}`}>
          {m}
        </span>
      ))}
    </div>
  );
}

export function CapturePhone() {
  const beat = useBeat(CH.capture, 3) as 0 | 1 | 2;
  return <CaptureScreen mode={beat} />;
}

export function DecideControls({ s }: { s: DecideState }) {
  return (
    <div className="decide">
      <Stepper label="Toor dal" value={s.dal} steps={DAL_STEPS} format={fmtKatori} onChange={(v) => (s.setDal(v), s.setLogged(false))} />
      <Stepper label="Steamed rice" value={s.rice} steps={RICE_STEPS} format={(v) => `${v} g`} onChange={(v) => (s.setRice(v), s.setLogged(false))} />
      <div className="decide-actions">
        {s.logged ? (
          <p className="decide-done" role="status">
            <span className="dot-ok" aria-hidden="true" />
            Logged to Lunch.{' '}
            <button type="button" className="link-btn" onClick={() => s.setLogged(false)}>
              Undo
            </button>
          </p>
        ) : (
          <button type="button" className="btn btn-accent" onClick={() => s.setLogged(true)}>
            Log meal
          </button>
        )}
      </div>
    </div>
  );
}

const STEPS = ['Captured', 'Matched', 'Portioned', 'Logged'];
function MiniSteps({ at }: { at: number }) {
  return (
    <ol className="mini-steps" aria-label="Progress of this meal">
      {STEPS.map((s, i) => (
        <li key={s} data-state={i < at ? 'done' : i === at ? 'now' : 'todo'}>
          <i aria-hidden="true" />
          {s}
        </li>
      ))}
    </ol>
  );
}

/** Copy, facts and tones for each chapter, in CHAPTERS order. */
export const CHAPTER_COPY: ChapterCopy[] = [
  {
    lines: ['It starts in', 'your kitchen.'],
    tone: '#30d158',
    wash: [8, 36, 18],
    body: 'Onion, tomato, garlic, a squeeze of lime. Real food, cooked at home, in amounts no barcode will ever tell you.',
    facts: () => [
      { src: 'Kitchen', value: '8', unit: 'ingredients', caption: 'In one ordinary lunch' },
      { src: 'Kitchen', value: '0', unit: 'barcodes', caption: 'On any of them' },
      { src: 'Macrozy', value: '1', unit: 'photo', caption: 'Is all it takes' },
    ],
    phone: () => <TodayScreen filled={false} />,
  },
  {
    lines: ['1:12 pm.', 'Ghar ka khana.'],
    tone: '#ffd600',
    wash: [40, 34, 0],
    body: 'Dal, rice and a bowl of salad. The kind of plate most trackers turn into a guess. Follow this one lunch all the way through Macrozy.',
    facts: () => [
      { src: 'Today', value: '410', unit: 'kcal', caption: 'Breakfast, logged at 8:40' },
      { src: 'Today', value: '—', caption: 'Lunch, not logged yet' },
      { src: 'Targets', value: '2,100', unit: 'kcal', caption: 'Set from your own body' },
    ],
    phone: () => <TodayScreen filled={false} />,
  },
  {
    lines: ['Most apps see', '“curry, 1 serving.”'],
    tone: '#b4bac1',
    wash: [24, 26, 30],
    body: 'Generic databases flatten home cooking into one grey entry. A protein target can’t run on give or take.',
    facts: () => [
      { src: 'Generic app', value: '300', unit: 'kcal', caption: '“Indian curry, 1 serving”' },
      { src: 'Generic app', value: '1', unit: 'cup', caption: 'US cups, not katoris' },
      { src: 'Generic app', value: '0', unit: 'rotis', caption: 'Household units offered' },
    ],
    figure: { value: '300 kcal', caption: 'One grey entry for a whole plate' },
    phone: () => <GenericScreen />,
  },
  {
    lines: ['Snap it. Say it.', 'Type it.'],
    tone: '#ff9230',
    wash: [44, 24, 6],
    body: 'Photograph the plate, say “dal chawal and a little salad”, or type it the way you’d text a friend. All three land in the same place.',
    facts: () => [
      { src: 'Camera', value: '1', unit: 'photo', caption: 'A plate or a full thali' },
      { src: 'Mic', value: '5', unit: 'words', caption: 'Transcribed on your phone' },
      { src: 'Search', value: '3', unit: 'words', caption: '“dal chawal salad”' },
    ],
    extra: () => (
      <>
        <CaptureModes />
        <MiniSteps at={0} />
      </>
    ),
    phone: () => <CapturePhone />,
  },
  {
    lines: ['One plate,', 'three foods.'],
    tone: '#30d158',
    wash: [8, 38, 20],
    body: 'Macrozy separates the plate into its parts and matches each one to Indian food data. It never guesses how much you ate from a photo. That part is yours.',
    facts: () => [
      { src: 'AI', value: '3', unit: 'items', caption: 'Dal, rice, salad' },
      { src: 'AI', value: '0', unit: 'guesses', caption: 'Portions taken from the photo' },
      { src: 'Food data', value: '3', unit: 'matches', caption: 'Tagged AI until you confirm' },
    ],
    extra: () => <MiniSteps at={1} />,
    phone: () => <MealScreen analyzing />,
  },
  {
    lines: ['You set', 'the katori.'],
    tone: '#ff9230',
    wash: [46, 22, 6],
    body: 'Adjust each portion in the units you actually eat in. Every number updates before anything is logged.',
    facts: (s) => {
      const t = mealTotal(s.dal, s.rice);
      return [
        { src: 'You', value: <Odometer value={fmtKcal(t.kcal)} />, unit: 'kcal', caption: 'This plate' },
        { src: 'You', value: <Odometer value={fmtG(t.p)} />, unit: 'g', caption: 'Protein' },
        { src: 'You', value: <Odometer value={fmtG(t.c)} />, unit: 'g', caption: 'Carbs' },
      ];
    },
    extra: (s) => (
      <>
        <MiniSteps at={s.logged ? 4 : 2} />
        <DecideControls s={s} />
      </>
    ),
    phone: (s) => <MealScreen dal={s.dal} rice={s.rice} logged={s.logged} />,
  },
  {
    lines: ['Every meal', 'closes the ring.'],
    tone: '#ffd600',
    wash: [40, 33, 0],
    body: 'Lunch drops into its slot and the plate becomes numbers: calories, protein, carbs, fat and fiber, each against a target worked out from your own body.',
    facts: () => [
      { src: 'Today', value: '1,640', unit: '/ 2,100', caption: 'Calories' },
      { src: 'Today', value: '112', unit: '/ 140 g', caption: 'Protein' },
      { src: 'Today', value: '4', unit: 'of 4', caption: 'Meals logged' },
    ],
    figure: { value: '78%', caption: 'of today’s calories, from four honest logs' },
    phone: () => <TodayScreen filled />,
  },
  {
    lines: ['5 of 7 is', 'a good week.'],
    tone: '#ff9230',
    wash: [44, 24, 8],
    body: 'Streaks run weekly, with a rest day built in. Weight is a trend line, not a verdict.',
    facts: () => [
      { src: 'Streak', value: '5', unit: '/ 7', caption: 'Days logged this week' },
      { src: 'Progress', value: '79.2', unit: 'kg', caption: 'Down 4.8 since July' },
      { src: 'Progress', value: '23 Dec', caption: 'Goal date, on pace' },
    ],
    figure: { value: '−4.8 kg', caption: 'Twelve weeks, one honest line' },
    phone: () => <ProgressScreen />,
  },
  {
    lines: ['Your next meal', 'takes 15 seconds.'],
    tone: '#ff9230',
    wash: [42, 22, 6],
    body: 'Every Pro feature, free for 14 days. No card needed. Pay later with UPI if it earns its place.',
    facts: () => [
      { src: 'Trial', value: '14', unit: 'days', caption: 'Every Pro feature' },
      { src: 'Trial', value: '0', unit: 'cards', caption: 'Needed to start' },
      { src: 'Pro', value: '₹166', unit: '/ month', caption: 'Billed yearly' },
    ],
    extra: () => (
      <div className="story-cta">
        <Link className="btn btn-primary" to="/download">
          Start free trial
        </Link>
        <Link className="btn btn-ghost" to="/features">
          See every feature
        </Link>
      </div>
    ),
    phone: () => <SplashScreen />,
  },
];
