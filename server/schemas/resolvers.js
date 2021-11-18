const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
// `Query` type:`me`: Which returns a `User` type.
  Query: {
    me: async (parent, args,context) => {
      if (context.user) {
        const userData= await User.findOne({ _id: context.user._id })
        .select('-__v -password');
        return userData;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    // `login`: Accepts an email and password as parameters; returns an `Auth` type.
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user);
      return { token, user };
    },
    // `addUser`: Accepts a username, email, and password as parameters; returns an `Auth` type.
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    // `saveBook`: Accepts a book author's array, description, title, bookId, image, and link as parameters;
    //  returns a `User` type. 
    //  (Look into creating what's known as an `input` type to handle all of these parameters!)
    saveBook: async (parent, {input}, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
            {_id: context.user._id},
            {$pull: {savedBooks:input}},
            {new: true,runValidators:true}
        );
        return updatedUser;
      }
      throw new AuthenticationError('NEED TO LOGIN!');
    },
    // `removeBook`: Accepts a book's `bookId` as a parameter; returns a `User` type.
    removeBook: async (parent, {bookId}, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
              {_id: context.user._id},
              {$pull: {savedBooks:{bookId:bookId}}},
              {new: true}
          );
          return updatedUser;
        }
        throw new AuthenticationError('Need to login!');
      },
  },
};

module.exports = resolvers;
