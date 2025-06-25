// pages/_app.js
import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/context/AuthContext';
import CookieConsent from '@/components/CookieConsent'; // Make sure path is correct

export default function App({ Component, pageProps }) {
  return (
    <div className="font-sans">
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
          <CookieConsent />
        </Layout>
      </AuthProvider>
    </div>
  );
}
