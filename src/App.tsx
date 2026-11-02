import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Preloader } from './components/Preloader';
import { PageTransition } from './components/PageTransition';
import { ScrollTrigger, scrollToY, startSmoothScroll } from './lib/motion';
import { Home } from './pages/Home';
import { Features } from './pages/Features';
import { FoodExplorer } from './pages/FoodExplorer';
import { Science } from './pages/Science';
import { Pricing } from './pages/Pricing';
import { Download } from './pages/Download';
import { NotFound } from './pages/NotFound';

export function App() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => startSmoothScroll(), []);

  /* new route: jump to top, refresh triggers, move focus to the page heading */
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        requestAnimationFrame(() => scrollToY(el.getBoundingClientRect().top + window.scrollY - 80, true));
        return;
      }
    }
    scrollToY(0, true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const h1 = mainRef.current?.querySelector('h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  }, [location.pathname, location.hash]);

  /* layout changes after fonts and images load */
  useEffect(() => {
    let t = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main" ref={mainRef} key={location.pathname} className="page-enter">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/food" element={<FoodExplorer />} />
          <Route path="/science" element={<Science />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/download" element={<Download />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Preloader />
      <PageTransition />
    </>
  );
}
