import { useState, useEffect, useRef, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { FiCheck, FiChevronDown, FiPlay, FiPause, FiGlobe, FiVolume2, FiFilter } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { databases, Query } from '@/lib/appwriteConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUser } from 'react-icons/fi';

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

  const genders = [
    { code: 'all', name: 'All Voices' },
    { code: 'male', name: 'Male' },
    { code: 'female', name: 'Female' },
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
    if (selectedLanguage !== 'all') {
      result = result.filter(model => model.language === selectedLanguage);
    }
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

  const renderListbox = (labelIcon, options, selectedValue, onChange) => (
    <div className="relative w-full min-w-fit">
      <Listbox value={selectedValue} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-48 cursor-pointer truncate rounded-lg bg-white dark:bg-gray-700 py-2 pl-10 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-700 dark:text-gray-200">
            <span className="block truncate">
              {options.find(opt => opt.code === selectedValue)?.name}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
              <FiChevronDown className="h-5 w-5" />
            </span>
            <span className="absolute left-2 top-2.5 text-indigo-500 dark:text-indigo-400">
              {labelIcon}
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
              {options.map((option) => (
                <Listbox.Option
                  key={option.code}
                  value={option.code}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-100 dark:bg-indigo-600 text-indigo-900 dark:text-white' : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.name}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-2 flex items-center text-indigo-600 dark:text-indigo-300">
                          <FiCheck className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 md:mb-0 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            Browse Voice Models
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {renderListbox(<FiGlobe />, languages, selectedLanguage, setSelectedLanguage)}
            {renderListbox(<FiUser />, genders, selectedGender, setSelectedGender)}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-96 flex flex-col items-center animate-pulse">
                <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700 mb-6"></div>
                <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mt-auto"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-300 text-center">
            {error}
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 mb-4">
              <FiVolume2 className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">No models found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                className="model-card bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 opacity-0 translate-y-4 flex flex-col items-center"
              >
                <div className="relative group mb-6">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-100 dark:border-indigo-500 shadow-md">
                    <img
                      src={model.image_url || '/placeholder-voice.png'}
                      alt={model.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <button
                    onClick={() => togglePlay(model.$id)}
                    className="absolute bottom-2 right-2 bg-indigo-600 dark:bg-indigo-500 rounded-full p-3 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    {currentlyPlaying === model.$id ? <FiPause size={20} /> : <FiPlay size={20} />}
                  </button>
                </div>
                <div className="text-center w-full mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{model.title}</h3>
                  <div className="flex justify-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                      {languages.find(l => l.code === model.language)?.name || 'English'}
                    </span>
                    {model.gender && model.gender !== 'unknown' && (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        model.gender === 'female'
                          ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {model.gender === 'female' ? 'Female' : 'Male'}
                      </span>
                    )}
                    {model.gender === 'unknown' && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
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
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-gray-600'
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
