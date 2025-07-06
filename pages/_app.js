// pages/_app.js
import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/context/AuthContext';
import CookieConsent from '@/components/CookieConsent';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App({ Component, pageProps }) {
  return (
    <div className="font-sans">
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
          <CookieConsent />
          <Analytics />
          <SpeedInsights /> {/* ✅ Inject Speed Insights */}
        </Layout>
      </AuthProvider>
    </div>
  );
}