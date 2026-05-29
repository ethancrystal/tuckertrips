import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'Terms & Conditions - Tucker Trips',
  description: 'Terms and conditions for using Tucker Trips platform.',
}

export default function TermsAndConditions() {
  const effectiveDate = 'January 7, 2026'

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">TERMS AND CONDITIONS</h1>
          <p className="text-xl text-white/90">Tucker Trips - Your Travel Companion</p>
          <p className="text-white/80 mt-2">Effective Date: {effectiveDate}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 prose prose-lg max-w-none">
          {/* Agreement to Terms */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. AGREEMENT TO TERMS</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms and Conditions (&quot;Terms,&quot; &quot;Terms and Conditions&quot;) constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you,&quot; &quot;your,&quot; or &quot;User&quot;), and Tucker Trips (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), concerning your access to and use of the tuckertrips.com website, mobile applications, and all related services (collectively, the &quot;Service&quot;).
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
              <p className="text-amber-900 font-semibold">PLEASE READ THESE TERMS CAREFULLY BEFORE USING THE SERVICE.</p>
              <p className="text-amber-800 text-sm mt-2">
                By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by all of these Terms. If you do not agree with all of these Terms, then you are expressly prohibited from using the Service and you must discontinue use immediately.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right, in our sole discretion, to make changes or modifications to these Terms at any time and for any reason. We will alert you about any changes by updating the &quot;Effective Date&quot; of these Terms. Your continued use of the Service after the posting of revised Terms means that you accept and agree to the changes.
            </p>
          </section>

          {/* User Representations */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. USER REPRESENTATIONS AND WARRANTIES</h2>
            <p className="text-gray-700 leading-relaxed mb-4">By using the Service, you represent and warrant that:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You have the legal capacity and agree to comply with these Terms.</li>
              <li>You are at least 13 years of age (or 16 years of age in the European Economic Area), or if you are between 13 and 18 years of age, you have obtained parental or guardian consent to use the Service.</li>
              <li>You will not access the Service through automated or non-human means, whether through a bot, script, or otherwise.</li>
              <li>You will not use the Service for any illegal or unauthorized purpose.</li>
              <li>Your use of the Service will not violate any applicable law or regulation.</li>
              <li>All registration information you submit is truthful and accurate, and you will maintain the accuracy of such information.</li>
              <li>You have the right to submit any content you upload, including photographs and travel information, and that such content does not violate the rights of any third party.</li>
              <li>You will not share your account credentials with any third party and will be responsible for all activity that occurs under your account.</li>
            </ul>
          </section>

          {/* User Registration */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. USER REGISTRATION AND ACCOUNT</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may be required to register with the Service to access certain features. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security. We will not be liable for any loss or damage arising from your failure to comply with this security obligation.
            </p>
          </section>

          {/* User Content */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. USER CONTENT AND SUBMISSIONS</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.1 Your Content</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service allows you to create, upload, submit, store, and share content, including but not limited to trip entries, photographs, videos, text, and other materials (collectively, &quot;User Content&quot;). You retain ownership of all intellectual property rights in your User Content.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              By submitting User Content to the Service, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with the Service and our business operations.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.2 Content Responsibility</h3>
            <p className="text-gray-700 leading-relaxed mb-4">You are solely responsible for your User Content and the consequences of posting or publishing it. You represent and warrant that:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>You own or have the necessary licenses, rights, consents, and permissions to use and authorize us to use all intellectual property and other rights in your User Content.</li>
              <li>Your User Content does not violate, misappropriate, or infringe any third party&apos;s rights, including intellectual property rights and privacy rights.</li>
              <li>You have obtained any necessary consents from individuals depicted in photographs or videos.</li>
              <li>Your User Content does not contain any viruses, malware, or other harmful code.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">4.3 Content Moderation</h3>
            <p className="text-gray-700 leading-relaxed">
              We do not control and are not responsible for User Content. We reserve the right, but not the obligation, to remove or modify any User Content for any reason, including User Content that we believe violates these Terms or may be offensive, illegal, or that might violate the rights of third parties.
            </p>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. PROHIBITED ACTIVITIES</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may not access or use the Service for any purpose other than that for which we make the Service available. As a user of the Service, you agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Systematically retrieve data or content from the Service to create a collection, compilation, database, or directory without written permission.</li>
              <li>Make any unauthorized use of the Service, including collecting usernames and/or email addresses of users to send unsolicited email.</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the Service.</li>
              <li>Engage in unauthorized framing of or linking to the Service.</li>
              <li>Trick, defraud, or mislead us or other users, especially in any attempt to learn sensitive account information.</li>
              <li>Engage in any automated use of the system, such as using scripts, bots, or data mining techniques.</li>
              <li>Upload or transmit viruses, Trojan horses, or other material that interferes with the Service.</li>
              <li>Attempt to impersonate another user or person or use another user&apos;s account.</li>
              <li>Upload content that is offensive, harassing, threatening, defamatory, obscene, or otherwise objectionable.</li>
              <li>Violate any applicable laws or regulations.</li>
              <li>Use the Service to advertise or sell goods and services without our express written consent.</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. INTELLECTUAL PROPERTY RIGHTS</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.1 Our Intellectual Property</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of Tucker Trips and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              The Tucker Trips name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Tucker Trips or its affiliates or licensors. You must not use such marks without the prior written permission of Tucker Trips.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">6.2 Your License to Use the Service</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Service for your personal, non-commercial use.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This license does not include any right to: (a) sell, resell, or commercially use the Service; (b) copy, reproduce, distribute, or publicly display any Service content; (c) modify or make derivative works based upon the Service; (d) use any data mining, robots, or similar data gathering methods; or (e) use the Service other than for its intended purposes.
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. THIRD-PARTY WEBSITES AND SERVICES</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service may contain links to third-party websites and services that are not owned or controlled by Tucker Trips. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit.
            </p>
          </section>

          {/* Privacy */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. PRIVACY</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our <a href="/privacy" className="text-[#ff34ac] hover:underline">Privacy Policy</a>, which also governs your use of the Service, to understand our practices regarding the collection, use, and disclosure of your personal information. The Privacy Policy is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. DISCLAIMERS</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <p className="text-gray-700 font-semibold mb-2">THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Neither Tucker Trips nor any person associated with Tucker Trips makes any warranty or representation with respect to the completeness, security, reliability, quality, accuracy, or availability of the Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Without limiting the foregoing, neither Tucker Trips nor anyone associated with Tucker Trips represents or warrants that the Service will be accurate, reliable, error-free, or uninterrupted, that defects will be corrected, that the Service or the server that makes it available are free of viruses or other harmful components, or that the Service will otherwise meet your needs or expectations.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. LIMITATION OF LIABILITY</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL TUCKER TRIPS, ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              This includes, without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from: your access to or use of or inability to access or use the Service; any conduct or content of any third party on the Service; any content obtained from the Service; unauthorized access, use, or alteration of your transmissions or content; or any other matter relating to the Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              IN NO EVENT SHALL THE AGGREGATE LIABILITY OF TUCKER TRIPS EXCEED THE GREATER OF ONE HUNDRED U.S. DOLLARS (USD $100.00) OR THE AMOUNT YOU PAID TUCKER TRIPS, IF ANY, IN THE PAST SIX MONTHS FOR THE SERVICE GIVING RISE TO THE CLAIM.
            </p>
          </section>

          {/* Indemnification */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. INDEMNIFICATION</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to defend, indemnify, and hold harmless Tucker Trips and its officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys&apos; fees) arising out of or relating to your violation of these Terms or your use of the Service, including, but not limited to, your User Content, any use of the Service&apos;s content, services, and products other than as expressly authorized in these Terms, or your use of any information obtained from the Service.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. GOVERNING LAW AND DISPUTE RESOLUTION</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.1 Governing Law</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.2 Informal Resolution</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Before filing a claim against Tucker Trips, you agree to try to resolve the dispute informally by contacting us at legal@tuckertrips.com. We will try to resolve the dispute informally by contacting you via email. If a dispute is not resolved within thirty (30) days of submission, you or Tucker Trips may bring a formal proceeding.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.3 Binding Arbitration</h3>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
              <p className="text-amber-900 font-semibold">PLEASE READ THIS SECTION CAREFULLY – IT MAY SIGNIFICANTLY AFFECT YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT.</p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">
              Any dispute arising out of or relating to these Terms or the Service that cannot be resolved informally shall be finally settled by binding arbitration in accordance with the American Arbitration Association&apos;s Rules for Arbitration of Consumer-Related Disputes.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">12.4 Class Action Waiver</h3>
            <p className="text-gray-700 leading-relaxed">
              YOU AND TUCKER TRIPS AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. TERMINATION</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you wish to terminate your account, you may simply discontinue using the Service or contact us to delete your account. Upon termination, your right to use the Service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </section>

          {/* Severability */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. SEVERABILITY AND WAIVER</h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">14.1 Severability</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions will continue in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">14.2 Waiver</h3>
            <p className="text-gray-700 leading-relaxed">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. The waiver of any such right or provision will be effective only if in writing and signed by a duly authorized representative of Tucker Trips.
            </p>
          </section>

          {/* Entire Agreement */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. ENTIRE AGREEMENT</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms, together with the Privacy Policy and any other legal notices published by us on the Service, constitute the entire agreement between you and Tucker Trips concerning the Service. These Terms supersede all prior agreements, communications, and proposals, whether electronic, oral, or written, between you and Tucker Trips with respect to the Service.
            </p>
          </section>

          {/* Electronic Communications */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. ELECTRONIC COMMUNICATIONS</h2>
            <p className="text-gray-700 leading-relaxed">
              By using the Service, you consent to receiving electronic communications from us. These communications may include notices about your account, transactional information, and other information concerning or related to the Service. You agree that any notices, agreements, disclosures, or other communications that we send to you electronically will satisfy any legal communication requirements, including that such communications be in writing.
            </p>
          </section>

          {/* Copyright Infringement */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. COPYRIGHT INFRINGEMENT (DMCA)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We respect the intellectual property rights of others and expect users of the Service to do the same. We will respond to notices of alleged copyright infringement that comply with applicable law and are properly provided to us.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">If you believe that your work has been copied in a way that constitutes copyright infringement, please provide our Copyright Agent with the following information:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>A physical or electronic signature of the copyright owner or authorized representative.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material that is claimed to be infringing and its location on the Service.</li>
              <li>Your contact information, including address, telephone number, and email.</li>
              <li>A statement that you have a good faith belief that the disputed use is not authorized.</li>
              <li>A statement, made under penalty of perjury, that the information in your notice is accurate and that you are authorized to act on behalf of the copyright owner.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              <strong>DMCA notices should be sent to: dmca@tuckertrips.com</strong>
            </p>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. CONTACT US</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Tucker Trips</strong>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Website:</strong> tuckertrips.com
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Legal:</strong> legal@tuckertrips.com
              </p>
              <p className="text-gray-700">
                <strong>Support:</strong> support@tuckertrips.com
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <div className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-400 text-xl mb-4">* * *</p>
            <p className="text-gray-600 font-semibold">
              By using Tucker Trips, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
