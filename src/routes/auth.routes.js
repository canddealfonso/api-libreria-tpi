const express = require("express");
const { body } = require("express-validator");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/rateLimit");
const auth = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  [
    body("nombre").trim().notEmpty().withMessage("nombre es obligatorio"),
    body("email").isEmail().withMessage("email inválido").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("password mínimo 6 caracteres"),
    body("role").optional().isIn(["user", "admin"]).withMessage("role inválido")
  ],
  validate,
  auth.register
);

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().withMessage("email inválido").normalizeEmail(),
    body("password").notEmpty().withMessage("password es obligatorio")
  ],
  validate,
  auth.login
);

module.exports = router;
