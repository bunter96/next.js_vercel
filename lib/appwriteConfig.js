// /lib/appwriteConfig.js
import { Client as AppwriteClient, Account, Databases, Storage, ID, Permission, Role, Query } from 'appwrite';
import { Client as NodeAppwriteClient, Databases as NodeDatabases, Users as NodeUsers } from 'node-appwrite';

// Frontend client (appwrite SDK for client-side operations)
const client = new AppwriteClient()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '67fd8405001a20b5ad34');

// Server-side client (node-appwrite SDK for webhook)
const createServerClient = () => {
  const serverClient = new NodeAppwriteClient()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '67fd8405001a20b5ad34')
    .setKey(process.env.APPWRITE_API_KEY); // API key for server-side access
  return serverClient;
};

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Server-side instances
const serverDatabases = new NodeDatabases(createServerClient());
const serverUsers = new NodeUsers(createServerClient());

export { 
  client, 
  account, 
  databases, 
  storage, 
  serverDatabases, 
  serverUsers, // Added for user management
  ID, 
  Permission, 
  Role, 
  Query,
  createServerClient
};