// pages/api/admin/user/[userId]/update.js
import { Client, Databases } from 'node-appwrite';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  const { name, char_allowed, char_remaining, is_admin, picture } = req.body;

  try {
    // Initialize server-side client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const serverDatabases = new Databases(client);

    const databaseId = '67fecfed002f909fc072';
    const collectionId = '67fecffb00075d13ade6';

    // Update user document
    const updatedUser = await serverDatabases.updateDocument(databaseId, collectionId, userId, {
      name: name || null,
      char_allowed: Number(char_allowed) || 0,
      char_remaining: Number(char_remaining) || 0,
      is_admin: Boolean(is_admin),
      picture: picture || null,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
}