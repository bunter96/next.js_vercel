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
  const [toggleLoading, setToggleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', char_allowed: 0, char_remaining: 0, is_admin: 'No', picture: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

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
      setEditForm({
        name: response.name || '',
        char_allowed: response.char_allowed || 0,
        char_remaining: response.char_remaining || 0,
        is_admin: response.is_admin ? 'Yes' : 'No',
        picture: response.picture || '',
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      router.push('/admin/users');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleToggleActive = async () => {
    setToggleLoading(true);
    try {
      const response = await fetch(`/api/admin/user/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle user status');
      }
      const updatedUser = await response.json();
      setUserData(updatedUser);
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert(`Failed to update user status: ${error.message}`);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Are you sure you want to delete ${userData.name || 'this user'}? This action cannot be undone.`)) {
      return;
    }
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/user/${userId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      router.push('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    const { name, char_allowed, char_remaining, is_admin, picture } = editForm;

    // Validate inputs
    if (char_allowed < 0 || char_remaining < 0) {
      setEditError('Characters Allowed and Remaining must be non-negative');
      return;
    }

    setEditLoading(true);
    try {
      const response = await fetch(`/api/admin/user/${userId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          char_allowed: Number(char_allowed),
          char_remaining: Number(char_remaining),
          is_admin: is_admin === 'Yes',
          picture,
        }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      const updatedUser = await response.json();
      setUserData(updatedUser);
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setEditError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

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
      <div className="bg-white rounded-xl shadow p-8 mb-8">
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
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-gray-900">
              {userData.$createdAt
                ? new Date(userData.$createdAt).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-gray-900">
              {userData.$updatedAt
                ? new Date(userData.$updatedAt).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Actions</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userData.is_active}
                onChange={handleToggleActive}
                disabled={toggleLoading}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-gray-900">{userData.is_active ? 'Active' : 'Inactive'}</span>
            </label>
          </div>
          <button
            onClick={handleDeleteUser}
            disabled={deleteLoading}
            className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 ${deleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {deleteLoading ? 'Deleting...' : 'Delete User'}
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Profile</h3>
            <form onSubmit={handleEditProfile}>
              <div className="mb-4">
                <label className="block text-sm text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Enter name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-500 mb-1">Characters Allowed</label>
                <input
                  type="number"
                  value={editForm.char_allowed}
                  onChange={(e) => setEditForm({ ...editForm, char_allowed: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  min="0"
                  placeholder="Enter characters allowed"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-500 mb-1">Characters Remaining</label>
                <input
                  type="number"
                  value={editForm.char_remaining}
                  onChange={(e) => setEditForm({ ...editForm, char_remaining: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  min="0"
                  placeholder="Enter characters remaining"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-500 mb-1">Admin Status</label>
                <select
                  value={editForm.is_admin}
                  onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-500 mb-1">Profile Picture URL</label>
                <input
                  type="url"
                  value={editForm.picture}
                  onChange={(e) => setEditForm({ ...editForm, picture: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Enter image URL"
                />
              </div>
              {editError && <p className="text-red-600 text-sm mb-4">{editError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${editLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}