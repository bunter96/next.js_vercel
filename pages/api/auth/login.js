import { account } from '@/lib/appwriteConfig';

export default async function handler(req, res) {
  try {
    const { referer } = req.headers;
    const successRedirect = referer && referer.includes('https://app.lowcosttts.online')
      ? referer.replace(/\/login$/, '/account') // Redirect to /account instead of /login
      : 'https://app.lowcosttts.online/account';
    const failureRedirect = 'https://app.lowcosttts.online';

    // Create OAuth2 session (returns a string URL)
    const loginUrl = await account.createOAuth2Session(
      'google',
      successRedirect,
      failureRedirect
    );

    // Check if loginUrl is a valid string
    if (!loginUrl || typeof loginUrl !== 'string') {
      throw new Error('Failed to generate OAuth login URL');
    }

    // Redirect to Google's OAuth page
    res.writeHead(302, { Location: loginUrl });
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate OAuth login', details: error.message });
  }
}