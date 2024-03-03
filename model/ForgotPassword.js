const Sequelize = require("sequelize");

const sequelize = require("../database");

const ForgetPassword = sequelize.define("forgotpassword", {
  id: {
    type: Sequelize.STRING(50),
    allowNull: false,
    primaryKey: true,
  },
  isActive: Sequelize.BOOLEAN,
});

module.exports = ForgetPassword;
