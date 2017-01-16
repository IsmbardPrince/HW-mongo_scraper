// Require mongoose
var mongoose = require("mongoose");

// Create a Schema class with mongoose
var Schema = mongoose.Schema;

var Comment = require("./comment.js");

// make BookSchema a Schema
var ArticleSchema = new Schema({
  // author: just a string
  title: {
    type: String
  },
  // title: just a string
  link: {
    type: String
  },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

// NOTE: the book's id is stored automatically
// Our Library model will have an array to store these ids

// Create the Book model with the BookSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model so we can use it on our server file.
module.exports = Article;
