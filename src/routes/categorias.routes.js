const express = require("express");
const { body, param } = require("express-validator");
const validate = require("../middlewares/validate");
const { authRequired, requireRole } = require("../middlewares/auth");
const categorias = require("../controllers/categorias.controller");

const router = express.Router();

router.get("/", categorias.obtenerCategorias);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  categorias.obtenerCategoriaPorId
);

router.post(
  "/",
  authRequired,
  requireRole("admin"),
  [
    body("nombre").trim().notEmpty().withMessage("nombre es obligatorio"),
    body("descripcion").optional().trim().isLength({ max: 500 }).withMessage("descripcion demasiado larga")
  ],
  validate,
  categorias.crearCategoria
);

router.put(
  "/:id",
  authRequired,
  requireRole("admin"),
  [
    param("id").isMongoId().withMessage("ID inválido"),
    body("nombre").optional().trim().notEmpty(),
    body("descripcion").optional().trim().isLength({ max: 500 })
  ],
  validate,
  categorias.actualizarCategoria
);

router.delete(
  "/:id",
  authRequired,
  requireRole("admin"),
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  categorias.eliminarCategoria
);

module.exports = router;
