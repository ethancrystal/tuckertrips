'use client'

import React from 'react';

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#f8f9fa] via-white to-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h6 className="text-[#ec4899] text-sm font-bold uppercase tracking-wider mb-4">How It Works</h6>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2a3a5a] mb-6">
            Real trip logs. Real context. Real trust.
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium">
            Sign up for Tucker Trips today and unlock access to reliable, firsthand travel experiences shared by a trusted community of friends and family. Plan your next adventure with confidence!
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;