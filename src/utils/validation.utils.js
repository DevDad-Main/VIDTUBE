import { body } from "express-validator";
import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";

//#region Regex Check
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//#endregion

//#region Register User Validation
export const registerUserValidation = [
  body("fullname").not().isEmpty().withMessage("Full name is required.").trim(),

  body("username")
    .notEmpty()
    .withMessage("Username is required.")
    .trim()
    .isLength({ min: 5, max: 12 })
    .withMessage("Username must be between 5 and 12 characters.")
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error("Username already exists.");
      }
    }),

  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email address already exists.");
      }
    })
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isStrongPassword({
      minLength: 6,
      maxLength: 12,
      minUppercase: 1,
      minNumbers: 3,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be 6–12 characters and include at least 1 uppercase, 3 numbers, and 1 symbol.",
    )
    .trim(),
];
//#endregion

//#region Change Password Validation
export const changePasswordValidation = [
  body("password")
    .notEmpty()
    .withMessage(
      "Old Password field can't be empty and must match existing password!.",
    ),
  body("newPassword")
    .notEmpty()
    .isStrongPassword({
      minLength: 6,
      maxLength: 12,
      minUppercase: 1,
      minNumbers: 3,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be 6–12 characters and include at least 1 uppercase, 3 numbers, and 1 symbol.",
    )
    .trim()
    .custom(async (value, { req }) => {
      const user = await User.findById(req.user?._id, "password");
      const passwordsMatch = await bcrypt.compare(value, user.password);
      if (passwordsMatch) {
        throw new Error("New Password cannot be same as old password");
      }
    }),
];
//#endregion

//#region Update User Details Validation
export const updateUserDetailsValidation = [
  body("fullname")
    .notEmpty()
    .trim()
    .withMessage("Fullname field can't be empty!"),
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });
      const loggedInUser = await User.findById(req.user?._id);

      if (loggedInUser && loggedInUser.email === value) {
        throw new Error("You're already using this email address");
      }
      if (user) {
        throw new Error("Email address already exists");
      }
    })
    .normalizeEmail(),
];
//#endregion

//#region Login User Validation
export const loginUserValidation = [
  body("username")
    .notEmpty()
    .withMessage("Username field can't be empty!.")
    .bail()
    .custom(async (value) => {
      const userToFind = await User.findOne({ username: value });
      if (!userToFind) {
        throw new Error("User Not Found!.");
      }
    })
    .trim(),
  body("password").notEmpty().withMessage("Password field can't be empty!."),
];
//#endregion
