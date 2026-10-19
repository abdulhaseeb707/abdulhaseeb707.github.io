'use client';
// Cost optimization: the optimized cost per GJ as the cap on alternative fuels moves from 5% to 25% of kiln heat.
// One series, one axis; the model's own cap is marked.
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { Frame, Tip, useActive, useWidth, COLORS, fmt } from './kit';
import s from './charts.module.css';

type Row = { cap: number; perGj: number };

export function AltFuelCap({ data, modelCap }: { data: Row[]; modelCap: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const { active, setActive, onKey } = useActive(data.length);
  const narrow = width < 520;
  const H = narrow ? 230 : 280;
  const m = { l: 46, r: narrow ? 16 : 28, t: 26, b: 30 };
  const x = scaleLinear().domain([data[0].cap, data.at(-1)!.cap]).range([m.l, width - m.r]);
  const ys = data.map((d) => d.perGj);
  const y = scaleLinear().domain([Math.floor(Math.min(...ys) / 10) * 10, Math.ceil(Math.max(...ys) / 10) * 10]).range([H - m.b, m.t]);
  const path = line<Row>().x((d) => x(d.cap)).y((d) => y(d.perGj))(data) ?? '';
  const mark = data.find((d) => d.cap === modelCap);
  const a = active === null ? null : data[active];

  const move = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const cap = x.invert(e.clientX - box.left);
    let best = 0;
    data.forEach((d, i) => { if (Math.abs(d.cap - cap) < Math.abs(data[best].cap - cap)) best = i; });
    setActive(best);
  };

  return (
    <Frame
      boxRef={ref}
      readout={a ? `Cap ${fmt.num(a.cap, 0)}% of kiln heat: Rs ${fmt.num(a.perGj, 0)} per GJ` : 'Tap or hover on the chart to read each cap. Arrow keys work too.'}
      caption="Optimized fuel cost per GJ of kiln heat as the cap on alternative fuels (their share of kiln heat) moves from 5% to 25%."
    >
      <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}
        aria-label={`Cost per GJ falls from Rs ${fmt.num(data[0].perGj, 0)} at a ${fmt.num(data[0].cap, 0)}% cap to Rs ${fmt.num(data.at(-1)!.perGj, 0)} at ${fmt.num(data.at(-1)!.cap, 0)}%, and stays flat from about 14%.`}>
        <text className={s.note} x={0} y={m.t - 12}>Rs per GJ</text>
        {y.ticks(narrow ? 3 : 5).map((v) => (
          <g key={v}>
            <line className={s.grid} x1={m.l} x2={width - m.r} y1={y(v)} y2={y(v)} />
            <text className={s.tick} x={m.l - 8} y={y(v) + 4} textAnchor="end">{fmt.num(v, 0)}</text>
          </g>
        ))}
        {[5, 10, 15, 20, 25].map((v) => (
          <text key={v} className={s.tick} x={x(v)} y={H - 8} textAnchor="middle">{v}%</text>
        ))}
        <path d={path} fill="none" stroke={COLORS.forest} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {mark && (
          <g>
            <circle cx={x(mark.cap)} cy={y(mark.perGj)} r={4.5} fill={COLORS.forest} stroke={COLORS.paper} strokeWidth={2} />
            {/* to the right of the dot, above the flat part of the line, so it never crosses the curve */}
            <text className={s.note} x={x(mark.cap) + 6} y={y(mark.perGj) - 12}>the model&apos;s cap, {fmt.num(mark.cap, 0)}%</text>
          </g>
        )}
        {a && active !== null && (
          <>
            <line className={s.cross} x1={x(a.cap)} x2={x(a.cap)} y1={m.t} y2={H - m.b} />
            <circle cx={x(a.cap)} cy={y(a.perGj)} r={4.5} fill={COLORS.forest} stroke={COLORS.paper} strokeWidth={2} />
            <Tip x={x(a.cap)} y={m.t} maxX={width} lines={[`Cap ${fmt.num(a.cap, 0)}%`, `Rs ${fmt.num(a.perGj, 0)} per GJ`]} />
          </>
        )}
        <rect className={s.hit} x={m.l} y={m.t} width={width - m.l - m.r} height={H - m.t - m.b} onPointerMove={move} onPointerDown={move} onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)} />
      </svg>
    </Frame>
  );
}
