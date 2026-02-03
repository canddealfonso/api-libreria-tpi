const Autor = require("../models/Autor");
const { parsePagination, parseSort } = require("../utils/pagination");

async function crearAutor(req, res, next) {
  try {
    const autor = await Autor.create(req.body);
    res.status(201).json(autor);
  } catch (err) {
    next(err);
  }
}

async function obtenerAutores(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
    const sort = parseSort(req.query.sort, { defaultSort: { nombre: 1 } });

    const filter = {};
    if (req.query.q) {
      const q = String(req.query.q);
      filter.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { nacionalidad: { $regex: q, $options: "i" } }
      ];
    }

    const [data, total] = await Promise.all([
      Autor.find(filter).sort(sort).skip(skip).limit(limit),
      Autor.countDocuments(filter)
    ]);

    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function obtenerAutorPorId(req, res, next) {
  try {
    const autor = await Autor.findById(req.params.id);
    if (!autor) return res.status(404).json({ error: "Autor no encontrado" });
    res.json(autor);
  } catch (err) {
    next(err);
  }
}

async function actualizarAutor(req, res, next) {
  try {
    const autor = await Autor.findById(req.params.id);
    if (!autor) return res.status(404).json({ error: "Autor no encontrado" });

    Object.assign(autor, req.body);
    await autor.save();

    res.json(autor);
  } catch (err) {
    next(err);
  }
}

async function eliminarAutor(req, res, next) {
  try {
    const autor = await Autor.findByIdAndDelete(req.params.id);
    if (!autor) return res.status(404).json({ error: "Autor no encontrado" });
    res.json({ message: "Autor eliminado" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearAutor,
  obtenerAutores,
  obtenerAutorPorId,
  actualizarAutor,
  eliminarAutor
};
