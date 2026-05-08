import { currency } from '../../lib/format'
import type { SubjectListing } from '../import/listingSchema'
import type { CalendarRecommendation } from '../analysis/calendar'
import type { CompetitorInsight } from '../analysis/competitors'
import type { PricingAnalysis } from '../analysis/pricing'

export type DraftBundle = {
  listingTitleOptions: string[]
  listingSummary: string
  listingBullets: string[]
  guestTemplates: { title: string; body: string }[]
  reviewResponses: { tone: string; body: string }[]
}

export function generateDrafts(input: {
  subject: SubjectListing
  pricing: PricingAnalysis
  calendar: CalendarRecommendation[]
  competitors: CompetitorInsight[]
}): DraftBundle {
  const { subject, pricing, calendar, competitors } = input
  const leadAmenity = subject.standoutAmenities[0] ?? 'thoughtful amenities'
  const bestCompetitor = competitors[0]?.listing
  const weekendRate = calendar.find((day) => day.demand === 'high')?.rate ?? pricing.recommendedHigh

  return {
    listingTitleOptions: [
      `${subject.name} with ${leadAmenity}`,
      `${subject.location} stay for ${subject.guests} guests`,
      `Easy ${subject.bedrooms}-bed base with ${leadAmenity}`,
    ],
    listingSummary: `Welcome to ${subject.name}, a ${subject.bedrooms}-bed stay in ${subject.location} for up to ${subject.guests} guests. The positioning should anchor around ${currency(pricing.recommendedTarget)} on standard nights and ${currency(weekendRate)} on high-demand nights, with ${subject.standoutAmenities.join(', ')} leading the copy.`,
    listingBullets: [
      `Lead photo and first sentence should prove ${leadAmenity}.`,
      `Call out the ${subject.guests}-guest setup before amenities.`,
      `Use ${bestCompetitor?.neighborhood ?? subject.location} competitor language only where it is accurate.`,
      `Keep cleaning fee expectations clear at ${currency(subject.cleaningFee)}.`,
    ],
    guestTemplates: [
      {
        title: 'Booking confirmation',
        body: `Hi {{guest_first_name}}, thanks for booking ${subject.name}. Your stay is confirmed, and I will send check-in details before arrival. If you already know your arrival window, send it over and I will help make the handoff easy.`,
      },
      {
        title: 'Pre-arrival',
        body: `Hi {{guest_first_name}}, your check-in for ${subject.name} is coming up. The space is prepared for ${subject.guests} guests, with ${subject.standoutAmenities.slice(0, 2).join(' and ')} ready for you. Check-in details: {{check_in_details}}.`,
      },
      {
        title: 'Checkout',
        body: `Hi {{guest_first_name}}, I hope you had a comfortable stay. Before checkout, please lock the door, leave used towels in the bathroom, and message me once you are out. Safe travels.`,
      },
      {
        title: 'Review request',
        body: `Hi {{guest_first_name}}, thank you again for choosing ${subject.name}. If the stay matched what you expected, a quick review helps future guests book with confidence.`,
      },
    ],
    reviewResponses: [
      {
        tone: 'Positive',
        body: `Thank you for the thoughtful review. I am glad ${leadAmenity} and the location worked well for your trip, and you are welcome back anytime.`,
      },
      {
        tone: 'Mixed',
        body: `Thank you for the balanced feedback. I am glad you enjoyed the stay, and I appreciate the note about {{issue}}. I have already reviewed it so future guests have a smoother experience.`,
      },
      {
        tone: 'Negative',
        body: `Thank you for taking the time to share this. I am sorry the stay did not meet expectations around {{issue}}. I have followed up on the details and will use your feedback to improve the experience for future guests.`,
      },
    ],
  }
}
