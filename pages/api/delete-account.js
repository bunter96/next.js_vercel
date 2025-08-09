import { createServerClient, Query } from '@/lib/appwriteConfig';
import { Databases, Users } from 'node-appwrite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const serverClient = createServerClient();
    const databases = new Databases(serverClient);
    const users = new Users(serverClient);

    // Delete documents from user_profiles
    const profileResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    for (const doc of profileResponse.documents) {
      await databases.deleteDocument(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID, doc.$id);
    }

    // Delete documents from History
    const historyResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_HISTORY_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    for (const doc of historyResponse.documents) {
      await databases.deleteDocument(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, process.env.NEXT_PUBLIC_APPWRITE_HISTORY_COLLECTION_ID, doc.$id);
    }

    // Delete documents from user_models
    const modelsResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USER_MODELS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    for (const doc of modelsResponse.documents) {
      await databases.deleteDocument(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, process.env.NEXT_PUBLIC_APPWRITE_USER_MODELS_COLLECTION_ID, doc.$id);
    }

    // Delete the user account (this will automatically remove all sessions)
    await users.delete(userId);

    return res.status(200).json({ message: 'Account and all data deleted successfully.' });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to delete account.',
      error: err.message,
    });
  }
}