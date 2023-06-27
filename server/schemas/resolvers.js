const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return await User.findOne({_id: context.user._id}).populate('savedBooks')
            }
            throw new AuthenticationError('you need to be logged in!')
        }
    },

    Mutation: {
        login: async (parent, {username, password }) => {
            const user = await User.findOne({
                $or: [{username}, {email:username}], 
            });
            if (!user) {
                throw new Error('User Not Found');
            }
            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new Error('Incorrect Password');
            }
            const token = signToken(user);

            return { token, user };
        },
        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({username, email, password});
            const token = signToken(user);
            return {token, user};
        },
        saveBook: async (parent, { book }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                     {_id: context.user._id },
                    { $push: {savedBooks: book} },
                    { new: true }, 
                ).populate('savedBooks');

                return updatedUser;
            }
                throw new AuthenticationError('You need to be logged in!');
        }, 
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                ).populate('savedBooks');
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    }
}









module.exports = resolvers