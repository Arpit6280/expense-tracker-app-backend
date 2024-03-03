const Sequelize = require("sequelize");

const sequelize = require("../database");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  name: Sequelize.TEXT,
  password: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  totalAmount: Sequelize.INTEGER,
  ispremiumuser: Sequelize.BOOLEAN,
});

module.exports = User;
