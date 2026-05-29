// Shared types for TripCreation components

export interface TripFormData {
  // Step 1: Trip Basics
  trip_name: string
  location: string
  start_date: string
  end_date: string
  description: string
  privacy: 'public' | 'friends' | 'private'

  // Step 2: Accommodation
  accommodation_rating: number
  accommodation_type: string
  accommodation_url: string
  /** Secondary booking link (e.g. direct hotel site) */
  other_accommodation_link: string
  /** Activities or excursions based at the accommodation */
  accommodation_excursion: string

  // Step 3: Restaurant
  restaurant_rating: number
  restaurant_type: string
  /** Name of the featured restaurant */
  restaurant_name: string
  best_food: string
  /** Best dishes or food highlights */
  best_food_restaurant: string
  /** Overall written review of the restaurant experience */
  restaurant_review: string
  /** Dining-related activities or experiences */
  restaurant_excursion: string

  // Step 4: Airline
  airline_rating: number
  airline_name: string
  airline_cost: string
  /** Number of flights (e.g. 2 for round-trip) */
  quantity_of_flight: string
  /** Airport lounges, in-flight experiences, related activities */
  airline_excursion: string

  // Step 5: Rental Car
  rental_rating: number
  rental_company: string
  rental_cost: string
  /** Written review of the rental car experience */
  rental_car_review: string
  /** Rental company name (extended alias for rental_company) */
  rental_car_company: string
  /** Total rental cost (extended alias for rental_cost) */
  rental_car_cost: string
  /** Number of cars rented */
  quantity_of_car: string
  /** Road trips, scenic drives, car-related activities */
  rental_car_excursion: string

  // Photos
  coverPhoto: string | null
  galleryPhotos: string[]
}

export interface TripStepProps {
  formData: TripFormData
  onChange: (updates: Partial<TripFormData>) => void
  mode: 'create' | 'edit'
}

export type TripType = 'taken' | 'future'

export const STEPS = [
  { name: 'Trip Basics', description: 'Enter the basic details for your trip' },
  { name: 'Accommodation', description: 'Rate and describe your accommodation' },
  { name: 'Restaurant', description: 'Share your restaurant experience' },
  { name: 'Airline', description: 'Rate your airline experience' },
  { name: 'Rental Car', description: 'Review your rental car experience' },
  { name: 'Photos', description: 'Add photos to bring your trip to life' },
] as const

export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5
