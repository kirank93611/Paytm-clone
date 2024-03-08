const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");
const { accounts } = require("../db/db");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({});
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    req.userId = decoded.user_id;
    next();
  } catch (err) {
    return res(403).json({});
  }
};

module.exports = {
  authMiddleware,
};
