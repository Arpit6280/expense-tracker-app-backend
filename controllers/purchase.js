const Razorpay = require("razorpay");
const Order = require("../model/Order");
require("dotenv").config();

exports.purchasePremium = (req, res, next) => {
  try {
    var rzp = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });
    const amount = 2500;
    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        console.log("rrrrrrrrrrr", err);
        throw new Error(JSON.stringify(err));
      }
      req.user
        .createOrder({ orderid: order.id, status: "PENDING" })
        .then(() => {
          return res.status(201).json({ order, key_id: rzp.key_id });
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
  } catch (err) {
    console.log("eeee", err);
    res.status(403).json({ message: "Something went wrong", error: err });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;
    const order = await Order.findOne({ where: { orderid: order_id } }); //2sec

    const promise1 = await order.update({
      paymentid: payment_id,
      status: "SUCCESSFUL",
    }); //3sec
    const promise2 = await req.user.update({ ispremiumuser: true }); //4sec
    Promise.all([promise1, promise2])
      .then(() => {
        return res
          .status(202)
          .json({ success: true, message: "Transaction successfull" });
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    console.log(err);
    res.status(403).json({ error: err, message: "Something went wrong" });
  }
};
