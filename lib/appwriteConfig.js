import { Client, Account, Databases, Storage, ID, Permission, Role, Query } from 'appwrite';

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('67fd8405001a20b5ad34');

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage, ID, Permission, Role, Query };