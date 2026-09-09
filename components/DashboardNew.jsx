'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase.js'
import { SAMPLE_TRIPS } from '@/constants/sample-data'
import TripCard from '@/components/TripCard'
import DiscoverTripCard from '@/components/DiscoverTripCard'
import FutureTripCard from '@/components/FutureTripCard'
import SharedTripCard from '@/components/SharedTripCard'
import MyTripCard from '@/components/MyTripCard'
import TripCreationForm from '@/components/TripCreationForm'
import TripDetailView from '@/components/TripDetailView'
import ShareTripModal from '@/components/ShareTripModal'
import DashboardSidebar from '@/components/DashboardSidebar'
import MessagesSection from '@/components/messaging/MessagesSection'
import ProfileEditModal from '@/components/ProfileEditModal'
import {
  EmptyTripsState,
  EmptyFutureTripsState,
  EmptySharedTripsState,
  TripCreationReminder
} from '@/components/EmptyStates'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Map,
  Clock,
  Compass,
  Share2 as ShareIcon,
  Home,
  User,
  LogOut,
  Sun,
  Moon,
  MapPin,
  Copy,
  Camera,
  ArrowRight
} from 'lucide-react'

const Dashboard = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState(initialUser)
  const [activeSection, setActiveSection] = useState('home')
  const [myTrips, setMyTrips] = useState([])
  const [futureTrips, setFutureTrips] = useState([])
  const [publicTrips, setPublicTrips] = useState([])
  const [sharedTrips, setSharedTrips] = useState([])
  const [showNewTripModal, setShowNewTripModal] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [showTripDetail, setShowTripDetail] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [tripToShare, setTripToShare] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tripsLoading, setTripsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  // Mobile drawer starts closed; the desktop sidebar starts expanded so the
  // navigation labels are readable without hovering.
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [copiedTrip, setCopiedTrip] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTrip, setEditingTrip] = useState(null)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('dashboard_theme')
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark')
    } else {
      // Default to light mode if no preference is saved
      setDarkMode(false)
    }
  }, [])

  // Save theme preference
  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('dashboard_theme', newMode ? 'dark' : 'light')
  }

  // Load sidebar preference. Read after mount so the server-rendered markup
  // and the first client render agree.
  useEffect(() => {
    setSidebarCollapsed(localStorage.getItem('dashboard_sidebar') === 'collapsed')
  }, [])

  // Save sidebar preference
  const handleToggleSidebarCollapsed = (nextCollapsed) => {
    setSidebarCollapsed(nextCollapsed)
    localStorage.setItem('dashboard_sidebar', nextCollapsed ? 'collapsed' : 'expanded')
  }

  // Theme classes
  const theme = {
    bg: darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    sidebar: darkMode ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-200 shadow-lg',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-600',
    cardBg: darkMode ? 'bg-gradient-to-br from-pink-900/30 to-pink-800/20 border border-pink-700/30' : 'bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200',
    cardBg2: darkMode ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
    cardBg3: darkMode ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-700/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200',
    navActive: darkMode ? 'bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white' : 'bg-gradient-to-r from-pink-500 to-blue-500 text-white',
    navInactive: darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100',
    icon: darkMode ? 'text-pink-400' : 'text-pink-400',
    icon2: darkMode ? 'text-blue-400' : 'text-blue-400',
    icon3: darkMode ? 'text-purple-400' : 'text-purple-400',
    topBar: darkMode ? 'bg-gray-900/95 border-b border-gray-700' : 'bg-white/95 border-b border-gray-200',
    emptyIcon: darkMode ? 'text-gray-700' : 'text-gray-300',
  }

  const normalizeTrip = (trip) => {
    const normalizedType = trip.trip_type || trip.status || 'future'
    const coverPhoto = trip.cover_image || trip.cover_photo_url || trip.cover_photo || null

    return {
      ...trip,
      title: trip.trip_name || trip.title || 'Untitled trip',
      trip_name: trip.trip_name || trip.title || 'Untitled trip',
      status: normalizedType,
      trip_type: normalizedType,
      cover_photo: coverPhoto,
      cover_photo_url: coverPhoto,
      cover_image: coverPhoto,
      is_shared: trip.is_shared ?? (Array.isArray(trip.shared_with) ? trip.shared_with.length > 0 : false),
    }
  }

  // Fetch trips based on status (My Trips and Future Trips - owned by user)
  const fetchTripsByStatus = async () => {
    setTripsLoading(true)
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          profiles:profiles(id, full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const trips = (data || []).map(normalizeTrip)

      // Categorize trips based on status field (check both status and trip_type for compatibility)
      const tripsTaken = trips.filter(trip => trip.status === 'taken')
      const futureTrips = trips.filter(trip => trip.status === 'future')

      setMyTrips(tripsTaken)
      setFutureTrips(futureTrips)

    } catch (error) {
      console.error('Error fetching trips:', error)
      toast.error('Failed to load trips')
      setMyTrips([])
      setFutureTrips([])
    } finally {
      setTripsLoading(false)
    }
  }

  // Fetch trips shared WITH the current user (not BY the user)
  const fetchSharedTrips = async () => {
    try {
      // First, get trip IDs from trip_shares table
      const { data: shareData, error: shareError } = await supabase
        .from('trip_shares')
        .select('trip_id')
        .eq('shared_with', user.id)

      if (shareError) {
        console.warn('Error fetching trip shares, table may not exist:', shareError)
        setSharedTrips([])
        return
      }

      if (!shareData || shareData.length === 0) {
        setSharedTrips([])
        return
      }

      const tripIds = shareData.map(share => share.trip_id)

      // Then fetch the actual trips
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .in('id', tripIds)
        .order('created_at', { ascending: false })

      if (error) throw error

      const sharedTrips = (data || []).map(normalizeTrip)
      setSharedTrips(sharedTrips)

    } catch (error) {
      console.error('Error fetching shared trips:', error)
      setSharedTrips([])
    }
  }

  // Helper function to maintain compatibility
  const fetchMyTrips = () => fetchTripsByStatus()

  // Helper function to maintain compatibility
  const fetchFutureTrips = () => fetchTripsByStatus()

  // Generate sample trips for testing when no real data exists
  const generateSampleTrips = () => {
    console.log('Generated sample trips for testing:', SAMPLE_TRIPS)
    return SAMPLE_TRIPS.map(normalizeTrip)
  }

  // Fetch public trips for discover section
  const fetchPublicTrips = async () => {
    try {
      // Build query for public trips
      let query = supabase
        .from('trips')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20)

      const { data, error } = await query

      if (error) {
        console.error('Error fetching public trips:', error)
        // Use sample data on error
        setPublicTrips(generateSampleTrips())
        return
      }

      // Use sample data if no public trips exist
      if (!data || data.length === 0) {
        console.log('No public trips found, using sample data')
        setPublicTrips(generateSampleTrips())
      } else {
        setPublicTrips(data.map(normalizeTrip))
      }
    } catch (error) {
      console.error('Error fetching public trips:', error)
      // Use sample data on error to avoid breaking the UI
      setPublicTrips(generateSampleTrips())
    }
  }

  const handleTripCreated = () => {
    fetchTripsByStatus()
    fetchSharedTrips()
    fetchPublicTrips()
  }

  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip?')) return

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)

      if (error) throw error

      toast.success('Trip deleted successfully')
      fetchTripsByStatus()
    } catch (error) {
      console.error('Error deleting trip:', error)
      toast.error('Failed to delete trip')
    }
  }

  const handleShareTrip = async (trip) => {
    // Sharing only inserts into trip_shares via the ShareTripModal.
    // Visibility remains exactly as originally stored - sharing does NOT modify privacy.
    // Private trips can be shared via email (direct share) without becoming public.
    // Public trips can additionally be shared via social media links.

    try {
      // Mark trip as shared (flag only, does NOT change visibility)
      const { error } = await supabase
        .from('trips')
        .update({
          is_shared: true,
          shared_at: new Date().toISOString()
        })
        .eq('id', trip.id)

      if (error) {
        console.error('Error marking trip as shared:', error)
        // Don't block the share modal from opening
      }

      // Set trip to share and open modal - visibility stays unchanged
      setTripToShare({ ...trip, is_shared: true })
      setShowShareModal(true)
    } catch (error) {
      console.error('Error sharing trip:', error)
      toast.error('Failed to share trip')
    }
  }

  const handleUnshareTrip = async (tripId) => {
    if (!confirm('Are you sure you want to unshare this trip? This will revoke access for all shared users.')) return

    try {
      // 1. Delete all rows from trip_shares for this trip
      const { error: sharesError } = await supabase
        .from('trip_shares')
        .delete()
        .eq('trip_id', tripId)

      if (sharesError) {
        console.error('Error deleting trip_shares:', sharesError)
        // Continue even if trip_shares table doesn't exist yet
      }

      // 2. Delete all rows from pending_shares for this trip (if table exists)
      try {
        const { error: pendingError } = await supabase
          .from('pending_shares')
          .delete()
          .eq('trip_id', tripId)

        if (pendingError) {
          console.error('Error deleting pending_shares:', pendingError)
          // Non-critical: pending_shares table may not exist
        }
      } catch (pendingErr) {
        console.warn('pending_shares table may not exist:', pendingErr)
      }

      // 3. Clear is_shared and shared_at flags on the trip
      const { error: updateError } = await supabase
        .from('trips')
        .update({
          is_shared: false,
          shared_at: null
        })
        .eq('id', tripId)

      if (updateError) throw updateError

      toast.success('Trip unshared successfully. All shared access has been revoked.')
      fetchTripsByStatus()
      fetchSharedTrips()
    } catch (error) {
      console.error('Error unsharing trip:', error)
      toast.error('Failed to unshare trip')
    }
  }

  const handleTripClick = (trip) => {
    setSelectedTrip(trip)
    setShowTripDetail(true)
  }

  const handleShareClick = (trip) => {
    setTripToShare(trip)
    setShowShareModal(true)
  }

  const handleMessage = (trip) => {
    setActiveSection('messages')
  }

  const handleCopyTrip = (trip) => {
    setCopiedTrip(trip)
    setShowNewTripModal(true)
  }

  const handleEditTrip = (trip) => {
    setEditingTrip(trip)
    setShowEditModal(true)
  }

  const handleUpdateTripStatus = async (tripId, newStatus) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('trips')
        .update({ trip_type: newStatus, updated_at: new Date().toISOString() })
        .eq('id', tripId)

      if (error) throw error

      toast.success(`Trip marked as ${newStatus === 'taken' ? 'completed' : newStatus}!`)
      fetchTripsByStatus()
    } catch (error) {
      console.error('Error updating trip status:', error)
      toast.error('Failed to update trip status')
    } finally {
      setLoading(false)
    }
  }

  const handleTripUpdated = (updatedTrip) => {
    // Refresh all trip data after update
    fetchTripsByStatus()
    fetchSharedTrips()
    fetchPublicTrips()
  }

  const handleEditProfile = () => {
    setShowProfileModal(true)
  }

  const handleProfileUpdated = (updatedProfile) => {
    // Merge profile data with existing user state so that user_metadata is properly updated
    setUser(prevUser => ({
      ...prevUser,
      // Update user_metadata with the new profile info
      user_metadata: {
        ...prevUser?.user_metadata,
        full_name: updatedProfile.full_name || updatedProfile.fullName || prevUser?.user_metadata?.full_name,
        avatar_url: updatedProfile.avatar_url || updatedProfile.avatarUrl || prevUser?.user_metadata?.avatar_url,
      },
      // Also store profile data at root level for components that access it directly
      full_name: updatedProfile.full_name || updatedProfile.fullName,
      bio: updatedProfile.bio,
      avatar_url: updatedProfile.avatar_url || updatedProfile.avatarUrl,
      cover_photo_url: updatedProfile.cover_photo_url || updatedProfile.coverPhotoUrl,
    }))
  }

  const fetchUnreadMessageCount = async () => {
    if (!user?.id) return
    try {
      const { data, error } = await supabase.rpc('get_unread_message_count', { user_uuid: user.id })
      if (!error) setUnreadMessageCount(data || 0)
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchTripsByStatus()
      fetchSharedTrips()
      fetchPublicTrips()
      fetchUnreadMessageCount()
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`trip_shares_for_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_shares',
          filter: `shared_with=eq.${user.id}`,
        },
        () => {
          fetchSharedTrips()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return

    const msgChannel = supabase
      .channel(`unread_messages_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadMessageCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(msgChannel)
    }
  }, [user?.id])

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${theme.text}`}>
                  Welcome back, {user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
                </h1>
                <p className={`${theme.textSecondary} mt-2`}>Ready to log your next adventure?</p>
              </div>
              <Button
                onClick={() => setShowNewTripModal(true)}
                className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Trip Log
              </Button>
            </div>

            {/* Show reminder if user has no trips */}
            {(myTrips.length === 0 && futureTrips.length === 0) && (
              <TripCreationReminder
                onCreateTrip={() => setShowNewTripModal(true)}
                darkMode={darkMode}
              />
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${theme.cardBg} rounded-2xl p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme.textSecondary}`}>Trips Taken</p>
                    <p className={`text-3xl font-bold ${theme.text} mt-1`}>{myTrips.length}</p>
                  </div>
                  <Map className={`w-12 h-12 ${theme.icon}`} />
                </div>
              </div>

              <div className={`${theme.cardBg2} rounded-2xl p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme.textSecondary}`}>Future Plans</p>
                    <p className={`text-3xl font-bold ${theme.text} mt-1`}>{futureTrips.length}</p>
                  </div>
                  <Clock className={`w-12 h-12 ${theme.icon2}`} />
                </div>
              </div>

              <div className={`${theme.cardBg3} rounded-2xl p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme.textSecondary}`}>Public Trips</p>
                    <p className={`text-3xl font-bold ${theme.text} mt-1`}>{publicTrips.length}</p>
                  </div>
                  <Compass className={`w-12 h-12 ${theme.icon3}`} />
                </div>
              </div>
            </div>

            {/* Recent Trips */}
            {tripsLoading ? (
              <div>
                <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Recent Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`rounded-2xl overflow-hidden animate-pulse ${darkMode ? 'bg-[#343f65]/60' : 'bg-gray-100'}`}>
                      <div className={`h-48 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className="p-6 space-y-3">
                        <div className={`h-4 rounded w-3/4 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <div className={`h-6 rounded w-1/2 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                        <div className={`h-4 rounded w-2/3 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : myTrips.length > 0 ? (
              <div>
                <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Recent Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTrips.slice(0, 3).map((trip) => (
                    <MyTripCard
                      key={trip.id}
                      trip={trip}
                      onClick={() => handleTripClick(trip)}
                      onEdit={() => handleEditTrip(trip)}
                      onDelete={() => handleDeleteTrip(trip.id)}
                      onShare={() => handleShareTrip(trip)}
                      onUnshare={() => handleUnshareTrip(trip.id)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )

      case 'mytrips':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>My Trips Taken</h1>
              <Button
                onClick={() => setShowNewTripModal(true)}
                className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Trip
              </Button>
            </div>

            {tripsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`rounded-2xl overflow-hidden animate-pulse ${darkMode ? 'bg-[#343f65]/60' : 'bg-gray-100'}`}>
                    <div className={`h-48 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                    <div className="p-6 space-y-3">
                      <div className={`h-4 rounded w-3/4 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className={`h-6 rounded w-1/2 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className={`h-4 rounded w-2/3 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : myTrips.length === 0 ? (
              <EmptyTripsState
                onCreateTrip={() => setShowNewTripModal(true)}
                darkMode={darkMode}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTrips.map((trip) => (
                  <MyTripCard
                    key={trip.id}
                    trip={trip}
                    onClick={() => handleTripClick(trip)}
                    onEdit={() => handleEditTrip(trip)}
                    onDelete={() => handleDeleteTrip(trip.id)}
                    onShare={() => handleShareTrip(trip)}
                    onUnshare={() => handleUnshareTrip(trip.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'future':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className={`text-3xl font-bold ${theme.text}`}>Future Trips</h1>
              <Button
                onClick={() => setShowNewTripModal(true)}
                className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Plan Trip
              </Button>
            </div>

            {tripsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`rounded-2xl overflow-hidden animate-pulse ${darkMode ? 'bg-[#343f65]/60' : 'bg-gray-100'}`}>
                    <div className={`h-48 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                    <div className="p-6 space-y-3">
                      <div className={`h-4 rounded w-3/4 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className={`h-6 rounded w-1/2 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className={`h-4 rounded w-2/3 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : futureTrips.length === 0 ? (
              <EmptyFutureTripsState
                onPlanTrip={() => setShowNewTripModal(true)}
                darkMode={darkMode}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {futureTrips.map((trip) => (
                    <FutureTripCard
                      key={trip.id}
                      trip={trip}
                      onClick={() => handleTripClick(trip)}
                      onEdit={() => handleEditTrip(trip)}
                      onDelete={() => handleDeleteTrip(trip.id)}
                      onShare={() => handleShareTrip(trip)}
                      onComplete={() => handleUpdateTripStatus(trip.id, 'taken')}
                    />
                ))}
              </div>
            )}
          </div>
        )

      case 'shared':
        return (
          <div className="space-y-6">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${theme.text}`}>Shared with Me</h1>
              <p className={theme.textSecondary}>Trips that friends have shared with you</p>
            </div>

            {tripsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`rounded-2xl overflow-hidden animate-pulse ${darkMode ? 'bg-[#343f65]/60' : 'bg-gray-100'}`}>
                    <div className={`h-48 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                    <div className="p-6 space-y-3">
                      <div className={`h-4 rounded w-3/4 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className={`h-6 rounded w-1/2 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      <div className={`h-4 rounded w-2/3 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : sharedTrips.length === 0 ? (
              <EmptySharedTripsState
                onCreateTrip={() => setShowNewTripModal(true)}
                darkMode={darkMode}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedTrips.map((trip) => (
                  <SharedTripCard
                    key={trip.id}
                    trip={trip}
                    onClick={() => handleTripClick(trip)}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'messages':
        return (
          <div className="space-y-6">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${theme.text}`}>Messages</h1>
              <p className={theme.textSecondary}>Chat with other travelers</p>
            </div>
            <MessagesSection user={user} darkMode={darkMode} onUnreadChange={fetchUnreadMessageCount} />
          </div>
        )

      case 'discover':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7dbbe5]/10 via-[#ff34ac]/10 to-[#4DB8BA]/10 p-8 border border-white/10">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff34ac]/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7dbbe5]/20 rounded-full blur-3xl"></div>

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Compass className="w-8 h-8 text-[#ff34ac]" />
                  <h1 className={`text-5xl font-bold bg-gradient-to-r from-[#7dbbe5] via-[#ff34ac] to-[#4DB8BA] bg-clip-text text-transparent`}>
                    Discover Trips
                  </h1>
                </div>
                <p className={`text-xl ${theme.textSecondary} max-w-2xl mx-auto`}>
                  Explore real travel experiences shared by our community. Get inspired by authentic trip logs from people you can trust.
                </p>

                {/* Stats */}
                <div className="flex justify-center gap-8 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#ff34ac]">{publicTrips.length}</div>
                    <div className={`text-sm ${theme.textSecondary}`}>Public Trips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#7dbbe5]">∞</div>
                    <div className={`text-sm ${theme.textSecondary}`}>Destinations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#4DB8BA]">100%</div>
                    <div className={`text-sm ${theme.textSecondary}`}>Real Reviews</div>
                  </div>
                </div>
              </div>
            </div>

            {publicTrips.length === 0 ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7dbbe5]/5 via-[#ff34ac]/5 to-[#4DB8BA]/5 p-16 border border-white/10">
                {/* Animated background elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-[#ff34ac]/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-10 left-10 w-40 h-40 bg-[#7dbbe5]/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#4DB8BA]/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-10 text-center">
                  <div className="relative inline-block mb-8">
                    <Compass className={`w-24 h-24 mx-auto ${theme.emptyIcon}`} />
                    {/* Rotating ring */}
                    <div className="absolute inset-0 border-4 border-[#ff34ac]/20 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-2 border-[#7dbbe5]/20 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
                  </div>

                  <h2 className={`text-4xl font-bold mb-4 bg-gradient-to-r from-[#7dbbe5] to-[#ff34ac] bg-clip-text text-transparent`}>
                    No Public Trips Yet
                  </h2>
                  <p className={`text-xl ${theme.textSecondary} mb-8 max-w-md mx-auto`}>
                    Be the first to share your amazing travel experiences with the community!
                  </p>

                  <Button
                    onClick={() => setShowNewTripModal(true)}
                    className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] hover:from-[#e62d95] hover:to-[#6bcfd1] text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-[#ff34ac]/40 transition-all duration-300 transform hover:scale-105"
                  >
                    Share Your First Trip
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Featured Trip */}
                {publicTrips.length > 0 && (
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-px bg-gradient-to-r from-transparent via-[#ff34ac] to-transparent flex-1"></div>
                      <h2 className={`text-3xl font-bold bg-gradient-to-r from-[#7dbbe5] via-[#ff34ac] to-[#4DB8BA] bg-clip-text text-transparent`}>
                        ✨ Featured Trip
                      </h2>
                      <div className="h-px bg-gradient-to-r from-transparent via-[#ff34ac] to-transparent flex-1"></div>
                    </div>

                    <div className="relative group">
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#ff34ac]/20 to-[#7dbbe5]/20 rounded-3xl blur-xl group-hover:from-[#ff34ac]/30 group-hover:to-[#7dbbe5]/30 transition-all duration-500"></div>

                      <div className="relative aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-[#7dbbe5]/10 to-[#ff34ac]/10 border border-white/20">
                        {publicTrips[0].cover_photo_url || (publicTrips[0].photo_urls && publicTrips[0].photo_urls.length > 0) ? (
                          <img
                            src={publicTrips[0].cover_photo_url || publicTrips[0].photo_urls[0]}
                            alt={publicTrips[0].trip_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7dbbe5]/20 to-[#ff34ac]/20">
                            <Camera className={`w-24 h-24 ${theme.emptyIcon} animate-pulse`} />
                          </div>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                        {/* Floating particles */}
                        <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full animate-ping"></div>
                        <div className="absolute bottom-8 left-8 w-3 h-3 bg-[#ff34ac]/60 rounded-full animate-pulse"></div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                              publicTrips[0].trip_type === 'taken'
                                ? 'bg-[#7dbbe5]/20 text-[#7dbbe5]'
                                : 'bg-[#ff34ac]/20 text-[#ff34ac]'
                            }`}>
                              {publicTrips[0].trip_type === 'taken' ? 'Trip Taken' : 'Future Trip'}
                            </span>
                            <span className={`text-sm ${theme.textSecondary}`}>
                              {new Date(publicTrips[0].created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <h3 className={`text-3xl font-bold text-white mb-2`}>{publicTrips[0].trip_name}</h3>
                          <div className={`flex items-center gap-2 ${theme.textSecondary} mb-4`}>
                            <MapPin className="w-5 h-5" />
                            <span className="text-lg">{publicTrips[0].destination}</span>
                          </div>
                          {publicTrips[0].trip_categories && publicTrips[0].trip_categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {publicTrips[0].trip_categories.slice(0, 3).map((category) => (
                                <span
                                  key={category.id}
                                  className="text-xs px-2 py-1 rounded-full bg-white/20 text-white capitalize"
                                >
                                  {category.category_name}
                                </span>
                              ))}
                              {publicTrips[0].trip_categories.length > 3 && (
                                <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white">
                                  +{publicTrips[0].trip_categories.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="absolute top-6 right-6 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Share functionality for featured trip
                            }}
                            className="group relative p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-all duration-300 border border-white/20"
                            title="Share this trip"
                          >
                            <ShareIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 rounded-full bg-white/20 group-hover:scale-150 scale-0 transition-transform duration-300"></div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopyTrip(publicTrips[0])
                            }}
                            className="group relative p-3 bg-gradient-to-r from-[#ff34ac]/80 to-[#7dbbe5]/80 backdrop-blur-sm hover:from-[#ff34ac] hover:to-[#7dbbe5] rounded-full transition-all duration-300 border border-white/20 shadow-lg"
                            title="Copy this trip"
                          >
                            <Copy className="w-5 h-5 text-white group-hover:rotate-6 transition-transform" />
                            <div className="absolute inset-0 rounded-full bg-white/30 group-hover:scale-150 scale-0 transition-transform duration-300"></div>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTripClick(publicTrips[0])}
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>
                  </div>
                )}

                {/* Recent Public Trips */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#4DB8BA] to-transparent flex-1"></div>
                    <h2 className={`text-3xl font-bold bg-gradient-to-r from-[#ff34ac] via-[#4DB8BA] to-[#7dbbe5] bg-clip-text text-transparent`}>
                      🌍 Explore More Trips
                    </h2>
                    <div className="h-px bg-gradient-to-r from-transparent via-[#4DB8BA] to-transparent flex-1"></div>
                  </div>

                  {/* Filter pills for future enhancement */}
                  <div className="flex gap-2 mb-6 flex-wrap justify-center">
                    <span className="px-4 py-2 bg-gradient-to-r from-[#ff34ac]/20 to-[#7dbbe5]/20 border border-[#ff34ac]/30 rounded-full text-white text-sm">
                      🔥 Trending
                    </span>
                    <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm hover:bg-white/20 cursor-pointer transition-all">
                      🌟 Top Rated
                    </span>
                    <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm hover:bg-white/20 cursor-pointer transition-all">
                      ✨ Recent
                    </span>
                    <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm hover:bg-white/20 cursor-pointer transition-all">
                      🗺️ All Destinations
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {publicTrips.slice(1).map((trip) => (
                      <DiscoverTripCard
                        key={trip.id}
                        trip={trip}
                        onClick={() => handleTripClick(trip)}
                        onCopy={handleCopyTrip}
                      />
                    ))}
                  </div>

                  {/* Load more button placeholder */}
                  {publicTrips.length > 5 && (
                    <div className="text-center mt-8">
                      <Button
                        variant="outline"
                        className="bg-white/10 border-2 border-white/20 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                      >
                        Load More Trips
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen ${theme.bg} flex`}>
      {/* Collapsible Sidebar */}
      <DashboardSidebar
        user={user}
        activeSection={activeSection}
        onNavigate={(section) => {
          setActiveSection(section)
          if (section === 'messages') fetchUnreadMessageCount()
        }}
        onLogout={onLogout}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={handleToggleSidebarCollapsed}
        onEditProfile={handleEditProfile}
        unreadMessageCount={unreadMessageCount}
      />

      {/* Main Content - margin tracks the sidebar width so the two never overlap */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
        {/* Content Area */}
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {renderContent()}
        </div>
      </div>

      {/* Trip Creation Modal */}
      <TripCreationForm
        open={showNewTripModal}
        onClose={() => {
          setShowNewTripModal(false)
          setCopiedTrip(null) // Clear copied trip when modal closes
        }}
        onTripCreated={handleTripCreated}
        copiedTrip={copiedTrip}
      />

      {/* Trip Edit Modal */}
      <TripCreationForm
        open={showEditModal}
        mode="edit"
        initialData={editingTrip}
        onClose={() => {
          setShowEditModal(false)
          setEditingTrip(null)
        }}
        onTripUpdated={handleTripUpdated}
      />

      {/* Trip Detail View */}
      <TripDetailView
        trip={selectedTrip}
        open={showTripDetail}
        onClose={() => {
          setShowTripDetail(false)
          setSelectedTrip(null)
        }}
        onShare={handleShareClick}
        isOwner={selectedTrip?.user_id === user?.id}
      />

      {/* Share Trip Modal */}
      <ShareTripModal
        trip={tripToShare}
        open={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          setTripToShare(null)
        }}
        currentUser={user}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdate={handleProfileUpdated}
      />

    </div>
  )
}

export default Dashboard
