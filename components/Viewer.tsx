'use client';
// One shared photo viewer. Any link with class "js-view" opens in it; links sharing data-gallery can be flipped
// through with the buttons or the arrow keys. Without JS the links simply open the image.
import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import styles from './Viewer.module.css';

type Item = { href: string; caption: string; alt: string };

export function Viewer() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a.js-view');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      const group = link.dataset.gallery;
      const links = group ? [...document.querySelectorAll<HTMLAnchorElement>(`a.js-view[data-gallery="${group}"]`)] : [link];
      setItems(links.map((a) => ({ href: a.href, caption: a.dataset.caption ?? '', alt: a.querySelector('img')?.alt ?? a.dataset.caption ?? '' })));
      setIndex(Math.max(0, links.indexOf(link)));
      dialog.current?.showModal();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const go = (step: number) => setIndex((i) => (i + step + items.length) % items.length);
  const item = items[index];

  return (
    <dialog
      ref={dialog}
      className={styles.viewer}
      aria-label="Photo viewer"
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
      }}
      onClose={() => setItems([])}
    >
      {item && (
        <figure>
          <img src={item.href} alt={item.alt} />
          <figcaption>
            <span>{item.caption}</span>
            {items.length > 1 && <span className={styles.pos}>{index + 1} / {items.length}</span>}
          </figcaption>
        </figure>
      )}
      <div className={styles.controls}>
        {items.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo"><Icon name="arrow-left" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo"><Icon name="arrow-right" /></button>
          </>
        )}
        <button type="button" onClick={() => dialog.current?.close()} aria-label="Close"><Icon name="close" /></button>
      </div>
    </dialog>
  );
}
