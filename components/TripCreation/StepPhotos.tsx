// Step 6: Photos
// Handles cover photo and gallery photo uploads

'use client'

import { memo } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface StepPhotosProps {
  coverPhoto: string | null
  galleryPhotos: string[]
  onCoverPhotoUpload: (file: File) => void
  onGalleryPhotoUpload: (files: FileList) => void
  onRemoveCoverPhoto: () => void
  onRemoveGalleryPhoto: (index: number) => void
}

function StepPhotos({
  coverPhoto,
  galleryPhotos,
  onCoverPhotoUpload,
  onGalleryPhotoUpload,
  onRemoveCoverPhoto,
  onRemoveGalleryPhoto
}: StepPhotosProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Trip Photos</h2>
        <p className="text-gray-600 mb-6">Add a cover photo and up to 10 gallery photos (max 50MB each)</p>

        {/* Cover Photo Upload */}
        <div className="mb-8">
          <Label className="text-gray-800 font-medium mb-3 block">Cover Photo</Label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              {coverPhoto ? (
                <div className="relative w-full h-full">
                  <img
                    src={coverPhoto}
                    alt="Cover photo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      onRemoveCoverPhoto()
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 50MB</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onCoverPhotoUpload(file)
                }}
              />
            </label>
          </div>
        </div>

        {/* Gallery Photos Upload */}
        <div>
          <Label className="text-gray-800 font-medium mb-3 block">
            Gallery Photos ({galleryPhotos.length}/10)
          </Label>
          <div className="flex items-center justify-center w-full mb-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click to upload gallery photos</span>
              </p>
              <p className="text-xs text-gray-500">or drag and drop (max 10 photos)</p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onGalleryPhotoUpload(e.target.files)
                  }
                }}
              />
            </label>
          </div>

          {/* Gallery Photos Grid */}
          {galleryPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {galleryPhotos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Gallery photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveGalleryPhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(StepPhotos)
