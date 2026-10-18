import { profile } from '@/lib/profile';
import { img } from '@/lib/images';
import { moonPath } from '@/lib/moon';
import { Photo } from './Photo';
import { Icon } from './Icon';
import { withBase } from '@/lib/base';
import styles from './WorkGrid.module.css';

// The viewer gets the large WebP of every photo; links work without JS too (they open the image).
const large = (src: string) => img(src).src;

export function WorkGrid() {
  return (
    <section id="work" className={`wrap section ${styles.section}`} aria-labelledby="work-title">
      <header className="section-head">
        <p className="label">Work and recognition</p>
        <h2 id="work-title">A few things I&apos;ve done</h2>
      </header>

      <ul className={styles.grid}>
        {profile.highlights.map((h, index) => {
          const cover = h.photos[0];
          return (
            <li key={h.id} id={`work-${h.id}`} className={`card reveal ${styles.item}`}>
              {cover ? (
                <a className={`js-view ${styles.cover}`} href={large(cover.src)} data-gallery={h.id} data-caption={cover.caption ?? cover.alt}>
                  <Photo src={cover.src} alt={cover.alt} sizes="(min-width: 1040px) 380px, (min-width: 640px) 46vw, 92vw" />
                  {h.photos.length > 1 && <span className={styles.count}>{h.photos.length} photos</span>}
                </a>
              ) : (
                <div className={styles.plate} aria-hidden="true">
                  <svg viewBox="0 0 120 120" width="88" height="88">
                    <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="1" />
                    <path d={moonPath(60, 60, 44, 0.08 + (index % 6) * 0.07)} fill="currentColor" />
                  </svg>
                  <span>{h.org}</span>
                </div>
              )}
              {h.photos.slice(1).map((p) => (
                <a key={p.src} className="js-view" href={large(p.src)} data-gallery={h.id} data-caption={p.caption ?? p.alt} hidden>
                  {p.caption ?? p.alt}
                </a>
              ))}
              <div className={styles.body}>
                <p className={styles.meta}>{h.when} · {h.place}</p>
                <h3>{h.title}</h3>
                <p className={styles.org}>{h.org}</p>
                <p className={styles.line}>{h.line}</p>
                {h.proof.length > 0 && (
                  <p className={styles.proof}>
                    {h.proof.map((p) =>
                      p.image ? (
                        <a key={p.label} className="js-view" href={large(p.image)} data-caption={p.label}>View the {p.label.toLowerCase()}</a>
                      ) : (
                        <a key={p.label} href={p.file ? withBase(p.file) : p.url} target="_blank" rel="noopener">
                          View the {p.label.toLowerCase()} <Icon name="arrow-up-right" size={13} />
                        </a>
                      ),
                    )}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
