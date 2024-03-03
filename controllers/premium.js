const sequelize = require("../database");
const Expense = require("../model/Expense");
const User = require("../model/User");
const AWS = require("aws-sdk");
const UserServices = require("../services/userservices");
const S3Services = require("../services/S3services");

exports.showLeaderBoard = async (req, res, next) => {
  try {
    const leaderboardofusers = await User.findAll({
      attributes: ["id", "name", "totalAmount"],

      order: [[sequelize.col("totalAmount"), "DESC"]],
    });
    console.log(leaderboardofusers);

    res.status(200).json(leaderboardofusers);
  } catch (err) {
    console.log(err);
  }
};

exports.download = async (req, res, next) => {
  try {
    // const expenses = await req.user.getExpenses();
    const expenses = await UserServices.getExpenses(req);

    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user.id;

    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileURl = await S3Services.uploadToS3(stringifiedExpenses, filename);
    console.log("file", fileURl);
    res.status(201).json({ fileURl, success: true });
  } catch (error) {
    res.status(500).json({ fileURl: "", success: false, err: error });
  }
};
