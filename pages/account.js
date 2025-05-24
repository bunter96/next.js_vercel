import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { account } from '@/lib/appwriteConfig';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState(user?.prefs?.picture || '/default-avatar.png');
  const [sessions, setSessions] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Fetch all sessions
  useEffect(() => {
    if (!user || authLoading) return;

    const fetchSessions = async () => {
      setFetchLoading(true);
      try {
        const sessionData = await account.listSessions();
        console.log('Sessions fetch response:', sessionData);
        setSessions(sessionData.sessions);
      } catch (err) {
        console.error('Failed to fetch sessions:', {
          message: err.message,
          code: err.code,
          type: err.type,
          stack: err.stack,
        });
        let errorMessage = 'Failed to load session details.';
        if (err.code === 404) {
          errorMessage = 'No sessions found.';
        } else if (err.code === 403) {
          errorMessage = 'Permission denied to access session data.';
        }
        setError(errorMessage);
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchSessions();
  }, [user, authLoading]);

  // Handle session logout
  const handleSessionLogout = async (sessionId) => {
    try {
      await account.deleteSession(sessionId);
      setSessions(sessions.filter(session => session.$id !== sessionId));
      toast.success('Session ended successfully.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Failed to delete session:', err);
      toast.error('Failed to end session. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      console.log('Initiating account deletion for user:', user.$id);
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.$id }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message, {
          position: 'top-right',
          autoClose: 1000, // Shorten toast duration for faster transition
        });
        // Delay the refresh slightly to ensure the toast is visible
        setTimeout(() => {
          window.location.href = 'http://localhost:3000/';
        }, 1000); // Match the toast duration
      } else {
        throw new Error(result.message || 'Failed to delete account.');
      }
    } catch (err) {
      console.error('Failed to delete account - Client-side error:', err);
      toast.error(err.message || 'Failed to delete account. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle account logout
  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-6">
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

        {/* Session Details */}
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Sessions</h3>
          {error ? (
            <p className="text-red-600 text-center">{error}</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-600 text-center">No active sessions found.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.$id}
                  className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-gray-900 truncate">
                      {formatDate(session.$createdAt)}
                    </span>
                    <span className="text-gray-600 truncate">
                      {session.deviceName || 'Unknown Device'}
                    </span>
                    <span className="text-gray-600 truncate">
                      {session.osName || 'Unknown OS'} {session.osVersion || ''}
                    </span>
                    <span className="text-gray-600 truncate">
                      {session.ip || 'N/A'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        session.current
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {session.current ? 'Current' : 'Inactive'}
                    </span>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => handleSessionLogout(session.$id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Log Out
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Deletion */}
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Deletion</h3>
          <p className="text-gray-600 mb-4">
            Deleting your account will permanently remove all associated data, including your profile, sessions, audio generations, and cloned voices. This action cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2">Deleting...</span>
              </div>
            ) : (
              'Delete Account'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;