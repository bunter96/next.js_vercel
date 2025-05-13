// pages/admin/users.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function UserManagement() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.is_admin) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setFetchLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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

  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-800 mb-8">User Management</h1>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Picture
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => {
              const { initial, color } = getAvatarFallback(u.name, u.user_email);
              return (
                <tr
                  key={u.$id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                  onClick={() => router.push(`/admin/users/${u.$id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.picture ? (
                      <img
                        src={u.picture}
                        alt={`${u.name || 'User'} avatar`}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div
                        className={`h-10 w-10 rounded-full ${color} flex items-center justify-center text-white font-medium`}
                      >
                        {initial}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.user_email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.current_active_plan || 'None'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}