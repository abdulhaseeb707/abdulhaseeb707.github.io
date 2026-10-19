import type { Metadata } from 'next';
import Link from 'next/link';
import { profile, site } from '@/lib/profile';
import { pageMeta } from '@/lib/meta';
import { withBase } from '@/lib/base';
import { Icon } from '@/components/Icon';
import { PrintButton } from '@/components/PrintButton';
import styles from './page.module.css';

export const metadata: Metadata = pageMeta({
  title: 'CV',
  description: `CV of ${profile.person.name}, Business Economics graduate and MPhil Economics student, ${profile.person.location}.`,
  path: site.cvPage,
});

const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

export default function CvPage() {
  const { person, contact, cv, skills, languages } = profile;
  return (
    <div className={`wrap ${styles.page}`}>
      <nav className={`${styles.toolbar} no-print`} aria-label="CV">
        <Link className="btn" href="/"><Icon name="arrow-left" /> Home</Link>
        <span className={styles.spacer} />
        <PrintButton />
        <a className="btn btn-ink" href={site.cvFile} download><Icon name="download" /> Download PDF</a>
      </nav>

      <article className={`card ${styles.sheet}`}>
        <header className={styles.head}>
          <div>
            <h1>{person.name}</h1>
            <p className={styles.role}>{person.label}</p>
          </div>
          <ul className={styles.contact}>
            <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            <li><a href={contact.linkedin}>{bare(contact.linkedin)}</a></li>
            <li><a href={contact.github}>{bare(contact.github)}</a></li>
            <li><a href={site.url}>{bare(site.url)}</a></li>
          </ul>
        </header>

        <p className={styles.summary}>{cv.summary}</p>

        {cv.sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2>{section.title}</h2>
            {section.entries.map((e) => (
              <div key={e.title} className={styles.entry}>
                <div className={styles.entryHead}>
                  <h3>{e.title}</h3>
                  {e.dates && <p className={styles.dates}>{e.dates}</p>}
                </div>
                {e.org && <p className={styles.org}>{e.org}</p>}
                {e.link && <p className={styles.repo}><a href={e.link.startsWith('/') ? withBase(e.link) : e.link}>{e.linkLabel ?? bare(e.link)}</a></p>}
                {e.bullets.length > 0 && <ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
              </div>
            ))}
          </section>
        ))}

        <section className={styles.section}>
          <h2>Skills</h2>
          <dl className={styles.skills}>
            {skills.map((g) => (
              <div key={g.group}><dt>{g.group}</dt><dd>{g.items.join(', ')}</dd></div>
            ))}
            <div><dt>Languages</dt><dd>{languages.map((l) => `${l.name} (${l.level})`).join('; ')}</dd></div>
          </dl>
        </section>
      </article>
    </div>
  );
}
