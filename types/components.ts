// React Component Types
// Props and state types for all React components

import { ReactNode, FormEvent, ChangeEvent } from 'react'
import { AuthUser, Trip, Profile, Message } from './database'

// ============================================================================
// Base Component Props
// ============================================================================

export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  style?: React.CSSProperties
}

export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
}

// ============================================================================
// Authentication Components
// ============================================================================

export interface AuthModalProps extends ModalProps {
  onSuccess: (user: AuthUser) => void
  defaultMode?: 'login' | 'register'
}

export interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string }) => void
  loading?: boolean
  error?: string
  showResetPassword?: boolean
  onResetPassword?: () => void
}

export interface RegisterFormProps {
  onSubmit: (userData: { email: string; password: string; fullName: string }) => void
  loading?: boolean
  error?: string
}

export interface ResetPasswordFormProps {
  onSubmit: (email: string) => void
  loading?: boolean
  success?: boolean
  onBackToLogin?: () => void
}

// ============================================================================
// Trip Components
// ============================================================================

export interface TripCardProps extends BaseComponentProps {
  trip: Trip & {
    profiles?: {
      id: string
      full_name: string | null
      avatar_url: string | null
    }
  }
  onEdit?: (trip: Trip) => void
  onDelete?: (tripId: string) => void
  onShare?: (trip: Trip) => void
  onView?: (trip: Trip) => void
  canEdit?: boolean
  showActions?: boolean
  compact?: boolean
}

export interface TripListProps extends BaseComponentProps {
  trips: Trip[]
  loading?: boolean
  error?: string
  onTripClick?: (trip: Trip) => void
  emptyMessage?: string
  showCreateButton?: boolean
  onCreateTrip?: () => void
}

export interface TripCreationFormProps extends ModalProps {
  initialData?: Partial<Trip>
  onSubmit: (tripData: any) => void
  loading?: boolean
  error?: string
}

export interface TripEditFormProps extends TripCreationFormProps {
  tripId: string
  initialData: Trip
}

export interface TripDetailViewProps extends ModalProps {
  trip: Trip & {
    profiles?: Profile
    trip_categories?: any[]
  }
  canEdit?: boolean
  onEdit?: (trip: Trip) => void
  onDelete?: (tripId: string) => void
  onShare?: (trip: Trip) => void
}

// ============================================================================
// Dashboard Components
// ============================================================================

export interface DashboardProps extends BaseComponentProps {
  user: AuthUser
  onLogout: () => void
  initialSection?: string
}

export interface DashboardSidebarProps extends BaseComponentProps {
  user: AuthUser
  activeSection: string
  onSectionChange: (section: string) => void
  isOpen: boolean
  onToggle: () => void
}

export interface DashboardStatsProps extends BaseComponentProps {
  stats: {
    totalTrips: number
    futureTrips: number
    completedTrips: number
    sharedTrips: number
  }
  loading?: boolean
}

// ============================================================================
// User Profile Components
// ============================================================================

export interface ProfileCardProps extends BaseComponentProps {
  user: Profile | AuthUser
  showEditButton?: boolean
  onEdit?: () => void
  compact?: boolean
}

export interface ProfileEditFormProps extends ModalProps {
  user: AuthUser
  onSubmit: (updates: any) => void
  loading?: boolean
  error?: string
}

export interface OnlineUsersProps extends BaseComponentProps {
  users: Array<{
    id: string
    full_name: string | null
    avatar_url: string | null
    is_online: boolean
    last_seen: string
  }>
  loading?: boolean
  onUserClick?: (userId: string) => void
}

// ============================================================================
// Message Components
// ============================================================================

export interface MessageListProps extends BaseComponentProps {
  messages: Array<Message & {
    sender: {
      id: string
      full_name: string | null
      avatar_url: string | null
    }
    recipient: {
      id: string
      full_name: string | null
      avatar_url: string | null
    }
  }>
  currentUser: AuthUser
  onSendMessage: (content: string, recipientId: string) => void
  onMarkAsRead: (messageId: string) => void
  loading?: boolean
}

export interface MessageItemProps extends BaseComponentProps {
  message: Message & {
    sender: {
      id: string
      full_name: string | null
      avatar_url: string | null
    }
  }
  isOwn: boolean
  onMarkAsRead?: (messageId: string) => void
}

export interface MessageInputProps extends BaseComponentProps {
  recipientId?: string
  onSend: (content: string, recipientId?: string) => void
  loading?: boolean
  placeholder?: string
  disabled?: boolean
}

export interface ConversationListProps extends BaseComponentProps {
  conversations: Array<{
    conversation_id: string
    other_user_id: string
    other_user_name: string | null
    other_user_avatar: string | null
    last_message_content: string
    last_message_time: string
    unread_count: number
  }>
  onConversationSelect: (conversationId: string) => void
  selectedConversationId?: string
  loading?: boolean
}

// ============================================================================
// Trip Sharing Components
// ============================================================================

export interface ShareTripModalProps extends ModalProps {
  trip: Trip
  onShare: (shareData: any) => void
  loading?: boolean
  error?: string
}

export interface ShareLinkProps extends BaseComponentProps {
  shareLink: string
  onCopy?: () => void
  copied?: boolean
}

export interface InviteUsersProps extends BaseComponentProps {
  tripId: string
  onInvite: (emailOrUserId: string, type: 'email' | 'user') => void
  loading?: boolean
  error?: string
}

// ============================================================================
// Form Components
// ============================================================================

export interface FormFieldProps extends BaseComponentProps {
  label: string
  name: string
  value: any
  onChange: (value: any) => void
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea'
}

export interface FormSelectProps extends BaseComponentProps {
  label: string
  name: string
  value: any
  onChange: (value: any) => void
  options: Array<{ value: any; label: string }>
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
}

export interface FormCheckboxProps extends BaseComponentProps {
  label: string
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  disabled?: boolean
}

export interface FormDatePickerProps extends BaseComponentProps {
  label: string
  name: string
  value?: string
  onChange: (date: string | null) => void
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  minDate?: string
  maxDate?: string
}

// ============================================================================
// UI Component Props
// ============================================================================

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  href?: string
  children: ReactNode
}

export interface InputProps extends BaseComponentProps {
  type?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  name?: string
}

export interface TextAreaProps extends BaseComponentProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  name?: string
  rows?: number
}

export interface SelectProps extends BaseComponentProps {
  value?: any
  onChange?: (value: any) => void
  options: Array<{ value: any; label: string }>
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  name?: string
}

export interface ModalTriggerProps extends BaseComponentProps {
  onOpen: () => void
  children: ReactNode
}

// ============================================================================
// Layout Components
// ============================================================================

export interface LayoutProps extends BaseComponentProps {
  children: ReactNode
  sidebar?: ReactNode
  header?: ReactNode
  footer?: ReactNode
}

export interface HeaderProps extends BaseComponentProps {
  user: AuthUser
  onLogout: () => void
  onNavigate?: (section: string) => void
}

export interface SidebarProps extends BaseComponentProps {
  user: AuthUser
  activeSection?: string
  onSectionChange?: (section: string) => void
  isOpen?: boolean
  onToggle?: () => void
}

export interface FooterProps extends BaseComponentProps {
  links?: Array<{ href: string; label: string }>
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type FormEventHandler<_T = any> = (event: FormEvent<HTMLFormElement>) => void
export type ChangeEventHandler = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
export type ClickEventHandler = (event: React.MouseEvent<HTMLButtonElement>) => void
export type SelectEventHandler<_T = any> = (value: _T) => void

// ============================================================================
// Context Types
// ============================================================================

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  updateProfile: (updates: any) => Promise<void>
  isAuthenticated: boolean
}

export interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export interface NotificationContextType {
  notifications: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    timestamp: string
  }>
  addNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}