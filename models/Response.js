var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new ResponseSchema object
var ResponseSchema = new Schema({

  text: String,
  name: String,
  position: String


});

// This creates our model from the above schema, using mongoose's model method
var Response = mongoose.model("Response", ResponseSchema);

// Export the Response model
module.exports = Response;
