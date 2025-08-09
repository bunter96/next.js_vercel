import { serverDatabases } from '../../lib/appwriteConfig';
import { Query } from 'appwrite';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const response = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_SUBSCRIPTIONS_COLLECTION_ID,
      [Query.equal('user_id', user_id)]
    );

    if (response.documents.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    const subscription = response.documents[0];

    return res.status(200).json({
      created_at: subscription.created_at || null,
      current_period_start_date: subscription.current_period_start_date || null,
      current_period_end_date: subscription.current_period_end_date || null,
      billing_cycle: subscription.billing_cycle || 'Not available',
      plan_name: subscription.plan_name || 'Not available',
      status: subscription.status || 'Not available',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}