import type { ReactNode } from 'react';

type Props = { children: ReactNode; className?: string; label?: string };

/** A 390×844 handset drawn in CSS. Screens inside are the real app's dark UI. */
export function Phone({ children, className = '', label = 'Macrozy app screen' }: Props) {
  return (
    <div className={`phone ${className}`} role="img" aria-label={label}>
      <div className="phone-screen">
        <div className="phone-status" aria-hidden="true">
          <span>9:41</span>
          <span className="phone-island" />
          <span className="phone-status-r">
            <i />
            <i />
            <b />
          </span>
        </div>
        <div className="phone-body">{children}</div>
      </div>
    </div>
  );
}
