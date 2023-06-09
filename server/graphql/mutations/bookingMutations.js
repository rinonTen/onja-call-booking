const bookingType = require("../types/booking");
const bookingModel = require("../models/booking");
const { GraphQLString, GraphQLNonNull, GraphQLID, GraphQLList } = require("graphql");
const checkAuth = require("../../utils/check-auth");
const { getErrorForCode, ERROR_CODES } = require("../../utils/errorCodes");

const argType = {
  resourceId: { type: new GraphQLNonNull(GraphQLID) },
  title: { type: new GraphQLNonNull(GraphQLString) },
  description: { type: GraphQLString },
  start: { type: new GraphQLNonNull(GraphQLString) },
  end: { type: new GraphQLNonNull(GraphQLString) },
  participants: { type: GraphQLList(new GraphQLNonNull(GraphQLID)) },
};

module.exports = {
  createBooking: {
    type: bookingType.bookingType,
    args: argType,
    resolve: async (root, args, context) => {
      const { resourceId, title, description, start, end, participants } = args;

      const uModel = new bookingModel({
        participants,
        resourceId,
        title,
        description,
        start,
        end,
      });

      const newBooking = await uModel.save();
      const populatedBooking = newBooking
        .populate("booking")
        .populate("room")
        .populate("user");
      if (!newBooking) {
        throw new Error(getErrorForCode(ERROR_CODES.EA1));
      }
      return populatedBooking;
    },
  },
  deleteBooking: {
    type: bookingType.bookingType,
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (root, args, context) => {
      const user = checkAuth(context);
      const bookingToRemove = await bookingModel.findById(args.id);

      const { participants } = bookingToRemove;

      if (!bookingToRemove) {
        throw new Error(getErrorForCode(ERROR_CODES.EA2));
      }

      try {
        if (user.id && participants?.includes(user.id)) {
          await bookingToRemove.delete();
        } else {
          throw new Error(getErrorForCode(ERROR_CODES.EG1));
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  updateBooking: {
    type: bookingType.bookingType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      ...argType
    },
    resolve: async (root, args, context) => {
      const user = checkAuth(context);
      const bookingToUpdate = await bookingModel.findById(args.id);
      if (!bookingToUpdate) {
        throw new Error(getErrorForCode(ERROR_CODES.EA2));
      }
      const updatedArgs = {
        ...args,
      };

      try {
        if (user.id && bookingToUpdate?.participants?.includes(user.id)) {
          const updatedBooking = await bookingModel
            .findByIdAndUpdate(args.id, updatedArgs, {
              new: true,
            })
            .populate("booking")
            .populate("room")
            .populate("user");

          if (!updatedBooking) {
            throw new Error(getErrorForCode(ERROR_CODES.EA2));
          }
          return updatedBooking;
        } else {
          throw new Error(getErrorForCode(ERROR_CODES.EG1));
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
