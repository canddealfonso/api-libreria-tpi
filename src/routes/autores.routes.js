const express = require("express");
const { body, param, query } = require("express-validator");
const validate = require("../middlewares/validate");
const { authRequired, requireRole } = require("../middlewares/auth");
const autores = require("../controllers/autores.controller");

const router = express.Router();

router.get(
  "/",
  [query("q").optional().isString()],
  validate,
  autores.obtenerAutores
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  autores.obtenerAutorPorId
);

router.post(
  "/",
  authRequired,
  requireRole("admin"),
  [
    body("nombre").trim().notEmpty().withMessage("nombre es obligatorio"),
    body("nacionalidad").optional().trim().isString()
  ],
  validate,
  autores.crearAutor
);

router.put(
  "/:id",
  authRequired,
  requireRole("admin"),
  [
    param("id").isMongoId().withMessage("ID inválido"),
    body("nombre").optional().trim().notEmpty(),
    body("nacionalidad").optional().trim().isString()
  ],
  validate,
  autores.actualizarAutor
);

router.delete(
  "/:id",
  authRequired,
  requireRole("admin"),
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  autores.eliminarAutor
);

module.exports = router;
