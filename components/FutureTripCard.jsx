'use client'

import { useState, useEffect } from 'react'
import {
  MapPin,
  Calendar,
  Share2,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  MoreVertical,
  Camera,
  Plane,
  Sun,
  Globe,
  Lock,
  Users,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const FutureTripCard = ({ trip, onClick, onEdit, onDelete, onShare, onComplete }) => {
  const [daysUntil, setDaysUntil] = useState(null)

  useEffect(() => {
    if (trip.start_date) {
      const startDate = new Date(trip.start_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      startDate.setHours(0, 0, 0, 0)
      const diff = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24))
      setDaysUntil(diff > 0 ? diff : null)
    }
  }, [trip.start_date])

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const tripTitle = trip.trip_name || trip.title || 'Untitled Trip'
  const tripImages = trip.trip_images || trip.photo_urls || []
  const coverPhoto = trip.cover_image || trip.cover_photo_url || trip.cover_photo || tripImages[0] || null

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
          text: `Check out my upcoming trip to ${trip.destination}!`,
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

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(125,187,229,0.3)]"
    >
      {/* Card with Dreamy Gradient Border */}
      <div className="relative bg-gradient-to-br from-[#1a2744]/95 to-[#2a3f6f]/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-[#7dbbe5]/20">

        {/* Animated Dream Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7dbbe5]/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#ff34ac]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Image Section */}
        <div className="relative h-44 overflow-hidden">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt={tripTitle}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-[#7dbbe5]/20 via-[#4a6fa5]/20 to-[#2a3f6f]/40 flex items-center justify-center">
              <div className="text-center">
                <Plane className="w-12 h-12 text-[#7dbbe5]/50 mx-auto mb-2 animate-bounce" style={{ animationDuration: '3s' }} />
                <span className="text-[#7dbbe5]/60 text-sm">Dream Destination</span>
              </div>
            </div>
          )}

          {/* Dreamy Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a2744] via-[#1a2744]/60 to-transparent" />

          {/* Floating Stars Effect */}
          <Sparkles className="absolute top-4 right-4 w-5 h-5 text-[#7dbbe5]/60 animate-pulse" />

          {/* Countdown Badge */}
          {daysUntil && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-[#7dbbe5]/20 backdrop-blur-md rounded-2xl border border-[#7dbbe5]/30">
              <Clock className="w-4 h-4 text-[#7dbbe5]" />
              <div className="text-center">
                <span className="text-xl font-bold text-white">{daysUntil}</span>
                <span className="text-xs text-[#7dbbe5] ml-1">days</span>
              </div>
            </div>
          )}

          {/* Actions Menu */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
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
              <DropdownMenuContent className="bg-[#1a2744] border-[#7dbbe5]/20">
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onComplete?.() }}
                  className="text-green-400 hover:bg-green-500/10"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onEdit?.() }}
                  className="text-white hover:bg-[#7dbbe5]/20"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Trip
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onShare?.(trip) }}
                  className="text-white hover:bg-[#7dbbe5]/20"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Trip
                </DropdownMenuItem>
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
        </div>

        {/* Content Section */}
        <div className="relative p-5 space-y-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {getVisibilityIcon()}
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#7dbbe5]/20 text-[#7dbbe5] border border-[#7dbbe5]/30">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Future Trip
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-[#7dbbe5] transition-colors">
            {tripTitle}
          </h3>

          {/* Destination */}
          <div className="flex items-center gap-2 text-[#e5dbf1]/80">
            <MapPin className="w-4 h-4 text-[#7dbbe5]" />
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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#7dbbe5] to-[#4a6fa5] hover:from-[#7dbbe5]/90 hover:to-[#4a6fa5]/90 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#7dbbe5]/20"
            >
              <Sun className="w-4 h-4" />
              View Plans
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
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7dbbe5] via-[#4a6fa5] to-[#7dbbe5]" />
      </div>
    </div>
  )
}

export default FutureTripCard
