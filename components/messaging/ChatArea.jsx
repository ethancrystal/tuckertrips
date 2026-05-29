'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase.js'
import { toast } from 'sonner'

const ChatArea = ({ partnerId, partnerName, partnerAvatar, currentUserId, darkMode, onBack, onMessageSent }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const theme = darkMode ? {
    bg: 'bg-gray-900',
    chatBg: 'bg-gray-800',
    border: 'border-gray-700',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    inputBg: 'bg-gray-800',
    myBubble: 'bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white',
    theirBubble: 'bg-gray-700 text-white',
  } : {
    bg: 'bg-white',
    chatBg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    inputBg: 'bg-white',
    myBubble: 'bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white',
    theirBubble: 'bg-gray-200 text-gray-900',
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    if (!partnerId) return
    try {
      setLoading(true)
      setFetchError(null)
      const res = await fetch(`/api/messages?conversation=${partnerId}`)
      if (!res.ok) throw new Error('Failed to fetch messages')
      const data = await res.json()
      setMessages(data)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setFetchError('Could not load messages. Please try again.')
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [partnerId])

  useEffect(() => {
    if (!partnerId || !currentUserId) return

    const channel = supabase
      .channel(`chat_${partnerId}_${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${partnerId}`,
        },
        (payload) => {
          if (payload.new.recipient_id === currentUserId) {
            appendMessage(payload.new)
            fetch(`/api/messages?conversation=${partnerId}`).catch((err) => {
              console.error('Failed to refresh messages after realtime event:', err)
            })
            onMessageSent?.()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [partnerId, currentUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)

    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      recipient_id: partnerId,
      content,
      created_at: new Date().toISOString(),
      read: false,
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: partnerId, content }),
      })
      if (!res.ok) throw new Error('Failed to send')
      const sent = await res.json()
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? sent : m))
      onMessageSent?.()
    } catch (err) {
      console.error('Error sending message:', err)
      toast.error('Failed to send message. Please try again.')
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      setNewMessage(content)
    } finally {
      setSending(false)
    }
  }

  const appendMessage = (msg) => {
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateSeparator = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const shouldShowDate = (idx) => {
    if (idx === 0) return true
    const curr = new Date(messages[idx].created_at).toDateString()
    const prev = new Date(messages[idx - 1].created_at).toDateString()
    return curr !== prev
  }

  if (!partnerId) {
    return (
      <div className={`flex-1 flex items-center justify-center ${theme.bg}`}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff34ac]/20 to-[#7dbbe5]/20 flex items-center justify-center mx-auto mb-4">
            <Send className={`w-8 h-8 ${theme.textSecondary}`} />
          </div>
          <p className={`${theme.textSecondary} text-lg`}>Select a conversation to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-1 flex flex-col ${theme.bg} h-full`}>
      <div className={`flex items-center gap-3 p-4 ${theme.border} border-b`}>
        {onBack && (
          <button onClick={onBack} className={`p-1 rounded-lg ${theme.textSecondary} hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff34ac] to-[#7dbbe5] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
          {partnerAvatar ? (
            <img src={partnerAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            (partnerName?.[0] || '?').toUpperCase()
          )}
        </div>
        <span className={`font-semibold ${theme.text}`}>{partnerName || 'Unknown User'}</span>
      </div>

      <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto p-4 space-y-1 ${theme.chatBg}`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className={`w-6 h-6 animate-spin ${theme.textSecondary}`} />
          </div>
        ) : fetchError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className={`${theme.textSecondary} text-sm mb-2`}>{fetchError}</p>
              <button
                onClick={fetchMessages}
                className="text-sm px-3 py-1 rounded-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white hover:opacity-90"
              >
                Retry
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className={`${theme.textSecondary} text-sm`}>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.sender_id === currentUserId
            return (
              <div key={msg.id}>
                {shouldShowDate(idx) && (
                  <div className="flex justify-center my-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                      {formatDateSeparator(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMine ? theme.myBubble : theme.theirBubble} ${
                    isMine ? 'rounded-br-md' : 'rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : theme.textSecondary} text-right`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className={`p-4 ${theme.border} border-t flex gap-2`}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={`flex-1 px-4 py-2 rounded-full ${theme.inputBg} ${theme.border} border ${theme.text} text-sm focus:outline-none focus:ring-2 focus:ring-[#ff34ac]/50`}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="p-2 rounded-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white disabled:opacity-50 hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

export default ChatArea
