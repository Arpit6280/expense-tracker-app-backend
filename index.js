const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sequelize = require("./database");
const User = require("./model/User");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const userRoutes = require("./controllers/user");
const purchaseRoutes = require("./controllers/purchase");
const expenseRoutes = require("./controllers/expense");
const premiumRoutes = require("./controllers/premium");
const forgetPasswordRoutes = require("./controllers/forgetPassword");
const Expense = require("./model/Expense");
const { authenticate } = require("./middleware/auth");
const Order = require("./model/Order");
const ForgetPassword = require("./model/ForgotPassword");

const app = express();
app.use(cors());

app.use(bodyParser.json());

app.use(helmet());

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flag: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));

app.post("/signup", userRoutes.signUpUser);

app.post("/login", userRoutes.loginUser);

app.get("/user/premium", authenticate, userRoutes.isPremium);

app.post("/expense/addexpenses", authenticate, expenseRoutes.addExpense);

app.get("/expense/getexpenses", authenticate, expenseRoutes.getExpenses);

app.delete(
  "/expense/delete/:expenseId",
  authenticate,
  expenseRoutes.deleteExpense
);

app.get(
  "/purchase/premiummember",
  authenticate,
  purchaseRoutes.purchasePremium
);

app.post(
  "/purchase/updatetransactionstatus",
  authenticate,
  purchaseRoutes.updateTransactionStatus
);

app.get(
  "/premium/showleaderboard",
  authenticate,
  premiumRoutes.showLeaderBoard
);

app.post("/password/forgotpassword", forgetPasswordRoutes.forgetPassword);

app.use("/password/resetpassword/:id", forgetPasswordRoutes.resetPassword);

app.post(
  "/password/updatepassword/:resetpasswordid",
  forgetPasswordRoutes.updatePassword
);

app.get("/premium/download", authenticate, premiumRoutes.download);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgetPassword);
ForgetPassword.belongsTo(User);

sequelize
  .sync()
  .then((result) => {
    app.listen(process.env.PORT || 4000);
  })
  .catch((err) => {
    console.log(err);
  });
