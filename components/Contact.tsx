import Link from 'next/link';
import { profile, site } from '@/lib/profile';
import { CopyButton } from './CopyButton';
import { ContactForm } from './ContactForm';
import { Icon } from './Icon';
import styles from './Contact.module.css';

export function Contact() {
  const { contact, services } = profile;
  return (
    <section id="contact" className={`wrap section ${styles.section}`} aria-labelledby="contact-title">
      <div className={`card ${styles.card}`}>
        <p className="label">Contact</p>
        <h2 id="contact-title">Get in touch</h2>
        <p className={styles.subtext}>
          Email is the fastest way to reach me. I’m in Lahore, Pakistan (PKT, UTC+5).
        </p>
        <p className={styles.servicesText}>
          Open to research and analyst roles, scholarships, and freelance work in {services.map((s) => s.toLowerCase()).join(', ')}.
        </p>
        <div className={styles.email}>
          <a href={`mailto:${contact.email}`} className={styles.emailLink}>{contact.email}</a>
          <CopyButton text={contact.email} />
        </div>

        <ContactForm recipientEmail={contact.email} />

        <div className={styles.linksDivider}>
          <p className={styles.linksLabel}>CV &amp; Profiles</p>
          <ul className={styles.links}>
            <li><a className="btn btn-ink" href={site.cvFile} download><Icon name="download" /> Download my CV</a></li>
            <li><Link className="btn" href={site.cvPage}>View the CV online</Link></li>
            <li><a className="btn" href={contact.linkedin} rel="me noopener" target="_blank"><Icon name="linkedin" /> LinkedIn</a></li>
            <li><a className="btn" href={contact.github} rel="me noopener" target="_blank"><Icon name="github" /> GitHub</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
