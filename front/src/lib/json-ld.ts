export function serializeSchema(schema: unknown) {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}
