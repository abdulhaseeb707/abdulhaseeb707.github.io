'use client';
// Step 1, the question: CPI inflation by fiscal year, FY06 to FY25. One series, so no legend; the title names it.
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { Frame, Tip, useActive, useWidth, COLORS, fmt } from './kit';
import s from './charts.module.css';

type Row = { label: string; inflation: number };

export function InflationLine({ data }: { data: Row[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const { active, setActive, onKey } = useActive(data.length);
  const narrow = width < 520;
  const H = narrow ? 240 : 300;
  const m = { l: 36, r: 16, t: 16, b: 28 };
  const x = scaleLinear().domain([0, data.length - 1]).range([m.l, width - m.r]);
  const y = scaleLinear().domain([0, 32]).range([H - m.b, m.t]);
  const path = line<Row>().x((_, i) => x(i)).y((d) => y(d.inflation))(data) ?? '';
  const every = narrow ? 6 : 3;
  const ticksX = data.map((_, i) => i).filter((i) => i % every === 0 && data.length - 1 - i >= every / 2).concat(data.length - 1);
  const low = data.reduce((a, d, i) => (d.inflation < data[a].inflation ? i : a), 0);
  const high = data.reduce((a, d, i) => (d.inflation > data[a].inflation ? i : a), 0);

  const move = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    setActive(Math.max(0, Math.min(data.length - 1, Math.round(x.invert(e.clientX - box.left)))));
  };
  const a = active === null ? null : data[active];

  return (
    <Frame
      boxRef={ref}
      readout={a ? `${a.label}: inflation ${fmt.num(a.inflation)}%` : 'Tap or hover on the chart to read each year. Arrow keys work too.'}
      caption="CPI inflation, 12-month average over each fiscal year. Sources: IMF, Pakistan Bureau of Statistics."
    >
      <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}
        aria-label={`Inflation by fiscal year, from ${fmt.num(data[0].inflation)}% in ${data[0].label} to a low of ${fmt.num(data[low].inflation)}% in ${data[low].label} and a high of ${fmt.num(data[high].inflation)}% in ${data[high].label}.`}>
        {[0, 10, 20, 30].map((v) => (
          <g key={v}>
            <line className={v === 10 ? s.axis : s.grid} x1={m.l} x2={width - m.r} y1={y(v)} y2={y(v)} />
            <text className={s.tick} x={m.l - 8} y={y(v) + 4} textAnchor="end">{v}%</text>
          </g>
        ))}
        {ticksX.map((i) => <text key={i} className={s.tick} x={x(i)} y={H - 8} textAnchor="middle">{data[i].label}</text>)}
        <path d={path} fill="none" stroke={COLORS.forest} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {[low, high].map((i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(data[i].inflation)} r={4} fill={COLORS.forest} stroke={COLORS.paper} strokeWidth={2} />
            <text className={s.label} x={x(i)} y={y(data[i].inflation) + (i === low ? 20 : -12)} textAnchor="middle">
              <tspan className={s.labelStrong}>{fmt.num(data[i].inflation)}%</tspan> {data[i].label}
            </text>
          </g>
        ))}
        {a && active !== null && (
          <>
            <line className={s.cross} x1={x(active)} x2={x(active)} y1={m.t} y2={H - m.b} />
            <circle cx={x(active)} cy={y(a.inflation)} r={4.5} fill={COLORS.forest} stroke={COLORS.paper} strokeWidth={2} />
            <Tip x={x(active)} y={m.t} maxX={width} lines={[a.label, `Inflation ${fmt.num(a.inflation)}%`]} />
          </>
        )}
        <rect className={s.hit} x={m.l} y={m.t} width={width - m.l - m.r} height={H - m.t - m.b} onPointerMove={move} onPointerDown={move} onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)} />
      </svg>
    </Frame>
  );
}
