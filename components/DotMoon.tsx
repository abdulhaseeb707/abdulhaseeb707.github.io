'use client';
// The hero illustration: a moon made of 6,683 dots, one for every firm-year in the research panel.
// Lit side in ink, the dark side in faint brass ("earthshine"). Seeded, so it is the same moon every time.
import { useEffect, useRef } from 'react';

type Props = { dots: number; phase?: number; label: string };

export function DotMoon({ dots, phase = 0.29, label }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current!;
    const g = el.getContext('2d')!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;

    // positions are fixed (seeded), then drawn at whatever size the canvas has
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const k = Math.cos(2 * Math.PI * phase);
    const points: { x: number; y: number; lit: boolean; depth: number }[] = [];
    while (points.length < dots) {
      const x = rnd() * 2 - 1;
      const y = rnd() * 2 - 1;
      if (x * x + y * y > 1) continue;
      points.push({ x, y, lit: x >= k * Math.sqrt(1 - y * y), depth: Math.sqrt(x * x + y * y) });
    }
    // reveal order: random, so the moon "develops" like a photograph
    const order = points.map((_, i) => i).sort(() => rnd() - 0.5);

    // each frame adds only the dots not yet drawn (redrawing all of them every frame cost seconds on phones);
    // a new canvas size clears it, so then everything is drawn again
    let drawn = 0;
    const draw = (count: number) => {
      const size = el.clientWidth;
      if (!size) return; // hidden (phones and tablets); drawn on resize if the window gets wide enough
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (el.width !== Math.round(size * dpr)) {
        el.width = Math.round(size * dpr);
        el.height = Math.round(size * dpr);
        drawn = 0;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = size / 2;
      const R = size * 0.46;
      const dot = Math.max(0.9, size / 420);
      for (let n = drawn; n < count; n++) {
        const p = points[order[n]];
        g.beginPath();
        g.arc(c + p.x * R, c + p.y * R, p.lit ? dot * 1.05 : dot * 0.85, 0, Math.PI * 2);
        g.fillStyle = p.lit
          ? `rgba(17, 26, 43, ${0.5 + 0.42 * p.depth})`
          : `rgba(183, 128, 42, ${0.16 + 0.14 * (1 - p.depth)})`;
        g.fill();
      }
      drawn = Math.max(drawn, count);
    };

    if (reduce) {
      draw(points.length);
    } else {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 1100);
        draw(Math.round(points.length * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }

    const onResize = () => draw(points.length);
    addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('resize', onResize);
    };
  }, [dots, phase]);

  return <canvas ref={canvas} role="img" aria-label={label} style={{ width: '100%', aspectRatio: '1', display: 'block' }} />;
}
