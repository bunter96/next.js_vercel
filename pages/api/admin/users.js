// /pages/api/admin/users.js
import { Client, Databases } from 'node-appwrite';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const response = await databases.listDocuments(
      '67fecfed002f909fc072',
      '67fecffb00075d13ade6',
      []
    );

    res.status(200).json({ users: response.documents });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
}
