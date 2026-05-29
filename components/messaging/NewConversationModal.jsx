'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Search, Loader2 } from 'lucide-react'

const NewConversationModal = ({ open, onClose, onSelectUser, darkMode }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  const theme = darkMode ? {
    bg: 'bg-gray-900',
    border: 'border-gray-700',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    hover: 'hover:bg-gray-800',
    inputBg: 'bg-gray-800',
    overlay: 'bg-black/60',
  } : {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    hover: 'hover:bg-gray-50',
    inputBg: 'bg-gray-50',
    overlay: 'bg-black/40',
  }

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    if (!open) {
      setQuery('')
      setResults([])
    }
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`)
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        setResults(data)
      } catch (err) {
        console.error('User search error:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  if (!open) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center pt-20 ${theme.overlay}`} onClick={onClose}>
      <div
        className={`${theme.bg} rounded-xl shadow-2xl w-full max-w-md mx-4 ${theme.border} border overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between p-4 ${theme.border} border-b`}>
          <h3 className={`font-bold ${theme.text}`}>New Message</h3>
          <button onClick={onClose} className={`p-1 rounded-lg ${theme.textSecondary} ${theme.hover}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${theme.inputBg} ${theme.border} border`}>
            <Search className={`w-4 h-4 ${theme.textSecondary}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className={`flex-1 bg-transparent ${theme.text} text-sm outline-none placeholder:${theme.textSecondary}`}
            />
            {loading && <Loader2 className={`w-4 h-4 animate-spin ${theme.textSecondary}`} />}
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {results.length === 0 && query.trim().length >= 2 && !loading ? (
            <div className={`p-6 text-center ${theme.textSecondary} text-sm`}>
              No users found
            </div>
          ) : (
            results.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user)
                  onClose()
                }}
                className={`w-full flex items-center gap-3 p-4 ${theme.hover} transition-colors`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff34ac] to-[#7dbbe5] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (user.full_name?.[0] || '?').toUpperCase()
                  )}
                </div>
                <span className={`font-medium text-sm ${theme.text}`}>{user.full_name || 'Unknown User'}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NewConversationModal
