'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Share2,
  MessageCircle,
  Star,
  Globe,
  Lock,
  Users,
  Heart,
  Camera,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase.js'
import StarRating from '@/components/StarRating'

const TripDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showFullGallery, setShowFullGallery] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (tripId) {
      fetchTripDetails()
    }
  }, [tripId])

  const fetchTripDetails = async () => {
    try {
      setLoading(true)

      // Fetch trip with categories and profile info
      const { data: tripData, error } = await supabase
        .from('trips')
        .select(`
          *,
          trip_categories(*),
          profiles(full_name, email)
        `)
        .eq('id', tripId)
        .single()

      if (error) throw error

      // Check if user can view this trip
      // Access conditions: public trips, owner, or explicit share recipient
      const { data: { user } } = await supabase.auth.getUser()

      if (tripData.visibility === 'public') {
        // Public trips are accessible to everyone
      } else if (user && tripData.user_id === user.id) {
        // Owner can always access their own trips
      } else if (user) {
        // Check if user has explicit share access via trip_shares table
        const { data: shareAccess } = await supabase
          .from('trip_shares')
          .select('trip_id')
          .eq('trip_id', tripId)
          .eq('shared_with', user.id)
          .single()

        if (!shareAccess) {
          toast.error('You don\'t have permission to view this trip')
          router.push('/')
          return
        }
      } else {
        // Not logged in and trip is not public
        toast.error('You don\'t have permission to view this trip')
        router.push('/')
        return
      }

      const tripType = tripData.trip_type || tripData.status || 'future'
      const coverImage = tripData.cover_image || tripData.cover_photo_url || tripData.cover_photo || null
      const tripName = tripData.trip_name || tripData.title || 'Untitled trip'

      const normalizedTrip = {
        ...tripData,
        trip_name: tripName,
        title: tripName,
        trip_type: tripType,
        status: tripType,
        cover_image: coverImage,
        cover_photo_url: coverImage,
        cover_photo: coverImage,
      }

      setTrip(normalizedTrip)
    } catch (error) {
      console.error('Error fetching trip details:', error)
      toast.error('Failed to load trip details')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      const shareUrl = window.location.href

      if (navigator.share) {
        await navigator.share({
          title: trip.title || trip.trip_name,
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
    }
  }

  const handleMessage = () => {
    toast.info('Messaging feature coming soon!')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get all photos (cover photo + gallery photos)
  const getAllPhotos = () => {
    const photos = []
    const coverPhoto = trip?.cover_image || trip?.cover_photo_url || trip?.cover_photo
    if (coverPhoto) {
      photos.push(coverPhoto)
    }
    const legacyImages = trip?.trip_images || trip?.photo_urls || []
    for (const img of legacyImages) {
      if (img && !photos.includes(img)) {
        photos.push(img)
      }
    }
    return photos
  }

  const nextPhoto = () => {
    const photos = getAllPhotos()
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#343f65] to-[#2a3352]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff34ac] mx-auto"></div>
          <p className="mt-4 text-[#e5dbf1]">Loading trip details...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#343f65] to-[#2a3352]">
        <div className="text-center">
          <p className="text-[#e5dbf1]">Trip not found</p>
          <Button
            onClick={() => router.push('/')}
            className="mt-4 bg-[#ff34ac] hover:bg-[#e62d95]"
          >
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const allPhotos = getAllPhotos()
  const currentPhoto = allPhotos[currentPhotoIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#343f65] to-[#2a3352]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#343f65]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-white">{trip.trip_name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMessage}
                className="text-white hover:bg-white/10"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            {allPhotos.length > 0 && (
              <div className="relative">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-800">
                  <img
                    src={currentPhoto}
                    alt={`${trip.trip_name} - Photo ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Photo Navigation */}
                  {allPhotos.length > 1 && (
                    <>
                      <button
                        onClick={prevPhoto}
                        disabled={currentPhotoIndex === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextPhoto}
                        disabled={currentPhotoIndex === allPhotos.length - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Photo Counter */}
                  {allPhotos.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentPhotoIndex + 1} / {allPhotos.length}
                    </div>
                  )}

                  {/* View All Photos Button */}
                  {allPhotos.length > 1 && (
                    <button
                      onClick={() => setShowFullGallery(true)}
                      className="absolute bottom-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {allPhotos.length > 1 && (
                  <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                    {allPhotos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentPhotoIndex
                            ? 'border-[#ff34ac] opacity-100'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* No Photos Placeholder */}
            {allPhotos.length === 0 && (
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#7dbbe5]/20 to-[#ff34ac]/20 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">No photos added yet</p>
                </div>
              </div>
            )}

            {/* Trip Information */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{trip.trip_name}</h2>
                  <div className="flex items-center space-x-4 text-[#e5dbf1]">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(trip.start_date)}
                        {trip.end_date && ` - ${formatDate(trip.end_date)}`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {trip.visibility === 'public' ? (
                    <Globe className="w-5 h-5 text-[#7dbbe5]" />
                  ) : trip.visibility === 'friends' ? (
                    <Users className="w-5 h-5 text-[#ff34ac]" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm text-[#e5dbf1] capitalize">{trip.visibility}</span>
                </div>
              </div>

              {trip.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">About this trip</h3>
                  <p className="text-[#e5dbf1] leading-relaxed">{trip.description}</p>
                </div>
              )}

              {/* Trip Categories */}
              {trip.trip_categories && trip.trip_categories.length > 0 && (
                <div className="space-y-6">
                  {trip.trip_categories.map((category) => (
                    <div key={category.id} className="border-t border-white/10 pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white capitalize">
                          {category.category_name}
                        </h3>
                        {category.rating && (
                          <div className="flex items-center space-x-2">
                            <StarRating rating={category.rating} readonly size="sm" />
                            <span className="text-sm text-[#e5dbf1]">({category.rating}/5)</span>
                          </div>
                        )}
                      </div>

                      {category.name && (
                        <p className="text-[#e5dbf1] mb-2">
                          <strong>Name:</strong> {category.name}
                        </p>
                      )}

                      {category.details && (
                        <p className="text-[#e5dbf1] mb-2">
                          <strong>Details:</strong> {category.details}
                        </p>
                      )}

                      {category.notes && (
                        <p className="text-[#e5dbf1]">
                          <strong>Notes:</strong> {category.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Trip Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#e5dbf1]">Type</span>
                  <span className="text-white capitalize">{trip.trip_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e5dbf1]">Visibility</span>
                  <span className="text-white capitalize">{trip.visibility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#e5dbf1]">Created</span>
                  <span className="text-white">
                    {new Date(trip.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="space-y-3">
                <Button
                  onClick={() => setLiked(!liked)}
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Liked' : 'Like Trip'}
                </Button>
                <Button
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white hover:opacity-90"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Trip
                </Button>
                <Button
                  onClick={handleMessage}
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Owner
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Gallery Modal */}
      {showFullGallery && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
          <div className="relative h-full flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-semibold text-white">Trip Gallery</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullGallery(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allPhotos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setCurrentPhotoIndex(index)
                      setShowFullGallery(false)
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Gallery photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TripDetailPage
