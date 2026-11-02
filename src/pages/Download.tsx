import { useState, type FormEvent } from 'react';
import { Phone } from '@/components/phone/Phone';
import { SplashScreen } from '@/components/phone/screens';

export function Download() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem('website') as HTMLInputElement | null)?.value;
    if (honeypot) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter an email address like name@example.com.');
      return;
    }
    setError('');
    setSent(true);
  };

  return (
    <section className="download">
      <div className="wrap download-grid">
        <div className="download-copy">
          <span className="eyebrow">Download</span>
          <h1 className="display">Start with your next meal.</h1>
          <p className="lede">Macrozy is on Android now. Every Pro feature is free for your first 14 days, no card needed.</p>
          <div className="download-actions">
            <a className="store-btn" href="https://play.google.com/store" target="_blank" rel="noreferrer">
              <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
                <path d="M1 1.5v21l11-10.5L1 1.5Z" fill="#5CBEDE" />
                <path d="M1 1.5 12 12l3.6-3.4L3 .6C2.2.2 1.5.6 1 1.5Z" fill="#63C08A" />
                <path d="M1 22.5 12 12l3.6 3.4L3 23.4c-.8.4-1.5 0-2-.9Z" fill="#EE7285" />
                <path d="M15.6 8.6 12 12l3.6 3.4 4.3-2.4c1.2-.7 1.2-1.9 0-2.6l-4.3-1.8Z" fill="#E8A93F" />
              </svg>
              <span>
                <i>Get it on</i>
                <b>Google Play</b>
              </span>
            </a>
            <div className="qr" aria-label="QR code placeholder">
              <span>QR</span>
            </div>
          </div>

          <div className="waitlist card">
            <h2 className="title-xs">On iPhone? Join the waitlist.</h2>
            {sent ? (
              <p className="form-ok" role="status">
                <span className="dot-ok" aria-hidden="true" />
                You’re on the list. We’ll email {email} once, when Macrozy lands on the App Store.
              </p>
            ) : (
              <form onSubmit={submit} noValidate>
                <label htmlFor="wl-email">Email</label>
                <div className="form-row">
                  <input
                    id="wl-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'wl-error' : 'wl-help'}
                  />
                  <button type="submit" className="btn btn-primary">
                    Notify me
                  </button>
                </div>
                <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                {error ? (
                  <p id="wl-error" className="form-error">
                    {error}
                  </p>
                ) : (
                  <p id="wl-help" className="form-help">
                    One email when the iPhone app launches. Nothing else, and no sharing.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
        <div className="download-visual" aria-hidden="true">
          <div className="hero-halo" />
          <Phone>
            <SplashScreen />
          </Phone>
        </div>
      </div>
    </section>
  );
}
