const DIGITS = '0123456789'.split('');

type Props = { value: string | number; className?: string };

/**
 * Rolling number. Each digit is a clipped 0–9 column moved by translateY(−10% × digit).
 * Digits are keyed from the right so the units column survives 99 → 100.
 */
export function Odometer({ value, className = '' }: Props) {
  const str = String(value);
  const chars = str.split('');
  return (
    <span className={`odo ${className}`}>
      <span className="sr-only">{str}</span>
      <span className="odo-row" aria-hidden="true">
        {chars.map((ch, i) => {
          const key = chars.length - i;
          if (!/\d/.test(ch)) {
            return (
              <span key={`s${key}`} className="odo-static">
                {ch}
              </span>
            );
          }
          return (
            <span key={`d${key}`} className="odo-digit">
              <span className="odo-ghost">{ch}</span>
              <span className="odo-col" style={{ transform: `translateY(${-10 * Number(ch)}%)` }}>
                {DIGITS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
