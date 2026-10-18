// A small ink-line map: routes from home (the first place in profile.yaml) to every other place. Drawn at build
// time from Natural Earth borders (world-atlas); only plain SVG paths reach the browser.
import { geoConicConformal, geoPath, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { profile } from '@/lib/profile';
import styles from './RouteMap.module.css';

const W = 900;
const H = 470;
const [home, ...trips] = profile.places;

// frame the map around all the places, with some room for the labels
const lons = profile.places.map((p) => p.at[0]);
const lats = profile.places.map((p) => p.at[1]);
const [west, east, south, north] = [Math.min(...lons) - 12, Math.max(...lons) + 12, Math.min(...lats) - 8, Math.max(...lats) + 5];
const frame: [number, number][] = [];
for (let lon = west; lon <= east; lon += 2) frame.push([lon, south], [lon, north]);
for (let lat = south; lat <= north; lat += 2) frame.push([west, lat], [east, lat]);
const projection = geoConicConformal()
  .parallels([30, 60])
  .rotate([-(west + east) / 2, 0])
  .fitExtent([[8, 8], [W - 8, H - 8]], { type: 'MultiPoint', coordinates: frame })
  .clipExtent([[0, 0], [W, H]]);
const path = geoPath(projection).digits(0);
const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
const countries = (feature(topo, topo.objects.countries) as unknown as { features: { id: string; properties: { name: string } }[] }).features
  .map((f) => ({ id: String(f.id), name: f.properties.name, d: path(f as never) ?? '' }))
  .filter((c) => c.d);
const visited = new Set(profile.places.map((p) => p.country));

type Place = (typeof profile.places)[number];
const xy = (p: Place) => projection(p.at)!;
const km =(a: Place, b: Place) => Math.round((geoDistance(a.at, b.at) * 6371) / 100) * 100;
function arc(a: Place, b: Place, bend: number) {
  const [x1, y1] = xy(a);
  const [x2, y2] = xy(b);
  const cx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const cy = (y1 + y2) / 2 + (x2 - x1) * bend;
  return `M${x1.toFixed(0)},${y1.toFixed(0)} Q${cx.toFixed(0)},${cy.toFixed(0)} ${x2.toFixed(0)},${y2.toFixed(0)}`;
}

export function RouteMap() {
  const label = trips.map((t) => `${t.name} (${t.when}), about ${km(home, t).toLocaleString('en')} km`).join('; ');
  return (
    <figure className={styles.map}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Map of my trips from ${home.name}: ${label}.`}>
        <g className={styles.land}>
          {countries.map((c) => <path key={c.id} d={c.d} className={visited.has(c.name) ? styles.focus : undefined} />)}
        </g>
        <rect className={styles.frame} x={0.5} y={0.5} width={W - 1} height={H - 1} />
        {trips.map((t, i) => <path key={t.name} d={arc(home, t, i % 2 ? -0.16 : 0.16)} className={styles.route} />)}
        {profile.places.map((p) => {
          const [x, y] = xy(p);
          const dx = p.labelLeft ? -12 : 12;
          const anchor = p.labelLeft ? 'end' : 'start';
          return (
            <g key={p.name}>
              <circle cx={x} cy={y} r={5} className={styles.pin} />
              <text x={x + dx} y={y - 8} textAnchor={anchor} className={styles.name}>{p.name}</text>
              <text x={x + dx} y={y + 12} textAnchor={anchor} className={styles.note}>{p.when}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>
        {trips.map((t) => `${home.name} to ${t.name}, about ${km(home, t).toLocaleString('en')} km.`).join(' ')}
      </figcaption>
    </figure>
  );
}
