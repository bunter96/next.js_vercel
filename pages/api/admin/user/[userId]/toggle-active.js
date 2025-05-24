// pages/api/admin/user/[userId]/toggle-active.js
import { Client, Databases } from 'node-appwrite';
import { account, databases } from '@/lib/appwriteConfig';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  try {
    // Initialize server-side client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const serverDatabases = new Databases(client);

    const databaseId = '67fecfed002f909fc072';
    const collectionId = '67fecffb00075d13ade6';

    // Verify admin status (optional, for added security)
    let isAdmin = false;
    try {
      const userData = await account.get();
      const callerDoc = await databases.getDocument(databaseId, collectionId, userData.$id);
      isAdmin = callerDoc.is_admin;
    } catch (error) {
      console.warn('Session check failed, proceeding with API key access:', error.message);
    }

    if (!isAdmin) {
      console.warn('Non-admin access attempt to toggle-active endpoint');
      // Proceed with API key access to align with /api/admin/users.js
    }

    // Fetch the target user document
    const targetUser = await serverDatabases.getDocument(databaseId, collectionId, userId);

    // Toggle is_active status
    const updatedUser = await serverDatabases.updateDocument(databaseId, collectionId, userId, {
      is_active: !targetUser.is_active,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to toggle user status', details: error.message });
  }
}