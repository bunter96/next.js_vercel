// /lib/appwriteConfig.js
import { Client as AppwriteClient, Account, Databases, Storage, ID, Permission, Role, Query } from 'appwrite';
import { Client as NodeAppwriteClient, Databases as NodeDatabases, Users as NodeUsers } from 'node-appwrite';

// Frontend client (appwrite SDK for client-side operations)
const client = new AppwriteClient()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Server-side client (node-appwrite SDK for webhook)
const createServerClient = () => {
  const serverClient = new NodeAppwriteClient()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
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
  serverUsers,
  ID, 
  Permission, 
  Role, 
  Query,
  createServerClient
};