'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { LogOut, Lock, Eye, Users, TrendingUp, Zap, ArrowUpRight, BarChart3, MousePointerClick } from 'lucide-react'

export default function SecureAdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [counters, setCounters] = useState({
    totalUsers: 0,
    activeBookings: 0,
    revenue: 0,
    reviews: 0
  })
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
      setCounters(data.counters || {
        totalUsers: 0,
        activeBookings: 0,
        revenue: 0,
        reviews: 0
      })
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
    const interval = setInterval(fetchCounters, 5000) // Refresh every 5 seconds
    const statsInterval = setInterval(fetchSignupClicks, 10000)

    return () => {
      clearInterval(interval)
      clearInterval(statsInterval)
    }
  }, [])

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

  const CounterCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-6 hover:border-gray-700/50 transition-all ${color}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${color === 'purple-glow' ? 'from-purple-600/20 to-pink-600/20 border border-purple-500/30' : 'from-blue-600/20 to-cyan-600/20 border border-blue-500/30'}`}>
          <Icon className={`w-6 h-6 ${color === 'purple-glow' ? 'text-purple-400' : 'text-blue-400'}`} />
        </div>
        <Eye className="w-4 h-4 text-gray-600" />
      </div>
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className="text-4xl font-bold text-white">
        {loading ? '...' : value.toLocaleString()}
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.05),transparent_50%)]" />
      </div>

      {/* Grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Floating orbs */}
      <div className="fixed top-32 left-20 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
      <div className="fixed top-60 right-40 w-1.5 h-1.5 bg-pink-500 rounded-full animate-ping delay-300" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 shadow-lg shadow-purple-500/20">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Admin Dashboard</h1>
                <p className="text-gray-500 text-sm">View-Only Mode • Tucker Trips</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-gray-400 text-sm">
                  {loading ? 'Loading...' : 'Ready'}
                </span>
              </div>

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
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Platform Metrics</h2>
            <p className="text-gray-400">Real-time dashboard with 4 key performance counters</p>
          </div>

          {/* Counters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            <CounterCard
              icon={Users}
              label="Total Users"
              value={counters.totalUsers}
              color="purple-glow"
            />
            <CounterCard
              icon={TrendingUp}
              label="Active Bookings"
              value={counters.activeBookings}
              color="blue-glow"
            />
            <CounterCard
              icon={BarChart3}
              label="Revenue ($)"
              value={counters.revenue}
              color="purple-glow"
            />
            <CounterCard
              icon={Zap}
              label="Reviews"
              value={counters.reviews}
              color="blue-glow"
            />
            <CounterCard
              icon={MousePointerClick}
              label="Login / Sign-Up Clicks"
              value={signupClicks}
              color="purple-glow"
            />
            <CounterCard
              icon={ArrowUpRight}
              label="Recent Sign-Up Clicks"
              value={recentClicks}
              color="blue-glow"
            />
          </div>

          {/* Info Banner */}
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-200 font-medium mb-1">View-Only Access</p>
              <p className="text-blue-300/70 text-sm">You can view all counters but cannot edit them. Contact Super Admin for modifications.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
