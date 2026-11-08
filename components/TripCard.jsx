'use client'

import { useState, memo } from 'react'
import {
  MapPin,
  Calendar,
  Share2,
  MessageCircle,
  Star,
  Globe,
  Lock,
  Users,
  MoreVertical,
  Trash2,
  Edit,
  Copy,
  Camera
} from 'lucide-react'
import StarRating from '@/components/StarRating'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const TripCard = ({ trip, onDelete, onEdit, showActions = false, onMessage, onClick, darkMode = true, enableCopy = false, onCopy, onShare, onUnshare }) => {
  const [sharing, setSharing] = useState(false)
  const [copying, setCopying] = useState(false)

  // Theme-aware colors
  const cardBg = darkMode 
    ? 'bg-gradient-to-br from-[#343f65] to-[#343f65]/80' 
    : 'bg-white border-2'
  const borderColor = darkMode ? 'border-white/10' : 'border-gray-200'
  const hoverBorder = darkMode ? 'hover:border-[#ff34ac]/50' : 'hover:border-pink-300'
  const textColor = darkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = darkMode ? 'text-[#e5dbf1]' : 'text-gray-600'

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getVisibilityIcon = () => {
    switch (trip.visibility) {
      case 'public':
        return <Globe className="w-4 h-4 text-[#7dbbe5]" />
      case 'friends':
        return <Users className="w-4 h-4 text-[#ff34ac]" />
      default:
        return <Lock className="w-4 h-4 text-gray-400" />
    }
  }

  const tripTitle = trip.trip_name || trip.title || 'Untitled Trip'
  const tripStatus = trip.trip_type || trip.status || 'future'
  const tripImages = trip.trip_images || trip.photo_urls || []
  const coverPhotoValue = trip.cover_image || trip.cover_photo_url || trip.cover_photo || tripImages[0] || null
  const isShared = Boolean(trip.is_shared) || (Array.isArray(trip.shared_with) && trip.shared_with.length > 0)

  const handleShare = async () => {
    setSharing(true)
    try {
      const shareUrl = `${window.location.origin}/trip/${trip.id}`

      if (navigator.share) {
        await navigator.share({
          title: tripTitle,
          text: `Check out my trip to ${trip.destination}!`,
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
        toast.error('Failed to share')
      }
    } finally {
      setSharing(false)
    }
  }

  const handleCopy = async () => {
    setCopying(true)
    try {
      // Call the onCopy prop with trip data
      if (onCopy) {
        await onCopy(trip)
        toast.success('Trip copied! You can now edit it in the form.')
      }
    } catch (error) {
      console.error('Error copying trip:', error)
      toast.error('Failed to copy trip')
    } finally {
      setCopying(false)
    }
  }

  // Calculate average rating from categories if available
  const averageRating = trip.trip_categories?.length > 0
    ? Math.round(
        trip.trip_categories.reduce((sum, cat) => sum + (cat.rating || 0), 0) / 
        trip.trip_categories.length
      )
    : trip.overall_rating || 0

  const coverPhoto = coverPhotoValue

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#343f65] to-[#343f65]/80 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff34ac]/50 hover:shadow-[0_20px_40px_rgba(255,52,172,0.2)] cursor-pointer"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#ff34ac]/20 blur-3xl transition-all duration-300 group-hover:bg-[#ff34ac]/30" />

      {/* Cover Photo */}
      {coverPhoto ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={coverPhoto}
            alt={tripTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-[#7dbbe5]/20 to-[#ff34ac]/20 flex items-center justify-center">
          <Camera className="w-12 h-12 text-white/50" />
        </div>
      )}

      {/* Share Icon in Top-Left */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleShare()
        }}
        className="absolute top-4 left-4 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-200 group-hover:bg-black/50"
        title="Share trip"
      >
        <Share2 className="w-5 h-5 text-white" />
      </button>

      {/* Copy Icon in Top-Left (next to Share) */}
      {enableCopy && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleCopy()
          }}
          disabled={copying}
          className="absolute top-4 left-16 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-200 group-hover:bg-black/50 disabled:opacity-50"
          title="Copy trip"
        >
          <Copy className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Actions Menu (for own trips) */}
      {showActions && (
        <div className="absolute top-4 right-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-full"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#343f65] border-white/10">
              <DropdownMenuItem
                onClick={onEdit}
                className="text-white hover:bg-white/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Trip
              </DropdownMenuItem>
              {onShare && !isShared && (
                <DropdownMenuItem
                  onClick={() => onShare(trip)}
                  className="text-white hover:bg-white/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Trip
                </DropdownMenuItem>
              )}
              {onUnshare && isShared && (
                <DropdownMenuItem
                  onClick={() => onUnshare(trip.id)}
                  className="text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Unshare Trip
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Trip
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getVisibilityIcon()}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              trip.visibility === 'public' ? 'bg-green-500/20 text-green-400' : 
              trip.visibility === 'friends' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
            }`}>
              {trip.visibility}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              tripStatus === 'taken'
                ? 'bg-[#7dbbe5]/20 text-[#7dbbe5]'
                : 'bg-[#ff34ac]/20 text-[#ff34ac]'
            }`}>
              {tripStatus === 'taken' ? 'Trip Taken' : 'Future Trip'}
            </span>
            {isShared && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                Shared
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#e5dbf1] transition-colors">
            {tripTitle}
          </h3>
          <div className="flex items-center gap-2 text-[#e5dbf1] text-sm">
            <MapPin className="w-4 h-4" />
            <span>{trip.destination || 'Destination TBD'}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      {averageRating > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <StarRating rating={averageRating} readonly size="sm" />
          <span className="text-sm text-[#e5dbf1]">({averageRating}/5)</span>
        </div>
      )}

      {/* Dates */}
      <div className="flex items-center gap-2 text-sm text-[#e5dbf1] mb-4">
        <Calendar className="w-4 h-4" />
        <span>
          {formatDate(trip.start_date)} 
          {trip.end_date && ` - ${formatDate(trip.end_date)}`}
        </span>
      </div>

      {/* Categories Preview */}
      {trip.trip_categories && trip.trip_categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {trip.trip_categories.slice(0, 3).map((category) => (
            <span
              key={category.id}
              className="text-xs px-2 py-1 rounded-full bg-white/10 text-white capitalize"
            >
              {category.category_name}
            </span>
          ))}
          {trip.trip_categories.length > 3 && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white">
              +{trip.trip_categories.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="relative flex gap-3 mt-6">
        <Button
          onClick={(e) => {
            e.stopPropagation()
            handleShare()
          }}
          disabled={sharing}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
          size="sm"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onMessage?.(trip)
          }}
          className="flex-1 bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white hover:opacity-90"
          size="sm"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </Button>
      </div>
    </div>
  )
}

// Custom comparison function for React.memo
// Only re-render if trip data actually changed
function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.trip.id === nextProps.trip.id &&
    prevProps.trip.updated_at === nextProps.trip.updated_at &&
    prevProps.darkMode === nextProps.darkMode &&
    prevProps.showActions === nextProps.showActions
  )
}

export default memo(TripCard, arePropsEqual)
