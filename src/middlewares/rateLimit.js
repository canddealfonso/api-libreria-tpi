const rateLimit = require("express-rate-limit");

// Config por defecto: 100 requests cada 15 min (protege todos los endpoints)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas solicitudes. Intenta nuevamente más tarde."
  }
});

// Más estricto para endpoints de auth (previene fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiados intentos de autenticación. Intenta nuevamente más tarde."
  }
});

module.exports = { apiLimiter, authLimiter };
