import { Client, Account } from 'appwrite';
import { account } from '../../../appwriteConfig';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

  const jwt = req.headers['x-appwrite-jwt'];
  if (!jwt) {
    return res.status(401).json({ message: 'JWT missing' });
  }

  client.setJWT(jwt);
  const accountService = new Account(client);

  try {
    const user = await accountService.get();
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const subscriptionId = user.profile?.subscription_id;
    console.log('Subscription ID from Appwrite:', subscriptionId);

    if (!subscriptionId) {
      console.log('No subscription ID found for user:', user.email);
      return res.status(200).json({ expiryDate: null });
    }

    // Fetch specific subscription from Creem.io
    const response = await fetch(`https://test-api.creem.io/v1/subscriptions?subscription_id=${subscriptionId}`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.CREEM_API_KEY,
        'accept': 'application/json',
      },
    });

    const subscription = await response.json();
    console.log('Creem.io subscription:', JSON.stringify(subscription, null, 2));

    if (!response.ok) {
      throw new Error(subscription.error || 'Failed to fetch subscription');
    }

    if (subscription.status !== 'active') {
      console.log('Subscription is not active:', subscription.status);
      return res.status(200).json({ expiryDate: null });
    }

    const expiryDate = subscription.current_period_end_date;
    console.log('Returning expiryDate:', expiryDate);
    return res.status(200).json({ expiryDate });
  } catch (error) {
    console.error('Get subscription error:', error.message, error.stack);
    return res.status(500).json({ message: 'Failed to fetch subscription', error: error.message });
  }
}