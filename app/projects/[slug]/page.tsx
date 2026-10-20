import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { profile, site } from '@/lib/profile';
import { pageMeta, shareImage } from '@/lib/meta';
import { projectGraph } from '@/lib/structured-data';
import { JsonLd } from '@/components/JsonLd';
import { costOptimization as co } from '@/lib/projects';
import { PlantCosts } from '@/components/charts/PlantCosts';
import { ScenarioChanges } from '@/components/charts/ScenarioChanges';
import { AltFuelCap } from '@/components/charts/AltFuelCap';
import { Numbers } from '@/components/Numbers';
import { Icon } from '@/components/Icon';
import { Emph } from '@/components/Emph';
import { fmt } from '@/lib/format';
import styles from './page.module.css';

// One page per project with a slug in profile.yaml. The words come from profile.yaml; the charts named in its
// sections come from this table, so a project page fails the build if it asks for a chart that does not exist.
const CHARTS: Record<string, Record<string, ReactNode>> = {
  'cost-optimization': {
    plants: (
      <>
        <PlantCosts data={co.plants} />
        <Numbers
          head={['Plant', 'FY25 mix (Rs per GJ)', 'Optimized (Rs per GJ)', 'Change']}
          rows={co.plants.map((p) => [p.plant, fmt(p.baseline, 0), fmt(p.optimized, 0), `${fmt(p.change, 1)}%`])}
        />
      </>
    ),
    scenarios: (
      <>
        <ScenarioChanges data={co.scenarios} base={co.baseCost} />
        <Numbers
          head={['Scenario', 'Optimized bill (Rs bn a year)', 'Rs per GJ', 'Change against base']}
          rows={co.scenarios.map((x) => [x.scenario, fmt(x.cost / 1e9, 2), fmt(x.perGj, 0), `${fmt(x.change, Math.abs(x.change) < 0.1 ? 2 : 1)}%`])}
        />
      </>
    ),
    cap: (
      <>
        <AltFuelCap data={co.altFuelCap} modelCap={co.modelCap} />
        <Numbers head={['Cap (share of kiln heat)', 'Optimized cost (Rs per GJ)']} scroll rows={co.altFuelCap.map((x) => [`${x.cap}%`, fmt(x.perGj, 2)])} />
      </>
    ),
  },
};

const pages = profile.projects.filter((p) => p.slug);

export const dynamicParams = false;
export function generateStaticParams() {
  return pages.map((p) => ({ slug: p.slug! }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = pages.find((x) => x.slug === slug);
  return p
    ? pageMeta({
        title: p.title,
        description: profile.seo.projects[slug].description,
        path: site.projectPage(slug),
        image: shareImage(slug, `${p.title}: a project by ${profile.person.name}`),
      })
    : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = pages.find((x) => x.slug === slug);
  if (!p) notFound();
  const charts = CHARTS[slug] ?? {};
  for (const s of p.sections) {
    if (s.chart && !charts[s.chart]) throw new Error(`profile.yaml: project "${slug}" asks for chart "${s.chart}", which app/projects/[slug]/page.tsx does not have`);
  }

  return (
    <article className="chart-paper">
      <JsonLd graph={projectGraph(slug)} />
      <header className={`wrap ${styles.head}`}>
        <Link href="/#projects" className={styles.back}><Icon name="arrow-left" /> Back to my projects</Link>
        <p className="label">Project · {p.kind}, {p.when}</p>
        <h1 className={styles.title}>{p.title}</h1>
        <p className={styles.tagline}>{p.tagline}</p>
        <dl className={styles.stats}>
          {p.stats.map((s) => (
            <div key={s.text}><dt>{s.figure}</dt><dd>{s.text}</dd></div>
          ))}
        </dl>
        <ul className={styles.links}>
          {p.links.map((l, i) => (
            <li key={l.url}>
              <a className={`btn ${i === 0 ? 'btn-ink' : ''}`} href={l.url} target="_blank" rel="noopener">
                {l.label} {l.note && <span className={styles.note}>{l.note}</span>} <Icon name="arrow-up-right" />
              </a>
            </li>
          ))}
        </ul>
      </header>

      <div className={`wrap ${styles.body}`}>
        {p.intro.length > 0 && (
          <div className={styles.intro}>
            {p.intro.map((t) => <p key={t} className="lead">{t}</p>)}
          </div>
        )}
        {p.sections.map((s) => (
          <section key={s.heading} className={styles.block}>
            <h2>{s.heading}</h2>
            {s.text && <p>{s.text}</p>}
            {s.list && <ul className={styles.list}>{s.list.map((t) => <li key={t}>{t}</li>)}</ul>}
            {s.chart && <figure className={`card ${styles.figure}`}>{charts[s.chart]}</figure>}
          </section>
        ))}
      </div>

      <section className={`wrap ${styles.after}`}>
        {p.did.length > 0 && (
          <div className={`card ${styles.box}`}>
            <p className="label">What I did</p>
            <ul className={styles.list}>{p.did.map((t) => <li key={t}>{t}</li>)}</ul>
            {p.tags.length > 0 && <p className={styles.tags}>{p.tags.join(' · ')}</p>}
          </div>
        )}
        {p.caveat && (
          <div className={`card ${styles.box}`}>
            <p className="label">Read this first</p>
            <p>{p.caveat}</p>
          </div>
        )}
      </section>

      <section className={`wrap ${styles.end}`}>
        <h2><Emph text="Want to see the *model*?" /></h2>
        <div className={styles.endActions}>
          <a className="btn btn-ink" href={p.links[0].url} target="_blank" rel="noopener">{p.links[0].label} <Icon name="arrow-up-right" /></a>
          <a className="btn" href={site.cvFile} download><Icon name="download" /> Download my CV</a>
        </div>
      </section>
    </article>
  );
}
