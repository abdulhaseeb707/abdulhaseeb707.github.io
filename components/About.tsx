import { profile } from '@/lib/profile';
import { Photo } from './Photo';
import { Emph } from './Emph';
import { RouteMap } from './RouteMap';
import styles from './About.module.css';

export function About() {
  const { about, person, cv, skills, languages } = profile;
  const pick = (title: string) => cv.sections.find((s) => s.title === title)?.entries ?? [];
  const lists = [
    { title: 'Education', entries: pick('Education') },
    { title: 'Experience', entries: pick('Experience') },
  ];
  return (
    <section id="about" className={`wrap section ${styles.section}`} aria-labelledby="about-title">
      <div className={styles.top}>
        <figure className={styles.portrait}>
          <Photo src={person.portrait} alt={`Portrait of ${person.name}`} sizes="180px" />
        </figure>
        <div>
          <p className="label">About</p>
          <h2 id="about-title"><Emph text={about.headline} /></h2>
          {about.text.map((t) => <p key={t} className="lead">{t}</p>)}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={`card ${styles.box}`}>
          {lists.map((l) => (
            <div key={l.title} className={styles.list}>
              <p className="label">{l.title}</p>
              <ul>
                {l.entries.map((e) => (
                  <li key={e.title}>
                    <strong>{e.title}</strong>
                    <span>{[e.org, e.dates].filter(Boolean).join(' · ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={`card ${styles.box}`}>
          <p className="label">What I work with</p>
          <dl className={styles.skills}>
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
        <div className={`card ${styles.box} ${styles.mapBox}`}>
          <p className="label">Where my work has taken me</p>
          <RouteMap />
        </div>
      </div>
    </section>
  );
}
