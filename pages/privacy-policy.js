import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — LowCost TTS</title>
        <meta name="description" content="How we handle your data and privacy at LowCost TTS" />
      </Head>

      <main className="bg-gray-50 dark:bg-gray-900 min-h-screen px-4 py-12 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            Privacy Policy
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{section.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{section.body}</p>
              </div>
            ))}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-gray-700 dark:text-gray-300 text-base leading-relaxed text-center">
              For questions or privacy concerns, contact us at{' '}
              <a
                href="mailto:buntercodes@gmail.com"
                className="text-blue-600 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                buntercodes@gmail.com
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
    title: '1. Overview',
    body:
      'We value your privacy. LowCost TTS is designed with user data protection in mind. This policy explains what information we collect, how it’s used, and how we keep it secure.',
  },
  {
    title: '2. Cookie Usage',
    body:
      'We only use essential cookies, including those required for authentication via Appwrite. These cookies help manage sessions securely and are not used to track or profile users. Your cookie preferences are saved in a cookie named `cookie_consent`.',
  },
  {
    title: '3. AI-Generated Content',
    body:
      'All text-to-speech content is generated using AI models based solely on your input. We do not store or analyze the content you generate unless you explicitly save it in your account.',
  },
  {
    title: '4. Account Information',
    body:
      'When you create an account, we store your email and authentication data using Appwrite. We never sell or share this data with third parties. All user passwords are securely hashed.',
  },
  {
    title: '5. Audio Data',
    body:
      'Generated audio files may be stored temporarily on our servers to provide download access. These files are automatically deleted after a short retention period unless you choose to save them.',
  },
  {
    title: '6. No Third-Party Tracking',
    body:
      'We do not use third-party analytics, advertising, or tracking tools. Your usage of LowCost TTS remains private and unprofiled.',
  },
  {
    title: '7. Data Security',
    body:
      'We implement industry-standard encryption and security practices to protect your information. All connections to our services are encrypted using HTTPS.',
  },
  {
    title: '8. Your Rights',
    body:
      'You may request access, correction, or deletion of your data at any time. We fully support GDPR and other global privacy frameworks.',
  },
  {
    title: '9. Policy Updates',
    body:
      'We may update this policy occasionally. Significant changes will be announced on our website. Continued use of LowCost TTS after updates means you agree to the new policy.',
  },
];