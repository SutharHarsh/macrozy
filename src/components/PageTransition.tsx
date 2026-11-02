import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { iris } from '@/lib/transition';

const LABELS: Record<string, string> = {
  '/': '01 · HOME',
  '/features': '02 · FEATURES',
  '/food': '03 · FOOD EXPLORER',
  '/science': '04 · HOW IT WORKS',
  '/pricing': '05 · PRICING',
  '/download': '06 · DOWNLOAD',
};

/**
 * Runs the iris transition for every internal link to another page.
 * Listens in the capture phase so it gets the click before React Router's Link.
 */
export function PageTransition() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const path = useRef(pathname);
  path.current = pathname;
  const busy = useRef(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === path.current) return;
      // the preloader is still running: plain navigation
      if (document.documentElement.classList.contains('mz-hide-word')) return;
      e.preventDefault();
      e.stopPropagation();
      if (busy.current) return;
      busy.current = true;
      // keyboard activation has no pointer position: drain into the link itself
      const r = a.getBoundingClientRect();
      const kb = e.detail === 0;
      iris({
        x: kb ? r.left + r.width / 2 : e.clientX,
        y: kb ? r.top + r.height / 2 : e.clientY,
        label: LABELS[url.pathname] ?? '',
        target: '.nav-brand .wordmark-icon',
        onCover: () => navigate(url.pathname + url.search + url.hash),
        onDone: () => (busy.current = false),
      });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);

  return null;
}
