// pages/api/check-subscriptions.js
const sdk = require("node-appwrite");

export default async function handler(req, res) {
  // Ensure it's a GET request, or a POST if you prefer a trigger with a body
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

	const client = new sdk.Client() // Corrected line!
	  .setEndpoint(process.env.APPWRITE_ENDPOINT)
	  .setProject(process.env.APPWRITE_PROJECT_ID)
	  .setKey(process.env.APPWRITE_API_KEY);

  const database = new sdk.Databases(client);
  const dbId = process.env.APPWRITE_DATABASE_ID;
  const collectionId = process.env.APPWRITE_COLLECTION_ID;

  const now = new Date();
  console.log("🕒 Subscription check started at", now.toISOString());

  let totalChecked = 0;
  let totalDowngraded = 0;
  let totalErrors = 0;
  let messages = []; // To capture logs for the response

  try {
    const users = await database.listDocuments(dbId, collectionId);
    messages.push(`🔍 Found ${users.documents.length} user(s)`);

    for (const user of users.documents) {
      totalChecked++;

      const expiry = user.current_plan_expiry_date
        ? new Date(user.current_plan_expiry_date)
        : null;
      const isExpired = expiry && expiry < now;
      const isActive = user.is_active;

      messages.push(`\n📄 User: ${user.$id}`);
      messages.push(`  ├─ Expiry Date: ${expiry ? expiry.toISOString() : "null"}`);
      messages.push(`  ├─ is_active: ${isActive}`);
      messages.push(`  └─ Expired: ${isExpired}`);

      if (isExpired && isActive) {
        try {
          await database.updateDocument(dbId, collectionId, user.$id, {
            is_active: false,
            current_active_plan: null,
            char_allowed: null,
            char_remaining: null,
            current_plan_start_date: null,
            current_plan_expiry_date: null,
            active_product_id: null,
            billing_cycle: null,
            plan_type: null,
            creem_customer_id: null,
            creem_subscription_id: null,
          });

          messages.push(`  ✅ User downgraded and fields reset.`);
          totalDowngraded++;
        } catch (err) {
          messages.push(`  ❌ Failed to downgrade user ${user.$id}: ${err.message}`);
          totalErrors++;
        }
      } else {
        messages.push(`  ✅ No action needed.`);
      }
    }
  } catch (err) {
    messages.push(`❌ Failed to fetch users: ${err.message}`);
    // Instead of process.exit, send an error response
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      details: err.message,
      logs: messages
    });
  }

  const finalSummary = `\n📊 Done. Checked: ${totalChecked}, Downgraded: ${totalDowngraded}, Errors: ${totalErrors}`;
  messages.push(finalSummary);
  console.log(finalSummary); // Still log to Vercel logs

  res.status(200).json({
    status: 'success',
    message: 'Subscription check completed',
    checked: totalChecked,
    downgraded: totalDowngraded,
    errors: totalErrors,
    logs: messages // Optional: return logs for inspection
  });
}