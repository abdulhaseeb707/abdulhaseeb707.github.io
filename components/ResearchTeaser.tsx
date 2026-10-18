import Link from 'next/link';
import { profile, site } from '@/lib/profile';
import { profitIndex } from '@/lib/research';
import { IndexLines } from './charts/IndexLines';
import { Emph } from './Emph';
import { Icon } from './Icon';
import styles from './ResearchTeaser.module.css';

export function ResearchTeaser() {
  const r = profile.research;
  return (
    <section id="research" className={`wrap section ${styles.section}`} aria-labelledby="research-title">
      <div className={`card chart-paper ${styles.card}`}>
        <div className={styles.text}>
          <p className="label">Research · {r.status}</p>
          <h2 id="research-title"><Emph text={r.teaser} /></h2>
          <p className={styles.title}>{r.title}</p>
          <dl className={styles.stats}>
            {r.stats.map((s) => (
              <div key={s.text}><dt>{s.figure}</dt><dd>{s.text}</dd></div>
            ))}
          </dl>
          <div className={styles.actions}>
            <Link className="btn btn-ink" href={site.researchPage}>The full story in six charts <Icon name="arrow-right" /></Link>
            <a className="btn" href={r.links[0].url} target="_blank" rel="noopener">Paper (PDF) <Icon name="arrow-up-right" /></a>
          </div>
        </div>
        <div className={styles.chart}>
          <IndexLines data={profitIndex} />
        </div>
      </div>
    </section>
  );
}
