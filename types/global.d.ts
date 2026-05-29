// Global Type Definitions
// Extending global types and providing global utilities

// ============================================================================
// Global Extensions
// ============================================================================

declare global {
  // Window extensions
  interface Window {
    // Add any global window properties here
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }

  // NodeJS extensions for server-side types
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_KEY?: string
      // Removed MongoDB variables
      // MONGO_URL?: string
      // DB_NAME?: string
      // JWT_SECRET?: string
      CORS_ORIGINS?: string
    }
  }
}

// ============================================================================
// Environment Variables
// ============================================================================

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

// ============================================================================
// Utility Types
// ============================================================================

// Make all properties optional recursively
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Make all properties required recursively
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

// Extract array element type
export type ArrayElement<T> = T extends (infer U)[] ? U : never

// Extract promise value type
export type PromiseValue<T> = T extends Promise<infer U> ? U : T

// Convert object keys to camelCase
export type KeysToCamelCase<T> = T extends object
  ? {
      [K in keyof T as CamelCase<K & string>]: T[K] extends object
        ? KeysToCamelCase<T[K]>
        : T[K]
    }
  : T

// Convert object keys to PascalCase
export type KeysToPascalCase<T> = T extends object
  ? {
      [K in keyof T as PascalCase<K & string>]: T[K] extends object
        ? KeysToPascalCase<T[K]>
        : T[K]
    }
  : T

// Helper types for case conversion
type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
  : S

type PascalCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Uppercase<P1>}${Uppercase<P2>}${PascalCase<P3>}`
  : Uppercase<S>

// ============================================================================
// Common Patterns
// ============================================================================

// Generic state type
export interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// Generic action types for useReducer
export interface Action<T, P = any> {
  type: T
  payload?: P
}

// Pagination type
export interface Pagination {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

// Sort type
export interface Sort {
  field: string
  order: 'asc' | 'desc'
}

// Filter type
export interface Filter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like'
  value: any
}

// ============================================================================
// CSS and Style Types
// ============================================================================

export interface CSSProperties extends React.CSSProperties {
  // Add any custom CSS properties here
  [key: `--${string}`]: string | number
}

export interface Theme {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
    error: string
    warning: string
    success: string
    info: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  breakpoints: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

// ============================================================================
// Performance Types
// ============================================================================

export interface PerformanceMetrics {
  renderTime: number
  componentCount: number
  reRenderCount: number
  memoryUsage: number
}

export interface ComponentMetrics {
  name: string
  renderCount: number
  lastRenderTime: number
  averageRenderTime: number
}

// ============================================================================
// Error Handling Types
// ============================================================================

export interface ErrorInfo {
  componentStack: string
  errorBoundary: string
  timestamp: string
  userAgent: string
  url: string
}

export interface ErrorReport {
  error: Error
  info: ErrorInfo
  userId?: string
  sessionId?: string
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp: string
  userId?: string
  sessionId?: string
}

export interface PageView {
  path: string
  title: string
  referrer?: string
  timestamp: string
  userId?: string
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AppConfig {
  api: {
    baseURL: string
    timeout: number
    retries: number
  }
  auth: {
    sessionTimeout: number
    refreshTokenThreshold: number
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    timezone: string
  }
  features: {
    analytics: boolean
    debugging: boolean
    experimentalFeatures: boolean
  }
}

// ============================================================================
// Export helper types
// ============================================================================

export type Maybe<T> = T | null | undefined

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

export type NonNullable<T> = T extends null | undefined ? never : T

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationRule<T = any> {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: T) => string | undefined
}

export type ValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]: ValidationRule<T[K]>
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string[]>
}

// ============================================================================
// File and Media Types
// ============================================================================

export interface FileUpload {
  file: File
  preview?: string
  progress: number
  error?: string
  url?: string
}

export interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  colorSpace?: string
}

export * from './database'
export * from './api'
export * from './components'