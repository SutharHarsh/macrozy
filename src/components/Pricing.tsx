import { Link } from 'react-router-dom';
import { PLANS } from '@/data/content';

const TIERS = [
  { name: 'Free', price: '₹0', per: '', note: 'Log every meal properly, forever.', cta: 'Get the app', primary: false, features: PLANS.free },
  { name: 'Pro monthly', price: '₹299', per: '/ month', note: 'Everything, billed month to month.', cta: 'Start 14-day free trial', primary: false, features: PLANS.pro },
  { name: 'Pro yearly', price: '₹1,999', per: '/ year', note: 'Works out to ₹166 a month. Save 44%.', cta: 'Start 14-day free trial', primary: true, features: PLANS.pro },
];

export function PricingCards() {
  return (
    <div className="tiers">
      {TIERS.map((t) => (
        <article key={t.name} className={`tier ${t.primary ? 'is-best' : ''}`}>
          <div className="tier-head">
            <h3>{t.name}</h3>
            {t.primary && <span className="tier-badge">Best value</span>}
          </div>
          <p className="tier-price tabular">
            {t.price}
            {t.per && <span>{t.per}</span>}
          </p>
          <p className="tier-note">{t.note}</p>
          <Link to="/download" className={`btn btn-block ${t.primary ? 'btn-primary' : 'btn-soft'}`}>
            {t.cta}
          </Link>
          <ul>
            {t.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </article>
      ))}
      <p className="tiers-pay">Pay with UPI (PhonePe, Google Pay, BHIM, Paytm), cards or netbanking. No card needed for the trial.</p>
    </div>
  );
}
