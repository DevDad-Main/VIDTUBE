import { body, check } from "express-validator";
import { User } from "../models/user.models.js";

export const registerUserValidation = [
  body("fullname")
    .not()
    .isEmpty()
    .withMessage("Please enter your first and last name.")
    .trim(),
  body("username")
    .not()
    .isEmpty()
    .withMessage("Please enter a username")
    .trim()
    .isLength({ min: 5, max: 8 })
    .custom((value, { req }) => {
      return User.findOne({ username: value }).then((foundUsername) => {
        if (foundUsername) {
          return Promise.reject("Username already exists");
        }
      });
    }),
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((foundEmail) => {
        if (foundEmail) {
          return Promise.reject("Email address already exists");
        }
      });
    })
    .normalizeEmail(),
  body("password").trim().isLength({ min: 5 }),
];
