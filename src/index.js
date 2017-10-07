// import express
const express = require('express');

// import bodyParser to parse JSON
const bodyParser = require('body-parser');

// a package to handle GraphQL server requests and responses
// based on the schema
// also import graphiqlExpress, it renders a nice IDE for testing the graphql server
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

// require our graphQL schema
const schema = require('./schema');

// require our db connection
const connectMongo = require('./mongo-connector');

// function to call when starting the server
const start = async () => {

    const mongo = await connectMongo();

    // place the mongo connection into the graphQL context object
    // context is a graphQL object that gets passed to all resolvers,
    // good place to store db credentials, tokens, etc.
    var app = express();
    app.use('/graphql', bodyParser.json(), graphqlExpress({ 
        context: { mongo },
        schema
    }));
    
    app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql'
    }));
    
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Hackernews GraphQL server running on port ${PORT}.`);
    });
};

// invoke the function
start();

