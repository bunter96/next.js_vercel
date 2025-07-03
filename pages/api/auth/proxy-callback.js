export default async function handler(req, res) {
  try {
    // Redirect to Appwrite's hardcoded callback URL
    const appwriteCallback = 'https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/67fd8405001a20b5ad34';
    res.redirect(302, appwriteCallback);
  } catch (error) {
    console.error('Error in /api/auth/proxy-callback:', error);
    res.redirect(302, 'https://app.lowcosttts.online?error=auth_failed');
  }
}