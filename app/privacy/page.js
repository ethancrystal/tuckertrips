import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Tucker Trips',
  description: 'Learn how Tucker Trips protects your privacy and handles your data.',
}

export default function PrivacyPolicy() {
  const lastUpdated = 'January 7, 2026'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ff34ac] to-[#7dbbe5] text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-white/90 hover:text-white mb-8 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">PRIVACY POLICY</h1>
          <p className="text-xl text-white/90">Tucker Trips - Your Travel Companion</p>
          <p className="text-white/80 mt-2">Last Updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. INTRODUCTION AND OVERVIEW</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tucker Trips (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website tuckertrips.com and associated services (collectively, the &quot;Service&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. We are committed to protecting your personal information and your right to privacy.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing or using the Service, you agree to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access the Service. We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the &quot;Last Updated&quot; date of this Privacy Policy.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy applies to all information collected through our Service, as well as any related services, sales, marketing, or events. Please read this privacy policy carefully as it will help you make informed decisions about sharing your personal information with us.
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. DEFINITIONS</h2>
            <p className="text-gray-700 leading-relaxed mb-4">For the purposes of this Privacy Policy:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Account</strong> means a unique account created for you to access our Service or parts of our Service.</li>
              <li><strong>Company</strong> refers to Tucker Trips.</li>
              <li><strong>Content</strong> refers to any information, data, text, photographs, graphics, videos, or other materials that you upload, submit, store, send, or receive through the Service.</li>
              <li><strong>Cookies</strong> are small files that are placed on your computer, mobile device, or any other device by a website.</li>
              <li><strong>Device</strong> means any device that can access the Service such as a computer, cellphone, or digital tablet.</li>
              <li><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</li>
              <li><strong>Service</strong> refers to the Tucker Trips website and all related services.</li>
              <li><strong>You</strong> means the individual accessing or using the Service.</li>
            </ul>
          </section>

          {/* Information We Collect */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. INFORMATION WE COLLECT</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.1 Personal Information You Provide</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect personal information that you voluntarily provide to us when you register on the Service, create trip entries, participate in activities on the Service, or otherwise contact us. The personal information we collect may include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Identity Information:</strong> First name, last name, username or similar identifier, title, date of birth.</li>
              <li><strong>Contact Information:</strong> Email address, telephone numbers, mailing address.</li>
              <li><strong>Account Credentials:</strong> Password and security questions (stored in encrypted form).</li>
              <li><strong>Profile Information:</strong> Profile picture, bio, preferences, travel interests.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Trip and Travel Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you use our Service to document your travels, we collect:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Trip Details:</strong> Trip titles, descriptions, destinations, dates, itineraries, and travel notes.</li>
              <li><strong>Media Content:</strong> Photographographs, videos, and other visual content you upload to document your travels.</li>
              <li><strong>Location Data:</strong> Geographic coordinates, place names, addresses, and location metadata embedded in photographs (EXIF data).</li>
              <li><strong>Privacy Settings:</strong> Your preferences regarding trip visibility (private, shared, or public).</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Information Collected Automatically</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you access or use our Service, we automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers, browser type and version, IP address.</li>
              <li><strong>Usage Information:</strong> Pages visited, time spent on pages, click patterns, features used, search queries.</li>
              <li><strong>Log Data:</strong> Access times, error logs, referring URLs, and other diagnostic data.</li>
              <li><strong>Cookies and Similar Technologies:</strong> Session cookies, persistent cookies, web beacons, and pixel tags.</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. HOW WE USE YOUR INFORMATION</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect or receive for the following purposes:</p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Service Provision and Management</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>To create, maintain, and manage your account and user profile.</li>
              <li>To enable you to create, store, organize, and share trip entries and travel content.</li>
              <li>To process your requests and transactions, including any premium features or services.</li>
              <li>To provide customer support and respond to your inquiries.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Communication</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>To send administrative communications, including account verification, security alerts, and support messages.</li>
              <li>To provide you with updates about the Service, new features, and relevant content (with your consent).</li>
              <li>To facilitate social sharing features and connections between users (based on your privacy settings).</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Service Improvement and Analytics</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>To analyze usage patterns and trends to improve Service functionality and user experience.</li>
              <li>To conduct research and development to enhance existing features and develop new ones.</li>
              <li>To monitor and analyze the effectiveness of our marketing efforts.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.4 Legal and Security Purposes</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To comply with applicable laws, regulations, and legal processes.</li>
              <li>To protect the security and integrity of the Service and our users.</li>
              <li>To detect, prevent, and address fraud, security breaches, and other harmful activities.</li>
              <li>To enforce our Terms of Service and protect our rights and property.</li>
            </ul>
          </section>

          {/* Disclosure of Your Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. DISCLOSURE OF YOUR INFORMATION</h2>
            <p className="text-gray-700 leading-relaxed mb-4">We may share your information in the following circumstances:</p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.1 With Your Consent</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              We may share your information with third parties when you have given us explicit consent to do so. This includes sharing trip content with other users based on your selected privacy settings (public, shared with specific users, or private).
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.2 Service Providers</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We engage trusted third-party service providers to perform functions on our behalf, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Supabase:</strong> Database hosting, user authentication, and file storage services.</li>
              <li><strong>Vercel:</strong> Web hosting and content delivery network services.</li>
              <li><strong>Resend:</strong> Transactional and marketing email delivery.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              These service providers have access to your personal information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.3 Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may disclose your information where required to do so by law or in response to valid requests by public authorities. This includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Complying with a legal obligation, court order, or legal process.</li>
              <li>Protecting and defending our rights or property.</li>
              <li>Preventing or investigating possible wrongdoing in connection with the Service.</li>
              <li>Protecting the personal safety of users of the Service or the public.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">5.4 Business Transfers</h3>
            <p className="text-gray-700 leading-relaxed">
              If we are involved in a merger, acquisition, reorganization, bankruptcy, or sale of all or a portion of our assets, your personal information may be transferred as part of that transaction. We will notify you via email and/or prominent notice on our Service of any change in ownership or uses of your personal information.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. DATA RETENTION</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your personal information for as long as your account is active or as needed to provide you with our Service. We will also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">Specifically:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Account Information:</strong> Retained while your account is active and for a reasonable period thereafter.</li>
              <li><strong>Trip Content:</strong> Retained until you delete it or close your account, subject to backup retention policies.</li>
              <li><strong>Log Data:</strong> Generally retained for 12-24 months for security and analytics purposes.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              When you request deletion of your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain certain information for legitimate business or legal purposes.
            </p>
          </section>

          {/* Security */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. SECURITY OF YOUR INFORMATION</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures designed to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Encryption:</strong> Data transmitted to and from our Service is encrypted using TLS/SSL protocols.</li>
              <li><strong>Access Controls:</strong> Row Level Security (RLS) policies ensure users can only access their own data.</li>
              <li><strong>Authentication:</strong> Secure password hashing and secure session management.</li>
              <li><strong>Infrastructure Security:</strong> Our cloud infrastructure providers (Supabase, Vercel) maintain industry-leading security practices.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              While we implement these safeguards, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information, but we are committed to protecting it to the best of our ability.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. YOUR PRIVACY RIGHTS</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your location and applicable laws, you may have certain rights regarding your personal information:
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.1 General Rights</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Access:</strong> You can access your personal information through your account settings or by contacting us.</li>
              <li><strong>Correction:</strong> You can update or correct inaccurate personal information in your account settings.</li>
              <li><strong>Deletion:</strong> You can delete your account and associated data through your account settings or by contacting us.</li>
              <li><strong>Data Portability:</strong> You can request a copy of your data in a structured format.</li>
              <li><strong>Opt-Out:</strong> You can opt out of marketing communications at any time.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.2 Rights for EU/EEA Residents (GDPR)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are a resident of the European Union or European Economic Area, you have additional rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Right to object to processing based on legitimate interests.</li>
              <li>Right to restriction of processing.</li>
              <li>Right to withdraw consent at any time.</li>
              <li>Right to lodge a complaint with a supervisory authority.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">8.3 Rights for California Residents (CCPA/CPRA)</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Right to know what personal information we collect, use, disclose, and sell.</li>
              <li>Right to delete your personal information.</li>
              <li>Right to opt-out of the sale or sharing of personal information.</li>
              <li>Right to non-discrimination for exercising your privacy rights.</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. COOKIES AND TRACKING TECHNOLOGIES</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to collect and use information about you and your interaction with our Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.1 Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Essential Cookies:</strong> Required for the Service to function properly, including authentication and security.</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings to enhance your experience.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our Service.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">9.2 Cookie Management</h3>
            <p className="text-gray-700 leading-relaxed">
              You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. However, if you block essential cookies, some features of the Service may not function properly.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. CHILDREN&apos;S PRIVACY</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is not intended for children under 13 years of age (or under 16 in the European Economic Area). We do not knowingly collect personal information from children under these age limits. If you are a parent or guardian and believe that your child has provided us with personal information without your consent, please contact us immediately.
            </p>
          </section>

          {/* International Transfers */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. INTERNATIONAL DATA TRANSFERS</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service is hosted and operated in the United States. If you are accessing the Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States and other countries where our service providers are located. By using the Service, you consent to the transfer of your information to these countries.
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. THIRD-PARTY LINKS AND SERVICES</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Service may contain links to third-party websites, services, or applications that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. This Privacy Policy does not apply to any information you provide to third parties.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. CHANGES TO THIS PRIVACY POLICY</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. For material changes, we will provide more prominent notice via email or banner on our Service.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. CONTACT US</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, your personal information, or wish to exercise your privacy rights, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Tucker Trips</strong>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Website:</strong> www.tuckertrips.com
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> privacy@tuckertrips.com
              </p>
              <p className="text-gray-700">
                <strong>EU Data Protection Officer:</strong> dpo@tuckertrips.com
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              We will respond to your request within 30 days. If you are not satisfied with our response, you have the right to lodge a complaint with your local data protection authority.
            </p>
          </section>

          {/* Acknowledgment */}
          <div className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-500 italic">By using Tucker Trips, you acknowledge that you have read and understood this Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
