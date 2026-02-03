function errorHandler(err, req, res, next) {
  console.error(err);

  // Mongoose: ID inválido / cast error
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Parámetro inválido" });
  }

  // Mongoose: validaciones
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({ error: "Validación fallida", details });
  }

  // Mongo: clave duplicada
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return res.status(409).json({
      error: `Valor duplicado en: ${fields.join(", ")}`
    });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Error interno del servidor"
  });
}

module.exports = errorHandler;
