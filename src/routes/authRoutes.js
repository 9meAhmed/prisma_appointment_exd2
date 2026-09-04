const express = require("express");
const authController = require('../controllers/authController');
const router = express.Router();
const authorize = require('../middlewares/authorize');
const validate = require("../middlewares/validate");
const { signupSchema } = require("../validations/signupValidation");
const { loginSchema } = require("../validations/loginValidation");

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.get("/user-info", authorize(), authController.userProfile);
router.post("/refresh-token", authController.refreshToken);
router.post("/forget-password", authController.forgetPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authorize(), authController.logout);


module.exports = router;