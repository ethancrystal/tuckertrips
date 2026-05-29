// Step 5: Rental Car
// Collects information about rental car experiences

'use client'

import { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TripStepProps } from './types'

function StepRental({ formData, onChange }: TripStepProps) {
  const updateField = (field: keyof typeof formData, value: unknown) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-gray-800">Rental Car Rating</Label>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => updateField('rental_rating', star)}
              className={`text-2xl ${star <= formData.rental_rating ? 'text-yellow-400' : 'text-gray-400'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-gray-800">Rental Car Review</Label>
        <Textarea
          placeholder="Your review of the rental car experience..."
          value={formData.rental_car_review}
          onChange={(e) => updateField('rental_car_review', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[100px]"
        />
      </div>

      <div>
        <Label className="text-gray-800">Rental Car Company</Label>
        <Input
          placeholder="Enterprise, Hertz, Budget, etc."
          value={formData.rental_car_company}
          onChange={(e) => updateField('rental_car_company', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Rental Car Cost</Label>
        <Input
          type="number"
          placeholder="250.00 (total cost)"
          value={formData.rental_car_cost}
          onChange={(e) => updateField('rental_car_cost', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Quantity of Cars</Label>
        <Input
          placeholder="1, 2, etc."
          value={formData.quantity_of_car}
          onChange={(e) => updateField('quantity_of_car', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Rental Car Excursion</Label>
        <Textarea
          placeholder="Road trips, scenic drives, car-related activities..."
          value={formData.rental_car_excursion}
          onChange={(e) => updateField('rental_car_excursion', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
        />
      </div>
    </div>
  )
}

export default memo(StepRental)
