import { PricingCards } from '@/components/Pricing';
import { Faq } from '@/components/Faq';
import { Reveal } from '@/components/Reveal';
import { COMPARE } from '@/data/content';
import { FinalCta } from './Home';

const TIMELINE = [
  { day: 'Day 1', t: 'Sign up', b: 'Every Pro feature unlocks. No card.' },
  { day: 'Day 11', t: 'Reminder', b: 'A heads-up three days before the trial ends.' },
  { day: 'Day 14', t: 'Your call', b: 'Go Pro with UPI, or keep logging free. Your history stays.' },
];

export function Pricing() {
  return (
    <>
      <section className="page-hero center">
        <div className="wrap">
          <span className="eyebrow">Pricing</span>
          <h1 className="display">Less than a plate of momos a week.</h1>
          <p className="lede">Logging is free, forever. Pro adds micronutrients, photos and the long view. Try all of it for 14 days first.</p>
        </div>
      </section>

      <section className="section pricing-section">
        <div className="wrap">
          <PricingCards />
        </div>
      </section>

      <section className="section" aria-labelledby="trial-title">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="eyebrow">The trial</span>
            <h2 id="trial-title" className="title">Fourteen days, no surprises.</h2>
          </Reveal>
          <ol className="timeline">
            {TIMELINE.map((s, i) => (
              <Reveal as="li" key={s.day} className="tl-step" delay={i * 80}>
                <span className="tl-day tabular">{s.day}</span>
                <h3>{s.t}</h3>
                <p>{s.b}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="compare-title">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="eyebrow">Compare</span>
            <h2 id="compare-title" className="title">Free and Pro, line by line.</h2>
          </Reveal>
          <div className="table-wrap card">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Free</th>
                  <th scope="col">Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([f, free, pro]) => (
                  <tr key={f}>
                    <th scope="row">{f}</th>
                    <td>{f === 'History' ? '7 days' : f === 'Weight trend chart' ? '30 days' : free ? <Tick /> : <Dash />}</td>
                    <td>{f === 'History' ? '90 days' : f === 'Weight trend chart' ? 'Full range' : pro ? <Tick /> : <Dash />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" id="faq" aria-labelledby="pfaq-title">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2 id="pfaq-title" className="title">Before you decide.</h2>
          </Reveal>
          <Faq />
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function Tick() {
  return (
    <span className="tick" aria-label="Included">
      ✓
    </span>
  );
}
function Dash() {
  return (
    <span className="dash" aria-label="Not included">
      —
    </span>
  );
}
