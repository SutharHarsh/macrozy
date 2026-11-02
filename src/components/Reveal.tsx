import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
  id?: string;
};

/**
 * Content is visible by default; JS only adds a one-time rise when it scrolls in.
 * If the element is already on screen at mount, nothing animates.
 */
export function Reveal({ as: Tag = 'div', children, className = '', delay = 0, style, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;
    el.classList.add('reveal-wait');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add('reveal-in');
        el.classList.remove('reveal-wait');
        io.disconnect();
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} id={id} className={`reveal ${className}`} style={{ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
