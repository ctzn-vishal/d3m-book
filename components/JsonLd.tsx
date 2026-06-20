/**
 * Renders a schema.org JSON-LD block. Feeds Google rich results (Dataset Search,
 * knowledge graph) and gives AI answer-engines structured entities to cite.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe inside a script tag; "<" can't appear in
      // JSON string values without being escaped, but guard anyway.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
