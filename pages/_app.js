import '@/styles/globals.css';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/context/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <div className="font-sans">
      <AuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </div>
  );
}
