// components/Layout.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from './Header'; // Your existing Header component
import Footer from './Footer'; // Your existing Footer component
import DarkModeToggle from './DarkModeToggle'; // Import the DarkModeToggle component
import { MdHome, MdDashboard, MdPeople, MdAnalytics, MdSettings, MdMenu, MdClose } from 'react-icons/md'; // Assuming you have these icons

export default function Layout({ children }) {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdminRoute = router.pathname.startsWith('/admin');

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    // Apply global background and text colors here.
    // These will respond to the 'dark' class on the <html> element.
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300 font-sans">
      {isAdminRoute && user?.is_admin && !loading ? (
        <div className="flex">
          {/* Sidebar for Admin Panel - Apply dark mode styles here too */}
          <aside
            className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-md h-screen transform ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 relative">
              <Link href="/admin">
                <div className="flex items-center">
                  <MdHome className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer">
                    Admin Panel
                  </h2>
                </div>
              </Link>
              <button onClick={toggleSidebar} className="md:hidden text-gray-600 dark:text-gray-400">
                <MdClose className="w-6 h-6" />
              </button>
            </div>
            <nav className="mt-6">
              <Link href="/admin">
                <div
                  className={`flex items-center px-6 py-3 ${
                    router.pathname === '/admin'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-200'
                  }`}
                >
                  <MdDashboard className="w-6 h-6 mr-3" />
                  Dashboard
                </div>
              </Link>
              <Link href="/admin/users">
                <div
                  className={`flex items-center px-6 py-3 ${
                    router.pathname === '/admin/users' || router.pathname.startsWith('/admin/users/')
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-200'
                  }`}
                >
                  <MdPeople className="w-6 h-6 mr-3" />
                  Users
                </div>
              </Link>
              <Link href="/admin/analytics">
                <div
                  className={`flex items-center px-6 py-3 ${
                    router.pathname === '/admin/analytics'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-200'
                  }`}
                >
                  <MdAnalytics className="w-6 h-6 mr-3" />
                  Analytics
                </div>
              </Link>
              <Link href="/admin/settings">
                <div
                  className={`flex items-center px-6 py-3 ${
                    router.pathname === '/admin/settings'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-200'
                  }`}
                >
                  <MdSettings className="w-6 h-6 mr-3" />
                  Settings
                </div>
              </Link>
            </nav>
          </aside>
          {/* Main Content for Admin */}
          <div className="flex-1 md:ml-64">
            <div className="flex items-center justify-between p-8 md:p-4 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
              {/* Adding DarkModeToggle for admin section as well */}
              <span className="hidden md:block"></span> {/* Placeholder to balance toggle on right */}
              <button onClick={toggleSidebar} className="md:hidden text-gray-600 dark:text-gray-400">
                <MdMenu className="w-6 h-6" />
              </button>
              <DarkModeToggle />
            </div>
            <main className={`min-h-[70vh] ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 md:p-8`}>
              {children}
            </main>
          </div>
        </div>
      ) : (
        <>
          {/* Regular Layout for Non-Admin Routes */}
          {/* Pass the DarkModeToggle to your Header component as a child */}
          <Header>
            <DarkModeToggle />
          </Header>
          <main className={`min-h-[70vh] ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
            {children}
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}