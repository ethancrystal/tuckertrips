// Step 1: Trip Basics
// Collects the essential information about the trip

'use client'

import { memo } from 'react'
import { Globe, Users, Lock, Check } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TripStepProps } from './types'

function StepBasics({ formData, onChange }: TripStepProps) {
  const updateField = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-gray-800">Trip Name *</Label>
        <Input
          placeholder="Tokyo Adventure 2024"
          value={formData.trip_name}
          onChange={(e) => updateField('trip_name', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label className="text-gray-800">Location *</Label>
        <Input
          placeholder="Tokyo, Japan"
          value={formData.location}
          onChange={(e) => updateField('location', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-800">Start Date</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => updateField('start_date', e.target.value)}
            className="bg-gray-50 border-gray-300 text-gray-800"
          />
        </div>
        <div>
          <Label className="text-gray-800">End Date</Label>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => updateField('end_date', e.target.value)}
            className="bg-gray-50 border-gray-300 text-gray-800"
          />
        </div>
      </div>

      <div>
        <Label className="text-gray-800">Description</Label>
        <Textarea
          placeholder="Describe your trip..."
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
        />
      </div>

      <div>
        <Label className="text-gray-800 mb-3 block">Privacy</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Public Option */}
          <button
            type="button"
            onClick={() => updateField('privacy', 'public')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
              formData.privacy === 'public'
                ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                formData.privacy === 'public'
                  ? 'bg-blue-500 text-white scale-110'
                  : 'bg-blue-100 text-blue-500 group-hover:bg-blue-200'
              }`}>
                <Globe className="h-6 w-6" />
              </div>
              <div className={`font-semibold ${formData.privacy === 'public' ? 'text-blue-700' : 'text-gray-800'}`}>
                Public
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Visible to everyone
              </div>
              {formData.privacy === 'public' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </button>

          {/* Friends Option */}
          <button
            type="button"
            onClick={() => updateField('privacy', 'friends')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
              formData.privacy === 'friends'
                ? 'bg-green-50 border-green-500 shadow-md shadow-green-500/20'
                : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/50'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                formData.privacy === 'friends'
                  ? 'bg-green-500 text-white scale-110'
                  : 'bg-green-100 text-green-500 group-hover:bg-green-200'
              }`}>
                <Users className="h-6 w-6" />
              </div>
              <div className={`font-semibold ${formData.privacy === 'friends' ? 'text-green-700' : 'text-gray-800'}`}>
                Friends
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Only accepted friends
              </div>
              {formData.privacy === 'friends' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </button>

          {/* Private Option */}
          <button
            type="button"
            onClick={() => updateField('privacy', 'private')}
            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
              formData.privacy === 'private'
                ? 'bg-red-50 border-red-500 shadow-md shadow-red-500/20'
                : 'bg-white border-gray-200 hover:border-red-300 hover:bg-red-50/50'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                formData.privacy === 'private'
                  ? 'bg-red-500 text-white scale-110'
                  : 'bg-red-100 text-red-500 group-hover:bg-red-200'
              }`}>
                <Lock className="h-6 w-6" />
              </div>
              <div className={`font-semibold ${formData.privacy === 'private' ? 'text-red-700' : 'text-gray-800'}`}>
                Private
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Only you & shared users
              </div>
              {formData.privacy === 'private' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(StepBasics)
