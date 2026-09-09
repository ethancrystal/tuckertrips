'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Star, Users, ArrowRight, Mail, Lock, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase.js'
import AuthModalNew from '@/components/AuthModalNew'
import Link from 'next/link'

export default function InvitePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const tripId = params.tripId
  const email = searchParams.get('email')
  const [trip, setTrip] = useState(null)
  const [tripCategories, setTripCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(null)
  const [inviteProcessed, setInviteProcessed] = useState(false)
  const processingRef = useRef(false)

  useEffect(() => {
    // Check if user is already authenticated (don't process yet — wait for trip)
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()
  }, [])

  // Process the invitation only once BOTH the user and the trip are loaded, so
  // the trip_shares row gets a valid shared_by (trip.user_id) instead of racing
  // the trip fetch and inserting shared_by: undefined.
  useEffect(() => {
    if (user && trip && !inviteProcessed) {
      processInvitation(user)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, trip, inviteProcessed])

  useEffect(() => {
    const fetchInvitedTrip = async () => {
      if (!tripId) return

      try {
        setLoading(true)

        // Fetch trip details (both public and private trips can be viewed via invitation)
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select(`
            *,
            profiles!trips_user_id_fkey (
              full_name,
              email
            )
          `)
          .eq('id', tripId)
          .single()

        if (tripError) {
          if (tripError.code === 'PGRST116') {
            setError('Trip not found')
          } else {
            setError('Error loading trip')
          }
          return
        }

        if (!tripData) {
          setError('Trip not found')
          return
        }

        setTrip(tripData)

        // Fetch trip categories
        const { data: categoriesData } = await supabase
          .from('trip_categories')
          .select('*')
          .eq('trip_id', tripId)
          .order('created_at', { ascending: false })

        setTripCategories(categoriesData || [])

      } catch (err) {
        console.error('Error fetching invited trip:', err)
        setError('Failed to load trip')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitedTrip()
  }, [tripId])

  const processInvitation = async (authUser) => {
    // inviteProcessed is async state; processingRef guards against the effect
    // firing twice (user and trip resolving in the same tick) before the state
    // commit lands, which would otherwise double-insert the trip_shares row.
    if (!tripId || inviteProcessed || processingRef.current) return
    processingRef.current = true

    try {
      // Create trip_shares record if user is logged in
      const { error: shareError } = await supabase
        .from('trip_shares')
        .insert({
          trip_id: tripId,
          shared_by: trip?.user_id,
          shared_with: authUser.id,
          share_type: 'email'
        })

      if (shareError) {
        // Check if it's a duplicate (user already has access)
        if (shareError.code !== '23505') { // Not a unique constraint violation
          console.error('Error processing invitation:', shareError)
        }
      }

      // Mark invitation as processed
      setInviteProcessed(true)

      // Update pending_shares if this was from an email invitation
      if (email) {
        const { error: pendingError } = await supabase
          .from('pending_shares')
          .update({
            claimed: true,
            claimed_by: authUser.id
          })
          .eq('trip_id', tripId)
          .eq('recipient_email', email)

        if (pendingError) {
          console.error('Error updating pending share:', pendingError)
        }
      }

      // Redirect to dashboard with success message
      // (the dashboard renders at '/', there is no '/dashboard' route)
      setTimeout(() => {
        router.push('/')
      }, 1000)

    } catch (err) {
      processingRef.current = false // allow a retry if processing failed
      console.error('Error processing invitation:', err)
    }
  }

  const handleAuthSuccess = async (authUser) => {
    setShowAuth(false)
    // Just set the user; the effect above processes the invitation once both
    // the user and the trip are loaded (avoids a shared_by race / double-insert).
    if (authUser) {
      setUser(authUser)
    } else {
      // Fallback: re-check auth state
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) setUser(currentUser)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryIcon = (categoryName) => {
    const icons = {
      accommodation: '🏨',
      restaurant: '🍽️',
      airline: '✈️',
      rental: '🚗',
      default: '📍'
    }
    return icons[categoryName?.toLowerCase()] || icons.default
  }

  const renderRating = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4DB8BA] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/">
              <Button className="w-full">
                Back to Tucker Trips
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (inviteProcessed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8">
          <CardContent className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
            <p className="text-gray-600 mb-6">
              You've successfully joined the trip! Redirecting to your dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4DB8BA] mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                <Mail className="w-4 h-4" />
                <span>Invitation</span>
              </div>

              {user ? (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Signed in
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
                >
                  Sign Up to Accept
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Invitation Banner */}
        <div className="bg-gradient-to-r from-[#4DB8BA]/20 to-[#ec4899]/20 border-2 border-[#4DB8BA]/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-gradient-to-r from-[#4DB8BA] to-[#ec4899] text-white mb-2">
                🎉 You're Invited!
              </Badge>
              <h1 className="text-2xl font-bold text-[#3a4d6f] mb-2">
                Join This Trip Experience
              </h1>
              <p className="text-gray-600">
                You've been invited to view detailed trip information by{' '}
                <strong>{trip.profiles?.full_name || trip.profiles?.email || 'a Tucker Trips member'}</strong>
                {email && (
                  <span> (sent to {email})</span>
                )}
              </p>
            </div>

            {!user && (
              <Button
                onClick={() => setShowAuth(true)}
                size="lg"
                className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
              >
                Accept Invitation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Trip Preview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Badge variant="outline" className="mb-3">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Badge>
              <h2 className="text-2xl font-bold text-[#3a4d6f] mb-2">
                {trip.trip_name}
              </h2>
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
                  <span>- {formatDate(trip.end_date)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Full details available after signup</span>
            </div>
          </div>

          {/* Trip Categories Preview */}
          {tripCategories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#3a4d6f] mb-4">What's Included:</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {tripCategories.slice(0, 4).map((category, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{getCategoryIcon(category.category_name)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-[#3a4d6f] capitalize">
                        {category.category_name}
                      </h4>
                      {category.rating && (
                        <div className="flex items-center gap-1">
                          {renderRating(category.rating)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {tripCategories.length > 4 && (
                <p className="text-center text-gray-500 text-sm">
                  +{tripCategories.length - 4} more categories available
                </p>
              )}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-[#ff34ac]/10 to-[#7dbbe5]/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#3a4d6f] mb-4">
              Ready to Explore More?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join Tucker Trips to see all the trip details, ask questions, and start documenting your own adventures.
              Get real travel advice from people you actually trust!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user && (
                <Button
                  onClick={() => setShowAuth(true)}
                  size="lg"
                  className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
                >
                  Sign Up & View Trip
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              <Link href="/">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2024 Tucker Trips. Real trips. Real friends. Real trust.</p>
          </div>
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
