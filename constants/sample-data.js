// Sample Trip Data for Testing
// Used when no real trips exist in the database

export const SAMPLE_TRIPS = [
  {
    id: 'sample-1',
    user_id: 'sample-user',
    trip_name: 'Adventure in Bali Paradise',
    destination: 'Bali, Indonesia',
    start_date: '2024-03-15',
    end_date: '2024-03-22',
    trip_type: 'taken',
    visibility: 'public',
    description: 'An incredible journey through the tropical paradise of Bali, exploring ancient temples and pristine beaches.',
    cover_photo_url: 'https://images.unsplash.com/photo-1537953744114-6f0f0851b9fa?w=800',
    photo_urls: [
      'https://images.unsplash.com/photo-1513415276937-e5d3d97b3436?w=800',
      'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=800'
    ],
    trip_categories: [
      { id: 'cat1', category_name: 'accommodation', rating: 5, name: 'Luxury Villa Resort', details: 'Amazing oceanfront villa', notes: 'Incredible service and amenities' },
      { id: 'cat2', category_name: 'restaurant', rating: 5, name: 'Warung Local', details: 'Authentic Indonesian cuisine', notes: 'Best Nasi Goreng on the island' },
      { id: 'cat3', category_name: 'airline', rating: 4, name: 'Singapore Airlines', details: 'Comfortable flight experience', notes: 'Excellent service and entertainment' }
    ],
    created_at: '2024-03-25T10:00:00Z'
  },
  {
    id: 'sample-2',
    user_id: 'sample-user',
    trip_name: 'Tokyo Neon Dreams',
    destination: 'Tokyo, Japan',
    start_date: '2024-04-10',
    end_date: '2024-04-17',
    trip_type: 'taken',
    visibility: 'public',
    description: 'Exploring the vibrant streets of Tokyo, from ancient temples to modern skyscrapers.',
    cover_photo_url: 'https://images.unsplash.com/photo-1493976040374-85c8e7220edc?w=800',
    photo_urls: [
      'https://images.unsplash.com/photo-1513407030348-c984b97e983c?w=800',
      'https://images.unsplash.com/photo-1540959733332-eab4eabeeee5?w=800'
    ],
    trip_categories: [
      { id: 'cat4', category_name: 'accommodation', rating: 5, name: 'Capsule Hotel', details: 'Unique sleeping experience', notes: 'Clean and surprisingly comfortable' },
      { id: 'cat5', category_name: 'restaurant', rating: 5, name: 'Ichiran Ramen', details: 'Famous tonkotsu ramen shop', notes: 'Worth the long queue!' },
      { id: 'cat6', category_name: 'rental car', rating: 4, name: 'Toyota Rent-a-Car', details: 'Reliable transportation', notes: 'GPS and English speaking staff' }
    ],
    created_at: '2024-04-20T15:30:00Z'
  },
  {
    id: 'sample-3',
    user_id: 'sample-user',
    trip_name: 'Santorini Sunset Romance',
    destination: 'Santorini, Greece',
    start_date: '2024-06-01',
    end_date: '2024-06-08',
    trip_type: 'future',
    visibility: 'public',
    description: 'Planning the perfect romantic getaway to the stunning Greek island of Santorini.',
    cover_photo_url: 'https://images.unsplash.com/photo-1570077188670-e1fca298d148?w=800',
    photo_urls: [
      'https://images.unsplash.com/photo-1613397050032-e98da0d9e2fb?w=800'
    ],
    trip_categories: [
      { id: 'cat7', category_name: 'accommodation', rating: 5, name: 'Cave Suite Hotel', details: 'Luxurious cave hotel', notes: 'Unforgettable sunset views' },
      { id: 'cat8', category_name: 'restaurant', rating: 5, name: 'To Psaraki', details: 'Fresh seafood with view', notes: 'Romantic atmosphere' }
    ],
    created_at: '2024-05-15T09:20:00Z'
  },
  {
    id: 'sample-4',
    user_id: 'sample-user',
    trip_name: 'Iceland Northern Lights Quest',
    destination: 'Reykjavik, Iceland',
    start_date: '2024-01-20',
    end_date: '2024-01-27',
    trip_type: 'taken',
    visibility: 'public',
    description: 'Chasing the magical Aurora Borealis across the stunning Icelandic landscape.',
    cover_photo_url: 'https://images.unsplash.com/photo-1516426120787-acb1c9a51f46?w=800',
    photo_urls: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800'
    ],
    trip_categories: [
      { id: 'cat9', category_name: 'accommodation', rating: 4, name: 'Glass Igloo', details: 'Sleep under the Northern Lights', notes: 'Once in a lifetime experience' },
      { id: 'cat10', category_name: 'rental car', rating: 5, name: '4x4 Jeep', details: 'Perfect for glacier exploring', notes: 'Essential for winter roads' }
    ],
    created_at: '2024-02-10T12:45:00Z'
  },
  {
    id: 'sample-5',
    user_id: 'sample-user',
    trip_name: 'Paris City of Lights',
    destination: 'Paris, France',
    start_date: '2024-05-15',
    end_date: '2024-05-22',
    trip_type: 'future',
    visibility: 'public',
    description: 'Experiencing the romance and culture of Paris, from the Eiffel Tower to charming cafes.',
    cover_photo_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    photo_urls: [],
    trip_categories: [
      { id: 'cat11', category_name: 'restaurant', rating: 5, name: 'Le Jules Verne', details: 'Dining in Eiffel Tower', notes: 'Book well in advance!' }
    ],
    created_at: '2024-05-01T18:30:00Z'
  }
]

// Category icons mapping
export const CATEGORY_ICONS = {
  accommodation: 'Hotel',
  restaurant: 'Utensils',
  airline: 'Plane',
  'rental car': 'Car',
  excursions: 'Compass'
}

// Trip type labels
export const TRIP_TYPE_LABELS = {
  taken: 'Completed',
  future: 'Planned',
  ongoing: 'In Progress'
}

// Visibility labels and icons
export const VISIBILITY_CONFIG = {
  private: { label: 'Private', icon: 'Lock' },
  friends: { label: 'Friends', icon: 'Users' },
  public: { label: 'Public', icon: 'Globe' }
}

// Default cover photos for trips without images
export const DEFAULT_COVER_GRADIENTS = [
  'from-blue-500 to-purple-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-600'
]

/**
 * Get a random default gradient for trips without cover photos
 */
export function getDefaultGradient(index = 0) {
  return DEFAULT_COVER_GRADIENTS[index % DEFAULT_COVER_GRADIENTS.length]
}
