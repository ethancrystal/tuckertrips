// Analytics Utility
// Helper functions for tracking user interactions and conversion metrics

/**
 * Generate or retrieve a session ID for anonymous tracking
 * Stored in sessionStorage to persist across page navigations
 */
export function getSessionId() {
  if (typeof window === 'undefined') return null
  
  let sessionId = sessionStorage.getItem('analytics_session_id')
  
  if (!sessionId) {
    // Generate a simple session ID (timestamp + random)
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  
  return sessionId
}

/**
 * Track Sign-Up button click
 * @param {string} buttonLocation - Location of the button (header, hero_start_trip, etc.)
 * @param {string} referrer - Optional referrer URL
 */
export async function trackSignupClick(buttonLocation, referrer = null) {
  try {
    const sessionId = getSessionId()
    
    if (!sessionId) {
      console.warn('[Analytics] Cannot track click - no session ID')
      return
    }
    
    // Send tracking request (fire and forget - don't block UI)
    fetch('/api/analytics/signup-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        buttonLocation,
        referrer: referrer || document.referrer || null,
      }),
    }).catch(error => {
      // Silently fail - don't disrupt user experience
      console.error('[Analytics] Failed to track signup click:', error)
    })
    
  } catch (error) {
    console.error('[Analytics] Signup click tracking error:', error)
  }
}

/**
 * Valid button locations for Sign-Up tracking
 */
export const SIGNUP_BUTTON_LOCATIONS = {
  HEADER: 'header',
  HERO_START_TRIP: 'hero_start_trip',
  HERO_BROWSE_TRIPS: 'hero_browse_trips',
  AUTH_MODAL_TAB: 'auth_modal_tab',
  AUTH_MODAL_SUBMIT: 'auth_modal_submit',
}
