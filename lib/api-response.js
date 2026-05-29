import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export function successResponse(data, status = 200) {
  return NextResponse.json({
    success: true,
    data
  }, { status })
}

export function errorResponse(message, status = 500, details = null, headers = null) {
  if (status >= 500 && details) {
    Sentry.captureException(
      details instanceof Error ? details : new Error(typeof details === 'string' ? details : message),
      { extra: { userMessage: message, statusCode: status } }
    )
  }

  const response = {
    success: false,
    error: message
  }

  if (process.env.NODE_ENV === 'development' && details) {
    response.details = typeof details === 'object' && details.message ? details.message : details
  }

  const options = { status }
  if (headers) {
    options.headers = headers
  }

  return NextResponse.json(response, options)
}

/**
 * Returns a validation error response
 * @param {Object|Array} errors - Validation errors (Zod format or custom)
 * @returns {NextResponse}
 */
export function validationErrorResponse(errors) {
  return NextResponse.json({
    success: false,
    error: 'Validation failed',
    errors
  }, { status: 400 })
}

/**
 * Returns an unauthorized error response
 * @param {string} message - Optional custom message (default: 'Unauthorized')
 * @returns {NextResponse}
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 401 })
}

/**
 * Returns a not found error response
 * @param {string} message - Optional custom message (default: 'Resource not found')
 * @returns {NextResponse}
 */
export function notFoundResponse(message = 'Resource not found') {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 404 })
}

/**
 * Returns a forbidden error response
 * @param {string} message - Optional custom message (default: 'Forbidden')
 * @returns {NextResponse}
 */
export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({
    success: false,
    error: message
  }, { status: 403 })
}
