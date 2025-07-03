import { Client, Account } from 'appwrite';
import Cookies from 'js-cookie';

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

    // Return success response
    res.status(200).json({ success: true, redirect: '/account' });
  } catch (error) {
    console.error('Error in /api/auth/finalize:', error);
    res.status(400).json({ error: 'Failed to finalize session', details: error.message });
  }
}