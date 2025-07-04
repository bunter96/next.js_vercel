import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { databases, ID, Permission, Role } from '@/lib/appwriteConfig';
import { FiUpload, FiMic, FiImage, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function VoiceCloning() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [clones, setClones] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [audioDurationError, setAudioDurationError] = useState('');
  const [audioPreview, setAudioPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDraggingAudio, setIsDraggingAudio] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [audioKey, setAudioKey] = useState(0); // Key to force audio player re-render
  
  const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav'];
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user]);

  const handleDragOver = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'audio') setIsDraggingAudio(true);
    if (type === 'image') setIsDraggingImage(true);
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'audio') setIsDraggingAudio(false);
    if (type === 'image') setIsDraggingImage(false);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'audio') setIsDraggingAudio(false);
    if (type === 'image') setIsDraggingImage(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (type === 'audio') handleAudioFile(file);
    if (type === 'image') handleImageFile(file);
  };

  const handleAudioFile = useCallback((file) => {
    if (!file) return;

    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, audioFile: 'Invalid audio format. Use MP3 or WAV' }));
      return;
    }

    if (file.size > MAX_AUDIO_SIZE) {
      setErrors(prev => ({ ...prev, audioFile: 'File too large (max 100MB)' }));
      return;
    }

    // Clean up previous audio URL if exists
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
    }

    const audioUrl = URL.createObjectURL(file);
    setAudioPreview(audioUrl);
    setAudioKey(prev => prev + 1); // Force audio player re-render

    const audio = new Audio();
    audio.src = audioUrl;

    audio.onloadedmetadata = () => {
      if (audio.duration < 30) {
        setAudioDurationError('Audio must be at least 30 seconds long.');
      } else {
        setAudioFile(file);
        setAudioDurationError('');
        setErrors(prev => ({ ...prev, audioFile: '' }));
      }
      // Clean up the audio element
      audio.remove();
    };

    audio.onerror = () => {
      setErrors(prev => ({ ...prev, audioFile: 'Failed to load audio file' }));
    };
  }, [audioPreview]);

  const handleImageFile = useCallback((file) => {
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors(prev => ({ ...prev, imageFile: 'Invalid image format. Use JPEG or PNG' }));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrors(prev => ({ ...prev, imageFile: 'Image too large (max 10MB)' }));
      return;
    }

    // Clean up previous image URL if exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
    setImageFile(file);
    setErrors(prev => ({ ...prev, imageFile: '' }));
  }, [imagePreview]);

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    handleAudioFile(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };

  const removeAudioFile = useCallback(() => {
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
    }
    setAudioFile(null);
    setAudioPreview(null);
    setAudioDurationError('');
    setErrors(prev => ({ ...prev, audioFile: '' }));
    document.querySelector('input[name="voices"]').value = '';
    setAudioKey(prev => prev + 1); // Force audio player re-render
  }, [audioPreview]);

  const removeImageFile = useCallback(() => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setErrors(prev => ({ ...prev, imageFile: '' }));
    document.querySelector('input[name="cover_image"]').value = '';
  }, [imagePreview]);

  const validateFields = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Clone name is required';
    if (!audioFile) newErrors.audioFile = 'Please select an audio file';
    if (!imageFile) newErrors.imageFile = 'Please select an image for avatar';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = useCallback(() => {
    setName('');
    removeAudioFile();
    removeImageFile();
    setErrors({});
    setAudioDurationError('');
  }, [removeAudioFile, removeImageFile]);

  const saveModelToAppwrite = async (modelData) => {
    try {
      const response = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_MODELS_COLLECTION_ID,
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
      toast.success('Voice cloned successfully!');

    } catch (error) {
      console.error('Cloning error:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up object URLs when component unmounts
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [audioPreview, imagePreview]);

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Voice Cloning - Fish Audio</title>
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
            Voice Cloning Studio
          </h1>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 transition-all duration-300 hover:shadow-xl border border-gray-100">
            <div className="space-y-6">
              {/* Clone Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Clone Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="My Custom Voice"
                  className={`w-full border rounded-xl p-3 focus:ring-2 transition-all duration-200 ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-400 bg-red-50'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Audio File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiMic className="w-5 h-5 text-indigo-600" />
                  Audio File <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div 
                    className={`flex-1 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                      isDraggingAudio 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : errors.audioFile 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'audio')}
                    onDragLeave={(e) => handleDragLeave(e, 'audio')}
                    onDrop={(e) => handleDrop(e, 'audio')}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-32 p-4">
                      <div className="flex flex-col items-center justify-center">
                        <FiUpload className={`w-8 h-8 mb-3 ${
                          isDraggingAudio ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <p className={`mb-2 text-sm ${
                          isDraggingAudio ? 'text-indigo-600' : 'text-gray-500'
                        }`}>
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className={`text-xs ${
                          isDraggingAudio ? 'text-indigo-600' : 'text-gray-500'
                        }`}>MP3 or WAV (Max 100MB)</p>
                      </div>
                      <input 
                        type="file" 
                        accept="audio/mpeg,audio/wav" 
                        onChange={handleAudioChange}
                        name="voices"
                        className="hidden" 
                      />
                    </label>
                  </div>
                  {audioPreview && (
                    <div className="flex-1 flex flex-col bg-gray-50 rounded-xl p-4 relative">
                      <button 
                        onClick={removeAudioFile}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full bg-white shadow-sm"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                      <audio 
                        key={audioKey} // Force re-render when audio changes
                        controls 
                        className="w-full mt-2"
                      >
                        <source src={audioPreview} type={audioFile?.type} />
                        Your browser does not support the audio element.
                      </audio>
                      <p className="text-xs text-gray-500 mt-2 truncate">
                        {audioFile?.name}
                      </p>
                    </div>
                  )}
                </div>
                {errors.audioFile && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.audioFile}
                  </p>
                )}
                {audioDurationError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {audioDurationError}
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiImage className="w-5 h-5 text-indigo-600" />
                  Avatar Image <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div 
                    className={`flex-1 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                      isDraggingImage 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : errors.imageFile 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'image')}
                    onDragLeave={(e) => handleDragLeave(e, 'image')}
                    onDrop={(e) => handleDrop(e, 'image')}
                  >
                    <label className="flex flex-col items-center justify-center w-full h-32 p-4">
                      <div className="flex flex-col items-center justify-center">
                        <FiUpload className={`w-8 h-8 mb-3 ${
                          isDraggingImage ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <p className={`mb-2 text-sm ${
                          isDraggingImage ? 'text-indigo-600' : 'text-gray-500'
                        }`}>
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className={`text-xs ${
                          isDraggingImage ? 'text-indigo-600' : 'text-gray-500'
                        }`}>JPEG or PNG (Max 10MB)</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png" 
                        onChange={handleImageChange}
                        name="cover_image"
                        className="hidden" 
                      />
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="flex-1 flex flex-col bg-gray-50 rounded-xl p-4 relative">
                      <button 
                        onClick={removeImageFile}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full bg-white shadow-sm"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                      <div className="flex items-center justify-center h-full">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-24 object-contain rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 truncate">
                        {imageFile?.name}
                      </p>
                    </div>
                  )}
                </div>
                {errors.imageFile && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.imageFile}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleClone}
                disabled={uploading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {uploading ? (
                  <>
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
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Start Voice Cloning</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Clone Preview Section */}
          {clones.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Your Cloned Voices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clones.map((clone) => (
                  <div
                    key={clone.id}
                    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      {clone.coverImage && (
                        <div className="relative">
                          <img
                            src={clone.coverImage}
                            alt="Voice cover"
                            className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-100"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white"></div>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {clone.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm mb-1">
                          {clone.state === 'completed' ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <FiCheckCircle className="w-4 h-4" />
                              Ready to use
                            </span>
                          ) : (
                            <span className="text-yellow-600 flex items-center gap-1">
                              <FiClock className="w-4 h-4" />
                              Processing
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          Created: {clone.createdAt}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
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