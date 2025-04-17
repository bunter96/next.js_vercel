// pages/tts.js

import Head from 'next/head';
import { useState } from 'react';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('en_us_male');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  const handleConvert = async () => {
    setIsLoading(true);
    setAudioUrl('');

    // Example of using the Fish.Audio API here (mock for now)
    try {
      // Simulated delay
      setTimeout(() => {
        setAudioUrl('/sample-audio.mp3'); // Replace with actual audio URL from API
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Conversion failed', error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Text To Speech - Fish Audio</title>
      </Head>

      <main className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Text To Speech</h1>

        <div className="space-y-6">
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text here..."
            className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full sm:w-1/2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en_us_male">English (US) - Male</option>
              <option value="en_us_female">English (US) - Female</option>
              <option value="en_uk_male">English (UK) - Male</option>
              <option value="en_uk_female">English (UK) - Female</option>
            </select>

            <button
              onClick={handleConvert}
              disabled={isLoading || !text}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Converting...' : 'Convert to Speech'}
            </button>
          </div>

          {audioUrl && (
            <div className="mt-6">
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
