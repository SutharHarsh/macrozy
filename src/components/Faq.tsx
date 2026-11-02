import { useId, useState } from 'react';
import { FAQ, type FaqFig } from '@/data/content';

function Figure({ fig }: { fig: FaqFig }) {
  switch (fig) {
    case 'split':
      return (
        <svg viewBox="0 0 220 140" aria-hidden="true">
          <circle cx="110" cy="70" r="56" className="f-line" />
          <circle cx="40" cy="70" r="22" fill="var(--protein)" opacity=".9" />
          <circle cx="110" cy="70" r="28" fill="var(--carbs)" opacity=".9" />
          <circle cx="180" cy="70" r="18" fill="var(--fiber)" opacity=".9" />
          <path d="M20 22h180" className="f-scan" />
          <text x="40" y="122" className="f-label">DAL</text>
          <text x="110" y="122" className="f-label">RICE</text>
          <text x="180" y="122" className="f-label">SALAD</text>
        </svg>
      );
    case 'katori':
      return (
        <svg viewBox="0 0 220 140" aria-hidden="true">
          <path d="M50 60h120c0 34-26 56-60 56S50 94 50 60Z" className="f-fill" />
          <ellipse cx="110" cy="60" rx="60" ry="12" fill="var(--protein)" opacity=".85" />
          <text x="110" y="34" className="f-label">1 KATORI ≈ 150 G</text>
        </svg>
      );
    case 'week':
      return (
        <svg viewBox="0 0 220 140" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((d) => (
            <circle key={d} cx={28 + d * 27} cy="66" r="10" fill={d === 5 ? 'none' : d === 6 ? 'var(--line-2)' : 'var(--flame)'} stroke={d === 5 ? 'var(--ink-4)' : 'none'} strokeWidth="2" strokeDasharray={d === 5 ? '3 3' : undefined} />
          ))}
          <text x="163" y="100" className="f-label">REST</text>
          <text x="28" y="34" className="f-label f-left">5/7 THIS WEEK</text>
        </svg>
      );
    case 'ring':
      return (
        <svg viewBox="0 0 220 140" aria-hidden="true">
          <circle cx="110" cy="70" r="46" className="f-track" />
          <circle cx="110" cy="70" r="46" className="f-arc" pathLength={1} strokeDasharray=".72 1" transform="rotate(-90 110 70)" />
          <text x="110" y="76" className="f-num">2,100</text>
        </svg>
      );
    case 'bmi':
      return (
        <svg viewBox="0 0 220 140" aria-hidden="true">
          <rect x="20" y="64" width="180" height="10" rx="5" className="f-fill" />
          <rect x="74" y="64" width="64" height="10" rx="5" fill="var(--fiber)" opacity=".8" />
          <circle cx="112" cy="69" r="9" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
          <text x="112" y="44" className="f-num f-small">23.4</text>
          <text x="74" y="98" className="f-label">18.5</text>
          <text x="138" y="98" className="f-label">24.9</text>
        </svg>
      );
    case 'trial':
      return (
        <svg viewBox="0 0 220 140" aria-hidden="true">
          <path d="M24 70h172" className="f-line" />
          {[
            [24, 'DAY 1'],
            [150, 'DAY 11'],
            [196, 'DAY 14'],
          ].map(([x, l]) => (
            <g key={l as string}>
              <circle cx={x as number} cy="70" r="7" fill={x === 150 ? 'var(--flame)' : 'var(--accent)'} />
              <text x={x as number} y="100" className="f-label">
                {l}
              </text>
            </g>
          ))}
        </svg>
      );
  }
}

export function Faq({ items = FAQ }: { items?: typeof FAQ }) {
  const [open, setOpen] = useState(0);
  const id = useId();
  return (
    <div className="faq">
      <div className="faq-list">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={it.q} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
              <h3>
                <button type="button" aria-expanded={isOpen} aria-controls={`${id}-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                  {it.q}
                  <span className="faq-icon" aria-hidden="true" />
                </button>
              </h3>
              <div id={`${id}-${i}`} className="faq-a" role="region" hidden={!isOpen}>
                <p>{it.a}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="faq-fig" aria-hidden="true">
        <div key={open} className="faq-fig-inner">
          <Figure fig={items[Math.max(open, 0)].fig} />
        </div>
      </div>
    </div>
  );
}
