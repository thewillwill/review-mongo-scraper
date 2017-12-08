var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ReviewSchema = new Schema({
  // `title` is required and of type String
  title: {
    type: String,
    required: true,
    unique: true
  },
  // `link` is required and of type String
  review: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  saved: {
    type: Boolean,
    default: false
  },
  // `response` is an object that stores a Response id
  // The ref property links the ObjectId to the Response model
  // This allows us to populate the Article with an associated Response
  response: {
    type: Schema.Types.ObjectId,
    ref: "Response"
  }

});

// This creates our model from the above schema, using mongoose's model method
var Review = mongoose.model("Review", ReviewSchema);

// Export the Review model
module.exports = Review;
