const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { accounts } = require("../db/db");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/balance", authMiddleware, async (req, res) => {
  const account = await accounts.findOne({
    userId: req.userId,
  });
  res.status(200).json({ balance: account.balance });
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const { amount, to } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  const account = await accounts.findOne({ userId: req.userId });
  if (!account || account.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Insufficient balance ",
    });
  }

  const toaccounts = await accounts.findOne({ userId: to }).session(session);
  if (!toaccounts) {
    return res.status(400).json({
      message: "Invalid accounts",
    });
  }

  //now the acutal transfer takes place
  await accounts
    .updateOne({ userId: req.userId }, { $inc: { balance: -amount } })
    .session(session);
  await accounts
    .updateOne({ userId: to }, { $inc: { balance: +amount } })
    .session(session);

  //committing transaction
  await session.commitTransaction();
  return res.status(200).json({
    message: "Transfer Successful",
  });
});

module.exports = { router };

// backend / routes / accounts.js;
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
