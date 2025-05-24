import { createServerClient, Query } from '@/lib/appwriteConfig';
import { Databases, Users } from 'node-appwrite'; // Use Users for account deletion
import { NextApiRequest, NextApiResponse } from 'next';

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
      '67fecfed002f909fc072',
      '67fecffb00075d13ade6',
      [Query.equal('userId', userId)]
    );
    for (const doc of profileResponse.documents) {
      console.log('Attempting to delete user_profiles document:', doc.$id);
      await databases.deleteDocument('67fecfed002f909fc072', '67fecffb00075d13ade6', doc.$id);
      console.log('Deleted user_profiles document:', doc.$id);
    }
    console.log('All user_profiles documents deleted successfully.');

    // Delete documents from History (replace with actual ID)
    console.log('Starting History document deletion for user:', userId);
    const historyResponse = await databases.listDocuments(
      '67fecfed002f909fc072',
      '680e9bf90014579d3f5b', // Replace with actual History collection ID
      [Query.equal('userId', userId)]
    );
    for (const doc of historyResponse.documents) {
      console.log('Attempting to delete History document:', doc.$id);
      await databases.deleteDocument('67fecfed002f909fc072', '680e9bf90014579d3f5b', doc.$id);
      console.log('Deleted History document:', doc.$id);
    }
    console.log('All History documents deleted successfully.');

    // Delete documents from user_models (replace with actual ID)
    console.log('Starting user_models document deletion for user:', userId);
    const modelsResponse = await databases.listDocuments(
      '67fecfed002f909fc072',
      '680431be00081ea103d1', // Replace with actual user_models collection ID
      [Query.equal('userId', userId)]
    );
    for (const doc of modelsResponse.documents) {
      console.log('Attempting to delete user_models document:', doc.$id);
      await databases.deleteDocument('67fecfed002f909fc072', '680431be00081ea103d1', doc.$id);
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