// lib/appwriteConfig.js
import { Client, Account, ID } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // or your self-hosted Appwrite endpoint
  .setProject('67fd8405001a20b5ad34'); // replace this

const account = new Account(client);

export { client, account, ID };
