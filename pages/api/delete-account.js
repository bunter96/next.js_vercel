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
    console.log('Starting user_profiles document deletion for user:', userId);
    const profileResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    for (const doc of profileResponse.documents) {
      console.log('Attempting to delete user_profiles document:', doc.$id);
      await databases.deleteDocument(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID, doc.$id);
      console.log('Deleted user_profiles document:', doc.$id);
    }
    console.log('All user_profiles documents deleted successfully.');

    // Delete documents from History
    console.log('Starting History document deletion for user:', userId);
    const historyResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_HISTORY_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    for (const doc of historyResponse.documents) {
      console.log('Attempting to delete History document:', doc.$id);
      await databases.deleteDocument(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, process.env.NEXT_PUBLIC_APPWRITE_HISTORY_COLLECTION_ID, doc.$id);
      console.log('Deleted History document:', doc.$id);
    }
    console.log('All History documents deleted successfully.');

    // Delete documents from user_models
    console.log('Starting user_models document deletion for user:', userId);
    const modelsResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USER_MODELS_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    for (const doc of modelsResponse.documents) {
      console.log('Attempting to delete user_models document:', doc.$id);
      await databases.deleteDocument(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, process.env.NEXT_PUBLIC_APPWRITE_USER_MODELS_COLLECTION_ID, doc.$id);
      console.log('Deleted user_models document:', doc.$id);
    }
    console.log('All user_models documents deleted successfully.');

    // Delete the user account (this will automatically remove all sessions)
    console.log('Attempting to delete user account:', userId);
    await users.delete(userId);
    console.log('User account deleted successfully.');

    return res.status(200).json({ message: 'Account and all data deleted successfully.' });
  } catch (err) {
    console.error('Failed to delete account - Detailed error:', {
      message: err.message,
      code: err.code,
      type: err.type,
      stack: err.stack,
      operation: err.response?.headers?.get('x-appwrite-operation') || 'unknown',
    });
    return res.status(500).json({
      message: 'Failed to delete account.',
      error: err.message,
    });
  }
}