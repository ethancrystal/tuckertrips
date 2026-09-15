'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Home,
  Map,
  Clock,
  Compass,
  Share2,
  LogOut,
  User,
  Sun,
  Moon,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Menu as MenuIcon,
  X,
  MessageCircle
} from 'lucide-react'

const DashboardSidebar = ({
  user,
  activeSection,
  onNavigate,
  onLogout,
  darkMode,
  onToggleTheme,
  isOpen,
  onToggle,
  collapsed = false,
  onToggleCollapsed,
  onEditProfile,
  unreadMessageCount = 0
}) => {
  const profileRef = useRef(null)
  const [isProfileActive, setIsProfileActive] = useState(false)
  const sidebarRef = useRef(null)

  const theme = darkMode ? {
    bg: 'bg-gray-900',
    border: 'border-gray-700',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    hover: 'hover:bg-gray-800',
    active: 'bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white',
  } : {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    hover: 'hover:bg-gray-100',
    active: 'bg-gradient-to-r from-pink-500 to-blue-500 text-white',
  }

  const navigation = [
    { name: 'Home', section: 'home', icon: Home },
    { name: 'My Trips', section: 'mytrips', icon: Map },
    { name: 'Future Trips', section: 'future', icon: Clock },
    { name: 'Shared with Me', section: 'shared', icon: Share2 },
    { name: 'Messages', section: 'messages', icon: MessageCircle, badge: unreadMessageCount },
    { name: 'Discover', section: 'discover', icon: Compass },
  ]

  useEffect(() => {
    const handleProfile = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileActive(false)
      }
    }
    document.addEventListener('click', handleProfile)
    return () => document.removeEventListener('click', handleProfile)
  }, [])

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth < 768 && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onToggle(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onToggle])

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isExpanded = isMobile ? true : !collapsed

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => onToggle(!isOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => onToggle(false)}
        />
      )}

      {/* Sidebar - expanded by default; collapses to an icon rail on request */}
      <nav
        ref={sidebarRef}
        aria-label="Main navigation"
        className={`fixed top-0 left-0 h-full ${theme.bg} ${theme.border} border-r z-40 transition-all duration-300 ${
          // Mobile: slides in and out. Desktop: always on screen.
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${
          // Width is set once, so the two breakpoints cannot fight each other.
          isExpanded ? 'w-72' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full px-4">
          {/* Profile Section - the whole row opens the menu, so theme and
              logout stay reachable when the sidebar is collapsed to icons. */}
          <div className="h-20 flex items-center">
            <div className="relative w-full" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileActive((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isProfileActive}
                title={isExpanded ? '' : 'Account menu'}
                className={`w-full flex items-center gap-x-3 p-1 rounded-lg ${theme.hover} transition-colors`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff34ac] to-[#7dbbe5] flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                  {user?.avatar_url || user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.avatar_url || user.user_metadata?.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (user?.full_name?.[0] || user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()
                  )}
                </div>

                {isExpanded && (
                  <>
                    <span className="flex-1 min-w-0 text-left">
                      <span className={`block ${theme.text} text-sm font-semibold truncate`}>
                        {user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                      </span>
                      <span className={`block mt-px ${theme.textSecondary} text-xs`}>
                        Tucker Trips
                      </span>
                    </span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 ${theme.textSecondary} transition-transform ${isProfileActive ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {isProfileActive && (
                <div className={`absolute z-10 top-full mt-1 left-0 w-56 rounded-lg ${theme.bg} ${theme.border} border shadow-xl text-sm ${theme.textSecondary}`}>
                  <div className="p-2">
                    <span className={`block ${theme.textSecondary} p-2 text-xs truncate`}>
                      {user?.email}
                    </span>

                    <button
                      onClick={() => {
                        onToggleTheme()
                        setIsProfileActive(false)
                      }}
                      className={`w-full flex items-center gap-2 p-2 rounded-md ${theme.hover} transition-colors`}
                    >
                      {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <button
                      onClick={() => {
                        onLogout()
                        setIsProfileActive(false)
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="overflow-auto flex-1">
            <ul className="text-sm font-medium space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.section
                return (
                  <li key={item.section}>
                    <button
                      onClick={() => {
                        onNavigate(item.section)
                        if (window.innerWidth < 768) onToggle(false)
                      }}
                      className={`w-full flex items-center gap-x-3 p-3 rounded-lg transition-all ${
                        isActive ? theme.active : `${theme.textSecondary} ${theme.hover}`
                      }`}
                      title={!isExpanded ? item.name : ''}
                    >
                      <div className="relative flex-shrink-0">
                        <Icon className="w-5 h-5" />
                        {!isExpanded && item.badge > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[#ff34ac] rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </div>
                      {isExpanded && (
                        <span className="flex-1 text-left truncate">{item.name}</span>
                      )}
                      {isExpanded && item.badge > 0 && (
                        <span className="ml-auto bg-[#ff34ac] text-white text-xs font-bold rounded-full px-2 py-0.5">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>

            {/* Footer Section */}
            <div className={`pt-4 mt-4 border-t ${theme.border}`}>
              <ul className="text-sm font-medium space-y-1">
                <li>
                  <button
                    onClick={onEditProfile}
                    className={`w-full flex items-center gap-x-3 p-3 rounded-lg ${theme.textSecondary} ${theme.hover} transition-all`}
                    title={!isExpanded ? 'Profile' : ''}
                  >
                    <User className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && <span className="flex-1 text-left">Profile</span>}
                  </button>
                </li>
                <li className="hidden md:block">
                  <button
                    onClick={() => onToggleCollapsed?.(!collapsed)}
                    className={`w-full flex items-center gap-x-3 p-3 rounded-lg ${theme.textSecondary} ${theme.hover} transition-all`}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    {collapsed ? (
                      <ChevronsRight className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <ChevronsLeft className="w-5 h-5 flex-shrink-0" />
                    )}
                    {isExpanded && <span className="flex-1 text-left">Collapse</span>}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default DashboardSidebar
