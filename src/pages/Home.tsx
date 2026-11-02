import { Link } from 'react-router-dom';
import { Hero, PlayGlyph } from '@/components/home/Hero';
import { PlateUnderstood } from '@/components/home/PlateUnderstood';
import { FeatureRows } from '@/components/home/FeatureRows';
import { DayTools } from '@/components/home/DayTools';
import { FoodField3D } from '@/components/FoodField3D';
import type { FieldItem } from '@/three/FoodField';
import { Story } from '@/components/story/Story';
import { Reveal } from '@/components/Reveal';
import { Faq } from '@/components/Faq';
import { PricingCards } from '@/components/Pricing';
import { FoodIcon } from '@/components/FoodIcon';
import type { FoodKind } from '@/canvas/foodSprites';

const STEPS: { n: string; title: string; body: string; food: FoodKind }[] = [
  { n: '01', title: 'Capture the meal', body: 'Snap the plate, say what you ate, or type it. Repeat meals are one tap away in Usuals.', food: 'samosa' },
  { n: '02', title: 'Check the portions', body: 'Every food shows its macros. Set it in katori, roti, pieces or grams.', food: 'dal' },
  { n: '03', title: 'Log and move on', body: 'Pick the meal slot and log. The ring and your week update straight away.', food: 'chai' },
];

const END_FOODS: FieldItem[] = [
  { name: 'naan', x: 0.09, y: 0.24, size: 0.26, depth: 0.7, tilt: 0.9 },
  { name: 'lime', x: 0.9, y: 0.2, size: 0.13, depth: 0.9 },
  { name: 'potato', x: 0.13, y: 0.8, size: 0.16, depth: 0.5 },
  { name: 'tomato', x: 0.88, y: 0.78, size: 0.16, depth: 0.8 },
];

export function Home() {
  return (
    <>
      <Hero />
      <PlateUnderstood />

      <section className="story-intro" aria-labelledby="story-intro-title">
        <Reveal className="wrap section-head center">
          <span className="eyebrow is-accent">Follow one lunch</span>
          <h2 id="story-intro-title" className="title">
            From thali to numbers
            <br />
            in eight scrolls.
          </h2>
          <p className="lede">Scroll on. The plate gets captured, split, portioned, logged, and turned into your day.</p>
        </Reveal>
      </section>
      <div id="story">
        <Story />
      </div>

      <FeatureRows />
      <DayTools />

      <section className="section" aria-labelledby="steps-title">
        <div className="wrap">
          <Reveal className="section-head center">
            <h2 id="steps-title" className="title">
              Three steps, about fifteen seconds
            </h2>
          </Reveal>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} className="step" delay={i * 80}>
                <span className="step-art">
                  <FoodIcon kind={s.food} size={84} />
                </span>
                <span className="step-n tabular">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="pricing-title" id="pricing">
        <div className="wrap">
          <Reveal className="section-head center">
            <h2 id="pricing-title" className="title">
              Simple pricing
            </h2>
            <p className="lede">Logging is free, forever. Pro adds micronutrients, progress photos and the long view. Try it free for 14 days.</p>
          </Reveal>
          <PricingCards />
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title" id="faq">
        <div className="wrap">
          <Reveal className="section-head center">
            <h2 id="faq-title" className="title">
              Questions, answered
            </h2>
          </Reveal>
          <Faq />
        </div>
      </section>

      <FinalCta />
    </>
  );
}

export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="field-host final-field">
        <FoodField3D items={END_FOODS} />
      </div>
      <div className="wrap final-inner">
        <span className="hero-badge">Free for 14 days · No card</span>
        <h2 id="final-title" className="hero-title final-title">
          Your next meal
          <br />
          takes <span className="hl-word">15 seconds</span>.
        </h2>
        <p className="hero-lede">Download Macrozy and log your next plate the way you actually eat it.</p>
        <div className="hero-actions">
          <Link to="/download" className="btn btn-primary">
            <PlayGlyph />
            Get it on Android
          </Link>
          <span className="final-ios">iPhone: coming soon</span>
        </div>
      </div>
    </section>
  );
}
