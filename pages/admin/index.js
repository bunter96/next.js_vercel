// /pages/admin/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push('/'); // Redirect non-admins to homepage
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="text-center py-16">Loading...</div>;
  }

  if (!user || !user.is_admin) {
    return null; // Prevent flash of content before redirect
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
            <h3 className="text-xl font-bold text-blue-600 mb-2">Manage Users</h3>
            <p className="text-gray-600">View and edit user accounts.</p>
          </div>
        </Link>
        {/* Add more cards for other features (e.g., Analytics, Settings) */}
      </div>
    </motion.div>
  );
}