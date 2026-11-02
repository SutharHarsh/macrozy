import { useEffect, useRef, useState } from 'react';
import { COL, clamp01, eIO, eIn, eOut, eOut4, lerp } from '@/lib/katori';
import { getLenis, holdHeavyWork, prefersReduced } from '@/lib/motion';

const SEEN = 'mz-preloader-seen';
/** the o rolls protein → carbs → fat, four times round, and stops on fat */
const SEQ = [1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2];
const CAPTIONS = ['Protein gin rahe hain', 'Carbs gin rahe hain', 'Fat gin rahe hain'];
/** where the word lands: the word half of the nav lockup */
const TARGET = '.nav-brand .wordmark-word';
/** fetched (not parsed) while the bar fills, so the 3D scenes start from cache */
const MODELS = ['onion', 'tomato', 'naan', 'garlic', 'karela', 'mango', 'lime', 'potato', 'baingan', 'bowl_white', 'bowl_terracotta', 'kettle', 'cup', 'board'];

function shouldPlay() {
  try {
    return !sessionStorage.getItem(SEEN);
  } catch {
    return true;
  }
}

/**
 * Preloader, "word" style: a big macrozy whose o rolls through the three macros
 * while a steel bar fills. Then the word flies into the nav as a hole opens from
 * the centre to reveal the page. Plays once per session.
 *
 * Every frame only sets transforms, opacity and a few SVG attributes; all
 * measuring happens up front, so nothing forces layout mid-animation.
 */
export function Preloader() {
  const [on, setOn] = useState(shouldPlay);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!on) return;
    const root = rootRef.current!;
    const $ = <T extends Element>(sel: string) => root.querySelector(sel) as T;
    const sheet = $<SVGPathElement>('.pl-sheet path');
    const rim = $<SVGCircleElement>('.pl-sheet circle');
    const wd = $<HTMLDivElement>('.pl-word');
    const strip = $<SVGGElement>('.pl-strip');
    const bar = $<HTMLDivElement>('.pl-bar');
    const barf = $<HTMLElement>('.pl-bar i');
    const tx = $<HTMLDivElement>('.pl-text');
    const pc = $<HTMLDivElement>('.pl-pc');
    const lb = $<HTMLDivElement>('.pl-lb');
    const html = document.documentElement;
    html.classList.add('mz-hold-hero', 'mz-hide-word');
    const release = holdHeavyWork();
    try {
      sessionStorage.setItem(SEEN, '1');
    } catch {
      /* private mode: it just plays again next time */
    }
    MODELS.forEach((m) => fetch(`/models/${m}.glb`).catch(() => {}));

    const T = prefersReduced() ? { fill: 300, swap: 300, out: [300, 600] } : { fill: 2000, swap: 2000, out: [2150, 3000] };

    // ---- measure once (and again on resize / when the font lands) ----
    let W = 0;
    let H = 0;
    let cx = 0;
    let cy = 0;
    let w0 = 1;
    let h0 = 1;
    let land = { left: 24, top: 20, scale: 0.25 };
    const measure = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cx = W / 2;
      cy = H / 2 - 40;
      w0 = wd.offsetWidth || 1;
      h0 = wd.offsetHeight || 1;
      const L = document.querySelector(TARGET)?.getBoundingClientRect();
      if (L) land = { left: L.left, top: L.top, scale: L.height / h0 || 0.25 };
      const bw = Math.min(w0, 420);
      bar.style.left = `${cx - bw / 2}px`;
      bar.style.top = `${cy + h0 / 2 + 34}px`;
      bar.style.width = `${bw}px`;
      tx.style.top = `${cy + h0 / 2 + 62}px`;
      rim.setAttribute('cx', String(cx));
      rim.setAttribute('cy', String(cy));
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);

    let lastCap = -1;
    let lastPc = -1;
    const draw = (t: number) => {
      const seg = (a: number, b: number) => clamp01((t - a) / (b - a));
      const x = clamp01(t / T.fill);
      const p = clamp01(x + 0.035 * Math.sin(6 * Math.PI * x));
      const om = eIO(seg(T.out[0], T.out[1]));
      const hole = eIn(seg(T.out[0] + 80, T.out[1])) * Math.hypot(W, H) * 1.05;

      const r = hole.toFixed(1);
      sheet.setAttribute('d', `M0 0H${W}V${H}H0Z${hole > 0.5 ? `M${cx - hole} ${cy}a${r} ${r} 0 1 0 ${2 * hole} 0a${r} ${r} 0 1 0 ${-2 * hole} 0Z` : ''}`);
      rim.setAttribute('r', r);

      // the word: centred, then into the nav at the nav's size
      const px = lerp(cx - w0 / 2, land.left, om);
      const py = lerp(cy - h0 / 2, land.top, om);
      wd.style.transform = `translate3d(${px}px, ${py}px, 0) scale(${lerp(1, land.scale, om)})`;

      // the o: a strip of katoris rolling past behind a circular mask
      strip.setAttribute('transform', `translate(0 ${(-(SEQ.length - 1) * eOut4(p) * 120).toFixed(2)})`);

      bar.style.opacity = String(1 - seg(T.out[0], T.out[0] + 200));
      barf.style.transform = `scaleX(${p})`;

      const cap = Math.min(2, Math.floor(p * 3));
      if (cap !== lastCap) tx.textContent = CAPTIONS[(lastCap = cap)];
      tx.style.opacity = String((1 - eOut(seg(T.swap - 100, T.swap + 200))) * eOut(seg(200, 600)) * (1 - seg(T.out[0] - 150, T.out[0])));
      tx.style.transform = `translate3d(0, ${(1 - eOut(seg(200, 700))) * 10}px, 0)`;

      const pct = Math.round(p * 100);
      if (pct !== lastPc) pc.textContent = `${String((lastPc = pct)).padStart(3, '0')} / 100`;
      const meta = String(Math.min(eOut(seg(100, 500)), 1 - seg(T.out[0], T.out[0] + 200)));
      pc.style.opacity = meta;
      lb.style.opacity = meta;
    };

    let raf = 0;
    let start = 0;
    let revealed = false;
    let done = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      html.classList.remove('mz-hold-hero');
    };
    const finish = () => {
      if (done) return;
      done = true;
      reveal();
      cancelAnimationFrame(raf);
      html.classList.remove('mz-hide-word');
      getLenis()?.start();
      release();
      setOn(false);
    };
    const tick = (now: number) => {
      if (!start) {
        start = now;
        getLenis()?.stop();
      }
      const t = now - start;
      draw(t);
      if (t >= T.out[0]) reveal();
      if (t >= T.out[1]) finish();
      else raf = requestAnimationFrame(tick);
    };
    draw(0);
    raf = requestAnimationFrame(tick);
    // a backgrounded tab never ticks; don't leave the page covered
    const safety = window.setTimeout(finish, T.out[1] + 2500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      window.removeEventListener('resize', measure);
      html.classList.remove('mz-hold-hero', 'mz-hide-word');
      getLenis()?.start();
      release();
    };
  }, [on]);

  if (!on) return null;
  return (
    <div ref={rootRef} className="preloader" role="progressbar" aria-label="Loading Macrozy">
      <svg className="pl-sheet" aria-hidden="true">
        <path fill="#000" fillRule="evenodd" />
        <circle fill="none" stroke="#2C2C2E" strokeWidth="1" r="0" />
      </svg>
      <div className="pl-word" aria-hidden="true">
        <span>macr</span>
        <svg className="wordmark-o" viewBox="0 0 100 100">
          <clipPath id="mz-pl-oc">
            <circle cx="50" cy="50" r="50" />
          </clipPath>
          <g clipPath="url(#mz-pl-oc)">
            <g className="pl-strip">
              {SEQ.map((c, j) => (
                <circle key={j} cx="50" cy={50 + j * 120} r="50" fill={COL[c]} />
              ))}
            </g>
          </g>
        </svg>
        <span>zy</span>
      </div>
      <div className="pl-bar" aria-hidden="true">
        <i />
      </div>
      <div className="pl-text" aria-hidden="true" />
      <div className="pl-pc tabular" aria-hidden="true" />
      <div className="pl-lb" aria-hidden="true">
        MACROZY.APP
      </div>
    </div>
  );
}
