'use client'

import { Star } from 'lucide-react'

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const sizeClass = sizes[size] || sizes.md

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`transition-all ${!readonly && 'hover:scale-110 cursor-pointer'}`}
        >
          <Star
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-[#ff34ac] text-[#ff34ac]'
                : 'fill-none text-gray-400'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  )
}

export default StarRating
