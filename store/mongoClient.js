import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;
let collection;
let credits;
let passes;
let friends;

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db('dbdDatabase');
        collection = db.collection('bot');
        credits = db.collection('credits');
        passes = db.collection('passes');
        friends = db.collection('friends');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}

function getCollection() {
    return collection;
}

function getCredits() {
    return credits;
}

function getPasses() {
    return passes;
}

function getFriends() {
    return friends;
}

export default { connectToDatabase, getCollection, getCredits, getPasses, getFriends };
