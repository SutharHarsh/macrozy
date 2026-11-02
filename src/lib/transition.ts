import { COL, clamp01, eBack, eIO, eIn, eOut, lerp } from './katori';
import { holdHeavyWork, prefersReduced } from './motion';

type IrisOpts = {
  /** where the click happened */
  x: number;
  y: number;
  label?: string;
  /** selector for the logo the next page pours out of */
  target: string;
  /** the page is fully covered: swap routes now */
  onCover: () => void;
  onDone?: () => void;
};

const SVGNS = 'http://www.w3.org/2000/svg';
const KR = 14;

/**
 * Page transition, "iris": the page drains into the clicked point, which becomes
 * a katori and drifts to the centre under the next page's label; then the next
 * page pours out of the logo while the katori flies home into it.
 *
 * The pour waits until the new page has mounted and painted, so the route
 * change never lands in the middle of the motion.
 */
export function iris({ x, y, label = '', target, onCover, onDone }: IrisOpts) {
  const release = holdHeavyWork();
  const host = document.createElement('div');
  host.className = 'iris';
  host.setAttribute('aria-hidden', 'true');
  const sv = document.createElementNS(SVGNS, 'svg');
  const sheet = document.createElementNS(SVGNS, 'path');
  sheet.setAttribute('fill', '#000');
  sheet.setAttribute('fill-rule', 'evenodd');
  const cut = document.createElementNS(SVGNS, 'circle');
  cut.setAttribute('fill', '#000');
  const dot = document.createElementNS(SVGNS, 'circle');
  dot.setAttribute('fill', COL[1]);
  sv.append(sheet, cut, dot);
  const lb = document.createElement('div');
  lb.className = 'iris-label';
  lb.textContent = label;
  host.append(sv, lb);
  document.body.appendChild(host);

  const reduced = prefersReduced();
  const GROW = reduced ? 1 : 560;
  const HOLD = reduced ? 1 : 200; // minimum time the katori sits under the label
  const POUR = reduced ? 260 : 600;

  // measured once: the viewport and the logo don't move during a transition
  const W = window.innerWidth;
  const H = window.innerHeight;
  const cx = W / 2;
  const cy = H / 2;
  const L = document.querySelector(target)?.getBoundingClientRect() ?? { left: 24, top: 8, width: 40, height: 40 };
  const lx = L.left + L.width / 2;
  const ly = L.top + L.height / 2;
  const far = (px: number, py: number) => Math.max(Math.hypot(px, py), Math.hypot(W - px, py), Math.hypot(px, H - py), Math.hypot(W - px, H - py));
  const farClick = far(x, y) + 4;
  const farLogo = far(lx, ly) + 4;
  lb.style.top = `${cy + 40}px`;

  const setHole = (hx: number, hy: number, r: number) => {
    const s = r.toFixed(1);
    sheet.setAttribute('d', `M0 0H${W}V${H}H0Z${r > 0.5 ? `M${(hx - r).toFixed(1)} ${hy.toFixed(1)}a${s} ${s} 0 1 0 ${(2 * r).toFixed(1)} 0a${s} ${s} 0 1 0 ${(-2 * r).toFixed(1)} 0Z` : ''}`);
  };
  const setDot = (el: SVGCircleElement, px: number, py: number, r: number) => {
    el.setAttribute('cx', px.toFixed(1));
    el.setAttribute('cy', py.toFixed(1));
    el.setAttribute('r', Math.max(0, r).toFixed(2));
  };

  let t0 = 0;
  let covered = false;
  let settledAt = 0; // ms since t0 when the new page has painted
  let pourAt = 0;
  let finished = false;

  const cover = () => {
    if (covered) return;
    covered = true;
    onCover();
    // two frames after the route change: React has committed and the browser has painted it
    requestAnimationFrame(() => requestAnimationFrame((now) => (settledAt = Math.max(1, now - t0))));
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    cover();
    host.remove();
    release();
    onDone?.();
  };

  const tick = (now: number) => {
    if (!t0) t0 = now;
    const t = now - t0;
    const seg = (a: number, b: number) => clamp01((t - a) / (b - a));
    if (!pourAt && settledAt) pourAt = Math.max(GROW + HOLD, settledAt + 40);

    if (!pourAt || t < pourAt) {
      // drain into the click; the click point becomes a katori and drifts to the centre
      setHole(x, y, lerp(farClick, 0, eIO(seg(0, GROW))));
      const kq = eBack(seg(GROW - 160, GROW + 120));
      const m = eIO(seg(GROW, GROW + HOLD));
      const mx = lerp(x, cx, m);
      const my = lerp(y, cy, m);
      setDot(cut, mx, my, (KR + 3) * kq);
      setDot(dot, mx, my, KR * kq);
      lb.style.opacity = String(eOut(seg(GROW - 40, GROW + 120)));
    } else {
      // pour the next page out of the logo; the katori flies home into it
      const s = eIO(seg(pourAt, pourAt + POUR));
      setHole(lx, ly, lerp(0, farLogo, eIn(s) * 0.6 + eIO(s) * 0.4));
      const mq = eIO(seg(pourAt, pourAt + 260));
      setDot(cut, 0, 0, 0);
      setDot(dot, lerp(cx, lx, mq), lerp(cy, ly, mq), lerp(KR, 0, eIn(mq)));
      lb.style.opacity = String(1 - seg(pourAt - 40, pourAt + 80));
    }

    if (t >= GROW + 40) cover();
    if (pourAt && t >= pourAt + POUR) finish();
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  // a backgrounded tab never ticks; still navigate and clean up
  window.setTimeout(finish, GROW + HOLD + POUR + 2500);
}
