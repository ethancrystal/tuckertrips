'use client'

import { useState } from 'react'
import {
  MapPin,
  Calendar,
  Share2,
  Star,
  Globe,
  Lock,
  Users,
  Edit,
  Trash2,
  MoreVertical,
  Camera,
  Eye,
  Award,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const MyTripCard = ({ trip, onClick, onEdit, onDelete, onShare, onUnshare }) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const tripTitle = trip.trip_name || trip.title || 'Untitled Trip'
  const tripImages = trip.trip_images || trip.photo_urls || []
  const coverPhoto = trip.cover_image || trip.cover_photo_url || trip.cover_photo || tripImages[0] || null
  const isShared = Array.isArray(trip.shared_with)
    ? trip.shared_with.length > 0
    : Boolean(trip.is_shared)

  // Calculate average rating
  const averageRating = trip.trip_categories?.length > 0
    ? (trip.trip_categories.reduce((sum, cat) => sum + (cat.rating || 0), 0) / trip.trip_categories.length).toFixed(1)
    : trip.overall_rating || null

  const getVisibilityIcon = () => {
    switch (trip.visibility) {
      case 'public':
        return <Globe className="w-3.5 h-3.5 text-[#7dbbe5]" />
      case 'friends':
        return <Users className="w-3.5 h-3.5 text-[#ff34ac]" />
      default:
        return <Lock className="w-3.5 h-3.5 text-gray-400" />
    }
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    try {
      const shareUrl = `${window.location.origin}/trip/${trip.id}`
      if (navigator.share) {
        await navigator.share({
          title: tripTitle,
          text: `Check out my trip to ${trip.destination}!`,
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

  // Render star rating
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400/50" />
        )
      } else {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 text-gray-500" />
        )
      }
    }
    return stars
  }

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(255,52,172,0.25)]"
    >
      {/* Card with Warm Memory Gradient */}
      <div className="relative bg-gradient-to-br from-[#3d2a4a]/95 to-[#2a2040]/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-[#ff34ac]/20">

        {/* Memory Badge - Top Left */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#ff34ac]/20 backdrop-blur-md rounded-full border border-[#ff34ac]/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#ff34ac]" />
          <span className="text-xs font-semibold text-[#ff34ac]">Completed</span>
        </div>

        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {coverPhoto ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff34ac]/20 to-[#7dbbe5]/20 animate-pulse" />
              )}
              <img
                src={coverPhoto}
                alt={tripTitle}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </>
          ) : (
            <div className="h-full bg-gradient-to-br from-[#ff34ac]/20 via-[#7dbbe5]/20 to-[#3d2a4a]/40 flex items-center justify-center">
              <Camera className="w-14 h-14 text-[#ff34ac]/40" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a2040] via-[#2a2040]/40 to-transparent" />

          {/* Actions Menu */}
          <div className="absolute top-4 right-4 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#2a2040] border-[#ff34ac]/20">
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onEdit?.() }}
                  className="text-white hover:bg-[#ff34ac]/20"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Trip
                </DropdownMenuItem>
                {!isShared ? (
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onShare?.(trip) }}
                    className="text-white hover:bg-[#ff34ac]/20"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Trip
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onUnshare?.(trip.id) }}
                    className="text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Unshare Trip
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete?.() }}
                  className="text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Trip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rating Badge */}
          {averageRating && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-xl border border-white/10">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="flex gap-0.5">
                {renderStars(parseFloat(averageRating))}
              </div>
            </div>
          )}

          {/* Shared Badge */}
          {isShared && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-green-500/30 backdrop-blur-md rounded-full border border-green-500/50">
              <Share2 className="w-3 h-3 text-green-400" />
              <span className="text-xs font-medium text-green-400">Shared</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-3">
          {/* Visibility & Categories */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-full">
              {getVisibilityIcon()}
              <span className="text-xs text-white/70 capitalize">{trip.visibility || 'private'}</span>
            </div>
            {trip.trip_categories?.slice(0, 2).map((cat, idx) => (
              <span
                key={cat.id || idx}
                className="text-xs px-2 py-1 bg-[#ff34ac]/20 text-[#ff34ac] rounded-full capitalize"
              >
                {cat.category_name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-[#ff34ac] transition-colors">
            {tripTitle}
          </h3>

          {/* Destination */}
          <div className="flex items-center gap-2 text-[#e5dbf1]/80">
            <MapPin className="w-4 h-4 text-[#ff34ac]" />
            <span className="text-sm font-medium">{trip.destination}</span>
          </div>

          {/* Date Range */}
          {trip.start_date && (
            <div className="flex items-center gap-2 text-[#e5dbf1]/60 text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(trip.start_date)}
                {trip.end_date && ` - ${formatDate(trip.end_date)}`}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={(e) => { e.stopPropagation(); onClick?.() }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] hover:from-[#ff34ac]/90 hover:to-[#7dbbe5]/90 text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#ff34ac]/20"
            >
              <Eye className="w-4 h-4" />
              View Memories
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff34ac] via-[#7dbbe5] to-[#ff34ac]" />
      </div>
    </div>
  )
}

export default MyTripCard
