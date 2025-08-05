import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, storage, Query } from '@/lib/appwriteConfig';
import { FiDownload } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';

// Helper functions to handle Blob <-> Base64 conversion
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const base64ToBlob = (base64, type) => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type });
};

const HISTORY_COLLECTION_ID = '680e9bf90014579d3f5b';
const USER_PROFILES_COLLECTION_ID = '67fecffb00075d13ade6';
const STORAGE_BUCKET_ID = '680eaa3400394d8108bc';
const BACKEND_URL = '/api/tts';
const DEFAULT_CHAR_REMAINING = 5000;

const MyModelsTabContent = ({ onSelectModel }) => {
  const { user } = useAuth();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getModels = async () => {
      if (!user) {
        setError('Sign in to view your models.');
        setLoading(false);
        return;
      }
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USER_MODELS_COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );
        setModels(response.documents);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch your models.');
        setLoading(false);
      }
    };
    getModels();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {models.length === 0 ? (
        <div className="py-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No models found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create one in the Voice Cloning Studio.</p>
        </div>
      ) : (
        models.map(( modelItem) => (
          <div
            key={modelItem.fishAudioModelId}
            className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
            onClick={() => onSelectModel(modelItem)}
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={modelItem.coverImage || '/placeholder.png'}
                  alt={modelItem.title}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-700"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">{modelItem.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {modelItem.fishAudioModelId}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectModel(modelItem);
              }}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all duration-200 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:shadow-md"
            >
              Use Model
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const BrowseModelsTabContent = ({ onSelectModel }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const getModels = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_BROWSE_MODELS_COLLECTION_ID,
          [Query.orderDesc('$createdAt')]
        );
        setModels(response.documents);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch public models.');
        setLoading(false);
      }
    };
    getModels();
  }, []);

  const filteredModels = models.filter((model) =>
    model.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search public models by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-indigo-400"
          />
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredModels.length === 0 ? (
          <div className="py-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No models found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No models match your search.' : 'No public models available.'}
            </p>
          </div>
        ) : (
          filteredModels.map((modelItem) => (
            <div
              key={modelItem.fish_model_id}
              className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
              onClick={() => onSelectModel(modelItem)}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={modelItem.image_url || '/placeholder.png'}
                    alt={modelItem.title}
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-700"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">{modelItem.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID: {modelItem.fish_model_id}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectModel(modelItem);
                }}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all duration-200 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:shadow-md"
              >
                Use Model
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioList, setAudioList] = useState([]);
  const [model, setModel] = useState(null);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [savedAudioIds, setSavedAudioIds] = useState(new Set());
  const [savingAudioIds, setSavingAudioIds] = useState(new Set());
  const { user } = useAuth();
  const router = useRouter();

  // Determine MAX_CHARS based on user's current_active_plan
  const getMaxChars = () => {
    if (!user || !user.current_active_plan) {
      return 500; // Default to free plan if no user or plan
    }
    switch (user.current_active_plan.toLowerCase()) {
      case 'free':
        return 500;
      case 'starter monthly':
      case 'starter yearly':
        return 1000;
      case 'pro monthly':
      case 'pro yearly':
        return 2000;
      case 'turbo monthly':
      case 'turbo yearly':
        return 3000;
      default:
        return 500; // Fallback to free plan limit if plan or user is Invalid
    }
  };
  const MAX_CHARS = getMaxChars();

  // Initialize state from sessionStorage
  useEffect(() => {
    const savedText = sessionStorage.getItem('tts_text');
    const savedModel = sessionStorage.getItem('tts_model');
    const savedAudioList = sessionStorage.getItem('tts_audioList');

    if (savedText) {
      setText(savedText);
    }

    if (savedModel) {
      try {
        setModel(JSON.parse(savedModel));
      } catch (error) {
        console.error('Error parsing saved model:', error);
      }
    }

    if (savedAudioList) {
      try {
        const parsedAudioList = JSON.parse(savedAudioList);
        Promise.all(
          parsedAudioList.map(async (audio) => {
            if (audio.base64) {
              const blob = await base64ToBlob(audio.base64, 'audio/mpeg');
              const url = URL.createObjectURL(blob);
              return { ...audio, blob, url, base64: undefined };
            }
            return audio;
          })
        ).then((restoredAudioList) => {
          setAudioList(restoredAudioList);
        });
      } catch (error) {
        console.error('Error restoring audio list:', error);
      }
    }

    return () => {
      // Revoke blob URLs on unmount
      audioList.forEach((audio) => {
        if (audio.url) URL.revokeObjectURL(audio.url);
      });
    };
  }, []);

  // Save state to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem('tts_text', text);
  }, [text]);

  useEffect(() => {
    sessionStorage.setItem('tts_model', model ? JSON.stringify(model) : '');
  }, [model]);

  useEffect(() => {
    const saveAudioList = async () => {
      const audioListWithBase64 = await Promise.all(
        audioList.map(async (audio) => {
          if (audio.blob) {
            const base64 = await blobToBase64(audio.blob);
            return { ...audio, base64, blob: undefined, url: undefined };
          }
          return audio;
        })
      );
      sessionStorage.setItem('tts_audioList', JSON.stringify(audioListWithBase64));
    };
    saveAudioList();
  }, [audioList]);

  const handleConvert = async () => {
    if (!user) {
      toast.error('Please sign in to generate speech.');
      return;
    }

    // Check if the user's account is active
    if (!user.is_active) {
      toast.error('Your account is not active. Please contact support.');
      return;
    }
    
    if (!text.trim()) {
      toast.error('Please enter text to convert.');
      return;
    }
    if (!model) {
      toast.error('Please select a voice model.');
      return;
    }

    setLoading(true);

    try {
      // Fetch char_remaining from user_profiles
      let profile;
      let charRemaining;
      try {
        const profileResponse = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );
        profile = profileResponse.documents[0];

        if (!profile) {
          profile = await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
            'unique()',
            {
              userId: user.$id,
              char_remaining: DEFAULT_CHAR_REMAINING,
            }
          );
          charRemaining = DEFAULT_CHAR_REMAINING;
        } else {
          charRemaining = profile.char_remaining;
          if (!Number.isInteger(charRemaining)) {
            charRemaining = DEFAULT_CHAR_REMAINING;
          }
        }
      } catch (profileError) {
        toast.error(`Failed to fetch character quota: ${profileError.message}`);
        setLoading(false);
        return;
      }

      // Validate sufficient characters
      const textLength = text.length;
      if (textLength > charRemaining) {
        toast.error(
          <>
            Insufficient character quota ({textLength} characters needed, {charRemaining} available).{' '}
            <span
              className="underline cursor-pointer"
              onClick={() => router.push('/pricing')}
            >
              Upgrade your plan
            </span>
            .
          </>,
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
        setLoading(false);
        return;
      }

      // Proceed with conversion
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, MAX_CHARS),
          modelId: model.fishAudioModelId || model.fish_model_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error generating speech');
      }

      const audioBlob = await response.blob();

      // Validate audioBlob
      if (!audioBlob || !(audioBlob instanceof Blob)) {
        throw new Error('Invalid audio blob received from API');
      }
      if (audioBlob.size === 0) {
        throw new Error('Empty audio blob received from API');
      }
      if (audioBlob.type !== 'audio/mpeg') {
        throw new Error(`Invalid blob type: ${audioBlob.type}, expected audio/mpeg`);
      }

      // Deduct characters from user_profiles
      try {
        const newCharRemaining = charRemaining - textLength;
        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
          profile.$id,
          {
            char_remaining: newCharRemaining,
          }
        );
      } catch (deductionError) {
        toast.error(`Failed to update character quota: ${deductionError.message}`);
      }

      const newAudioUrl = URL.createObjectURL(audioBlob);

      setAudioList((prev) => {
        const newList = [
          {
            id: Date.now(),
            url: newAudioUrl,
            blob: audioBlob,
            timestamp: new Date().toLocaleString(),
          },
          ...prev,
        ];
        return newList;
      });

      toast.success('Speech generated successfully!');
    } catch (error) {
      toast.error(`Failed to generate speech: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (audio) => {
    if (!user) {
      toast.error('Please sign in to save audio.');
      return;
    }

    // Check if user is on a free plan
    try {
      const profileResponse = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );
      const profile = profileResponse.documents[0];

      if (profile.current_active_plan === 'free') {
        toast.error(
          <>
            Your current plan does not allow saving audio.{' '}
            <span className="underline cursor-pointer" onClick={() => router.push('/pricing')}>
              Upgrade your plan
            </span>
            .
          </>,
          {
            position: 'top-right',
            autoClose: 5000,
          }
        );
        return;
      }
    } catch (profileError) {
      toast.error(`Failed to check user plan: ${profileError.message}`);
      return;
    }

    if (savedAudioIds.has(audio.id) || savingAudioIds.has(audio.id)) {
      return;
    }
    setSavingAudioIds((prev) => new Set([...prev, audio.id]));

    try {
      if (!audio.blob) {
        throw new Error('Audio blob is missing');
      }
      if (!(audio.blob instanceof Blob)) {
        throw new Error('Invalid audio blob type');
      }
      if (audio.blob.size === 0) {
        throw new Error('Audio blob is empty');
      }

      const audioFile = new File([audio.blob], `speech-${audio.id}.mp3`, { type: 'audio/mpeg' });

      const file = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,
        'unique()',
        audioFile
      );

      const audioUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_HISTORY_COLLECTION_ID,
        'unique()',
        {
          created_at: audio.timestamp,
          audio_url: audioUrl,
          userId: user.$id,
        }
      );

      setSavedAudioIds((prev) => new Set([...prev, audio.id]));
      toast.success('Audio saved successfully!');
    } catch (error) {
      if (error.message.includes('blob') || error.message.includes('size')) {
        toast.error('Failed to save audio: Invalid or missing audio file.');
      } else if (error.code === 404) {
        toast.error('Failed to save audio: History collection not found.');
      } else if (error.code === 403) {
        toast.error('Failed to save audio: Permission denied.');
      } else if (error.code === 400) {
        toast.error('Failed to save audio: Invalid history collection attributes.');
      } else {
        toast.error(`Failed to save audio: ${error.message}`);
      }
    } finally {
      setSavingAudioIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(audio.id);
        return newSet;
      });
    }
  };

  const handleDownload = (audio) => {
    if (!audio.blob) {
      toast.error('Audio file is not available for download.');
      return;
    }
    const url = URL.createObjectURL(audio.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `speech-${audio.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleModelSelect = (selectedModel) => {
    setModel(selectedModel);
    setIsModelDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8 dark:from-gray-900 dark:to-black">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight dark:from-indigo-400 dark:to-purple-400">
          Text to Speech Studio
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:shadow-2xl dark:hover:shadow-indigo-500/20">
              {/* Text Input Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2 dark:text-gray-200">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Enter Text
                </h2>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  className="w-full h-48 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-indigo-400"
                  placeholder="Type or paste your text here..."
                />
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={() => setText('')}
                    disabled={!text}
                    className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:disabled:opacity-40"
                  >
                    Clear
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      text.length >= MAX_CHARS ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {text.length}/{MAX_CHARS}
                  </span>
                </div>
              </div>

              {/* Model Selection */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2 dark:text-gray-200">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Choose Voice Model
                </h2>
                {model ? (
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-700 dark:border-gray-600 dark:shadow-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={model.coverImage || model.image_url || '/placeholder.png'}
                        alt={model.title}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-700"
                      />
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{model.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {model.fishAudioModelId || model.fish_model_id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsModelDialogOpen(true)}
                      className="px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors duration-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                    <p className="text-gray-500 mb-4 dark:text-gray-400">No voice model selected.</p>
                    <button
                      onClick={() => setIsModelDialogOpen(true)}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:shadow-lg"
                    >
                      Select
                    </button>
                  </div>
                )}
              </div>

              {/* Convert Button */}
              <button
                onClick={handleConvert}
                disabled={loading || !text.trim() || !model}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-lg font-semibold shadow-lg hover:bg-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:shadow-xl dark:disabled:opacity-40"
              >
                {loading ? 'Generating Speech...' : 'Generate Speech'}
              </button>
            </div>
          </div>

          {/* Right Section - Audio History */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl border border-gray-100 min-h-[500px] flex flex-col dark:bg-gray-800 dark:border-gray-700 dark:shadow-2xl dark:hover:shadow-indigo-500/20">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2 dark:text-gray-200">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Audio History
              </h2>

              {audioList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">No audio generated yet.</p>
                  <p className="text-sm">Your generated speech will appear here.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {audioList.map((audio) => (
                    <div
                      key={audio.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:shadow-md"
                    >
                      <div className="flex-1 mr-4">
                        <audio controls src={audio.url} className="w-full" />
                        <span className="text-xs text-gray-500 mt-2 block dark:text-gray-400">
                          {audio.timestamp}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSave(audio)}
                          disabled={savedAudioIds.has(audio.id) || savingAudioIds.has(audio.id)}
                          className={`p-2 rounded-full ${
                            savedAudioIds.has(audio.id) ? 'bg-green-100 text-green-700 cursor-not-allowed dark:bg-green-800 dark:text-green-200' : 
                            'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800'
                          } transition-colors duration-200`}
                          title={savedAudioIds.has(audio.id) ? "Saved" : "Save Audio"}
                        >
                          {savingAudioIds.has(audio.id) ? (
                            <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : savedAudioIds.has(audio.id) ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(audio)}
                          className="p-2 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 transition-colors duration-200"
                          title="Download Audio"
                        >
                          <FiDownload className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection Dialog */}
      {isModelDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 dark:bg-opacity-75">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col dark:bg-gray-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Select a Voice Model</h3>
              <button
                onClick={() => setIsModelDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setTabValue(0)}
                  className={`flex-1 px-4 py-3 font-medium text-center ${tabValue === 0 
                    ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  } transition-colors duration-200`}
                >
                  My Models
                </button>
                <button
                  onClick={() => setTabValue(1)}
                  className={`flex-1 px-4 py-3 font-medium text-center ${tabValue === 1 
                    ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  } transition-colors duration-200`}
                >
                  Public Models
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {tabValue === 0 && <MyModelsTabContent onSelectModel={handleModelSelect} />}
                {tabValue === 1 && <BrowseModelsTabContent onSelectModel={handleModelSelect} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}