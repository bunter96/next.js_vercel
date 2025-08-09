// /pages/api/webhook.js
import { serverDatabases } from '../../lib/appwriteConfig';
import { Query } from 'appwrite';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Verify webhook signature
  const verifyWebhook = () => {
    const secret = process.env.CREEM_WEBHOOK_SECRET;
    if (!secret) {
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
        break;
      }
    }

    if (!signature) {
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
      return isValid;
    } catch (error) {
      return false;
    }
  };

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check webhook authenticity
  if (!verifyWebhook()) {
    return res.status(401).json({ message: 'Unauthorized webhook' });
  }

  const event = req.body;
  const eventType = event.eventType || event.type;

  try {
    if (eventType === 'subscription.paid') {
      const { customer, product, metadata } = event.object;

      // Validate payload
      if (!customer?.email || !product?.id || !metadata?.plan_name) {
        return res.status(400).json({ message: 'Invalid webhook payload' });
      }

      // Find user profile using server-side client
      const response = await serverDatabases.listDocuments(
        '67fecfed002f909fc072', // Database ID
        '67fecffb00075d13ade6', // Profile Collection ID
        [Query.equal('user_email', customer.email)]
      );

      if (response.documents.length > 0) {
        const profile = response.documents[0];

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

        // Prepare the data object for the profile update
        let updateData = {
          plan_type: metadata.plan_name,
          char_allowed: plan.chars,
          char_remaining: plan.chars,
          current_plan_start_date: startDate,
          current_plan_expiry_date: expiryDate.toISOString(),
          active_product_id: product.id,
          billing_cycle: metadata.billing_cycle,
          creem_customer_id: customer.id,
          creem_subscription_id: event.object.id,
		  current_active_plan: metadata.plan_name
        };

        // Add plan-specific attributes based on the plan name
        switch (metadata.plan_name) {
            case 'Starter Monthly':
                updateData.voice_clone_allowed = 3;
                updateData.voice_clone_used = 0;
                break;
            case 'Starter Yearly':
                updateData.voice_clone_allowed = 10;
                updateData.voice_clone_used = 0;
                break;
            case 'Pro Monthly':
                updateData.voice_clone_allowed = 10;
                updateData.voice_clone_used = 0;
                break;
            case 'Pro Yearly':
                updateData.voice_clone_allowed = 20;
                updateData.voice_clone_used = 0;
                break;
            case 'Turbo Monthly':
                updateData.voice_clone_allowed = 25;
                updateData.voice_clone_used = 0;
                break;
            case 'Turbo Yearly':
                updateData.voice_clone_allowed = 50;
                updateData.voice_clone_used = 0;
                break;
        }

        // Only set is_active to true if it is not already true
        if (!profile.is_active) {
            updateData.is_active = true;
        }

        // Update user profile with the combined subscription info
        await serverDatabases.updateDocument(
          '67fecfed002f909fc072',
          '67fecffb00075d13ade6',
          profile.$id,
          updateData // Pass the dynamically built object here
        );

        // Push to subscription collection
        const subscriptionData = {
          user_id: profile.$id,
          created_at: Math.floor(Date.now() / 1000),
          current_period_start_date: startDate,
          current_period_end_date: expiryDate.toISOString(),
          plan_name: metadata.plan_name,
          billing_cycle: metadata.billing_cycle,
          status: 'active',
        };

        // Check if subscription already exists for this user
        const existingSubscriptions = await serverDatabases.listDocuments(
          '67fecfed002f909fc072', // Database ID
          '682c300c001640914033', // Replace with your actual subscription collection ID
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
        } else {
          // Create new subscription
          await serverDatabases.createDocument(
            '67fecfed002f909fc072',
            '682c300c001640914033',
            'unique()',
            subscriptionData
          );
        }
      }
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    return res.status(500).json({ message: 'Webhook failed', error: error.message });
  }
}