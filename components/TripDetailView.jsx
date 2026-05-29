'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import StarRating from '@/components/StarRating'
import { 
  X, 
  MapPin, 
  Calendar, 
  Share2,
  Car,
  Utensils,
  Hotel,
  Plane,
  Compass as MapPinIcon,
  Globe,
  Lock,
  Users,
  DollarSign
} from 'lucide-react'

const categoryIcons = {
  rental: Car,
  food: Utensils,
  accommodation: Hotel,
  airline: Plane,
  excursions: MapPinIcon,
}

const TripDetailView = ({ trip, open, onClose, onShare, isOwner = false }) => {
  if (!trip) return null

  const tripTitle = trip.trip_name || trip.title || 'Untitled Trip'
  const tripStatus = trip.trip_type || trip.status || 'future'

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const getVisibilityBadge = () => {
    switch (trip.visibility) {
      case 'public':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#7dbbe5]/20 text-[#7dbbe5] text-sm">
            <Globe className="w-4 h-4" />
            Public
          </span>
        )
      case 'friends':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff34ac]/20 text-[#ff34ac] text-sm">
            <Users className="w-4 h-4" />
            Friends Only
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-400/20 text-gray-400 text-sm">
            <Lock className="w-4 h-4" />
            Private
          </span>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#343f65] to-[#2a3352] text-white border-[#ff34ac]/30 p-0">
        {/* Visually hidden header for accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>{tripTitle}</DialogTitle>
          <DialogDescription>
            Trip details for {tripTitle} in {trip.destination}
            {trip.start_date && trip.end_date && ` from ${new Date(trip.start_date).toLocaleDateString()} to ${new Date(trip.end_date).toLocaleDateString()}`}
          </DialogDescription>
        </DialogHeader>

        {/* Cover Image */}
        {(trip.cover_image || trip.cover_photo_url) && (
          <div className="relative h-64 w-full">
            <img
              src={trip.cover_image || trip.cover_photo_url}
              alt={tripTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#343f65] to-transparent" />
          </div>
        )}

        {/* Header */}
        <div className={`sticky top-0 z-10 bg-[#343f65]/95 backdrop-blur-xl border-b border-white/10 p-6 ${!(trip.cover_image || trip.cover_photo_url) ? 'rounded-t-2xl' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getVisibilityBadge()}
                <span className={`px-3 py-1 rounded-full text-sm ${
                  tripStatus === 'taken'
                    ? 'bg-[#7dbbe5]/20 text-[#7dbbe5]'
                    : 'bg-[#ff34ac]/20 text-[#ff34ac]'
                }`}>
                  {tripStatus === 'taken' ? 'Trip Taken' : 'Future Trip'}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{tripTitle}</h2>
              <div className="flex items-center gap-4 text-[#e5dbf1]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {formatDate(trip.start_date)}
                    {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {trip.visibility === 'public' && (
                <Button
                  onClick={() => onShare(trip)}
                  className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] hover:opacity-90"
                  size="sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Trip
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Description */}
          {trip.description && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[#7dbbe5] mb-3 uppercase tracking-wider">
                About this Trip
              </h3>
              <p className="text-[#e5dbf1] leading-relaxed whitespace-pre-wrap">
                {trip.description}
              </p>
            </div>
          )}

          {/* Photo Gallery */}
          {trip.photo_urls && trip.photo_urls.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#ff34ac] uppercase tracking-wider">
                Photo Gallery
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {trip.photo_urls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                    <img
                      src={url}
                      alt={`Trip photo ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {trip.trip_categories && trip.trip_categories.length > 0 ? (
            <div className="space-y-6">
              {trip.trip_categories.map((category) => {
                const Icon = categoryIcons[category.category_name] || MapPinIcon
                
                return (
                  <div
                    key={category.id}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#ff34ac]/30 transition-colors"
                  >
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-[#ff34ac]/20 to-[#7dbbe5]/20 rounded-xl">
                          <Icon className="w-6 h-6 text-[#e5dbf1]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white capitalize">
                            {category.category_name}
                          </h3>
                          {category.average_price && (
                            <div className="flex items-center gap-1 text-[#7dbbe5] text-sm mt-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${category.average_price} avg</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {category.rating > 0 && (
                        <StarRating rating={category.rating} readonly size="md" />
                      )}
                    </div>

                    {/* Category Details */}
                    <div className="space-y-4 ml-1">
                      {category.big_wins && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#7dbbe5] mb-2 uppercase tracking-wider">
                            🎉 Big Wins
                          </h4>
                          <p className="text-[#e5dbf1] leading-relaxed">{category.big_wins}</p>
                        </div>
                      )}

                      {category.do_differently && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#ff34ac] mb-2 uppercase tracking-wider">
                            🔄 Do Differently Next Time
                          </h4>
                          <p className="text-[#e5dbf1] leading-relaxed">{category.do_differently}</p>
                        </div>
                      )}

                      {category.timing_tips && (
                        <div>
                          <h4 className="text-sm font-semibold text-[#e5dbf1] mb-2 uppercase tracking-wider">
                            ⏰ Timing Tips
                          </h4>
                          <p className="text-[#e5dbf1] leading-relaxed">{category.timing_tips}</p>
                        </div>
                      )}

                      {category.notes && (
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">
                            📝 Additional Notes
                          </h4>
                          <p className="text-[#e5dbf1] leading-relaxed">{category.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#e5dbf1]">No category details added yet.</p>
            </div>
          )}

          {/* Owner Info (if not owner) */}
          {!isOwner && trip.profiles && (
            <div className="border-t border-white/10 pt-6">
              <p className="text-sm text-[#e5dbf1]">
                Trip shared by <span className="text-white font-semibold">{trip.profiles.full_name || trip.profiles.email}</span>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TripDetailView
