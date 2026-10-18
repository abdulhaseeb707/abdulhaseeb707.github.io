import type { Metadata } from 'next';
import Link from 'next/link';
import { profile, site } from '@/lib/profile';
import { years, profitIndex, sectorSizes, sectorSlopes, kink, inference, totals, shortSector } from '@/lib/research';
import { ResearchStory } from '@/components/ResearchStory';
import { Numbers } from '@/components/Numbers';
import { Icon } from '@/components/Icon';
import { Emph } from '@/components/Emph';
import { InflationLine } from '@/components/charts/InflationLine';
import { SectorBars } from '@/components/charts/SectorBars';
import { IndexLines } from '@/components/charts/IndexLines';
import { KinkScatter } from '@/components/charts/KinkScatter';
import { SectorSlopes } from '@/components/charts/SectorSlopes';
import { InferenceCompare } from '@/components/charts/InferenceCompare';
import { fmt } from '@/lib/format';
import styles from './page.module.css';

const r = profile.research;

export const metadata: Metadata = {
  title: r.title,
  description: r.tagline,
};

export default function ResearchPage() {
  const figures = [
    <div key="q">
      <InflationLine data={years.map((y) => ({ label: y.label, inflation: y.inflation }))} />
      <Numbers head={['Year', 'Inflation (%)']} scroll rows={years.map((y) => [y.label, fmt(y.inflation, 1)])} />
    </div>,
    <div key="d">
      <SectorBars data={sectorSizes.map((s) => ({ ...s, label: shortSector(s.sector) }))} total={totals.firmYears} />
      <Numbers head={['Sector', 'Firm-years']} scroll rows={sectorSizes.map((s) => [s.sector, s.firmYears.toLocaleString('en')])} />
    </div>,
    <div key="i">
      <IndexLines data={profitIndex} />
      <Numbers head={['Year', 'In rupees', 'After inflation']} scroll rows={profitIndex.map((p) => [p.label, fmt(p.nominal, 1), fmt(p.real, 1)])} />
    </div>,
    <div key="k">
      <KinkScatter data={years} at={kink.at} below={kink.below} above={kink.above} />
      <Numbers
        head={['Threshold', 'Slope below', 'Slope above', 'Change, bootstrap p']}
        rows={kink.scan.map((t) => [`${t.threshold}%`, fmt(t.below, 2), fmt(t.above, 2), fmt(t.pBoot, 3)])}
      />
    </div>,
    <div key="s">
      <SectorSlopes data={sectorSlopes.map((s) => ({ ...s, label: shortSector(s.sector) }))} />
      <Numbers
        head={['Sector', 'Slope', '95% interval', 'p']}
        scroll
        rows={[...sectorSlopes].reverse().map((s) => [s.sector, fmt(s.slope, 3), `${fmt(s.low, 2)} to ${fmt(s.high, 2)}`, fmt(s.p, 4)])}
      />
    </div>,
    <div key="t">
      <InferenceCompare coef={inference.coef} rows={inference.rows} />
      <Numbers head={['Method', 'p-value']} rows={inference.rows.map((x) => [x.method, fmt(x.p, 4)])} />
    </div>,
  ];

  return (
    <article className="chart-paper">
      <header className={`wrap ${styles.head}`}>
        <Link href="/#research" className={styles.back}><Icon name="arrow-left" /> Home</Link>
        <p className="label">Research · {r.status}</p>
        <h1 className={styles.title}>{r.title}</h1>
        <p className={styles.tagline}>{r.tagline}</p>
        <dl className={styles.stats}>
          {r.stats.map((s) => (
            <div key={s.text}><dt>{s.figure}</dt><dd>{s.text}</dd></div>
          ))}
        </dl>
        <ul className={styles.links}>
          {r.links.map((l, i) => (
            <li key={l.url}>
              <a className={`btn ${i === 0 ? 'btn-ink' : ''}`} href={l.url} target="_blank" rel="noopener">
                {l.label} <span className={styles.note}>{l.note}</span> <Icon name="arrow-up-right" />
              </a>
            </li>
          ))}
        </ul>
      </header>

      <section className={`wrap ${styles.storyWrap}`} aria-label="The research in six charts">
        <ResearchStory steps={r.story} figures={figures} />
      </section>

      <section className={`wrap ${styles.after}`}>
        <div className={`card ${styles.box}`}>
          <p className="label">What it means</p>
          <ul className={styles.list}>{r.implications.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className={styles.small}>{r.limitations}</p>
        </div>
        <div className={`card ${styles.box}`}>
          <p className="label">What I did</p>
          <ul className={styles.list}>{r.did.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className={styles.small}>{r.origin}</p>
          <p className={styles.tags}>{r.tags.join(' · ')}</p>
        </div>
      </section>

      <section className={`wrap ${styles.end}`}>
        <h2><Emph text="Want the full *paper*?" /></h2>
        <p className={styles.small}>{r.paperTitle}. {r.status}</p>
        <div className={styles.endActions}>
          <a className="btn btn-ink" href={r.links[0].url} target="_blank" rel="noopener">Read the paper <Icon name="arrow-up-right" /></a>
          <a className="btn" href={site.cvFile} download><Icon name="download" /> Download my CV</a>
        </div>
      </section>
    </article>
  );
}
