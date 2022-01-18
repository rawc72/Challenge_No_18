var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = require("../models/user-model");
var Thought = require("../models/thought-model");

router.get("/users", (req, res) => {
    var result = {};

    User.find({})
        .populate({ path: "friends", select: "_id" })
        .populate({ path: "thoughts", select: "_id" })
        .then((users) => {
            var respResult = users.map((user) => {
                var result = {};
                result._id = user._id;
                result.username = user.username;
                result.email = user.email;
                result.friends = user.friends.map((friend) => friend._id);
                result.thoughts = user.thoughts.map((thought) => thought._id);
                result.friendCount = user.friendCount;

                return result;
            });
            res.send(respResult);
        })
        .catch((error) => {
            console.log(error);
            result.status = "9";
            result.description = "Failed to retrieve users";
            res.send(result);
        });
});

router.get("/users/:id", (req, res) => {
    var result = {};
    const id = req.params.id;

    User.findById(id)
        .populate("friends")
        .populate("thoughts")
        .then((user) => {
            if (user) {
                res.send(user);
            } else {
                result.status = "1";
                result.description = "User not found.";
                res.send(result);
            }
        })
        .catch((error) => {
            console.log(error);
            result.status = "9";
            result.description = "Failed to retrieve user.";
            res.send(result);
        });
});

router.post("/users", (req, res) => {
    var result = {};
    var request = req.body;
    const userNamme = request.username;
    const email = request.email;

    new User({
            _id: new mongoose.mongo.ObjectId(),
            username: userNamme,
            email,
        })
        .save()
        .then((user) => {
            res.send(user);
        })
        .catch((error) => {
            console.log(error);
            result.status = "9";
            result.description = "Failed to add user.";
            res.send(result);
        });
});

router.put("/users/:id", (req, res) => {
    var result = {};
    var request = req.body;
    const id = req.params.id;
    const userNamme = request.username;
    const email = request.email;

    User.findByIdAndUpdate(
        id, { username: userNamme, email },
        function(err, rslt) {
            if (err) {
                console.log(err);
                result.status = "9";
                result.description = "Failed to update user.";
                res.send(result);
            } else {
                if (rslt) {
                    rslt.username = userNamme;
                    rslt.email = email;
                    res.send(rslt);
                } else {
                    result.status = "1";
                    result.description = "User not found.";
                    res.send(result);
                }
            }
        }
    );
});

router.delete("/users/:id", (req, res) => {
    var result = {};
    const id = req.params.id;

    User.findByIdAndDelete(id, function(err, rslt) {
        if (err) {
            console.log(err);
            result.status = "9";
            result.description = "Failed to delete user.";
            res.send(result);
        } else {
            if (rslt) {
                result.message = "User and assoiated thoughts are deleted!";

                // delete thoughts
                const username = rslt.username;
                Thought.find({ username: username }).remove().exec();
                res.send(result);
            } else {
                result.status = "1";
                result.description = "User not found.";
                res.send(result);
            }
        }
    });
});

router.post("/users/:userId/friends/:friendId", async(req, res) => {
    var result = {};
    const userId = req.params.userId;
    const friendId = req.params.friendId;

    var user = await User.findById(userId);

    if (!user) {
        result.status = "1";
        result.description = "User not found.";
        res.send(result);
        return;
    }

    if (user.friends.includes(friendId)) {
        result.status = "1";
        result.description = "Already friends.";
        res.send(result);
        return;
    }

    var friend = await User.findById(friendId);

    if (!friend) {
        result.status = "1";
        result.description = "Friend not found.";
        res.send(result);
        return;
    }

    var newFriends = [...user.friends, friendId];

    user.friends = newFriends;
    user
        .save()
        .then((user) => {
            res.send(user);
        })
        .catch((error) => {
            console.log(error);
            result.status = "9";
            result.description = "Failed to update user's friends.";
            res.send(result);
        });
});

router.delete("/users/:userId/friends/:friendId", async(req, res) => {
    var result = {};
    const userId = req.params.userId;
    const friendId = req.params.friendId;

    var user = await User.findById(userId);

    if (!user) {
        result.status = "1";
        result.description = "User not found.";
        res.send(result);
        return;
    }

    if (!user.friends.includes(friendId)) {
        result.status = "1";
        result.description = "Not friends, not deleting.";
        res.send(result);
        return;
    }

    var index = user.friends.indexOf(friendId);
    if (index !== -1) {
        user.friends.splice(index, 1);
    }

    user
        .save()
        .then((user) => {
            res.send(user);
        })
        .catch((error) => {
            console.log(error);
            result.status = "9";
            result.description = "Failed to delete user's friend.";
            res.send(result);
        });
});

router.post("/thoughts", async(req, res) => {
    var result = {};
    var request = req.body;
    const thoughtText = request.thoughtText;
    const username = request.username;
    const userId = request.userId;

    var user = await User.findById(userId);

    if (!user) {
        result.status = "1";
        result.description = "User not found.";
        res.send(result);
        return;
    }

    new Thought({
            _id: new mongoose.mongo.ObjectId(),
            thoughtText,
            username,
        })
        .save()
        .then((thought) => {
            user.thoughts = [...user.thoughts, thought._id];
            user
                .save()
                .then((user) => {
                    res.send(thought);
                })
                .catch((error) => {
                    console.log(error);
                    result.status = "9";
                    result.description = "Failed to save thought to user.";
                    res.send(result);
                });
        })
        .catch((error) => {
            console.log(error);
            result.status = "9";
            result.description = "Failed to add new thought.";
            res.send(result);
        });
});

router.get("/thoughts", async(req, res) => {
    var result = {};

    Thought.find({})
        .populate("reactions")
        .then((thoughts) => {
            res.send(thoughts);
        })
        .catch((error) => {
            console.log(error);
            result.status = "9";
            result.description = "Failed to retrieve thoughts";
            res.send(result);
        });
});

router.get("/thoughts/:id", async(req, res) => {
    var result = {};
    const id = req.params.id;

    Thought.findById(id)
        .populate("reactions")
        .then((thought) => {
            res.send(thought);
        })
        .catch((error) => {
            console.log(error);
            result.status = "9";
            result.description = "Failed to retrieve thought";
            res.send(result);
        });
});

router.put("/thoughts/:id", async(req, res) => {
    var result = {};
    var request = req.body;
    const id = req.params.id;
    const thoughtText = request.thoughtText;

    Thought.findByIdAndUpdate(id, { thoughtText }, function(err, rslt) {
        if (err) {
            console.log(err);
            result.status = "9";
            result.description = "Failed to update thought.";
            res.send(result);
        } else {
            if (rslt) {
                rslt.thoughtText = thoughtText;
                res.send(rslt);
            } else {
                result.status = "1";
                result.description = "Thought not found.";
                res.send(result);
            }
        }
    });
});

router.delete("/thoughts/:id", async(req, res) => {
    var result = {};
    const id = req.params.id;

    Thought.findByIdAndDelete(id, function(err, rslt) {
        if (err) {
            console.log(err);
            result.status = "9";
            result.description = "Failed to delete thought.";
            res.send(result);
        } else {
            if (rslt) {
                result.message = "Thought is deleted!";

                // remove thought from user
                const username = rslt.username;
                User.findOne({ username: username }, function(err, user) {
                    if (user) {
                        var index = user.thoughts.indexOf(id);
                        if (index !== -1) {
                            user.thoughts.splice(index, 1);
                        }
                        user.save();
                    }
                });
                res.send(result);
            } else {
                result.status = "1";
                result.description = "Thought not found.";
                res.send(result);
            }
        }
    });
});

router.post("/thoughts/:thoughtId/reactions", async(req, res) => {
    var result = {};
    var request = req.body;
    const thoughtId = req.params.thoughtId;
    const reactionBody = request.reactionBody;
    const username = request.username;

    var thought = await Thought.findById(thoughtId);

    if (!thought) {
        result.status = "1";
        result.description = "thought not found.";
        res.send(result);
        return;
    }

    thought.reactions.push({
        reactionId: new mongoose.Types.ObjectId(),
        reactionBody,
        username,
    });

    thought
        .save()
        .then((thought) => {
            res.send(thought);
        })
        .catch((error) => {
            console.log(error);
            result.status = "9";
            result.description = "Failed to add new reaction to a thought.";
            res.send(result);
        });
});

router.delete(
    "/thoughts/:thoughtId/reactions/:reactionId",
    async(req, res) => {
        var result = {};
        const thoughtId = req.params.thoughtId;
        const reactionId = req.params.reactionId;

        var thought = await Thought.findById(thoughtId);

        if (!thought) {
            result.status = "1";
            result.description = "thought not found.";
            res.send(result);
            return;
        }

        var index = thought.reactions
            .map((reaction) => reaction.reactionId.toString())
            .indexOf(reactionId);
        if (index !== -1) {
            thought.reactions.splice(index, 1);
            thought
                .save()
                .then((thought) => {
                    res.send(thought);
                })
                .catch((error) => {
                    console.log(error);
                    result.status = "9";
                    result.description = "Failed to delete the reaction from a thought.";
                    res.send(result);
                });
        } else {
            result.status = "1";
            result.description = "reaction not in thought.";
            res.send(result);
            return;
        }
    }
);

module.exports = router;