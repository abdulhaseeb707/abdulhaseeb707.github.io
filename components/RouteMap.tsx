// A small ink-line map: Lahore to Krasnoyarsk (2025) and Ekaterinburg (2026). Drawn at build time from
// Natural Earth borders (world-atlas); only plain SVG paths reach the browser.
import { geoConicConformal, geoPath, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import type { Topology, GeometryCollection } from 'topojson-specification';
import styles from './RouteMap.module.css';

const W = 900;
const H = 470;
const places = {
  lahore: { name: 'Lahore', note: 'home', at: [74.3587, 31.5204] as [number, number] },
  krasnoyarsk: { name: 'Krasnoyarsk', note: '2025', at: [92.8932, 56.0153] as [number, number] },
  ekaterinburg: { name: 'Ekaterinburg', note: '2026', at: [60.6122, 56.8389] as [number, number] },
};
type Key = keyof typeof places;

const frame: [number, number][] = [];
for (let lon = 48; lon <= 104; lon += 2) frame.push([lon, 23], [lon, 61]);
for (let lat = 23; lat <= 61; lat += 2) frame.push([48, lat], [104, lat]);
const projection = geoConicConformal()
  .parallels([30, 60])
  .rotate([-76, 0])
  .fitExtent([[8, 8], [W - 8, H - 8]], { type: 'MultiPoint', coordinates: frame })
  .clipExtent([[0, 0], [W, H]]);
const path = geoPath(projection).digits(0);
const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
const countries = (feature(topo, topo.objects.countries) as unknown as { features: { id: string }[] }).features
  .map((f) => ({ id: String(f.id), d: path(f as never) ?? '' }))
  .filter((c) => c.d);

const xy = (k: Key) => projection(places[k].at)!;
const km = (a: Key, b: Key) => Math.round((geoDistance(places[a].at, places[b].at) * 6371) / 100) * 100;
function arc(a: Key, b: Key, bend: number) {
  const [x1, y1] = xy(a);
  const [x2, y2] = xy(b);
  const cx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const cy = (y1 + y2) / 2 + (x2 - x1) * bend;
  return `M${x1.toFixed(0)},${y1.toFixed(0)} Q${cx.toFixed(0)},${cy.toFixed(0)} ${x2.toFixed(0)},${y2.toFixed(0)}`;
}

export function RouteMap() {
  const trips = [
    { to: 'krasnoyarsk' as const, d: arc('lahore', 'krasnoyarsk', 0.16) },
    { to: 'ekaterinburg' as const, d: arc('lahore', 'ekaterinburg', -0.16) },
  ];
  return (
    <figure className={styles.map}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Map of my trips from Lahore: Krasnoyarsk in 2025, about ${km('lahore', 'krasnoyarsk').toLocaleString('en')} km, and Ekaterinburg in 2026, about ${km('lahore', 'ekaterinburg').toLocaleString('en')} km.`}>
        <g className={styles.land}>
          {countries.map((c) => <path key={c.id} d={c.d} className={c.id === '586' || c.id === '643' ? styles.focus : undefined} />)}
        </g>
        {trips.map((t) => <path key={t.to} d={t.d} className={styles.route} />)}
        {(Object.keys(places) as Key[]).map((k) => {
          const [x, y] = xy(k);
          const right = k !== 'ekaterinburg';
          return (
            <g key={k}>
              <circle cx={x} cy={y} r={5} className={styles.pin} />
              <text x={right ? x + 12 : x - 12} y={y - 8} textAnchor={right ? 'start' : 'end'} className={styles.name}>{places[k].name}</text>
              <text x={right ? x + 12 : x - 12} y={y + 12} textAnchor={right ? 'start' : 'end'} className={styles.note}>{places[k].note}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        Lahore to Krasnoyarsk, about {km('lahore', 'krasnoyarsk').toLocaleString('en')} km. Lahore to Ekaterinburg, about {km('lahore', 'ekaterinburg').toLocaleString('en')} km.
      </figcaption>
    </figure>
  );
}
