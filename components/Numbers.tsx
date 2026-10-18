// "Show the numbers": the table twin of a chart, so no value is reachable only by hovering.
export function Numbers({ head, rows, scroll = false }: { head: string[]; rows: (string | number)[][]; scroll?: boolean }) {
  return (
    <details className="numbers">
      <summary>Show the numbers</summary>
      <div className={scroll ? 'scroll' : undefined}>
        <table>
          <thead>
            <tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
