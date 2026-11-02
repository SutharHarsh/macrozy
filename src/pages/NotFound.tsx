import { Link } from 'react-router-dom';
import { MacroRing } from '@/components/MacroRing';

export function NotFound() {
  return (
    <section className="page-hero center notfound">
      <div className="wrap">
        <MacroRing size={120} stroke={12} progress={0.04} track="var(--bg-2)" />
        <h1 className="display">This page has 0 kcal.</h1>
        <p className="lede">There’s nothing logged at this address.</p>
        <Link to="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </section>
  );
}
