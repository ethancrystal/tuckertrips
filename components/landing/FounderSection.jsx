'use client'

import React from 'react';
import { Heart } from 'lucide-react';

const FounderSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-white via-[#f8f9fa] to-white">
      <div className="max-w-7xl mx-auto">
        {/* Testimonial Quote */}
        <div className="mb-16 bg-gradient-to-br from-[#4DB8BA]/15 to-[#ec4899]/15 p-12 rounded-2xl border-l-8 border-[#ec4899] shadow-xl">
          <blockquote className="text-xl md:text-2xl text-gray-800 italic leading-relaxed mb-6 font-medium">
            "I stopped doom-scrolling strangers' reviews. With Tucker Trips, I plan using notes from people I actually know."
          </blockquote>
          <p className="text-lg font-bold text-[#2a3a5a]">— Kristin Stein, Founder</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2a3a5a] leading-tight">
              Why I Founded Tucker Trips
            </h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed font-medium">
              <p>
                I started Tucker Trips after becoming frustrated with the endless search for reviews from strangers while trying to plan the perfect family vacation. As someone who loves exploring new places, I believe in the value of being well-informed before setting out on any adventure. With practical information at hand, I can focus on enjoying my time rather than hunting for activities and adventures once I arrive.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 text-[#ec4899]">
              <Heart className="w-7 h-7 fill-current drop-shadow-lg" />
              <p className="text-base font-bold">In loving memory of Tucker, my loyal travel companion</p>
            </div>
          </div>

          {/* Images - Kristin with Tucker */}
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://customer-assets.emergentagent.com/job_tucker-trips/artifacts/7algba6y_Screenshot%202025-11-11%20170344.jpg"
              alt="Kristin Stein with Tucker outdoors"
              className="w-full h-64 object-cover rounded-xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300 border-4 border-[#4DB8BA]/30"
            />
            <img
              src="https://customer-assets.emergentagent.com/job_tucker-trips/artifacts/nq0qra6v_Screenshot%202025-11-11%20170414.jpg"
              alt="Kristin Stein and Tucker"
              className="w-full h-64 object-cover rounded-xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300 border-4 border-[#ec4899]/30"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default FounderSection;