const { ObjectID } = require('mongodb');
const { URL } = require('url');
const pubsub = require ('../pubsub');

// class for providing more specific error messages
class ValidationError extends Error {

  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

function assertValidLink({ url }) {
  try {
    new URL(url);
  } catch (error) {
    throw new ValidationError('Link validation error: invalid url.', 'url');
  }
}

function buildFilters({ OR = [], description_contains, url_contains }) {

  const filter = (description_contains || url_contains) ? {} : null;

  if (description_contains) {
    filter.description = { $regex: `.*${description_contains}.*` };
  }

  if (url_contains) {
    filter.url_contains = { $regex: `.*${url_contains}.*`};
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildFilters(OR[i]));
  }

  return filters;
}

module.exports = {
  Query: {
    allLinks: async (root, { filter, first, skip }, { mongo: { Links }}) => {
      let query = filter ? { $or: buildFilters(filter)} : {};

      const cursor = await Links.find(query);

      if (first) {
        cursor.limit(first);
      }

      if (skip) {
        cursor.skip(skip);
      }
      return cursor.toArray();
    },
  },
  Mutation: {

    // our createLink resolver
    createLink: async (root, data, { mongo: { Links }, user}) => {

      // check that the link is valid
      assertValidLink(data);

      // copy over the data sent in the resolver along with
      // the user who posted it
      const newLink = Object.assign({postedById: user && user._id}, data);

      // insert into our MongoDB database
      const response = await Links.insert(newLink);

      /* send out a pubsub notification to alert interested clients that
      a new link was created */
      newLink.id = response.insertedIds[0];
      pubsub.publish('Link', { Link: { mutation: 'CREATED', node: newLink }});

      // return the newLink object
      return newLink;
    },

    // our createVote resolver
    createVote: async (root, data, { mongo: { Votes }, user}) => {

      // compose the newVote object
      const newVote = {
        userId: user && user._id,
        linkId: new ObjectID(data.linkId)
      };

      // insert it into mongo's votes collection
      const response = await Votes.insert(newVote);

      // return the id of the cast vote and it's contents
      return Object.assign({ id: response.insertedIds[0] }, newVote);
    },

    // our createUser resolver
    createUser: async (root, data, { mongo: { Users }}) => {

      // define a new user object
      const newUser = {
        name: data.name,
        email: data.authProvider.email.email,
        password: data.authProvider.email.password
      };

      // insert the new user
      const response = await Users.insert(newUser);

      // return the new user with the generated id
      return Object.assign({ id: response.insertedIds[0] }, newUser);
    },

    // our signin user resolver - take a look at the Users collection
    // in the database - data is our auth credentials
    signinUser: async (root, data, { mongo: { Users }}) => {
      
      // find the matching user
      const user = await Users.findOne({ email: data.email.email });

      // check that the password matches
      if (data.email.password === user.password) {
        // if so, return a token
        return { token: `token-${user.email}`, user };
      }
    }
  },
  Subscription: {
    Link: {
      subscribe: () => pubsub.asyncIterator('Link')
    }
  },
  Link: {
    // Convert the "_id" field from MongoDB to "id" from the schema.
    id: root => root._id || root.id,

    postedBy: async ({ postedById }, data, {dataloaders: {userLoader}}) => {
      return await userLoader.load(postedById);
    },

    votes: async ({ _id }, data, { mongo: { Votes }}) => {
      return await Votes.find({ linkId: _id }).toArray();
    }
  },
  User: {
    // Convert the "_id" field from MongoDB to "id" from the schema.
    id: root => root._id || root.id,

    votes: async({ _id }, data, { mongo: Votes }) => {
      return await Votes.find({ userId: _id }).toArray();
    }
  },
  Vote: {
    id: root => root._id || root.id,

    // fetch the user data from mongo
    user: async ({ userId }, data, { dataloaders: { userLoader }}) => {
      return await userLoader.load(userId);
    },

    // fetch the link data from mongo
    link: async ({ linkId }, data, { mongo: { Links }}) => {
      return await Links.findOne({ _id: linkId });
    }
  }
};