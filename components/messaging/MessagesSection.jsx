'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase.js'
import { toast } from 'sonner'
import ConversationList from './ConversationList'
import ChatArea from './ChatArea'
import NewConversationModal from './NewConversationModal'

const MessagesSection = ({ user, darkMode, onUnreadChange }) => {
  const [conversations, setConversations] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedUserInfo, setSelectedUserInfo] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [isMobileChat, setIsMobileChat] = useState(false)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setConversations(data)
    } catch (err) {
      console.error('Error fetching conversations:', err)
      toast.error('Failed to load conversations')
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`messages_realtime_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          fetchConversations()
          if (payload.new.sender_id === selectedUserId) {
            markConversationRead(selectedUserId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, selectedUserId, fetchConversations])

  const markConversationRead = async (partnerId) => {
    try {
      await fetch(`/api/messages?conversation=${partnerId}`)
      onUnreadChange?.()
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const handleSelectConversation = (userId) => {
    setSelectedUserId(userId)
    const conv = conversations.find(c => c.other_user_id === userId)
    if (conv) {
      setSelectedUserInfo({
        id: userId,
        full_name: conv.other_user_name,
        avatar_url: conv.other_user_avatar,
      })
    }
    setIsMobileChat(true)
    markConversationRead(userId)
    fetchConversations()
  }

  const handleNewUser = (userInfo) => {
    setSelectedUserId(userInfo.id)
    setSelectedUserInfo(userInfo)
    setIsMobileChat(true)
    fetchConversations()
  }

  const handleBack = () => {
    setIsMobileChat(false)
    setSelectedUserId(null)
    fetchConversations()
  }

  const handleMessageSent = () => {
    fetchConversations()
  }

  return (
    <div className="space-y-0">
      <div className={`flex h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
        <div className={`w-full md:w-80 flex-shrink-0 ${isMobileChat ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
          <ConversationList
            conversations={conversations}
            selectedUserId={selectedUserId}
            onSelect={handleSelectConversation}
            onNewMessage={() => setShowNewModal(true)}
            darkMode={darkMode}
          />
        </div>

        <div className={`flex-1 ${!isMobileChat ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
          <ChatArea
            partnerId={selectedUserId}
            partnerName={selectedUserInfo?.full_name}
            partnerAvatar={selectedUserInfo?.avatar_url}
            currentUserId={user?.id}
            darkMode={darkMode}
            onBack={handleBack}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>

      <NewConversationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSelectUser={handleNewUser}
        darkMode={darkMode}
      />
    </div>
  )
}

export default MessagesSection
