// API Types and Interfaces
// Request/Response types for all API endpoints

export type { Trip, AirlineInfo, AccommodationInfo, TripSegment } from './database'

import type {
  Profile,
  TripWithProfile,
  MessageWithUsers,
  AirlineInfo,
  AccommodationInfo,
  TripSegment
} from './database'

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthUser {
  id: string
  email: string
  fullName: string
  bio?: string | undefined
  avatarUrl?: string | undefined
  coverPhotoUrl?: string | undefined
  isOnline?: boolean | undefined
  lastSeen?: string | undefined
}

export interface AuthResponse {
  user: AuthUser
  session?: any // Supabase session type from @supabase/supabase-js
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface PasswordResetRequest {
  email: string
}

export interface ProfileUpdateRequest {
  fullName?: string
  bio?: string
  avatarUrl?: string
  coverPhotoUrl?: string
}

// ============================================================================
// Trip Types
// ============================================================================

export interface CreateTripRequest {
  trip_name: string
  destination: string
  start_date?: string
  end_date?: string
  description?: string
  trip_type?: 'taken' | 'future' | 'ongoing'
  visibility?: 'private' | 'friends' | 'public'
  cover_image?: string
  weather?: string
  overall_comment?: string
  overall_rating?: number
  airlines?: AirlineInfo[]
  accommodations?: AccommodationInfo[]
  segments?: TripSegment[]
}

export interface UpdateTripRequest extends Partial<CreateTripRequest> {
  sharedWith?: string[]
}

export interface TripResponse extends TripWithProfile {
  canEdit?: boolean
}

export interface PublicTripResponse {
  id: string
  trip_name: string
  destination: string
  start_date: string | null
  end_date: string | null
  trip_type: string
  visibility: string
  cover_image: string | null
  user_id: string
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  created_at: string
}

// ============================================================================
// Message Types
// ============================================================================

export interface SendMessageRequest {
  recipientId: string
  content: string
}

export interface GetMessagesRequest {
  conversationId?: string
}

export interface MessageResponse extends MessageWithUsers {}

export interface ConversationResponse {
  conversation_id: string
  other_user_id: string
  other_user_name: string | null
  other_user_avatar: string | null
  last_message_content: string
  last_message_time: string
  unread_count: number
}

// ============================================================================
// User Management Types
// ============================================================================

export interface HeartbeatResponse {
  success: boolean
}

export interface OnlineUser {
  id: string
  full_name: string | null
  avatar_url: string | null
  is_online: boolean
  last_seen: string
}

export interface FriendRequest {
  friendId: string
}

export interface FriendResponse extends Profile {
  friendship_status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  friendship_created_at: string
}

// ============================================================================
// Trip Sharing Types
// ============================================================================

export interface ShareTripRequest {
  tripId: string
  recipientEmail?: string
  recipientId?: string
  shareType: 'email' | 'link'
  permissions: 'view' | 'edit' | 'comment'
}

export interface ShareTripResponse {
  shareId: string
  shareLink?: string
  recipientEmail?: string
  permissions: string
}

export interface PendingShareRequest {
  tripId: string
  recipientEmail: string
  inviteLink: string
}

export interface ClaimInvitationRequest {
  inviteLink: string
}

// ============================================================================
// Generic API Types
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

export interface ApiError {
  error: string
  details?: string | string[]
  code?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface ValidationError extends ApiError {
  details: string[] // Zod validation error messages
}

// ============================================================================
// HTTP Method Types
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'

export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string>
}

// ============================================================================
// API Client Configuration
// ============================================================================

export interface ApiClientConfig {
  baseURL?: string
  headers?: Record<string, string>
  timeout?: number
  retries?: number
}

// ============================================================================
// Error Types
// ============================================================================

export interface NetworkError extends Error {
  name: 'NetworkError'
  code?: string
  response?: Response
}

export interface AuthenticationError extends Error {
  name: 'AuthenticationError'
  code?: string
}

export interface ValidationError extends Error {
  name: 'ValidationError'
  details: string[]
}

export interface NotFoundError extends Error {
  name: 'NotFoundError'
  resource?: string
}

export interface PermissionError extends Error {
  name: 'PermissionError'
  resource?: string
  action?: string
}

// ============================================================================
// Type Guards
// ============================================================================

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'error' in error
}

export function isValidationError(error: unknown): error is ValidationError {
  return isApiError(error) && Array.isArray((error as any).details)
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof Error && error.name === 'NetworkError'
}

export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof Error && error.name === 'AuthenticationError'
}

// ============================================================================
// Utility Types
// ============================================================================

export type SuccessResponse<T> = {
  success: true
  data: T
}

export type ErrorResponse = {
  success: false
  error: string
  details?: string | string[]
}

export type ApiResult<T> = SuccessResponse<T> | ErrorResponse

// Helper to extract success type
export type ExtractSuccess<T> = T extends SuccessResponse<infer U> ? U : never

// Helper to extract error type
export type ExtractError<T> = T extends ErrorResponse ? T : never
