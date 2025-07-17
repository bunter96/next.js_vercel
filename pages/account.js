import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { account, databases, storage, ID } from '@/lib/appwriteConfig';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfirmationModal from '../components/ConfirmationModal';

// Profile component for displaying and managing user account details
const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState(user?.prefs?.picture || '/default-avatar.png');
  const [sessions, setSessions] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New state for delete account confirmation modal
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);

  // Commented out Edit Profile state for future use
  /*
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    file: null,
  });
  const [formErrors, setFormErrors] = useState({ name: '', file: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [previewSrc, setPreviewSrc] = null);
  */

  // Redirect to login if not authenticated, or handle post-logout redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Update image source when user changes
  useEffect(() => {
    if (user) {
      setImageSrc(user.prefs?.picture || '/default-avatar.png');
      // Commented out Edit Profile form initialization
      /*
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        file: null,
      });
      setPreviewSrc(user.prefs?.picture || null);
      */
    }
  }, [user]);

  // Fetch all active sessions for the user
  useEffect(() => {
    if (!user || authLoading) return;

    const fetchSessions = async () => {
      setFetchLoading(true);
      try {
        const sessionData = await account.listSessions();
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

  // Handle sending verification email
  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    try {
      await account.createVerification('http://localhost:3000/verify-email');
      sessionStorage.setItem('verificationEmail', user.email);
      setIsModalOpen(true);
      toast.success('Verification email sent successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Failed to send verification email:', {
        message: err.message,
        code: err.code,
        type: err.type,
        stack: err.stack,
      });
      let errorMessage = 'Failed to send verification email. Please try again.';
      if (err.code === 429) {
        errorMessage = 'Too many attempts. Please wait before resending.';
      } else if (err.code === 401) {
        errorMessage = 'Session expired. Please log in again.';
        router.push('/login');
      }
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSendingVerification(false);
    }
  };

  // Commented out Edit Profile logic for future use
  /*
  // Validate file input for image uploads
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setFormErrors((prev) => ({ ...prev, file: 'Only JPEG, PNG, or GIF files are allowed' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, file: 'File size must be less than 5MB' }));
        return;
      }
      setEditForm((prev) => ({ ...prev, file }));
      setFormErrors((prev) => ({ ...prev, file: '' }));
      setPreviewSrc(URL.createObjectURL(file));
    }
  };

  // Handle form input changes for Edit Profile
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Handle Edit Profile form submission
  const handleEditProfile = async (e) => {
    e.preventDefault();
    setFormErrors({ name: '', file: '' });
    let hasError = false;

    if (!editForm.name.trim()) {
      setFormErrors((prev) => ({ ...prev, name: 'Name is required' }));
      hasError = true;
    }

    if (editForm.file && !['image/jpeg', 'image/png', 'image/gif'].includes(editForm.file.type)) {
      setFormErrors((prev) => ({ ...prev, file: 'Only JPEG, PNG, or GIF files are allowed' }));
      hasError = true;
    }

    if (editForm.file && editForm.file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, file: 'File size must be less than 5MB' }));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSaving(true);
    try {
      if (editForm.name !== user.name) {
        await account.updateName(editForm.name);
      }

      let pictureUrl = user.prefs?.picture || '';
      if (editForm.file) {
        const bucketId = process.env.NEXT_PUBLIC_APPWRITE_PROFILE_PICTURES_BUCKET_ID;
        const fileResponse = await storage.createFile(
          bucketId,
          ID.unique(),
          editForm.file,
          [
            Permission.read(Role.any()),
            Permission.write(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );
        pictureUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileResponse.$id}/preview?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
        await account.updatePrefs({ picture: pictureUrl });

        if (user.prefs?.picture) {
          const oldFileId = user.prefs.picture.split('/files/')[1]?.split('/preview')[0];
          if (oldFileId) {
            try {
              await storage.deleteFile(bucketId, oldFileId);
            } catch (err) {
              console.warn('Failed to delete old profile picture:', err);
            }
          }
        }
      }

      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID;
      await databases.updateDocument(databaseId, collectionId, user.$id, {
        name: editForm.name,
        user_email: user.email,
        picture: pictureUrl,
      });

      toast.success('Profile updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsEditing(false);
      setPreviewSrc(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      let errorMessage = 'Failed to update profile. Please try again.';
      if (err.code === 401) {
        errorMessage = 'Invalid credentials. Please log in again.';
      } else if (err.code === 429) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (err.code === 400) {
        errorMessage = 'Invalid input data. Please check your entries.';
      }
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };
  */

  // Terminate a specific session
  const handleSessionLogout = async (sessionId) => {
    try {
      await account.deleteSession(sessionId);
      setSessions(sessions.filter((session) => session.$id !== sessionId));
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

  // Function to execute account deletion (called after confirmation)
  const executeDeleteAccount = async () => {
    setIsDeleting(true);
    try {
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
          autoClose: 1000,
        });
        setTimeout(() => {
          window.location.href = 'http://localhost:3000/';
        }, 1000);
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
      setIsDeleteAccountModalOpen(false);
    }
  };

  // Modified handleDeleteAccount to open the modal
  const handleDeleteAccountClick = () => {
    setIsDeleteAccountModalOpen(true);
  };

  // Log out all sessions, refresh, and redirect to home
  const handleLogout = async () => {
    try {
      const sessions = await account.listSessions();
      await Promise.all(sessions.sessions.map((session) => account.deleteSession(session.$id)));
      toast.success('Successfully logged out!', {
        position: 'top-right',
        autoClose: 1000,
      });
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Format date for session display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Show LoadingSpinner during auth or session fetch
  if (authLoading || fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Return null if no user (redirect will handle)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-indigo-600 dark:to-purple-600 h-32"></div>
          <div className="flex justify-center -mt-16">
            <div className="relative">
              <Image
                src={imageSrc}
                alt="Profile picture"
                width={120}
                height={120}
                className="rounded-full border-4 border-white dark:border-gray-800 shadow-md"
                onError={() => setImageSrc('/default-avatar.png')}
              />
            </div>
          </div>
          <div className="text-center px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name || 'User'}</h2>
            <div className="mt-2 flex justify-center items-center space-x-2">
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  user.emailVerification
                    ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                    : 'bg-red-100 text-red-500 dark:bg-red-700 dark:text-red-100'
                }`}
              >
                {user.emailVerification ? 'Verified' : 'Unverified'}
              </span>
            </div>
            {!user.emailVerification && (
              <div className="mt-4">
                <button
                  onClick={handleSendVerification}
                  disabled={isSendingVerification}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors ${
                    isSendingVerification ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSendingVerification ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white dark:border-gray-200 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2">Sending...</span>
                    </div>
                  ) : (
                    'Send verification email'
                  )}
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-center space-x-4 pb-6">
            {/* Edit Profile button hidden as per request */}
            {/* To restore Edit Profile button, uncomment the following: */}
            {/*
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Edit Profile
            </button>
            */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Full-screen modal for verification email */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
                Verification Email Sent
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                An email verification mail is sent to your registered email. Check your inbox to verify it.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal - Commented out for future use */}
        {/*
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Edit Profile</h3>
              <form onSubmit={handleEditProfile} className="space-y-6">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Image
                      src={previewSrc || imageSrc}
                      alt="Profile picture preview"
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-gray-200 shadow-md"
                      onError={() => setPreviewSrc('/default-avatar.png')}
                    />
                    <label
                      htmlFor="file"
                      className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      <input
                        id="file"
                        name="file"
                        type="file"
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                {formErrors.file && (
                  <p className="text-center text-sm text-red-600">{formErrors.file}</p>
                )}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={editForm.name}
                    onChange={handleFormChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Your name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <p className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 sm:text-sm">
                    {editForm.email}
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewSrc(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors ${
                      isSaving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        */}

        {/* Session Details */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Login Sessions</h3>
          {error ? (
            <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300 text-center">No active sessions found.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.$id}
                  className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-gray-900 dark:text-gray-100 truncate">
                      {formatDate(session.$createdAt)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {session.deviceName || 'Unknown Device'}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {session.osName || 'Unknown OS'} {session.osVersion || ''}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 truncate">
                      {session.ip || 'N/A'}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        session.current
                          ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {session.current ? 'Current' : 'Inactive'}
                    </span>
                  </div>
                  {!session.current && (
                    <button
                      onClick={() => handleSessionLogout(session.$id)}
                      className="text-blue-600 hover:text-blue-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
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
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Deletion</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Deleting your account will permanently remove all associated data, including your profile, sessions, audio generations, and cloned voices. This action cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccountClick}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white dark:border-gray-200 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2">Deleting...</span>
              </div>
            ) : (
              'Delete Account'
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Delete Account */}
      <ConfirmationModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirm={executeDeleteAccount}
        title="Confirm Account Deletion"
        message="Are you absolutely sure you want to delete your account? This action is irreversible and will permanently remove all your data."
        confirmButtonText="Delete"
        cancelButtonText="No"
      />
    </div>
  );
};

export default Profile;