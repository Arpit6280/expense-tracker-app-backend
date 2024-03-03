const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.DB,
  process.env.PASSWORD,
  {
    dialect: "mysql",
    host: process.env.DB_HOST,
  }
);

module.exports = sequelize;
