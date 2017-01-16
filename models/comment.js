// Require mongoose
var mongoose = require("mongoose");

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

var Article = require("./article.js");

// make BookSchema a Schema
var CommentSchema = new Schema({
  // author: just a string
  comment: {
    type: String
  },
  created: {
  	type: Date
  },
  // title: just a string
  articleId: {
    type: Schema.Types.ObjectId,
    ref: Article
  }
});

// NOTE: the book's id is stored automatically
// Our Library model will have an array to store these ids

// Create the Book model with the BookSchema
var Comment = mongoose.model("Comment", CommentSchema);

// Export the model so we can use it on our server file.
module.exports = Comment;
