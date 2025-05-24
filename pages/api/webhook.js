// /pages/api/webhook.js
import { serverDatabases } from '../../lib/appwriteConfig';
import { Query } from 'appwrite';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Log all headers and body for debugging
  console.log('Webhook headers:', req.headers);
  console.log('Webhook body:', req.body);

  // Verify webhook signature
  const verifyWebhook = () => {
    const secret = process.env.CREEM_WEBHOOK_SECRET;
    if (!secret) {
      console.error('Webhook secret not configured');
      return false;
    }

    const possibleHeaders = [
      'x-creem-signature',
      'creem-signature',
      'x-webhook-signature',
      'signature',
    ];
    let signature;
    for (const header of possibleHeaders) {
      signature = req.headers[header.toLowerCase()];
      if (signature) {
        console.log(`Found signature in header: ${header}`);
        break;
      }
    }

    if (!signature) {
      console.error('Missing webhook signature');
      return false;
    }

    try {
      const payload = JSON.stringify(req.body);
      const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(computedSignature)
      );
      console.log('Signature verification:', { signature, computedSignature, isValid });
      return isValid;
    } catch (error) {
      console.error('Signature verification error:', error.message);
      return false;
    }
  };

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check webhook authenticity
  if (!verifyWebhook()) {
    console.error('Webhook verification failed');
    return res.status(401).json({ message: 'Unauthorized webhook' });
  }

  const event = req.body;
  const eventType = event.eventType || event.type;
  console.log('Webhook received:', event);
  console.log('Handling event type:', eventType);

  try {
    if (eventType === 'subscription.paid') {
      const { customer, product, metadata } = event.object;

      // Validate payload
      if (!customer?.email || !product?.id || !metadata?.plan_name) {
        console.error('Invalid webhook payload:', { customer, product, metadata });
        return res.status(400).json({ message: 'Invalid webhook payload' });
      }

      console.log('Processing subscription.paid for email:', customer.email);

      // Find user profile using server-side client
      const response = await serverDatabases.listDocuments(
        '67fecfed002f909fc072', // Database ID
        '67fecffb00075d13ade6', // Profile Collection ID
        [Query.equal('user_email', customer.email)]
      );

      console.log('Appwrite query response:', {
        total: response.total,
        documents: response.documents,
      });

      if (response.documents.length > 0) {
        const profile = response.documents[0];
        console.log('Found profile:', profile);

        // Plan details for profile update
        const planDetails = {
          'prod_1B1DSJwW6nBTYgQYFsxP7': { chars: 20000 }, // Pro Yearly
          'prod_1308g86Vz0IIqbZgpPa9o4': { chars: 5000 },  // Starter Monthly (old)
          'prod_3hWM6T8Iu8GZsUFsyQgrnB': { chars: 5000 },  // Starter Yearly
          'prod_3d6z0m8mKmzuV6LvPwc0jf': { chars: 5000 },  // Starter Monthly (new)
        };

        const plan = planDetails[product.id] || { chars: 1000 };
        const startDate = new Date().toISOString();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (metadata.billing_cycle === 'yearly' ? 12 : 1));

		// Update user profile with subscription info
		const updateRes = await serverDatabases.updateDocument(
		  '67fecfed002f909fc072',
		  '67fecffb00075d13ade6',
		  profile.$id,
		  {
			plan_type: metadata.plan_name,
			char_allowed: plan.chars,
			char_remaining: plan.chars,
			current_plan_start_date: startDate,
			current_plan_expiry_date: expiryDate.toISOString(),
			active_product_id: product.id,
			billing_cycle: metadata.billing_cycle,
			creem_customer_id: customer.id,
			creem_subscription_id: event.object.id
		  }
		);

        console.log(`Updated user profile for ${customer.email} to plan ${metadata.plan_name}`);
        console.log('Profile update response:', updateRes);

        // Push to subscription collection
        const subscriptionData = {
          user_id: profile.$id, // or customer.email if preferred
          created_at: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
          current_period_start_date: startDate,
          current_period_end_date: expiryDate.toISOString(),
          plan_name: metadata.plan_name,
          billing_cycle: metadata.billing_cycle,
          status: 'active', // Adjust based on event.object.status if available
        };

        // Check if subscription already exists for this user
        const existingSubscriptions = await serverDatabases.listDocuments(
          '67fecfed002f909fc072', // Database ID
          '682c300c001640914033', // Replace with actual subscription collection ID
          [Query.equal('user_id', profile.$id)]
        );

        if (existingSubscriptions.documents.length > 0) {
          // Update existing subscription
          const subscription = existingSubscriptions.documents[0];
          await serverDatabases.updateDocument(
            '67fecfed002f909fc072',
            '682c300c001640914033',
            subscription.$id,
            subscriptionData
          );
          console.log(`Updated subscription for user ${profile.$id}`);
        } else {
          // Create new subscription
          await serverDatabases.createDocument(
            '67fecfed002f909fc072',
            '682c300c001640914033',
            'unique()', // Auto-generate document ID
            subscriptionData
          );
          console.log(`Created new subscription for user ${profile.$id}`);
        }
      } else {
        console.log('No profile found for email:', customer.email);
      }
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error.message, error.stack);
    return res.status(500).json({ message: 'Webhook failed', error: error.message });
  }
}