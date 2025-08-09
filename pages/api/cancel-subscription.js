// pages/api/cancel-subscription.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscriptionId } = req.body;
  if (!subscriptionId) {
    return res.status(400).json({ error: 'subscriptionId is required' });
  }

  try {
    const apiKey = process.env.CREEM_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'CREEM_API_KEY is not configured' });
    }

    const response = await fetch(
      `${process.env.CREEM_API_BASE_URL}/v1/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey, // Updated to match Creem.io requirement
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancel_at_period_end: true }),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: responseData.error || 'Failed to cancel subscription' });
    }

    return res.status(200).json({ message: 'Subscription canceled successfully', subscription: responseData });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}