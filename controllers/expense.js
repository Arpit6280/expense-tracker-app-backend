const e = require("cors");
const sequelize = require("../database");
const Expense = require("../model/Expense");
const User = require("../model/User");
const { Op } = require("sequelize");

exports.getExpenses = (req, res, next) => {
 
  let page = Number(req.query.pages);
  let EXPENSE_PER_PAGE = Number(req.query.expensePerPage);
  console.log(EXPENSE_PER_PAGE);

  let totalExpenses;
  console.log("page", page);
  Expense.count()
    .then((total) => {
      console.log("total", total);
      totalExpenses = total;
      return Expense.findAll({
        where: { userId: req.user.id },
        limit: EXPENSE_PER_PAGE,
        offset: (page - 1) * EXPENSE_PER_PAGE,
      });
    })
    .then((expenses) => {
      let obj = {
        currentPage: page,
        hasNextPage: EXPENSE_PER_PAGE * page < totalExpenses,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(totalExpenses / EXPENSE_PER_PAGE),
        nextPage: Number(page) + 1,
        previousPage: page - 1,
      };
      res.status(200).json({ expenses, pageData: obj });
    })
    .catch((err) => {
      console.log("errrrr", err);
    });
};

exports.addExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    let { description, amount, category, date } = req.body;
    const user = await User.findByPk(req.user.id);
    user.totalAmount = parseInt(user.totalAmount) + parseInt(amount);
    await user.save({ transaction: t });

    let result = await req.user.createExpense(
      {
        description,
        amount,
        category,
        date,
      },
      { transaction: t }
    );
    await t.commit();
    res.status(200).json(result);
  } catch (err) {
    await t.rollback();
    console.log(e);
  }
};

exports.deleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  const expenseId = req.params.expenseId;

  let amount;
  Expense.findAll(
    { where: { id: expenseId, userId: req.user.id } },
    { transaction: t }
  )
    .then((expense) => {
      amount = expense[0].amount;
      expense[0].destroy();
    })
    .then(() => {
      User.findByPk(req.user.id).then(async (user) => {
        user.totalAmount = parseInt(user.totalAmount) - parseInt(amount);
        await user.save({ transaction: t });
        await t.commit();
      });
    })
    .catch(async (e) => {
      await t.rollback();
      console.log(e);
    });
};
