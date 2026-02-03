const express = require("express");
const { body, param, query } = require("express-validator");
const validate = require("../middlewares/validate");
const { authRequired, requireRole } = require("../middlewares/auth");
const prestamos = require("../controllers/prestamos.controller");

const router = express.Router();

router.use(authRequired);

// Mis préstamos (usuario)
router.get(
  "/mis",
  [
    query("estado").optional().isIn(["activo", "devuelto", "vencido"]).withMessage("estado inválido")
  ],
  validate,
  prestamos.obtenerMisPrestamos
);

// Admin: listado global
router.get(
  "/",
  requireRole("admin"),
  [
    query("estado").optional().isIn(["activo", "devuelto", "vencido"]).withMessage("estado inválido"),
    query("usuario").optional().isMongoId().withMessage("usuario inválido"),
    query("libro").optional().isMongoId().withMessage("libro inválido")
  ],
  validate,
  prestamos.obtenerPrestamos
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  prestamos.obtenerPrestamoPorId
);

router.post(
  "/",
  [
    body("libro").isMongoId().withMessage("libro debe ser un ID válido"),
    body("fechaVencimiento").optional().isISO8601().withMessage("fechaVencimiento inválida")
  ],
  validate,
  prestamos.crearPrestamo
);

router.put(
  "/:id",
  requireRole("admin"),
  [
    param("id").isMongoId().withMessage("ID inválido"),
    body("estado").optional().isIn(["activo", "devuelto", "vencido"]).withMessage("estado inválido"),
    body("fechaVencimiento").optional().isISO8601().withMessage("fechaVencimiento inválida")
  ],
  validate,
  prestamos.actualizarPrestamo
);

router.patch(
  "/:id/devolver",
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  prestamos.devolverPrestamo
);

router.delete(
  "/:id",
  requireRole("admin"),
  [param("id").isMongoId().withMessage("ID inválido")],
  validate,
  prestamos.eliminarPrestamo
);

module.exports = router;
