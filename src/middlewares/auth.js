const jwt = require("jsonwebtoken");

function getSecret() {
  return process.env.JWT_SECRET || "dev-secret";
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Falta token Bearer" });
  }

  try {
    const payload = jwt.verify(token, getSecret());
    req.user = {
      id: payload.sub,
      role: payload.role || "user"
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (req.user.role !== role) return res.status(403).json({ error: "No autorizado" });
    next();
  };
}

module.exports = { authRequired, requireRole };
