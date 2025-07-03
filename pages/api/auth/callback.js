import { Client, Account } from 'appwrite';

export default async function handler(req, res) {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
    const account = new Account(client);

    // Get the current session
    const session = await account.getSession('current');
    if (!session) {
      throw new Error('No session found');
    }

    // Set a first-party cookie with the session token
    res.setHeader('Set-Cookie', [
      `session=${session.$id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
    ]);

    // Redirect to the account page
    res.redirect(302, 'https://app.lowcosttts.online/account');
  } catch (error) {
    console.error('Error in /api/auth/callback:', error);
    res.redirect(302, 'https://app.lowcosttts.online?error=auth_failed');
  }
}