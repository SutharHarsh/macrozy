import { useEffect, useRef, useState } from 'react';
import { FoodField, type FieldItem } from '@/three/FoodField';
import { afterMotion, useReducedMotion } from '@/lib/motion';

type Props = {
  items: FieldItem[];
  className?: string;
  /** index of the item to bring into focus, or -1 */
  focus?: number;
  /** called every frame with item centres, for chips that follow the models */
  onAnchors?: (pts: [number, number][]) => void;
};

/** A canvas of floating 3D produce that sizes itself to its parent and pauses off-screen. */
export function FoodField3D({ items, className = '', focus = -1, onAnchors }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<FoodField | null>(null);
  const anchorsRef = useRef(onAnchors);
  anchorsRef.current = onAnchors;
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement!;
    let field: FoodField;
    try {
      field = new FoodField(canvas, items, reduced);
    } catch {
      return;
    }
    fieldRef.current = field;
    let alive = true;
    let visible = false;
    const place = () => field.resize(host.clientWidth, host.clientHeight);
    const ro = new ResizeObserver(place);
    ro.observe(host);
    place();
    let raf = 0;
    let armed = false;
    const pump = () => {
      anchorsRef.current?.(field.anchors());
      raf = requestAnimationFrame(pump);
    };
    // models and first frames wait for the preloader / page transition to finish
    const cancelGate = afterMotion(() => {
      armed = true;
      field.init().then(() => {
        if (!alive) return;
        place();
        setReady(true);
        if (visible) field.start();
        if (anchorsRef.current) raf = requestAnimationFrame(pump);
      });
    });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && armed) field.start();
      else field.stop();
    });
    io.observe(host);
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') field.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      alive = false;
      cancelGate();
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      field.dispose();
      fieldRef.current = null;
    };
    // items are static per mount; only a change in motion preference rebuilds the field
  }, [reduced]);

  useEffect(() => {
    fieldRef.current?.setFocus(focus);
  }, [focus]);

  return <canvas ref={ref} className={`food-field ${ready ? 'is-ready' : ''} ${className}`} aria-hidden="true" />;
}
