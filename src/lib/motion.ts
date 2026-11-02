import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSyncExternalStore } from 'react';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = '(prefers-reduced-motion: reduce)';
const TOUCH = '(pointer: coarse) and (hover: none)';

let lenis: Lenis | null = null;

export const getLenis = () => lenis;
export const prefersReduced = () => window.matchMedia(REDUCED).matches;
export const isTouch = () => window.matchMedia(TOUCH).matches;

/** Lenis for mouse and trackpad only; touch and reduced motion keep native scroll. */
export function startSmoothScroll(): () => void {
  if (prefersReduced() || isTouch()) {
    document.documentElement.classList.add('native-scroll');
    return () => document.documentElement.classList.remove('native-scroll');
  }
  const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
  instance.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  lenis = instance;
  return () => {
    gsap.ticker.remove(tick);
    instance.destroy();
    lenis = null;
  };
}

/* The motion gate: while the preloader or a page transition is on screen,
   heavy work (model parsing, shader compiles, first WebGL frames) waits, so the
   animation keeps the main thread to itself. */
let holds = 0;
let waiting: (() => void)[] = [];

/** Hold heavy work until the returned release is called. */
export function holdHeavyWork(): () => void {
  holds++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--holds > 0) return;
    // two frames: let the last animation frame paint before the work lands
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (holds > 0) return;
        const run = waiting;
        waiting = [];
        run.forEach((fn) => fn());
      }),
    );
  };
}

/** Run `fn` once nothing holds the gate. Returns a cancel function. */
export function afterMotion(fn: () => void): () => void {
  if (holds === 0) {
    fn();
    return () => {};
  }
  waiting.push(fn);
  return () => {
    waiting = waiting.filter((f) => f !== fn);
  };
}

export function scrollToY(y: number, immediate = false) {
  if (lenis) lenis.scrollTo(y, { immediate, duration: immediate ? 0 : 1.1 });
  else window.scrollTo({ top: y, behavior: immediate || prefersReduced() ? 'auto' : 'smooth' });
}

function subscribeQuery(query: string) {
  return (onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  };
}

const subscribeReduced = subscribeQuery(REDUCED);
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, prefersReduced, () => false);
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribeQuery(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export { gsap, ScrollTrigger };
