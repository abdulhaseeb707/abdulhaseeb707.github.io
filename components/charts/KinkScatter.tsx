'use client';
// Step 4, the 10% bend: median ROA against inflation, one dot per fiscal year, split at the 10% threshold.
// The fitted slopes come from the paper's threshold model (within firms); they are stated, not drawn, to avoid
// implying a fit to these 20 medians.
import { scaleLinear } from 'd3-scale';
import { Frame, Tip, useWidth, COLORS, fmt } from './kit';
import { useState } from 'react';
import s from './charts.module.css';

type Point = { label: string; inflation: number; medianRoa: number };

export function KinkScatter({ data, at, below, above }: { data: Point[]; at: number; below: number; above: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const narrow = width < 520;
  const H = narrow ? 260 : 320;
  const m = { l: 36, r: 18, t: 18, b: 34 };
  const x = scaleLinear().domain([0, 32]).range([m.l, width - m.r]);
  const y = scaleLinear().domain([0, 8]).range([H - m.b, m.t]);
  const order = data.map((_, i) => i).sort((a, b) => data[a].inflation - data[b].inflation);
  const named = new Set(['FY13', 'FY09', 'FY23', 'FY24']);
  const a = active === null ? null : data[active];

  const move = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const px = e.clientX - box.left;
    const py = e.clientY - box.top;
    let best = 0;
    let dist = Infinity;
    data.forEach((d, i) => {
      const dd = (x(d.inflation) - px) ** 2 + (y(d.medianRoa) - py) ** 2;
      if (dd < dist) { dist = dd; best = i; }
    });
    setActive(dist < 60 ** 2 ? best : null);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const pos = active === null ? -1 : order.indexOf(active);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setActive(order[Math.min(order.length - 1, pos + 1)]); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setActive(order[Math.max(0, pos === -1 ? order.length - 1 : pos - 1)]); }
    if (e.key === 'Escape') setActive(null);
  };

  return (
    <Frame
      boxRef={ref}
      legend={[
        { label: `Years below ${at}% inflation`, color: COLORS.forest, kind: 'dot' },
        { label: `Years at or above ${at}%`, color: COLORS.brass, kind: 'dot' },
      ]}
      readout={a ? `${a.label}: inflation ${fmt.num(a.inflation)}%, median ROA ${fmt.num(a.medianRoa, 2)}%` : 'Hover a dot, or focus the chart and use the arrow keys.'}
      caption={`Median return on assets of listed non-financial firms by fiscal year. Threshold model (firm fixed effects): ${fmt.signed(below)} pp of ROA per point of inflation below ${at}%, ${fmt.signed(above)} above.`}
    >
      <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}
        aria-label={`Scatter of median ROA against inflation for 20 fiscal years, with a line at ${at}% inflation.`}>
        {[0, 2, 4, 6, 8].map((v) => (
          <g key={v}>
            <line className={s.grid} x1={m.l} x2={width - m.r} y1={y(v)} y2={y(v)} />
            <text className={s.tick} x={m.l - 8} y={y(v) + 4} textAnchor="end">{v}%</text>
          </g>
        ))}
        {[0, 10, 20, 30].map((v) => <text key={v} className={s.tick} x={x(v)} y={H - 12} textAnchor="middle">{v}%</text>)}
        <text className={s.note} x={width - m.r} y={H - 0} textAnchor="end">inflation</text>
        <line className={s.axis} x1={x(at)} x2={x(at)} y1={m.t} y2={H - m.b} />
        <text className={s.note} x={x(at) + 6} y={m.t + 4}>{at}%</text>
        {!narrow && (
          <>
            <text className={s.note} x={x(at) - 8} y={y(7.3)} textAnchor="end">{fmt.signed(below)} pp per point</text>
            <text className={s.note} x={x(at) + 8} y={y(7.3)}>{fmt.signed(above)}, flat</text>
          </>
        )}
        {data.map((d, i) => (
          <g key={d.label}>
            <circle cx={x(d.inflation)} cy={y(d.medianRoa)} r={active === i ? 6 : 4.5}
              fill={d.inflation < at ? COLORS.forest : COLORS.brass} stroke={COLORS.paper} strokeWidth={2} />
            {named.has(d.label) && !narrow && (
              <text className={s.tick} x={x(d.inflation) + 8} y={y(d.medianRoa) - 6}>{d.label}</text>
            )}
          </g>
        ))}
        {a && (
          <Tip x={x(a.inflation)} y={Math.max(m.t, y(a.medianRoa) - 64)} maxX={width} lines={[a.label, `Inflation ${fmt.num(a.inflation)}%`, `Median ROA ${fmt.num(a.medianRoa, 2)}%`]} />
        )}
        <rect className={s.hit} x={m.l} y={m.t} width={width - m.l - m.r} height={H - m.t - m.b} onPointerMove={move} onPointerLeave={() => setActive(null)} />
      </svg>
    </Frame>
  );
}
