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

// also load our authentication module
const { authenticate } = require('./authenticate');

// require our data loader
const buildDataloaders = require('./dataloaders');

// function to call when starting the server
const start = async () => {

    const mongo = await connectMongo();

    // place the mongo connection into the graphQL context object
    // context is a graphQL object that gets passed to all resolvers,
    // good place to store db credentials, tokens, etc.
    var app = express();

    // define a build options "middleware" to authenticate each
    // request from the user
    const buildOptions = async (req, res) => {
        const user = await authenticate(req, mongo.Users);

        // store the user in GraphQL context object
        return {
            context: {
                dataloaders: buildDataloaders(mongo),
                mongo,
                user
            },
            schema
        };
    };

    // pass the buildOptions into our graphQL server
    app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));
    
    app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql',
        passHeader: `'Authorization': 'bearer token-bess@test.com'`
    }));
    
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Hackernews GraphQL server running on port ${PORT}.`);
    });
};

// invoke the function
start();

