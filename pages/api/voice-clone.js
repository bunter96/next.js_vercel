import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import os from 'os';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Validation constants
const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_AUDIO_TYPES = new Set(['audio/mpeg', 'audio/wav', 'audio/x-wav']);
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const uploadDir = path.join(os.tmpdir(), 'fish-audio-uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    multiples: false,
    maxFileSize: MAX_AUDIO_SIZE,
    filename: (name, ext) => `${name}-${Date.now()}${ext}`,
  });

  let files;
  try {
    const [fields, parsedFiles] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        console.log('Parsed files:', files); // Debug log
        resolve([fields, files]);
      });
    });
    files = parsedFiles;

    // Validate audio file
    const audioFile = files.voices;
    console.log('audioFile:', audioFile); // Debug log
    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioFiles = Array.isArray(audioFile) ? audioFile : [audioFile];
    console.log('audioFiles:', audioFiles); // Debug log
    const validAudioFile = audioFiles.find(f => {
      if (!f || !f.mimetype || !f.size || !f.filepath) {
        console.log('Invalid file object:', f); // Debug log
        return false;
      }
      return ALLOWED_AUDIO_TYPES.has(f.mimetype) && f.size <= MAX_AUDIO_SIZE;
    });
    console.log('validAudioFile:', validAudioFile); // Debug log

    if (!validAudioFile) {
      return res.status(400).json({ error: 'Invalid audio file: must be MP3 or WAV and under 100MB' });
    }

    if (!validAudioFile.filepath) {
      console.error('No filepath in validAudioFile:', validAudioFile);
      return res.status(400).json({ error: 'Invalid audio file: missing filepath' });
    }

    // Validate image file
    const imageFile = files.cover_image?.[0] || files.cover_image;
    if (imageFile) {
      if (!ALLOWED_IMAGE_TYPES.has(imageFile.mimetype)) {
        return res.status(400).json({ error: 'Invalid image format. Use JPEG or PNG' });
      }
      if (imageFile.size > MAX_IMAGE_SIZE) {
        return res.status(400).json({ error: 'Image file too large (max 10MB)' });
      }
    }

    // Prepare Fish Audio payload
    const formData = new FormData();

    const getFieldValue = (field) => {
      const value = fields[field];
      return Array.isArray(value) ? value[0] : value;
    };

    const audioData = await fs.readFile(validAudioFile.filepath);
    formData.append('voices', audioData, {
      filename: path.basename(validAudioFile.originalFilename || 'audio.mp3'),
      contentType: validAudioFile.mimetype,
      knownLength: audioData.byteLength,
    });

    if (imageFile) {
      const imageData = await fs.readFile(imageFile.filepath);
      formData.append('cover_image', imageData, {
        filename: path.basename(imageFile.originalFilename || 'cover.jpg'),
        contentType: imageFile.mimetype,
        knownLength: imageData.byteLength,
      });
    }

    formData.append('type', 'tts');
    formData.append('title', getFieldValue('title') || 'Untitled Model');
    formData.append('train_mode', 'fast');
    formData.append('visibility', 'private');
    formData.append('enhance_audio_quality', 'true');

    const response = await axios.post('https://api.fish.audio/model', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.FISH_AUDIO_API_KEY}`,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    await Promise.all([
      fs.unlink(validAudioFile.filepath),
      ...(imageFile ? [fs.unlink(imageFile.filepath)] : []),
    ]);

    return res.status(200).json({
      modelId: response.data._id,
      title: response.data.title,
      coverImage: response.data.cover_image
        ? `https://public-platform.r2.fish.audio/${response.data.cover_image}`
        : null,
      state: response.data.state,
      createdAt: response.data.created_at,
    });

  } catch (error) {
    console.error('API Error:', error);

    if (files) {
      await Promise.all(
        Object.values(files)
          .flat()
          .map(file => file?.filepath ? fs.unlink(file.filepath).catch(() => {}) : Promise.resolve())
      );
    }

    const errorMessage = error.code === 'ERR_INVALID_ARG_TYPE'
      ? 'Invalid audio file: missing or invalid file path'
      : error.response?.data?.error || error.message || 'Voice cloning failed';

    return res.status(error.response?.status || 500).json({
      error: errorMessage,
      details: error.code || 'Unknown error',
    });
  }
}