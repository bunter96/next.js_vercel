// pages/voice-cloning.js

import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export default function VoiceCloning() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [clones, setClones] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleClone = async () => {
    if (!file || !name) return;

    setUploading(true);

    // Simulate upload logic for now
    setTimeout(() => {
      const newClone = {
        id: Date.now(),
        name,
        description,
        fileName: file.name,
      };
      setClones((prev) => [newClone, ...prev]);
      setName('');
      setDescription('');
      setFile(null);
      setUploading(false);
    }, 1500);
  };

  if (loading || !user) return null;

  return (
    <>
      <Head>
        <title>Voice Cloning - Fish Audio</title>
      </Head>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-8">Voice Cloning</h1>

        <div className="space-y-6 mb-10">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Clone Name"
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional Description"
            className="w-full border p-3 rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block"
          />

          <button
            onClick={handleClone}
            disabled={uploading || !file || !name}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold disabled:opacity-50"
          >
            {uploading ? 'Cloning Voice...' : 'Start Voice Cloning'}
          </button>
        </div>

        {clones.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Your Cloned Voices</h2>
            <div className="space-y-4">
              {clones.map((clone) => (
                <div
                  key={clone.id}
                  className="p-4 border rounded-md shadow-sm bg-white"
                >
                  <h3 className="text-lg font-bold">{clone.name}</h3>
                  {clone.description && (
                    <p className="text-sm text-gray-600">{clone.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">File: {clone.fileName}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
