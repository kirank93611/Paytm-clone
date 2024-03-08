"use strict";

var _require = require("../config"),
    JWT_SECRET = _require.JWT_SECRET;

var jwt = require("jsonwebtoken");

var _require2 = require("../db/db"),
    accounts = _require2.accounts;

var authMiddleware = function authMiddleware(req, res, next) {
  var authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({});
  }

  var token = authHeader.split(" ")[1];

  try {
    var decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    req.userId = decoded.user_id;
    next();
  } catch (err) {
    return res(403).json({});
  }
};

module.exports = {
  authMiddleware: authMiddleware
};