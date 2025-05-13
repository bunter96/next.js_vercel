import { databases } from '../../lib/appwriteConfig';
import { Query } from 'appwrite';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const event = req.body;
  const eventType = event.eventType || event.type;
  console.log('Webhook received:', event);
  console.log('Handling event type:', eventType);

  try {
    if (eventType === 'subscription.paid') {
      const { customer, product, metadata } = event.object;

      console.log('Processing subscription.paid for email:', customer.email);

      // Find user profile
      const response = await databases.listDocuments(
        '67fecfed002f909fc072', // Database ID
        '67fecffb00075d13ade6', // Collection ID
        [Query.equal('user_email', customer.email)]
      );

      console.log('Appwrite query response:', {
        total: response.total,
        documents: response.documents,
      });

      if (response.documents.length > 0) {
        const profile = response.documents[0];
        console.log('Found profile:', profile);

        const planDetails = {
          'prod_1B1DSJwW6nBTYgQYFsxP7': { chars: 20000 }, // Pro Yearly
          'prod_1308g86Vz0IIqbZgpPa9o4': { chars: 5000 },  // Starter Monthly
          'prod_3hWM6T8Iu8GZsUFsyQgrnB': { chars: 5000 },  // Starter Yearly (NEW)
          // Add other products as needed
        };

        const plan = planDetails[product.id] || { chars: 1000 };
        const startDate = new Date().toISOString();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (metadata.billing_cycle === 'yearly' ? 12 : 1));

        const updateRes = await databases.updateDocument(
          '67fecfed002f909fc072',
          '67fecffb00075d13ade6',
          profile.$id,
          {
            plan_type: metadata.plan_name,
            char_allowed: plan.chars,
            char_remaining: plan.chars,
            current_plan_start_date: startDate,
            current_plan_expiry_date: expiryDate.toISOString(),
			active_product_id: product.id, // Add this line
            billing_cycle: metadata.billing_cycle, // Add this line
          }
        );

        console.log(`Updated user profile for ${customer.email} to plan ${metadata.plan_name}`);
        console.log('Update response:', updateRes);
      } else {
        console.log('No profile found for email:', customer.email);
      }
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error.message, error.stack);
    return res.status(500).json({ message: 'Webhook failed' });
  }
}