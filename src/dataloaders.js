// import the dataloader npm package
const DataLoader = require('dataloader');

// create a function for batching users - reduces number of calls
// if we are returning data with the same id
async function batchUsers (Users, keys) {
  return await Users.find({ _id: {$in: keys }}).toArray();
}

// export our user loader, passing it the batch function
// use cacheKeyFn to normalize keys returned from mongo
module.exports = ({ Users }) =>({
  userLoader: new DataLoader(
    keys => batchUsers(Users, keys),
    { cacheKeyFn: key => key.toString() }
  )
});