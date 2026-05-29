'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOut, Lock, Crown, Users, TrendingUp, Zap, BarChart3, Save, Plus, Minus, Edit2, MousePointerClick } from 'lucide-react'

export default function SecureSuperAdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [counters, setCounters] = useState({
    totalUsers: 0,
    activeBookings: 0,
    revenue: 0,
    reviews: 0
  })
  const [editedCounters, setEditedCounters] = useState({
    totalUsers: 0,
    activeBookings: 0,
    revenue: 0,
    reviews: 0
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [signupClicks, setSignupClicks] = useState(0)
  const [recentClicks, setRecentClicks] = useState(0)

  // Fetch counters from API
  const fetchCounters = async () => {
    try {
      const response = await fetch('/api/admin/counters', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin-login')
          return
        }
        throw new Error('Failed to fetch counters')
      }

      const data = await response.json()
      const countersData = data.counters || {
        totalUsers: 0,
        activeBookings: 0,
        revenue: 0,
        reviews: 0
      }
      setCounters(countersData)
      setEditedCounters(countersData)
      setHasChanges(false)
    } catch (error) {
      console.error('Error fetching counters:', error)
      toast.error('Failed to load counters')
    } finally {
      setLoading(false)
    }
  }

  const fetchSignupClicks = async () => {
    try {
      const response = await fetch('/api/admin/users/stats', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin-login')
          return
        }
        throw new Error('Failed to fetch sign-up clicks')
      }

      const data = await response.json()
      setSignupClicks(data.signupClicks || 0)
      setRecentClicks(data.recentClicks || 0)
    } catch (error) {
      console.error('Error fetching sign-up clicks:', error)
    }
  }

  useEffect(() => {
    fetchCounters()
    fetchSignupClicks()
    const interval = setInterval(fetchCounters, 10000) // Refresh every 10 seconds
    const statsInterval = setInterval(fetchSignupClicks, 10000)

    return () => {
      clearInterval(interval)
      clearInterval(statsInterval)
    }
  }, [])

  const handleCounterChange = (key, value) => {
    const numValue = Math.max(0, Number(value) || 0)
    setEditedCounters(prev => ({
      ...prev,
      [key]: numValue
    }))
    setHasChanges(true)
  }

  const incrementCounter = (key) => {
    handleCounterChange(key, editedCounters[key] + 1)
  }

  const decrementCounter = (key) => {
    handleCounterChange(key, Math.max(0, editedCounters[key] - 1))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/counters', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ counters: editedCounters }),
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin-login')
          return
        }
        throw new Error('Failed to save counters')
      }

      setCounters(editedCounters)
      setHasChanges(false)
      toast.success('Counters updated successfully!')
    } catch (error) {
      console.error('Error saving counters:', error)
      toast.error('Failed to save counters')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await fetch('/api/admin/login', {
        method: 'DELETE',
        credentials: 'include'
      })
      toast.success('Logged out successfully')
      router.push('/admin-login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    } finally {
      setLogoutLoading(false)
    }
  }

  const EditableCounterCard = ({ icon: Icon, label, key: counterKey, value }) => (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 hover:border-gray-700/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30">
          <Icon className="w-6 h-6 text-amber-400" />
        </div>
        <Edit2 className="w-4 h-4 text-gray-600" />
      </div>
      <p className="text-gray-400 text-sm mb-4">{label}</p>

      {/* Input with increment/decrement buttons */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => decrementCounter(counterKey)}
            className="p-2 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 transition-all"
            disabled={saving}
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={value}
            onChange={(e) => handleCounterChange(counterKey, e.target.value)}
            disabled={saving}
            className="flex-1 h-12 px-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white font-semibold text-center focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => incrementCounter(counterKey)}
            className="p-2 rounded-lg bg-green-600/20 border border-green-600/30 text-green-400 hover:bg-green-600/30 transition-all"
            disabled={saving}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-red-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(180,83,9,0.05),transparent_50%)]" />
      </div>

      {/* Grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Floating orbs */}
      <div className="fixed top-32 left-20 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
      <div className="fixed top-60 right-40 w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping delay-300" />
      <div className="fixed bottom-40 left-32 w-2 h-2 bg-red-500 rounded-full animate-ping delay-700" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 shadow-lg shadow-amber-500/20">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Dashboard</h1>
                <p className="text-gray-500 text-sm">Full Edit Access • Tucker Trips</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-amber-500/30"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="px-4 py-2 rounded-xl bg-gray-900/50 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{logoutLoading ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Manage Counters</h2>
            <p className="text-gray-400">Edit all 4 platform metrics. Changes are saved immediately.</p>
          </div>

          {/* Counters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <EditableCounterCard
              icon={Users}
              label="Total Users"
              key="totalUsers"
              value={editedCounters.totalUsers}
            />
            <EditableCounterCard
              icon={TrendingUp}
              label="Active Bookings"
              key="activeBookings"
              value={editedCounters.activeBookings}
            />
            <EditableCounterCard
              icon={BarChart3}
              label="Revenue ($)"
              key="revenue"
              value={editedCounters.revenue}
            />
            <EditableCounterCard
              icon={Zap}
              label="Reviews"
              key="reviews"
              value={editedCounters.reviews}
            />
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 hover:border-gray-700/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-fuchsia-600/20 to-pink-600/20 border border-fuchsia-500/30">
                  <MousePointerClick className="w-6 h-6 text-fuchsia-400" />
                </div>
                <div className="px-2 py-1 rounded-full bg-gray-800 text-[10px] font-medium tracking-wide text-gray-400">
                  Live
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">Login / Sign-Up Clicks</p>
              <div className="space-y-3">
                <div className="h-12 flex items-center justify-center rounded-lg bg-gray-800/50 border border-gray-700 text-2xl font-bold text-white">
                  {loading ? '...' : signupClicks.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">Direct total from tracked button clicks</p>
              </div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 hover:border-gray-700/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-sky-600/20 to-cyan-600/20 border border-sky-500/30">
                  <TrendingUp className="w-6 h-6 text-sky-400" />
                </div>
                <div className="px-2 py-1 rounded-full bg-gray-800 text-[10px] font-medium tracking-wide text-gray-400">
                  7D
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">Recent Sign-Up Clicks</p>
              <div className="space-y-3">
                <div className="h-12 flex items-center justify-center rounded-lg bg-gray-800/50 border border-gray-700 text-2xl font-bold text-white">
                  {loading ? '...' : recentClicks.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">Tracked clicks from the last 7 days</p>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-amber-900/20 border border-amber-800/50 rounded-xl p-4 flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200 font-medium mb-1">Super Admin Access</p>
              <p className="text-amber-300/70 text-sm">You have full edit access to all counters. Use the +/- buttons or type directly to adjust values. Click "Save Changes" to apply updates.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
