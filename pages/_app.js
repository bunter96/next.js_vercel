// pages/_app.js
import Head from 'next/head';
import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/context/AuthContext';
import CookieConsent from '@/components/CookieConsent';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config';

export default function App({ Component, pageProps }) {
  return (
    <div className="font-sans">
	<Head>
	  <title>{`${APP_NAME} | ${APP_DESCRIPTION}`}</title>
	  <meta name="description" content={`${APP_NAME} | ${APP_DESCRIPTION}`} />
	  <meta name="viewport" content="width=device-width, initial-scale=1" />
	  <meta charSet="UTF-8" />
	</Head>
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
          <CookieConsent />
          <Analytics />
          <SpeedInsights />
        </Layout>
      </AuthProvider>
    </div>
  );
}
