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
        postedBy: User,
        votes: [Vote!]!
    }

    type User {
        id: ID!
        name: String!
        email: String
        votes: [Vote!]!
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

    type Vote {
        id: ID!
        user: User!
        link: Link!
    }

    type Query {
        allLinks(filter: LinkFilter, skip: Int, first: Int): [Link!]!
    }

    type Mutation {
        createLink(url: String!, description: String!): Link
        createVote(linkId: ID!): Vote
        createUser(name: String!, authProvider: AuthProviderSignupData!): User
        signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
    }

    type Subscription {
        Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
    }

    input LinkSubscriptionFilter {
        mutation_in: [_ModelMutationType!]
    }

    type LinkSubscriptionPayload {
        mutation: _ModelMutationType!
        node: Link
    }

    enum _ModelMutationType {
        CREATED
        UPDATED
        DELETED
    }

    input LinkFilter {
        OR: [LinkFilter!]
        description_contains: String
        url_contains: String
    }
`;

// generate the graphql schema object from the typeDefs object
module.exports = makeExecutableSchema({ typeDefs, resolvers });
