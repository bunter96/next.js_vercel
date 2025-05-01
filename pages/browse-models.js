import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { databases, Query } from '@/lib/appwriteConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DATABASE_ID = '67fecfed002f909fc072';
const BROWSE_MODELS_COLLECTION_ID = '680d683b000797390037';

export default function BrowseModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

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
        toast.error('Failed to fetch public models.');
        setLoading(false);
      }
    };
    getModels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800 tracking-tight">
          Browse Public Models
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 text-center">
            {error}
          </div>
        ) : models.length === 0 ? (
          <p className="text-gray-500 text-center py-8 text-lg">
            No public models available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <div
                key={model.fish_model_id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <img
                  src={model.image_url || '/placeholder.png'}
                  alt={model.title}
                  className="w-full h-48 object-cover rounded-lg mb-4 border border-gray-200"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{model.title}</h3>
                <p className="text-sm text-gray-500 mb-4">ID: {model.fish_model_id}</p>
                {model.model_audio_url ? (
                  <audio controls className="w-full">
                    <source src={model.model_audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p className="text-sm text-gray-500">No preview audio available.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}