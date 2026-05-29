'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Compass } from 'lucide-react';

const HeroSection = () => {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={scrollToContent}
                className="group bg-gradient-to-r from-[#ec4899] to-[#db2777] hover:from-[#db2777] hover:to-[#be185d] text-white font-bold px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-[#ec4899]/40 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Start a Trip
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>

              <Button
                onClick={scrollToContent}
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
              <iframe
                src="https://player.cloudinary.com/embed/?cloud_name=dhvndmbdt&public_id=logo-animation-122_2_ldafoc&profile=cld-default"
                className="w-full h-auto"
                style={{ aspectRatio: '16/9', border: 'none' }}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />

              {/* Decorative gradient overlay on video */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#ec4899]/10 to-transparent pointer-events-none"></div>
            </div>

            {/* Decorative floating elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#ec4899] rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-[#4DB8BA] rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#4DB8BA] rounded-full blur-3xl opacity-10"></div>
      <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#ec4899] rounded-full blur-3xl opacity-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7dbbe5] rounded-full blur-3xl opacity-5"></div>
    </section>
  );
};

export default HeroSection;