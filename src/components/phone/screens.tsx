import type { CSSProperties, ReactNode } from 'react';
import { MacroRing } from '../MacroRing';
import { ThaliCanvas } from '../home/ThaliCanvas';
import { Odometer } from '../Odometer';
import { DAY, fmtG, fmtKcal, mealItems, mealTotal } from '@/data/meal';

/* Small building blocks that mirror the Flutter widgets (KhCard, KhSegmented, KhButton...). */

export function AppHeader({ title, trailing, back = false }: { title: string; trailing?: ReactNode; back?: boolean }) {
  return (
    <div className={`app-head ${back ? 'is-pushed' : ''}`}>
      {back && <span className="app-back" aria-hidden="true">‹</span>}
      <span className={back ? 'app-head-title' : 'app-display'}>{title}</span>
      {trailing}
    </div>
  );
}

function Meter({ label, now, target, color, unit = 'g' }: { label: string; now: number; target: number; color: string; unit?: string }) {
  return (
    <div className="app-meter">
      <div className="app-meter-top">
        <span>{label}</span>
        <span className="app-num">
          <b style={{ color }}>{now}</b>
          <i>
            /{target}
            {unit}
          </i>
        </span>
      </div>
      <div className="app-track">
        <span style={{ width: `${Math.min(100, (now / target) * 100)}%`, background: color }} />
      </div>
    </div>
  );
}

export function StreakChip({ n = 5 }: { n?: number }) {
  return (
    <span className="app-chip app-streak">
      <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true">
        <path d="M6 0c1 3 5 4.5 5 8.5A5 5 0 0 1 1 8.5C1 6 3 5 3 3c1.2.8 2 2 2 3.2C5.5 4 6 2 6 0Z" fill="url(#flame)" />
        <defs>
          <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F0A75E" />
            <stop offset="1" stopColor="#D9762C" />
          </linearGradient>
        </defs>
      </svg>
      {n}/7
    </span>
  );
}

function MealSlot({ name, food, kcal, empty = false, active = false }: { name: string; food?: string; kcal?: number; empty?: boolean; active?: boolean }) {
  return (
    <div className={`app-slot ${empty ? 'is-empty' : ''} ${active ? 'is-active' : ''}`}>
      <div>
        <span className="app-slot-name">{name}</span>
        <span className="app-slot-food">{empty ? 'Nothing logged yet' : food}</span>
      </div>
      {empty ? <span className="app-plus">+</span> : <span className="app-num app-slot-kcal">{kcal} kcal</span>}
    </div>
  );
}

/* ---------- Today ---------- */
export function TodayScreen({ filled = true }: { filled?: boolean }) {
  const lunch = Math.round(mealTotal(1, 150).kcal);
  const eaten = filled ? DAY.breakfast.kcal + lunch + DAY.snack.kcal + DAY.dinner.kcal : DAY.breakfast.kcal;
  return (
    <div className="app-screen">
      <AppHeader title="Today" trailing={<StreakChip n={filled ? 5 : 4} />} />
      <div className="app-card app-today">
        <MacroRing size={128} stroke={12} progress={eaten / DAY.target}>
          <span className="app-big app-num">{fmtKcal(eaten)}</span>
          <span className="app-cap">of {fmtKcal(DAY.target)}</span>
        </MacroRing>
        <div className="app-meters">
          <Meter label="Protein" now={filled ? DAY.protein.now : 22} target={DAY.protein.target} color="#FF9230" />
          <Meter label="Carbs" now={filled ? DAY.carbs.now : 58} target={DAY.carbs.target} color="#30D158" />
          <Meter label="Fat" now={filled ? DAY.fat.now : 11} target={DAY.fat.target} color="#FFD600" />
        </div>
      </div>
      <div className="app-overline">Meals</div>
      <div className="app-card app-group">
        <MealSlot name="Breakfast" food={DAY.breakfast.name} kcal={DAY.breakfast.kcal} />
        <MealSlot name="Lunch" food="Dal chawal + salad" kcal={lunch} empty={!filled} active={!filled} />
        <MealSlot name="Snack" food={DAY.snack.name} kcal={DAY.snack.kcal} empty={!filled} />
        <MealSlot name="Dinner" food={DAY.dinner.name} kcal={DAY.dinner.kcal} empty={!filled} />
      </div>
      <TabBar active="today" />
    </div>
  );
}

export function TabBar({ active }: { active: 'today' | 'progress' | 'health' | 'profile' }) {
  const items: [typeof active, string][] = [
    ['today', 'Today'],
    ['progress', 'Progress'],
    ['health', 'Health'],
    ['profile', 'Profile'],
  ];
  return (
    <div className="app-tabbar" aria-hidden="true">
      {items.slice(0, 2).map(([id, label]) => (
        <span key={id} className={id === active ? 'is-on' : ''}>
          <i />
          {label}
        </span>
      ))}
      <span className="app-fab">+</span>
      {items.slice(2).map(([id, label]) => (
        <span key={id} className={id === active ? 'is-on' : ''}>
          <i />
          {label}
        </span>
      ))}
    </div>
  );
}

/* ---------- a generic tracker, for contrast ---------- */
export function GenericScreen() {
  return (
    <div className="app-screen app-generic">
      <div className="generic-search">Search “dal”</div>
      {[
        ['Indian curry', '1 serving', '300'],
        ['Lentil soup', '1 cup (US)', '230'],
        ['Rice, white', '1 cup', '205'],
        ['Mixed salad', '1 serving', '20'],
        ['Curry, vegetable', '1 serving', '260'],
      ].map(([n, q, k]) => (
        <div key={n} className="generic-row">
          <div>
            <span>{n}</span>
            <i>{q}</i>
          </div>
          <b>{k} kcal</b>
        </div>
      ))}
      <div className="generic-note">No katori. No roti. No ghar ka khana.</div>
    </div>
  );
}

/* ---------- capture: snap / say / type ---------- */
export function CaptureScreen({ mode }: { mode: 0 | 1 | 2 }) {
  return (
    <div className="app-screen app-capture">
      <AppHeader title="Add food" back />
      <div className="app-seg" aria-hidden="true">
        {['Snap', 'Say', 'Type'].map((m, i) => (
          <span key={m} className={i === mode ? 'is-on' : ''}>
            {m}
          </span>
        ))}
        <i style={{ transform: `translateX(${mode * 100}%)` }} />
      </div>
      <div className="capture-stage">
        <div className={`capture-pane ${mode === 0 ? 'is-on' : ''}`}>
          <div className="viewfinder">
            <ThaliCanvas scale={0.4} cy={0.5} className="vf-canvas" />
            <span className="vf-corner tl" />
            <span className="vf-corner tr" />
            <span className="vf-corner bl" />
            <span className="vf-corner br" />
            <span className="vf-scan" />
          </div>
          <div className="capture-hint">Plate or full thali. Portions come next.</div>
          <div className="shutter" />
        </div>
        <div className={`capture-pane ${mode === 1 ? 'is-on' : ''}`}>
          <div className="voice">
            <div className="voice-bars">
              {Array.from({ length: 24 }, (_, i) => (
                <span key={i} style={{ animationDelay: `${(i % 8) * 90}ms`, height: `${20 + ((i * 37) % 60)}%` }} />
              ))}
            </div>
            <p className="voice-text">“dal chawal and a little salad”</p>
            <span className="voice-mic" />
          </div>
        </div>
        <div className={`capture-pane ${mode === 2 ? 'is-on' : ''}`}>
          <div className="type">
            <div className="type-field">
              dal chawal salad<span className="caret" />
            </div>
            <div className="app-overline">Suggestions</div>
            {['Dal chawal with salad', 'Dal chawal', 'Dal tadka'].map((s, i) => (
              <div key={s} className={`type-row ${i === 0 ? 'is-top' : ''}`}>
                <span className="ai-tag">✦ AI</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- the AI meal detail ---------- */
export function MealScreen({ dal = 1, rice = 150, analyzing = false, logged = false }: { dal?: number; rice?: number; analyzing?: boolean; logged?: boolean }) {
  const items = mealItems(dal, rice);
  const t = mealTotal(dal, rice);
  return (
    <div className={`app-screen app-meal ${analyzing ? 'is-analyzing' : ''}`}>
      <AppHeader title="Dal Chawal with Salad" back trailing={<span className="app-chip app-ai">✦ AI</span>} />
      <div className="app-note">AI estimates can be incorrect. Please double-check before logging.</div>
      <div className="app-card app-totals">
        <div>
          <b className="app-num">
            <Odometer value={fmtKcal(t.kcal)} />
          </b>
          <span>Calories</span>
        </div>
        <div>
          <b className="app-num" style={{ color: '#FF9230' }}>
            <Odometer value={`${fmtG(t.p)}g`} />
          </b>
          <span>Protein</span>
        </div>
        <div>
          <b className="app-num" style={{ color: '#30D158' }}>
            <Odometer value={`${fmtG(t.c)}g`} />
          </b>
          <span>Carbs</span>
        </div>
        <div>
          <b className="app-num" style={{ color: '#FFD600' }}>
            <Odometer value={`${fmtG(t.f)}g`} />
          </b>
          <span>Fat</span>
        </div>
      </div>
      <div className="app-overline">Items</div>
      {items.map((it, i) => (
        <div key={it.id} className="app-card app-item" style={{ '--i': i } as CSSProperties}>
          <span className="app-item-icon">✦</span>
          <div className="app-item-main">
            <span className="app-item-name">
              {it.name} <span className="ai-tag">AI</span>
            </span>
            <span className="app-item-sub app-num">
              {Math.round(it.m.kcal)} kcal · P {fmtG(it.m.p)} · C {fmtG(it.m.c)} · F {fmtG(it.m.f)}
            </span>
          </div>
          <span className="app-qty app-num">{it.qty}</span>
        </div>
      ))}
      <div className="app-footer">
        <span className="app-slotpick">
          Lunch
          <i>11 Oct</i>
        </span>
        <span className={`app-cta ${logged ? 'is-done' : ''}`}>{logged ? 'Logged ✓' : 'Log Meal'}</span>
      </div>
    </div>
  );
}

/* ---------- progress ---------- */
export function ProgressScreen() {
  return (
    <div className="app-screen">
      <AppHeader title="Progress" trailing={<StreakChip n={5} />} />
      <div className="app-stats">
        <div className="app-card">
          <span className="app-cap">Cal avg</span>
          <b className="app-num">2,077</b>
          <i className="good">−23/day</i>
        </div>
        <div className="app-card">
          <span className="app-cap">Protein avg</span>
          <b className="app-num">138g</b>
          <i>99% of target</i>
        </div>
      </div>
      <div className="app-card app-weight">
        <span className="app-cap">Current weight</span>
        <div className="app-weight-row">
          <b className="app-num">
            79.2<small> kg</small>
          </b>
          <span className="app-pill good">−4.8 kg</span>
        </div>
        <span className="app-sub">On pace for your goal by 23 Dec</span>
        <svg viewBox="0 0 300 120" className="app-chart" aria-hidden="true">
          <defs>
            <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFD600" stopOpacity=".35" />
              <stop offset="1" stopColor="#FFD600" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="104" x2="300" y2="104" stroke="rgba(100,210,255,.6)" strokeDasharray="4 5" />
          <path d="M0 14 C30 16 40 26 70 28 S120 32 150 46 S200 56 230 64 S275 72 300 74 L300 120 L0 120 Z" fill="url(#wfill)" />
          <path className="app-chart-line" d="M0 14 C30 16 40 26 70 28 S120 32 150 46 S200 56 230 64 S275 72 300 74" fill="none" stroke="#FFD600" strokeWidth="3" strokeLinecap="round" pathLength={1} />
          <circle cx="300" cy="74" r="5" fill="#FFE14D" />
        </svg>
        <div className="app-seg app-seg-sm" aria-hidden="true">
          {['7d', '4w', '3m', '1y'].map((m, i) => (
            <span key={m} className={i === 2 ? 'is-on' : ''}>
              {m}
            </span>
          ))}
          <i style={{ transform: 'translateX(200%)' }} />
        </div>
      </div>
      <div className="app-card app-week">
        <span className="app-cap">This week</span>
        <div className="app-days">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className={i === 5 ? 'is-rest' : i < 5 ? 'is-on' : ''}>
              {d}
            </span>
          ))}
        </div>
        <span className="app-sub">5 logged · 1 rest day · Sunday to go</span>
      </div>
      <TabBar active="progress" />
    </div>
  );
}

/* ---------- splash ---------- */
export function SplashScreen() {
  return (
    <div className="app-screen app-splash">
      <div className="splash-mark">
        <MacroRing size={96} stroke={11} progress={0.72} />
      </div>
      <span className="splash-word">Macrozy</span>
      <span className="splash-tag">Indian food tracker</span>
      <span className="app-cta splash-cta">Start 14-day trial</span>
    </div>
  );
}

/* ---------- health ---------- */
export function HealthScreen() {
  const steps = [6200, 8400, 7100, 10300, 9200, 4100, 8800];
  const max = Math.max(...steps);
  return (
    <div className="app-screen">
      <AppHeader title="Health" />
      <div className="app-stats">
        <div className="app-card">
          <span className="app-cap">Steps today</span>
          <b className="app-num">8,812</b>
          <i>Health Connect</i>
        </div>
        <div className="app-card">
          <span className="app-cap">Burnt</span>
          <b className="app-num">412</b>
          <i>active kcal</i>
        </div>
      </div>
      <div className="app-card">
        <span className="app-cap">Steps · this week</span>
        <div className="app-bars">
          {steps.map((s, i) => (
            <span key={i} style={{ height: `${(s / max) * 100}%` }} className={i === 6 ? 'is-today' : ''} />
          ))}
        </div>
        <div className="app-bars-x">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      </div>
      <div className="app-note">Read-only. Macrozy never writes to your health data.</div>
      <TabBar active="health" />
    </div>
  );
}

/* ---------- micronutrients ---------- */
export function MicrosScreen() {
  const rows: [string, number, string][] = [
    ['Fiber', 0.57, '17 / 30 g'],
    ['Iron', 0.64, '11 / 17 mg'],
    ['Calcium', 0.48, '480 / 1,000 mg'],
    ['Potassium', 0.71, '2.5 / 3.5 g'],
    ['Sodium', 0.83, '1.9 / 2.3 g'],
  ];
  return (
    <div className="app-screen">
      <AppHeader title="Micronutrients" back />
      <div className="app-card app-micros">
        {rows.map(([n, v, t]) => (
          <div key={n} className="app-micro">
            <div className="app-meter-top">
              <span>{n}</span>
              <span className="app-num app-micro-v">{t}</span>
            </div>
            <div className="app-track">
              <span style={{ width: `${v * 100}%`, background: n === 'Sodium' ? '#E58A3C' : '#64D2FF' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="app-note">Pro tracks 7 micronutrients from the same meals you already log.</div>
    </div>
  );
}

/* ---------- usuals ---------- */
export function UsualsScreen() {
  const usuals: [string, string, number][] = [
    ['Morning poha + chai', 'Breakfast · 6 days a week', 410],
    ['Post-workout whey + banana', 'Snack', 290],
    ['Dal chawal + salad', 'Lunch', 440],
    ['2 roti + paneer bhurji', 'Dinner', 500],
  ];
  return (
    <div className="app-screen">
      <AppHeader title="Add food" back />
      <div className="app-seg" aria-hidden="true">
        {['Recents', 'Usuals', 'Search'].map((m, i) => (
          <span key={m} className={i === 1 ? 'is-on' : ''}>
            {m}
          </span>
        ))}
        <i style={{ transform: 'translateX(100%)' }} />
      </div>
      <div className="app-card app-group">
        {usuals.map(([n, s, k]) => (
          <div key={n} className="app-slot">
            <div>
              <span className="app-slot-name">{n}</span>
              <span className="app-slot-food">{s}</span>
            </div>
            <span className="app-num app-slot-kcal">{k}</span>
            <span className="app-plus is-solid">+</span>
          </div>
        ))}
      </div>
      <div className="app-note">One tap re-logs a usual with yesterday's portions.</div>
    </div>
  );
}
