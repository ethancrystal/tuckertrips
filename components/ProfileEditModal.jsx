'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { X, Upload, User, Camera, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase.js'

const ProfileEditModal = ({ open, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    avatar_url: '',
    cover_photo_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [session, setSession] = useState(null)

  // Load user data and session when modal opens
  useEffect(() => {
    if (open && user) {
      setFormData({
        full_name: user.full_name || user.user_metadata?.full_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || user.user_metadata?.avatar_url || '',
        cover_photo_url: user.cover_photo_url || '',
      })
    }
  }, [open, user])

  // Get current session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Upload photo to Supabase Storage via API
  const uploadPhoto = async (file, type) => {
    if (!file) return null

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return null
    }

    // Validate file size (max 5MB for profile photos)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return null
    }

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in to upload photos')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('kind', type)

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Upload failed')
      }

      const { publicUrl } = await response.json()
      return publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error(`Failed to upload: ${error.message}`)
      return null
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const publicUrl = await uploadPhoto(file, 'avatar')
    if (publicUrl) {
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Avatar uploaded!')
    }
    setUploadingAvatar(false)
    // Reset file input
    e.target.value = ''
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    const publicUrl = await uploadPhoto(file, 'cover')
    if (publicUrl) {
      setFormData(prev => ({ ...prev, cover_photo_url: publicUrl }))
      toast.success('Cover photo uploaded!')
    }
    setUploadingCover(false)
    // Reset file input
    e.target.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Use Supabase session for authentication (secure)
      if (!session) {
        throw new Error('You must be logged in to update your profile')
      }

      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) {
        throw new Error('Session expired. Please log in again.')
      }

      const token = currentSession.access_token

      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.full_name,
          bio: formData.bio,
          avatarUrl: formData.avatar_url,
          coverPhotoUrl: formData.cover_photo_url,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const { user: updatedUser } = await response.json()

      toast.success('Profile updated successfully!')
      onUpdate?.(updatedUser)
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white text-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update your profile information and photos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Cover Photo */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] rounded-lg overflow-hidden">
              {formData.cover_photo_url && (
                <img
                  src={formData.cover_photo_url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="absolute bottom-4 right-4">
              <label
                htmlFor="cover-upload"
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {uploadingCover ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {uploadingCover ? 'Uploading...' : 'Change Cover'}
                </span>
              </label>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
                disabled={uploadingCover}
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-end gap-4 -mt-12 px-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white overflow-hidden shadow-lg">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-[#ff34ac] text-white p-2 rounded-full cursor-pointer hover:bg-[#e62d95] transition-colors"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 px-4">
            <div>
              <Label htmlFor="full_name" className="text-gray-800">Display Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your display name"
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="bio" className="text-gray-800">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[100px] mt-1"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 px-4 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-gray-300 text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileEditModal
