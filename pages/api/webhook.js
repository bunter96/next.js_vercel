import { Client, Databases, Query } from 'appwrite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify webhook origin (add this security check)
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  if (webhookSecret && req.headers['x-creem-signature'] !== webhookSecret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Initialize Appwrite with server credentials
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(process.env.APPWRITE_SERVER_API_KEY); // Critical addition

  const databases = new Databases(client);

  try {
    const event = req.body;
    const eventType = event.eventType || event.type;
    console.log('Webhook received:', JSON.stringify(event, null, 2));

    if (eventType === 'subscription.paid') {
      const { customer, product, metadata } = event.object;
      console.log(`Processing ${eventType} for:`, customer.email);

      // Database configuration
      const databaseId = '67fecfed002f909fc072';
      const collectionId = '67fecffb00075d13ade6';

      // Query user profile
      const response = await databases.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('user_email', customer.email)]
      );

      if (response.documents.length === 0) {
        console.error('No profile found for:', customer.email);
        return res.status(404).json({ message: 'User not found' });
      }

      const profile = response.documents[0];
      console.log('Updating profile for:', profile.user_email);

      // Plan configuration
      const planConfig = {
        'prod_1B1DSJwW6nBTYgQYFsxP7': { chars: 20000 }, // Pro Yearly
        'prod_1308g86Vz0IIqbZgpPa9o4': { chars: 5000 },  // Pro Monthly
        'prod_3hWM6T8Iu8GZsUFsyQgrnB': { chars: 5000 },  // Starter Yearly
        'prod_23qN6cgjlpiCtD3OfY2JqH': { chars: 100000 }, // Turbo Yearly
        'prod_xNBLeAW61WSH5dmRcBxPP': { chars: 100000 }, // Turbo Monthly
      };

      // Calculate expiration
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 
        (metadata.billing_cycle === 'yearly' ? 12 : 1));

      // Update document
      const updateData = {
        plan_type: metadata.plan_name,
        char_allowed: planConfig[product.id]?.chars || 1000,
        char_remaining: planConfig[product.id]?.chars || 1000,
        current_plan_start_date: new Date().toISOString(),
        current_plan_expiry_date: expiryDate.toISOString(),
        active_product_id: product.id,
        billing_cycle: metadata.billing_cycle,
        payment_status: 'active',
      };

      const updateResponse = await databases.updateDocument(
        databaseId,
        collectionId,
        profile.$id,
        updateData
      );

      console.log('Update successful:', updateResponse);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}