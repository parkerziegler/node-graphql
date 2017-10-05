// makeExecutableSchema accepts a string in the schema
// definition language and returns a complete GraphQLSchema 
const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolvers');

// define types for the graphql schema
const typeDefs = `
    type Link {
        id: ID!
        url: String!
        description: String!
    }

    type Query {
        allLinks: [Link!]!
    }

    type Mutation {
        createLink(url: String!, description: String!): Link
    }
`;

// generate the graphql schema object from the typeDefs object
module.exports = makeExecutableSchema({ typeDefs, resolvers });
