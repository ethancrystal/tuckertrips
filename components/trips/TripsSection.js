'use client'

import { Button } from '@/components/ui/button'
import { MapPin, PlusCircle } from 'lucide-react'
import TripCard from '@/components/TripCard'
import ShinyText from '@/components/ShinyText'

const Loader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
)

const SectionHeader = ({ title, showCreateButton, onNewTrip }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
    {showCreateButton && (
      <Button onClick={onNewTrip} className="bg-purple-600 hover:bg-purple-700">
        <PlusCircle className="w-5 h-5 mr-2" />
        <ShinyText text="New Trip" speed={3} />
      </Button>
    )}
  </div>
)

const EmptyState = ({ message, onNewTrip, showCreateButton }) => (
  <div className="text-center py-16 bg-gray-50 rounded-lg">
    <div className="mx-auto mb-4 p-4 bg-gray-100 rounded-full w-fit">
      <MapPin className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
    <p className="text-gray-500 mb-6">{message}</p>
    {showCreateButton && (
      <Button onClick={onNewTrip} className="bg-purple-600 hover:bg-purple-700">
        <PlusCircle className="w-5 h-5 mr-2" />
        Create Your First Trip
      </Button>
    )}
  </div>
)

const TripsSection = ({ config, trips, isLoading, onNewTrip, onDelete }) => {
  if (!config) {
    return null
  }

  const { title, emptyMessage, showCreateButton, canDelete, showUserName } = config

  return (
    <div>
      <SectionHeader title={title} showCreateButton={showCreateButton} onNewTrip={onNewTrip} />
      {isLoading ? (
        <Loader />
      ) : trips.length === 0 ? (
        <EmptyState message={emptyMessage} onNewTrip={onNewTrip} showCreateButton={showCreateButton} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDelete={canDelete ? onDelete : undefined}
              showUserName={showUserName}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TripsSection
