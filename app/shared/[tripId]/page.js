'use client'

/**
 * Shared Trip Page
 *
 * Refactored to fetch trip data exclusively through the secure
 * /api/shared-trips/[id] endpoint, which enforces all access-control
 * rules server-side via checkTripAccess().
 *
 * Previously this page contained ~60 lines of duplicated Supabase queries
 * and manual visibility/share/ownership checks. Those have been removed.
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Star, Users, ArrowRight, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase.js'
import AuthModalNew from '@/components/AuthModalNew'
import Link from 'next/link'

export default function SharedTripPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.tripId

  const [trip, setTrip] = useState(null)
  const [tripCategories, setTripCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(null)

  // Resolve the current user once on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  // Fetch the trip via the secure API — no client-side auth logic needed
  useEffect(() => {
    if (!tripId) return

    const fetchSharedTrip = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/shared-trips/${tripId}`)

        if (res.status === 404) {
          setError('Trip not found')
          return
        }
        if (res.status === 403) {
          setError('This trip is private. Ask the owner to share it with you.')
          return
        }
        if (!res.ok) {
          setError('Failed to load trip. Please try again.')
          return
        }

        const { data } = await res.json()
        setTrip(data)
        setTripCategories(data.trip_categories || [])
      } catch (err) {
        console.error('Error fetching shared trip:', err)
        setError('Failed to load trip')
      } finally {
        setLoading(false)
      }
    }

    fetchSharedTrip()
  }, [tripId])

  const handleAuthSuccess = async () => {
    setShowAuth(false)
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) router.push('/dashboard')
  }

  const renderRating = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getCategoryIcon = (categoryName) => {
    const icons = {
      accommodation: '🏨',
      restaurant: '🍽️',
      food: '🍽️',
      airline: '✈️',
      rental: '🚗',
      excursions: '🎒',
    }
    return icons[categoryName?.toLowerCase()] ?? '📍'
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DB8BA] mx-auto mb-4" />
          <p className="text-gray-600">Loading trip...</p>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Available</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/">
              <Button className="w-full">Back to Tucker Trips</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Trip view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              <span className="text-xl font-bold text-[#ec4899]">Tucker Trips</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span>Public View</span>
              </div>

              {user ? (
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
                >
                  View in Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
                >
                  Sign Up to View More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Trip Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Badge className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white mb-4">
                Shared Trip
              </Badge>
              <h1 className="text-3xl font-bold text-[#3a4d6f] mb-2">
                {trip.trip_name}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.destination}</span>
                </div>
                {trip.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(trip.start_date)}</span>
                  </div>
                )}
                {trip.end_date && trip.start_date !== trip.end_date && (
                  <span>– {formatDate(trip.end_date)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Shared By */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#4DB8BA]/10 to-[#ec4899]/10 rounded-lg">
            <Users className="w-5 h-5 text-[#4DB8BA]" />
            <span className="text-sm">
              Shared by{' '}
              <strong>
                {trip.profiles?.full_name ||
                  trip.profiles?.email ||
                  'A Tucker Trips member'}
              </strong>
            </span>
          </div>
        </div>

        {/* Trip Categories */}
        {tripCategories.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#3a4d6f] mb-6">Trip Details</h2>
            <div className="grid gap-6">
              {tripCategories.map((category, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {getCategoryIcon(category.category_name)}
                        </span>
                        <div>
                          <h3 className="text-xl font-semibold text-[#3a4d6f] capitalize">
                            {category.category_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {category.rating ? `${category.rating}/5 stars` : 'No rating'}
                          </p>
                        </div>
                      </div>
                      {category.rating && renderRating(category.rating)}
                    </div>

                    {category.notes && (
                      <p className="text-gray-700 whitespace-pre-wrap text-sm">
                        {category.notes}
                      </p>
                    )}

                    {category.average_price && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-gray-500">Average Cost:</span>
                        <span className="font-semibold text-[#3a4d6f]">
                          ${category.average_price}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center p-12">
            <CardContent>
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No details added yet
              </h3>
              <p className="text-gray-600">
                The traveler hasn't added specific details for this trip yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-br from-[#ff34ac]/10 to-[#7dbbe5]/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#3a4d6f] mb-4">
              Want to Share Your Own Trips?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join Tucker Trips to document your adventures and share them with friends,
              family, or the community. Get real travel advice from people you actually trust!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
                >
                  Join Tucker Trips
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              <Link href="/">
                <Button variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>© 2024 Tucker Trips. Real trips. Real friends. Real trust.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModalNew
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}
