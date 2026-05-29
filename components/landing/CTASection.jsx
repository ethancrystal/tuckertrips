'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import { trackSignupClick, SIGNUP_BUTTON_LOCATIONS } from '@/lib/analytics';

const CTASection = ({ onShowAuth }) => {
  const handleStartTrip = () => {
    console.log('Start a Trip clicked')
    trackSignupClick(SIGNUP_BUTTON_LOCATIONS.HERO_START_TRIP)
    onShowAuth()
  }

  const handleExploreDiscover = () => {
    console.log('Explore Discover clicked')
    trackSignupClick(SIGNUP_BUTTON_LOCATIONS.HERO_BROWSE_TRIPS)
    onShowAuth()
  }
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#4DB8BA] via-[#5bc3c5] to-[#6bcfd1] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#ec4899] rounded-full blur-3xl opacity-15"></div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
          Plan your next trip with advice from people who know you
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleStartTrip}
            className="bg-white hover:bg-gray-50 text-[#4DB8BA] font-bold px-12 py-6 text-lg rounded-full shadow-2xl hover:shadow-white/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            Start a Trip
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleExploreDiscover}
            variant="outline"
            className="bg-transparent border-3 border-white text-white hover:bg-white hover:text-[#4DB8BA] font-bold px-12 py-6 text-lg rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            Explore Discover
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CTASection;