import React from "react";

const sections = [
  {
    title: "1. Overview",
    content: `We want you to be fully satisfied with our AI Text-to-Speech services. If you're not happy with your purchase, we're here to help. Please review our refund policy below.`,
  },
  {
    title: "2. Eligibility for Refund",
    content: [
      "You must request the refund within 7 days of your original purchase.",
      "You must provide a valid reason (e.g., technical issue, service not as described).",
      "Your usage must not exceed 20% of the monthly quota for which you are requesting a refund.",
    ],
  },
  {
    title: "3. Non-Refundable Situations",
    content: [
      "Refund requests made after 7 days from purchase.",
      "Excessive usage of the service (over 20% of quota).",
      "Issues due to misuse or unsupported browsers/devices.",
      "Monthly subscriptions after the renewal date.",
    ],
  },
  {
    title: "4. How to Request a Refund",
    content: [
      "Email us at [Your Support Email] with your account email and payment receipt.",
      "Explain the issue clearly and include any supporting information.",
      "Our team will respond within 2–5 business days with a decision.",
    ],
  },
  {
    title: "5. Refund Processing",
    content:
      "Approved refunds will be processed to the original payment method within 7–10 business days. Processing times may vary depending on your payment provider.",
  },
  {
    title: "6. Subscription Cancellations",
    content:
      "You can cancel your subscription anytime from your account settings. Cancellation prevents future charges but does not automatically trigger a refund.",
  },
  {
    title: "7. Contact",
    content:
      "If you have any questions about our Refund Policy, please contact us at [Your Support Email].",
  },
];

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-2">
          Refund Policy
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