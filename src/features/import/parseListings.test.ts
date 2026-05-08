/* @vitest-environment happy-dom */
import { describe, expect, it } from 'vitest'
import { parseListings } from './parseListings'

describe('parseListings', () => {
  it('parses CSV competitor records', () => {
    const csv = [
      'title,location,neighborhood,price,bedrooms,bathrooms,guests,rating,reviews,amenities,occupancy',
      '"Sunny Flat","Bucharest","Old Town",120,2,1,4,4.8,122,"wifi; balcony",0.76',
    ].join('\n')

    const listings = parseListings(csv)

    expect(listings).toHaveLength(1)
    expect(listings[0]).toMatchObject({
      title: 'Sunny Flat',
      neighborhood: 'Old Town',
      priceNightly: 120,
      guests: 4,
      source: 'csv',
    })
  })

  it('parses pasted HTML listing cards', () => {
    const html = `
      <article data-listing-id="abc123" data-lat="44.43" data-lng="26.10">
        <a href="https://example.com/abc"><h3>Design loft downtown</h3></a>
        <p>$145 night · 2 bedrooms · 4 guests · 1 bath · 4.91 stars · 88 reviews</p>
        <ul><li>Fast Wi-Fi</li><li>Workspace</li></ul>
      </article>
    `

    const listings = parseListings(html)

    expect(listings).toHaveLength(1)
    expect(listings[0]?.id).toBe('abc123')
    expect(listings[0]?.priceNightly).toBe(145)
    expect(listings[0]?.amenities).toContain('fast wi-fi')
  })
})
