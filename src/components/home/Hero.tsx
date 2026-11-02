import { Link } from 'react-router-dom';
import { Phone } from '../phone/Phone';
import { AppHeader } from '../phone/screens';
import { ThaliCanvas } from './ThaliCanvas';
import { FoodField3D } from '../FoodField3D';
import type { FieldItem } from '@/three/FoodField';
import { AppMark } from '../Wordmark';

/* real produce (NVIDIA SimReady, CC BY 4.0) floating around the phone */
const FOODS: FieldItem[] = [
  { name: 'onion', x: 0.17, y: 0.22, size: 0.2, depth: 0.9 },
  { name: 'tomato', x: 0.84, y: 0.16, size: 0.17, depth: 0.75 },
  { name: 'naan', x: 0.1, y: 0.72, size: 0.3, depth: 0.6, tilt: 0.9 },
  { name: 'garlic', x: 0.88, y: 0.6, size: 0.16, depth: 0.95 },
  { name: 'karela', x: 0.75, y: 0.93, size: 0.26, depth: 0.45, tilt: 0.6 },
  { name: 'mango', x: 0.27, y: 0.95, size: 0.2, depth: 0.4 },
];

/** The phone shows the app's camera screen, pointed at a real (drawn) thali. */
function SnapScreen() {
  return (
    <div className="app-screen hero-snap">
      <AppHeader title="Snap a meal" back />
      <div className="hero-snap-view">
        <ThaliCanvas scale={0.4} cy={0.28} className="hero-snap-canvas" />
        <span className="vf-corner tl" />
        <span className="vf-corner tr" />
        <span className="vf-corner bl" />
        <span className="vf-corner br" />
        <span className="vf-scan" />
        <span className="hero-snap-found">
          <i />3 foods found
        </span>
      </div>
      <div className="hero-snap-bar">
        <span className="hero-snap-mode is-on">Snap</span>
        <span className="hero-snap-mode">Say</span>
        <span className="hero-snap-mode">Type</span>
      </div>
      <div className="shutter" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-copy">
        <span className="hero-badge">
          <AppMark size={22} />
          Built for Indian home food
        </span>
        <h1 id="hero-title" className="hero-title">
          Your <span className="hl-word">ghar ka khana</span>,
          <br />
          measured.
        </h1>
        <p className="hero-lede">Snap a thali, say “dal chawal”, or type it. Get calories, protein, carbs and fat in the portions you actually eat.</p>
        <div className="hero-actions">
          <Link to="/download" className="btn btn-primary">
            <PlayGlyph />
            Get it on Android
          </Link>
        </div>
      </div>
      <div className="hero-visual">
        <div className="field-host hero-field">
          <FoodField3D items={FOODS} />
        </div>
        <Phone className="hero-phone" label="Macrozy camera screen pointed at a thali">
          <SnapScreen />
        </Phone>
      </div>
    </section>
  );
}

export function PlayGlyph() {
  return (
    <svg width="16" height="18" viewBox="0 0 22 24" aria-hidden="true">
      {/* single-colour on the accent button: black label, like the text */}
      <path d="M1 1.5v21l11-10.5L1 1.5Z" fill="currentColor" />
      <path d="M1 1.5 12 12l3.6-3.4L3 .6C2.2.2 1.5.6 1 1.5Z" fill="currentColor" opacity=".72" />
      <path d="M1 22.5 12 12l3.6 3.4L3 23.4c-.8.4-1.5 0-2-.9Z" fill="currentColor" opacity=".72" />
      <path d="M15.6 8.6 12 12l3.6 3.4 4.3-2.4c1.2-.7 1.2-1.9 0-2.6l-4.3-1.8Z" fill="currentColor" opacity=".5" />
    </svg>
  );
}
