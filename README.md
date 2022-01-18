# 18 NoSQL: Social Network API
This is an API that uses technology that is popular with many social media networks due to its speed with large amounts of data, and its flexibility with unstructured data. For the database, I will not be using MySQL, instead, MongoDB will be used.

## User Story
Aa a social media startup, I want an API for my social network that uses a NoSQL database so that  my website can handle large amounts of unstructured data.

## User Experience
Given a social network API, when I enter the command to invoke the application, then my server is started and the Mongoose models are synced to the MongoDB database.
When I open API GET routes in Insomnia Core for users and thoughts, then the data for each of these routes is displayed in a formatted JSON.
When I test API POST, PUT, and DELETE routes in Insomnia Core, then I am able to successfully create, update, and delete users and thoughts in my database.
When I test API POST and DELETE routes in Insomnia Core, then I am able to successfully create and delete reactions to thoughts and add and remove friends to a user’s friend list.

## Datbase Models
The database contains the following models, including the requirements listed for each listed below:

1. Create/update/delete user
2. Create/delete friends
3. Create/update/delete thoughts
4. Create/delete reactions

## User
* `username`
    * String
    * Unique
    * Required
    * Trimmed

* `email`
    * String
    * Required
    * Unique
    * Must match a valid email address (look into Mongoose's matching validation)

* `thoughts`
    * Array of `_id` values referencing the `Thought` model

* `friends`
    * Array of `_id` values referencing the `User` model (self-reference)

**Schema Settings**

Create a virtual called `friendCount` that retrieves the length of the user's `friends` array field on query

---

**Thought**

* `thoughtText`
    * String
    * Required
    * Must be between 1 and 280 characters

* `createdAt`
    * Date
    * Set default value to the current timestamp
    * Use a getter method to format the timestamp on query

* `username` - Which user created this thought
    * String
    * Required

* `reactions` (like replies)
    * Array of nested documents created with the `reactionSchema`

**Schema Settings**

Create a virtual called `reactionCount` that retrieves the length of the thought's `reactions` array field on query

---

**Reaction** (SCHEMA ONLY)

* `reactionId`
    * Use Mongoose's ObjectId data type
    * Default value is set to a new ObjectId

* `reactionBody`
    * String
    * Required
    * 280 character maximum

* `username`
    * String
    * Required

* `createdAt`
    * Date
    * Set default value to the current timestamp
    * Use a getter method to format the timestamp on query

**Schema Settings**

This will not be a model, but rather used as the `reaction` field's subdocument schema in the `Thought` model.

### API Routes

**`/api/users`**

* `GET` all users

* `GET` a single user by its `_id` and populated thought and friend data

* `POST` a new user:

```json
// example data
{
  "username": "lernantino",
  "email": "lernantino@gmail.com"
}
```

* `PUT` to update a user by its `_id`

* `DELETE` to remove user by its `_id`

**BONUS**: Remove a user's associated thoughts when deleted

---

**`/api/users/:userId/friends/:friendId`**

* `POST` to add a new friend to a user's friend list

* `DELETE` to remove a friend from a user's friend list

---

**`/api/thoughts`**

* `GET` to get all thoughts

* `GET` to get a single thought by its `_id`

* `POST` to create a new thought (don't forget to push the created thought's `_id` to the associated user's `thoughts` array field)

```json
// example data
{
  "thoughtText": "Here's a cool thought...",
  "username": "lernantino",
  "userId": "5edff358a0fcb779aa7b118b"
}
```

* `PUT` to update a thought by its `_id`

* `DELETE` to remove a thought by its `_id`

---

**`/api/thoughts/:thoughtId/reactions`**

* `POST` to create a reaction stored in a single thought's `reactions` array field

* `DELETE` to pull and remove a reaction by the reaction's `reactionId` value

## Walkthrough Video Link:


## Github Repository Link:
https://github.com/rawc72/Challenge_No_18.git

