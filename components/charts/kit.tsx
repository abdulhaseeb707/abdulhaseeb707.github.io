'use client';
// Shared pieces for the hand-built charts (see the dataviz rules in AGENTS.md):
// one axis, hairline grid, 2px lines, direct labels, hover + keyboard, and a table elsewhere for every chart.
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import styles from './charts.module.css';

/** Measures a container so charts are drawn at real pixel size (text stays 11-12px on phones). */
export function useWidth<T extends HTMLElement>(initial = 720): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** Hover/keyboard index over n items laid out along x (or y). */
export function useActive(n: number) {
  const [active, setActive] = useState<number | null>(null);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a === null ? 0 : Math.min(n - 1, a + 1))); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a === null ? n - 1 : Math.max(0, a - 1))); }
    if (e.key === 'Escape') setActive(null);
  };
  return { active, setActive, onKey };
}

export const fmt = {
  num: (v: number, d = 1) => v.toLocaleString('en', { minimumFractionDigits: d, maximumFractionDigits: d }),
  signed: (v: number, d = 2) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(d)}`,
  p: (v: number) => (v < 0.001 ? 'p < 0.001' : `p = ${v.toFixed(v < 0.01 ? 3 : 2)}`),
};

/** Frame: title row (legend), the chart, a live region that reads out the hovered value. */
export function Frame({
  legend,
  children,
  readout,
  caption,
  boxRef,
}: {
  legend?: { label: string; color: string; kind?: 'line' | 'dot' }[];
  children: ReactNode;
  readout: string;
  caption?: string;
  boxRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className={styles.frame}>
      {legend && legend.length > 0 && (
        <ul className={styles.legend}>
          {legend.map((l) => (
            <li key={l.label}>
              <span className={l.kind === 'dot' ? styles.swatchDot : styles.swatchLine} style={{ background: l.color }} />
              {l.label}
            </li>
          ))}
        </ul>
      )}
      <div ref={boxRef} className={styles.box}>{children}</div>
      <p className={styles.readout} aria-live="polite">{readout}</p>
      {caption && <p className={styles.caption}>{caption}</p>}
    </div>
  );
}

/** A small tooltip box positioned inside the SVG. */
export function Tip({ x, y, lines, width, maxX }: { x: number; y: number; lines: string[]; width?: number; maxX: number }) {
  const w = width ?? Math.max(...lines.map((l) => l.length)) * 6.6 + 20;
  const h = lines.length * 17 + 12;
  const left = Math.min(Math.max(4, x + 12), maxX - w - 4);
  const flip = x + 12 + w > maxX;
  return (
    <g transform={`translate(${flip ? Math.max(4, x - w - 12) : left},${y})`} className={styles.tip} pointerEvents="none">
      <rect width={w} height={h} rx="6" />
      {lines.map((l, i) => (
        <text key={i} x="10" y={20 + i * 17} className={i === 0 ? styles.tipHead : styles.tipText}>{l}</text>
      ))}
    </g>
  );
}

export const COLORS = {
  forest: '#0e7a5a',
  brass: '#b7802a',
  steel: '#2c6db3',
  context: '#c3beb3',
  ink: '#111a2b',
  hair: '#ddd7ca',
  muted: '#656b79',
  paper: '#fbfaf6',
};
