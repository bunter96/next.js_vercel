import { account } from '@/lib/appwriteConfig';

export default async function handler(req, res) {
  try {
    const successRedirect = 'https://app.lowcosttts.online/api/auth/proxy-callback';
    const failureRedirect = 'https://app.lowcosttts.online?error=auth_failed';

    // Create OAuth2 session
    const loginUrl = await account.createOAuth2Session(
      'google',
      successRedirect,
      failureRedirect
    );

    // Log for debugging
    console.log('Login URL:', loginUrl);

    // Validate loginUrl
    if (!loginUrl || typeof loginUrl !== 'string') {
      throw new Error('Failed to generate OAuth login URL');
    }

    // Redirect to Google's OAuth page
    res.redirect(302, loginUrl);
  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth login', details: error.message });
  }
}