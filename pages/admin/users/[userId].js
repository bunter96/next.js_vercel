// pages/admin/users/[userId].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { databases } from '@/lib/appwriteConfig';

export default function UserDetails() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { userId } = router.query;
  const [userData, setUserData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.is_admin && userId) {
      fetchUserDetails();
    }
  }, [user, userId]);

  const fetchUserDetails = async () => {
    setFetchLoading(true);
    try {
      const databaseId = '67fecfed002f909fc072';
      const collectionId = '67fecffb00075d13ade6';
      const response = await databases.getDocument(databaseId, collectionId, userId);
      setUserData(response);
    } catch (error) {
      console.error('Error fetching user details:', error);
      router.push('/admin/users'); // Redirect if user not found
    } finally {
      setFetchLoading(false);
    }
  };

  // Generate a fallback avatar color based on user name or email
  const getAvatarFallback = (name, email) => {
    const str = name || email || 'U';
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
    const index = str.charCodeAt(0) % colors.length;
    return {
      initial: str[0].toUpperCase(),
      color: colors[index],
    };
  };

  if (loading || fetchLoading) {
    return <div className="text-center py-16">Loading...</div>;
  }

  if (!user || !user.is_admin || !userData) {
    return null;
  }

  const { initial, color } = getAvatarFallback(userData.name, userData.user_email);

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-8">
        <Link href="/admin/users">
          <button className="text-blue-600 hover:text-blue-800 mr-4">← Back to Users</button>
        </Link>
        <h1 className="text-4xl font-bold text-gray-800">User Details</h1>
      </div>
      <div className="bg-white rounded-xl shadow p-8">
        <div className="flex items-center mb-6">
          {userData.picture ? (
            <img
              src={userData.picture}
              alt={`${userData.name || 'User'} avatar`}
              className="h-16 w-16 rounded-full object-cover mr-4"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div
              className={`h-16 w-16 rounded-full ${color} flex items-center justify-center text-white font-medium text-2xl mr-4`}
            >
              {initial}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{userData.name || 'Unnamed User'}</h2>
            <p className="text-gray-600">{userData.user_email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-gray-900">{userData.current_active_plan || 'None'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Admin Status</p>
            <p className="text-gray-900">{userData.is_admin ? 'Admin' : 'Non-Admin'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Status</p>
            <p className="text-gray-900">{userData.is_active ? 'Active' : 'Inactive'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Characters Allowed</p>
            <p className="text-gray-900">{userData.char_allowed || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Characters Remaining</p>
            <p className="text-gray-900">{userData.char_remaining || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Plan Start Date</p>
            <p className="text-gray-900">
              {userData.current_plan_start_date
                ? new Date(userData.current_plan_start_date).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Plan Expiry Date</p>
            <p className="text-gray-900">
              {userData.current_plan_expiry_date
                ? new Date(userData.current_plan_expiry_date).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Product ID</p>
            <p className="text-gray-900">{userData.active_product_id || 'None'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Billing Cycle</p>
            <p className="text-gray-900">{userData.billing_cycle || 'None'}</p>
          </div>
        </div>
        <div className="mt-8">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-4">
            Edit User
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Delete User
          </button>
        </div>
      </div>
    </motion.div>
  );
}