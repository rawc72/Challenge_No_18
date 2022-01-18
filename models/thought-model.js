var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var moment = require("moment");
var constansts = require("./constants");

var reactionSchema = new Schema(
  {
    reactionId: Schema.Types.ObjectId,
    reactionBody: {
      type: String,
      required: [true, "Text is required"],
      maxlength: 280,
    },
    username: {
      type: String,
      required: [true, "User name is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: (time) => moment(time).format(constansts.TIME_FORMAT),
    },
  },
  { id: false }
);

var thoughtSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    thoughtText: {
      type: String,
      required: [true, "Text is required"],
      maxlength: 280,
      minlength: 1,
    },
    username: {
      type: String,
      required: [true, "User name is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: (time) => moment(time).format(constansts.TIME_FORMAT),
    },
    reactions: [reactionSchema],
  },
  { id: false }
);

thoughtSchema.virtual("reactionCount").get(function () {
  return this.reactions.length;
});

thoughtSchema.set("toJSON", {
  virtuals: true,
  getters: true,
});

reactionSchema.set("toJSON", {
  getters: true,
});

var Thought = mongoose.model("Thought", thoughtSchema);

module.exports = Thought;
