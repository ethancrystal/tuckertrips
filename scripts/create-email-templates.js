#!/usr/bin/env node
/**
 * Create Resend Email Templates
 * Run this once to create email templates in your Resend dashboard
 *
 * Usage: node scripts/create-email-templates.js
 */

import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in .env.local')
  process.exit(1)
}

const resend = new Resend(process.env.RESEND_API_KEY)

async function createTemplates() {
  console.log('🔨 Creating email templates in Resend...\n')

  try {
    // Welcome Email Template
    console.log('Creating welcome email template...')
    const welcome = await resend.templates.create({
      name: 'welcome-email',
      subject: 'Welcome to Tucker Trips!',
      html: `
        <html>
          <body>
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="background: linear-gradient(to right, #ff34ac, #7dbbe5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">Welcome to Tucker Trips! 🌍</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Hi {{firstName}},</p>
                <p>Welcome to Tucker Trips - your personal travel planning and sharing companion!</p>
                <p>Start documenting your adventures, sharing trip details with friends, and discovering new destinations.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{loginUrl}}" style="display: inline-block; padding: 12px 30px; background: #ff34ac; color: white; text-decoration: none; border-radius: 5px;">Start Planning Trips</a>
                </div>
                <p>Happy travels!<br>The Tucker Trips Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
      variables: [
        { key: 'firstName', type: 'string', fallbackValue: 'there' },
        { key: 'loginUrl', type: 'string', fallbackValue: 'https://www.tuckertrips.com' },
      ],
    })
    console.log('✓ Welcome template created:', welcome.id)

    // Password Reset Template
    console.log('Creating password reset template...')
    const passwordReset = await resend.templates.create({
      name: 'password-reset',
      subject: 'Reset Your Password',
      html: `
        <html>
          <body>
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="background: linear-gradient(to right, #ff34ac, #7dbbe5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">Reset Your Password</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>We received a request to reset your password for your Tucker Trips account.</p>
                <p>Click the button below to create a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{resetUrl}}" style="display: inline-block; padding: 12px 30px; background: #ff34ac; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #ff34ac;">{{resetUrl}}</p>
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>This link will expire in 1 hour.</strong></p>
                  <p style="margin: 0;">If you didn't request this password reset, please ignore this email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      variables: [
        { key: 'resetUrl', type: 'string', fallbackValue: '' },
      ],
    })
    console.log('✓ Password reset template created:', passwordReset.id)

    // Trip Invite Template
    console.log('Creating trip invite template...')
    const tripInvite = await resend.templates.create({
      name: 'trip-invite',
      subject: '{{senderName}} shared a trip with you on Tucker Trips!',
      html: `
        <html>
          <body>
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="background: linear-gradient(to right, #ff34ac, #7dbbe5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🎉 You're Invited!</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p><strong>{{senderName}}</strong> shared a trip with you on Tucker Trips:</p>
                <p style="font-size: 18px; color: #ff34ac;"><em>"{{tripTitle}}"</em></p>
                <p>Sign up or log in to view the full trip details, photos, and reviews.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{{inviteUrl}}" style="display: inline-block; padding: 12px 30px; background: #ff34ac; color: white; text-decoration: none; border-radius: 5px;">View Trip</a>
                </div>
                <p>See you there!<br>The Tucker Trips Team</p>
              </div>
            </div>
          </body>
        </html>
      `,
      variables: [
        { key: 'senderName', type: 'string', fallbackValue: 'Someone' },
        { key: 'tripTitle', type: 'string', fallbackValue: 'a trip' },
        { key: 'inviteUrl', type: 'string', fallbackValue: '' },
      ],
    })
    console.log('✓ Trip invite template created:', tripInvite.id)

    console.log('\n✅ All templates created successfully!\n')
    console.log('📝 Add these template IDs to lib/email.js:\n')
    console.log(`const TEMPLATES = {
  WELCOME: '${welcome.id}',
  PASSWORD_RESET: '${passwordReset.id}',
  TRIP_INVITE: '${tripInvite.id}',
}`)
  } catch (error) {
    console.error('❌ Error creating templates:', error)
    process.exit(1)
  }
}

createTemplates()
