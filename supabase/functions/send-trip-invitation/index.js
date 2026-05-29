import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email template for existing members
const memberEmailTemplate = (tripName, destination, senderName, tripUrl) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to View a Trip on Tucker Trips!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #ec4899;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ec4899;
            margin-bottom: 10px;
        }
        .tagline {
            color: #4DB8BA;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .trip-info {
            background: linear-gradient(135deg, #ff34ac 0%, #7dbbe5 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .trip-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .destination {
            font-size: 18px;
            margin-bottom: 5px;
        }
        .sender {
            margin-top: 20px;
            font-style: italic;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ec4899 0%, #4DB8BA 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .social-links {
            margin-top: 15px;
        }
        .social-links a {
            color: #4DB8BA;
            text-decoration: none;
            margin: 0 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌟 Tucker Trips</div>
            <div class="tagline">Real trips. Real friends. Real trust.</div>
        </div>

        <div class="content">
            <h1>🎉 You've Been Invited to View a Trip!</h1>
            <p>${senderName} has shared an amazing trip experience with you on Tucker Trips. See what adventures await!</p>

            <div class="trip-info">
                <div class="trip-name">${tripName}</div>
                <div class="destination">📍 ${destination}</div>
                <div class="sender">Shared by: ${senderName}</div>
            </div>

            <p>Click below to view this detailed trip log, complete with reviews, tips, and insider information from someone you trust.</p>

            <div style="text-align: center;">
                <a href="${tripUrl}" class="cta-button">
                    View Trip Details →
                </a>
            </div>

            <p><strong>What makes Tucker Trips special?</strong></p>
            <ul>
                <li>✅ Get trip recommendations from people you actually know</li>
                <li>✅ Skip the anonymous online reviews</li>
                <li>✅ Access real, firsthand travel experiences</li>
                <li>✅ Plan with confidence using trusted advice</li>
            </ul>
        </div>

        <div class="footer">
            <p>This invitation was sent because you're a member of the Tucker Trips community.</p>
            <div class="social-links">
                <a href="#">About</a> •
                <a href="#">Contact</a> •
                <a href="#">Privacy</a>
            </div>
            <p style="margin-top: 15px; font-size: 12px;">
                © 2024 Tucker Trips. Capture Every Moment!
            </p>
        </div>
    </div>
</body>
</html>
`;

// Email template for non-members (invitation to sign up)
const nonMemberEmailTemplate = (tripName, destination, senderName, signupUrl) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited to Join Tucker Trips!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #ec4899;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ec4899;
            margin-bottom: 10px;
        }
        .tagline {
            color: #4DB8BA;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .trip-preview {
            background: linear-gradient(135deg, #ff34ac 0%, #7dbbe5 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .trip-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .destination {
            font-size: 18px;
            margin-bottom: 5px;
        }
        .sender {
            margin-top: 20px;
            font-style: italic;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ec4899 0%, #4DB8BA 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
        }
        .benefits {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .benefit-item {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }
        .benefit-icon {
            margin-right: 10px;
            font-size: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌟 Tucker Trips</div>
            <div class="tagline">Real trips. Real friends. Real trust.</div>
        </div>

        <div class="content">
            <h1>🎉 You're Invited to Join Tucker Trips!</h1>
            <p>${senderName} wants to share an amazing trip experience with you. Join our community to see what adventures await!</p>

            <div class="trip-preview">
                <div class="trip-name">${tripName}</div>
                <div class="destination">📍 ${destination}</div>
                <div class="sender">Shared by: ${senderName}</div>
            </div>

            <p><strong>What is Tucker Trips?</strong></p>
            <p>Tucker Trips is a private travel community where real people share real trip experiences. No anonymous reviews, no fake ratings - just authentic travel stories from people you trust.</p>

            <div class="benefits">
                <div class="benefit-item">
                    <span class="benefit-icon">✅</span>
                    <span>Get trip recommendations from people you actually know</span>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">✅</span>
                    <span>Skip the anonymous online reviews</span>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">✅</span>
                    <span>Access real, firsthand travel experiences</span>
                </div>
                <div class="benefit-item">
                    <span class="benefit-icon">✅</span>
                    <span>Plan with confidence using trusted advice</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="${signupUrl}" class="cta-button">
                    Join Tucker Trips →
                </a>
            </div>

            <p style="text-align: center; font-style: italic; margin-top: 20px;">
                Once you join, you'll immediately see ${senderName}'s trip details and can start exploring other shared experiences!
            </p>
        </div>

        <div class="footer">
            <p>Ready to discover better travel planning? Join thousands of travelers who trust real reviews from real people.</p>
            <p style="margin-top: 15px; font-size: 12px;">
                © 2024 Tucker Trips. Capture Every Moment!
            </p>
        </div>
    </div>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to_email, trip_name, destination, sender_name, trip_url, signup_url } = await req.json();

    // Validate required fields
    if (!to_email || !trip_name || !destination || !sender_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which template to use based on whether signup_url is provided
    const emailHtml = signup_url
      ? nonMemberEmailTemplate(trip_name, destination, sender_name, signup_url)
      : memberEmailTemplate(trip_name, destination, sender_name, trip_url);

    // Here you would integrate with Brevo SMTP
    // For now, we'll log the email content for development
    console.log('=== EMAIL TEMPLATE READY FOR BREVO SMTP ===');
    console.log('To:', to_email);
    console.log('Subject:', `You're invited to view a trip on Tucker Trips!`);
    console.log('HTML Template:', emailHtml);
    console.log('Brevo SMTP Details:', {
      server: 'smtp-relay.brevo.com',
      port: 587,
      login: '992e47002@smtp-brevo.com'
    });

    // Email delivery via Brevo SMTP is not yet configured.
    // When ready, replace this with Brevo transactional email API calls.
    // See: https://developers.brevo.com/docs/send-a-transactional-email
    // This would involve:
    // 1. Using a library like nodemailer or fetch to Brevo's API
    // 2. Sending the HTML email
    // 3. Handling delivery status

    // For development, return success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email template ready for Brevo SMTP integration',
        template_type: signup_url ? 'non-member' : 'member'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});