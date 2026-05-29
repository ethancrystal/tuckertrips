'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ContactSection = () => {
  // using sonner toast
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Message Sent! We'll reply within 1–2 business days.");
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h6 className="text-[#4DB8BA] text-sm font-bold uppercase tracking-wider mb-4">Get in Touch</h6>
              <h2 className="text-4xl md:text-5xl font-bold text-[#2a3a5a] mb-6">
                Don't hesitate to reach out
              </h2>
              <p className="text-lg text-gray-700 mb-8 font-medium">
                Questions, ideas, or partnerships? We'd love to hear from you.
              </p>
              <Button className="bg-gradient-to-r from-[#ec4899] to-[#f472b6] hover:from-[#db2777] hover:to-[#ec4899] text-white font-bold px-8 py-6 text-lg rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                Contact Us
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-white to-[#f8f9fa] p-8 rounded-2xl shadow-2xl border-2 border-[#4DB8BA]/20">
            <h3 className="text-2xl font-bold text-[#2a3a5a] mb-6">Send us a message</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-semibold">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 border-gray-300 focus:border-[#4DB8BA] focus:ring-[#4DB8BA]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-700 font-semibold">Phone <span className="text-gray-500 text-sm font-normal">(optional)</span></Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 border-gray-300 focus:border-[#4DB8BA] focus:ring-[#4DB8BA]"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 border-gray-300 focus:border-[#4DB8BA] focus:ring-[#4DB8BA]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-gray-700 font-semibold">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-1 border-gray-300 focus:border-[#4DB8BA] focus:ring-[#4DB8BA]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-gray-700 font-semibold">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-1 min-h-32 border-gray-300 focus:border-[#4DB8BA] focus:ring-[#4DB8BA]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#ec4899] to-[#f472b6] hover:from-[#db2777] hover:to-[#ec4899] text-white font-bold py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Send Message
              </Button>

              <p className="text-sm text-gray-600 text-center font-medium">
                We'll reply within 1–2 business days.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;