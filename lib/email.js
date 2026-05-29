// Email service using Resend Templates
// https://resend.com/docs/send-emails/nextjs

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Template IDs (you'll get these after creating templates)
const TEMPLATES = {
  WELCOME: '', // To be filled after template creation
  PASSWORD_RESET: '',
  TRIP_INVITE: '',
}

/**
 * Create a Resend email template
 * Run this once to create templates in your Resend dashboard
 */
export async function createTemplates() {
  if (!resend) {
    console.warn('Resend not configured - skipping template creation')
    return
  }

  try {
    // Welcome Email Template
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

    return {
      welcome: welcome.id,
      passwordReset: passwordReset.id,
      tripInvite: tripInvite.id,
    }
  } catch (error) {
    console.error('Error creating templates:', error)
    throw error
  }
}

/**
 * Send a welcome email using Resend template
 */
export async function sendWelcomeEmail(email, firstName = 'there') {
  if (!resend) {
    console.warn('Resend not configured - skipping welcome email')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const templateId = TEMPLATES.WELCOME

    if (templateId) {
      // Use template
      const { data, error } = await resend.emails.send({
        from: 'Tucker Trips <noreply@tuckertrips.com>',
        to: email,
        templateId,
        variables: {
          firstName,
          loginUrl: 'https://www.tuckertrips.com',
        },
      })

      if (error) throw error
      return { success: true, data }
    } else {
      // Fallback to inline HTML if template not created yet
      const { data, error } = await resend.emails.send({
        from: 'Tucker Trips <noreply@tuckertrips.com>',
        to: email,
        subject: 'Welcome to Tucker Trips!',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #ff34ac, #7dbbe5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to Tucker Trips! 🌍</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi ${firstName},</p>
              <p>Welcome to Tucker Trips - your personal travel planning and sharing companion!</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.tuckertrips.com" style="display: inline-block; padding: 12px 30px; background: #ff34ac; color: white; text-decoration: none; border-radius: 5px;">Start Planning Trips</a>
              </div>
              <p>Happy travels!<br>The Tucker Trips Team</p>
            </div>
          </div>
        `,
      })

      if (error) throw error
      return { success: true, data }
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send a password reset email using Resend template
 */
export async function sendPasswordResetEmail(email, resetUrl) {
  if (!resend) {
    console.warn('Resend not configured - skipping password reset email')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const templateId = TEMPLATES.PASSWORD_RESET

    if (templateId) {
      const { data, error } = await resend.emails.send({
        from: 'Tucker Trips <noreply@tuckertrips.com>',
        to: email,
        templateId,
        variables: { resetUrl },
      })

      if (error) throw error
      return { success: true, data }
    } else {
      // Fallback
      const { data, error } = await resend.emails.send({
        from: 'Tucker Trips <noreply@tuckertrips.com>',
        to: email,
        subject: 'Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #ff34ac, #7dbbe5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Reset Your Password</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background: #ff34ac; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
              </div>
              <p style="word-break: break-all; color: #ff34ac;">${resetUrl}</p>
              <p style="color: #888;">This link expires in 1 hour.</p>
            </div>
          </div>
        `,
      })

      if (error) throw error
      return { success: true, data }
    }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send a trip invite email using Resend template
 */
export async function sendTripInviteEmail(email, tripTitle, inviteUrl, senderName) {
  if (!resend) {
    console.warn('Resend not configured - skipping trip invite email')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const templateId = TEMPLATES.TRIP_INVITE

    if (templateId) {
      const { data, error } = await resend.emails.send({
        from: 'Tucker Trips <noreply@tuckertrips.com>',
        to: email,
        templateId,
        variables: { senderName, tripTitle, inviteUrl },
      })

      if (error) throw error
      return { success: true, data }
    } else {
      // Fallback
      const { data, error } = await resend.emails.send({
        from: 'Tucker Trips <noreply@tuckertrips.com>',
        to: email,
        subject: `${senderName} shared a trip with you on Tucker Trips!`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #ff34ac, #7dbbe5); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🎉 You're Invited!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p><strong>${senderName}</strong> shared a trip with you:</p>
              <p style="font-size: 18px; color: #ff34ac;"><em>"${tripTitle}"</em></p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="display: inline-block; padding: 12px 30px; background: #ff34ac; color: white; text-decoration: none; border-radius: 5px;">View Trip</a>
              </div>
            </div>
          </div>
        `,
      })

      if (error) throw error
      return { success: true, data }
    }
  } catch (error) {
    console.error('Error sending trip invite email:', error)
    return { success: false, error: error.message }
  }
}
