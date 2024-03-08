"use strict";

var express = require("express");

var _require = require("../middleware/authMiddleware"),
    authMiddleware = _require.authMiddleware;

var _require2 = require("../db/db"),
    accounts = _require2.accounts;

var router = express.Router();

var mongoose = require("mongoose");

router.get("/balance", authMiddleware, function _callee(req, res) {
  var account;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(accounts.findOne({
            userId: req.userId
          }));

        case 2:
          account = _context.sent;
          res.status(200).json({
            balance: account.balance
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
});
router.post("/transfer", authMiddleware, function _callee2(req, res) {
  var _req$body, amount, to, session, account, toaccounts;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, amount = _req$body.amount, to = _req$body.to;
          _context2.next = 3;
          return regeneratorRuntime.awrap(mongoose.startSession());

        case 3:
          session = _context2.sent;
          session.startTransaction();
          _context2.next = 7;
          return regeneratorRuntime.awrap(accounts.findOne({
            userId: req.userId
          }));

        case 7:
          account = _context2.sent;

          if (!(!account || account.balance < amount)) {
            _context2.next = 12;
            break;
          }

          _context2.next = 11;
          return regeneratorRuntime.awrap(session.abortTransaction());

        case 11:
          return _context2.abrupt("return", res.status(400).json({
            message: "Insufficient balance "
          }));

        case 12:
          _context2.next = 14;
          return regeneratorRuntime.awrap(accounts.findOne({
            userId: to
          }).session(session));

        case 14:
          toaccounts = _context2.sent;

          if (toaccounts) {
            _context2.next = 17;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: "Invalid accounts"
          }));

        case 17:
          _context2.next = 19;
          return regeneratorRuntime.awrap(accounts.updateOne({
            userId: req.userId
          }, {
            $inc: {
              balance: -amount
            }
          }).session(session));

        case 19:
          _context2.next = 21;
          return regeneratorRuntime.awrap(accounts.updateOne({
            userId: to
          }, {
            $inc: {
              balance: +amount
            }
          }).session(session));

        case 21:
          _context2.next = 23;
          return regeneratorRuntime.awrap(session.commitTransaction());

        case 23:
          return _context2.abrupt("return", res.status(200).json({
            message: "Transfer Successful"
          }));

        case 24:
        case "end":
          return _context2.stop();
      }
    }
  });
});
module.exports = {
  router: router
}; // backend / routes / accounts.js;
// const express = require("express");
// const { authMiddleware } = require("../middleware/authMiddleware");
// const { accounts } = require("../db/db");
// const { default: mongoose } = require("mongoose");
// const router = express.Router();
// router.get("/balance", authMiddleware, async (req, res) => {
//   const account = await accounts.findOne({
//     userId: req.userId,
//   });
//   res.json({
//     balance: account.balance,
//   });
// });
// async function transfer(req) {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   const { amount, to } = req.body;
//   // Fetch the accounts within the transaction
//   const account = await accounts
//     .findOne({ userId: req.userId })
//     .session(session);
//   if (!accounts || accounts.balance < amount) {
//     await session.abortTransaction();
//     console.log("Insufficient balance");
//     return;
//   }
//   const toaccounts = await accounts.findOne({ userId: to }).session(session);
//   if (!toaccounts) {
//     await session.abortTransaction();
//     console.log("Invalid accounts");
//     return;
//   }
//   // Perform the transfer
//   await accounts
//     .updateOne({ userId: req.userId }, { $inc: { balance: -amount } })
//     .session(session);
//   await accounts
//     .updateOne({ userId: to }, { $inc: { balance: amount } })
//     .session(session);
//   // Commit the transaction
//   await session.commitTransaction();
//   console.log("done");
// }
// transfer({
//   userId: "65e773c3b373c569699aff95",
//   body: {
//     to: "65e77481b373c569699aff9c",
//     amount: 100,
//   },
// });
// transfer({
//   userId: "65ac44e10ab2ec750ca666a5",
//   body: {
//     to: "65ac44e40ab2ec750ca666aa",
//     amount: 100,
//   },
// });

module.exports = router;