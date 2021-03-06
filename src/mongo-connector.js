// require the node mongo client
const { Logger, MongoClient } = require('mongodb');

// define the url we'll be connecting to mongo with
const MONGO_URL = 'mongodb://localhost:27017/hackernews';

// start the connection, use async await to wait for the
// db connection to succeed
module.exports = async () => {
    const db = await MongoClient.connect(MONGO_URL);

    // some temporary logging
    let logCount = 0;
    Logger.setCurrentLogger((msg, state) => {
      console.log(`MONGO DB REQUEST ${++logCount}: ${msg}`);
    });
    Logger.setLevel('debug');
    Logger.filter('class', ['Cursor']);

    // return the mongodb collections for links, users, votes
    return {
        Links: db.collection('links'),
        Users: db.collection('users'),
        Votes: db.collection('votes')
    };
}