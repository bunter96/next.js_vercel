import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, modelId } = req.body;

  // Input validation
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required and must be a non-empty string' });
  }
  if (!modelId || typeof modelId !== 'string' || modelId.trim().length === 0) {
    return res.status(400).json({ error: 'Model ID is required and must be a non-empty string' });
  }
  if (text.length > 3000) {
    return res.status(400).json({ error: 'Text exceeds 3000 character limit' });
  }

  try {
    const response = await axios.post(
      'https://api.fish.audio/v1/tts',
      {
        text: text.trim(),
        reference_id: modelId.trim(),
        format: 'mp3', // Consistent with frontend audio/mpeg
        latency: 'normal', // Default for stability
        normalize: true, // Default for number/date handling
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FISH_AUDIO_API_KEY}`,
          'Content-Type': 'application/json',
		  'model': 'speech-1.6',
        },
        responseType: 'arraybuffer', // For audio binary
      }
    );

    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(Buffer.from(response.data));
  } catch (error) {
    console.error('Fish Audio TTS Error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || 'Failed to generate speech';
    res.status(status).json({ error: message });
  }
}