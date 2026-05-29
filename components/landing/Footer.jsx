'use client'

import React, { useState } from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Footer = () => {
  // using sonner toast
  const [newsletter, setNewsletter] = useState({ name: '', email: '' });

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast.success("Subscribed! Welcome to Tucker Trips newsletter.");
    setNewsletter({ name: '', email: '' });
  };

  return (
    <footer className="bg-gradient-to-br from-[#2a3a5a] via-[#3a4d6f] to-[#2a3a5a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Symbol */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <img
                src="/favicon.png"
                alt="Tucker Trips"
                className="h-16 w-auto drop-shadow-lg"
              />
            </div>
            <p className="text-gray-300 leading-relaxed font-medium">
              Real travel notes from people you trust. No anonymous reviews—just authentic trip logs from your trusted circle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-300 hover:text-[#ec4899] transition-colors duration-300 font-medium">
                  About
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-[#ec4899] transition-colors duration-300 font-medium">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-300 hover:text-[#ec4899] transition-colors duration-300 font-medium">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-[#ec4899] transition-colors duration-300 font-medium">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-4">Newsletter</h4>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Name"
                value={newsletter.name}
                onChange={(e) => setNewsletter({ ...newsletter, name: e.target.value })}
                className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-[#4DB8BA] focus:ring-[#4DB8BA]"
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={newsletter.email}
                onChange={(e) => setNewsletter({ ...newsletter, email: e.target.value })}
                className="bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-[#4DB8BA] focus:ring-[#4DB8BA]"
                required
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#ec4899] to-[#f472b6] hover:from-[#db2777] hover:to-[#ec4899] text-white font-bold shadow-xl"
              >
                Sign up
              </Button>
              <p className="text-xs text-gray-400 font-medium">
                We never sell your data. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm font-medium">
              © Tucker Trips
            </p>

            {/* Social Icons */}
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#ec4899] hover:to-[#f472b6] rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#ec4899] hover:to-[#f472b6] rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#ec4899] hover:to-[#f472b6] rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#ec4899] hover:to-[#f472b6] rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-lg">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;