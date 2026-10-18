import Link from 'next/link';
import { profile, site } from '@/lib/profile';
import { profitIndex } from '@/lib/research';
import { IndexLines } from './charts/IndexLines';
import { Emph } from './Emph';
import { Icon } from './Icon';
import styles from './Papers.module.css';

// My papers: the working paper first, as a full entry with its main chart, then talks and projects.
export function Papers() {
  const { research: r, papers, person } = profile;
  const [paper, ...files] = r.links;
  return (
    <section id="papers" className={`wrap section ${styles.section}`} aria-labelledby="papers-title">
      <header className="section-head">
        <p className="label">Papers</p>
        <h2 id="papers-title">What I&apos;ve written</h2>
      </header>

      <article className={`card chart-paper ${styles.paper}`} aria-labelledby="paper-title">
        <div className={styles.text}>
          <p className={styles.kind}>{r.status}</p>
          <h3 id="paper-title" className={styles.title}>{r.paperTitle}</h3>
          <p className={styles.by}>{person.name} · independent research project</p>

          <p className={styles.finding}><Emph text={r.teaser} /></p>
          <dl className={styles.stats}>
            {r.stats.map((s) => (
              <div key={s.text}><dt>{s.figure}</dt><dd>{s.text}</dd></div>
            ))}
          </dl>

          <div className={styles.actions}>
            <a className="btn btn-ink" href={paper.url} target="_blank" rel="noopener">
              {paper.label} {paper.note && <span className={styles.note}>{paper.note}</span>} <Icon name="arrow-up-right" />
            </a>
            <Link className="btn" href={site.researchPage}>The story in six charts <Icon name="arrow-right" /></Link>
          </div>
          <ul className={styles.files}>
            {files.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener">{l.label} <Icon name="arrow-up-right" size={13} /></a>
              </li>
            ))}
          </ul>
          <p className={styles.origin}>{r.origin}</p>
        </div>

        <div className={styles.chart}>
          <IndexLines data={profitIndex} />
        </div>
      </article>

      {papers.length > 0 && (
        <ul className={styles.more}>
          {papers.map((p) => (
            <li key={p.title} className={`card reveal ${styles.entry}`}>
              <p className={styles.kind}>{p.kind} · {p.when}</p>
              <h3>{p.url ? <a href={p.url} target="_blank" rel="noopener">{p.title}</a> : p.title}</h3>
              {p.where && <p className={styles.where}>{p.where}</p>}
              {p.line && <p className={styles.line}>{p.line}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
