const sequelize = require("../database");
const Sib = require("sib-api-v3-sdk");
const User = require("../model/User");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ForgetPassword = require("../model/ForgotPassword");
require("dotenv").config();

const client = Sib.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();
const sender = {
  email: "arpitsinghyadav19@gmail.com",
  name: "Arpit Singh Yadav",
};

exports.forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    let userId;
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      const id = uuid.v4();
      user.createForgotpassword({ id, isActive: true }).catch((err) => {
        throw new Error(err);
      });
      const receivers = [
        {
          email: email,
        },
      ];

      tranEmailApi
        .sendTransacEmail({
          sender,
          to: receivers,
          subject: "Subscribe to my channel",
          textContent: `Expense app {{params.role}}`,
          htmlContent: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
          params: {
            role: "Frontend",
          },
        })
        .then(console.log("mail done"))
        .catch((err) => {
          console.log("errrroooooorrrrr", err);
        });
    } else {
      throw new Error("User doesnt exist");
    }
  } catch (err) {
    console.log("error", err);
  }
};

exports.resetPassword = (req, res, next) => {
  let id = req.params.id;
  ForgetPassword.findOne({ where: { id: id } }).then((frgtPswdreq) => {
    if (frgtPswdreq) {
      console.log("frgtPswdreq", frgtPswdreq.isActive);
      frgtPswdreq.isActive = true;
      frgtPswdreq.save();
    }
  });
};

exports.updatePassword = (req, res, next) => {
  try {
    const { newpassword } = req.body;
    const { resetpasswordid } = req.params;
    ForgetPassword.findOne({ where: { id: resetpasswordid } }).then(
      (resetpasswordrequest) => {
        User.findOne({ where: { id: resetpasswordrequest.userId } }).then(
          (user) => {
            // console.log('userDetails', user)
            if (user) {
              //encrypt the password

              const saltRounds = 10;
              bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) {
                  console.log(err);
                  throw new Error(err);
                }
                bcrypt.hash(newpassword, salt, function (err, hash) {
                  // Store hash in your password DB.
                  if (err) {
                    console.log(err);
                    throw new Error(err);
                  }
                  user.update({ password: hash }).then(() => {
                    res
                      .status(201)
                      .json({ message: "Successfuly update the new password" });
                  });
                });
              });
            } else {
              return res
                .status(404)
                .json({ error: "No user Exists", success: false });
            }
          }
        );
      }
    );
  } catch (error) {
    console.log("eeefff", error);
    return res.status(403).json({ error, success: false });
  }
};
