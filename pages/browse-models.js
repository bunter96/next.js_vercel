import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, Query } from '@/lib/appwriteConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiPlay, FiPause, FiGlobe, FiVolume2, FiFilter } from 'react-icons/fi';

export default function BrowseModels() {
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const audioRefs = useRef({});
  const { user } = useAuth();

  // Language options
	const languages = [
	  { code: 'all', name: 'All Languages' },
	  { code: 'en', name: 'English' },
	  { code: 'es', name: 'Spanish' },
	  { code: 'fr', name: 'French' },
	  { code: 'de', name: 'German' },
	  { code: 'ja', name: 'Japanese' },
	  { code: 'zh', name: 'Chinese' },
	  { code: 'hi', name: 'Hindi' },
	  { code: 'ar', name: 'Arabic' },
	  { code: 'pt', name: 'Portuguese' },
	  { code: 'ru', name: 'Russian' },
	];

	const languageMap = {
	  english: 'en',
	  spanish: 'es',
	  french: 'fr',
	  german: 'de',
	  japanese: 'ja',
	  chinese: 'zh',
	  hindi: 'hi',
	  arabic: 'ar',
	  portuguese: 'pt',
	  russian: 'ru',
	};

  // Gender options
  const genders = [
    { code: 'all', name: 'All Voices' },
    { code: 'male', name: 'Male' },
    { code: 'female', name: 'Female' },
  ];

  useEffect(() => {
    const getModels = async () => {
      try {
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_BROWSE_MODELS_COLLECTION_ID,
          [Query.orderDesc('$createdAt')]
        );
        
		const modelsWithMetadata = response.documents.map(model => ({
		  ...model,
		  language: languageMap[model.language?.toLowerCase()] || 'en',
		  gender: model.gender?.toLowerCase() || 'unknown',
		}));
        
        setModels(modelsWithMetadata);
        setFilteredModels(modelsWithMetadata);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch public models.');
        toast.error('Failed to fetch public models.');
        setLoading(false);
      }
    };
    getModels();
  }, []);

  useEffect(() => {
    let result = models;
    
    // Filter by language
    if (selectedLanguage !== 'all') {
      result = result.filter(model => model.language === selectedLanguage);
    }
    
    // Filter by gender
    if (selectedGender !== 'all') {
      result = result.filter(model => model.gender === selectedGender);
    }
    
    setFilteredModels(result);
  }, [selectedLanguage, selectedGender, models]);

  const togglePlay = (modelId) => {
    if (currentlyPlaying === modelId) {
      audioRefs.current[modelId].pause();
      setCurrentlyPlaying(null);
      return;
    }

    if (currentlyPlaying) {
      audioRefs.current[currentlyPlaying].pause();
    }

    audioRefs.current[modelId].play();
    setCurrentlyPlaying(modelId);
  };

  const handleAudioEnd = (modelId) => {
    if (currentlyPlaying === modelId) {
      setCurrentlyPlaying(null);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeIn');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const cards = document.querySelectorAll('.model-card');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredModels]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 md:mb-0 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Browse Voice Models
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm px-3 py-2 w-full">
              <FiGlobe className="text-indigo-500" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="appearance-none bg-transparent py-1 pl-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md w-full"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm px-3 py-2 w-full">
              <FiFilter className="text-indigo-500" />
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="appearance-none bg-transparent py-1 pl-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md w-full"
              >
                {genders.map((gender) => (
                  <option key={gender.code} value={gender.code}>
                    {gender.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 h-96 flex flex-col items-center animate-pulse">
                <div className="w-40 h-40 rounded-full bg-gray-200 mb-6"></div>
                <div className="w-3/4 h-6 bg-gray-200 rounded mb-4"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded mb-6"></div>
                <div className="w-full h-10 bg-gray-200 rounded-lg mt-auto"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 text-center">
            {error}
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <FiVolume2 className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No models found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedLanguage === 'all' && selectedGender === 'all'
                ? 'No public models available yet.' 
                : `No ${selectedGender !== 'all' ? genders.find(g => g.code === selectedGender)?.name + ' ' : ''} 
                   models available${selectedLanguage !== 'all' ? ' in ' + languages.find(l => l.code === selectedLanguage)?.name : ''}.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <div
                key={model.$id}
                className="model-card bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 opacity-0 translate-y-4 flex flex-col items-center"
              >
                <div className="relative group mb-6">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-100 shadow-md">
                    <img
                      src={model.image_url || '/placeholder-voice.png'}
                      alt={model.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <button
                    onClick={() => togglePlay(model.$id)}
                    className="absolute bottom-2 right-2 bg-indigo-600 rounded-full p-3 text-white hover:bg-indigo-700 transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    {currentlyPlaying === model.$id ? <FiPause size={20} /> : <FiPlay size={20} />}
                  </button>
                </div>
                
                <div className="text-center w-full mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{model.title}</h3>
                  <div className="flex justify-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {languages.find(l => l.code === model.language)?.name || 'English'}
                    </span>
                    {model.gender && model.gender !== 'unknown' && (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        model.gender === 'female' 
                          ? 'bg-pink-100 text-pink-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {model.gender === 'female' ? 'Female' : 'Male'}
                      </span>
                    )}
                    {model.gender === 'unknown' && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Unknown
                      </span>
                    )}
                  </div>
                </div>
                
                <audio
                  ref={(el) => (audioRefs.current[model.$id] = el)}
                  onEnded={() => handleAudioEnd(model.$id)}
                  src={model.model_audio_url}
                  className="hidden"
                />
                
                <button
                  onClick={() => togglePlay(model.$id)}
                  className={`mt-auto flex items-center justify-center px-4 py-2 rounded-lg transition-colors w-full ${
                    currentlyPlaying === model.$id
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {currentlyPlaying === model.$id ? (
                    <>
                      <FiPause className="mr-2" /> Pause Preview
                    </>
                  ) : (
                    <>
                      <FiPlay className="mr-2" /> Play Preview
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}