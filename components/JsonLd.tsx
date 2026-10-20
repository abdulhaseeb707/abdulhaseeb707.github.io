// Writes schema.org structured data (lib/structured-data.ts) into the page for search engines.
// "<" is escaped so no text in the data can close the script tag early.
export function JsonLd({ graph }: { graph: object[] }) {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
