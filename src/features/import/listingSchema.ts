import { z } from 'zod'

export const listingSchemaVersion = 'hostflow.listings.v1'

export const listingSchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string(),
  neighborhood: z.string(),
  url: z.string().optional(),
  priceNightly: z.number().nonnegative(),
  cleaningFee: z.number().nonnegative(),
  bedrooms: z.number().nonnegative(),
  bathrooms: z.number().nonnegative(),
  guests: z.number().positive(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().nonnegative(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  amenities: z.array(z.string()),
  minNights: z.number().positive(),
  occupancyHint: z.number().min(0).max(1),
  source: z.enum(['sample', 'html', 'csv', 'manual']),
})

export type Listing = z.infer<typeof listingSchema>

export const subjectListingSchema = z.object({
  name: z.string(),
  location: z.string(),
  bedrooms: z.number().positive(),
  bathrooms: z.number().positive(),
  guests: z.number().positive(),
  currentRate: z.number().positive(),
  cleaningFee: z.number().nonnegative(),
  targetOccupancy: z.number().min(0.3).max(0.95),
  standoutAmenities: z.array(z.string()),
  // ISO YYYY-MM-DD dates the host already has on the books. Used by the
  // calendar optimizer to detect real orphan gaps (single unbooked nights
  // between two bookings) and to mark days as unavailable.
  bookedDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).default([]),
})

export type SubjectListing = z.infer<typeof subjectListingSchema>

export const defaultSubjectListing: SubjectListing = {
  name: 'Your listing',
  location: 'Central market',
  bedrooms: 2,
  bathrooms: 1,
  guests: 4,
  currentRate: 155,
  cleaningFee: 45,
  targetOccupancy: 0.72,
  standoutAmenities: ['fast Wi-Fi', 'self check-in', 'workspace'],
  bookedDates: [],
}
