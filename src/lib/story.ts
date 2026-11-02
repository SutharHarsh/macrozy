import { useSyncExternalStore } from 'react';

export type FormationName = 'thali' | 'gap' | 'viewfinder' | 'split' | 'decide' | 'meters' | 'trend' | 'ring';

export type Chapter = {
  id: string;
  label: string;
  /** screens of scroll this chapter gets */
  len: number;
  /** local progress where the crossfade into the next chapter starts */
  ts: number;
  form: FormationName;
};

export const CHAPTERS: Chapter[] = [
  { id: 'kitchen', label: 'Kitchen', len: 1.2, ts: 0.6, form: 'thali' },
  { id: 'lunch', label: 'Lunch', len: 1.2, ts: 0.55, form: 'thali' },
  { id: 'gap', label: 'The gap', len: 1.1, ts: 0.6, form: 'gap' },
  { id: 'capture', label: 'Capture', len: 1.7, ts: 0.82, form: 'viewfinder' },
  { id: 'split', label: 'Split', len: 1.5, ts: 0.8, form: 'split' },
  { id: 'decide', label: 'You decide', len: 2.0, ts: 0.84, form: 'decide' },
  { id: 'day', label: 'The day', len: 1.6, ts: 0.8, form: 'meters' },
  { id: 'week', label: 'The week', len: 1.6, ts: 0.8, form: 'trend' },
  { id: 'start', label: 'Start', len: 1.1, ts: 1, form: 'ring' },
];

export const CH = Object.fromEntries(CHAPTERS.map((c, i) => [c.id, i])) as Record<string, number>;
export const TOTAL = CHAPTERS.reduce((sum, c) => sum + c.len, 0);
const LAST = CHAPTERS.length - 1;

export const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

export function smootherstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (6 * t - 15) + 10);
}

/** Scroll progress 0..1 → story time g, e.g. 3.4 = 40% through chapter 3. */
export function progressToG(p: number): number {
  let rest = clamp01(p) * TOTAL;
  for (let i = 0; i < CHAPTERS.length; i++) {
    const { len } = CHAPTERS[i];
    if (rest <= len || i === LAST) return i + Math.min(rest / len, 1);
    rest -= len;
  }
  return LAST;
}

/** Story time → scroll progress 0..1, for jumping to a chapter. */
export function gToProgress(g: number): number {
  const i = Math.min(Math.floor(g), LAST);
  const before = CHAPTERS.slice(0, i).reduce((sum, c) => sum + c.len, 0);
  return (before + (g - i) * CHAPTERS[i].len) / TOTAL;
}

export function blendAt(g: number) {
  const i = Math.min(Math.max(Math.floor(g), 0), LAST);
  const local = i === LAST ? clamp01(g - LAST) : g - i;
  const e = i === LAST ? 0 : smootherstep(CHAPTERS[i].ts, 1, local);
  return { i, j: Math.min(i + 1, LAST), local, e };
}

/** Visibility of chapter `ch` at time g. Weights of all chapters sum to 1. */
export function weight(ch: number, g: number): number {
  const { i, j, e } = blendAt(g);
  let w = 0;
  if (ch === i) w += 1 - e;
  if (ch === j && j !== i) w += e;
  return w;
}

export const activeChapter = (g: number) => {
  const { i, j, e } = blendAt(g);
  return e > 0.5 ? j : i;
};

/* ---------- store ---------- */
type Listener = (g: number) => void;
const listeners = new Set<Listener>();
let g = 0;
let target = 0;
let chase = false;
let raf = 0;
let last = 0;
let lockUntil = 0;

export const getG = () => g;

function setG(next: number) {
  if (Math.abs(next - g) < 1e-5) return;
  g = next;
  listeners.forEach((fn) => fn(g));
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  fn(g);
  return () => {
    listeners.delete(fn);
  };
}

/** On touch screens without smooth scroll, g chases its target at a capped speed so a flick can't strobe through chapters. */
export function setChase(on: boolean) {
  chase = on;
}

function step(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const gap = target - g;
  const speed = Math.min(1.6, Math.max(0.25, Math.sqrt(10 * Math.abs(gap))));
  const move = Math.min(Math.abs(gap), speed * dt);
  setG(g + Math.sign(gap) * move);
  raf = Math.abs(target - g) > 1e-4 ? requestAnimationFrame(step) : 0;
}

export function setStoryTarget(next: number) {
  target = next;
  if (!chase || performance.now() < lockUntil) {
    cancelAnimationFrame(raf);
    raf = 0;
    setG(next);
    return;
  }
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(step);
  }
}

/** Jump without easing (nav clicks, refresh). */
export function cutStory(next: number) {
  lockUntil = performance.now() + 150;
  target = next;
  cancelAnimationFrame(raf);
  raf = 0;
  setG(next);
}

export function useActiveChapter(): number {
  return useSyncExternalStore(
    (cb) => subscribe(() => cb()),
    () => activeChapter(g),
    () => 0,
  );
}

/** Index of a sub-beat inside one chapter, e.g. Snap / Say / Type thirds of "capture". */
export function useBeat(ch: number, beats: number): number {
  return useSyncExternalStore(
    (cb) => subscribe(() => cb()),
    () => {
      const { i, local } = blendAt(g);
      if (i < ch) return 0;
      if (i > ch) return beats - 1;
      return Math.min(beats - 1, Math.floor((local / CHAPTERS[ch].ts) * beats));
    },
    () => 0,
  );
}
