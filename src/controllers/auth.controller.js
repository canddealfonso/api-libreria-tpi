const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getSecret() {
  return process.env.JWT_SECRET || "dev-secret";
}

function signToken(user) {
  return jwt.sign(
    { role: user.role },
    getSecret(),
    {
      subject: user._id.toString(),
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
}

function sanitizeUser(userDoc) {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.passwordHash;
  return user;
}

async function register(req, res, next) {
  try {
    const { nombre, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "El email ya está registrado" });

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Por seguridad, solo permitimos registrar admin si está habilitado explícitamente en .env
    const allowAdmin = String(process.env.ALLOW_ADMIN_REGISTRATION || "").toLowerCase() === "true";
    const finalRole = allowAdmin && role === "admin" ? "admin" : "user";

    const created = await User.create({ nombre, email, passwordHash, role: finalRole });
    const token = signToken(created);

    res.status(201).json({ token, user: sanitizeUser(created) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
