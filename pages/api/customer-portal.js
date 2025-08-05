import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  if (!process.env.CREEM_API_KEY) {
    console.error('CREEM_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error: Missing API key' });
  }

  try {
    console.log('Requesting portal for customerId:', customerId);
    console.log('Using CREEM_API_KEY:', process.env.CREEM_API_KEY.substring(0, 4) + '...');

    const response = await fetch(`${process.env.CREEM_API_BASE_URL}/v1/customers/billing`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CREEM_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ customer_id: customerId }),
    });

    const data = await response.json();
    console.log('Creem API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Creem API error response:', data);
      throw new Error(data.error?.message || `Creem API failed with status ${response.status}`);
    }

    const portalUrl = data.customer_portal_link;
    if (!portalUrl) {
      console.error('No customer_portal_link in response:', data);
      throw new Error('No portal URL returned from Creem API');
    }

    return res.status(200).json({ portalUrl });
  } catch (error) {
    console.error('Error generating customer portal URL:', error.message, error.stack);
    return res.status(500).json({ error: `Failed to generate customer portal URL: ${error.message}` });
  }
}