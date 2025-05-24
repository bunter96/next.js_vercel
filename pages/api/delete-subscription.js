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
      '67fecfed002f909fc072', // Database ID
      '682c300c001640914033', // Subscriptions Collection ID
      [Query.equal('user_id', userId)]
    );

    if (subscriptionResponse.documents.length > 0) {
      const subscriptionDoc = subscriptionResponse.documents[0];
      console.log('Found subscription document to delete:', subscriptionDoc.$id);

      await serverDatabases.deleteDocument(
        '67fecfed002f909fc072',
        '682c300c001640914033',
        subscriptionDoc.$id
      );
      console.log(`Deleted subscription document ${subscriptionDoc.$id} for user ${userId}`);
    } else {
      console.log('No subscription document found for user:', userId);
    }

    // Find and update the user profile to remove specified attributes
    const profileResponse = await serverDatabases.listDocuments(
      '67fecfed002f909fc072', // Database ID
      '67fecffb00075d13ade6', // User Profiles Collection ID
      [Query.equal('$id', userId)]
    );

    if (profileResponse.documents.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profileDoc = profileResponse.documents[0];
    console.log('Found user profile to update:', profileDoc.$id);

    await serverDatabases.updateDocument(
      '67fecfed002f909fc072',
      '67fecffb00075d13ade6',
      profileDoc.$id,
      {
        creem_customer_id: null,
        creem_subscription_id: null,
        active_product_id: null,
        billing_cycle: null,
        plan_type: null,
      }
    );

    console.log(`Updated user profile ${profileDoc.$id} by removing creem_customer_id, creem_subscription_id, active_product_id, billing_cycle, and plan_type`);

    return res.status(200).json({ message: 'Subscription document deleted and user profile updated successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error.message);
    return res.status(500).json({ error: 'Failed to delete subscription document or update user profile' });
  }
}