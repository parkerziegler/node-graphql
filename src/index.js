// import express
const express = require('express');

// import bodyParser to parse JSON
const bodyParser = require('body-parser');

// a package to handle GraphQL server requests and responses
// based on the schema
// also import graphiqlExpress, it renders a nice IDE for testing the graphql server
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

const schema = require('./schema');

var app = express();
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql'
}));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Hackernews GraphQL server running on port ${PORT}.`);
});