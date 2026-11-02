import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Phone } from '@/components/phone/Phone';
import { CaptureScreen, HealthScreen, MealScreen, MicrosScreen, ProgressScreen, UsualsScreen } from '@/components/phone/screens';
import { Reveal } from '@/components/Reveal';
import { FinalCta } from './Home';

type Feature = { id: string; tag: string; title: string; body: string; points: string[]; screen: ReactNode };

const FEATURES: Feature[] = [
  {
    id: 'snap',
    tag: 'Snap',
    title: 'A photo of the plate. Every part of it.',
    body: 'Point the camera at a single dish or a full thali. Macrozy names each component and matches it to Indian food data.',
    points: ['Camera or gallery', 'Thalis split into separate items', 'No portion guessing from photos'],
    screen: <CaptureScreen mode={0} />,
  },
  {
    id: 'say',
    tag: 'Say',
    title: 'Talk like you would to a friend.',
    body: '“Poha and chai.” “400 grams khichdi.” Speech is transcribed on your phone and runs through the same search as typing.',
    points: ['On-device speech recognition', 'Quantities understood in context', 'Works on Android and iPhone'],
    screen: <CaptureScreen mode={1} />,
  },
  {
    id: 'search',
    tag: 'Type',
    title: 'Composite dishes, broken down.',
    body: 'Rajma chawal, khichdi, dal tadka. Dishes are decomposed into their ingredients, so the macros follow what is actually in the bowl.',
    points: ['Natural language search', 'Recipes decomposed into ingredients', 'Packaged foods included'],
    screen: <CaptureScreen mode={2} />,
  },
  {
    id: 'portions',
    tag: 'Portions',
    title: 'Katori, roti, glass, piece.',
    body: 'Set every item in the unit you eat in. Grams, ml and ounces are there too, for the days you weigh.',
    points: ['Household Indian measures', 'Live macro totals', 'AI items always marked'],
    screen: <MealScreen />,
  },
  {
    id: 'usuals',
    tag: 'Usuals',
    title: 'Same breakfast? One tap.',
    body: 'Recents and Usuals keep your repeat meals ready with their last portions, so most logs take a few seconds.',
    points: ['Recents tab', 'Saved usuals', 'Quick add your own foods'],
    screen: <UsualsScreen />,
  },
  {
    id: 'progress',
    tag: 'Progress',
    title: 'A trend line, not a verdict.',
    body: 'Weight over 7 days to a year, calorie balance, protein adherence and a projected goal date that moves with your actual pace.',
    points: ['Weight trend and goal pace', 'Calorie balance (Pro)', 'Progress photo compare (Pro)'],
    screen: <ProgressScreen />,
  },
  {
    id: 'micros',
    tag: 'Micros',
    title: 'What the macros don’t tell you.',
    body: 'Fiber, iron, calcium, potassium, sodium and more, worked out from the meals you already log.',
    points: ['7 micronutrients (Pro)', 'Daily and weekly views', 'No extra logging'],
    screen: <MicrosScreen />,
  },
  {
    id: 'health',
    tag: 'Health',
    title: 'Steps and burn, read-only.',
    body: 'Connect Health Connect or Apple Health to see steps and active calories next to what you ate. Macrozy never writes back.',
    points: ['Asked only when you tap Connect', 'Steps and calories, nothing else', 'Per-metric permissions'],
    screen: <HealthScreen />,
  },
];

export function Features() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Features</span>
          <h1 className="display">
            Everything a serious
            <br />
            tracker needs. Nothing else.
          </h1>
          <p className="lede">Three ways in, Indian portions, and progress views that tell the truth gently. Here is each part, as it looks in the app.</p>
          <nav className="feature-jump" aria-label="Jump to a feature">
            {FEATURES.map((f) => (
              <a key={f.id} href={`#${f.id}`}>
                {f.tag}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="feature-scroller" aria-label="Feature walkthrough">
        <div className="wrap feature-grid">
          <div className="feature-texts">
            {FEATURES.map((f, i) => (
              <article
                key={f.id}
                id={f.id}
                data-i={i}
                ref={(el) => (refs.current[i] = el)}
                className={`feature-block ${active === i ? 'is-active' : ''}`}
              >
                <span className="feature-tag">
                  <span className="tabular">{String(i + 1).padStart(2, '0')}</span> {f.tag}
                </span>
                <h2 className="title-sm">{f.title}</h2>
                <p className="lede">{f.body}</p>
                <ul className="ticks">
                  {f.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <Phone className="feature-phone-inline">{f.screen}</Phone>
              </article>
            ))}
          </div>
          <div className="feature-sticky" aria-hidden="true">
            <Phone>
              {FEATURES.map((f, i) => (
                <div key={f.id} className={`feature-screen ${active === i ? 'is-on' : ''}`}>
                  {f.screen}
                </div>
              ))}
            </Phone>
            <div className="feature-dots">
              {FEATURES.map((f, i) => (
                <span key={f.id} className={active === i ? 'is-on' : ''} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="eyebrow">Also in the box</span>
            <h2 className="title">Small things, done properly.</h2>
          </Reveal>
          <div className="mini-grid">
            {[
              ['Move a meal', 'Logged lunch as dinner? Move it to the right slot in two taps.'],
              ['Edit any log', 'Change portions after the fact. Totals recalculate everywhere.'],
              ['Custom foods', 'Add your own dish with its macros and reuse it forever.'],
              ['25 badges', 'Quiet milestones for consistency, not for eating less.'],
              ['CSV export', 'Your full history, in a file you own.'],
              ['Reminders', 'One gentle nudge at the time you choose. Or none.'],
            ].map(([t, b], i) => (
              <Reveal key={t} className="mini-card" delay={i * 50}>
                <h3>{t}</h3>
                <p>{b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
