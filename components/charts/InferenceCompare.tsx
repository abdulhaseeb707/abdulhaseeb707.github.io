'use client';
// Step 6, the trap: the same coefficient judged three ways. p-values on a log scale against the 0.05 line.
import { scaleLog } from 'd3-scale';
import { Frame, useActive, useWidth, COLORS, fmt } from './kit';
import s from './charts.module.css';

type Row = { method: string; p: number; note: string };

export function InferenceCompare({ coef, rows }: { coef: number; rows: Row[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const { active, setActive, onKey } = useActive(rows.length);
  const narrow = width < 520;
  // method name and note sit above each row, so long notes never run off the left edge
  const row = 78;
  const m = { l: 14, r: 70, t: 34, b: 30 };
  const H = m.t + rows.length * row + m.b;
  const x = scaleLog().domain([0.0001, 1]).range([m.l, width - m.r]);
  const ticks = [0.0001, 0.001, 0.01, 0.05, 1];
  const a = active === null ? null : rows[active];

  return (
    <Frame
      boxRef={ref}
      readout={a ? `${a.method}: ${fmt.p(a.p)}, ${a.note}.` : `Same estimate in every row: ${fmt.signed(coef)} pp of ROA per point of inflation.`}
      caption="Model 1: ROA on inflation with firm fixed effects and macro controls (6,683 firm-years). Only the standard errors change between rows."
    >
      <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}
        aria-label={`The same coefficient, ${fmt.signed(coef)}, with three p-values: ${rows.map((r) => `${r.method} ${fmt.p(r.p)}`).join('; ')}.`}>
        <rect x={m.l} y={m.t - 10} width={x(0.05) - m.l} height={H - m.t - m.b + 10} fill={COLORS.forest} fillOpacity={0.05} />
        <text className={s.note} x={m.l + 6} y={m.t - 16}>looks significant</text>
        <text className={s.note} x={x(0.05) + 6} y={m.t - 16}>not significant</text>
        {ticks.map((t) => (
          <g key={t}>
            <line className={t === 0.05 ? s.axis : s.grid} x1={x(t)} x2={x(t)} y1={m.t - 10} y2={H - m.b} />
            <text className={s.tick} x={x(t)} y={H - 8} textAnchor="middle">{t >= 0.01 ? String(t) : t === 0.001 ? '0.001' : '0.0001'}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const cy = m.t + i * row + row / 2 + 14;
          return (
            <g key={r.method} opacity={active === null || active === i ? 1 : 0.5} onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)}>
              <rect x={0} y={cy - row / 2} width={width} height={row} fill="transparent" />
              <text className={s.labelStrong} x={m.l + 4} y={cy - 18}>{r.method}{!narrow && <tspan className={s.note} dx={10}>{r.note}</tspan>}</text>
              <line x1={x(0.0001)} x2={x(r.p)} y1={cy} y2={cy} stroke={COLORS.hair} strokeWidth={2} />
              <circle cx={x(r.p)} cy={cy} r={6} fill={COLORS.forest} stroke={COLORS.paper} strokeWidth={2} />
              <text className={s.labelStrong} x={x(r.p) + 12} y={cy + 4}>{fmt.p(r.p)}</text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}
