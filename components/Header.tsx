import Link from 'next/link';
import { MoonMark } from './MoonMark';
import { Icon } from './Icon';
import { profile, site } from '@/lib/profile';
import styles from './Header.module.css';

// in the same order as the sections on the home page
const nav = [
  { href: '/#work', label: 'Work' },
  { href: '/#education', label: 'Education' },
  { href: '/#papers', label: 'Papers' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#places', label: 'Places' },
  { href: '/#contact', label: 'Contact' },
];

export function Header() {
  return (
    <header className={`${styles.header} no-print`}>
      <div className={`wrap ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label={`${profile.person.name}, home`}>
          <MoonMark />
          <span>{profile.person.name}</span>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <ul>
            {nav.map((n) => (
              <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
            ))}
          </ul>
        </nav>

        <a className={`btn btn-ink ${styles.cv}`} href={site.cvFile} download>
          <Icon name="download" /> <span>Download CV</span>
        </a>

        <details className={styles.menu}>
          <summary aria-label="Menu"><span /><span /></summary>
          <nav aria-label="Main">
            <ul>
              {nav.map((n) => (
                <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
              ))}
              <li><Link href={site.researchPage}>The research in six charts</Link></li>
              <li><Link href={site.cvPage}>CV as a web page</Link></li>
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}
