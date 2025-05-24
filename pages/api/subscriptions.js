// /pages/api/subscriptions.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscription_id } = req.query;

  if (!subscription_id) {
    return res.status(400).json({ error: 'Subscription ID is required' });
  }

  try {
    const response = await fetch(
      `https://test-api.creem.io/v1/subscriptions?subscription_id= ${subscription_id}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': process.env.CREEM_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Creem API error response:', errorData);
      throw new Error(errorData.message?.[0] || `Failed to fetch subscription`);
    }

    const data = await response.json();
    console.log('Creem API response:', data);
    res.status(200).json(data); // e.g., { id, product, status, next_transaction_date }
  } catch (error) {
    console.error('Error fetching subscription:', error.message);
    res.status(500).json({ error: `Failed to fetch subscription: ${error.message}` });
  }
}