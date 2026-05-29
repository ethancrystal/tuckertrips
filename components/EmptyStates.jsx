'use client'

import { Button } from '@/components/ui/button'
import { MapPin, Plus, Compass, Clock, Share2 } from 'lucide-react'

export const EmptyTripsState = ({ onCreateTrip, onPlanTrip, darkMode = false }) => {
  const theme = darkMode ? 'text-gray-400' : 'text-gray-600'
  const iconTheme = darkMode ? 'text-[#7dbbe5]' : 'text-blue-500'

  return (
    <div className="text-center py-16">
      <MapPin className={`w-16 h-16 mx-auto mb-4 ${iconTheme} opacity-50`} />
      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        No trips yet
      </h3>
      <p className={`${theme} mb-6 max-w-md mx-auto`}>
        You haven't added any trips yet. Start by creating your first one — it only takes a minute.
      </p>
      <Button
        onClick={onCreateTrip}
        className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] hover:from-[#e91e63] hover:to-[#6bb6d6] text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Trip
      </Button>
    </div>
  )
}

export const EmptyFutureTripsState = ({ onPlanTrip, darkMode = false }) => {
  const theme = darkMode ? 'text-gray-400' : 'text-gray-600'
  const iconTheme = darkMode ? 'text-[#ff34ac]' : 'text-pink-500'

  return (
    <div className="text-center py-16">
      <Clock className={`w-16 h-16 mx-auto mb-4 ${iconTheme} opacity-50`} />
      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        No future trips planned
      </h3>
      <p className={`${theme} mb-6 max-w-md mx-auto`}>
        Planning something soon? Future Trips helps you keep everything organized.
      </p>
      <Button
        onClick={onPlanTrip}
        className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] hover:from-[#e91e63] hover:to-[#6bb6d6] text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Plan a Future Trip
      </Button>
    </div>
  )
}

export const EmptySharedTripsState = ({ onCreateTrip, darkMode = false }) => {
  const theme = darkMode ? 'text-gray-400' : 'text-gray-600'
  const iconTheme = darkMode ? 'text-green-400' : 'text-green-500'

  return (
    <div className="text-center py-16">
      <Share2 className={`w-16 h-16 mx-auto mb-4 ${iconTheme} opacity-50`} />
      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        No shared trips
      </h3>
      <p className={`${theme} mb-6 max-w-md mx-auto`}>
        Share your adventures with friends and family. Create a trip and share it to see it here.
      </p>
      <Button
        onClick={onCreateTrip}
        className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] hover:from-[#e91e63] hover:to-[#6bb6d6] text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create a Trip to Share
      </Button>
    </div>
  )
}

export const EmptyExploreState = ({ onCreateTrip, darkMode = false }) => {
  const theme = darkMode ? 'text-gray-400' : 'text-gray-600'
  const iconTheme = darkMode ? 'text-orange-400' : 'text-orange-500'

  return (
    <div className="text-center py-16">
      <Compass className={`w-16 h-16 mx-auto mb-4 ${iconTheme} opacity-50`} />
      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        No public trips yet
      </h3>
      <p className={`${theme} mb-6 max-w-md mx-auto`}>
        Be the first to share a trip with the community! Your adventures could inspire others.
      </p>
      <Button
        onClick={onCreateTrip}
        className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] hover:from-[#e91e63] hover:to-[#6bb6d6] text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create a Public Trip
      </Button>
    </div>
  )
}

// Gentle reminder that appears after 1-2 sessions
export const TripCreationReminder = ({ onCreateTrip, darkMode = false }) => {
  const theme = darkMode ? 'bg-[#343f65] border-[#ff34ac]/30' : 'bg-white border-gray-200'

  return (
    <div className={`p-4 rounded-lg border ${theme} mb-6`}>
      <div className="flex items-center space-x-3">
        <MapPin className="w-6 h-6 text-[#ff34ac] flex-shrink-0" />
        <div className="flex-1">
          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to start your journey?
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Most users begin by creating their first trip. That's where Tucker Trips really comes alive.
          </p>
        </div>
        <Button
          onClick={onCreateTrip}
          size="sm"
          className="bg-[#ff34ac] hover:bg-[#e91e63] text-white"
        >
          Create Trip
        </Button>
      </div>
    </div>
  )
}