import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Wordmark } from './Wordmark';
import { getLenis } from '@/lib/motion';

const LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/food', label: 'Food explorer' },
  { to: '/science', label: 'How it works' },
  { to: '/pricing', label: 'Pricing' },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    document.documentElement.classList.toggle('scroll-lock', open);
    if (open) lenis?.stop();
    else lenis?.start();
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-brand" aria-label="Macrozy home">
          <Wordmark size={24} />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <Link to="/download" className="btn btn-primary btn-sm">
            Get the app
          </Link>
          <button type="button" className="nav-burger" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            <span />
            <span />
          </button>
        </div>
      </div>
      <div id="mobile-menu" className="nav-menu" hidden={!open}>
        <nav aria-label="Mobile">
          <NavLink to="/" end>
            Home
          </NavLink>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to}>
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/download">Download</NavLink>
        </nav>
      </div>
    </header>
  );
}
