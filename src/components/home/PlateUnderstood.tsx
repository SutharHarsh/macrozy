import { useState, type CSSProperties } from 'react';
import { FoodField3D } from '../FoodField3D';
import type { FieldItem } from '@/three/FoodField';
import { PRODUCE } from '@/data/produce';

/* real ingredients around the headline; positions are shares of the stage */
const SPOTS: FieldItem[] = [
  { name: 'onion', x: 0.18, y: 0.16, size: 0.15, depth: 0.85 },
  { name: 'karela', x: 0.5, y: 0.1, size: 0.2, depth: 0.6, tilt: 0.6 },
  { name: 'tomato', x: 0.82, y: 0.17, size: 0.13, depth: 0.8 },
  { name: 'baingan', x: 0.1, y: 0.52, size: 0.2, depth: 0.55, tilt: 0.5 },
  { name: 'mango', x: 0.9, y: 0.5, size: 0.16, depth: 0.7 },
  { name: 'naan', x: 0.24, y: 0.86, size: 0.22, depth: 0.65, tilt: 0.9 },
  { name: 'garlic', x: 0.5, y: 0.9, size: 0.12, depth: 0.9 },
  { name: 'lime', x: 0.76, y: 0.85, size: 0.12, depth: 0.85 },
];

/** Real 3D ingredients around a headline. Hover, focus or tap one to bring it forward with its macros. */
export function PlateUnderstood() {
  const [active, setActive] = useState(-1);
  return (
    <section className="understood" aria-labelledby="understood-title">
      <div className="understood-stage">
        <div className="field-host">
          <FoodField3D items={SPOTS} focus={active} />
        </div>
        {SPOTS.map((s, i) => {
          const m = PRODUCE[s.name]!;
          const on = active === i;
          return (
            <button
              key={s.name}
              type="button"
              className={`food-spot ${on ? 'is-on' : ''}`}
              style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, '--hit': `${Math.max(s.size * 100, 11)}%` } as CSSProperties}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive((a) => (a === i ? -1 : a))}
              onFocus={() => setActive(i)}
              onBlur={() => setActive((a) => (a === i ? -1 : a))}
              onClick={() => setActive((a) => (a === i ? -1 : i))}
              aria-label={`${m.name}, ${m.portion}: ${m.kcal} kcal, ${m.p} g protein, ${m.c} g carbs, ${m.f} g fat`}
            >
              <span className="food-chip" aria-hidden="true">
                <b>{m.name}</b>
                <span className="food-chip-sub tabular">
                  {m.portion} · {m.kcal} kcal
                </span>
                <span className="food-chip-macros tabular">
                  <i className="p">P {m.p}</i>
                  <i className="c">C {m.c}</i>
                  <i className="f">F {m.f}</i>
                </span>
              </span>
            </button>
          );
        })}
        <div className="understood-copy">
          <h2 id="understood-title" className="title">
            Every Indian plate,
            <br />
            understood.
          </h2>
          <span className="hint-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17.5" r="1.2" fill="currentColor" />
            </svg>
            Hover or tap an ingredient
          </span>
        </div>
      </div>
      <p className="understood-note">Real 3D ingredients · Illustrative values for common home portions.</p>
    </section>
  );
}
