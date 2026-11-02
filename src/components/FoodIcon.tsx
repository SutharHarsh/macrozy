import { useEffect, useRef } from 'react';
import { drawFood, type FoodKind } from '@/canvas/foodSprites';

type Props = { kind: FoodKind; size?: number; className?: string; label?: string };

/** One hand-drawn food, rendered once into a crisp canvas. */
export function FoodIcon({ kind, size = 96, className = '', label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // a little headroom so steam and shadows are never clipped
    const box = size * 1.3;
    c.width = Math.round(box * dpr);
    c.height = Math.round(box * dpr);
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, box, box);
    drawFood(ctx, kind, box / 2, box / 2 + size * 0.04, size);
  }, [kind, size]);
  return (
    <canvas
      ref={ref}
      className={`food-icon ${className}`}
      style={{ width: size * 1.3, height: size * 1.3 }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
