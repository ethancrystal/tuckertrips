'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Users, LogOut, Activity, Zap, TrendingUp, ArrowUpRight, Shield, MousePointerClick, Target, Map, Trash2, Mail, Calendar, Search } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Overview Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    signupClicks: 0,
    recentClicks: 0,
    conversionRate: 0
  })
  
  // Management Data
  const [users, setUsers] = useState([])
  const [trips, setTrips] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const supabaseRef = useRef(null)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/users/stats', { credentials: 'include' })
      if (!response.ok) {
        if (response.status === 401) { router.push('/admin-login'); return; }
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      setStats({
        totalUsers: data.totalUsers || 0,
        totalTrips: data.totalTrips || 0,
        signupClicks: data.signupClicks || 0,
        recentClicks: data.recentClicks || 0,
        conversionRate: data.conversionRate || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/admin/trips', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setTrips(data)
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'trips') fetchTrips()
  }, [activeTab])

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user? All their trips will also be deleted.')) return
    try {
      const response = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE', credentials: 'include' })
      if (response.ok) {
        toast.success('User deleted')
        fetchUsers()
      }
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const handleDeleteTrip = async (id) => {
    if (!confirm('Are you sure you want to delete this trip?')) return
    try {
      const response = await fetch(`/api/admin/trips?id=${id}`, { method: 'DELETE', credentials: 'include' })
      if (response.ok) {
        toast.success('Trip deleted')
        fetchTrips()
      }
    } catch (error) {
      toast.error('Failed to delete trip')
    }
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await fetch('/api/admin/login', { method: 'DELETE', credentials: 'include' })
      router.push('/admin-login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLogoutLoading(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.registration_ip?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTrips = trips.filter(t => 
    t.trip_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Sidebar-like Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Tucker Admin</h1>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveTab('trips')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'trips' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              Trips
            </button>
            <button onClick={handleLogout} className="ml-4 p-2 text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Users className="w-8 h-8 text-purple-400 mb-4" />
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <p className="text-gray-500 text-sm">Total Registered Users</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Map className="w-8 h-8 text-emerald-400 mb-4" />
                <p className="text-3xl font-bold">{stats.totalTrips}</p>
                <p className="text-gray-500 text-sm">Total Trips</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <MousePointerClick className="w-8 h-8 text-pink-400 mb-4" />
                <p className="text-3xl font-bold">{stats.signupClicks}</p>
                <p className="text-gray-500 text-sm">Signup Button Clicks</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Zap className="w-8 h-8 text-yellow-400 mb-4" />
                <p className="text-3xl font-bold">{stats.recentClicks}</p>
                <p className="text-gray-500 text-sm">Recent Clicks (7d)</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <Target className="w-8 h-8 text-blue-400 mb-4" />
                <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                <p className="text-gray-500 text-sm">Conversion Rate</p>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'trips') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold capitalize">{activeTab} Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-64"
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                  <tr>
                    {activeTab === 'users' ? (
                      <>
                        <th className="px-6 py-4 font-medium">User</th>
                        <th className="px-6 py-4 font-medium">Email</th>
                        <th className="px-6 py-4 font-medium">Registration IP</th>
                        <th className="px-6 py-4 font-medium">Joined</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 font-medium">Trip Name</th>
                        <th className="px-6 py-4 font-medium">Owner</th>
                        <th className="px-6 py-4 font-medium">Type</th>
                        <th className="px-6 py-4 font-medium">Visibility</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeTab === 'users' ? (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                            {user.full_name?.[0] || 'U'}
                          </div>
                          <span className="font-medium">{user.full_name || 'Anonymous'}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          <span className="font-mono text-[10px] bg-white/5 px-2 py-1 rounded">
                            {user.registration_ip || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredTrips.map(trip => (
                      <tr key={trip.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium">{trip.trip_name}</p>
                          <p className="text-xs text-gray-500">{trip.destination}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm">{trip.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{trip.profiles?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${trip.trip_type === 'taken' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                            {trip.trip_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${trip.visibility === 'public' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                            {trip.visibility}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteTrip(trip.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
