import { percent } from '../lib/format'
import type { SubjectListing } from '../features/import/listingSchema'

export function SubjectForm({
  subject,
  onChange,
}: {
  subject: SubjectListing
  onChange: (subject: SubjectListing) => void
}) {
  const update = <K extends keyof SubjectListing>(key: K, value: SubjectListing[K]) => {
    onChange({ ...subject, [key]: value })
  }

  return (
    <div className="mt-3 grid gap-3">
      <input
        className="field"
        value={subject.name}
        onChange={(event) => update('name', event.target.value)}
        aria-label="Listing name"
      />
      <input
        className="field"
        value={subject.location}
        onChange={(event) => update('location', event.target.value)}
        aria-label="Listing location"
      />
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="Bedrooms"
          value={subject.bedrooms}
          onChange={(value) => update('bedrooms', value)}
        />
        <NumberField
          label="Guests"
          value={subject.guests}
          onChange={(value) => update('guests', value)}
        />
        <NumberField
          label="Rate"
          value={subject.currentRate}
          onChange={(value) => update('currentRate', value)}
        />
        <NumberField
          label="Cleaning"
          value={subject.cleaningFee}
          onChange={(value) => update('cleaningFee', value)}
        />
      </div>
      <label className="field-label">
        Target occupancy
        <input
          className="field"
          type="range"
          min="0.3"
          max="0.95"
          step="0.01"
          value={subject.targetOccupancy}
          onChange={(event) => update('targetOccupancy', Number(event.target.value))}
        />
        <span>{percent(subject.targetOccupancy)}</span>
      </label>
      <input
        className="field"
        value={subject.standoutAmenities.join(', ')}
        onChange={(event) =>
          update(
            'standoutAmenities',
            event.target.value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          )
        }
        aria-label="Standout amenities"
      />
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="field-label">
      {label}
      <input
        className="field"
        type="number"
        value={value}
        min="0"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}
