import { createContext, useContext, useState, useEffect } from 'react';
import { account, client, ID } from '@/lib/appwriteConfig';
import { Databases, Permission, Role } from 'appwrite';
import { Creem } from 'creem';

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

      const databases = new Databases(client);
      const databaseId = '67fecfed002f909fc072';
      const collectionId = '67fecffb00075d13ade6';

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
              creem_customer_id: '', // Initialize as empty
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
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);