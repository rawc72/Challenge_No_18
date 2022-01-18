var mongoose = require("mongoose");
var Schema = mongoose.Schema;
require("./thought-model");

var userSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    username: {
      type: String,
      unique: true,
      required: [true, "Username is required"],
      validate: {
        validator: function (v) {
          return v.trim();
        },
      },
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      validate: {
        validator: function (v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email",
      },
    },
    thoughts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thought",
      },
    ],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { id: false }
);

userSchema.virtual("friendCount").get(function () {
  return this.friends.length;
});

userSchema.set("toJSON", {
  virtuals: true,
});

var User = mongoose.model("User", userSchema);

module.exports = User;
