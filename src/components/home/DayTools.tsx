import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FoodIcon } from '../FoodIcon';
import { Reveal } from '../Reveal';
import type { FoodKind } from '@/canvas/foodSprites';

const DAYS = [
  { d: 'Mon', n: 13, kcal: 1980 },
  { d: 'Tue', n: 14, kcal: 2120 },
  { d: 'Wed', n: 15, kcal: 1860 },
  { d: 'Thu', n: 16, kcal: 2040 },
  { d: 'Fri', n: 17, kcal: 1640 },
  { d: 'Sat', n: 18, kcal: 0 },
  { d: 'Sun', n: 19, kcal: 0 },
];

const MEALS: { name: string; items: number; kcal: number; foods: FoodKind[]; more?: number }[] = [
  { name: 'Lunch', items: 3, kcal: 440, foods: ['dal', 'rice', 'salad'] },
  { name: 'Breakfast', items: 3, kcal: 410, foods: ['idli', 'chai', 'banana'] },
  { name: 'Dinner', items: 4, kcal: 500, foods: ['roti', 'paneer', 'salad'], more: 1 },
];

/** A bento of real app moments, each drawn as a small widget. */
export function DayTools() {
  const [day, setDay] = useState(4);
  const target = 2100;
  const eaten = DAYS[day].kcal;
  return (
    <section className="section tools" aria-labelledby="tools-title">
      <div className="wrap">
        <Reveal className="section-head center">
          <h2 id="tools-title" className="title">
            Everything for a good food day
          </h2>
          <p className="lede">Log, check, adjust, repeat. The small tools that make tracking Indian food feel quick instead of like homework.</p>
        </Reveal>

        <div className="tools-grid">
          <Reveal className="tool tool-intake">
            <div className="widget">
              <div className="widget-top">
                <span className="widget-label">Calorie intake</span>
                <span className={`kcal-pill ${eaten ? '' : 'is-muted'}`}>{eaten ? `${(target - eaten).toLocaleString('en-IN')} kcal left` : 'Not logged yet'}</span>
              </div>
              <p className="intake-num tabular">
                <b>{eaten ? eaten.toLocaleString('en-IN') : '0'}</b>
                <span> / {target.toLocaleString('en-IN')}</span>
              </p>
              <div className="intake-bar">
                <span style={{ width: `${Math.min(100, (eaten / target) * 100)}%` }} />
              </div>
            </div>
            <div className="date-strip" role="radiogroup" aria-label="Day of the week">
              {DAYS.map((d, i) => (
                <button key={d.d} type="button" role="radio" aria-checked={i === day} className="date" onClick={() => setDay(i)}>
                  <span>{d.d}</span>
                  <b className="tabular">{d.n}</b>
                </button>
              ))}
            </div>
            <h3>Today at a glance</h3>
            <p>Calories and macros against targets worked out from your own body. Tap a day to look back.</p>
          </Reveal>

          <Reveal className="tool tool-meals" delay={80}>
            <div className="meal-stack">
              {MEALS.map((m, i) => (
                <div key={m.name} className="widget meal-card" style={{ opacity: 1 - i * 0.22, transform: `scale(${1 - i * 0.03})` }}>
                  <div className="widget-top">
                    <span>
                      <b className="meal-name">{m.name}</b>
                      <span className="widget-label">{m.items} items</span>
                    </span>
                    <span className="kcal-pill">{m.kcal} kcal</span>
                  </div>
                  <div className="meal-foods">
                    {m.foods.map((f, k) => (
                      <span key={k} className="meal-food">
                        <FoodIcon kind={f} size={44} />
                      </span>
                    ))}
                    {m.more && <span className="meal-more">+{m.more}</span>}
                  </div>
                </div>
              ))}
            </div>
            <h3>Every meal, itemised</h3>
            <p>Each plate keeps its parts, so you can see exactly where the protein came from.</p>
          </Reveal>

          <Reveal className="tool tool-voice" delay={0}>
            <div className="widget voice-widget">
              <span className="voice-dot" aria-hidden="true" />
              <div>
                <span className="widget-label">Listening…</span>
                <p className="voice-said">“two rotis and paneer bhurji”</p>
              </div>
            </div>
            <div className="voice-chips">
              <span>2 roti · 211 kcal</span>
              <span>Paneer bhurji · 1 katori</span>
            </div>
            <h3>Say it</h3>
            <p>Speech is turned into text on your phone, then matched like a search.</p>
          </Reveal>

          <Reveal className="tool tool-streak" delay={80}>
            <div className="widget streak-widget">
              <div className="widget-top">
                <span className="widget-label">This week</span>
                <span className="streak-count tabular">5 / 7</span>
              </div>
              <div className="coins">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className={i < 5 ? 'is-on' : i === 5 ? 'is-rest' : ''}>
                    <i />
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <h3>Weekly streaks</h3>
            <p>A day counts at 200 kcal logged, and one rest day a week is built in.</p>
          </Reveal>

          <Reveal className="tool tool-search" delay={160}>
            <div className="widget search-widget">
              <div className="search-field">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" />
                  <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                rajma chawal
              </div>
              <span className="widget-label">Recent searches</span>
              <div className="recent">
                <span>
                  <FoodIcon kind="dal" size={30} />
                  Toor dal
                </span>
                <span>
                  <FoodIcon kind="samosa" size={30} />
                  Samosa
                </span>
                <span>
                  <FoodIcon kind="chai" size={30} />
                  Masala chai
                </span>
              </div>
            </div>
            <h3>Search that knows dal</h3>
            <p>Composite dishes are broken into ingredients, so the macros follow what is in the bowl.</p>
          </Reveal>
        </div>
        <div className="center-link">
          <Link to="/features" className="text-link">
            See every feature
          </Link>
        </div>
      </div>
    </section>
  );
}
