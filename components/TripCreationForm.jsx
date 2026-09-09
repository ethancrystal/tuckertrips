'use client'

import { useState, useEffect, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Utensils,
  Hotel,
  Plane,
  Check,
  Calendar,
  MapPin,
  Globe,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  Users,
  Lock
} from 'lucide-react'
import { supabase } from '@/lib/supabase.js'
import { toast } from 'sonner'

const STEPS = [
  { id: 'basics', name: 'Trip Basics', icon: MapPin },
  { id: 'accommodation', name: 'Accommodation', icon: Hotel },
  { id: 'restaurant', name: 'Restaurant', icon: Utensils },
  { id: 'airline', name: 'Airline', icon: Plane },
  { id: 'rental-car', name: 'Rental Car', icon: Car },
  { id: 'photos', name: 'Photos', icon: Camera },
]

const TripCreationForm = ({ open, onClose, onTripCreated, onTripUpdated, copiedTrip = null, mode = 'create', initialData = null }) => {
  const STORAGE_KEY = 'tucker_trips_draft'

  const [step, setStep] = useState(0)
  const [tripType, setTripType] = useState('taken')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [coverPhoto, setCoverPhoto] = useState(null)
  const [galleryPhotos, setGalleryPhotos] = useState([])

  // Form data structure matching the exact fields specified
  const [formData, setFormData] = useState({
    // Step 1: Trip Basics
    trip_name: '',
    start_date: '',
    end_date: '',
    location: '',
    description: '',
    privacy: 'private', // Default to private — user must explicitly choose public

    // Step 2: Accommodation
    accommodation_rating: 0,
    accommodation_type: '',
    accommodation_url: '',
    other_accommodation_link: '',
    accommodation_excursion: '',

    // Step 3: Restaurant
    restaurant_review: '',
    restaurant_type: '',
    restaurant_name: '',
    best_food_restaurant: '',
    restaurant_excursion: '',

    // Step 4: Airline
    airline_rating: 0,
    airline_name: '',
    airline_cost: '',
    quantity_of_flight: '',
    airline_excursion: '',

    // Step 5: Rental Car
    rental_car_review: '',
    rental_car_company: '',
    rental_car_cost: '',
    quantity_of_car: '',
    rental_car_excursion: '',

    // Step 6: Photos
    cover_photo_url: '',
    gallery_photo_urls: [],
  })

  // Load saved draft when modal opens
  useEffect(() => {
    if (open) {
      // If we're in edit mode with initial data, populate the form
      if (mode === 'edit' && initialData) {
        // Map the trip data to form fields
        const editFormData = {
          trip_name: initialData.trip_name || initialData.title || '',
          start_date: initialData.start_date || '',
          end_date: initialData.end_date || '',
          location: initialData.destination || initialData.location || '',
          description: initialData.description || '',
          privacy: initialData.visibility || 'private',
        }

        // Populate categories from trip_categories if they exist
        if (initialData.trip_categories && initialData.trip_categories.length > 0) {
          initialData.trip_categories.forEach(category => {
            const categoryName = category.category_name?.toLowerCase()
            if (categoryName === 'accommodation') {
              editFormData.accommodation_rating = category.rating || 0
              editFormData.accommodation_type = category.details || ''
              editFormData.accommodation_excursion = category.notes || ''
            } else if (categoryName === 'food' || categoryName === 'restaurant') {
              editFormData.restaurant_review = category.details || ''
              editFormData.restaurant_name = category.name || ''
              editFormData.restaurant_excursion = category.notes || ''
            } else if (categoryName === 'airline') {
              editFormData.airline_rating = category.rating || 0
              editFormData.airline_name = category.details || ''
              editFormData.airline_cost = category.notes || ''
            } else if (categoryName === 'rental') {
              editFormData.rental_car_review = category.details || ''
              editFormData.rental_car_company = category.name || ''
              editFormData.rental_car_cost = category.notes || ''
            }
          })
        }

        // Populate photo fields
        editFormData.cover_photo_url = initialData.cover_image || initialData.cover_photo_url || initialData.coverPhoto || ''
        editFormData.gallery_photo_urls = initialData.photo_urls || initialData.tripImages || []

        setFormData(editFormData)
        setTripType(initialData.trip_type || initialData.status || 'future')
        setStep(0)
        // Seed the dedicated photo state too — the Photos step renders from
        // these, so without this existing photos disappear on edit and adding
        // a new one would overwrite (not append to) the existing gallery.
        setCoverPhoto(editFormData.cover_photo_url || null)
        setGalleryPhotos(editFormData.gallery_photo_urls || [])
        // Return so we don't fall through into the draft-restore prompt below,
        // which would otherwise clobber the trip currently being edited.
        return
      }
      // If we have copied trip data, populate the form with it
      else if (copiedTrip) {
        const copiedFormData = {
          trip_name: copiedTrip.trip_name ? `${copiedTrip.trip_name} (Copy)` : '',
          start_date: copiedTrip.start_date || '',
          end_date: copiedTrip.end_date || '',
          location: copiedTrip.destination || copiedTrip.location || '',
          description: copiedTrip.description || '',
          privacy: copiedTrip.visibility || 'private', // Use original trip's visibility

          // Initialize categories as empty arrays - will be populated from trip_categories
          accommodation_rating: 0,
          accommodation_type: '',
          accommodation_url: '',
          other_accommodation_link: '',
          accommodation_excursion: '',

          restaurant_review: '',
          restaurant_type: '',
          restaurant_name: '',
          best_food_restaurant: '',
          restaurant_excursion: '',

          airline_rating: 0,
          airline_name: '',
          airline_cost: '',
          quantity_of_flight: '',
          airline_excursion: '',

          rental_car_review: '',
          rental_car_company: '',
          rental_car_cost: '',
          quantity_of_car: '',
          rental_car_excursion: '',

          // Step 6: Photos (reset for copied trips)
          cover_photo_url: '',
          gallery_photo_urls: [],
        }

        // If the copied trip has categories, populate the form with that data
        if (copiedTrip.trip_categories && copiedTrip.trip_categories.length > 0) {
          copiedTrip.trip_categories.forEach(category => {
            switch (category.category_name?.toLowerCase()) {
              case 'accommodation':
                copiedFormData.accommodation_rating = category.rating || 0
                copiedFormData.accommodation_type = category.details || ''
                copiedFormData.accommodation_excursion = category.notes || ''
                break
              case 'food':
              case 'restaurant':
                copiedFormData.restaurant_review = category.details || ''
                copiedFormData.restaurant_name = category.name || ''
                copiedFormData.restaurant_excursion = category.notes || ''
                break
              case 'airline':
                copiedFormData.airline_rating = category.rating || 0
                copiedFormData.airline_name = category.name || ''
                copiedFormData.airline_excursion = category.notes || ''
                break
              case 'rental car':
                copiedFormData.rental_car_review = category.details || ''
                copiedFormData.rental_car_company = category.name || ''
                copiedFormData.rental_car_excursion = category.notes || ''
                break
            }
          })
        }

        setFormData(copiedFormData)
        setTripType('future') // Default to future for copied trips
        setStep(0) // Start at the first step
        setCoverPhoto(null)
        setGalleryPhotos([])
        toast.success('Trip copied! You can edit the details below.')
        return
      }

      // Otherwise, check for saved draft
      const savedDraft = localStorage.getItem(STORAGE_KEY)
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft)
          if (confirm('You have a saved draft. Would you like to continue where you left off?')) {
            setFormData(parsed.formData || formData)
            setTripType(parsed.tripType || 'taken')
            setStep(parsed.step || 0)
            toast.success('Draft restored!')
          } else {
            localStorage.removeItem(STORAGE_KEY)
          }
        } catch (error) {
          console.error('Error loading draft:', error)
        }
      }
    }
  }, [open, copiedTrip, mode, initialData?.id])

  // Save draft to localStorage whenever data changes
  useEffect(() => {
    if (open && formData.trip_name) {
      const draft = {
        formData,
        tripType,
        step,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    }
  }, [formData, tripType, step, open])

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  // Photo upload functions - using server-side API for better reliability
  const handleCoverPhotoUpload = async (file) => {
    if (!file) return

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Cover photo must be less than 50MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setUploading(true)
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in to upload photos')
      }

      // Use FormData for server-side upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('kind', 'cover')

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

      setCoverPhoto(publicUrl)
      setFormData(prev => ({ ...prev, cover_photo_url: publicUrl }))
      toast.success('Cover photo uploaded!')
    } catch (error) {
      console.error('Error uploading cover photo:', error)
      toast.error(`Failed to upload: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleGalleryPhotoUpload = async (files) => {
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 50MB`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Check total gallery photos limit (10)
    if (galleryPhotos.length + validFiles.length > 10) {
      toast.error('You can only upload up to 10 gallery photos')
      return
    }

    setUploading(true)
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('You must be logged in to upload photos')
      }

      // Upload each file sequentially for better error handling
      const uploadedUrls = []

      for (const file of validFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('kind', 'gallery')

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          },
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error(`Failed to upload ${file.name}:`, errorData)
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        const { publicUrl } = await response.json()
        uploadedUrls.push(publicUrl)
      }

      if (uploadedUrls.length > 0) {
        const newGalleryPhotos = [...galleryPhotos, ...uploadedUrls]

        setGalleryPhotos(newGalleryPhotos)
        setFormData(prev => ({
          ...prev,
          gallery_photo_urls: newGalleryPhotos
        }))

        toast.success(`${uploadedUrls.length} photo(s) uploaded!`)
      } else {
        toast.error('No photos could be uploaded')
      }
    } catch (error) {
      console.error('Error uploading gallery photos:', error)
      toast.error(`Failed to upload: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const removeGalleryPhoto = (index) => {
    const newGalleryPhotos = galleryPhotos.filter((_, i) => i !== index)
    setGalleryPhotos(newGalleryPhotos)
    setFormData(prev => ({
      ...prev,
      gallery_photo_urls: newGalleryPhotos
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in to create a trip')
        return
      }

      // Use privacy setting from form (public, friends, or private)
      // Defaults to private — only public if user explicitly selected it
      const visibility = formData.privacy || 'private'

      let trip

      if (mode === 'edit' && initialData?.id) {
        // UPDATE EXISTING TRIP
        const { data: updatedTrip, error: updateError } = await supabase
          .from('trips')
          .update({
            trip_name: formData.trip_name,
            destination: formData.location,
            description: formData.description || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            trip_type: tripType,
            visibility: visibility,
            cover_image: formData.cover_photo_url || null,
            photo_urls: galleryPhotos,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id)
          .select()
          .single()

        if (updateError) throw updateError
        trip = updatedTrip
      } else {
        // CREATE NEW TRIP
        const { data: newTrip, error: tripError } = await supabase
          .from('trips')
          .insert({
            user_id: user.id,
            trip_name: formData.trip_name,
            destination: formData.location,
            description: formData.description || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            trip_type: tripType,
            visibility: visibility,
            cover_image: formData.cover_photo_url || null,
            photo_urls: galleryPhotos,
          })
          .select()
          .single()

        if (tripError) throw tripError
        trip = newTrip
      }

      // Handle categories (delete existing and recreate for edit mode)
      if (mode === 'edit' && initialData?.id) {
        // Delete existing categories
        await supabase
          .from('trip_categories')
          .delete()
          .eq('trip_id', initialData.id)
      }

      // Try to create category entries for each section that has data
      const categoryEntries = []

      // Accommodation
      if (formData.accommodation_rating || formData.accommodation_type) {
        categoryEntries.push({
          trip_id: trip.id,
          category_name: 'accommodation',
          rating: formData.accommodation_rating || null,
          average_price: null,
          notes: `Type: ${formData.accommodation_type}\nURL: ${formData.accommodation_url}\nOther Link: ${formData.other_accommodation_link}\nExcursion: ${formData.accommodation_excursion}`,
        })
      }

      // Restaurant
      if (formData.restaurant_name || formData.restaurant_review) {
        categoryEntries.push({
          trip_id: trip.id,
          category_name: 'food',
          rating: null,
          average_price: null,
          notes: `Restaurant: ${formData.restaurant_name}\nType: ${formData.restaurant_type}\nBest Food: ${formData.best_food_restaurant}\nReview: ${formData.restaurant_review}\nExcursion: ${formData.restaurant_excursion}`,
        })
      }

      // Airline
      if (formData.airline_name || formData.airline_rating) {
        categoryEntries.push({
          trip_id: trip.id,
          category_name: 'airline',
          rating: formData.airline_rating || null,
          average_price: formData.airline_cost ? parseFloat(formData.airline_cost) : null,
          notes: `Airline: ${formData.airline_name}\nQuantity: ${formData.quantity_of_flight}\nExcursion: ${formData.airline_excursion}`,
        })
      }

      // Rental Car
      if (formData.rental_car_company || formData.rental_car_review) {
        categoryEntries.push({
          trip_id: trip.id,
          category_name: 'rental',
          rating: null,
          average_price: formData.rental_car_cost ? parseFloat(formData.rental_car_cost) : null,
          notes: `Company: ${formData.rental_car_company}\nQuantity: ${formData.quantity_of_car}\nReview: ${formData.rental_car_review}\nExcursion: ${formData.rental_car_excursion}`,
        })
      }

      // Try to insert categories, but don't fail if table doesn't exist
      if (categoryEntries.length > 0) {
        const { error: categoriesError } = await supabase
          .from('trip_categories')
          .insert(categoryEntries)

        if (categoriesError) {
          console.warn('Could not save trip categories (table may not exist):', categoriesError.message)
          // Don't throw error - trip was still created successfully
        }
      }

      if (mode === 'edit') {
        toast.success('Trip updated successfully!')
        onTripUpdated?.(trip)
      } else {
        toast.success(`Trip ${tripType === 'taken' ? 'logged' : 'planned'}!`)
        onTripCreated?.()
      }

      localStorage.removeItem(STORAGE_KEY)
      // Defer handleClose to avoid blocking UI
      setTimeout(() => startTransition(() => handleClose()), 0)
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} trip:`, error)
      toast.error(`Failed to ${mode === 'edit' ? 'update' : 'create'} trip`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(0)
    setFormData({
      trip_name: '',
      start_date: '',
      end_date: '',
      location: '',
      description: '',
      privacy: 'private',
      accommodation_rating: 0,
      accommodation_type: '',
      accommodation_url: '',
      other_accommodation_link: '',
      accommodation_excursion: '',
      restaurant_review: '',
      restaurant_type: '',
      restaurant_name: '',
      best_food_restaurant: '',
      restaurant_excursion: '',
      airline_rating: 0,
      airline_name: '',
      airline_cost: '',
      quantity_of_flight: '',
      airline_excursion: '',
      rental_car_review: '',
      rental_car_company: '',
      rental_car_cost: '',
      quantity_of_car: '',
      rental_car_excursion: '',
    })
    setTripType('taken')
    setCoverPhoto(null)
    setGalleryPhotos([])
    onClose()
  }

  const renderStepContent = () => {
    switch (step) {
      case 0: // Trip Basics
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-gray-800">Trip Name *</Label>
              <Input
                placeholder="Tokyo Adventure 2024"
                value={formData.trip_name}
                onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Location *</Label>
              <Input
                placeholder="Tokyo, Japan"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-800">Start Date</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-gray-50 border-gray-300 text-gray-800"
                />
              </div>
              <div>
                <Label className="text-gray-800">End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-gray-50 border-gray-300 text-gray-800"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-800">Description</Label>
              <Textarea
                placeholder="Describe your trip..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-gray-800">Privacy</Label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Default: Private</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Only trips marked <span className="font-semibold text-blue-600">Public</span> will appear in the Discover section for other users to find.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Public Option */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, privacy: 'public' })}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                    formData.privacy === 'public'
                      ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      formData.privacy === 'public'
                        ? 'bg-blue-500 text-white scale-110'
                        : 'bg-blue-100 text-blue-500 group-hover:bg-blue-200'
                    }`}>
                      <Globe className="h-6 w-6" />
                    </div>
                    <div className={`font-semibold ${formData.privacy === 'public' ? 'text-blue-700' : 'text-gray-800'}`}>
                      Public
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Visible in Discover
                    </div>
                    {formData.privacy === 'public' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Friends Option */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, privacy: 'friends' })}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                    formData.privacy === 'friends'
                      ? 'bg-green-50 border-green-500 shadow-md shadow-green-500/20'
                      : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      formData.privacy === 'friends'
                        ? 'bg-green-500 text-white scale-110'
                        : 'bg-green-100 text-green-500 group-hover:bg-green-200'
                    }`}>
                      <Users className="h-6 w-6" />
                    </div>
                    <div className={`font-semibold ${formData.privacy === 'friends' ? 'text-green-700' : 'text-gray-800'}`}>
                      Friends
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Only accepted friends
                    </div>
                    {formData.privacy === 'friends' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Private Option */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, privacy: 'private' })}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                    formData.privacy === 'private'
                      ? 'bg-red-50 border-red-500 shadow-md shadow-red-500/20'
                      : 'bg-white border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      formData.privacy === 'private'
                        ? 'bg-red-500 text-white scale-110'
                        : 'bg-red-100 text-red-500 group-hover:bg-red-200'
                    }`}>
                      <Lock className="h-6 w-6" />
                    </div>
                    <div className={`font-semibold ${formData.privacy === 'private' ? 'text-red-700' : 'text-gray-800'}`}>
                      Private
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Only you &amp; shared users
                    </div>
                    <div className="text-xs text-red-500 font-medium mt-1">(Default)</div>
                    {formData.privacy === 'private' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            </div>
        )

      case 1: // Accommodation
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-gray-800">Accommodation Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, accommodation_rating: star })}
                    className={`text-2xl ${star <= formData.accommodation_rating ? 'text-yellow-400' : 'text-gray-400'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-800">Accommodation Type</Label>
              <Input
                placeholder="Hotel, Airbnb, Resort, etc."
                value={formData.accommodation_type}
                onChange={(e) => setFormData({ ...formData, accommodation_type: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">URL to Accommodation</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={formData.accommodation_url}
                onChange={(e) => setFormData({ ...formData, accommodation_url: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Other Accommodation Link</Label>
              <Input
                type="url"
                placeholder="Alternative booking link..."
                value={formData.other_accommodation_link}
                onChange={(e) => setFormData({ ...formData, other_accommodation_link: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Accommodation Excursion</Label>
              <Textarea
                placeholder="Activities or excursions from your accommodation..."
                value={formData.accommodation_excursion}
                onChange={(e) => setFormData({ ...formData, accommodation_excursion: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
              />
            </div>
          </div>
        )

      case 2: // Restaurant
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-gray-800">Restaurant Review</Label>
              <Textarea
                placeholder="Your overall review of the restaurant experience..."
                value={formData.restaurant_review}
                onChange={(e) => setFormData({ ...formData, restaurant_review: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-gray-800">Restaurant Type</Label>
              <Input
                placeholder="Italian, Japanese, Local cuisine, etc."
                value={formData.restaurant_type}
                onChange={(e) => setFormData({ ...formData, restaurant_type: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Restaurant Name</Label>
              <Input
                placeholder="Name of the restaurant..."
                value={formData.restaurant_name}
                onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Best Food of Restaurant</Label>
              <Textarea
                placeholder="What dishes were the best..."
                value={formData.best_food_restaurant}
                onChange={(e) => setFormData({ ...formData, best_food_restaurant: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-gray-800">Restaurant Excursion</Label>
              <Textarea
                placeholder="Any dining-related activities or experiences..."
                value={formData.restaurant_excursion}
                onChange={(e) => setFormData({ ...formData, restaurant_excursion: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
              />
            </div>
          </div>
        )

      case 3: // Airline
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-gray-800">Airline Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, airline_rating: star })}
                    className={`text-2xl ${star <= formData.airline_rating ? 'text-yellow-400' : 'text-gray-400'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-800">Airline Name</Label>
              <Input
                placeholder="Delta, United, Southwest, etc."
                value={formData.airline_name}
                onChange={(e) => setFormData({ ...formData, airline_name: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Airline Cost</Label>
              <Input
                type="number"
                placeholder="350.00"
                value={formData.airline_cost}
                onChange={(e) => setFormData({ ...formData, airline_cost: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Quantity Of Flight</Label>
              <Input
                placeholder="2 (round trip), 4, etc."
                value={formData.quantity_of_flight}
                onChange={(e) => setFormData({ ...formData, quantity_of_flight: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Airline Excursion</Label>
              <Textarea
                placeholder="Airport lounges, in-flight experiences, related activities..."
                value={formData.airline_excursion}
                onChange={(e) => setFormData({ ...formData, airline_excursion: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
              />
            </div>
          </div>
        )

      case 4: // Rental Car
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-gray-800">Rental Car Review</Label>
              <Textarea
                placeholder="Your review of the rental car experience..."
                value={formData.rental_car_review}
                onChange={(e) => setFormData({ ...formData, rental_car_review: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-gray-800">Rental Car Company</Label>
              <Input
                placeholder="Enterprise, Hertz, Budget, etc."
                value={formData.rental_car_company}
                onChange={(e) => setFormData({ ...formData, rental_car_company: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Rental Car Cost</Label>
              <Input
                type="number"
                placeholder="250.00 (total cost)"
                value={formData.rental_car_cost}
                onChange={(e) => setFormData({ ...formData, rental_car_cost: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Quantity of Car</Label>
              <Input
                placeholder="1, 2, etc."
                value={formData.quantity_of_car}
                onChange={(e) => setFormData({ ...formData, quantity_of_car: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-800">Excursion (Rental Car Excursion)</Label>
              <Textarea
                placeholder="Road trips, scenic drives, car-related activities..."
                value={formData.rental_car_excursion}
                onChange={(e) => setFormData({ ...formData, rental_car_excursion: e.target.value })}
                className="bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-400 min-h-[80px]"
              />
            </div>
          </div>
        )

      case 5: // Photos
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
                            setCoverPhoto(null)
                            setFormData(prev => ({ ...prev, cover_photo_url: '' }))
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
                        const file = e.target.files[0]
                        if (file) handleCoverPhotoUpload(file)
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
                        if (e.target.files.length > 0) {
                          handleGalleryPhotoUpload(e.target.files)
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
                          onClick={() => removeGalleryPhoto(index)}
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

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto bg-white text-gray-800 border-gray-200 mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800">
            {mode === 'edit' ? `Edit Trip - ${STEPS[step].name}` : `${STEPS[step].name}`}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {step === 0 && "Enter the basic details for your trip"}
            {step === 1 && "Rate and describe your accommodation"}
            {step === 2 && "Share your restaurant experience"}
            {step === 3 && "Rate your airline experience"}
            {step === 4 && "Review your rental car experience"}
            {step === 5 && "Add photos to bring your trip to life"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all ${
                index <= step ? 'bg-gradient-to-r from-indigo-500 to-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        {renderStepContent()}

        {/* Footer: Trip Type & Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
          {/* Trip Type Selection */}
          <div>
            <Label className="text-gray-800 text-sm font-medium mb-3 block">Trip Type</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTripType('taken')}
                className={`flex-1 relative px-4 py-3 rounded-xl font-medium text-sm transition-all overflow-hidden group ${
                  tripType === 'taken'
                    ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {tripType === 'taken' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Trip Taken
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTripType('future')}
                className={`flex-1 relative px-4 py-3 rounded-xl font-medium text-sm transition-all overflow-hidden group ${
                  tripType === 'future'
                    ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/50'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {tripType === 'future' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
                <span className="relative flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Future Trip
                </span>
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-4">
            <Button
              onClick={handleBack}
              disabled={step === 0}
              variant="ghost"
              className="text-gray-800 hover:bg-white/10 w-full sm:w-auto order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="order-1 sm:order-2">
              {step < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={step === 0 && (!formData.trip_name || !formData.location)}
                  className="relative overflow-hidden group bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 ring-2 ring-purple-400/50 hover:ring-purple-400/70 transition-all w-full sm:w-auto"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center">
                    Next: {STEPS[step + 1].name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="relative overflow-hidden group bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 ring-2 ring-purple-400/50 hover:ring-purple-400/70 transition-all w-full sm:w-auto"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center">
                    {loading ? 'Saving...' : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {mode === 'edit' ? 'Update Trip' : 'Save Trip'}
                      </>
                    )}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TripCreationForm
