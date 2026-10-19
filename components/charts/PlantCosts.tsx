'use client';
// Cost optimization: fuel cost per GJ of kiln heat at each plant, the FY25 mix against the optimized mix.
// A dot plot on one axis (not from zero: the dots compare positions); "All plants" closes the list.
import { scaleLinear } from 'd3-scale';
import { Frame, Tip, useActive, useWidth, COLORS, fmt } from './kit';
import s from './charts.module.css';

type Row = { id: string; plant: string; baseline: number; optimized: number; change: number };

const rs = (v: number) => `Rs ${fmt.num(v, 0)}`;

export function PlantCosts({ data }: { data: Row[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const { active, setActive, onKey } = useActive(data.length);
  const narrow = width < 520;
  const row = 34;
  const gap = 12; // a little space before the "All plants" row
  const m = { l: narrow ? 104 : 132, r: narrow ? 52 : 66, t: 6, b: 28 };
  const H = m.t + data.length * row + gap + m.b;
  const values = data.flatMap((d) => [d.baseline, d.optimized]);
  const x = scaleLinear()
    .domain([Math.floor(Math.min(...values) / 50) * 50, Math.ceil(Math.max(...values) / 50) * 50])
    .range([m.l, width - m.r]);
  const last = data.length - 1;
  const cy = (i: number) => m.t + i * row + row / 2 + (i === last ? gap : 0);
  const a = active === null ? null : data[active];

  const move = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const y = e.clientY - box.top - m.t;
    const i = Math.min(last, Math.floor((y > last * row ? y - gap : y) / row));
    setActive(i >= 0 ? i : null);
  };

  return (
    <Frame
      boxRef={ref}
      legend={[
        { label: 'FY25 fuel mix', color: COLORS.brass, kind: 'dot' },
        { label: 'Optimized mix', color: COLORS.forest, kind: 'dot' },
      ]}
      readout={a ? `${a.plant}: ${rs(a.baseline)} per GJ with the FY25 mix, ${rs(a.optimized)} optimized (${fmt.signed(a.change, 1)}%)` : 'Tap or hover on a plant to read it. Arrow keys work too.'}
      caption="Fuel cost per GJ of kiln heat, model year FY2025. The FY25 mix is the company-wide mix used at every plant. Supply limits and alternative-fuel prices are simulated."
    >
      <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}
        aria-label={`Fuel cost per GJ by plant. All plants: ${rs(data[last].baseline)} with the FY25 mix, ${rs(data[last].optimized)} optimized.`}>
        {x.ticks(4).filter((v) => !narrow || v % 100 === 0).map((v) => (
          <g key={v}>
            <line className={s.grid} x1={x(v)} x2={x(v)} y1={m.t} y2={H - m.b} />
            <text className={s.tick} x={x(v)} y={H - 8} textAnchor="middle">{fmt.num(v, 0)}</text>
          </g>
        ))}
        <line className={s.grid} x1={m.l - 8} x2={width - 8} y1={cy(last) - row / 2 - gap / 2} y2={cy(last) - row / 2 - gap / 2} />
        {data.map((d, i) => (
          <g key={d.id} opacity={active === null || active === i ? 1 : 0.5}>
            <text className={i === last ? s.labelStrong : s.label} x={m.l - 12} y={cy(i) + 4} textAnchor="end">{d.plant}</text>
            <line x1={x(d.optimized)} x2={x(d.baseline)} y1={cy(i)} y2={cy(i)} stroke={COLORS.hair} strokeWidth={3} strokeLinecap="round" />
            <circle cx={x(d.baseline)} cy={cy(i)} r={5.5} fill={COLORS.brass} stroke={COLORS.paper} strokeWidth={2} />
            <circle cx={x(d.optimized)} cy={cy(i)} r={5.5} fill={COLORS.forest} stroke={COLORS.paper} strokeWidth={2} />
            <text className={s.labelStrong} x={x(d.baseline) + 12} y={cy(i) + 4}>{fmt.signed(d.change, 1)}%</text>
          </g>
        ))}
        {a && active !== null && (
          <Tip x={x(a.optimized)} y={Math.min(cy(active) + 10, H - 74)} maxX={width}
            lines={[a.plant, `FY25 mix ${rs(a.baseline)}`, `Optimized ${rs(a.optimized)}`]} />
        )}
        <rect className={s.hit} x={0} y={m.t} width={width} height={H - m.t - m.b} onPointerMove={move} onPointerDown={move} onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)} />
      </svg>
    </Frame>
  );
}
