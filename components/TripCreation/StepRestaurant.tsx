// Step 3: Restaurant
// Collects information about dining experiences

'use client'

import { memo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TripStepProps } from './types'

function StepRestaurant({ formData, onChange }: TripStepProps) {
  const updateField = (field: keyof typeof formData, value: unknown) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-gray-800">Restaurant Rating</Label>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => updateField('restaurant_rating', star)}
              className={`text-2xl ${star <= formData.restaurant_rating ? 'text-yellow-400' : 'text-gray-400'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-gray-800">Restaurant Review</Label>
        <Textarea
          placeholder="Your overall review of the restaurant experience..."
          value={formData.restaurant_review}
          onChange={(e) => updateField('restaurant_review', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[100px]"
        />
      </div>

      <div>
        <Label className="text-gray-800">Restaurant Type</Label>
        <Input
          placeholder="Italian, Japanese, Local cuisine, etc."
          value={formData.restaurant_type}
          onChange={(e) => updateField('restaurant_type', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Restaurant Name</Label>
        <Input
          placeholder="Name of the restaurant..."
          value={formData.restaurant_name}
          onChange={(e) => updateField('restaurant_name', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Best Food of Restaurant</Label>
        <Textarea
          placeholder="What dishes were the best..."
          value={formData.best_food_restaurant}
          onChange={(e) => updateField('best_food_restaurant', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
        />
      </div>

      <div>
        <Label className="text-gray-800">Restaurant Excursion</Label>
        <Textarea
          placeholder="Any dining-related activities or experiences..."
          value={formData.restaurant_excursion}
          onChange={(e) => updateField('restaurant_excursion', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
        />
      </div>
    </div>
  )
}

export default memo(StepRestaurant)
