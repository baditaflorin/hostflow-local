export function normalizeInput(raw: string) {
  const started = performance.now()
  const normalized = raw
    .replace(/^\uFEFF/, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200B-\u200D\u2060]/g, '')
    .replace(/\r\n?/g, '\n')
    .normalize('NFKC')

  return {
    text: normalized,
    fingerprint: stableHash(normalized),
    bytes: new Blob([normalized]).size,
    performanceMs: performance.now() - started,
  }
}

export function stableHash(value: string) {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57

  for (let index = 0; index < value.length; index += 1) {
    const char = value.charCodeAt(index)
    h1 = Math.imul(h1 ^ char, 2654435761)
    h2 = Math.imul(h2 ^ char, 1597334677)
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  return `${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`
}

export function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}
