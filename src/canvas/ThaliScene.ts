import { CH, CHAPTERS, blendAt, clamp01, weight } from '@/lib/story';
import { drawMeters, drawRing, drawWeek, meterRowY } from './dataLayer';

/**
 * The whole story, drawn by hand. A 2.5D lunch (steel katoris, a rice mound,
 * salad and garnish on a steel plate) is captured and split; then each food
 * flies into its macro meter, and the day becomes a trend and a ring.
 * Each chapter is a keyframe; story time g blends between them.
 */

export type Box = { cx: number; cy: number; s: number };

/** Deterministic PRNG so the drawn detail is identical on every frame. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Item = { x: number; y: number; r: number; lift: number; a: number };
type State = {
  plate: number;
  scale: number;
  gray: number;
  frame: number;
  scan: number;
  dal: Item;
  rice: Item;
  salad: Item;
  garnish: number;
};

export type SceneParams = { dalKatori: number; riceGrams: number };

const TILT = 0.56;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixItem = (a: Item, b: Item, t: number): Item => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  r: mix(a.r, b.r, t),
  lift: mix(a.lift, b.lift, t),
  a: mix(a.a, b.a, t),
});

const ON_PLATE = {
  dal: { x: -0.4, y: -0.3, r: 0.27, lift: 0, a: 1 },
  salad: { x: 0.38, y: -0.34, r: 0.23, lift: 0, a: 1 },
  rice: { x: -0.04, y: 0.32, r: 0.36, lift: 0, a: 1 },
};

function stateFor(k: number, p: SceneParams): State {
  const sDal = Math.min(1.45, Math.sqrt(p.dalKatori));
  const sRice = Math.min(1.45, Math.sqrt(p.riceGrams / 150));
  const split = (dal: number, rice: number): Pick<State, 'dal' | 'rice' | 'salad'> => ({
    dal: { x: -0.74, y: 0.04, r: 0.25 * dal, lift: 0.16, a: 1 },
    rice: { x: 0, y: 0.04, r: 0.33 * rice, lift: 0.16, a: 1 },
    salad: { x: 0.74, y: 0.04, r: 0.22, lift: 0.16, a: 1 },
  });
  const base: State = { plate: 1, scale: 1, gray: 0, frame: 0, scan: 0, garnish: 1, ...ON_PLATE };
  switch (k) {
    case CH.lunch:
      return base;
    case CH.gap:
      return { ...base, gray: 1, scale: 0.94 };
    case CH.capture:
      return { ...base, scale: 0.82, frame: 1, scan: 1 };
    case CH.split:
      return { ...base, plate: 0, garnish: 0, ...split(1, 1) };
    case CH.decide:
      return { ...base, plate: 0, garnish: 0, ...split(sDal, sRice) };
    default: {
      // each food flies to the start of its own meter and dissolves into it
      const toMeter = (row: number): Item => ({ x: -0.92, y: meterRowY(row) / TILT, r: 0.07, lift: 0, a: 0 });
      return { ...base, plate: 0, garnish: 0, dal: toMeter(1), rice: toMeter(2), salad: toMeter(4) };
    }
  }
}

/* deterministic detail, generated once */
const R = mulberry32(7);
const GRAINS = Array.from({ length: 90 }, () => ({ u: R() * 2 - 1, v: R(), rot: R() * Math.PI, l: 0.7 + R() * 0.6 }));
const SPECKS = Array.from({ length: 26 }, () => ({ a: R() * Math.PI * 2, d: Math.sqrt(R()) * 0.75, c: R() < 0.55 ? 0 : 1, s: 0.6 + R() * 0.8 }));
const SLICES = Array.from({ length: 7 }, (_, i) => ({ a: (i / 7) * Math.PI * 2 + R() * 0.4, d: i === 0 ? 0 : 0.42 + R() * 0.18, s: 0.3 + R() * 0.08 }));

export class ThaliScene {
  private ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private box: Box = { cx: 0, cy: 0, s: 1 };
  private g = 0;
  private params: SceneParams = { dalKatori: 1, riceGrams: 150 };
  private shown: SceneParams = { dalKatori: 1, riceGrams: 150 };
  private raf = 0;
  private last = 0;
  private running = false;
  private current: State = stateFor(0, this.params);
  /** Called after every drawn frame, e.g. to move DOM labels with the food. */
  onDraw: (() => void) | null = null;

  constructor(private canvas: HTMLCanvasElement, private still = false) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
  }

  resize(width: number, height: number) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = width;
    this.h = height;
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.kick();
  }

  setBox(box: Box) {
    this.box = box;
    this.kick();
  }

  setG(g: number) {
    this.g = g;
    this.kick();
  }

  setParams(p: SceneParams) {
    this.params = p;
    this.kick();
  }

  start() {
    this.running = true;
    this.kick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Screen anchors for the floating food labels. */
  anchors(): Record<'dal' | 'rice' | 'salad', [number, number]> {
    const s = this.current;
    const out = {} as Record<'dal' | 'rice' | 'salad', [number, number]>;
    for (const key of ['dal', 'rice', 'salad'] as const) {
      const it = s[key];
      const [x, y] = this.project(it.x * s.scale, it.y * s.scale);
      out[key] = [x, y - (it.lift + it.r * s.scale * 0.9) * this.box.s - 18];
    }
    return out;
  }

  private project(ux: number, uy: number): [number, number] {
    return [this.box.cx + ux * this.box.s, this.box.cy + uy * TILT * this.box.s];
  }

  private kick() {
    if (!this.running || this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    this.raf = 0;
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    const k = this.still ? 1 : 1 - Math.exp(-dt * 9);
    this.shown.dalKatori += (this.params.dalKatori - this.shown.dalKatori) * k;
    this.shown.riceGrams += (this.params.riceGrams - this.shown.riceGrams) * k;
    const visible = this.draw(now / 1000);
    if (this.running && visible && !this.still) this.raf = requestAnimationFrame(this.frame);
  };

  private stateAt(): State {
    const { i, j, e } = blendAt(this.g);
    const A = stateFor(i, this.shown);
    const B = stateFor(j, this.shown);
    const t = ease(e);
    // items leave in a small stagger so the plate comes apart rather than teleporting
    const st = (d: number) => ease(clamp01((e - d) / (1 - d)));
    return {
      plate: mix(A.plate, B.plate, t),
      scale: mix(A.scale, B.scale, t),
      gray: mix(A.gray, B.gray, t),
      frame: mix(A.frame, B.frame, t),
      scan: mix(A.scan, B.scan, t),
      garnish: mix(A.garnish, B.garnish, t),
      dal: mixItem(A.dal, B.dal, st(0)),
      rice: mixItem(A.rice, B.rice, st(0.12)),
      salad: mixItem(A.salad, B.salad, st(0.24)),
    };
  }

  /** Returns false when nothing is visible, so the loop can rest. */
  private draw(t: number): boolean {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    const s = this.stateAt();
    this.current = s;

    // data chapters depend only on scroll, so they never keep the loop awake
    const { i } = blendAt(this.g);
    const localOf = (k: number) => (i === k ? blendAt(this.g).local / CHAPTERS[k].ts : i > k ? 1 : 0);
    const { cx, cy, s: bs } = this.box;
    const wDay = weight(CH.day, this.g);
    const wWeek = weight(CH.week, this.g);
    const wStart = weight(CH.start, this.g);
    if (wDay > 0.005) drawMeters(ctx, cx, cy, bs, wDay, Math.min(1, localOf(CH.day)));
    if (wWeek > 0.005) drawWeek(ctx, cx, cy, bs, wWeek, Math.min(1, localOf(CH.week)));
    if (wStart > 0.005) drawRing(ctx, cx, cy, bs, wStart, Math.min(1, localOf(CH.start) || 0));

    const food = s.plate > 0.01 || s.dal.a > 0.01 || s.rice.a > 0.01 || s.salad.a > 0.01;
    if (!food) {
      this.onDraw?.();
      return false;
    }

    ctx.save();
    if (s.gray > 0.01) ctx.filter = `grayscale(${s.gray.toFixed(2)}) blur(${(s.gray * 1.4).toFixed(2)}px)`;

    const S = this.box.s * s.scale;
    if (s.plate > 0.01) this.drawPlate(S, s.plate);

    const items: ['dal' | 'rice' | 'salad', Item][] = [
      ['dal', s.dal],
      ['salad', s.salad],
      ['rice', s.rice],
    ];
    // painter's order: back (smaller y) first
    items.sort((a, b) => a[1].y - b[1].y);
    for (const [name, it] of items) {
      if (it.a < 0.01) continue;
      const [x, y] = this.project(it.x * s.scale, it.y * s.scale);
      const r = it.r * S;
      const lift = it.lift * this.box.s;
      const bob = it.lift > 0.01 && !this.still ? Math.sin(t * 1.6 + it.x * 3) * 3 * (it.lift / 0.16) : 0;
      ctx.globalAlpha = it.a;
      this.shadow(x, y + r * TILT * 0.35, r * 1.05, it.lift > 0.01 ? 0.1 : 0.16);
      if (name === 'rice') this.drawRice(x, y - lift + bob, r);
      else this.drawKatori(x, y - lift + bob, r, name);
      if (name !== 'salad' && s.gray < 0.5) this.steam(x, y - lift + bob - r * 0.6, r, t, it.a * (1 - s.gray));
    }
    ctx.globalAlpha = 1;
    if (s.garnish > 0.01) this.drawGarnish(S, s.garnish * (s.dal.a > 0 ? 1 : 0));
    ctx.restore();

    if (s.frame > 0.01) this.drawFrame(S, s.frame);
    if (s.scan > 0.01) this.drawScan(S, s.scan, t);
    this.onDraw?.();
    return true;
  }

  private shadow(x: number, y: number, rx: number, alpha: number) {
    const { ctx } = this;
    const ry = rx * TILT * 0.9;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
    g.addColorStop(0, `rgba(30,36,48,${alpha})`);
    g.addColorStop(1, 'rgba(30,36,48,0)');
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    ctx.translate(-x, -y);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rx * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawPlate(S: number, a: number) {
    const { ctx } = this;
    const [cx, cy] = this.project(0, 0);
    const R = 0.98 * S;
    ctx.globalAlpha = a;
    this.shadow(cx, cy + R * TILT * 0.18, R * 1.02, 0.14);
    // rim, slightly thick
    ctx.fillStyle = '#c9ced6';
    ctx.beginPath();
    ctx.ellipse(cx, cy + R * 0.035, R, R * TILT, 0, 0, Math.PI * 2);
    ctx.fill();
    const rim = ctx.createLinearGradient(cx - R, cy - R * TILT, cx + R, cy + R * TILT);
    rim.addColorStop(0, '#ffffff');
    rim.addColorStop(0.45, '#e6e9ee');
    rim.addColorStop(1, '#d4d8df');
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * TILT, 0, 0, Math.PI * 2);
    ctx.fill();
    // well
    const well = ctx.createRadialGradient(cx - R * 0.2, cy - R * TILT * 0.4, R * 0.1, cx, cy, R * 0.86);
    well.addColorStop(0, '#f7f8fa');
    well.addColorStop(1, '#e2e5ea');
    ctx.fillStyle = well;
    ctx.beginPath();
    ctx.ellipse(cx, cy + R * 0.01, R * 0.85, R * 0.85 * TILT, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,48,60,0.08)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // highlight along the top rim
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 0.97, R * 0.97 * TILT, 0, Math.PI * 1.08, Math.PI * 1.75);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  private drawKatori(x: number, y: number, r: number, kind: 'dal' | 'salad') {
    const { ctx } = this;
    const ry = r * TILT;
    const depth = r * 0.62;
    // steel body
    const body = ctx.createLinearGradient(x - r, 0, x + r, 0);
    body.addColorStop(0, '#8d949e');
    body.addColorStop(0.3, '#e9ecf0');
    body.addColorStop(0.55, '#b9c0c9');
    body.addColorStop(0.8, '#f2f4f6');
    body.addColorStop(1, '#9aa1ab');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(x, y, r, ry + depth, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    // rim
    ctx.fillStyle = '#eef0f3';
    ctx.beginPath();
    ctx.ellipse(x, y, r, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(70,78,90,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // contents
    const ir = r * 0.86;
    const iry = ry * 0.86;
    const cy = y + ry * 0.06;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, cy, ir, iry, 0, 0, Math.PI * 2);
    ctx.clip();
    if (kind === 'dal') {
      const g = ctx.createRadialGradient(x - ir * 0.25, cy - iry * 0.3, ir * 0.05, x, cy, ir);
      g.addColorStop(0, '#f6c35a');
      g.addColorStop(0.7, '#e3a02c');
      g.addColorStop(1, '#c4801a');
      ctx.fillStyle = g;
      ctx.fillRect(x - ir, cy - iry, ir * 2, iry * 2);
      for (const sp of SPECKS) {
        const px = x + Math.cos(sp.a) * sp.d * ir;
        const py = cy + Math.sin(sp.a) * sp.d * iry;
        ctx.fillStyle = sp.c ? '#3f8a3a' : '#8a2d12';
        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.035 * sp.s, r * 0.022 * sp.s, sp.a, 0, Math.PI * 2);
        ctx.fill();
      }
      // a glint of ghee
      ctx.fillStyle = 'rgba(255,240,190,0.55)';
      ctx.beginPath();
      ctx.ellipse(x - ir * 0.3, cy - iry * 0.35, ir * 0.22, iry * 0.12, -0.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#d7ecc2';
      ctx.fillRect(x - ir, cy - iry, ir * 2, iry * 2);
      for (const sl of SLICES) {
        const px = x + Math.cos(sl.a) * sl.d * ir;
        const py = cy + Math.sin(sl.a) * sl.d * iry;
        const sr = sl.s * ir;
        ctx.fillStyle = '#4f8a35';
        ctx.beginPath();
        ctx.ellipse(px, py, sr, sr * TILT, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e4f5cf';
        ctx.beginPath();
        ctx.ellipse(px, py, sr * 0.84, sr * 0.84 * TILT, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(160,200,120,0.7)';
        ctx.beginPath();
        ctx.ellipse(px, py, sr * 0.3, sr * 0.3 * TILT, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // onion rings
      ctx.strokeStyle = 'rgba(190,70,120,0.75)';
      ctx.lineWidth = Math.max(1, r * 0.03);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(x + (i - 1) * ir * 0.45, cy + iry * (i % 2 ? 0.35 : -0.25), ir * 0.18, iry * 0.14, i, 0.3, Math.PI * 1.6);
        ctx.stroke();
      }
    }
    // inner shadow at the far wall
    const sh = ctx.createLinearGradient(0, cy - iry, 0, cy + iry * 0.2);
    sh.addColorStop(0, 'rgba(40,30,20,0.28)');
    sh.addColorStop(1, 'rgba(40,30,20,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(x - ir, cy - iry, ir * 2, iry * 1.2);
    ctx.restore();
    // rim highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = Math.max(1, r * 0.035);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.96, ry * 0.96, 0, Math.PI * 1.1, Math.PI * 1.7);
    ctx.stroke();
  }

  private drawRice(x: number, y: number, r: number) {
    const { ctx } = this;
    const ry = r * TILT;
    const domeH = r * 0.5;
    // base
    ctx.fillStyle = '#e7dcc4';
    ctx.beginPath();
    ctx.ellipse(x, y, r, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    // dome
    const g = ctx.createRadialGradient(x - r * 0.35, y - domeH * 1.1, r * 0.05, x, y - domeH * 0.4, r * 1.05);
    g.addColorStop(0, '#fffefb');
    g.addColorStop(0.6, '#f4ecdb');
    g.addColorStop(1, '#dccfb2');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.bezierCurveTo(x - r * 0.95, y - domeH * 1.5, x + r * 0.95, y - domeH * 1.5, x + r, y);
    ctx.ellipse(x, y, r, ry, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    // grains
    ctx.save();
    ctx.clip();
    for (const gr of GRAINS) {
      const px = x + gr.u * r * 0.92;
      const top = y - domeH * 1.12 * (1 - gr.u * gr.u);
      const py = mix(top, y + ry * 0.7, gr.v);
      ctx.fillStyle = gr.v > 0.75 ? '#efe4ca' : '#fffdf6';
      ctx.strokeStyle = 'rgba(150,130,90,0.22)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(px, py, r * 0.055 * gr.l, r * 0.02 * gr.l, gr.rot, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    // coriander leaf on top
    ctx.fillStyle = '#4c9a3c';
    ctx.beginPath();
    ctx.ellipse(x + r * 0.12, y - domeH * 0.98, r * 0.07, r * 0.04, -0.5, 0, Math.PI * 2);
    ctx.ellipse(x + r * 0.2, y - domeH * 0.94, r * 0.06, r * 0.035, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawGarnish(S: number, a: number) {
    if (a < 0.01) return;
    const { ctx } = this;
    ctx.globalAlpha = a;
    // lime wedge
    const [lx, ly] = this.project(0.52, 0.2);
    const lr = 0.11 * S;
    ctx.fillStyle = '#6f9e2c';
    ctx.beginPath();
    ctx.ellipse(lx, ly, lr, lr * TILT, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d9ef9a';
    ctx.beginPath();
    ctx.ellipse(lx, ly - 1, lr * 0.85, lr * 0.85 * TILT, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const ang = Math.PI + (i / 4) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(lx, ly - 1);
      ctx.lineTo(lx + Math.cos(ang) * lr * 0.8, ly - 1 + Math.sin(ang) * lr * 0.8 * TILT);
      ctx.stroke();
    }
    // green chilli
    const [cx, cy] = this.project(0.42, 0.52);
    ctx.strokeStyle = '#2f7a2c';
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.045 * S;
    ctx.beginPath();
    ctx.moveTo(cx - 0.16 * S, cy + 0.02 * S);
    ctx.quadraticCurveTo(cx, cy - 0.06 * S, cx + 0.14 * S, cy - 0.01 * S);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(160,220,120,0.6)';
    ctx.lineWidth = 0.012 * S;
    ctx.beginPath();
    ctx.moveTo(cx - 0.12 * S, cy - 0.005 * S);
    ctx.quadraticCurveTo(cx, cy - 0.06 * S, cx + 0.1 * S, cy - 0.03 * S);
    ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.globalAlpha = 1;
  }

  private steam(x: number, y: number, r: number, t: number, a: number) {
    if (this.still || a < 0.05) return;
    const { ctx } = this;
    ctx.lineWidth = Math.max(1.2, r * 0.035);
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const phase = (t * 0.35 + i / 3) % 1;
      const sx = x + (i - 1) * r * 0.32;
      const sy = y - phase * r * 0.9;
      const alpha = Math.sin(phase * Math.PI) * 0.32 * a;
      ctx.strokeStyle = `rgba(130,140,155,${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(sx + r * 0.12, sy - r * 0.15, sx - r * 0.12, sy - r * 0.3, sx, sy - r * 0.45);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }

  private drawFrame(S: number, a: number) {
    const { ctx } = this;
    const [cx, cy] = this.project(0, 0);
    const hw = 1.18 * S;
    const hh = 0.98 * S * TILT + 0.3 * S;
    const arm = 0.26 * S;
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#5a8def';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const [sx, sy] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const x = cx + sx * hw;
      const y = cy - 0.06 * S + sy * hh;
      ctx.beginPath();
      ctx.moveTo(x - sx * arm, y);
      ctx.quadraticCurveTo(x, y, x, y - sy * arm);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
    ctx.globalAlpha = 1;
  }

  private drawScan(S: number, a: number, t: number) {
    const { ctx } = this;
    const [cx, cy] = this.project(0, 0);
    const hw = 1.1 * S;
    const hh = 0.98 * S * TILT + 0.22 * S;
    const p = this.still ? 0.5 : (Math.sin(t * 1.4) + 1) / 2;
    const y = cy - 0.06 * S - hh + p * hh * 2;
    const g = ctx.createLinearGradient(cx - hw, 0, cx + hw, 0);
    g.addColorStop(0, 'rgba(90,141,239,0)');
    g.addColorStop(0.5, `rgba(90,141,239,${0.9 * a})`);
    g.addColorStop(1, 'rgba(90,141,239,0)');
    ctx.save();
    ctx.shadowColor = 'rgba(90,141,239,0.6)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = g;
    ctx.fillRect(cx - hw, y - 1, hw * 2, 2.5);
    ctx.restore();
  }
}

