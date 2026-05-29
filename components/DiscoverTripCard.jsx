'use client'

import { useState } from 'react'
import {
  MapPin,
  Calendar,
  Share2,
  Star,
  Globe,
  Copy,
  Camera,
  Heart,
  Eye,
  Sparkles,
  Plane
} from 'lucide-react'
import { toast } from 'sonner'

const DiscoverTripCard = ({ trip, onClick, onCopy }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [copying, setCopying] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const tripTitle = trip.trip_name || trip.title || 'Untitled Trip'
  const tripStatus = trip.trip_type || trip.status || 'future'
  const tripImages = trip.trip_images || trip.photo_urls || []
  const coverPhoto = trip.cover_image || trip.cover_photo_url || trip.cover_photo || tripImages[0] || null

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
          text: `Check out this amazing trip to ${trip.destination}!`,
          url: shareUrl,
        })
        toast.success('Shared successfully!')
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error)
      }
    }
  }

  const handleCopy = async (e) => {
    e.stopPropagation()
    setCopying(true)
    try {
      if (onCopy) {
        await onCopy(trip)
        toast.success('Trip copied! Create your own version.')
      }
    } catch (error) {
      console.error('Error copying trip:', error)
      toast.error('Failed to copy trip')
    } finally {
      setCopying(false)
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
      className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(255,52,172,0.25)]"
    >
      {/* Card Container with Glass Effect */}
      <div className="relative bg-gradient-to-br from-[#1a1f35]/90 to-[#2d3555]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">

        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          {coverPhoto ? (
            <>
              {/* Skeleton loader */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#7dbbe5]/20 to-[#ff34ac]/20 animate-pulse" />
              )}
              <img
                src={coverPhoto}
                alt={tripTitle}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </>
          ) : (
            <div className="h-full bg-gradient-to-br from-[#7dbbe5]/30 via-[#ff34ac]/20 to-[#4DB8BA]/30 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-white/30 mx-auto mb-2" />
                <span className="text-white/40 text-sm">No photo yet</span>
              </div>
            </div>
          )}

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f35] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff34ac]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Top Actions Bar */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md ${
              tripStatus === 'taken'
                ? 'bg-[#7dbbe5]/30 border border-[#7dbbe5]/50'
                : 'bg-[#ff34ac]/30 border border-[#ff34ac]/50'
            }`}>
              {tripStatus === 'taken' ? (
                <Plane className="w-3.5 h-3.5 text-[#7dbbe5]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#ff34ac]" />
              )}
              <span className={`text-xs font-semibold ${
                tripStatus === 'taken' ? 'text-[#7dbbe5]' : 'text-[#ff34ac]'
              }`}>
                {tripStatus === 'taken' ? 'Completed' : 'Planned'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleLike}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
                  isLiked
                    ? 'bg-[#ff34ac]/80 text-white scale-110'
                    : 'bg-black/30 text-white hover:bg-black/50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-md transition-all duration-300 text-white"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rating Badge */}
          {averageRating && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-bold text-sm">{averageRating}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-4">
          {/* Title & Destination */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#ff34ac] transition-colors duration-300">
              {tripTitle}
            </h3>
            <div className="flex items-center gap-2 text-[#e5dbf1]/80">
              <MapPin className="w-4 h-4 text-[#7dbbe5]" />
              <span className="text-sm font-medium">{trip.destination}</span>
            </div>
          </div>

          {/* Date Range */}
          {(trip.start_date || trip.end_date) && (
            <div className="flex items-center gap-2 text-[#e5dbf1]/60 text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(trip.start_date)}
                {trip.end_date && trip.start_date !== trip.end_date && ` - ${formatDate(trip.end_date)}`}
              </span>
            </div>
          )}

          {/* Categories/Tags */}
          {trip.trip_categories && trip.trip_categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trip.trip_categories.slice(0, 3).map((category, idx) => (
                <span
                  key={category.id || idx}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/80 capitalize border border-white/5"
                >
                  {category.category_name}
                </span>
              ))}
              {trip.trip_categories.length > 3 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#ff34ac]/20 text-[#ff34ac] border border-[#ff34ac]/30">
                  +{trip.trip_categories.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClick}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] hover:from-[#ff34ac]/90 hover:to-[#7dbbe5]/90 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#ff34ac]/20 hover:shadow-[#ff34ac]/40"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={handleCopy}
              disabled={copying}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all duration-300 disabled:opacity-50"
              title="Copy this trip"
            >
              <Copy className={`w-5 h-5 ${copying ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ff34ac]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#7dbbe5]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Outer Glow on Hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#ff34ac]/20 to-[#7dbbe5]/20 opacity-0 group-hover:opacity-100 -z-10 blur-xl transition-opacity duration-500" />
    </div>
  )
}

export default DiscoverTripCard
