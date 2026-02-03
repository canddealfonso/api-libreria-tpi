const express = require("express");
const { body, param, query } = require("express-validator");
const validate = require("../middlewares/validate");
const { authRequired, requireRole } = require("../middlewares/auth");
const libros = require("../controllers/libros.controller");

const router = express.Router();

router.get(
  "/",
  [
    query("q").optional().isString(),
    query("autor").optional().isMongoId(),
    query("categoria").optional().isMongoId(),
    query("anioDesde").optional().isInt({ min: 0 }),
    query("anioHasta").optional().isInt({ min: 0 }),
    query("disponibles").optional().isBoolean().toBoolean()
  ],
  validate,
  libros.obtenerLibros
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  libros.obtenerLibroPorId
);

router.post(
  "/",
  authRequired,
  requireRole("admin"),
  [
    body("titulo").trim().notEmpty().withMessage("titulo es obligatorio"),
    body("descripcion").optional().trim().isLength({ max: 2000 }).withMessage("descripcion demasiado larga"),
    body("isbn").optional().trim().isLength({ min: 8, max: 20 }).withMessage("isbn inválido"),
    body("anioPublicacion").optional().isInt({ min: 0 }).withMessage("anioPublicacion inválido"),
    body("autor").isMongoId().withMessage("autor debe ser un ID válido"),
    body("categorias").optional().isArray().withMessage("categorias debe ser un array"),
    body("categorias.*").optional().isMongoId().withMessage("categoria inválida"),
    body("stockTotal").optional().isInt({ min: 0 }).withMessage("stockTotal inválido"),
    body("stockDisponible").optional().isInt({ min: 0 }).withMessage("stockDisponible inválido")
  ],
  validate,
  libros.crearLibro
);

router.put(
  "/:id",
  authRequired,
  requireRole("admin"),
  [
    param("id").isMongoId().withMessage("ID inválido"),
    body("titulo").optional().trim().notEmpty(),
    body("descripcion").optional().trim().isLength({ max: 2000 }),
    body("isbn").optional().trim().isLength({ min: 8, max: 20 }),
    body("anioPublicacion").optional().isInt({ min: 0 }),
    body("autor").optional().isMongoId(),
    body("categorias").optional().isArray(),
    body("categorias.*").optional().isMongoId(),
    body("stockTotal").optional().isInt({ min: 0 }),
    body("stockDisponible").optional().isInt({ min: 0 })
  ],
  validate,
  libros.actualizarLibro
);

router.delete(
  "/:id",
  authRequired,
  requireRole("admin"),
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  libros.eliminarLibro
);

module.exports = router;
