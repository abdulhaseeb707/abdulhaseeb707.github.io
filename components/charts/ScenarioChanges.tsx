'use client';
// Cost optimization: how the cheapest fuel bill moves when one input changes. Bars from zero, both ways:
// brass where the bill goes up, forest where it goes down (two poles, zero in the middle).
import { scaleLinear } from 'd3-scale';
import { Frame, Tip, useActive, useWidth, COLORS, fmt } from './kit';
import s from './charts.module.css';

type Row = { scenario: string; cost: number; perGj: number; change: number };

const bn = (v: number) => `Rs ${(v / 1e9).toFixed(2)} bn`;
// one decimal, or two for changes under 0.1% so they don't read as "−0.0%"
const pct = (v: number) => `${fmt.signed(v, Math.abs(v) < 0.1 ? 2 : 1)}%`;

export function ScenarioChanges({ data, base }: { data: Row[]; base: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const { active, setActive, onKey } = useActive(data.length);
  const narrow = width < 560;
  // on phones the scenario names sit above their bars; on wider screens, to the left
  const row = narrow ? 44 : 32;
  const m = { l: narrow ? 8 : 204, r: 12, t: 6, b: 26 };
  const H = m.t + data.length * row + m.b;
  const limit = Math.ceil(Math.max(...data.map((d) => Math.abs(d.change))) / 2) * 2 + 2;
  const x = scaleLinear().domain([-limit, limit]).range([m.l, width - m.r]);
  const barY = (i: number) => m.t + i * row + (narrow ? 22 : 9);
  const a = active === null ? null : data[active];

  const move = (e: React.PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const i = Math.floor((e.clientY - box.top - m.t) / row);
    setActive(i >= 0 && i < data.length ? i : null);
  };

  return (
    <Frame
      boxRef={ref}
      legend={[
        { label: 'Bill goes up', color: COLORS.brass, kind: 'dot' },
        { label: 'Bill goes down', color: COLORS.forest, kind: 'dot' },
      ]}
      readout={a ? `${a.scenario}: ${bn(a.cost)} a year (${pct(a.change)} against the base case)` : 'Tap or hover on a scenario to read it. Arrow keys work too.'}
      caption={`Change in the optimized annual fuel bill against the base case (${bn(base)}), re-solving with one input changed at a time.`}
    >
      <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" tabIndex={0} onKeyDown={onKey} onBlur={() => setActive(null)}
        aria-label={`Scenarios. Largest rise: ${data[0].scenario}, ${pct(data[0].change)}. Largest fall: ${data.at(-1)!.scenario}, ${pct(data.at(-1)!.change)}.`}>
        {x.ticks(narrow ? 4 : 6).map((v) => (
          <g key={v}>
            <line className={v === 0 ? s.axis : s.grid} x1={x(v)} x2={x(v)} y1={m.t} y2={H - m.b} />
            <text className={s.tick} x={x(v)} y={H - 8} textAnchor="middle">{v === 0 ? '0' : `${fmt.signed(v, 0)}%`}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const up = d.change > 0;
          const x0 = x(Math.min(0, d.change));
          const w = Math.max(2, Math.abs(x(d.change) - x(0)));
          return (
            <g key={d.scenario} opacity={active === null || active === i ? 1 : 0.5}>
              {narrow ? (
                <text className={s.label} x={m.l} y={m.t + i * row + 13}>{d.scenario}</text>
              ) : (
                <text className={s.label} x={m.l - 12} y={barY(i) + 10} textAnchor="end">{d.scenario}</text>
              )}
              <rect x={x0} y={barY(i)} width={w} height={14} rx={2} fill={up ? COLORS.brass : COLORS.forest} />
              <text className={s.labelStrong} x={up ? x(d.change) + 8 : x(d.change) - 8} y={barY(i) + 11} textAnchor={up ? 'start' : 'end'}>
                {pct(d.change)}
              </text>
            </g>
          );
        })}
        {a && active !== null && (
          <Tip x={x(a.change)} y={Math.min(barY(active) + 16, H - 74)} maxX={width}
            lines={[a.scenario, `${bn(a.cost)} a year`, `Rs ${fmt.num(a.perGj, 0)} per GJ`]} />
        )}
        <rect className={s.hit} x={0} y={m.t} width={width} height={H - m.t - m.b} onPointerMove={move} onPointerDown={move} onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)} />
      </svg>
    </Frame>
  );
}
