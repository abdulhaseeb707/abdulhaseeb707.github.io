import { Fragment } from 'react';
import { Photo } from './Photo';
import { Icon } from './Icon';
import { Emph } from './Emph';
import { profile, site } from '@/lib/profile';
import styles from './Hero.module.css';

// The profile comes first: who I am, what I studied and did, with my portrait as the full moon.
export function Hero() {
  const { person } = profile;
  return (
    <section className={`wrap ${styles.hero}`} aria-labelledby="hero-title">
      <div className={styles.text}>
        {/* each part stays whole, and a line never starts with the dot */}
        <p className="label">
          {person.label.split(' · ').map((part, i, parts) => (
            <Fragment key={part}>
              {i > 0 && ' '}
              <span className={styles.nowrap}>{part}{i < parts.length - 1 && ' ·'}</span>
            </Fragment>
          ))}
        </p>
        <h1 id="hero-title" className={styles.title}><Emph text={person.headline} /></h1>
        {person.intro.map((t) => <p key={t} className={styles.sub}>{t}</p>)}
        <div className={styles.actions}>
          <a className="btn btn-ink" href={site.cvFile} download><Icon name="download" /> Download my CV</a>
          <a className="btn" href="#papers">My papers <Icon name="arrow-down" /></a>
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
        <div className={styles.disc}>
          <Photo src={person.portrait} alt={`Portrait of ${person.name}`} sizes="(min-width: 960px) 400px, 180px" priority />
        </div>
      </figure>
    </section>
  );
}
