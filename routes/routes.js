// npm dependencies
var request = require("request"); // for scraping
var cheerio = require("cheerio"); // for scraping
var mongoose = require("mongoose"); // for database

// mongoose models
var Article = require("../models/article.js");
var Comment = require("../models/comment.js");

// =============================================================
// Routes
// =============================================================
module.exports = function(app) {

//(Route) Main route - show the home page
	app.get("/", function(req, res) {
	  res.render("index");
	});

//(Route) Scrapes the current articles from the site and displays the current article list
	app.get("/articles/new", function(req, res) {

		scrapeSalonArticles().then(articles => {

	    console.log(articles);

	    // send a page of scraped articles to the browser
	    res.render("newarticles", { articles: articles });

	  });

	});

//(Route) here is where we actually save articles to the database
	app.post("/articles/new", function (req, res) {

	  // as a convenience, we allow the user to add an initial comment when they save
	  // an article to the database, but we don't want to change the route when we do that
	  // so we have to check the request body to see whether the POST is to add an article
	  // or to add a comment to that article
	  if (req.body.type == "Article") {

	    console.log("title is: " + req.body.title);
	    console.log("link is: " + req.body.link);

	    // create a new mongoose Article and save it to the database
	    addArticleToDb(req.body.title, req.body.link).then(article => {
	    	console.log(article);
	    	// return the saved article info to the browser
	    	res.json({
	    		title: article.title,
	    		link: article.link,
	    		_id: article._id
	    	});
	    });

	  // this is where we save an optional comment to an article during its initial save sequence
	  } else {

	    console.log("comment is: " + req.body.comment);
	    console.log("articleId is: " + req.body.articleId);

		  // create the new mongoose Comment and save it to the database
		  addCommentToDb(req.body.comment, req.body.articleId).then(comment => {
			// return the saved comment to the browser
			res.json({ 
			  comment: comment.comment,
			  articleId: comment.articleId,
			  _id: comment._id
			});
		  });
	  }
	});

//(Route) here is where we display the page of articles saved in the database
	app.get("/articles/saved", function(req, res) {

	  // get all the articles in the database
	  getAllArticles().then(found => {

	  	// send the saved article list to the browser
	  	res.render("savedarticles", { articles: found });

	  });

	});

//(Route) this is where we add new comments to previously saved articles
	app.post("/articles/saved", function (req, res) {

	  console.log("comment is: " + req.body.comment);
	  console.log("articleId is: " + req.body.articleId);

	  // create the new mongoose Comment and save it to the database
	  addCommentToDb(req.body.comment, req.body.articleId).then(comment => {
		// return the saved comment to the browser
		res.json({ 
		  comment: comment.comment,
		  articleId: comment.articleId,
		  _id: comment._id
		});
	  });

	});

//(Route) here is where we delete articles from the database
	app.delete("/articles/saved/:articleId", function(req, res) {

	  console.log(`articleId to delete is ${req.params.articleId}`);

	  // delete the article from the db; referencing comments will be removed also
	  delArticleFromDb(req.params.articleId).then(() => {
	      console.log(`articleId ${req.params.articleId} was deleted`);
	      res.end(); // nothing returned to browser for this operation
	  });
	});

//(Route) here is where we display the page of all comments for the specified article
	app.get("/articles/saved/comments/:articleId", function(req, res) {

	  console.log(`articleId is ${req.params.articleId}`);

	  // get the article with the specified id and populate it with all of the comments
	  // which have been added to it
	  getArticle(req.params.articleId).then(doc => {

	      console.log(doc);

	      // send the requested article info back to the browser
	      res.render("commentlist", { article: doc });

	  });

	});

//(Route) this is where we add new comments to previously saved articles
	app.post("/articles/saved/comments", function (req, res) {

	  console.log("comment is: " + req.body.comment);
	  console.log("articleId is: " + req.body.articleId);

	  // create the new mongoose Comment and save it to the database
	  addCommentToDb(req.body.comment, req.body.articleId).then(comment => {
		// return the saved comment to the browser
		res.json({ 
		  comment: comment.comment,
		  articleId: comment.articleId,
		  _id: comment._id
		});
	  });

	});

//(Route) this is where we update existing comments
	app.put("/articles/saved/comments", function (req, res) {

	  console.log("comment is: " + req.body.comment);
	  console.log("commentId is: " + req.body.commentId);

	  // create the new mongoose Comment and save it to the database
	  editCommentInDb(req.body.comment, req.body.commentId).then(comment => {
		// return updated comment to the browser
		res.json({ 
		  comment: comment.comment,
		  articleId: comment.articleId,
		  _id: comment._id
		});
	  });

	});

//(Route) here is where we delete comments from the database
	app.delete("/articles/saved/comments/delete/:commentId", function(req, res) {

	  console.log(`commentId to delete is ${req.params.commentId}`);

	  // delete the comment from the db; reference in article will be removed also
	  delCommentFromDb(req.params.commentId).then(() => {
	      console.log(`commentId ${req.params.commentId} was deleted`);
	      res.end(); // nothing returned to browser for this operation
	  });
	});

};
// =============================================================
// End of Routes
// =============================================================

// get all Articles from the database; they are not populated
function getAllArticles() {

	return new Promise((resolve, reject) => {

	  // get all the articles in the database
	  Article.find({}, (error, found) => {
	    // throw any error
	    if (error) {
	      reject(error);
	    }

	    // return the documents found
	    resolve(found);

		});

	});

}

// get the specified Article from the database; it will be populated
function getArticle(articleId) {

	return new Promise((resolve, reject) => {

	  // get the article with the specified id and populate it with all of the comments
	  // which have been added to it
	  Article.findById(mongoose.Types.ObjectId(articleId))
	    .populate({
	    	path: "comments",
	    	options: { sort: { created: "desc" }}
	    }).exec((error, doc) => {

		    // throw any error
		    if (error) {
		      reject(error);
		    }

		    // return the populated document
		    resolve(doc);

		});

	});

}

// adds a new mongoose Article to the database
function addArticleToDb(title, link) {

	return new Promise((resolve, reject) => {

		// instantiate a new article and save it
		var article = new Article({
		  title: title,
		  link: link
		});
		article.save((error, doc) => {
			// throw any error
			if (error) {
				reject(error);
			}
			// or return the saved article
			resolve(doc);
		});

	});

}

// adds a new mongoose Comment to the database; updates the referenced Article to add a reference to it
// in the Article's comments array
function addCommentToDb(text, articleId) {

	return new Promise((resolve, reject) => {

		// instantiate a new comment and save it
		var comment = new Comment({
		  comment: text,
		  created: Date.now(),
		  articleId: articleId
		});
		comment.save((error, doc) => {
			// throw any error
			if (error) {
				reject(error);
			}
		    // add a foreign key in the article to it's newly created comment
			Article.findByIdAndUpdate(mongoose.Types.ObjectId(articleId),
				{ $push: { comments: doc._id }}, { upsert: true}, (error, count) => {
				// throw any error
				if (error) {
					reject(error);
				}
				console.log(doc);
				// return the saved comment
				resolve(doc);
			});
		});

	});

}

// updates a mongoose Comment with new comment text
function editCommentInDb(text, commentId) {

	return new Promise((resolve, reject) => {

	    // update the comment text in the database
		Comment.findByIdAndUpdate(mongoose.Types.ObjectId(commentId),
			{ $set: { comment: text }}, { new: true}, (error, doc) => {
			// throw any error
			if (error) {
				reject(error);
			}
			console.log(doc);
			// return the updated comment
			resolve(doc);
		});

	});

}

// deletes a mongoose Article from the database; all referenced Comments in the
// Article's comments array are also deleted
function delArticleFromDb(articleId) {

	return new Promise((resolve, reject) => {

    // first remove the comments which reference the specified article
	Comment.remove({ articleId: mongoose.Types.ObjectId(articleId)}, (error) => {
		// throw any error
		if (error) {
			reject(error);
		}
		// now actually remove the article itself from the database
		Article.remove({ _id: mongoose.Types.ObjectId(articleId)}, error => {
			// throw any error
			if (error) {
				reject(error);
			}
			// return success
			resolve(true);
		});
		
	  });

	});

}

// deletes a mongoose Comment from the database; updates the referenced Article to remove it's
// reference from the Article's comments array
function delCommentFromDb(commentId) {

	return new Promise((resolve, reject) => {

	  // get the comment with the specified id and remove it from the comment list of its
	  // referenced article
	  Comment.findById(mongoose.Types.ObjectId(commentId), (error, doc) => {
	    // throw any error
	    if (error) {
	      reject(error);
	    };
	    // update it's referenced article to remove the comment reference
		Article.findByIdAndUpdate(mongoose.Types.ObjectId(doc.articleId),
			{ $pull: { comments: doc._id }}, (error, count) => {
			// throw any error
			if (error) {
				reject(error);
			}
			// now actually remove the comment itself from the database
			Comment.remove({ _id: doc._id}, error => {
				// throw any error
				if (error) {
					reject(error);
				}
				// return success
				resolve(true);
			});
		});
	  });

	});

}

// returns an array of news article objects (not mongoose Article objects!) scraped from
// the www.salon.com site
function scrapeSalonArticles() {

	const urlSalon = "http://www.salon.com/category/news/";
	const clsArticleTop = ".story";
	const tagTitle = "a";
	const attrTitle = "title";
	const tagLink = "a";
	const attrLink = "href";

	return new Promise((resolve, reject) => {

	  // scraped articles will be saved here
	  var articles = [];

	  // scrape the current articles from the Salon site
	  request(urlSalon, (error, response, html) => {

	    // load the html for scraping
	    var $ = cheerio.load(html);

	    console.log("we did actually scrape");

	    // now scrape for the articles
	    $(clsArticleTop).each(function(i, element) {

	    	console.log(`and now we're looking at article candidate ${i}`);

	      // save the info if we think this might be an article
	      var title = $(this).children(tagTitle).attr(attrTitle); // article title
	      var link = $(this).children(tagLink).attr(attrLink); // url to article itself

	      console.log(`title is ${title} and link is ${link}`)

	      // assume a valid article if both title and link exist
	      if (title && link) {

	      	console.log(`article title is ${title}`);

	        // check to see if this article has already been saved in a previous session
	        var saved = false; // this is our flag for indicating previously saved articles
	        Article.findOne({ title: title, link: link }, (error, article) => {

	          // throw any error
	          if (error) {
	            reject(error);
	          }

	            // if we got an article from the query then indicate it has been previously saved
	            saved = article != null;

	            if (saved) console.log(`saved article title is ${title}`);

	            // now create the article (not a Mongoose Article yet!) and save it
	            var newArticle = {
	              title: title,
	              link: link,
	              saved: saved,
	              ndx: articles.length // this will be used on the front end when saving because no _id yet
	            };
	            articles.push(newArticle);

	        });
	      };
	    });

	    // return the array of scraped articles
	    console.log(`articles length is ${articles.length}`);
	    resolve(articles);

	  });

	});

}