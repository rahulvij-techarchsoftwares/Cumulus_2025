import React from 'react'
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scroll } from 'lucide-react';

export const Terms = () => {
    const navigate = useNavigate();
    return (
        <div className="fixed inset-0 bg-white  z-50 p-3 md:p-0">
          <div className="bg-white rounded-xl shadow-2xl w-full h-screen relative border border-gray-100">
            {/* Header Section */}
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <Scroll className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back</span>
              </button>
            </div>

            {/* Terms Content */}
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="prose prose-blue max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Terms of Service for Cumulus</h3>
                <p className="text-gray-600 mb-4">Welcome to Cumulus. These Terms of Service ("Terms") govern your access to and use of Cumulus's services, including our web platform, mobile applications, content, features, and any related services (collectively, "the Service").</p>
                <p className="text-gray-600 mb-8">Please read these Terms carefully. By accessing or using the Service, you agree to comply with and be bound by these Terms and all applicable laws.</p>

                <div className="space-y-8">
                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li><strong className="text-gray-900">1.1 Overview:</strong> These Terms constitute a legally binding agreement between you and Cumulus. By accessing or using our Service, you accept these Terms and agree to be bound by them.</li>
                      <li><strong className="text-gray-900">1.2 Acceptance of Terms:</strong> Your use of the Service indicates that you have read, understood, and agree to be bound by these Terms, including any future modifications.</li>
                      <li><strong className="text-gray-900">1.3 Amendments to the Terms:</strong> Cumulus reserves the right to modify or amend these Terms at any time. Changes will be effective upon posting to our website or notification via the Service. Your continued use after any modifications means you accept the new Terms.</li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">2. Eligibility and Account Registration</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li><strong className="text-gray-900">2.1 Eligibility Requirements:</strong> You must be at least 18 years of age to use the Service. By registering, you confirm that you meet this age requirement.</li>
                      <li><strong className="text-gray-900">2.2 Account Information:</strong> You are responsible for maintaining the confidentiality of your account login information and are fully responsible for all activities conducted through your account.</li>
                      <li><strong className="text-gray-900">2.3 Accuracy of Information:</strong> You agree to provide accurate, current, and complete information about yourself when registering. You must update your information to maintain its accuracy.</li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">3. Subscription Plans and Fees</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li><strong className="text-gray-900">3.1 Subscription Tiers:</strong> Cumulus offers multiple subscription plans: Standard, Premium, and Enterprise. Subscription fees are outlined in our pricing section and may vary by tier.</li>
                      <li><strong className="text-gray-900">3.2 Billing Cycle:</strong> Subscription fees are billed either monthly or annually, depending on your selection at the time of purchase. Payments are due at the beginning of each billing cycle.</li>
                      <li><strong className="text-gray-900">3.3 Automatic Renewal:</strong> Unless you cancel your subscription, your plan will automatically renew at the end of each billing cycle. You can manage renewal settings through your account.</li>
                      <li><strong className="text-gray-900">3.4 Payment Methods:</strong> By subscribing, you authorize Cumulus to charge your provided payment method for the fees associated with your selected subscription.</li>
                      <li><strong className="text-gray-900">3.5 Refund Policy:</strong> Subscription fees are non-refundable. Partial refunds are not available if you terminate your subscription before the end of a billing cycle.</li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">4. Use of Service</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li><strong className="text-gray-900">4.1 Permitted Use:</strong> The Service is intended solely for your personal, non-commercial use unless otherwise agreed. You agree to use the Service only as permitted by these Terms.</li>
                      <li><strong className="text-gray-900">4.2 Prohibited Use:</strong> You agree not to:
                        <ul className="ml-6 mt-2 space-y-2">
                          <li>• Engage in any activity that interferes with or disrupts the Service.</li>
                          <li>• Attempt to gain unauthorized access to our systems.</li>
                          <li>• Reverse engineer or disassemble any part of the Service.</li>
                        </ul>
                      </li>
                      <li><strong className="text-gray-900">4.3 User Responsibilities:</strong> You are responsible for your use of the Service and any data you share or upload. You agree not to misuse the Service in any way.</li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">5. User Content and Intellectual Property</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li><strong className="text-gray-900">5.1 Ownership of User Content:</strong> You retain ownership of all content you upload to Cumulus. By uploading, you grant Cumulus a non-exclusive, worldwide, royalty-free license to use, store, and process your content for the purpose of providing the Service.</li>
                      <li><strong className="text-gray-900">5.2 License Restrictions:</strong> You may not distribute, modify, transmit, reuse, download, repost, or use the content of the Service without Cumulus's prior written permission.</li>
                      <li><strong className="text-gray-900">5.3 Intellectual Property Rights:</strong> All trademarks, logos, and service marks displayed through the Service are the property of Cumulus or third parties. You are not permitted to use them without prior consent.</li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">6. Privacy and Security</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li><strong className="text-gray-900">6.1 Data Collection:</strong> By using Cumulus, you acknowledge and agree that we may collect and use your data as described in our Privacy Policy.</li>
                      <li><strong className="text-gray-900">6.2 Data Protection:</strong> We use industry-standard encryption and security protocols to protect your data. However, Cumulus cannot guarantee that unauthorized third parties will never be able to defeat our security measures.</li>
                      <li><strong className="text-gray-900">6.3 User Rights:</strong> Under applicable data protection laws, you may have the right to request access to, modification of, or deletion of your personal data.</li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">7. Termination of Service</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li><strong className="text-gray-900">7.1 Termination by You:</strong> You may terminate your account at any time. Please note that any unused subscription period will not be refunded.</li>
                      <li><strong className="text-gray-900">7.2 Termination by Cumulus:</strong> We reserve the right to terminate or suspend your account immediately, without notice, for conduct that violates these Terms or is harmful to other users of the Service.</li>
                      <li><strong className="text-gray-900">7.3 Effect of Termination:</strong> Upon termination, your right to use the Service will immediately cease. All of your data and content may be deleted within a reasonable time, except as otherwise required by law.</li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li><strong className="text-gray-900">8.1 No Warranty:</strong> The Service is provided "as is" and "as available." Cumulus makes no warranties, either express or implied, regarding the Service, including any implied warranties of merchantability or fitness for a particular purpose.</li>
                      <li><strong className="text-gray-900">8.2 Limitation on Damages:</strong> To the extent permitted by law, Cumulus shall not be liable for any indirect, incidental, or consequential damages arising from the use of the Service.</li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">9. Dispute Resolution and Governing Law</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li><strong className="text-gray-900">9.1 Governing Law:</strong> These Terms are governed by the laws of [Jurisdiction], without regard to its conflict of laws principles.</li>
                      <li><strong className="text-gray-900">9.2 Arbitration:</strong> Any dispute arising from these Terms will be settled by arbitration in [Location], and you consent to personal jurisdiction in [Location] for the purposes of arbitrating such disputes.</li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">10. General Provisions</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li><strong className="text-gray-900">10.1 Entire Agreement:</strong> These Terms constitute the entire agreement between you and Cumulus with respect to your use of the Service.</li>
                      <li><strong className="text-gray-900">10.2 Severability:</strong> If any part of these Terms is held invalid or unenforceable, that part will be construed to reflect the parties' original intent, and the remaining portions will remain in full force.</li>
                      <li><strong className="text-gray-900">10.3 Waiver:</strong> No waiver by Cumulus of any breach of these Terms shall be a waiver of any preceding or succeeding breach.</li>
                    </ul>
                  </section>

                  <section className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h4 className="text-xl font-semibold text-blue-900 mb-4">11. Contact Information</h4>
                    <div className="text-blue-700">
                      <strong>11.1 Contact Us:</strong> If you have questions or concerns regarding these Terms, please contact us at{' '}
                      <a href="mailto:support@cumulus.rip" className="text-blue-600 hover:underline">support@cumulus.rip</a>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default Terms;