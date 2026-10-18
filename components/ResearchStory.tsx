'use client';
// Scrollytelling: notes scroll on the left, the matching chart stays pinned on the right and changes.
// Phones (and no-JS) get each chart inline under its note instead.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { moonPath } from '@/lib/moon';
import styles from './ResearchStory.module.css';

type Step = { title: string; text: string };

export function ResearchStory({ steps, figures }: { steps: Step[]; figures: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = [...(list.current?.querySelectorAll<HTMLElement>('[data-step]') ?? [])];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.step)));
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.story}>
      <ol ref={list} className={styles.steps}>
        {steps.map((st, i) => (
          <li key={st.title} data-step={i} className={styles.step} aria-current={active === i ? 'step' : undefined}>
            <div className={styles.head}>
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                <circle cx="11" cy="11" r="9.5" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d={moonPath(11, 11, 9.5, Math.min(0.5, (i + 1) / 12))} fill="currentColor" />
              </svg>
              <span className="label">{String(i + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
            </div>
            <h2>{st.title}</h2>
            <p>{st.text}</p>
            <div className={styles.inline}>{figures[i]}</div>
          </li>
        ))}
      </ol>
      <div className={styles.stage}>
        <div className={styles.sticky}>
          {figures.map((f, i) => (
            <div key={i} className={styles.panel} data-on={active === i ? 'true' : 'false'}>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
