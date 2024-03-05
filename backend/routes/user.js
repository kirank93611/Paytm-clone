const router = require("express").Router();
const { JWT_SECRET } = require("../config");
const { z } = require("zod");
const { user, accounts } = require("../db/db");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

const signupBody = z.object({
  username: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
});

router.post("/signup", async (req, res) => {
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email is already registered / Incorrect Inputs",
    });
  }
  const existingUser = await user.findOne({
    username: req.body.username,
  });

  if (existingUser) {
    return res.status(411).json({
      message: "user already exists",
    });
  }

  const users = await user.create({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
  });

  const user_id = users._id;
  ///--- Create new Accounts
  await accounts.create({
    userId: user_id,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign({ user_id }, JWT_SECRET);

  res.status(200).json({ message: "User created Successfully", token: token });
});

///--- ---

const signinBody = z.object({
  username: z.string().email(),
  password: z.string(),
});

router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "incorrect inputs",
    });
  }
  const user = await user.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );
    res.json({
      token: token,
    });

    return;
  }
  res.status(411).json({
    message: "please check your login credentials!, Error while logging in",
  });
});

const udpateBody = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
  const { success } = udpateBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      msg: "Error while updating information",
    });
  }
  await user.updateOne({ _id: req.userId }, req.body);
  res.json({
    message: "Updated succesfully",
  });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await user.find({
    $or: [
      {
        firstName: {
          regex: filter,
        },
      },
      {
        lastName: {
          regex: filter,
        },
      },
    ],
  });
  res.json({
    user: users.map((user) => {
      username: user.username;
      firstName: user.firstName;
      lastName: user.lastName;
      _id: user._id;
    }),
  });
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  session.startTransaction();

  const { amount, to } = req.body;
  //fetching the accounts within transactions
  const account = await accounts
    .findOne({
      userId: req.body.userId,
    })
    .session(session);

  if (!account || account.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "insufficient balance",
    });
  }
  const toAccount = await accounts
    .findOne({ userId: req.body.userId })
    .session(session);

  if (!toAccount) {
    return res.res.status(400).json({
      message: "invalid account",
    });
  }

  //if everything goes well perform the transfer
  await account
    .updateOne({ userId: req.userId }, { $inc: { balance: -amount } })
    .session(session);
  await account
    .updateOne({ userId: to }, { $inc: { balance: amount } })
    .session(session);

  //Commit transaction
  await session.commitTransaction();
  res.json({
    message: "Transfer Successful",
  });
});

async function transfer(req) {
  const session = await mongoose.startSession();

  session.startTransaction();
  const { amount, to } = req.body;

  // Fetch the accounts within the transaction
  const account = await Account.findOne({ userId: req.userId }).session(
    session
  );

  if (!account || account.balance < amount) {
    await session.abortTransaction();
    console.log("Insufficient balance");
    return;
  }

  const toAccount = await Account.findOne({ userId: to }).session(session);

  if (!toAccount) {
    await session.abortTransaction();
    console.log("Invalid account");
    return;
  }

  // Perform the transfer
  await Account.updateOne(
    { userId: req.userId },
    { $inc: { balance: -amount } }
  ).session(session);
  await Account.updateOne(
    { userId: to },
    { $inc: { balance: amount } }
  ).session(session);

  // Commit the transaction
  await session.commitTransaction();
  console.log("done");
}

async function transfer(req) {
  const session = await mongoose.startSession();

  session.startTransaction();
  const { amount, to } = req.body;

  // Fetch the accounts within the transaction
  const account = await accounts
    .findOne({ userId: req.userId })
    .session(session);

  if (!account || account.balance < amount) {
    await session.abortTransaction();
    console.log("Insufficient balance");
    return;
  }

  const toAccount = await Account.findOne({ userId: to }).session(session);

  if (!toAccount) {
    await session.abortTransaction();
    console.log("Invalid account");
    return;
  }

  // Perform the transfer
  await accounts
    .updateOne({ userId: req.userId }, { $inc: { balance: -amount } })
    .session(session);
  await accounts
    .updateOne({ userId: to }, { $inc: { balance: amount } })
    .session(session);

  // Commit the transaction
  await session.commitTransaction();
  console.log("done");
}
module.exports = router;
