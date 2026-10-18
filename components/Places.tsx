import { profile } from '@/lib/profile';
import { RouteMap } from './RouteMap';
import styles from './Places.module.css';

// Where my work has taken me: the map, and one line for each place.
export function Places() {
  return (
    <section id="places" className={`wrap section ${styles.section}`} aria-labelledby="places-title">
      <header className="section-head">
        <p className="label">Places</p>
        <h2 id="places-title">Where I&apos;ve been</h2>
      </header>

      <div className={`card ${styles.card}`}>
        <div className={styles.map}>
          <RouteMap />
        </div>
        <ol className={styles.list}>
          {profile.places.map((p) => (
            <li key={p.name}>
              <p className={styles.meta}>{p.when}</p>
              <h3>{p.name}<span>, {p.country}</span></h3>
              <p className={styles.line}>{p.line}</p>
              {p.work && <a className={styles.more} href={`#work-${p.work}`}>See the photos</a>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
