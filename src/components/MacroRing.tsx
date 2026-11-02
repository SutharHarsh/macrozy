import type { ReactNode } from 'react';

type Segment = { value: number; color: string };

type Props = {
  size?: number;
  stroke?: number;
  /** 0..1 overall fill, used when no segments are given */
  progress?: number;
  segments?: Segment[];
  track?: string;
  color?: string;
  className?: string;
  children?: ReactNode;
};

/** The calorie ring. With segments, each macro gets its share of the filled arc. */
export function MacroRing({
  size = 160,
  stroke = 12,
  progress = 0.72,
  segments,
  track = 'var(--ring-track, rgba(255,255,255,.08))',
  color = 'url(#ringGrad)',
  className = '',
  children,
}: Props) {
  const r = 50 - (stroke / size) * 50 - 0.5;
  const sw = (stroke / size) * 100;
  let offset = 0;
  const total = segments?.reduce((s, x) => s + x.value, 0) ?? 0;
  return (
    <div className={`macro-ring ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE14D" />
            <stop offset="1" stopColor="#FFD600" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke={track} strokeWidth={sw} />
        {segments && total > 0 ? (
          segments.map((s, i) => {
            const len = (s.value / total) * progress;
            const el = (
              <circle
                key={i}
                className="macro-ring-arc"
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={sw}
                pathLength={1}
                strokeDasharray={`${Math.max(len - 0.012, 0.001)} 1`}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
                strokeLinecap="round"
              />
            );
            offset += len;
            return el;
          })
        ) : (
          <circle
            className="macro-ring-arc"
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            pathLength={1}
            strokeDasharray={`${progress} 1`}
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
          />
        )}
      </svg>
      {children && <div className="macro-ring-center">{children}</div>}
    </div>
  );
}
