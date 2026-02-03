const Categoria = require("../models/Categoria");
const { parsePagination, parseSort } = require("../utils/pagination");

async function crearCategoria(req, res, next) {
  try {
    const created = await Categoria.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function obtenerCategorias(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
    const sort = parseSort(req.query.sort, { defaultSort: { nombre: 1 } });

    const filter = {};
    if (req.query.q) {
      const q = String(req.query.q);
      filter.$or = [
        { nombre: { $regex: q, $options: "i" } },
        { descripcion: { $regex: q, $options: "i" } }
      ];
    }

    const [data, total] = await Promise.all([
      Categoria.find(filter).sort(sort).skip(skip).limit(limit),
      Categoria.countDocuments(filter)
    ]);

    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function obtenerCategoriaPorId(req, res, next) {
  try {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

async function actualizarCategoria(req, res, next) {
  try {
    const categoria = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!categoria) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

async function eliminarCategoria(req, res, next) {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json({ message: "Categoría eliminada" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearCategoria,
  obtenerCategorias,
  obtenerCategoriaPorId,
  actualizarCategoria,
  eliminarCategoria
};
