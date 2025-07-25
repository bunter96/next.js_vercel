import { createContext, useContext, useState, useEffect } from 'react';
import { account, client, ID, databases } from '@/lib/appwriteConfig'; // Ensure databases is imported
import { Databases, Permission, Role } from 'appwrite';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      let userData;
      try {
        await account.getSession('current');
        userData = await account.get();
      } catch (sessionError) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Load character limits from env and parse them
      const charAllowed = parseInt(process.env.NEXT_PUBLIC_CHAR_ALLOWED, 10) || 1000;
      const charRemaining = parseInt(process.env.NEXT_PUBLIC_CHAR_REMAINING, 10) || 1000;

      if (isNaN(charAllowed) || isNaN(charRemaining)) {
        throw new Error(
          'Invalid NEXT_PUBLIC_CHAR_ALLOWED or NEXT_PUBLIC_CHAR_REMAINING. They must be valid integers.'
        );
      }

      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
      const collectionId = process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID;

      let userDoc;
      try {
        userDoc = await databases.getDocument(databaseId, collectionId, userData.$id);
      } catch (error) {
        if (error.code === 404) {
          userDoc = await databases.createDocument(
            databaseId,
            collectionId,
            userData.$id,
            {
              userId: userData.$id,
              name: userData.name || '',
              user_email: userData.email || '',
              picture: userData.prefs?.picture || '',
              creem_customer_id: '',
              current_active_plan: 'free',
              is_active: false,
              char_allowed: charAllowed,
              char_remaining: charRemaining,
              current_plan_start_date: null,
              current_plan_expiry_date: null,
              active_product_id: '',
              billing_cycle: '',
              is_admin: false,
			  voice_clone_allowed: 1,
			  voice_clone_used: 1,
            },
            [
              Permission.read(Role.user(userData.$id)),
              Permission.write(Role.user(userData.$id)),
              Permission.update(Role.user(userData.$id)),
              Permission.delete(Role.user(userData.$id)),
            ]
          );
        } else {
          throw error;
        }
      }

      // Fetch profile picture if missing
      let picture = userData.prefs?.picture || userDoc.picture;
      if (!picture) {
        try {
          const session = await account.getSession('current');
          const providerAccessToken = session?.providerAccessToken;
          if (providerAccessToken) {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${providerAccessToken}` },
            });
            if (response.ok) {
              const googleData = await response.json();
              picture = googleData.picture;
              if (picture) {
                await account.updatePrefs({ picture });
                await databases.updateDocument(databaseId, collectionId, userData.$id, { picture });
                userDoc.picture = picture;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching Google profile picture:', error);
        }
      }

      setUser({
        ...userData,
        prefs: { ...userData.prefs, picture },
        ...userDoc,
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      // Fetch all sessions for the user
      const sessions = await account.listSessions();
      // Delete all sessions
      await Promise.all(
        sessions.sessions.map((session) => account.deleteSession(session.$id))
      );
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out completely. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

	return (
	  <AuthContext.Provider value={{ user, loading, logout, setUser }}>
		{children}
	  </AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);