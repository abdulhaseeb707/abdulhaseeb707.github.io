// The numbers behind the project charts, from the snapshots in content/projects/ (npm run sync:projects).
import summary from '../content/projects/cost-optimization/summary.json';
import allocation from '../content/projects/cost-optimization/allocation.json';
import plants from '../content/projects/cost-optimization/plants.json';
import fuels from '../content/projects/cost-optimization/fuels.json';
import scenarios from '../content/projects/cost-optimization/scenarios.json';
import shadowPrices from '../content/projects/cost-optimization/shadow-prices.json';
import altFuelCap from '../content/projects/cost-optimization/alt-fuel-cap.json';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Fuel cost per GJ of kiln heat at each plant: the FY25 mix against the optimized mix. Biggest saving first. */
const byPlant = plants
  .map((p) => {
    const rows = allocation.filter((a) => a.plant_id === p.plant_id);
    const baseline = sum(rows.map((r) => r.baseline_cost_pkr)) / p.heat_demand_gj;
    const optimized = sum(rows.map((r) => r.optimized_cost_pkr)) / p.heat_demand_gj;
    return { id: p.plant_id, plant: p.plant_name, baseline, optimized, change: (optimized / baseline - 1) * 100 };
  })
  .sort((a, b) => a.change - b.change);

const allPlants = {
  id: 'ALL',
  plant: 'All plants',
  baseline: summary.baseline_cost_per_gj,
  optimized: summary.optimized_cost_per_gj,
  change: -summary.saving_pct,
};

/** Re-solving with one input changed at a time: change in the optimized annual bill against the base case. */
const scenarioRows = scenarios
  .filter((s) => s.scenario !== 'Base case')
  .map((s) => ({ scenario: s.scenario, cost: s.optimized_cost_pkr, perGj: s.cost_per_gj, change: s.change_vs_base_pct }))
  .sort((a, b) => b.change - a.change);

const fuelName = (id: string) => fuels.find((f) => f.source_id === id)?.source_name ?? id;

export const costOptimization = {
  summary,
  plants: [...byPlant, allPlants],
  scenarios: scenarioRows,
  baseCost: summary.optimized_cost_pkr,
  /** What one more tonne of a fuel in short supply would save (the supply constraint's shadow price), Rs per tonne. */
  extraTonne: shadowPrices
    .filter((r) => r.constraint === 'supply' && r.dual < 0)
    .map((r) => ({ fuel: fuelName(String(r.member)), saving: -r.dual }))
    .sort((a, b) => b.saving - a.saving),
  /** Optimized cost per GJ as the alternative-fuel cap (share of kiln heat) moves from 5% to 25%. */
  altFuelCap: altFuelCap.map((r) => ({ cap: r.alt_fuel_cap * 100, perGj: r.cost_per_gj })),
  modelCap: summary.settings.tsr_max * 100,
};
