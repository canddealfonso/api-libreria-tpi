const bcrypt = require("bcrypt");
const User = require("../models/User");
const { parsePagination, parseSort } = require("../utils/pagination");

function sanitizeUser(userDoc) {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.passwordHash;
  return user;
}


async function crearUsuario(req, res, next) {
  try {
    const { nombre, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "El email ya está registrado" });

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const created = await User.create({
      nombre,
      email,
      passwordHash,
      role: role || "user"
    });

    res.status(201).json(sanitizeUser(created));
  } catch (err) {
    next(err);
  }
}

async function obtenerUsuarios(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
    const sort = parseSort(req.query.sort, { defaultSort: { createdAt: -1 } });

    const filter = {};
    if (req.query.q) {
      const q = String(req.query.q);
      filter.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ];
    }

    const [data, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      data: data.map(sanitizeUser),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
}

async function obtenerUsuarioPorId(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const isSelf = user._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isSelf && !isAdmin) return res.status(403).json({ error: "No autorizado" });

    res.json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
}

async function actualizarUsuario(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const isSelf = user._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isSelf && !isAdmin) return res.status(403).json({ error: "No autorizado" });

    const { nombre, email, password, role } = req.body;

    if (nombre != null) user.nombre = nombre;
    if (email != null) user.email = email;

    // Solo admin puede cambiar roles
    if (role != null) {
      if (!isAdmin) return res.status(403).json({ error: "Solo admin puede cambiar roles" });
      user.role = role;
    }

    if (password) {
      const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
      user.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    await user.save();
    res.json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
}

async function eliminarUsuario(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
};
