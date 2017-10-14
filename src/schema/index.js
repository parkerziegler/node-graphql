// makeExecutableSchema accepts a string in the schema
// definition language and returns a complete GraphQLSchema 
const { makeExecutableSchema } = require('graphql-tools');

// load our resolvers for our queries and mutations
const resolvers = require('./resolvers');

// define types for the graphql schema
const typeDefs = `
    type Link {
        id: ID!
        url: String!
        description: String!
        postedBy: User
    }

    type User {
        id: ID!
        name: String!
        email: String
    }

    input AuthProviderSignupData {
        email: AUTH_PROVIDER_EMAIL
    }

    input AUTH_PROVIDER_EMAIL {
        email: String!
        password: String!
    }

    type SigninPayload {
        token: String,
        user: User
    }

    type Query {
        allLinks: [Link!]!
    }

    type Mutation {
        createLink(url: String!, description: String!): Link
        createUser(name: String!, authProvider: AuthProviderSignupData!): User
        signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
    }
`;

// generate the graphql schema object from the typeDefs object
module.exports = makeExecutableSchema({ typeDefs, resolvers });
