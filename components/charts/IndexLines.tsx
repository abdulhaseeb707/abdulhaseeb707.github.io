'use client';
// Step 3, rupees vs real: aggregate operating profit indexed to FY06 = 100, both series on ONE axis (never dual-axis).
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { Frame, Tip, useActive, useWidth, COLORS, fmt } from './kit';
import s from './charts.module.css';

type Row = { label: string; nominal: number; real: number };

export function IndexLines({ data }: { data: Row[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const { active, setActive, onKey } = useActive(data.length);
  const narrow = width < 520;
  const H = narrow ? 250 : 320;
  const m = { l: 38, r: narrow ? 46 : 108, t: 14, b: 28 };
  const x = scaleLinear().domain([0, data.length - 1]).range([m.l, width - m.r]);
  const top = Math.ceil(Math.max(...data.map((d) => d.nominal)) / 100) * 100;
  const y = scaleLinear().domain([0, top]).range([H - m.b, m.t]);
  const path = (k: 'nominal' | 'real') => line<Row>().x((_, i) => x(i)).y((d) => y(d[k]))(data) ?? '';
  const every = narrow ? 6 : 3;
  const ticksX = data.map((_, i) => i).filter((i) => i % every === 0 && data.length - 1 - i >= every / 2).concat(data.length - 1);
  const last = data.at(-1)!;
  const a = active === null ? null : data[active];

  const move = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    setActive(Math.max(0, Math.min(data.length - 1, Math.round(x.invert(e.clientX - box.left)))));
  };

  return (
    <Frame
      boxRef={ref}
      legend={[
        { label: 'In rupees (nominal)', color: COLORS.forest },
        { label: 'After inflation (real)', color: COLORS.brass },
      ]}
      readout={a ? `${a.label}: ${fmt.num(a.nominal, 0)} in rupees, ${fmt.num(a.real, 0)} after inflation (FY06 = 100)` : 'Tap or hover on the chart to read each year. Arrow keys work too.'}
      caption="Aggregate operating profit, chain-linked index, FY06 = 100. Source: SBP financial statements of 441 listed non-financial firms; real values deflated by the CPI."
    >
      <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}
        aria-label={`Operating profit index. In rupees it rose from 100 to ${fmt.num(last.nominal, 0)}; after inflation it ended at ${fmt.num(last.real, 0)}.`}>
        {y.ticks(narrow ? 4 : 7).map((v) => (
          <g key={v}>
            <line className={v === 100 ? s.axis : s.grid} x1={m.l} x2={width - m.r} y1={y(v)} y2={y(v)} />
            <text className={s.tick} x={m.l - 8} y={y(v) + 4} textAnchor="end">{v}</text>
          </g>
        ))}
        {ticksX.map((i) => <text key={i} className={s.tick} x={x(i)} y={H - 8} textAnchor="middle">{data[i].label}</text>)}
        <path d={path('real')} fill="none" stroke={COLORS.brass} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={path('nominal')} fill="none" stroke={COLORS.forest} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(data.length - 1)} cy={y(last.nominal)} r={4} fill={COLORS.forest} stroke={COLORS.paper} strokeWidth={2} />
        <circle cx={x(data.length - 1)} cy={y(last.real)} r={4} fill={COLORS.brass} stroke={COLORS.paper} strokeWidth={2} />
        <text className={s.label} x={x(data.length - 1) + 10} y={y(last.nominal) + 4}>
          <tspan className={s.labelStrong}>{fmt.num(last.nominal, 0)}</tspan>{narrow ? '' : ' in rupees'}
        </text>
        <text className={s.label} x={x(data.length - 1) + 10} y={y(last.real) + 4}>
          <tspan className={s.labelStrong}>{fmt.num(last.real, 0)}</tspan>{narrow ? '' : ' real'}
        </text>
        {a && active !== null && (
          <>
            <line className={s.cross} x1={x(active)} x2={x(active)} y1={m.t} y2={H - m.b} />
            <circle cx={x(active)} cy={y(a.nominal)} r={4.5} fill={COLORS.forest} stroke={COLORS.paper} strokeWidth={2} />
            <circle cx={x(active)} cy={y(a.real)} r={4.5} fill={COLORS.brass} stroke={COLORS.paper} strokeWidth={2} />
            <Tip x={x(active)} y={m.t} maxX={width - m.r + 40} lines={[a.label, `Rupees ${fmt.num(a.nominal, 0)}`, `Real ${fmt.num(a.real, 0)}`]} />
          </>
        )}
        <rect className={s.hit} x={m.l} y={m.t} width={width - m.l - m.r} height={H - m.t - m.b} onPointerMove={move} onPointerDown={move} onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)} />
      </svg>
    </Frame>
  );
}
