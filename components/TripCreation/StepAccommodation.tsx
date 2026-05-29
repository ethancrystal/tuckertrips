// Step 2: Accommodation
// Collects information about lodging/accommodation

'use client'

import { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TripStepProps } from './types'

function StepAccommodation({ formData, onChange }: TripStepProps) {
  const updateField = (field: keyof typeof formData, value: unknown) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-gray-800">Accommodation Rating</Label>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => updateField('accommodation_rating', star)}
              className={`text-2xl ${star <= formData.accommodation_rating ? 'text-yellow-400' : 'text-gray-400'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-gray-800">Accommodation Type</Label>
        <Input
          placeholder="Hotel, Airbnb, Resort, etc."
          value={formData.accommodation_type}
          onChange={(e) => updateField('accommodation_type', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">URL to Accommodation</Label>
        <Input
          type="url"
          placeholder="https://..."
          value={formData.accommodation_url}
          onChange={(e) => updateField('accommodation_url', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Other Accommodation Link</Label>
        <Input
          type="url"
          placeholder="Alternative booking link..."
          value={formData.other_accommodation_link}
          onChange={(e) => updateField('other_accommodation_link', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Accommodation Excursion</Label>
        <Textarea
          placeholder="Activities or excursions from your accommodation..."
          value={formData.accommodation_excursion}
          onChange={(e) => updateField('accommodation_excursion', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
        />
      </div>
    </div>
  )
}

export default memo(StepAccommodation)
