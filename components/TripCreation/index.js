// TripCreation Components - Refactored TripCreationForm
// Main entry point for all TripCreation components

// Step Components
export { default as StepBasics } from './StepBasics'
export { default as StepAccommodation } from './StepAccommodation'
export { default as StepRestaurant } from './StepRestaurant'
export { default as StepAirline } from './StepAirline'
export { default as StepRental } from './StepRental'
export { default as StepPhotos } from './StepPhotos'

// Hooks
export { useFormState } from './hooks/useFormState'
export { usePhotoUpload } from './hooks/usePhotoUpload'

// Types
export type { TripFormData, TripStepProps, TripType, StepIndex } from './types'
export { STEPS } from './types'
