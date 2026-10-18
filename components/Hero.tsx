import Link from 'next/link';
import { DotMoon } from './DotMoon';
import { Icon } from './Icon';
import { Emph } from './Emph';
import { profile, site } from '@/lib/profile';
import { totals } from '@/lib/research';
import styles from './Hero.module.css';

export function Hero() {
  const { person } = profile;
  return (
    <section className={`wrap ${styles.hero}`} aria-labelledby="hero-title">
      <div className={styles.text}>
        <p className="label">{person.label}</p>
        <h1 id="hero-title" className={styles.title}><Emph text={person.headline} /></h1>
        <p className={styles.sub}>{person.sub}</p>
        <div className={styles.actions}>
          <a className="btn btn-ink" href={site.cvFile} download><Icon name="download" /> Download my CV</a>
          <Link className="btn" href={site.researchPage}>Read the research <Icon name="arrow-right" /></Link>
        </div>
        <dl className={styles.facts}>
          {person.facts.map((f) => (
            <div key={f.text}>
              <dt>{f.figure}</dt>
              <dd>{f.text}</dd>
            </div>
          ))}
        </dl>
      </div>

      <figure className={styles.art}>
        <svg className={styles.orbit} viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="49" />
          <circle className={styles.satellite} cx="91.5" cy="24" r="0.9" />
        </svg>
        <div className={styles.moon}>
          <DotMoon dots={totals.firmYears} label={`A moon drawn from ${totals.firmYears.toLocaleString('en')} dots`} />
        </div>
        <figcaption>{person.moonCaption}</figcaption>
      </figure>
    </section>
  );
}
