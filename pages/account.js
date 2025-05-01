import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { databases, Query } from '@/lib/appwriteConfig';

const DATABASE_ID = '67fecfed002f909fc072';
const USER_PROFILES_COLLECTION_ID = '67fecffb00075d13ade6'; // TODO: Replace with actual ID
const DEFAULT_CHAR_REMAINING = 5000;
const DEFAULT_CHAR_ALLOWED = 5000; // Adjust based on actual plan data

const Profile = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState(user?.prefs?.picture || '/default-avatar.png');
  const [charRemaining, setCharRemaining] = useState(DEFAULT_CHAR_REMAINING);
  const [charAllowed, setCharAllowed] = useState(DEFAULT_CHAR_ALLOWED);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Update image source when user changes
  useEffect(() => {
    setImageSrc(user?.prefs?.picture || '/default-avatar.png');
  }, [user]);

  // Fetch char_remaining from user_profiles
  useEffect(() => {
    if (!user || authLoading) return;

    const fetchProfile = async () => {
      setFetchLoading(true);
      try {
        console.log('Fetching profile for userId:', user.$id);
        const response = await databases.listDocuments(
          DATABASE_ID,
          USER_PROFILES_COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );
        console.log('Profile fetch response:', {
          documentCount: response.documents.length,
          documents: response.documents,
        });

        const profile = response.documents[0];
        if (profile) {
          const charRemainingValue = Number.isInteger(profile.char_remaining)
            ? profile.char_remaining
            : DEFAULT_CHAR_REMAINING;
          setCharRemaining(charRemainingValue);
          console.log('Fetched char_remaining:', charRemainingValue);
        } else {
          console.warn('No user profile found for userId:', user.$id);
          // Optionally create a new profile to match text-to-speech.js
          const newProfile = await databases.createDocument(
            DATABASE_ID,
            USER_PROFILES_COLLECTION_ID,
            'unique()',
            {
              userId: user.$id,
              char_remaining: DEFAULT_CHAR_REMAINING,
            }
          );
          setCharRemaining(DEFAULT_CHAR_REMAINING);
          console.log('Created new user profile:', newProfile);
        }
        // Use user.char_allowed if available, else default
        setCharAllowed(user.char_allowed || DEFAULT_CHAR_ALLOWED);
      } catch (error) {
        console.error('Failed to fetch user profile:', {
          message: error.message,
          code: error.code,
          type: error.type,
          stack: error.stack,
        });
        let errorMessage = 'Failed to load character quota.';
        if (error.code === 404) {
          errorMessage = 'User profiles collection not found.';
        } else if (error.code === 403) {
          errorMessage = 'Permission denied to access user profiles.';
        }
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
        });
        setCharRemaining(DEFAULT_CHAR_REMAINING);
        setCharAllowed(DEFAULT_CHAR_ALLOWED);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  if (authLoading || fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will handle unauthenticated state
  }

  // Format dates
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate progress for char_remaining vs char_allowed
  const progress = charAllowed > 0 ? (charRemaining / charAllowed) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32"></div>
          <div className="flex justify-center -mt-16">
            <div className="relative">
              <Image
                src={imageSrc}
                alt="Profile picture"
                width={120}
                height={120}
                className="rounded-full border-4 border-white shadow-md"
                onError={() => setImageSrc('/default-avatar.png')}
              />
            </div>
          </div>
          <div className="text-center px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">{user.name || 'User'}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <div className="flex justify-center space-x-4 pb-6">
            <button
              onClick={() => toast.info('Edit Profile functionality coming soon!', {
                position: 'top-right',
                autoClose: 3000,
              })}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Subscription Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Plan</p>
              <p className="text-gray-900">
                {user.current_active_plan || 'No Active Plan'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-gray-900">
                {user.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Characters Allowed</p>
              <p className="text-gray-900">{charAllowed}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Characters Remaining</p>
              <p className="text-gray-900">{charRemaining}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-500">Usage Progress</p>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {charRemaining} / {charAllowed} characters remaining
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Plan Start Date</p>
              <p className="text-gray-900">{formatDate(user.current_plan_start_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Plan Expiry Date</p>
              <p className="text-gray-900">{formatDate(user.current_plan_expiry_date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Product ID</p>
              <p className="text-gray-900">{user.active_product_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Billing Cycle</p>
              <p className="text-gray-900">{user.billing_cycle || 'N/A'}</p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/plans"
              className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;