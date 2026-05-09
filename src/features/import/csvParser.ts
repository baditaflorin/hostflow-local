import type { CsvTable } from './importTypes'

const candidateDelimiters = [',', ';', '\t', '|']

export function looksTabular(input: string) {
  const firstLines = input.split('\n').slice(0, 4).join('\n')
  return candidateDelimiters.some((delimiter) => countDelimiter(firstLines, delimiter) >= 2)
}

export function parseCsvTable(input: string): CsvTable | null {
  const delimiter = sniffDelimiter(input)
  if (!delimiter) return null

  const rows = parseDelimited(input, delimiter)
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean))

  if (!rows.length) return null

  return {
    delimiter,
    headers: rows[0] ?? [],
    rows: rows.slice(1),
  }
}

function sniffDelimiter(input: string) {
  const sample = input.split('\n').slice(0, 5).join('\n')
  const scored = candidateDelimiters
    .map((delimiter) => ({ delimiter, count: countDelimiter(sample, delimiter) }))
    .toSorted((a, b) => b.count - a.count)

  return scored[0] && scored[0].count > 0 ? scored[0].delimiter : null
}

function countDelimiter(input: string, delimiter: string) {
  let count = 0
  let quoted = false

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const next = input[index + 1]

    if (char === '"' && next === '"') {
      index += 1
      continue
    }

    if (char === '"') quoted = !quoted
    if (!quoted && char === delimiter) count += 1
  }

  return count
}

function parseDelimited(input: string, delimiter: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const next = input[index + 1]

    if (char === '"' && next === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (!quoted && char === delimiter) {
      row.push(cell)
      cell = ''
      continue
    }

    if (!quoted && char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  row.push(cell)
  rows.push(row)
  return rows
}
