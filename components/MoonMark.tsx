'use client';
// The site's mark and reading indicator: the moon waxes from new to full as you scroll down the page.
import { useEffect, useState } from 'react';
import { moonPath } from '@/lib/moon';

export function MoonMark({ size = 26 }: { size?: number }) {
  const [phase, setPhase] = useState(0.04);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 1;
      setPhase(0.04 + progress * 0.46); // new (0) to full (0.5)
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const r = size / 2 - 1.5;
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d={moonPath(c, c, r, phase)} fill="currentColor" />
    </svg>
  );
}
