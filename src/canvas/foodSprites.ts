/**
 * Hand-drawn Indian food icons in a soft, lit, slightly top-down style.
 * Everything is drawn in a 100×100 unit box centred at (0, 0); callers scale it.
 */
export type FoodKind = 'dal' | 'rice' | 'roti' | 'samosa' | 'idli' | 'chai' | 'paneer' | 'salad' | 'ladoo' | 'banana';

type Ctx = CanvasRenderingContext2D;

function shadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, a = 0.18) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  g.addColorStop(0, `rgba(40,30,20,${a})`);
  g.addColorStop(1, 'rgba(40,30,20,0)');
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function steelBowl(ctx: Ctx, r: number, y: number, depth: number) {
  const ry = r * 0.42;
  const body = ctx.createLinearGradient(-r, 0, r, 0);
  body.addColorStop(0, '#8d949e');
  body.addColorStop(0.28, '#eef0f3');
  body.addColorStop(0.55, '#b7bec7');
  body.addColorStop(0.8, '#f4f5f7');
  body.addColorStop(1, '#959ca6');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, y, r, ry + depth, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#eef0f3';
  ctx.beginPath();
  ctx.ellipse(0, y, r, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(70,78,90,0.3)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  return ry;
}

function contents(ctx: Ctx, r: number, y: number, ry: number, inner: string, mid: string, edge: string) {
  const g = ctx.createRadialGradient(-r * 0.3, y - ry * 0.4, r * 0.05, 0, y, r);
  g.addColorStop(0, inner);
  g.addColorStop(0.65, mid);
  g.addColorStop(1, edge);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, y + ry * 0.06, r * 0.86, ry * 0.86, 0, 0, Math.PI * 2);
  ctx.fill();
}

const DRAW: Record<FoodKind, (ctx: Ctx) => void> = {
  dal(ctx) {
    shadow(ctx, 0, 30, 40, 12);
    const ry = steelBowl(ctx, 36, -2, 26);
    contents(ctx, 36, -2, ry, '#f8c860', '#e3a02c', '#c27d18');
    const specks: [number, number, string][] = [
      [-12, -4, '#8a2d12'], [6, -8, '#3f8a3a'], [14, 0, '#8a2d12'], [-4, 4, '#3f8a3a'], [-18, 2, '#3f8a3a'], [2, -1, '#8a2d12'], [18, -6, '#3f8a3a'],
    ];
    for (const [x, y, c] of specks) {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(x, y, 2.4, 1.4, x * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,240,190,0.6)';
    ctx.beginPath();
    ctx.ellipse(-10, -9, 8, 2.6, -0.2, 0, Math.PI * 2);
    ctx.fill();
  },
  salad(ctx) {
    shadow(ctx, 0, 30, 40, 12);
    const ry = steelBowl(ctx, 36, -2, 26);
    contents(ctx, 36, -2, ry, '#e8f5d6', '#cfe8b8', '#a9d18c');
    const slices: [number, number][] = [[-14, -4], [4, -8], [16, 1], [-2, 4], [-20, 3]];
    for (const [x, y] of slices) {
      ctx.fillStyle = '#4f8a35';
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e6f6d2';
      ctx.beginPath();
      ctx.ellipse(x, y, 6.6, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(190,70,120,0.8)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(8, 6, 6, 2.6, 0.3, 0.2, Math.PI * 1.5);
    ctx.stroke();
    ctx.fillStyle = '#d6453a';
    ctx.beginPath();
    ctx.ellipse(-8, -10, 4, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  rice(ctx) {
    shadow(ctx, 0, 30, 42, 12);
    // shallow steel plate
    ctx.fillStyle = '#d5d9df';
    ctx.beginPath();
    ctx.ellipse(0, 18, 44, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#eef0f3';
    ctx.beginPath();
    ctx.ellipse(0, 16, 42, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createRadialGradient(-12, -16, 2, 0, 0, 40);
    g.addColorStop(0, '#fffefb');
    g.addColorStop(0.6, '#f3ead7');
    g.addColorStop(1, '#d9ccad');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-34, 16);
    ctx.bezierCurveTo(-32, -26, 32, -26, 34, 16);
    ctx.ellipse(0, 16, 34, 11, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = 'rgba(150,130,90,0.25)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 46; i++) {
      const u = ((i * 37) % 100) / 50 - 1;
      const v = ((i * 61) % 100) / 100;
      const x = u * 28;
      const top = -16 * (1 - u * u);
      const y = top + v * (24 - top);
      ctx.beginPath();
      ctx.ellipse(x, y, 2.6, 1, i, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.fillStyle = '#4c9a3c';
    ctx.beginPath();
    ctx.ellipse(4, -14, 3.4, 2, -0.5, 0, Math.PI * 2);
    ctx.ellipse(8, -13, 3, 1.8, 0.6, 0, Math.PI * 2);
    ctx.fill();
  },
  roti(ctx) {
    shadow(ctx, 0, 26, 44, 12);
    for (let k = 2; k >= 0; k--) {
      const y = 10 - k * 7;
      const x = (k - 1) * 3;
      ctx.fillStyle = '#b0782f';
      ctx.beginPath();
      ctx.ellipse(x, y + 2, 40, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      const g = ctx.createRadialGradient(x - 10, y - 6, 2, x, y, 40);
      g.addColorStop(0, '#f2cf8f');
      g.addColorStop(0.7, '#e1ad5e');
      g.addColorStop(1, '#c58a3c');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, 40, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(120,60,20,0.55)';
    const spots: [number, number, number][] = [[-16, -6, 3], [8, -10, 2.4], [20, -2, 3.2], [-4, 2, 2], [-24, 0, 2.2], [12, 4, 2.6]];
    for (const [x, y, r] of spots) {
      ctx.beginPath();
      ctx.ellipse(x, y - 4, r, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  samosa(ctx) {
    shadow(ctx, 0, 30, 40, 12);
    const g = ctx.createLinearGradient(-30, -30, 30, 30);
    g.addColorStop(0, '#f6c66c');
    g.addColorStop(0.5, '#e09a36');
    g.addColorStop(1, '#b86e1c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.quadraticCurveTo(10, -10, 38, 26);
    ctx.quadraticCurveTo(0, 34, -38, 26);
    ctx.quadraticCurveTo(-10, -10, 0, -38);
    ctx.fill();
    // front face, a shade darker
    ctx.fillStyle = 'rgba(160,90,20,0.35)';
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.quadraticCurveTo(4, -4, 38, 26);
    ctx.quadraticCurveTo(14, 30, 2, 28);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,170,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -30);
    ctx.quadraticCurveTo(-12, -6, -30, 20);
    ctx.stroke();
    ctx.fillStyle = 'rgba(140,80,20,0.45)';
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.arc(-28 + i * 7, 28 - Math.abs(i - 4) * 0.6, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  idli(ctx) {
    shadow(ctx, 0, 28, 46, 12);
    ctx.fillStyle = '#5a9a3a';
    ctx.beginPath();
    ctx.ellipse(0, 16, 46, 16, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-44, 18);
    ctx.lineTo(44, 14);
    ctx.stroke();
    for (const [x, y] of [
      [-16, 8],
      [16, 4],
    ] as const) {
      const g = ctx.createRadialGradient(x - 6, y - 10, 2, x, y, 22);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.7, '#f1eee6');
      g.addColorStop(1, '#d7d1c3');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, 21, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 21, y);
      ctx.bezierCurveTo(x - 20, y - 16, x + 20, y - 16, x + 21, y);
      ctx.fill();
    }
  },
  chai(ctx) {
    shadow(ctx, 0, 32, 30, 9);
    // glass
    const glass = ctx.createLinearGradient(-22, 0, 22, 0);
    glass.addColorStop(0, 'rgba(255,255,255,0.75)');
    glass.addColorStop(0.5, 'rgba(255,255,255,0.25)');
    glass.addColorStop(1, 'rgba(255,255,255,0.7)');
    const tea = ctx.createLinearGradient(0, -20, 0, 30);
    tea.addColorStop(0, '#d39b5c');
    tea.addColorStop(1, '#9a5a24');
    ctx.fillStyle = tea;
    ctx.beginPath();
    ctx.moveTo(-20, -18);
    ctx.lineTo(-15, 28);
    ctx.quadraticCurveTo(0, 33, 15, 28);
    ctx.lineTo(20, -18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e7bf8a';
    ctx.beginPath();
    ctx.ellipse(0, -18, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.moveTo(-23, -30);
    ctx.lineTo(-16, 30);
    ctx.quadraticCurveTo(0, 35, 16, 30);
    ctx.lineTo(23, -30);
    ctx.closePath();
    ctx.globalAlpha = 0.55;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(160,170,180,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, -30, 23, 5.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(140,150,160,0.35)';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.2;
    for (const x of [-7, 5]) {
      ctx.beginPath();
      ctx.moveTo(x, -38);
      ctx.bezierCurveTo(x + 6, -44, x - 6, -50, x, -58);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  },
  paneer(ctx) {
    shadow(ctx, 0, 28, 42, 12);
    const cube = (x: number, y: number, s: number) => {
      ctx.fillStyle = '#f7f1e2';
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.5);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + s * 0.5);
      ctx.lineTo(x - s, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e7dcc2';
      ctx.beginPath();
      ctx.moveTo(x - s, y);
      ctx.lineTo(x, y + s * 0.5);
      ctx.lineTo(x, y + s * 1.3);
      ctx.lineTo(x - s, y + s * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d6c7a6';
      ctx.beginPath();
      ctx.moveTo(x + s, y);
      ctx.lineTo(x, y + s * 0.5);
      ctx.lineTo(x, y + s * 1.3);
      ctx.lineTo(x + s, y + s * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(200,120,40,0.35)';
      ctx.beginPath();
      ctx.ellipse(x - s * 0.2, y - s * 0.05, s * 0.3, s * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    cube(-16, 4, 15);
    cube(16, 8, 15);
    cube(0, -12, 15);
  },
  ladoo(ctx) {
    shadow(ctx, 0, 30, 40, 11);
    for (const [x, y, r] of [
      [-16, 12, 18],
      [18, 14, 17],
      [0, -6, 19],
    ] as const) {
      const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, 2, x, y, r);
      g.addColorStop(0, '#ffd27a');
      g.addColorStop(0.6, '#f0a73a');
      g.addColorStop(1, '#c97a1c');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,200,0.5)';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(x + Math.cos(i * 2.3) * r * 0.6, y + Math.sin(i * 2.3) * r * 0.6, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
  banana(ctx) {
    shadow(ctx, 0, 28, 42, 11);
    const g = ctx.createLinearGradient(-30, -20, 30, 20);
    g.addColorStop(0, '#fff07a');
    g.addColorStop(0.6, '#f5cf33');
    g.addColorStop(1, '#d9a91a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-40, -8);
    ctx.quadraticCurveTo(-6, 34, 40, -14);
    ctx.quadraticCurveTo(40, -4, 34, 0);
    ctx.quadraticCurveTo(-4, 26, -34, -2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6b4a1c';
    ctx.beginPath();
    ctx.ellipse(-39, -6, 3, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(160,120,20,0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.quadraticCurveTo(-4, 22, 32, -6);
    ctx.stroke();
  },
};

/** Draws one food icon centred at (x, y), `size` pixels across. */
export function drawFood(ctx: Ctx, kind: FoodKind, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  DRAW[kind](ctx);
  ctx.restore();
}

export const FOOD_META: Record<FoodKind, { name: string; portion: string; kcal: number; p: number; c: number; f: number }> = {
  dal: { name: 'Toor dal', portion: '1 katori', kcal: 232, p: 13.6, c: 36, f: 3 },
  rice: { name: 'Steamed rice', portion: '150 g', kcal: 195, p: 4.1, c: 42, f: 0.4 },
  roti: { name: 'Roti', portion: '2 roti', kcal: 211, p: 7, c: 41, f: 2.7 },
  samosa: { name: 'Samosa', portion: '1 piece', kcal: 185, p: 3.1, c: 19.4, f: 10.6 },
  idli: { name: 'Idli', portion: '2 idli', kcal: 117, p: 3.6, c: 24.2, f: 0.5 },
  chai: { name: 'Masala chai', portion: '1 cup', kcal: 93, p: 2.7, c: 12.9, f: 3.3 },
  paneer: { name: 'Paneer', portion: '100 g', kcal: 265, p: 18.3, c: 1.2, f: 20.8 },
  salad: { name: 'Cucumber salad', portion: '1 bowl', kcal: 13, p: 0.5, c: 2.9, f: 0.1 },
  ladoo: { name: 'Besan ladoo', portion: '1 piece', kcal: 174, p: 3.4, c: 19.8, f: 9.2 },
  banana: { name: 'Banana', portion: '1 medium', kcal: 105, p: 1.3, c: 27, f: 0.4 },
};
