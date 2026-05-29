'use client'

import { MessageCircle, Plus } from 'lucide-react'

const ConversationList = ({ conversations, selectedUserId, onSelect, onNewMessage, darkMode }) => {
  const theme = darkMode ? {
    bg: 'bg-gray-900',
    border: 'border-gray-700',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    hover: 'hover:bg-gray-800',
    selected: 'bg-gray-800',
    cardBg: 'bg-gray-800/50',
  } : {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    hover: 'hover:bg-gray-50',
    selected: 'bg-blue-50',
    cardBg: 'bg-gray-50',
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`flex flex-col h-full ${theme.bg} ${theme.border} border-r`}>
      <div className={`p-4 ${theme.border} border-b`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-lg font-bold ${theme.text}`}>Messages</h2>
          <button
            onClick={onNewMessage}
            className="p-2 rounded-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white hover:opacity-90 transition-opacity"
            title="New Message"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageCircle className={`w-12 h-12 ${theme.textSecondary} mb-3`} />
            <p className={`${theme.textSecondary} text-sm`}>No conversations yet</p>
            <button
              onClick={onNewMessage}
              className="mt-3 text-sm text-[#ff34ac] hover:underline"
            >
              Start a conversation
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.other_user_id}
              onClick={() => onSelect(conv.other_user_id)}
              className={`w-full flex items-center gap-3 p-4 transition-colors ${
                selectedUserId === conv.other_user_id ? theme.selected : theme.hover
              } ${theme.border} border-b`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff34ac] to-[#7dbbe5] flex items-center justify-center text-white font-bold overflow-hidden">
                  {conv.other_user_avatar ? (
                    <img src={conv.other_user_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (conv.other_user_name?.[0] || '?').toUpperCase()
                  )}
                </div>
                {conv.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff34ac] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {conv.unread_count > 9 ? '9+' : conv.unread_count}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-sm truncate ${theme.text} ${conv.unread_count > 0 ? 'font-bold' : ''}`}>
                    {conv.other_user_name || 'Unknown User'}
                  </span>
                  <span className={`text-xs flex-shrink-0 ml-2 ${conv.unread_count > 0 ? 'text-[#ff34ac] font-semibold' : theme.textSecondary}`}>
                    {formatTime(conv.last_message_time)}
                  </span>
                </div>
                <p className={`text-sm truncate mt-0.5 ${conv.unread_count > 0 ? `${theme.text} font-medium` : theme.textSecondary}`}>
                  {conv.last_message_content || 'No messages yet'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default ConversationList
