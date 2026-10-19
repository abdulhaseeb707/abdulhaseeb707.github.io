import Link from 'next/link';
import type { ReactNode } from 'react';
import { profile, site } from '@/lib/profile';
import { costOptimization } from '@/lib/projects';
import { PlantCosts } from './charts/PlantCosts';
import { Emph } from './Emph';
import { Icon } from './Icon';
import styles from './Papers.module.css'; // the same card as the working paper

// The chart on each project's home card (projects with their own page only).
const CARD_CHART: Record<string, ReactNode> = {
  'cost-optimization': <PlantCosts data={costOptimization.plants} />,
};

// My projects: each one with its own page gets a full card with its main chart; smaller ones follow as a list.
export function Projects() {
  const featured = profile.projects.filter((p) => p.slug);
  const small = profile.projects.filter((p) => !p.slug);
  if (!profile.projects.length) return null;
  return (
    <section id="projects" className={`wrap section ${styles.section}`} aria-labelledby="projects-title">
      <header className="section-head">
        <p className="label">Projects</p>
        <h2 id="projects-title">What I&apos;ve built</h2>
      </header>

      {featured.map((p) => {
        const [main, ...files] = p.links;
        return (
          <article key={p.slug} className={`card chart-paper ${styles.paper}`} aria-labelledby={`project-${p.slug}`}>
            <div className={styles.text}>
              <p className={styles.kind}>{p.kind} · {p.when}</p>
              <h3 id={`project-${p.slug}`} className={styles.title}>{p.title}</h3>
              <p className={styles.by}>{p.tagline}</p>

              <p className={styles.finding}><Emph text={p.teaser!} /></p>
              <dl className={styles.stats}>
                {p.stats.map((s) => (
                  <div key={s.text}><dt>{s.figure}</dt><dd>{s.text}</dd></div>
                ))}
              </dl>

              <div className={styles.actions}>
                <Link className="btn btn-ink" href={site.projectPage(p.slug!)}>The full project <Icon name="arrow-right" /></Link>
                <a className="btn" href={main.url} target="_blank" rel="noopener">
                  {main.label} {main.note && <span className={styles.note}>{main.note}</span>} <Icon name="arrow-up-right" />
                </a>
              </div>
              {files.length > 0 && (
                <ul className={styles.files}>
                  {files.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener">{l.label} <Icon name="arrow-up-right" size={13} /></a>
                    </li>
                  ))}
                </ul>
              )}
              {p.note && <p className={styles.origin}>{p.note}</p>}
            </div>

            {CARD_CHART[p.slug!] && <div className={styles.chart}>{CARD_CHART[p.slug!]}</div>}
          </article>
        );
      })}

      {small.length > 0 && (
        <ul className={styles.more}>
          {small.map((p) => (
            <li key={p.title} className={`card reveal ${styles.entry}`}>
              <p className={styles.kind}>{p.kind} · {p.when}</p>
              <h3>{p.title}</h3>
              {p.where && <p className={styles.where}>{p.where}</p>}
              {p.line && <p className={styles.line}>{p.line}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
