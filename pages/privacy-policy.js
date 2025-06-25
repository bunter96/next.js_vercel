// pages/privacy-policy.js
export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        We value your privacy. This application uses only essential cookies required to provide a secure and functional experience.
      </p>

      <p className="mb-4">
        Specifically, we use cookies provided by our authentication system (Appwrite) to manage user sessions and logins. These cookies are strictly necessary and do not track or profile users.
      </p>

      <p className="mb-4">
        We do not use third-party cookies, analytics, or advertising technologies. Your cookie preferences are stored only to remember your choice regarding this message, in a cookie named <code>cookie_consent</code>.
      </p>

      <p>
        If you have any questions about how we handle your data, feel free to contact us at [your email/contact info].
      </p>
    </main>
  );
}
