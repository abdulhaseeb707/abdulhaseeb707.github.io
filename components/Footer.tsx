import Link from 'next/link';
import { profile, site } from '@/lib/profile';
import { moonPath } from '@/lib/moon';
import styles from './Footer.module.css';

export function Footer() {
  const { person, contact } = profile;
  return (
    <footer className={`${styles.footer} no-print`}>
      <div className={`wrap ${styles.inner}`}>
        <p className={styles.name}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <circle cx="9" cy="9" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
            <path d={moonPath(9, 9, 7.5, 0.5)} fill="currentColor" />
          </svg>
          {person.name} · {person.location}
        </p>
        <ul className={styles.links}>
          <li><Link href={site.cvPage}>CV</Link></li>
          <li><a href={`mailto:${contact.email}`}>Email</a></li>
          <li><a href={contact.linkedin} rel="me noopener" target="_blank">LinkedIn</a></li>
          <li><a href={contact.github} rel="me noopener" target="_blank">GitHub</a></li>
        </ul>
        <p className={styles.updated}>Updated {site.built}</p>
      </div>
    </footer>
  );
}
