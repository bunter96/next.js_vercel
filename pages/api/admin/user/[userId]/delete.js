// pages/api/admin/user/[userId]/delete.js
import { Client, Databases, Users } from 'node-appwrite';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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
    const users = new Users(client);

    const databaseId = '67fecfed002f909fc072';
    const collectionId = '67fecffb00075d13ade6';

    // Delete user from Auth and Database
    await users.delete(userId);
    await serverDatabases.deleteDocument(databaseId, collectionId, userId);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
}