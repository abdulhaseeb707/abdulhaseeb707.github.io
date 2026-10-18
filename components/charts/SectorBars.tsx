'use client';
// Step 2, the data: firm-years by sector. Magnitude, one series -> one colour for every bar, sorted, values at bar ends.
import { scaleLinear } from 'd3-scale';
import { Frame, Tip, useActive, useWidth, COLORS } from './kit';
import s from './charts.module.css';

type Row = { sector: string; label: string; firmYears: number };

export function SectorBars({ data, total }: { data: Row[]; total: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const { active, setActive, onKey } = useActive(data.length);
  const narrow = width < 520;
  const row = 24;
  const m = { l: narrow ? 128 : 170, r: 54, t: 4, b: 4 };
  const H = m.t + data.length * row + m.b;
  const x = scaleLinear().domain([0, Math.max(...data.map((d) => d.firmYears))]).range([m.l, width - m.r]);
  const a = active === null ? null : data[active];

  const move = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    setActive(Math.max(0, Math.min(data.length - 1, Math.floor((e.clientY - box.top - m.t) / row))));
  };

  return (
    <Frame
      boxRef={ref}
      readout={a ? `${a.sector}: ${a.firmYears.toLocaleString('en')} firm-years (${((a.firmYears / total) * 100).toFixed(0)}% of the panel)` : 'Hover, or focus the chart and use the arrow keys, to read each sector.'}
      caption={`${total.toLocaleString('en')} firm-years in total. Source: SBP financial statements of PSX-listed non-financial firms, FY2006–FY2025.`}
    >
      <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}
        aria-label={`Firm-years by sector. The largest is ${data[0].sector} with ${data[0].firmYears.toLocaleString('en')}; the smallest is ${data.at(-1)!.sector} with ${data.at(-1)!.firmYears}.`}>
        <line className={s.axis} x1={m.l} x2={m.l} y1={m.t} y2={H - m.b} />
        {data.map((d, i) => {
          const cy = m.t + i * row + row / 2;
          const w = Math.max(2, x(d.firmYears) - m.l);
          return (
            <g key={d.sector} opacity={active === null || active === i ? 1 : 0.45}>
              <text className={s.label} x={m.l - 10} y={cy + 4} textAnchor="end">{d.label}</text>
              <rect x={m.l} y={cy - 6} width={w} height={12} rx={4} fill={COLORS.forest} />
              <text className={s.tick} x={m.l + w + 8} y={cy + 4}>{d.firmYears.toLocaleString('en')}</text>
            </g>
          );
        })}
        {a && active !== null && (
          <Tip x={x(a.firmYears)} y={Math.min(m.t + active * row, H - 52)} maxX={width} lines={[a.label, `${a.firmYears.toLocaleString('en')} firm-years`]} />
        )}
        <rect className={s.hit} x={0} y={m.t} width={width} height={H - m.t - m.b} onPointerMove={move} onPointerLeave={() => setActive(null)} />
      </svg>
    </Frame>
  );
}
