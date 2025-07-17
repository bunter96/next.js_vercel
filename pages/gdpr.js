import React from "react";

export default function GDPRPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-2">
          GDPR Compliance
        </h1>
        <div className="flex justify-center mb-8">
          <span className="inline-block bg-green-100 dark:bg-green-900 text-sm text-gray-700 dark:text-gray-200 px-3 py-1 rounded-md">
            Last updated: June 30, 2025
          </span>
        </div>
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md transition hover:shadow-lg"
            >
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                {section.title}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 text-base space-y-2">
                {Array.isArray(section.content) ? (
                  <ul className="list-disc list-inside">
                    {section.content.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{section.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const sections = [
  {
    title: "1. Data Controller",
    content: `The data controller responsible for your personal data is:
      [Your Company Name], [Your Company Address]. You can contact us at [Your Contact Email].`,
  },
  {
    title: "2. What Data We Collect",
    content: [
      "Email address (if you register or contact us)",
      "Audio input/output logs (for processing text-to-speech)",
      "Usage data (e.g., browser type, IP address, pages visited)",
      "Cookies and tracking information (see our Cookie Policy)",
    ],
  },
  {
    title: "3. Why We Collect Your Data",
    content: [
      "To provide and improve TTS functionality",
      "To handle support and service-related communication",
      "To fulfill legal obligations",
      "To analyze user behavior and enhance the app",
    ],
  },
  {
    title: "4. Legal Basis for Processing",
    content: [
      "Consent (when you agree to our terms)",
      "Contract (to deliver our services to you)",
      "Legitimate interest (improving functionality and security)",
      "Legal obligation (compliance with laws)",
    ],
  },
  {
    title: "5. Data Retention",
    content:
      "We retain personal data only as long as necessary for the stated purposes or as required by law. You may request data deletion at any time.",
  },
  {
    title: "6. Your Rights",
    content: [
      "Access your data",
      "Request correction or deletion",
      "Object to or restrict processing",
      "Request data portability",
      "Withdraw consent",
      "Lodge a complaint with a supervisory authority",
    ],
  },
  {
    title: "7. Data Security",
    content:
      "We use modern encryption, secure hosting, and access controls to safeguard your data from unauthorized access or disclosure.",
  },
  {
    title: "8. Third-Party Services",
    content:
      "We may use GDPR-compliant services such as hosting providers, analytics tools, or payment gateways. All data shared is subject to strict confidentiality agreements.",
  },
  {
    title: "9. International Transfers",
    content:
      "If data is transferred outside the EU/EEA, we ensure it is protected using legal mechanisms such as Standard Contractual Clauses.",
  },
  {
    title: "10. Contact Us",
    content:
      "If you have questions about this GDPR policy or want to exercise your rights, please contact us at [Your Contact Email].",
  },
];