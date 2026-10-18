/**
 * SVG path of the lit part of the moon for a phase f in [0, 1): 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter.
 * The lit limb is a half circle; the terminator is a half ellipse whose width follows cos(2πf).
 */
export function moonPath(cx: number, cy: number, r: number, f: number): string {
  const phase = ((f % 1) + 1) % 1;
  const waxing = phase <= 0.5;
  const k = Math.cos(2 * Math.PI * phase);
  const rx = Math.abs(k) * r;
  const limb = waxing ? 1 : 0;
  const terminator = k > 0 === waxing ? 0 : 1;
  const n = (v: number) => Number(v.toFixed(2));
  return `M ${n(cx)} ${n(cy - r)} A ${n(r)} ${n(r)} 0 0 ${limb} ${n(cx)} ${n(cy + r)} A ${n(rx)} ${n(r)} 0 0 ${terminator} ${n(cx)} ${n(cy - r)} Z`;
}

/** Splits "text with *emphasis*" into parts for headlines. */
export function emphasis(text: string): { text: string; em: boolean }[] {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part) =>
    part.startsWith('*') && part.endsWith('*') ? { text: part.slice(1, -1), em: true } : { text: part, em: false },
  );
}
