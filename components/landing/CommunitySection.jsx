'use client'

import React from 'react';
import { Shield } from 'lucide-react';

const CommunitySection = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="order-2 md:order-1">
            <img
              src="https://images.unsplash.com/photo-1551632811-561732d1e306"
              alt="Person hiking mountains"
              className="w-full h-[500px] object-cover rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 border-4 border-[#7dbbe5]/30"
            />
          </div>

          {/* Content */}
          <div className="order-1 md:order-2 space-y-6">
            <h6 className="text-[#4DB8BA] text-sm font-bold uppercase tracking-wider">Your Trusted Circle</h6>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2a3a5a] leading-tight">
              Capture Every Moment!
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed font-medium">
              Travel is packed with priceless lessons-document it all here! Your future self (and friends) will thank you.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#4DB8BA] to-[#5bc3c5] rounded-full flex items-center justify-center mt-1 shadow-lg">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-[#2a3a5a] mb-1 text-lg">Master Your Journey!</h4>
                  <p className="text-gray-700">Plan like a pro! Save time, money, and headaches by tapping into your network's insider tips-skip the faceless online reviews!</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#ec4899] to-[#f472b6] rounded-full flex items-center justify-center mt-1 shadow-lg">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-[#2a3a5a] mb-1 text-lg">Build Your Adventure Tribe!</h4>
                  <p className="text-gray-700">Turn connections into a powerhouse of shared experiences. Swap stories, trade tips, and grow your travel community!</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#4DB8BA]/15 to-[#4DB8BA]/10 border-l-8 border-[#4DB8BA] p-6 rounded-lg flex items-center gap-3 shadow-lg">
              <Shield className="w-7 h-7 text-[#4DB8BA] flex-shrink-0 drop-shadow" />
              <p className="text-base font-bold text-[#2a3a5a]">
                Private by default. Flip to public when you're ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;