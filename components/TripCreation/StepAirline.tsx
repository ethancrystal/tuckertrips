// Step 4: Airline
// Collects information about flight experiences

'use client'

import { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TripStepProps } from './types'

function StepAirline({ formData, onChange }: TripStepProps) {
  const updateField = (field: keyof typeof formData, value: unknown) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-gray-800">Airline Rating</Label>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => updateField('airline_rating', star)}
              className={`text-2xl ${star <= formData.airline_rating ? 'text-yellow-400' : 'text-gray-400'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-gray-800">Airline Name</Label>
        <Input
          placeholder="Delta, United, Southwest, etc."
          value={formData.airline_name}
          onChange={(e) => updateField('airline_name', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Airline Cost</Label>
        <Input
          type="number"
          placeholder="350.00"
          value={formData.airline_cost}
          onChange={(e) => updateField('airline_cost', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Quantity Of Flights</Label>
        <Input
          placeholder="2 (round trip), 4, etc."
          value={formData.quantity_of_flight}
          onChange={(e) => updateField('quantity_of_flight', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Airline Excursion</Label>
        <Textarea
          placeholder="Airport lounges, in-flight experiences, related activities..."
          value={formData.airline_excursion}
          onChange={(e) => updateField('airline_excursion', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
        />
      </div>
    </div>
  )
}

export default memo(StepAirline)
