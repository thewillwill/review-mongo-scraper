var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Set Handlebars
// =============================================================
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "base" }));
app.set("view engine", "handlebars");

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient: true
});

// Routes

app.get("/", function(req, res) {
    res.render("pages/index", { title: "Review Responder" });
});


// A GET route for scraping the echojs website
app.get("/api/scrape", function(req, res) {
    const URL = "https://www.tripadvisor.com/Hotel_Review-g32066-d76013-Reviews-Hotel_Shattuck_Plaza-Berkeley_California.html"
    // First, we grab the body of the html with request
    axios.get(URL).then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        var count = 0;
        // Now, we grab every h2 within an article tag, and do the following:
        $("div.wrap").each(function(i, element) {
            // Save an empty result object
            var result = {};

            var link = $(element).children(".quote").children("a").attr("href");
            var title = $(element).children(".quote").children("a").children("span").text();
            var review = $(element).children(".prw_reviews_text_summary_hsx").children(".entry").children(".partial_entry").text();


            if (title && link && review) {
              count ++;
                // Add the text and href of every link, and save them as properties of the result object
                result.link = link;
                result.title = title;                  
                result.review = review;

                // Create a new Review using the `result` object built from scraping
                db.Review
                    .create(result)
                    .then(function(dbReview) {

                        // If we were able to successfully scrape and save an Article, send a message to the client
                        res.send("Scrape Complete, found " + count + " reviews");
                    })
                    .catch(function(err) {
                        // If an error occurred, send it to the client
                        res.json(err);
                    });
            }

        });
    });
});

// Route for getting all Articles from the db
app.get("/api/reviews", function(req, res) {
    const saved = req.query.saved || false;
    // Grab every document in the Articles collection
    db.Review
        .find({ saved: saved })
        .then(function(dbReview) {
            // If we were able to successfully find Reviews, send them back to the client
            res.json(dbReview);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


// Route for updating a Review as 'saved'
app.post("/api/reviews/:id", function(req, res) {
    // Create a new response and pass the req.body to the entry
    db.Review.findByIdAndUpdate(req.params.id, { $set: { saved: req.body.saved } }, { new: true }, function(err, dbReview) {
        if (err) return handleError(err);
        res.send(dbReview);
    });
});


// Route for grabbing a specific Review by id, populate it with it's response
app.get("/api/reviews/response/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    console.log('req.params.id');
    db.Review
        .findOne({ _id: req.params.id })
        // ..and populate all of the responses associated with it
        .populate("response")
        .then(function(dbReview) {
            // If we were able to successfully find an Review with the given id, send it back to the client
            res.json(dbReview);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Review's associated Response
app.post("/api/reviews/response/:id", function(req, res) {
    // Create a new response and pass the req.body to the entry
    db.Response
        .create(req.body)
        .then(function(dbResponse) {
            // If a Response was created successfully, find one Review with an `_id` equal to `req.params.id`. Update the Review to be associated with the new Response
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Review.findOneAndUpdate({ _id: req.params.id }, { response: dbResponse._id }, { new: true });
        })
        .then(function(dbReview) {
            // If we were able to successfully update an Review, send it back to the client
            res.json(dbReview);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});