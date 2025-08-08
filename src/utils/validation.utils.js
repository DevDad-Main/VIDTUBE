import { body, check } from "express-validator";
import { User } from "../models/user.models.js";

export const registerUserValidation = [
  body("fullname").not().isEmpty().trim(),
  body("username")
    .notEmpty()
    .trim()
    .isLength({ min: 5, max: 8 })
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error("username already exists");
      }
    }),
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email address already exists");
      }
    })
    .normalizeEmail(),
  body("password").notEmpty().trim().isLength({ min: 6 }),
];

export const changePasswordValidation = [
  body("newPassword").notEmpty().trim().isLength({ min: 5 }),
];

export const updateUserDetailsValidation = [
  body("fullname").notEmpty().trim(),
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email address already exists");
      }
    })
    .normalizeEmail(),
  body("username")
    .notEmpty()
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage("Username must be 5-10 characters")
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error("username already exists");
      }
    }),
];
