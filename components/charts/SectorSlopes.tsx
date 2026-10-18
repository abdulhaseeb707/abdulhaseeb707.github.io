'use client';
// Step 5, sectors: slope of ROA on inflation per sector with 95% intervals (dot and whisker).
// Emphasis, not categorical: sectors whose slope is clearly above zero in forest, the rest in grey.
import { scaleLinear } from 'd3-scale';
import { Frame, Tip, useActive, useWidth, COLORS, fmt } from './kit';
import s from './charts.module.css';

type Row = { sector: string; label: string; slope: number; low: number; high: number; p: number; significant: boolean };

export function SectorSlopes({ data }: { data: Row[] }) {
  const rows = [...data].sort((a, b) => b.slope - a.slope);
  const [ref, width] = useWidth<HTMLDivElement>();
  const { active, setActive, onKey } = useActive(rows.length);
  const narrow = width < 520;
  const row = 26;
  const m = { l: narrow ? 124 : 168, r: narrow ? 14 : 64, t: 26, b: 26 };
  const H = m.t + rows.length * row + m.b;
  const x = scaleLinear().domain([-0.65, 0.65]).range([m.l, width - m.r]);
  const a = active === null ? null : rows[active];
  const labelled = new Set([rows[0].sector, rows.at(-1)!.sector, rows.at(-2)!.sector]);

  const move = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const i = Math.floor((e.clientY - box.top - m.t) / row);
    setActive(i >= 0 && i < rows.length ? i : null);
  };

  return (
    <Frame
      boxRef={ref}
      legend={[
        { label: 'Clearly above zero (p < 0.05)', color: COLORS.forest, kind: 'dot' },
        { label: 'Not clearly different from zero', color: COLORS.context, kind: 'dot' },
      ]}
      readout={a ? `${a.sector}: ${fmt.signed(a.slope)} pp of ROA per point of inflation (95% interval ${fmt.signed(a.low)} to ${fmt.signed(a.high)}, ${fmt.p(a.p)})` : 'Hover a row, or focus the chart and use the arrow keys.'}
      caption="Change in ROA (percentage points) per point of inflation, by sector, with 95% intervals. Driscoll–Kraay standard errors."
    >
      <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}
        aria-label={`Sector slopes. Highest: ${rows[0].sector}, ${fmt.signed(rows[0].slope)}. Lowest: ${rows.at(-1)!.sector}, ${fmt.signed(rows.at(-1)!.slope)}.`}>
        {[-0.5, -0.25, 0, 0.25, 0.5].map((v) => (
          <g key={v}>
            <line className={v === 0 ? s.axis : s.grid} x1={x(v)} x2={x(v)} y1={m.t - 8} y2={H - m.b} />
            <text className={s.tick} x={x(v)} y={H - 8} textAnchor="middle">{v === 0 ? '0' : fmt.signed(v)}</text>
          </g>
        ))}
        <text className={s.note} x={x(0) - 6} y={m.t - 12} textAnchor="end">lower ROA</text>
        <text className={s.note} x={x(0) + 6} y={m.t - 12}>higher ROA</text>
        {rows.map((d, i) => {
          const cy = m.t + i * row + row / 2;
          const color = d.significant ? COLORS.forest : COLORS.context;
          return (
            <g key={d.sector} opacity={active === null || active === i ? 1 : 0.5}>
              <text className={s.label} x={m.l - 10} y={cy + 4} textAnchor="end">{d.label}</text>
              <line x1={x(Math.max(-0.65, d.low))} x2={x(Math.min(0.65, d.high))} y1={cy} y2={cy} stroke={color} strokeWidth={2} strokeLinecap="round" />
              <circle cx={x(d.slope)} cy={cy} r={5} fill={color} stroke={COLORS.paper} strokeWidth={2} />
              {labelled.has(d.sector) && !narrow && (
                <text className={s.labelStrong} x={x(Math.min(0.65, d.high)) + 8} y={cy + 4}>{fmt.signed(d.slope)}</text>
              )}
            </g>
          );
        })}
        {a && active !== null && (
          <Tip x={x(a.slope)} y={Math.min(m.t + active * row + 14, H - 70)} maxX={width}
            lines={[a.label, `Slope ${fmt.signed(a.slope)} pp`, `95%: ${fmt.signed(a.low)} to ${fmt.signed(a.high)}`]} />
        )}
        <rect className={s.hit} x={0} y={m.t} width={width} height={H - m.t - m.b} onPointerMove={move} onPointerLeave={() => setActive(null)} />
      </svg>
    </Frame>
  );
}
