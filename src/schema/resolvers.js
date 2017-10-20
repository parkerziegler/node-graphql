const { ObjectID } = require('mongodb');
  
  module.exports = {
    Query: {
      allLinks: async (root, data, { mongo: { Links }}) => {
        return await Links.find({}).toArray();
      },
    },
    Mutation: {

      // our createLink resolver
      createLink: async (root, data, { mongo: { Links }, user}) => {
        // copy over the data sent in the resolver along with
        // the user who posted it
        const newLink = Object.assign({postedById: user && user._id}, data);

        // insert into our MongoDB databasse
        const response = await Links.insert(newLink);

        // return the id of the newly created link
        // in addition to the newLink object
        return Object.assign({ id: response.insertedIds[0] }, newLink);
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
    Link: {
      // Convert the "_id" field from MongoDB to "id" from the schema.
      id: root => root._id || root.id,

      postedBy: async ({ postedById }, data, {mongo: { Users }}) => {
        return await Users.findOne({ _id: postedById });
      },

      votes: async ({ _id }, data, { mongo: Votes }) => {
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
      user: async ({ userId }, data, { mongo: { Users }}) => {
        return await Users.findOne({ _id: userId });
      },

      // fetch the link data from mongo
      link: async ({ linkId }, data, { mongo: { Links }}) => {
        return await Links.findOne({ _id: linkId });
      }
    }
  };