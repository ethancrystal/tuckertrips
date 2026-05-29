'use client'

import React, { useState, useEffect } from 'react';
import { Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/60 backdrop-blur-xl shadow-xl border-b border-white/30'
        : 'bg-white/80 backdrop-blur-md shadow-md border-b border-white/20'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Animation with background removal */}
          <div className="flex items-center">
            <div className="relative h-16 w-[250px] overflow-hidden flex items-center">
              <video
                src="/videos/logo-animation.mp4"
                className="w-full h-auto mix-blend-multiply"
                autoPlay
                loop
                muted
                playsInline
                style={{ filter: 'contrast(1.2) brightness(1.1)' }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="bg-gradient-to-r from-[#4DB8BA] to-[#5bc3c5] hover:from-[#3da7a9] hover:to-[#4DB8BA] text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Us</span>
            </Button>
            <Button
              variant="ghost"
              className="bg-gradient-to-r from-[#ec4899] to-[#f472b6] hover:from-[#db2777] hover:to-[#ec4899] text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Login/Signup</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
