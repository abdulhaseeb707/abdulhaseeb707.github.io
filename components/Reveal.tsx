'use client';
// Fades in elements marked .reveal as they enter the screen (CSS skips it under reduced motion).
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -6% 0px' },
    );
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
