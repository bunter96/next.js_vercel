// pages/api/delete-subscription.js
import { serverDatabases } from '../../lib/appwriteConfig';
import { Query } from 'appwrite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // Find and delete the subscription document
    const subscriptionResponse = await serverDatabases.listDocuments(
       process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
       process.env.NEXT_PUBLIC_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID,
      [Query.equal('user_id', userId)]
    );

    if (subscriptionResponse.documents.length > 0) {
      const subscriptionDoc = subscriptionResponse.documents[0];
      await serverDatabases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID,
        subscriptionDoc.$id
      );
    }

    // Find and update the user profile to remove specified attributes
    const profileResponse = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
      [Query.equal('$id', userId)]
    );

    if (profileResponse.documents.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profileDoc = profileResponse.documents[0];

    await serverDatabases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
      profileDoc.$id,
      {
        creem_customer_id: null,
        creem_subscription_id: null,
        active_product_id: null,
        billing_cycle: null,
        plan_type: null,
      }
    );

    return res.status(200).json({ message: 'Subscription document deleted and user profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete subscription document or update user profile' });
  }
}