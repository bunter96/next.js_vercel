import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, Query } from '@/lib/appwriteConfig';
import { FiDownload } from 'react-icons/fi';

const DATABASE_ID = '67fecfed002f909fc072';
const HISTORY_COLLECTION_ID = '680e9bf90014579d3f5b'; // Replace with actual ID

export default function History() {
  const { user } = useAuth();
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchAudios = async () => {
      if (!user) {
        setError('Please sign in to view your audio history.');
        setLoading(false);
        return;
      }

      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          HISTORY_COLLECTION_ID,
          [
            Query.equal('userId', user.$id),
            Query.orderDesc('$createdAt'),
          ]
        );
        setAudios(response.documents);
        setLoading(false);
      } catch (err) {
        console.error('Fetch audios error:', {
          message: err.message,
          code: err.code,
          type: err.type,
        });
        setError('Failed to fetch audio history.');
        setLoading(false);
      }
    };

    fetchAudios();
  }, [user, refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Audio Generation History
          </h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
          >
            Refresh
          </button>
        </div>

        {audios.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No audio history found.</p>
        ) : (
          <div className="space-y-4">
            {audios.map((audio) => (
              <div
                key={audio.$id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <p className="text-sm font-bold text-gray-800 mb-3">
                  {audio.created_at}
                </p>
                <audio controls className="w-full mb-4">
                  <source src={audio.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleDownload(audio.audio_url, `speech-${audio.$id}.mp3`)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors duration-200"
                  >
                    <FiDownload /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
