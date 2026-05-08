import type { Listing } from '../import/listingSchema'

export type DuckDbSummary = {
  neighborhood: string
  listings: number
  averageRate: number
  averageRating: number
}

type DuckDbRow = {
  neighborhood?: string
  listings?: number | bigint
  average_rate?: number
  average_rating?: number
}

export async function runDuckDbSummary(listings: Listing[]): Promise<DuckDbSummary[]> {
  const duckdb = await import('@duckdb/duckdb-wasm')
  const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles())

  if (!bundle.mainWorker || !bundle.mainModule) {
    throw new Error('DuckDB-WASM bundle is missing required assets')
  }

  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' }),
  )
  const worker = new Worker(workerUrl)
  const logger = new duckdb.ConsoleLogger()
  const database = new duckdb.AsyncDuckDB(logger, worker)

  try {
    await database.instantiate(bundle.mainModule, bundle.pthreadWorker)
    await database.registerFileText('listings.json', JSON.stringify(listings))
    const connection = await database.connect()
    const result = await connection.query(`
      SELECT
        neighborhood,
        count(*) AS listings,
        avg(priceNightly) AS average_rate,
        avg(rating) AS average_rating
      FROM read_json_auto('listings.json')
      GROUP BY neighborhood
      ORDER BY average_rate DESC
    `)
    await connection.close()
    return result.toArray().map((row) => normalizeDuckRow(row as DuckDbRow))
  } finally {
    await database.terminate()
    worker.terminate()
    URL.revokeObjectURL(workerUrl)
  }
}

function normalizeDuckRow(row: DuckDbRow): DuckDbSummary {
  return {
    neighborhood: row.neighborhood ?? 'Unknown',
    listings: Number(row.listings ?? 0),
    averageRate: Math.round(row.average_rate ?? 0),
    averageRating: Math.round((row.average_rating ?? 0) * 100) / 100,
  }
}
