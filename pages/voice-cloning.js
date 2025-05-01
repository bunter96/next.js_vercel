import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { databases, ID, Permission, Role } from '@/lib/appwriteConfig';

export default function VoiceCloning() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Appwrite database constants
  const DATABASE_ID = '67fecfed002f909fc072';
  const USER_MODELS_COLLECTION_ID = '680431be00081ea103d1';

  const [name, setName] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [clones, setClones] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [audioDurationError, setAudioDurationError] = useState('');
  
  const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav'];
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user]);

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No audio file selected'); // Debug log
      return;
    }

    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, audioFile: 'Invalid audio format. Use MP3 or WAV' }));
      return;
    }

    if (file.size > MAX_AUDIO_SIZE) {
      setErrors(prev => ({ ...prev, audioFile: 'File too large (max 100MB)' }));
      return;
    }

    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      if (audio.duration < 30) {
        setAudioDurationError('Audio must be at least 30 seconds long.');
      } else {
        console.log('Selected audio file:', file); // Debug log
        setAudioFile(file);
        setAudioDurationError('');
        setErrors(prev => ({ ...prev, audioFile: '' }));
      }
    };
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No image file selected'); // Debug log
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, imageFile: 'Invalid image format. Use JPEG or PNG' }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors(prev => ({ ...prev, imageFile: 'Image too large (max 10MB)' }));
      return;
    }

    console.log('Selected image file:', file); // Debug log
    setImageFile(file);
    setErrors(prev => ({ ...prev, imageFile: '' }));
  };

  const validateFields = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Clone name is required';
    if (!audioFile) newErrors.audioFile = 'Please select an audio file';
    if (!imageFile) newErrors.imageFile = 'Please select an image for avatar';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setName('');
    setAudioFile(null);
    setImageFile(null);
    setErrors({});
    setAudioDurationError('');
    // Reset file input elements
    document.querySelector('input[name="voices"]').value = '';
    document.querySelector('input[name="cover_image"]').value = '';
  };

  const saveModelToAppwrite = async (modelData) => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        USER_MODELS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          fishAudioModelId: modelData.modelId,
          title: modelData.title,
          coverImage: modelData.coverImage,
          state: modelData.state,
          createdAt: modelData.createdAt,
        },
        [
          Permission.read(Role.user(user.$id)),
          Permission.write(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id)),
        ]
      );
      return response;
    } catch (error) {
      console.error('Error saving to Appwrite:', error);
      throw error;
    }
  };

  const handleClone = async () => {
    if (!validateFields()) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('title', name);
    formData.append('voices', audioFile);
    if (imageFile) {
      formData.append('cover_image', imageFile);
    }
    console.log('FormData entries:', [...formData.entries()]); // Debug log

    try {
      const response = await fetch('/api/voice-clone', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Voice cloning failed');
      }

      const data = await response.json();
      
      const newClone = {
        id: data.modelId,
        name: data.title,
        coverImage: data.coverImage,
        state: data.state,
        createdAt: new Date(data.createdAt).toLocaleString(),
      };

      setClones(prev => [newClone, ...prev]);
      await saveModelToAppwrite(data);
      resetForm();
      alert('Voice cloned successfully!');

    } catch (error) {
      console.error('Cloning error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Voice Cloning - Fish Audio</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
            Voice Cloning Studio
          </h1>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 transition-all duration-300 hover:shadow-2xl">
            <div className="space-y-6">
              {/* Clone Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clone Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="Enter clone name"
                  className={`w-full border rounded-lg p-3 focus:ring-2 transition-all duration-200 ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Audio File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audio File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="audio/mpeg,audio/wav"
                  onChange={handleAudioChange}
                  name="voices"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all duration-200"
                />
                {errors.audioFile && (
                  <p className="text-sm text-red-600 mt-1">{errors.audioFile}</p>
                )}
                {audioDurationError && (
                  <p className="text-sm text-red-600 mt-1">{audioDurationError}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  name="cover_image"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all duration-200"
                />
                {errors.imageFile && (
                  <p className="text-sm text-red-600 mt-1">{errors.imageFile}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleClone}
                disabled={uploading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
              >
                {uploading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                <span>{uploading ? 'Cloning Voice...' : 'Start Voice Cloning'}</span>
              </button>
            </div>
          </div>

          {/* Clone Preview Section */}
          {clones.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Your Cloned Voices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clones.map((clone) => (
                  <div
                    key={clone.id}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      {clone.coverImage && (
                        <img
                          src={clone.coverImage}
                          alt="Voice cover"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {clone.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-1">
                          Status: <span className="capitalize">{clone.state}</span>
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          Created: {clone.createdAt}
                        </p>
                        <p className="text-xs text-gray-500">
                          Model ID: {clone.id}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}