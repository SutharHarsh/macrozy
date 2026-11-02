import { useState } from 'react';
import { Odometer } from '@/components/Odometer';
import { Reveal } from '@/components/Reveal';
import { ACTIVITY, GOALS, calculate, type Activity, type Goal, type Sex } from '@/lib/targets';
import { FinalCta } from './Home';

function Slider({ id, label, value, min, max, step = 1, unit, onChange }: { id: string; label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="field">
      <div className="field-top">
        <label htmlFor={id}>{label}</label>
        <span className="tabular field-val">
          {value} {unit}
        </span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function Science() {
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState(26);
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(79);
  const [activity, setActivity] = useState<Activity>('active');
  const [goal, setGoal] = useState<Goal>('lose_fat');
  const r = calculate({ weightKg: weight, heightCm: height, age, sex, goal, activity });
  const bmiPos = Math.min(1, Math.max(0, (r.bmi - 14) / (36 - 14)));

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <span className="eyebrow">How it works</span>
          <h1 className="display">
            No magic numbers.
            <br />
            Just your numbers.
          </h1>
          <p className="lede">The targets in Macrozy come from a published equation and a few honest rules. Move the sliders. This is the same maths the app runs during onboarding.</p>
        </div>
      </section>

      <section className="section calc-section" aria-labelledby="calc-title">
        <div className="wrap calc">
          <div className="calc-inputs card">
            <h2 id="calc-title" className="title-sm">
              Your daily targets
            </h2>
            <div className="seg-row" role="radiogroup" aria-label="Sex used in the formula">
              {(['male', 'female'] as Sex[]).map((s) => (
                <button key={s} type="button" role="radio" aria-checked={sex === s} className="unit-chip" onClick={() => setSex(s)}>
                  {s === 'male' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
            <Slider id="age" label="Age" value={age} min={16} max={70} unit="yrs" onChange={setAge} />
            <Slider id="height" label="Height" value={height} min={140} max={205} unit="cm" onChange={setHeight} />
            <Slider id="weight" label="Weight" value={weight} min={40} max={150} unit="kg" onChange={setWeight} />
            <div className="field">
              <label htmlFor="activity">Activity</label>
              <select id="activity" value={activity} onChange={(e) => setActivity(e.target.value as Activity)}>
                {ACTIVITY.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} (×{a.mult})
                  </option>
                ))}
              </select>
            </div>
            <div className="seg-row" role="radiogroup" aria-label="Goal">
              {GOALS.map((g) => (
                <button key={g.id} type="button" role="radio" aria-checked={goal === g.id} className="unit-chip" onClick={() => setGoal(g.id)}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="calc-out">
            <div className="equation card" aria-label="Calculation steps">
              <div className="eq-row">
                <span className="eq-k">BMR</span>
                <span className="eq-f">
                  10×{weight} + 6.25×{height} − 5×{age} {sex === 'male' ? '+ 5' : '− 161'}
                </span>
                <b className="tabular">
                  <Odometer value={r.bmr.toLocaleString('en-IN')} />
                </b>
              </div>
              <div className="eq-row">
                <span className="eq-k">TDEE</span>
                <span className="eq-f">BMR × activity</span>
                <b className="tabular">
                  <Odometer value={r.tdee.toLocaleString('en-IN')} />
                </b>
              </div>
              <div className="eq-row">
                <span className="eq-k">Goal</span>
                <span className="eq-f">{r.adj === 0 ? 'no change' : `${r.adj > 0 ? '+' : '−'}${Math.abs(r.adj)} kcal a day`}</span>
                <b className="tabular">{r.adj > 0 ? `+${r.adj}` : r.adj < 0 ? `−${Math.abs(r.adj)}` : '0'}</b>
              </div>
              <div className="eq-row eq-total">
                <span className="eq-k">Target</span>
                <span className="eq-f">split 25% protein · 50% carbs · 25% fat</span>
                <b className="tabular">
                  <Odometer value={r.calories.toLocaleString('en-IN')} />
                </b>
              </div>
              {r.floored && <p className="eq-floor">Raised to a safe floor: never below 75% of TDEE or {sex === 'male' ? '1,500' : '1,200'} kcal.</p>}
            </div>
            <div className="target-tiles">
              <div className="t-tile is-protein">
                <span>Protein</span>
                <b className="tabular">
                  <Odometer value={r.protein} />g
                </b>
              </div>
              <div className="t-tile is-carbs">
                <span>Carbs</span>
                <b className="tabular">
                  <Odometer value={r.carbs} />g
                </b>
              </div>
              <div className="t-tile is-fat">
                <span>Fat</span>
                <b className="tabular">
                  <Odometer value={r.fat} />g
                </b>
              </div>
            </div>
            <p className="calc-note">A starting point, not a prescription. The app lets you edit every target, and your weight trend tells you whether to adjust.</p>
          </div>
        </div>
      </section>

      <section className="section" id="bmi" aria-labelledby="bmi-title">
        <div className="wrap split-2">
          <Reveal>
            <span className="eyebrow">Our BMI policy</span>
            <h2 id="bmi-title" className="title">A number. Never a label.</h2>
            <p className="lede">BMI can’t see muscle, frame or where you carry weight. So Macrozy shows it as a number beside the neutral reference range, with that caveat every time. It will never call you overweight or obese.</p>
          </Reveal>
          <Reveal className="bmi-card card" delay={80}>
            <span className="bmi-label">Your BMI</span>
            <b className="bmi-num tabular">
              <Odometer value={r.bmi.toFixed(1)} />
            </b>
            <div className="bmi-scale" aria-hidden="true">
              <span className="bmi-range" style={{ left: `${((18.5 - 14) / 22) * 100}%`, width: `${((24.9 - 18.5) / 22) * 100}%` }} />
              <span className="bmi-dot" style={{ left: `${bmiPos * 100}%` }} />
            </div>
            <div className="bmi-ticks tabular" aria-hidden="true">
              <span style={{ left: `${((18.5 - 14) / 22) * 100}%` }}>18.5</span>
              <span style={{ left: `${((24.9 - 14) / 22) * 100}%` }}>24.9</span>
            </div>
            <p className="bmi-note">Reference range 18.5–24.9. BMI doesn’t account for muscle mass or body composition.</p>
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="streak-title">
        <div className="wrap split-2">
          <Reveal>
            <span className="eyebrow">Streaks</span>
            <h2 id="streak-title" className="title">Weekly rhythm, not daily guilt.</h2>
            <p className="lede">A week runs Monday to Sunday. A day counts once you log at least one meal and 200 kcal, so a single glass of water doesn’t keep a streak alive. One rest day a week is free: take it, or let Macrozy apply it for you at 6 of 7.</p>
          </Reveal>
          <Reveal className="week-card card" delay={80}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
              <div key={d} className={`week-day ${i === 5 ? 'is-rest' : i < 5 ? 'is-on' : ''}`}>
                <span>{d}</span>
                <i />
                <em className="tabular">{i < 5 ? ['1,980', '2,120', '1,860', '2,040', '2,210'][i] : i === 5 ? 'rest' : '—'}</em>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section" id="privacy" aria-labelledby="privacy-title">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="eyebrow">Privacy and data</span>
            <h2 id="privacy-title" className="title">Plain rules for your data.</h2>
          </Reveal>
          <div className="mini-grid">
            {[
              ['Health is read-only', 'Steps and active calories only. Permission is asked when you tap Connect, never at sign-up.'],
              ['Photos stay private', 'Progress photos are stored against your account and only you can see them.'],
              ['Export any time', 'Download your full log as CSV from Settings.'],
              ['Delete means delete', 'Deleting your account removes your logs, weights and photos.'],
              ['Speech on your phone', 'Voice logging uses your phone’s own speech recogniser.'],
              ['AI is labelled', 'Anything the AI suggests carries an AI tag until you confirm it.'],
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
