// Small readers shared by the sync scripts (sync-research.mjs, sync-projects.mjs).

// CSV parser: handles quoted fields with commas; numbers become numbers
export function csv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((v) => v !== ''));
  return body.map((r) =>
    Object.fromEntries(head.map((h, i) => {
      const v = r[i] ?? '';
      const n = Number(v);
      return [h || 'label', v !== '' && Number.isFinite(n) ? n : v];
    })),
  );
}

// Python's json writer emits NaN/Infinity, which JSON doesn't allow; read them as null (no value)
export const json = (text) => JSON.parse(text.replace(/\bNaN\b/g, 'null').replace(/-?\bInfinity\b/g, 'null'));
