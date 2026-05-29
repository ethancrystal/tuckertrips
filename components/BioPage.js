'use client'

import { useState } from 'react'
import { User, MapPin, Calendar, Camera } from 'lucide-react'

const BioPage = ({ user, editable = false, onEdit }) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Photo Section */}
      <div className="relative h-48 bg-gradient-to-r from-purple-100 to-blue-100 rounded-t-lg overflow-hidden">
        {user.coverPhoto && !imageError ? (
          <img
            src={user.coverPhoto}
            alt={`${user.name}'s cover`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Camera className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Edit Button */}
        {editable && onEdit && (
          <button
            onClick={onEdit}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white px-4 py-2 rounded-lg shadow-md text-sm font-medium text-gray-700 flex items-center space-x-2 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="bg-white rounded-b-lg shadow-lg p-6 -mt-16 relative">
        {/* Profile Picture */}
        <div className="flex items-start space-x-6">
          <div className="relative -mt-16">
            <div className="w-32 h-32 bg-purple-600 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 pt-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-gray-600 mb-4">{user.email}</p>

            {/* Stats */}
            <div className="flex space-x-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Travel Enthusiast</span>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">About Me</h3>
              {user.bio ? (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {user.bio}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  {editable
                    ? "Tell others about yourself... Where you love to travel, your travel style, favorite destinations, etc."
                    : "This traveler hasn't shared their bio yet."
                  }
                </p>
              )}
            </div>

            {/* Travel Interests (Future Enhancement) */}
            {user.bio && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Travel Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user.bio.toLowerCase().includes('beach') && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Beach</span>
                  )}
                  {user.bio.toLowerCase().includes('mountain') && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Mountains</span>
                  )}
                  {user.bio.toLowerCase().includes('city') && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">City Tours</span>
                  )}
                  {user.bio.toLowerCase().includes('adventure') && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Adventure</span>
                  )}
                  {user.bio.toLowerCase().includes('food') && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">Food & Cuisine</span>
                  )}
                  {user.bio.toLowerCase().includes('culture') && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Culture</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BioPage