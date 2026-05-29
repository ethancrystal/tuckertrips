'use client'

import { useState, useRef } from 'react'
import { Phone, User, ArrowRight, Compass, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CommunitySection from '@/components/landing/CommunitySection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import FounderSection from '@/components/landing/FounderSection'
import ContactSection from '@/components/landing/ContactSection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'
import { trackSignupClick, SIGNUP_BUTTON_LOCATIONS } from '@/lib/analytics'

const LandingPageNew = ({ onShowAuth }) => {
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef(null)

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    })
  }

  const handleBrowseTrips = () => {
    console.log('Browse Trusted Trips clicked')
    // Track Sign-Up button click
    trackSignupClick(SIGNUP_BUTTON_LOCATIONS.HERO_BROWSE_TRIPS)
    // For now, open auth modal to encourage sign up
    onShowAuth()
  }

  const handleStartTrip = () => {
    console.log('Start Trip clicked')
    // Track Sign-Up button click
    trackSignupClick(SIGNUP_BUTTON_LOCATIONS.HERO_START_TRIP)
    onShowAuth()
  }

  const handleAuthModal = () => {
    console.log('Login/Signup clicked')
    // Track Sign-Up button click
    trackSignupClick(SIGNUP_BUTTON_LOCATIONS.HEADER)
    onShowAuth()
  }

  const handleContactUs = () => {
    console.log('Contact Us clicked')
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#303e64] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Animation with background removal */}
            <div
              className="flex items-center relative z-[60] cursor-pointer h-16 w-[250px] overflow-hidden"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              title="Back to top"
            >
              <video
                src="/videos/logo-animation.mp4"
                className="w-full h-auto mix-blend-screen"
                autoPlay
                loop
                muted
                playsInline
                style={{ filter: 'contrast(1.2) brightness(1.2)' }}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleContactUs}
                className="bg-gradient-to-r from-[#4DB8BA] to-[#5bc3c5] hover:from-[#3da7a9] hover:to-[#4DB8BA] text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Contact Us</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleAuthModal}
                className="bg-gradient-to-r from-[#ec4899] to-[#f472b6] hover:from-[#db2777] hover:to-[#ec4899] text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Login/Signup</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen w-full bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center min-h-screen py-20">
              {/* Left Side - Content */}
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ec4899] via-[#f472b6] to-[#ec4899] drop-shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                      Real travel notes
                    </span>
                    <br />
                    <span className="text-[#2a3a5a] font-extrabold">
                      from people you trust
                    </span>
                  </h1>
                  <p className="text-xl text-gray-700 leading-relaxed max-w-lg font-medium">
                    Skip anonymous reviews. Log your trips, share honest lessons, and help your circle travel smarter.
                  </p>
                </div>

                {/* Animated Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 relative z-50">
                  <Button
                    onClick={handleStartTrip}
                    className="group bg-gradient-to-r from-[#ec4899] to-[#db2777] hover:from-[#db2777] hover:to-[#be185d] text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-[#ec4899]/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    Start a Trip
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>

                  <Button
                    onClick={handleBrowseTrips}
                    variant="outline"
                    className="group bg-white border-3 border-[#4DB8BA] text-[#4DB8BA] hover:bg-[#4DB8BA] hover:text-white font-bold px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-[#4DB8BA]/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    <Compass className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Browse Trusted Trips
                  </Button>
                </div>

                {/* Microcopy */}
                <div className="pt-2">
                  <p className="text-sm text-gray-600 font-medium">
                    🔒 Private by default. Share only with the people you choose.
                  </p>
                </div>

                {/* Alt stat line */}
                <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#4DB8BA] rounded-full shadow-lg shadow-[#4DB8BA]/40"></div>
                    <p className="text-sm text-gray-700 font-semibold">No anonymous reviews</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#ec4899] rounded-full shadow-lg shadow-[#ec4899]/40"></div>
                    <p className="text-sm text-gray-700 font-semibold">Friends & family only</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#7dbbe5] rounded-full shadow-lg shadow-[#7dbbe5]/40"></div>
                    <p className="text-sm text-gray-700 font-semibold">Share privately or publicly</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Video Animation */}
              <div className="relative animate-float">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#ec4899]/20 transform hover:scale-[1.02] transition-transform duration-500">
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto"
                  >
                    <source src="https://customer-assets.emergentagent.com/job_43a6966a-d890-4dd3-91aa-8c7f1d773745/artifacts/9o1y7nx5_tucker-trips_compressed.webm" type="video/webm" />
                  </video>

                  {/* Decorative gradient overlay on video */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#ec4899]/10 to-transparent pointer-events-none"></div>

                  {/* Animated Unmute Button */}
                  <button
                    onClick={toggleMute}
                    className="absolute bottom-6 right-6 z-10 group"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    <div className="relative">
                      {/* Pulsing rings animation */}
                      <div className="absolute inset-0 rounded-full bg-[#ec4899] animate-ping opacity-75"></div>
                      <div className="absolute inset-0 rounded-full bg-[#ec4899] animate-pulse opacity-50"></div>

                      {/* Button */}
                      <div className="relative bg-gradient-to-br from-[#ec4899] to-[#db2777] hover:from-[#db2777] hover:to-[#be185d] text-white rounded-full p-4 shadow-2xl shadow-[#ec4899]/50 transition-all duration-300 transform group-hover:scale-110">
                        {isMuted ? (
                          <VolumeX className="w-6 h-6" />
                        ) : (
                          <Volume2 className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Decorative floating elements */}
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#ec4899] rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
                <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-[#4DB8BA] rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#4DB8BA] rounded-full blur-3xl opacity-10 pointer-events-none"></div>
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#ec4899] rounded-full blur-3xl opacity-10 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7dbbe5] rounded-full blur-3xl opacity-5 pointer-events-none"></div>
        </section>

        {/* Other Sections */}
        <FounderSection />
        <CommunitySection />
        <FeaturesSection />
        <div id="contact">
          <ContactSection />
        </div>
        <CTASection onShowAuth={onShowAuth} />
      </main>

      <Footer />
    </div>
  )
}

export default LandingPageNew
