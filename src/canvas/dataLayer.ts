/**
 * The "food becomes data" chapters, drawn by hand on the story canvas:
 * glossy macro meters, a weight trend with streak coins, and the day's ring.
 * Every function takes the stage box (cx, cy, s), an alpha and a 0..1 progress.
 */
type Ctx = CanvasRenderingContext2D;

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c = 1.6;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

let family = '';
function font(weight: number, px: number) {
  if (!family) family = getComputedStyle(document.body).fontFamily || 'system-ui, sans-serif';
  return `${weight} ${Math.round(px)}px ${family}`;
}

function capsule(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const r = Math.min(h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + r, r, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
}

function pill(ctx: Ctx, text: string, x: number, y: number, px: number, bg: string, fg: string, align: 'left' | 'right' | 'center' = 'center') {
  ctx.font = font(700, px);
  const w = ctx.measureText(text).width + px * 1.4;
  const h = px * 2;
  const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.shadowColor = 'rgba(18,19,22,0.12)';
  ctx.shadowBlur = px;
  ctx.shadowOffsetY = px * 0.3;
  ctx.fillStyle = bg;
  capsule(ctx, left, y - h / 2, w, h);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, left + w / 2, y + px * 0.05);
}

/* ---------------- the day: five meters ---------------- */
export const METER_ROWS = [
  { name: 'Calories', now: 1640, target: 2100, unit: 'kcal', c1: '#e4e7ea', c2: '#b4bac1' },
  { name: 'Protein', now: 112, target: 140, unit: 'g', c1: '#ffb066', c2: '#ff9230' },
  { name: 'Carbs', now: 189, target: 262, unit: 'g', c1: '#5ee07c', c2: '#30d158' },
  { name: 'Fat', now: 36, target: 58, unit: 'g', c1: '#ffe14d', c2: '#ffd600' },
  { name: 'Fiber', now: 17, target: 30, unit: 'g', c1: '#8fdfff', c2: '#64d2ff' },
];
/** Vertical position of meter row k, as a multiple of s from the centre. */
export const meterRowY = (k: number) => -0.62 + k * 0.31;

export function drawMeters(ctx: Ctx, cx: number, cy: number, s: number, alpha: number, p: number) {
  const x0 = cx - 0.95 * s;
  const W = 1.9 * s;
  const H = Math.max(10, 0.085 * s);
  const fs = Math.min(17, Math.max(12, 0.055 * s));
  ctx.save();
  ctx.globalAlpha = alpha;
  METER_ROWS.forEach((row, k) => {
    const y = cy + meterRowY(k) * s;
    const t = easeOut(clamp01((p - k * 0.07) / 0.5));
    const fill = (row.now / row.target) * t;

    ctx.font = font(700, fs);
    ctx.fillStyle = '#1f1f1f';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(row.name, x0, y - H * 0.95);
    ctx.font = font(600, fs);
    ctx.fillStyle = '#737373';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(row.now * t).toLocaleString('en-IN')} / ${row.target.toLocaleString('en-IN')} ${row.unit}`, x0 + W, y - H * 0.95);

    // track with a soft inner shade
    ctx.fillStyle = 'rgba(18,19,22,0.06)';
    capsule(ctx, x0, y - H / 2, W, H);
    ctx.fill();

    if (fill > 0.001) {
      const w = Math.max(H, W * fill);
      const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
      g.addColorStop(0, row.c1);
      g.addColorStop(1, row.c2);
      ctx.fillStyle = g;
      capsule(ctx, x0, y - H / 2, w, H);
      ctx.fill();
      // gloss along the top
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      capsule(ctx, x0 + H * 0.3, y - H / 2 + H * 0.14, Math.max(0, w - H * 0.6), H * 0.3);
      ctx.fill();
      // knob
      const kx = x0 + w - H / 2;
      ctx.save();
      ctx.shadowColor = 'rgba(18,19,22,0.25)';
      ctx.shadowBlur = H * 0.6;
      ctx.shadowOffsetY = H * 0.15;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(kx, y, H * 0.66, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = row.c2;
      ctx.beginPath();
      ctx.arc(kx, y, H * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.restore();
}

/* ---------------- the week: weight trend + streak coins ---------------- */
const WEIGHTS = [84.0, 83.6, 83.1, 82.9, 82.2, 81.8, 81.5, 80.9, 80.4, 80.1, 79.6, 79.2];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function flame(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.bezierCurveTo(x + r * 0.2, y - r * 0.45, x + r * 0.85, y - r * 0.2, x + r * 0.7, y + r * 0.35);
  ctx.bezierCurveTo(x + r * 0.6, y + r * 0.85, x - r * 0.6, y + r * 0.85, x - r * 0.7, y + r * 0.35);
  ctx.bezierCurveTo(x - r * 0.8, y - r * 0.05, x - r * 0.35, y - r * 0.1, x - r * 0.25, y - r * 0.45);
  ctx.bezierCurveTo(x - r * 0.05, y - r * 0.3, x - r * 0.1, y - r * 0.7, x, y - r);
  ctx.closePath();
}

export function drawWeek(ctx: Ctx, cx: number, cy: number, s: number, alpha: number, p: number) {
  const x0 = cx - 0.95 * s;
  const x1 = cx + 0.95 * s;
  const yTop = cy - 0.86 * s;
  const yBot = cy + 0.2 * s;
  const kgTop = 85.5;
  const kgBot = 73.5;
  const yOf = (kg: number) => yTop + ((kgTop - kg) / (kgTop - kgBot)) * (yBot - yTop);
  const fs = Math.min(15, Math.max(11, 0.048 * s));
  ctx.save();
  ctx.globalAlpha = alpha;

  // grid
  ctx.strokeStyle = 'rgba(18,19,22,0.07)';
  ctx.lineWidth = 1;
  ctx.font = font(600, fs * 0.9);
  ctx.fillStyle = '#9a9a9a';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (const kg of [84, 80, 76]) {
    const y = yOf(kg);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.fillText(String(kg), x0 - fs * 0.6, y);
  }

  // goal line
  const gy = yOf(74);
  ctx.strokeStyle = '#3fa56b';
  ctx.setLineDash([fs * 0.5, fs * 0.6]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, gy);
  ctx.lineTo(x1, gy);
  ctx.stroke();
  ctx.setLineDash([]);
  pill(ctx, 'Goal 74 kg', x1, gy, fs * 0.9, '#e5f5ea', '#26804c', 'right');

  // the trend, drawn left to right
  const pts = WEIGHTS.map((kg, i) => [x0 + (i / (WEIGHTS.length - 1)) * (x1 - x0), yOf(kg)] as [number, number]);
  const path = new Path2D();
  path.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[Math.max(0, i - 1)];
    const [bx, by] = pts[i];
    const [cx2, cy2] = pts[i + 1];
    const [dx, dy] = pts[Math.min(pts.length - 1, i + 2)];
    path.bezierCurveTo(bx + (cx2 - ax) / 6, by + (cy2 - ay) / 6, cx2 - (dx - bx) / 6, cy2 - (dy - by) / 6, cx2, cy2);
  }
  const pl = easeOut(clamp01(p / 0.6));
  const clipX = x0 + pl * (x1 - x0);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0 - 10, yTop - 40, clipX - x0 + 10, yBot - yTop + 80);
  ctx.clip();
  const area = new Path2D(path);
  area.lineTo(x1, yBot);
  area.lineTo(x0, yBot);
  area.closePath();
  const ag = ctx.createLinearGradient(0, yTop, 0, yBot);
  ag.addColorStop(0, 'rgba(90,141,239,0.28)');
  ag.addColorStop(1, 'rgba(90,141,239,0)');
  ctx.fillStyle = ag;
  ctx.fill(area);
  const lg = ctx.createLinearGradient(x0, 0, x1, 0);
  lg.addColorStop(0, '#9cbcff');
  lg.addColorStop(1, '#4c7fe4');
  ctx.strokeStyle = lg;
  ctx.lineWidth = Math.max(3, 0.02 * s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke(path);
  ctx.restore();

  // start and current markers
  const dot = (x: number, y: number, glow: boolean) => {
    ctx.save();
    if (glow) {
      ctx.shadowColor = 'rgba(76,127,228,0.55)';
      ctx.shadowBlur = fs * 1.2;
    }
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, fs * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#4c7fe4';
    ctx.beginPath();
    ctx.arc(x, y, fs * 0.3, 0, Math.PI * 2);
    ctx.fill();
  };
  dot(pts[0][0], pts[0][1], false);
  pill(ctx, '84.0 kg', pts[0][0], pts[0][1] - fs * 1.8, fs * 0.9, '#ffffff', '#3d3d3d', 'left');
  if (pl > 0.02) {
    const idx = pl * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(idx));
    const f = idx - i;
    const ex = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f;
    const ey = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
    dot(ex, ey, true);
    if (pl > 0.97) pill(ctx, '79.2 kg  −4.8', ex, ey - fs * 1.9, fs * 0.95, '#1f1f1f', '#ffffff', 'right');
  }

  // streak coins
  const rowY = cy + 0.58 * s;
  const r = Math.min(0.075 * s, (x1 - x0) / 7 / 2.4);
  DAYS.forEach((d, i) => {
    const x = x0 + ((i + 0.5) / 7) * (x1 - x0);
    const t = clamp01((p - 0.12 - i * 0.05) / 0.2);
    const sc = t <= 0 ? 0 : easeOutBack(t);
    ctx.save();
    ctx.translate(x, rowY);
    ctx.scale(Math.max(sc, 0.0001), Math.max(sc, 0.0001));
    if (i < 5) {
      ctx.save();
      ctx.shadowColor = 'rgba(217,118,44,0.45)';
      ctx.shadowBlur = r * 0.8;
      ctx.shadowOffsetY = r * 0.25;
      const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
      g.addColorStop(0, '#ffc98a');
      g.addColorStop(0.6, '#ec8f3e');
      g.addColorStop(1, '#c9661c');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      flame(ctx, 0, r * 0.05, r * 0.5);
      ctx.fill();
    } else if (i === 5) {
      ctx.strokeStyle = '#b98b62';
      ctx.lineWidth = Math.max(1.5, r * 0.09);
      ctx.setLineDash([r * 0.22, r * 0.16]);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = font(700, r * 0.42);
      ctx.fillStyle = '#9a7556';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('rest', 0, r * 0.02);
    } else {
      ctx.fillStyle = 'rgba(18,19,22,0.06)';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.font = font(700, fs * 0.9);
    ctx.fillStyle = i < 5 ? '#1f1f1f' : '#9a9a9a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(d, x, rowY + r + fs * 0.5);
  });
  ctx.restore();
}

/* ---------------- the finale: the day's ring ---------------- */
const SEGMENTS = [
  { share: 0.18, c1: '#ffb066', c2: '#ff9230' },
  { share: 0.3, c1: '#5ee07c', c2: '#30d158' },
  { share: 0.1, c1: '#ffe14d', c2: '#ffd600' },
  { share: 0.12, c1: '#8fdfff', c2: '#64d2ff' },
];

export function drawRing(ctx: Ctx, cx: number, cy: number, s: number, alpha: number, p: number) {
  const R = 0.64 * s;
  const w = Math.max(14, 0.17 * s);
  const start = -Math.PI / 2;
  const total = SEGMENTS.reduce((a, b) => a + b.share, 0);
  const sweep = 0.72 * Math.PI * 2 * easeOut(clamp01(p / 0.7));
  ctx.save();
  ctx.globalAlpha = alpha;

  // soft halo
  const halo = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.6);
  halo.addColorStop(0, 'rgba(90,141,239,0.10)');
  halo.addColorStop(1, 'rgba(90,141,239,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // track
  ctx.strokeStyle = 'rgba(18,19,22,0.07)';
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();

  // segments
  ctx.lineCap = 'round';
  let a = start;
  const gap = Math.min(0.12, w / R) * 0.9;
  for (const seg of SEGMENTS) {
    const span = (seg.share / total) * sweep;
    if (span > gap) {
      const a0 = a + gap / 2;
      const a1 = a + span - gap / 2;
      const g = ctx.createLinearGradient(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, cx + Math.cos(a1) * R, cy + Math.sin(a1) * R);
      g.addColorStop(0, seg.c1);
      g.addColorStop(1, seg.c2);
      ctx.save();
      ctx.shadowColor = 'rgba(18,19,22,0.18)';
      ctx.shadowBlur = w * 0.6;
      ctx.shadowOffsetY = w * 0.15;
      ctx.strokeStyle = g;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0, a1);
      ctx.stroke();
      ctx.restore();
      // gloss
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = w * 0.18;
      ctx.beginPath();
      ctx.arc(cx, cy, R - w * 0.22, a0, a1);
      ctx.stroke();
    }
    a += span;
  }

  // centre
  const shown = Math.round(1640 * easeOut(clamp01(p / 0.7)));
  ctx.fillStyle = '#1f1f1f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = font(800, Math.max(26, 0.26 * s));
  ctx.fillText(shown.toLocaleString('en-IN'), cx, cy - 0.04 * s);
  ctx.font = font(600, Math.max(12, 0.065 * s));
  ctx.fillStyle = '#737373';
  ctx.fillText('of 2,100 kcal today', cx, cy + 0.16 * s);
  ctx.restore();
}
