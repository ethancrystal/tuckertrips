'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { X, ArrowRight, MapPin, Clock, Share2, Globe, Lock, Plus, Compass } from 'lucide-react'
import { toast } from 'sonner'

const OnboardingFlow = ({ open, onClose, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const [completedSteps, setCompletedSteps] = useState(new Set())

  const slides = [
    {
      title: "Welcome to Tucker Trips",
      body: "This is where your trips live — past, present, and future. Let's take 30 seconds to show you around.",
      icon: <MapPin className="w-16 h-16 text-pink-500" />,
      cta: "Let's go"
    },
    {
      title: "Your Travel History",
      body: "My Trips is your personal space for past trips. Add memories, photos, and notes — this is your travel diary.",
      icon: <Clock className="w-16 h-16 text-blue-500" />,
      cta: "Got it",
      highlight: "mytrips"
    },
    {
      title: "Plan What's Next",
      body: "Future Trips is where you plan upcoming journeys. You can edit details anytime as plans change.",
      icon: <Plus className="w-16 h-16 text-purple-500" />,
      cta: "Understood",
      highlight: "future"
    },
    {
      title: "Share on Your Terms",
      body: "Every trip can be Private, or Public. You're always in control of who sees what.",
      icon: <Share2 className="w-16 h-16 text-green-500" />,
      cta: "Nice",
      highlight: "sharing"
    },
    {
      title: "Get Inspired",
      body: "Explore trips shared publicly by others. Perfect for ideas and discovering new places.",
      icon: <Globe className="w-16 h-16 text-orange-500" />,
      cta: "Explore",
      highlight: "discover"
    },
    {
      title: "Ready to Start?",
      body: "The best way to use Tucker Trips is to create your first trip. Ready to begin?",
      icon: <MapPin className="w-16 h-16 text-pink-500" />,
      primaryCta: "Create Your First Trip",
      secondaryCta: "Skip for now",
      isFinal: true
    }
  ]

  const handleNext = () => {
    if (currentStep < slides.length - 1) {
      setCompletedSteps(prev => new Set(prev).add(currentStep))
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleComplete = () => {
    onComplete()
    toast.success("Welcome to Tucker Trips! 🎉")
  }

  const handleSkip = () => {
    const confirmed = window.confirm(
      "Skip onboarding?\n\nNo problem — you can explore on your own. We'll still give you helpful tips as you go."
    )
    if (confirmed) {
      onSkip()
      setShowTooltip(true)
    }
  }

  const handleTooltipAction = (action) => {
    setShowTooltip(false)
    if (action === 'create') {
      handleComplete()
    }
  }

  const progress = ((currentStep + 1) / slides.length) * 100

  return (
    <>
      {/* Main Onboarding Modal */}
      <Dialog open={open && !showTooltip} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-gradient-to-br from-[#343f65] to-[#2a3352] text-white border-[#ff34ac]/30">
          <DialogTitle className="sr-only">Welcome to Tucker Trips</DialogTitle>
          <DialogDescription className="sr-only">Quick tour to help you get started with Tucker Trips</DialogDescription>
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            title="Skip onboarding"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Skip</span>
          </button>

          <div className="p-8 text-center space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2 bg-white/20" />
              <p className="text-xs text-gray-400">
                Step {currentStep + 1} of {slides.length}
              </p>
            </div>

            {/* Icon */}
            <div className="flex justify-center">
              {slides[currentStep].icon}
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                {slides[currentStep].title}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {slides[currentStep].body}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {slides[currentStep].isFinal ? (
                <>
                  <Button
                    onClick={handleComplete}
                    className="w-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] hover:from-[#e91e63] hover:to-[#6bb6d6] text-white font-semibold py-3 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    {slides[currentStep].primaryCta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="w-full text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 py-3"
                  >
                    {slides[currentStep].secondaryCta}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] hover:from-[#e91e63] hover:to-[#6bb6d6] text-white font-semibold py-3 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  {slides[currentStep].cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post-Skip Tooltip */}
      {showTooltip && (
        <div className="fixed bottom-8 right-8 max-w-sm bg-[#343f65] text-white p-4 rounded-lg shadow-2xl border border-[#ff34ac]/30 z-50 animate-pulse">
          <div className="flex items-start space-x-3">
            <MapPin className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold mb-1">That's it!</h4>
              <p className="text-sm text-gray-300 mb-3">
                You're all set — start by creating your first trip.
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => handleTooltipAction('create')}
                  className="bg-[#ff34ac] hover:bg-[#e91e63] text-white"
                >
                  Create Trip
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowTooltip(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default OnboardingFlow
