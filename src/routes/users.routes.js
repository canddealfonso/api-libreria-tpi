const express = require("express");
const { body, param, query } = require("express-validator");
const validate = require("../middlewares/validate");
const { authRequired, requireRole } = require("../middlewares/auth");
const users = require("../controllers/users.controller");

const router = express.Router();

router.use(authRequired);
router.post(
  "/",
  requireRole("admin"),
  [
    body("nombre").trim().notEmpty().withMessage("nombre es obligatorio"),
    body("email").isEmail().withMessage("email inválido").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("password mínimo 6 caracteres"),
    body("role").optional().isIn(["user", "admin"]).withMessage("role inválido")
  ],
  validate,
  users.crearUsuario
);


router.get(
  "/",
  requireRole("admin"),
  [query("q").optional().isString()],
  validate,
  users.obtenerUsuarios
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  users.obtenerUsuarioPorId
);

router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("ID inválido"),
    body("nombre").optional().trim().notEmpty(),
    body("email").optional().isEmail().withMessage("email inválido").normalizeEmail(),
    body("password").optional().isLength({ min: 6 }).withMessage("password mínimo 6 caracteres"),
    body("role").optional().isIn(["user", "admin"]).withMessage("role inválido")
  ],
  validate,
  users.actualizarUsuario
);

router.delete(
  "/:id",
  requireRole("admin"),
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  users.eliminarUsuario
);

module.exports = router;
