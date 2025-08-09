import { Client, Account } from 'appwrite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

  const jwt = req.headers['x-appwrite-jwt'];
  if (!jwt) {
    return res.status(401).json({ message: 'JWT missing' });
  }

  client.setJWT(jwt);
  const account = new Account(client);

  try {
    const user = await account.get();
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { planId, billingCycle, fullPlanName } = req.body;

    const response = await fetch(`${process.env.CREEM_API_BASE_URL}/v1/checkouts`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CREEM_API_KEY,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        product_id: planId,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        customer: { email: user.email },
        request_id: `req_${Date.now()}`,
        metadata: {
          user_id: user.$id,
          plan_name: fullPlanName, // Use fullPlanName instead of deriving it
          billing_cycle: billingCycle,
        },
      }),
    });

    const session = await response.json();

    if (!response.ok) {
      throw new Error(session.error || `Creem.io API failed with status ${response.status}`);
    }

    return res.status(200).json({ url: session.checkout_url });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}