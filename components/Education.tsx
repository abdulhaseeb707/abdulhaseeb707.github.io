import { profile } from '@/lib/profile';
import { moonPath } from '@/lib/moon';
import styles from './Education.module.css';

// What I studied, from the CV's Education section, plus the tools I work with.
// The small moon is full for a finished degree and half for one in progress.
export function Education() {
  const { cv, skills, languages } = profile;
  const entries = cv.sections.find((s) => s.title === 'Education')?.entries ?? [];
  return (
    <section id="education" className={`wrap section ${styles.section}`} aria-labelledby="education-title">
      <header className="section-head">
        <p className="label">Education</p>
        <h2 id="education-title">What I&apos;ve studied</h2>
      </header>

      <ol className={styles.list}>
        {entries.map((e) => {
          const current = /present/i.test(e.dates ?? '');
          return (
            <li key={e.title} className={`card reveal ${styles.item}`}>
              <p className={styles.meta}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d={moonPath(8, 8, 6.5, current ? 0.25 : 0.5)} fill="currentColor" />
                </svg>
                {current ? 'In progress' : 'Completed'}
                {e.dates && <span>{e.dates}</span>}
              </p>
              <h3>{e.title}</h3>
              {e.org && <p className={styles.org}>{e.org}</p>}
              {e.bullets.length > 0 && (
                <ul className={styles.notes}>
                  {e.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <div className={`card ${styles.tools}`}>
        <p className="label">What I work with</p>
        <dl>
          {skills.map((g) => (
            <div key={g.group}>
              <dt>{g.group}</dt>
              <dd>{g.items.join(', ')}</dd>
            </div>
          ))}
          <div>
            <dt>Languages</dt>
            <dd>{languages.map((l) => `${l.name} (${l.level})`).join('; ')}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
