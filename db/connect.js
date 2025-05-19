// MongoDB connection utility
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'test';

let clients = {};

async function connect(customUri, _) {
    const uriToUse = customUri || uri;
    const dbNameToUse = _ || dbName;
    const key = `${uriToUse}`;
    if (!clients[key] || !clients[key].isConnected()) {
        clients[key] = new MongoClient(uriToUse, { useNewUrlParser: true, useUnifiedTopology: true });
        await clients[key].connect();
    }
    return clients[key];
}

async function close(customUri, customDbName) {
    const uriToUse = customUri || uri;
    const dbNameToUse = customDbName || dbName;
    const key = `${uriToUse}_${dbNameToUse}`;
    if (clients[key] && clients[key].isConnected()) {
        await clients[key].close();
        clients[key] = null;
    }
}

module.exports = { connect, close };