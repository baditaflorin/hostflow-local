import type { Listing } from './listingSchema'
import { inferImport } from './inferImport'

export function parseListings(input: string): Listing[] {
  return inferImport(input).listings
}
