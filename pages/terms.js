import Head from 'next/head';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service — LowCost TTS</title>
        <meta name="description" content="Terms and conditions for using LowCost TTS." />
      </Head>

      <main className="bg-gray-50 dark:bg-gray-900 min-h-screen px-4 sm:px-6 lg:px-8 py-12 text-gray-800 dark:text-gray-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            Terms of Service
          </h1>
          <div className="bg-green-100 dark:bg-green-900 text-sm text-gray-700 dark:text-gray-200 px-3 py-1 rounded-md w-max mx-auto mb-10">
            Last updated: June 30, 2025
          </div>

          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
              </div>
            ))}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-gray-700 dark:text-gray-300 text-base leading-relaxed text-center">
              For any questions or concerns, please contact us at{' '}
              <a
                href="mailto:support@lowcosttts.com"
                className="text-blue-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                support@lowcosttts.com
              </a>
              .
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    body:
      'By using LowCost TTS, you agree to be bound by these Terms of Service and our Privacy Policy. You must be at least 18 years old or have the consent of a guardian to use our service.',
  },
  {
    title: '2. User Conduct',
    body:
      'You agree to use our service only for lawful purposes. You may not use it to generate or share harmful, offensive, or unlawful content, or attempt to breach security.',
  },
  {
    title: '3. Account Responsibility',
    body:
      'You are responsible for maintaining the confidentiality of your account and all activities that occur under it. Notify us immediately of any unauthorized use.',
  },
  {
    title: '4. Payments & Subscriptions',
    body:
      'All fees are charged in accordance with our pricing page. Subscriptions may auto-renew unless canceled before the renewal date. See our Refund Policy for more details.',
  },
  {
    title: '5. Intellectual Property',
    body:
      'All software, branding, and content are owned by LowCost TTS or its licensors. You may not reuse, reproduce, or redistribute them without permission.',
  },
  {
    title: '6. Service Availability',
    body:
      'We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance or unexpected outages may occur.',
  },
  {
    title: '7. Termination',
    body:
      'We reserve the right to suspend or terminate your access if we suspect misuse or violation of these Terms.',
  },
  {
    title: '8. Limitation of Liability',
    body:
      'We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.',
  },
  {
    title: '9. Governing Law',
    body:
      'These Terms are governed by and construed under the laws of the country in which LowCost TTS is headquartered, without regard to conflicts of law.',
  },
  {
    title: '10. Updates to Terms',
    body:
      'We may update these Terms from time to time. Users will be notified via email or site announcement when significant changes are made.',
  },
];