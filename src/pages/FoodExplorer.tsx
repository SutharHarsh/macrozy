import { useMemo, useState } from 'react';
import { DISHES, KINDS, type Dish } from '@/data/dishes';
import { Odometer } from '@/components/Odometer';
import { MacroRing } from '@/components/MacroRing';
import { FinalCta } from './Home';

export function FoodExplorer() {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<(typeof KINDS)[number]>('All');
  const [dish, setDish] = useState<Dish>(DISHES.find((d) => d.id === 'rajma')!);
  const [unitIdx, setUnitIdx] = useState(0);
  const [qty, setQty] = useState(1);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DISHES.filter((d) => (kind === 'All' || d.kind === kind) && (!q || d.name.toLowerCase().includes(q)));
  }, [query, kind]);

  const unit = dish.units[Math.min(unitIdx, dish.units.length - 1)];
  const grams = unit.grams * qty;
  const k = grams / 100;
  const m = { kcal: dish.per100.kcal * k, p: dish.per100.p * k, c: dish.per100.c * k, f: dish.per100.f * k };
  const kcalFromMacros = m.p * 4 + m.c * 4 + m.f * 9 || 1;

  const choose = (d: Dish) => {
    setDish(d);
    setUnitIdx(0);
    setQty(1);
  };

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">Food explorer</span>
          <h1 className="display">
            Try it on
            <br />
            your own plate.
          </h1>
          <p className="lede">Pick a dish, pick the unit you actually use, and watch the macros follow. A small sample of what Macrozy knows.</p>
        </div>
      </section>

      <section className="section explorer-section" aria-label="Food explorer">
        <div className="wrap explorer">
          <div className="explorer-side">
            <label className="search" htmlFor="food-search">
              <span className="sr-only">Search dishes</span>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input id="food-search" type="search" placeholder="Search poha, rajma, chai…" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
            </label>
            <div className="kind-chips" role="radiogroup" aria-label="Category">
              {KINDS.map((k2) => (
                <button key={k2} type="button" role="radio" aria-checked={kind === k2} className="unit-chip" onClick={() => setKind(k2)}>
                  {k2}
                </button>
              ))}
            </div>
            <ul className="dish-list" aria-label="Dishes">
              {list.map((d) => (
                <li key={d.id}>
                  <button type="button" className={`dish-row ${d.id === dish.id ? 'is-on' : ''}`} aria-pressed={d.id === dish.id} onClick={() => choose(d)}>
                    <span>
                      <b>{d.name}</b>
                      <i>{d.kind}</i>
                    </span>
                    <span className="tabular">{Math.round((d.per100.kcal * d.units[0].grams) / 100)} kcal</span>
                  </button>
                </li>
              ))}
              {list.length === 0 && <li className="dish-empty">No dish matches “{query}”. The app’s search covers far more, including packaged foods.</li>}
            </ul>
          </div>

          <div className="explorer-detail card" aria-live="polite">
            <div className="ex-head">
              <div>
                <span className="eyebrow">{dish.kind}</span>
                <h2 className="title-sm">{dish.name}</h2>
              </div>
              <span className="illustrative">Illustrative values</span>
            </div>

            <div className="ex-controls">
              <div className="unit-chips" role="radiogroup" aria-label="Unit">
                {dish.units.map((u, i) => (
                  <button key={u.label} type="button" role="radio" aria-checked={i === unitIdx} className="unit-chip" onClick={() => setUnitIdx(i)}>
                    {u.label}
                  </button>
                ))}
              </div>
              <div className="qty">
                <button type="button" aria-label="Fewer" onClick={() => setQty((q) => Math.max(0.5, q - 0.5))} disabled={qty <= 0.5}>
                  −
                </button>
                <span className="tabular">× {qty % 1 === 0 ? qty : qty.toFixed(1)}</span>
                <button type="button" aria-label="More" onClick={() => setQty((q) => Math.min(4, q + 0.5))} disabled={qty >= 4}>
                  +
                </button>
              </div>
            </div>

            <div className="ex-body">
              <MacroRing
                size={210}
                stroke={20}
                progress={0.999}
                track="var(--bg-2)"
                segments={[
                  { value: m.p * 4, color: 'var(--protein)' },
                  { value: m.c * 4, color: 'var(--carbs)' },
                  { value: m.f * 9, color: 'var(--fat)' },
                ]}
              >
                <span className="ring-num tabular">
                  <Odometer value={Math.round(m.kcal)} />
                </span>
                <span className="ring-cap tabular">kcal · {Math.round(grams)} g</span>
              </MacroRing>
              <dl className="ex-macros">
                {[
                  ['Protein', m.p, 'protein', m.p * 4],
                  ['Carbs', m.c, 'carbs', m.c * 4],
                  ['Fat', m.f, 'fat', m.f * 9],
                ].map(([label, v, key, kc]) => (
                  <div key={label as string} className={`is-${key}`}>
                    <dt>{label}</dt>
                    <dd className="tabular">
                      <Odometer value={(v as number).toFixed(1)} />
                      <small>g</small>
                    </dd>
                    <span className="ex-bar">
                      <span style={{ transform: `scaleX(${(kc as number) / kcalFromMacros})` }} />
                    </span>
                    <span className="ex-share tabular">{Math.round(((kc as number) / kcalFromMacros) * 100)}% of calories</span>
                  </div>
                ))}
              </dl>
            </div>
            <p className="ex-note">In the app, dishes like this are matched to nutritionist-reviewed data and composite dishes are split into ingredients.</p>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
