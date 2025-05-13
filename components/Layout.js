// components/Layout.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAdminRoute = router.pathname.startsWith('/admin');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {isAdminRoute && user?.is_admin && !loading ? (
        <div className="flex">
          {/* Sidebar for Admin Panel */}
          <aside className="w-64 bg-white shadow-md h-screen fixed">
            <div className="p-6">
              <Link href="/admin">
                <h2 className="text-2xl font-bold text-blue-600 text-center cursor-pointer hover:text-blue-800">
                  Admin Panel
                </h2>
              </Link>
            </div>
            <nav className="mt-6">
              <Link href="/admin">
                <div className={`px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 ${router.pathname === '/admin' ? 'bg-blue-50 text-blue-600' : ''}`}>
                  Dashboard
                </div>
              </Link>
              <Link href="/admin/users">
                <div className={`px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 ${router.pathname === '/admin/users' ? 'bg-blue-50 text-blue-600' : ''}`}>
                  Users
                </div>
              </Link>
            </nav>
          </aside>
          {/* Main Content for Admin */}
          <div className="flex-1 ml-64">
            <main className={`min-h-[70vh] ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 p-8`}>
              {children}
            </main>
          </div>
        </div>
      ) : (
        <>
          {/* Regular Layout for Non-Admin Routes */}
          <Header />
          <main className={`min-h-[70vh] ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            {children}
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}