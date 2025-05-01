import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, storage, Query } from '@/lib/appwriteConfig';
import { FiDownload } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';

const DATABASE_ID = '67fecfed002f909fc072';
const USER_MODELS_COLLECTION_ID = '680431be00081ea103d1';
const BROWSE_MODELS_COLLECTION_ID = '680d683b000797390037';
const HISTORY_COLLECTION_ID = '680e9bf90014579d3f5b'; // TODO: Replace with actual ID
const USER_PROFILES_COLLECTION_ID = '67fecffb00075d13ade6'; // TODO: Replace with actual ID
const STORAGE_BUCKET_ID = '680eaa3400394d8108bc';
const MAX_CHARS = 1000;
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
          DATABASE_ID,
          USER_MODELS_COLLECTION_ID,
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
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
        {error}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {models.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No models found. Create one in the Voice Cloning Studio.</p>
      ) : (
        models.map((modelItem) => (
          <div
            key={modelItem.fishAudioModelId}
            className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50 transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-6">
              <img
                src={modelItem.coverImage || '/placeholder.png'}
                alt={modelItem.title}
                className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-gray-100"
              />
              <div>
                <h3 className="font-medium text-gray-800">{modelItem.title}</h3>
                <p className="text-sm text-gray-500">ID: {modelItem.fishAudioModelId}</p>
              </div>
            </div>
            <button
              onClick={() => onSelectModel(modelItem)}
              className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 shadow-sm transition-all duration-200"
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
          DATABASE_ID,
          BROWSE_MODELS_COLLECTION_ID,
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
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-4">
        <input
          type="text"
          placeholder="Search public models by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
      </div>
      <div className="divide-y divide-gray-200">
        {filteredModels.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {searchQuery ? 'No models found matching your search.' : 'No public models available.'}
          </p>
        ) : (
          filteredModels.map((modelItem) => (
            <div
              key={modelItem.fish_model_id}
              className="flex items-center justify-between px-6 py-4 hover:bg-indigo-50 transition-all duration-200 hover:scale-[1.01]"
            >
              <div className="flex items-center space-x-6">
                <img
                  src={modelItem.image_url || '/placeholder.png'}
                  alt={modelItem.title}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-gray-100"
                />
                <div>
                  <h3 className="font-medium text-gray-800">{modelItem.title}</h3>
                  <p className="text-sm text-gray-500">ID: {modelItem.fish_model_id}</p>
                </div>
              </div>
              <button
                onClick={() => onSelectModel(modelItem)}
                className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-md hover:bg-indigo-600 shadow-sm transition-all duration-200"
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

  // Clear audioList on mount to avoid outdated entries
  useEffect(() => {
    setAudioList([]);
    console.log('audioList cleared on mount');
    return () => {
      // Revoke blob URLs on unmount
      audioList.forEach((audio) => {
        if (audio.url) URL.revokeObjectURL(audio.url);
      });
    };
  }, []);

  const handleConvert = async () => {
    if (!user) {
      toast.error('Please sign in to generate speech.');
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
          DATABASE_ID,
          USER_PROFILES_COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );
        profile = profileResponse.documents[0];

        if (!profile) {
          console.log('No user profile found, creating new one for user:', user.$id);
          profile = await databases.createDocument(
            DATABASE_ID,
            USER_PROFILES_COLLECTION_ID,
            'unique()',
            {
              userId: user.$id,
              char_remaining: DEFAULT_CHAR_REMAINING,
            }
          );
          charRemaining = DEFAULT_CHAR_REMAINING;
          console.log('Created new user profile:', profile);
        } else {
          charRemaining = profile.char_remaining;
          if (!Number.isInteger(charRemaining)) {
            console.warn('Invalid char_remaining, resetting to default:', charRemaining);
            charRemaining = DEFAULT_CHAR_REMAINING;
          }
        }
      } catch (profileError) {
        console.error('Profile fetch error:', {
          message: profileError.message,
          code: profileError.code,
          type: profileError.type,
          stack: profileError.stack,
        });
        toast.error(`Failed to fetch character quota: ${profileError.message}`);
        setLoading(false);
        return;
      }

      // Validate sufficient characters
      const textLength = text.length;
      if (textLength > charRemaining) {
        console.log('Insufficient character quota:', {
          textLength,
          charRemaining,
        });
        toast.error(
          <>
            Insufficient character quota ({textLength} characters needed, {charRemaining} available).{' '}
            <span
              className="underline cursor-pointer"
              onClick={() => router.push('/plans')}
            >
              
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

      console.log('API response:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error generating speech');
      }

      const audioBlob = await response.blob();
      console.log('Audio blob:', {
        type: audioBlob.type,
        size: audioBlob.size,
        isBlob: audioBlob instanceof Blob,
      });

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
          DATABASE_ID,
          USER_PROFILES_COLLECTION_ID,
          profile.$id,
          {
            char_remaining: newCharRemaining,
          }
        );
        console.log('Character deduction:', {
          userId: user.$id,
          textLength,
          charRemaining,
          newCharRemaining,
        });
      } catch (deductionError) {
        console.error('Character deduction error:', {
          message: deductionError.message,
          code: deductionError.code,
          type: deductionError.type,
          stack: deductionError.stack,
        });
        toast.error(`Failed to update character quota: ${deductionError.message}`);
        // Continue with audio generation
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
        console.log('Updated audioList:', newList);
        return newList;
      });

      toast.success('Speech generated successfully!');
    } catch (error) {
      console.error('Generate speech error:', {
        message: error.message,
        stack: error.stack,
      });
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

    if (savedAudioIds.has(audio.id) || savingAudioIds.has(audio.id)) {
      return; // Prevent duplicate saves or saving while in progress
    }

    console.log('Saving audio:', {
      id: audio.id,
      timestamp: audio.timestamp,
      url: audio.url,
      hasBlob: !!audio.blob,
      blobType: audio.blob?.type,
      blobSize: audio.blob?.size,
    });

    setSavingAudioIds((prev) => new Set([...prev, audio.id]));

    try {
      // Validate audio blob
      if (!audio.blob) {
        throw new Error('Audio blob is missing');
      }
      if (!(audio.blob instanceof Blob)) {
        throw new Error('Invalid audio blob type');
      }
      if (audio.blob.size === 0) {
        throw new Error('Audio blob is empty');
      }

      // Convert blob to File object
      const audioFile = new File([audio.blob], `speech-${audio.id}.mp3`, {
        type: 'audio/mpeg',
      });
      console.log('Audio file created:', {
        name: audioFile.name,
        type: audioFile.type,
        size: audioFile.size,
      });

      // Upload audio to Appwrite Storage
      const file = await storage.createFile(
        STORAGE_BUCKET_ID,
        'unique()',
        audioFile
      );
      console.log('Storage file created:', file);

      // Generate view URL
      const audioUrl = `https://fra.cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files/${file.$id}/view?project=67fd8405001a20b5ad34`;

      // Save to history collection
      const document = await databases.createDocument(
        DATABASE_ID,
        HISTORY_COLLECTION_ID,
        'unique()',
        {
          created_at: audio.timestamp,
          audio_url: audioUrl,
          userId: user.$id,
        }
      );
      console.log('History document created:', document);

      setSavedAudioIds((prev) => new Set([...prev, audio.id]));
      toast.success('Audio saved successfully!');
    } catch (error) {
      console.error('Save audio error:', {
        message: error.message,
        code: error.code,
        type: error.type,
        stack: error.stack,
      });
      if (error.message.includes('blob') || error.message.includes('size')) {
        toast.error('Failed to save audio: Invalid or missing audio file.');
      } else if (error.code === 404) {
        toast.error('Failed to save audio history: History collection not found.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800 tracking-tight">
          Text to Speech Studio
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
              {/* Text Input Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Enter Text</h2>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
                  placeholder="Enter text to convert to speech..."
                />
                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={() => setText('')}
                    disabled={!text}
                    className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
                  >
                    Clear
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      text.length >= MAX_CHARS ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    {text.length}/{MAX_CHARS}
                  </span>
                </div>
              </div>

              {/* Model Selection */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">Select Voice Model</h2>
                {model ? (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 h-14">
                    <div className="flex items-center space-x-3">
                      <img
                        src={model.coverImage || model.image_url || '/placeholder.png'}
                        alt={model.title}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <span className="font-medium text-gray-800">{model.title}</span>
                    </div>
                    <button
                      onClick={() => setModel(null)}
                      className="text-red-600 text-2xl hover:text-red-700 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsModelDialogOpen(true)}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 h-14"
                  >
                    <span className="text-gray-600">Select a voice model</span>
                    <span className="text-indigo-600">→</span>
                  </button>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleConvert}
                disabled={loading || !text || !model}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                {loading && (
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
                <span>{loading ? 'Generating Speech...' : 'Generate Speech'}</span>
              </button>
            </div>
          </div>

          {/* Right Section - Audio History */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Audio History</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {audioList.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No audio generated yet.</p>
              ) : (
                audioList.map((audio) => (
                  <div
                    key={audio.id}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <p className="text-sm text-gray-500 mb-3">{audio.timestamp}</p>
                    <audio controls className="w-full mb-4">
                      <source src={audio.url} type="audio/mpeg" />
                    </audio>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => handleSave(audio)}
                        disabled={savedAudioIds.has(audio.id) || savingAudioIds.has(audio.id) || !audio.blob}
                        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {savingAudioIds.has(audio.id) ? 'Saving' : savedAudioIds.has(audio.id) ? 'Saved' : 'Save'}
                      </button>
                      <a
                        href={audio.url}
                        download={`speech-${audio.id}.mp3`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors duration-200"
                      >
                        <FiDownload /> Download
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Model Selection Modal */}
        {isModelDialogOpen && (
          <div className="fixed inset-x-0 top-0 bottom-0 flex items-center justify-center p-4 my-8 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] min-h-[400px] shadow-2xl flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Select a Voice Model</h3>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    onClick={() => setTabValue(0)}
                    className={`px-4 py-2 font-semibold tracking-wide ${
                      tabValue === 0 ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'
                    }`}
                  >
                    My Models
                  </button>
                  <button
                    onClick={() => setTabValue(1)}
                    className={`px-4 py-2 font-semibold tracking-wide ${
                      tabValue === 1 ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'
                    }`}
                  >
                    Browse Models
                  </button>
                </div>

                {tabValue === 0 && (
                  <MyModelsTabContent
                    onSelectModel={(model) => {
                      setModel(model);
                      setIsModelDialogOpen(false);
                    }}
                  />
                )}

                {tabValue === 1 && (
                  <BrowseModelsTabContent
                    onSelectModel={(model) => {
                      setModel(model);
                      setIsModelDialogOpen(false);
                    }}
                  />
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setIsModelDialogOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}