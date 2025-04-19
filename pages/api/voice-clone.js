// pages/api/voice-clone.js

const { IncomingForm } = require('formidable');
const fs = require('fs').promises; // Use promises for async file operations
const path = require('path');
const axios = require('axios');
const { Blob } = require('buffer'); // Import Blob for Node.js

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'Uploads');

  // Ensure upload directory exists
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error('[Upload Directory Creation Error]:', err);
    return res.status(500).json({ error: 'Failed to create upload directory' });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    multiples: false,
  });

  let files; // Define files in a broader scope
  try {
    const { fields, files: parsedFiles } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    files = parsedFiles; // Assign to outer scope

    const filePath = files.audio?.[0]?.filepath || files.audio?.filepath;
    const title = fields.title || 'Default Voice Clone';

    if (!filePath) {
      return res.status(400).json({ error: 'Audio file is missing' });
    }

    // Verify file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      console.error('[File Access Error]:', err);
      return res.status(400).json({ error: 'Uploaded audio file not found' });
    }

    // Read file as Buffer and convert to Blob
    const fileBuffer = await fs.readFile(filePath);
    const fileBlob = new Blob([fileBuffer], { type: 'audio/mpeg' });

    const formData = new FormData();
    formData.append('voices', fileBlob, {
      filename: path.basename(filePath),
      contentType: 'audio/mpeg',
    });
    formData.append('type', 'tts');
    formData.append('title', title);
    formData.append('train_mode', 'fast');
    formData.append('visibility', 'private'); // Optional, per example
    formData.append('enhance_audio_quality', 'true'); // Optional, per example
    // Omit 'texts' since no text input is provided
    // Example if texts are needed:
    // formData.append('texts', 'User-provided text');

    // Log FormData for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`FormData: ${key}=${value}`);
    }

    try {
      const response = await axios.post(
        'https://api.fish.audio/model',
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.FISH_AUDIO_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Fish.audio API Response:', response.data);
      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Fish.audio API Error:', error?.response?.data || error.message);
      return res.status(500).json({
        error: 'Voice cloning failed',
        details: error?.response?.data || error.message,
      });
    }
  } catch (error) {
    console.error('[API Handler Error]:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  } finally {
    // Clean up uploaded file if it exists
    const filePath = files?.audio?.[0]?.filepath || files?.audio?.filepath;
    if (filePath) {
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      } catch (err) {
        console.warn('[File Cleanup Warning]:', err.message);
      }
    }
  }
}