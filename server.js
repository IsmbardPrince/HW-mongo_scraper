/* Scraping into DB (18.2.5)
 * ========================== */

// Dependencies
var express = require("express");
//var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
//var request = require("request");
//var cheerio = require("cheerio");
var methodOverride = require('method-override');
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

var Promise = require("bluebird");
mongoose.Promise = Promise;

// Initialize Express
var app = express();
 
// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Static directory
app.use(express.static("./public"));


//Allows the backend to simulate a DELETE and PUT 
app.use(methodOverride('_method'));

// Set Handlebars.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration
var databaseUrl = "mongo_scraper";
var collections = ["articles", "comments"];
mongoose.connect("mongodb://localhost/mongo_scraper");
var db = mongoose.connection;
// Hook mongojs configuration to the db variable
//var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes =============================================================
require("./Routes/routes.js")(app);

//var Article = require("./models/Article.js");
//var Comment = require("./models/Comment.js");


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
