// pages/admin/settings.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { MdKey, MdTextFields, MdVolumeUp } from 'react-icons/md';
import { databases } from '@/lib/appwriteConfig';

const DATABASE_ID = '67fecfed002f909fc072';
const SETTINGS_COLLECTION_ID = '68265923002dd806d5b8'; // TODO: Replace with actual ID

export default function AdminSettings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({
    ttsApiKey: '',
    charAllowed: 10000,
    maxConversionsPerDay: 10,
    maxCharsPerConversion: 1000,
    voices: {
      english_us: true,
      spanish: true,
      french: false,
    },
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push('/'); // Redirect non-admins to homepage
    }
    // Fetch settings on mount
    const fetchSettings = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          SETTINGS_COLLECTION_ID,
          []
        );
        const settingsDoc = response.documents[0];
        if (settingsDoc) {
          setSettings(settingsDoc);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, [user, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: name === 'maxCharsPerConversion' ? parseInt(value) : value }));
  };

  const handleVoiceToggle = (voice) => {
    setSettings((prev) => ({
      ...prev,
      voices: { ...prev.voices, [voice]: !prev.voices[voice] },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      await databases.updateDocument(
        DATABASE_ID,
        SETTINGS_COLLECTION_ID,
        'global_settings',
        settings
      );
      setMessage('Settings updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Failed to update settings.');
      setIsError(true);
    }
  };

  if (loading) {
    return <div className="text-center py-16">Loading...</div>;
  }

  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Settings</h1>
      <div className="bg-white p-6 rounded-xl shadow">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <MdKey className="w-6 h-6 mr-2 text-blue-600" />
              API Settings
            </h3>
            <div className="mb-4">
              <label htmlFor="ttsApiKey" className="block text-gray-600 mb-2">
                Text-to-Speech API Key
              </label>
              <input
                type="text"
                id="ttsApiKey"
                name="ttsApiKey"
                value={settings.ttsApiKey}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Enter TTS API key"
              />
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <MdTextFields className="w-6 h-6 mr-2 text-blue-600" />
              Conversion Limits
            </h3>
            <div className="mb-4">
              <label htmlFor="charAllowed" className="block text-gray-600 mb-2">
                Default Characters Allowed (per user)
              </label>
              <input
                type="number"
                id="charAllowed"
                name="charAllowed"
                value={settings.charAllowed}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                min="1000"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="maxConversionsPerDay" className="block text-gray-600 mb-2">
                Max Conversions Per Day (per user)
              </label>
              <input
                type="number"
                id="maxConversionsPerDay"
                name="maxConversionsPerDay"
                value={settings.maxConversionsPerDay}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                min="1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="maxCharsPerConversion" className="block text-gray-600 mb-2">
                Max Characters Per Conversion
              </label>
              <input
                type="number"
                id="maxCharsPerConversion"
                name="maxCharsPerConversion"
                value={settings.maxCharsPerConversion}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                min="500"
              />
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <MdVolumeUp className="w-6 h-6 mr-2 text-blue-600" />
              Voice Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(settings.voices).map((voice) => (
                <label key={voice} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.voices[voice]}
                    onChange={() => handleVoiceToggle(voice)}
                    className="mr-2"
                  />
                  <span className="text-gray-600">
                    {voice
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
        {message && (
          <p className={`mt-4 ${isError ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </motion.div>
  );
}