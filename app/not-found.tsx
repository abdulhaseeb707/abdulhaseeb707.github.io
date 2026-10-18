import Link from 'next/link';
import { moonPath } from '@/lib/moon';
import { site } from '@/lib/profile';

export default function NotFound() {
  return (
    <section className="wrap section" style={{ textAlign: 'center', minHeight: '60vh', display: 'grid', placeContent: 'center', gap: 18 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" style={{ margin: '0 auto' }}>
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d={moonPath(32, 32, 28, 0.02)} fill="currentColor" />
      </svg>
      <p className="label">404 · new moon</p>
      <h1 style={{ fontSize: 'var(--fs-h2)' }}>Nothing here yet.</h1>
      <p className="lead">The link may be old or have a typo.</p>
      <p style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link className="btn btn-ink" href="/">Go to the home page</Link>
        <Link className="btn" href={site.cvPage}>See my CV</Link>
      </p>
    </section>
  );
}
