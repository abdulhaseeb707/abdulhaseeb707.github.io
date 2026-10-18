// The numbers behind the research charts, from the snapshot in content/research/ (npm run sync:research).
import deck from '../content/research/deck.json';
import annual from '../content/research/annual.json';
import sectors from '../content/research/sectors.json';
import bySector from '../content/research/by-sector.json';
import thresholds from '../content/research/thresholds.json';
import keyResults from '../content/research/key-results.json';

const fy = (year: number) => `FY${String(year).slice(2)}`;

/** Inflation and median ROA, one row per fiscal year. */
export const years = annual.map((r) => ({
  year: r.fiscal_year,
  label: fy(r.fiscal_year),
  inflation: r.infl_12m_avg,
  medianRoa: r.median_roa,
  firms: r.firms,
}));

/** Aggregate operating profit, chain-linked index, FY06 = 100. */
export const profitIndex = deck.idx_years.map((label, i) => ({
  label,
  nominal: deck.nominal_index[i],
  real: deck.real_index[i],
}));

/** Sector slopes of ROA on inflation with 95% intervals, low to high. */
export const sectorSlopes = sectors
  .map((s) => ({
    sector: s.sector as string,
    slope: s.slope as number,
    low: s.ci_low as number,
    high: s.ci_high as number,
    p: s.p as number,
    firmYears: s.firm_years as number,
    significant: (s.p as number) < 0.05,
  }))
  .sort((a, b) => a.slope - b.slope);

/** Firm-years per sector, largest first. */
export const sectorSizes = bySector
  .map((s) => ({ sector: s.sector as string, firmYears: s.firm_years as number }))
  .sort((a, b) => b.firmYears - a.firmYears);

/** Threshold model: slopes below and above the kink. */
export const kink = {
  at: 10,
  below: deck.below10,
  above: deck.above10,
  pChange: deck.kink_p_boot,
  scan: thresholds.map((t) => ({
    threshold: t.threshold_pct as number,
    below: t.slope_below as number,
    above: t.slope_above as number,
    pBoot: t.p_change_wild_bootstrap as number,
  })),
};

/** The same coefficient, judged three ways. */
export const inference = {
  coef: deck.m1_coef,
  rows: [
    { method: 'Firm-clustered errors', p: deck.m1_p_firm, note: 'ignores shocks that hit every firm in the same year' },
    { method: 'Driscoll–Kraay errors', p: deck.m1_p_dk, note: 'allows for those common shocks' },
    { method: 'Wild cluster bootstrap', p: deck.m1_p_boot, note: 'resamples the 20 fiscal years' },
  ],
};

export const totals = {
  firms: deck.n_firms,
  firmYears: deck.n_obs,
  sectors: deck.n_sectors,
  wald: keyResults.sector_equality_wald,
};

/** Short sector names for chart labels. */
export const shortSector = (s: string) =>
  ({
    'Motor Vehicles, Trailers & Autoparts': 'Autos and parts',
    'Coke and Refined Petroleum Products': 'Refined petroleum',
    'Paper, Paperboard and Products': 'Paper and board',
    'Other Services Activities': 'Other services',
    'Information and Communication Services': 'Info. and comms',
    'Chemicals, Chemical Products and Pharmaceuticals': 'Chemicals and pharma',
    'Electrical Machinery and Apparatus': 'Electrical machinery',
    'Mineral products': 'Mineral products',
    'Fuel and Energy': 'Fuel and energy',
    'Food Products': 'Food products',
  })[s] ?? s;
