// Custom hook for managing photo uploads in TripCreation

'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase.js'

interface UsePhotoUploadOptions {
  onUploadError?: (error: string) => void
}

export function usePhotoUpload({ onUploadError }: UsePhotoUploadOptions = {}) {
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  // Generate unique filename
  const generateFileName = (file: File, prefix = 'photo') => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    return `${prefix}-${timestamp}-${random}.${extension}`
  }

  // Upload a single file to Supabase storage
  const uploadFile = useCallback(async (file: File, folder = 'trip-photos'): Promise<string | null> => {
    try {
      setUploading(true)

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size exceeds 50MB limit')
      }

      const fileName = generateFileName(file)
      const filePath = `${folder}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('trip-photos')
        .upload(filePath, file)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trip-photos')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      onUploadError?.(errorMessage)
      return null
    } finally {
      setUploading(false)
    }
  }, [onUploadError])

  // Handle cover photo upload
  const handleCoverPhotoUpload = useCallback(async (file: File) => {
    const url = await uploadFile(file, 'cover-photos')
    if (url) {
      setCoverPhoto(url)
    }
  }, [uploadFile])

  // Handle gallery photo uploads
  const handleGalleryPhotoUpload = useCallback(async (files: FileList) => {
    const remainingSlots = 10 - galleryPhotos.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) {
      onUploadError?.('Maximum 10 gallery photos allowed')
      return
    }

    setUploading(true)
    const uploadPromises = filesToUpload.map(file => uploadFile(file, 'gallery-photos'))
    const urls = await Promise.all(uploadPromises)

    const validUrls = urls.filter((url): url is string => url !== null)
    setGalleryPhotos(prev => [...prev, ...validUrls])
    setUploading(false)
  }, [galleryPhotos.length, uploadFile, onUploadError])

  // Remove cover photo
  const removeCoverPhoto = useCallback(() => {
    setCoverPhoto(null)
  }, [])

  // Remove gallery photo by index
  const removeGalleryPhoto = useCallback((index: number) => {
    setGalleryPhotos(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Reset all photos
  const resetPhotos = useCallback(() => {
    setCoverPhoto(null)
    setGalleryPhotos([])
  }, [])

  // Set photos from existing trip (for edit mode)
  const setPhotosFromTrip = useCallback((coverUrl: string | null, galleryUrls: string[] = []) => {
    setCoverPhoto(coverUrl)
    setGalleryPhotos(galleryUrls)
  }, [])

  return {
    coverPhoto,
    galleryPhotos,
    uploading,
    handleCoverPhotoUpload,
    handleGalleryPhotoUpload,
    removeCoverPhoto,
    removeGalleryPhoto,
    resetPhotos,
    setPhotosFromTrip
  }
}
