import { useEffect, useRef } from 'react';
import { ThaliScene } from '@/canvas/ThaliScene';
import { useReducedMotion } from '@/lib/motion';
import { CH } from '@/lib/story';

type Props = {
  /** story time to freeze the scene at: 0 = plate, 3 = split */
  g?: number;
  /** horizontal radius of the plate as a share of the canvas width */
  scale?: number;
  /** vertical centre as a share of the canvas height */
  cy?: number;
  className?: string;
  label?: string;
};

/** A self-sizing canvas showing one frame of the thali, with live steam. */
export function ThaliCanvas({ g = CH.lunch, scale = 0.36, cy = 0.56, className = '', label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let scene: ThaliScene;
    try {
      scene = new ThaliScene(canvas, reduced);
    } catch {
      return;
    }
    const place = () => {
      const w = canvas.parentElement!.clientWidth;
      const h = canvas.parentElement!.clientHeight;
      scene.resize(w, h);
      // on narrow screens the plate takes more of the width so it still reads as the hero
      const k = w < 700 ? Math.max(scale, 0.42) : scale;
      scene.setBox({ cx: w / 2, cy: h * cy, s: Math.min(w * k, h * 0.62) });
      scene.setG(g);
    };
    const ro = new ResizeObserver(place);
    ro.observe(canvas.parentElement!);
    place();
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.start() : scene.stop()));
    io.observe(canvas);
    return () => {
      ro.disconnect();
      io.disconnect();
      scene.stop();
    };
  }, [g, scale, cy, reduced]);

  return <canvas ref={ref} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}
