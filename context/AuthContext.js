import { createContext, useContext, useState, useEffect } from 'react';
import { account, client, ID, databases } from '@/lib/appwriteConfig';
import { Databases, Permission, Role } from 'appwrite';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      let userData;
      const sessionId = Cookies.get('session');
      if (!sessionId) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Set the session in the Appwrite client
      client.headers['X-Appwrite-Session'] = sessionId;

      try {
        userData = await account.get();
      } catch (sessionError) {
        console.error('Session error:', sessionError);
        Cookies.remove('session');
        setUser(null);
        setLoading(false);
        return;
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
              current_active_plan: '',
              is_active: false,
              char_allowed: 0,
              char_remaining: 0,
              current_plan_start_date: null,
              current_plan_expiry_date: null,
              active_product_id: '',
              billing_cycle: '',
              is_admin: false,
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
      Cookies.remove('session');
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
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);