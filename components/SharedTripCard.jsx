'use client'

import { useState } from 'react'
import {
  MapPin,
  Calendar,
  Share2,
  Star,
  Users,
  MessageCircle,
  Eye,
  Camera,
  Heart,
  UserCircle
} from 'lucide-react'
import { toast } from 'sonner'

const SharedTripCard = ({ trip, onClick, onMessage }) => {
  const [isLiked, setIsLiked] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const tripTitle = trip.trip_name || trip.title || 'Untitled Trip'
  const tripStatus = trip.trip_type || trip.status || 'future'
  const tripImages = trip.trip_images || trip.photo_urls || []
  const coverPhoto = trip.cover_image || trip.cover_photo_url || trip.cover_photo || tripImages[0] || null

  // Get sharer info if available
  const sharerName = trip.profiles?.full_name || trip.shared_by_name || 'A friend'
  const sharerAvatar = trip.profiles?.avatar_url || null

  // Calculate average rating
  const averageRating = trip.trip_categories?.length > 0
    ? (trip.trip_categories.reduce((sum, cat) => sum + (cat.rating || 0), 0) / trip.trip_categories.length).toFixed(1)
    : trip.overall_rating || null

  const handleShare = async (e) => {
    e.stopPropagation()
    try {
      const shareUrl = `${window.location.origin}/trip/${trip.id}`
      if (navigator.share) {
        await navigator.share({
          title: tripTitle,
          text: `Check out this trip to ${trip.destination}!`,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied!')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error)
      }
    }
  }

  const handleLike = (e) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites!')
  }

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(78,184,186,0.25)]"
    >
      {/* Card with Warm Social Gradient */}
      <div className="relative bg-gradient-to-br from-[#2a3040]/95 to-[#1f2937]/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-[#4DB8BA]/20">

        {/* Shared Badge - Top Banner */}
        <div className="relative bg-gradient-to-r from-[#4DB8BA]/20 to-[#7dbbe5]/20 px-4 py-2.5 border-b border-[#4DB8BA]/20">
          <div className="flex items-center gap-3">
            {sharerAvatar ? (
              <img
                src={sharerAvatar}
                alt={sharerName}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#4DB8BA]/50"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4DB8BA] to-[#7dbbe5] flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs text-[#4DB8BA]">Shared by</p>
              <p className="text-sm font-semibold text-white truncate">{sharerName}</p>
            </div>
            <Users className="w-5 h-5 text-[#4DB8BA]" />
          </div>
        </div>

        {/* Image Section */}
        <div className="relative h-40 overflow-hidden">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt={tripTitle}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-[#4DB8BA]/20 via-[#7dbbe5]/20 to-[#2a3040]/40 flex items-center justify-center">
              <Camera className="w-12 h-12 text-[#4DB8BA]/50" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f2937] via-transparent to-transparent" />

          {/* Rating Badge */}
          {averageRating && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-semibold text-sm">{averageRating}</span>
            </div>
          )}

          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
              isLiked
                ? 'bg-[#ff34ac]/80 text-white'
                : 'bg-black/30 text-white hover:bg-black/50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Status Badge */}
          <div className="absolute bottom-3 left-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-md ${
              tripStatus === 'taken'
                ? 'bg-[#4DB8BA]/30 text-[#4DB8BA] border border-[#4DB8BA]/50'
                : 'bg-[#ff34ac]/30 text-[#ff34ac] border border-[#ff34ac]/50'
            }`}>
              {tripStatus === 'taken' ? 'Completed' : 'Planned'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-[#4DB8BA] transition-colors">
            {tripTitle}
          </h3>

          {/* Destination */}
          <div className="flex items-center gap-2 text-[#e5dbf1]/80">
            <MapPin className="w-4 h-4 text-[#4DB8BA]" />
            <span className="text-sm">{trip.destination}</span>
          </div>

          {/* Date Range */}
          {trip.start_date && (
            <div className="flex items-center gap-2 text-[#e5dbf1]/60 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {formatDate(trip.start_date)}
                {trip.end_date && ` - ${formatDate(trip.end_date)}`}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onClick?.() }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#4DB8BA] to-[#7dbbe5] hover:from-[#4DB8BA]/90 hover:to-[#7dbbe5]/90 text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#4DB8BA]/20"
            >
              <Eye className="w-4 h-4" />
              View Trip
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMessage?.(trip) }}
              className="p-2.5 bg-[#ff34ac]/20 hover:bg-[#ff34ac]/30 border border-[#ff34ac]/30 text-[#ff34ac] rounded-xl transition-all"
              title="Message about this trip"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative Connection Line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#4DB8BA] via-[#7dbbe5] to-transparent" />
      </div>
    </div>
  )
}

export default SharedTripCard
