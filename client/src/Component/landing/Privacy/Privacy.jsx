import React from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield } from 'lucide-react';

export const Privacy = () => {
    const navigate = useNavigate();
    return (
        <div className="fixed inset-0 bg-white  z-50 p-3 md:p-0">
          <div className="bg-white rounded-xl shadow-2xl w-full h-screen relative border border-gray-100">
            {/* Header Section */}
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back</span>
              </button>
            </div>

            {/* Privacy Content */}
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="prose prose-blue max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy for Cumulus</h3>
                <p className="text-gray-600 mb-4">Welcome to Cumulus. This Privacy Policy ("Policy") explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, or engage with any of our services (collectively, "the Service").</p>
                <p className="text-gray-600 mb-8">By accessing or using the Service, you agree to the terms outlined in this Policy. If you do not agree with the terms, please do not use our Service.</p>

                <div className="space-y-8">
                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li>
                        <strong className="text-gray-900">1.1 Personal Information</strong>
                        <p className="mt-2">We may collect personal information that identifies you directly, including but not limited to:</p>
                        <ul className="ml-6 mt-2 space-y-2">
                          <li>• Contact Information: Name, email address, phone number, and home address.</li>
                          <li>• Account Details: Username, password, and subscription details.</li>
                          <li>• Payment Information: Billing address and payment method details (stored securely and encrypted).</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-gray-900">1.2 Non-Personal Information</strong>
                        <p className="mt-2">We collect non-personal information about your usage of the Service, such as:</p>
                        <ul className="ml-6 mt-2 space-y-2">
                          <li>• Usage Data: IP address, browser type, device type, pages visited, and time spent on the Service.</li>
                          <li>• Cookies and Tracking Technologies: We use cookies and other technologies to enhance your experience and gather analytical data.</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-gray-900">1.3 Voice Memos and Uploaded Content</strong>
                        <p className="mt-2">If you use features like voice memos or upload documents, we store these in a secure manner to provide you with the core functionality of Cumulus.</p>
                      </li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li>
                        <strong className="text-gray-900">2.1 Provide and Manage the Service</strong>
                        <ul className="ml-6 mt-2 space-y-2">
                          <li>• To deliver and manage our Service and to ensure smooth access to your account.</li>
                          <li>• To process your subscription and manage billing.</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-gray-900">2.2 Improve User Experience</strong>
                        <ul className="ml-6 mt-2 space-y-2">
                          <li>• To personalize your experience and provide you with tailored content.</li>
                          <li>• To conduct analytics to understand how our users interact with our platform and improve it accordingly.</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-gray-900">2.3 Communication</strong>
                        <ul className="ml-6 mt-2 space-y-2">
                          <li>• To respond to inquiries and provide customer support.</li>
                          <li>• To send you important updates, notifications, and promotional offers (you can opt out of marketing communications at any time).</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-gray-900">2.4 Legal and Compliance</strong>
                        <ul className="ml-6 mt-2 space-y-2">
                          <li>• To comply with applicable legal obligations.</li>
                          <li>• To enforce our Terms of Service and prevent misuse of the platform.</li>
                        </ul>
                      </li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">3. Sharing Your Information</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li>
                        <strong className="text-gray-900">3.1 Third-Party Service Providers</strong>
                        <p className="mt-2">We may share your information with trusted third-party service providers who assist us in delivering the Service, such as:</p>
                        <ul className="ml-6 mt-2 space-y-2">
                          <li>• Payment Processors: To process payments and manage billing.</li>
                          <li>• Cloud Storage Providers: To securely store your uploaded files and voice memos.</li>
                        </ul>
                      </li>
                      <li>
                        <strong className="text-gray-900">3.2 Legal Requirements</strong>
                        <p className="mt-2">We may disclose your information if required by law, to respond to legal process, or to protect the rights, property, and safety of Cumulus and our users.</p>
                      </li>
                      <li>
                        <strong className="text-gray-900">3.3 Business Transfers</strong>
                        <p className="mt-2">In the event of a merger, acquisition, or sale of our business, your personal information may be transferred to the new owner.</p>
                      </li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">4. Cookies and Tracking Technologies</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li>
                        <strong className="text-gray-900">4.1 Cookies</strong>
                        <p className="mt-2">We use cookies to collect data for analytics, to remember your preferences, and to enhance your experience on our platform. You can adjust your browser settings to reject cookies, but this may affect the functionality of the Service.</p>
                      </li>
                      <li>
                        <strong className="text-gray-900">4.2 Analytics</strong>
                        <p className="mt-2">We use third-party services like Google Analytics to analyze usage patterns and improve our Service.</p>
                      </li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li>
                        <strong className="text-gray-900">5.1 Protection Measures</strong>
                        <p className="mt-2">We implement industry-standard encryption (such as AES-256) and secure data transmission protocols to protect your personal information.</p>
                      </li>
                      <li>
                        <strong className="text-gray-900">5.2 Limited Access</strong>
                        <p className="mt-2">Access to your information is restricted to authorized employees, contractors, and agents who need to know that information to operate or enhance the Service.</p>
                      </li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li>
                        <strong className="text-gray-900">6.1 Retention Period</strong>
                        <p className="mt-2">We retain your personal information for as long as is necessary to fulfill the purposes outlined in this Policy. We may retain some data for a longer period if required for legal compliance or to resolve disputes.</p>
                      </li>
                      <li>
                        <strong className="text-gray-900">6.2 Account Termination</strong>
                        <p className="mt-2">If you terminate your account, we will delete or anonymize your personal information, except for data that we are required to retain by law.</p>
                      </li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li>
                        <strong className="text-gray-900">7.1 Access and Correction</strong>
                        <p className="mt-2">You have the right to access and correct the information we hold about you. You can do this by logging into your account or contacting us directly.</p>
                      </li>
                      <li>
                        <strong className="text-gray-900">7.2 Data Portability</strong>
                        <p className="mt-2">You have the right to request a copy of your personal data in a structured, commonly used, and machine-readable format.</p>
                      </li>
                      <li>
                        <strong className="text-gray-900">7.3 Deletion</strong>
                        <p className="mt-2">You can request the deletion of your personal data. However, certain data may need to be retained for legal compliance.</p>
                      </li>
                      <li>
                        <strong className="text-gray-900">7.4 Opt-Out of Marketing</strong>
                        <p className="mt-2">You can opt-out of receiving marketing emails by following the unsubscribe link in those emails.</p>
                      </li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h4>
                    <p className="text-gray-600">Our Service is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware of any data collected from minors, we will take steps to delete such information.</p>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h4>
                    <p className="text-gray-600">Your information may be transferred and stored on servers located outside of your country of residence. By using our Service, you consent to such international transfers of your data. We will ensure that adequate safeguards are in place to protect your data.</p>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h4>
                    <p className="text-gray-600">We may update this Privacy Policy from time to time. Any changes will be effective upon posting to our website, and we will notify you of any significant changes through email or by a notice on the Service.</p>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h4>
                    <p className="text-gray-600">If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
                    <div className="mt-2">
                      <p className="text-gray-600">Cumulus Support Team</p>
                      <a href="mailto:support@cumulus.rip" className="text-blue-600 hover:underline">support@cumulus.rip</a>
                    </div>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">12. California and GDPR Residents</h4>
                    <ul className="space-y-4 text-gray-600">
                      <li>
                        <strong className="text-gray-900">12.1 California Consumer Privacy Act (CCPA)</strong>
                        <p className="mt-2">If you are a resident of California, you have the right to request:</p>
                        <ul className="ml-6 mt-2 space-y-2">
                          <li>• Access: Details about the personal data we collect and use.</li>
                          <li>• Deletion: Erasure of personal data under certain conditions.</li>
                          <li>• Opt-Out: Refusal of the sale of your personal information.</li>
                        </ul>
                        <p className="mt-2">To exercise these rights, please contact us as outlined in Section 11.</p>
                      </li>
                      <li>
                        <strong className="text-gray-900">12.2 General Data Protection Regulation (GDPR)</strong>
                        <p className="mt-2">If you are located in the European Economic Area (EEA), you have certain rights, including:</p>
                        <ul className="ml-6 mt-2 space-y-2">
                          <li>• Access, Correction, and Deletion: You may request access to or correction/deletion of your personal data.</li>
                          <li>• Objection: You may object to the processing of your data for specific reasons.</li>
                        </ul>
                      </li>
                    </ul>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">13. Data Breach Notification</h4>
                    <p className="text-gray-600">In the event of a data breach, we will promptly notify affected users and the relevant regulatory authorities, as required by applicable data protection laws. We will take all necessary measures to mitigate the impact of such a breach and prevent future occurrences.</p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default Privacy;