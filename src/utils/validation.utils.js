import { body, check } from "express-validator";
import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "../constants.js";

export const registerUserValidation = [
  body("fullname").not().isEmpty().trim(),
  body("username")
    .notEmpty()
    .trim()
    .isLength({ min: 5, max: 12 })
    .withMessage("Username is either too short or too long!.")
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
  body("password")
    .notEmpty()
    .isStrongPassword({
      minLength: 6,
      maxLength: 12,
      minUppercase: 1,
      minNumbers: 3,
      minSymbols: 1,
    })
    .trim(),
];

export const changePasswordValidation = [
  body("newPassword")
    .notEmpty()
    .isStrongPassword({
      minLength: 6,
      maxLength: 12,
      minUppercase: 1,
      minNumbers: 3,
      minSymbols: 1,
    })
    .trim()
    .custom(async (value) => {
      const user = await User.findById(req.user?._id, "password");
      const passwordsMatch = await bcrypt.compare(value, user.password);
      if (passwordsMatch) {
        throw new Error("New Password cannot be same as old password");
      }
    }),
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
  // body("username")
  //   .notEmpty()
  //   .trim()
  //   .isLength({ min: 5, max: 10 })
  //   .withMessage("Username must be 5-10 characters")
  //   .custom(async (value) => {
  //     const user = await User.findOne({ username: value });
  //     if (user) {
  //       throw new Error("username already exists");
  //     }
  //   }),
];

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
