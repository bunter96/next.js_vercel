// pages/_app.js
import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/context/AuthContext';
import CookieConsent from '@/components/CookieConsent'; // Make sure path is correct
import { Analytics } from '@vercel/analytics/react'; // ✅ Import Vercel Analytics

export default function App({ Component, pageProps }) {
  return (
    <div className="font-sans">
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
          <CookieConsent />
          <Analytics /> {/* ✅ Add Analytics component here */}
        </Layout>
      </AuthProvider>
    </div>
  );
}