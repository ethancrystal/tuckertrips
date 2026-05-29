'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase.js'
import { toast } from 'sonner'
import { Mail, Link as LinkIcon, Facebook, Instagram, Share2, Copy, MessageCircle } from 'lucide-react'

const ShareTripModal = ({ trip, open, onClose, currentUser }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSocialOptions, setShowSocialOptions] = useState(false)

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/shared/${trip.id}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleSocialShare = (platform) => {
    const shareUrl = `${window.location.origin}/shared/${trip.id}`
    const shareText = `Check out this amazing trip to ${trip.destination}: "${trip.trip_name}" shared on Tucker Trips!`

    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    let socialUrl = ''

    switch (platform) {
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        break
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy the link
        handleCopyLink()
        toast.info('Link copied! Paste in your Instagram story or bio.')
        return
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'whatsapp':
        socialUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`
        break
      default:
        return
    }

    if (socialUrl) {
      window.open(socialUrl, '_blank', 'width=600,height=400')
    }
  }

  const handleEmailShare = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)

    try {
      // First, mark trip as shared if it's not already
      if (!trip.is_shared) {
        const { error: updateError } = await supabase
          .from('trips')
          .update({
            is_shared: true,
            shared_at: new Date().toISOString()
          })
          .eq('id', trip.id)
          .eq('user_id', currentUser.id)

        if (updateError) {
          console.error('Error marking trip as shared:', updateError)
          // Don't fail the whole operation if this fails, but log it
        }
      }

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', email.toLowerCase())
        .single()

      if (existingUser) {
        // User exists - create trip share record
        const { error: shareError } = await supabase
          .from('trip_shares')
          .insert({
            trip_id: trip.id,
            shared_by: currentUser.id,
            shared_with: existingUser.id,
            share_type: 'email'
          })

        if (shareError) {
          // Check if already shared
          if (shareError.code === '23505') {
            toast.info('Trip already shared with this user')
          } else {
            throw shareError
          }
        } else {
          toast.success(`Trip shared with ${existingUser.full_name || email}! It will appear in their Shared Trips.`)
        }
      } else {
        // User doesn't exist - send invitation email
        const inviteLink = `${window.location.origin}/invite/${trip.id}?email=${encodeURIComponent(email)}`

        // Try to call edge function to send email
        try {
          const { error: emailError } = await supabase.functions.invoke('send-trip-invitation', {
            body: {
              to_email: email,
              trip_name: trip.trip_name,
              destination: trip.destination,
              sender_name: currentUser.user_metadata?.full_name || currentUser.full_name || currentUser.email,
              invite_link: inviteLink
            }
          })

          if (emailError) {
            throw emailError
          }
          toast.success(`Invitation email sent to ${email}!`)
        } catch (emailErr) {
          console.error('Email function error:', emailErr)
          // Fallback: Create pending share and show invite link
          const { error: pendingError } = await supabase
            .from('pending_shares')
            .insert({
              trip_id: trip.id,
              shared_by: currentUser.id,
              recipient_email: email.toLowerCase(),
              invite_link: inviteLink
            })

          if (pendingError && pendingError.code !== '23505') {
            console.error('Pending share error:', pendingError)
          }

          // Copy invite link to clipboard as fallback
          await navigator.clipboard.writeText(inviteLink)
          toast.success(`Invitation link copied! Share it with ${email} to invite them.`, {
            duration: 5000
          })
        }
      }

      setEmail('')
      // Trigger a refresh of the parent component to update shared trips
      onClose()
    } catch (error) {
      console.error('Share error:', error)
      toast.error('Failed to share trip')
    } finally {
      setLoading(false)
    }
  }

  if (!trip) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#343f65] text-white border-[#ff34ac]/30 max-w-md" data-testid="share-trip-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Share "{trip.trip_name}"
          </DialogTitle>
          <DialogDescription className="text-[#e5dbf1]">
            Share this trip with friends via email or social media
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Share - Primary Action */}
          <div>
            <Label className="text-white mb-2 block font-semibold">Share via Email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEmailShare()}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                data-testid="share-email-input"
              />
              <Button
                onClick={handleEmailShare}
                disabled={loading || !email}
                className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5]"
                data-testid="share-email-btn"
              >
                {loading ? 'Sending...' : <Mail className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-[#e5dbf1] mt-2">
              {trip.visibility === 'private' ? (
                <>This is a <strong>private trip</strong>. The recipient will see it in their "Shared with Me" section after signing up.</>
              ) : (
                <>Share your trip directly. If they're not a member, they'll receive an invitation to join.</>
              )}
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#343f65] px-2 text-[#e5dbf1]">Quick Share Options</span>
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <Button
              onClick={handleCopyLink}
              className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
              data-testid="copy-link-btn"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Share Link
            </Button>
          </div>

          {/* Social Media Toggle */}
          <div>
            <Button
              onClick={() => setShowSocialOptions(!showSocialOptions)}
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {showSocialOptions ? 'Hide Social Options' : 'Share on Social Media'}
            </Button>
          </div>

          {/* Social Media Sharing */}
          {showSocialOptions && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
              <Button
                onClick={() => handleSocialShare('facebook')}
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white border-0"
                data-testid="share-facebook-btn"
              >
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={() => handleSocialShare('twitter')}
                className="bg-black hover:bg-gray-900 text-white border-0"
                data-testid="share-twitter-btn"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X (Twitter)
              </Button>
              <Button
                onClick={() => handleSocialShare('whatsapp')}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white border-0"
                data-testid="share-whatsapp-btn"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleSocialShare('instagram')}
                className="bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#dc2743] hover:opacity-90 text-white border-0"
                data-testid="share-instagram-btn"
              >
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
              </Button>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-[#e5dbf1]">
              <strong>Note:</strong> {trip.visibility === 'public' 
                ? 'This is a public trip. Anyone with the link can view it.'
                : trip.visibility === 'friends'
                  ? 'This trip is visible to friends only. Shared users will need to be accepted as friends to see full details.'
                  : 'This is a private trip. Only people you share it with directly will be able to view it.'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareTripModal
