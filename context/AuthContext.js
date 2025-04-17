import { createContext, useContext, useState, useEffect } from 'react';
import { account, client, ID } from '@/lib/appwriteConfig';
import { Databases, Permission, Role } from 'appwrite';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      // Check for an active session first
      try {
        await account.getSession('current'); // Verify session exists
      } catch (sessionError) {
        // No session (guest user), skip account fetch
        setUser(null);
        setLoading(false);
        return;
      }

      // Session exists, fetch user data
      const userData = await account.get();
      let picture = userData.prefs?.picture;

      // Initialize Appwrite Databases
      const databases = new Databases(client);
      const databaseId = '67fecfed002f909fc072'; // Replace with your Appwrite database ID, e.g., '67fd8405001a20b5ad34'
      const collectionId = '67fecffb00075d13ade6'; // Replace with your users collection ID, e.g., '67fd8405001b2c4d5e67'

      // Fetch user document from users collection
      let userDoc = {};
      try {
        userDoc = await databases.getDocument(databaseId, collectionId, userData.$id);
      } catch (error) {
        if (error.code === 404) {
          // User document does not exist, create a new one
          try {
            userDoc = await databases.createDocument(
              databaseId,
              collectionId,
              userData.$id,
              {
                userId: userData.$id,
                name: userData.name || '',
                email: userData.email || '',
                picture: picture || '',
                current_active_plan: '',
                is_active: false,
                char_allowed: 0,
                char_remaining: 0,
                current_plan_start_date: null,
                current_plan_expiry_date: null,
                active_product_id: '',
                billing_cycle: '',
              },
              [
                Permission.read(Role.user(userData.$id)),
                Permission.write(Role.user(userData.$id)),
                Permission.update(Role.user(userData.$id)),
                Permission.delete(Role.user(userData.$id)),
              ]
            );
          } catch (createError) {
            console.error('Error creating user document:', createError);
            if (createError.code === 401) {
              console.warn('User lacks permission to create document. Check collection permissions in Appwrite.');
            }
          }
        } else if (error.code === 401) {
          console.warn('User lacks permission to read document. Check collection permissions in Appwrite.');
        } else {
          console.error('Error fetching user document:', error);
        }
      }

      // Fetch profile picture if missing
      if (!picture) {
        try {
          const session = await account.getSession('current');
          const providerAccessToken = session?.providerAccessToken;

          if (providerAccessToken) {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${providerAccessToken}`,
              },
            });

            if (response.status === 429) {
              console.warn('Google API rate limit hit, skipping picture fetch');
            } else {
              const googleData = await response.json();
              picture = googleData.picture;
              if (picture) {
                await account.updatePrefs({ picture });
                // Update the picture in the database
                try {
                  await databases.updateDocument(
                    databaseId,
                    collectionId,
                    userData.$id,
                    { picture }
                  );
                  userDoc.picture = picture; // Update local userDoc
                } catch (updateError) {
                  console.error('Error updating profile picture in database:', updateError);
                  if (updateError.code === 401) {
                    console.warn('User lacks permission to update document. Check collection permissions in Appwrite.');
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching Google profile picture:', error);
        }
      }

      // Merge account data and document data
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