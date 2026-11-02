import { useEffect, useRef } from 'react';
import { KATORI_COLORS, STEEL, eIO, clamp01, ghumao, iconSVG, loaderSVG, type Macro } from '@/lib/katori';
import { prefersReduced } from '@/lib/motion';

/** The o of the wordmark: the exact katori circle from the icon, at x-height. */
export function KatoriO({ macro = 'fat', katori = false }: { macro?: Macro; katori?: boolean }) {
  return (
    <svg className="wordmark-o" viewBox="0 0 100 100" aria-hidden="true">
      {katori ? (
        <>
          <circle cx="50" cy="50" r="44" fill="none" stroke={STEEL} strokeWidth="12" />
          <circle cx="50" cy="50" r="27" fill={KATORI_COLORS[macro]} />
        </>
      ) : (
        <circle cx="50" cy="50" r="50" fill={KATORI_COLORS[macro]} />
      )}
    </svg>
  );
}

type IconProps = {
  size?: number;
  /** black rounded tile behind the mark (app icon / favicon) */
  tile?: boolean;
  /** one full swap when the pointer enters `hoverTarget` (or the icon itself) */
  swapOnHover?: boolean;
  className?: string;
};

/** The #5 icon: a steel tin with three katoris. */
export function KatoriIcon({ size = 40, tile = false, swapOnHover = false, className = '' }: IconProps) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const g = ref.current;
    if (!g) return;
    g.innerHTML = iconSVG();
    if (!swapOnHover) return;
    const host = (g.closest('a, button') as HTMLElement | null) ?? g.ownerSVGElement;
    if (!host) return;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = clamp01((now - start) / 820);
      g.innerHTML = iconSVG(ghumao(3 * eIO(p)));
      raf = p < 1 ? requestAnimationFrame(tick) : 0;
    };
    const onEnter = () => {
      if (raf || prefersReduced()) return;
      start = 0;
      raf = requestAnimationFrame(tick);
    };
    host.addEventListener('pointerenter', onEnter);
    return () => {
      host.removeEventListener('pointerenter', onEnter);
      cancelAnimationFrame(raf);
    };
  }, [swapOnHover]);

  return (
    <svg className={`katori-icon ${className}`} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      {tile && <rect width="100" height="100" rx="22" fill="#000" />}
      <g ref={ref} />
    </svg>
  );
}

type Props = {
  size?: number;
  /** show the icon in front of the word (the lockup) */
  icon?: boolean;
  macro?: Macro;
  className?: string;
};

/** "macrozy" in Poppins SemiBold, with one of the katoris as the o. */
export function Wordmark({ size = 24, icon = true, macro = 'fat', className = '' }: Props) {
  return (
    <span className={`wordmark ${icon ? 'has-icon' : ''} ${className}`} style={{ fontSize: size }} role="img" aria-label="Macrozy">
      {icon && <KatoriIcon size={Math.round(size * 1.83)} swapOnHover className="wordmark-icon" />}
      <span className="wordmark-word" aria-hidden="true">
        <span>macr</span>
        <KatoriO macro={macro} />
        <span>zy</span>
      </span>
    </span>
  );
}

/** The app icon: the mark on its black rounded tile. */
export function AppMark({ size = 40 }: { size?: number }) {
  return <KatoriIcon size={size} tile className="appmark" />;
}

/** Loader: the swap, looped. `disc={false}` drops the steel for inline use. */
export function KatoriLoader({ size = 48, disc = true, className = '' }: { size?: number; disc?: boolean; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const sv = ref.current;
    if (!sv) return;
    if (prefersReduced()) {
      sv.innerHTML = iconSVG(undefined, disc);
      return;
    }
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(sv);
    let raf = 0;
    const tick = (now: number) => {
      if (visible) sv.innerHTML = loaderSVG(now, disc);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [disc]);

  return <svg ref={ref} className={`katori-loader ${className}`} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Loading" />;
}
