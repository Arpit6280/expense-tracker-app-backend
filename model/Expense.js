const Sequelize = require("sequelize");

const sequelize = require("../database");

const Expense = sequelize.define("expense", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  description: Sequelize.TEXT,
  amount: Sequelize.INTEGER,
  category: Sequelize.TEXT,
  date: Sequelize.DATE,
});

module.exports = Expense;
