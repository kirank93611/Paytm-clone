"use strict";

// backend/db.js
var mongoose = require("mongoose"); // mongoose.connect("mongodb://localhost:27017/paytm");


mongoose.connect("mongodb://localhost:27000?replicaSet=rs"); // Create a Schema for Users

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  }
});
var accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    //reference to user mode
    ref: "user",
    required: true
  },
  balance: {
    type: Number,
    required: true
  }
}); // Create a model from the schema

var user = mongoose.model("user", userSchema);
var accounts = mongoose.model("accounts", accountSchema);
module.exports = {
  user: user,
  accounts: accounts
};