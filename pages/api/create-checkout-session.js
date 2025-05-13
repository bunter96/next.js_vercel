import { Client, Account } from 'appwrite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Validate environment variable first
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    console.error('Server configuration error: NEXT_PUBLIC_BASE_URL is undefined');
    return res.status(500).json({ 
      message: 'Server configuration error. Please contact support.' 
    });
  }

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

  const jwt = req.headers['x-appwrite-jwt'];
  if (!jwt) {
    return res.status(401).json({ message: 'Authentication token missing' });
  }

  client.setJWT(jwt);
  const account = new Account(client);

  try {
    const user = await account.get();
    if (!user) {
      return res.status(401).json({ message: 'User authentication failed' });
    }

    const { planId, billingCycle, fullPlanName } = req.body;
    
    // Validate required parameters
    if (!planId || !billingCycle || !fullPlanName) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Construct success URL using validated environment variable
    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`;

    const creemResponse = await fetch('https://test-api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CREEM_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        product_id: planId,
        success_url: successUrl,
        customer: { 
          email: user.email,
          name: user.name || undefined,
        },
        request_id: `req_${Date.now()}_${user.$id.slice(-6)}`,
        metadata: {
          user_id: user.$id,
          plan_name: fullPlanName,
          billing_cycle: billingCycle,
          appwrite_project: process.env.NEXT_PUBLIC_APPWRITE_PROJECT,
        },
      }),
    });

    if (!creemResponse.ok) {
      const errorData = await creemResponse.json();
      console.error('Creem API error:', {
        status: creemResponse.status,
        error: errorData,
        planId,
        user: user.$id
      });
      throw new Error(errorData.error?.message || 'Payment gateway error');
    }

    const sessionData = await creemResponse.json();
    
    // Validate response structure
    if (!sessionData?.checkout_url) {
      console.error('Invalid Creem response:', sessionData);
      throw new Error('Invalid response from payment gateway');
    }

    return res.status(200).json({ 
      url: sessionData.checkout_url 
    });

  } catch (error) {
    console.error('Checkout processing error:', {
      message: error.message,
      stack: error.stack,
      userId: user?.$id || 'unknown'
    });
    
    return res.status(500).json({ 
      message: error.message || 'Checkout process failed. Please try again.' 
    });
  }
}