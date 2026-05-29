// Custom hook for managing TripCreation form state

'use client'

import { useState, useCallback } from 'react'
import type { TripFormData } from '../types'

interface UseFormStateOptions {
  initialTrip?: any
}

const INITIAL_FORM_DATA: TripFormData = {
  // Step 1: Trip Basics
  trip_name: '',
  location: '',
  start_date: '',
  end_date: '',
  description: '',
  privacy: 'public',

  // Step 2: Accommodation
  accommodation_rating: 0,
  accommodation_type: '',
  accommodation_url: '',

  // Step 3: Restaurant
  restaurant_rating: 0,
  restaurant_type: '',
  best_food: '',

  // Step 4: Airline
  airline_rating: 0,
  airline_name: '',
  airline_cost: '',

  // Step 5: Rental Car
  rental_rating: 0,
  rental_company: '',
  rental_cost: '',

  // Photos
  coverPhoto: null,
  galleryPhotos: []
}

export function useFormState({ initialTrip }: UseFormStateOptions = {}) {
  const [formData, setFormData] = useState<TripFormData>(() => {
    if (initialTrip) {
      return {
        trip_name: initialTrip.trip_name || initialTrip.title || '',
        location: initialTrip.destination || '',
        start_date: initialTrip.start_date || '',
        end_date: initialTrip.end_date || '',
        description: initialTrip.description || '',
        privacy: initialTrip.visibility || 'public',
        accommodation_rating: 0,
        accommodation_type: '',
        accommodation_url: '',
        restaurant_rating: 0,
        restaurant_type: '',
        best_food: '',
        airline_rating: 0,
        airline_name: '',
        airline_cost: '',
        rental_rating: 0,
        rental_company: '',
        rental_cost: '',
        coverPhoto: initialTrip.cover_photo_url || null,
        galleryPhotos: initialTrip.photo_urls || []
      }
    }
    return INITIAL_FORM_DATA
  })

  const [step, setStep] = useState(0)
  const [tripType, setTripType] = useState<'taken' | 'future'>('taken')

  const updateFormData = useCallback((updates: Partial<TripFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA)
    setStep(0)
    setTripType('taken')
  }, [])

  const canGoNext = useCallback(() => {
    switch (step) {
      case 0:
        return formData.trip_name.trim() !== '' && formData.location.trim() !== ''
      default:
        return true
    }
  }, [step, formData])

  return {
    formData,
    setFormData: updateFormData,
    step,
    setStep,
    tripType,
    setTripType,
    resetForm,
    canGoNext
  }
}
