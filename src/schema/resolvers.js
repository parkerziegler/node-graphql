const links = [
    {
      id: 1,
      url: 'http://graphql.org/',
      description: 'The Best Query Language'
    },
    {
      id: 2,
      url: 'http://dev.apollodata.com',
      description: 'Awesome GraphQL Client'
    },
  ];
  
  module.exports = {
    Query: {
      allLinks: async (root, data, { mongo: { Links }}) => {
        return await Links.find({}).toArray();
      },
    },
    Mutation: {

      // our createLink resolver
      createLink: async (root, data, { mongo: { Links }}) => {
        const response = await Links.insert(data);
        return Object.assign({ id: response.insertedIds[0] }, data);
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
        return Object.assign({id: response.insertedIds[0]}, newUser);
      }
    },
    Link: {
      id: root => root._id || root.id,
    },
  };