'use client'

import React from 'react';

const WhoWeAreSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h6 className="text-[#4DB8BA] text-sm font-bold uppercase tracking-wider mb-4">Our Approach</h6>
          <h2 className="text-4xl md:text-5xl font-bold text-[#3a4d6f] leading-tight mb-6">
            The Anti-Anonymous-Review Approach
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're not a review marketplace. We're a <strong className="text-[#ec4899]">trusted trip log</strong> for real people who actually know each other.
          </p>
        </div>

        {/* Feature Steps */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="text-4xl font-bold text-[#4DB8BA] mb-4">1</div>
            <h4 className="text-2xl font-bold text-[#3a4d6f] mb-4">
              Log your real experiences
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Dates, stops, maps, photos, costs, and a "Lessons Learned" section built-in.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="text-4xl font-bold text-[#4DB8BA] mb-4">2</div>
            <h4 className="text-2xl font-bold text-[#3a4d6f] mb-4">
              Access trusted trip logs
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Browse trips from your friends and family or chosen circles.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="text-4xl font-bold text-[#4DB8BA] mb-4">3</div>
            <h4 className="text-2xl font-bold text-[#3a4d6f] mb-4">
              Ask real questions, get real answers
            </h4>
            <p className="text-gray-600 leading-relaxed">
              No bots, no paid placements.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="text-4xl font-bold text-[#4DB8BA] mb-4">4</div>
            <h4 className="text-2xl font-bold text-[#3a4d6f] mb-4">
              Plan with confidence
            </h4>
            <p className="text-gray-600 leading-relaxed">
              Reuse checklists and avoid the mistakes your people already made.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAreSection;