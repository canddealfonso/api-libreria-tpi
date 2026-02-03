const Libro = require("../models/Libro");
const { parsePagination, parseSort } = require("../utils/pagination");

async function crearLibro(req, res, next) {
  try {
    const libro = await Libro.create(req.body);
    const populated = await libro.populate([
      { path: "autor", select: "nombre nacionalidad" },
      { path: "categorias", select: "nombre slug" }
    ]);
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

async function obtenerLibros(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
    const sort = parseSort(req.query.sort, { defaultSort: { createdAt: -1 } });

    const filter = {};

    // Búsqueda por texto (título, descripción, ISBN)
    if (req.query.q) {
      const q = String(req.query.q);
      filter.$or = [
        { titulo: { $regex: q, $options: "i" } },
        { descripcion: { $regex: q, $options: "i" } },
        { isbn: { $regex: q, $options: "i" } }
      ];
    }

    // Filtros
    if (req.query.autor) filter.autor = req.query.autor;
    if (req.query.categoria) filter.categorias = req.query.categoria;

    // Rango de años
    if (req.query.anioDesde || req.query.anioHasta) {
      filter.anioPublicacion = {};
      if (req.query.anioDesde) filter.anioPublicacion.$gte = Number(req.query.anioDesde);
      if (req.query.anioHasta) filter.anioPublicacion.$lte = Number(req.query.anioHasta);
    }

    // Disponibilidad
    if (String(req.query.disponibles).toLowerCase() === "true") {
      filter.stockDisponible = { $gt: 0 };
    }

    const [data, total] = await Promise.all([
      Libro.find(filter)
        .populate("autor", "nombre nacionalidad")
        .populate("categorias", "nombre slug")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Libro.countDocuments(filter)
    ]);

    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function obtenerLibroPorId(req, res, next) {
  try {
    const libro = await Libro.findById(req.params.id)
      .populate("autor", "nombre nacionalidad")
      .populate("categorias", "nombre slug");
    if (!libro) return res.status(404).json({ error: "Libro no encontrado" });
    res.json(libro);
  } catch (err) {
    next(err);
  }
}

async function actualizarLibro(req, res, next) {
  try {
    const libro = await Libro.findById(req.params.id);
    if (!libro) return res.status(404).json({ error: "Libro no encontrado" });

    Object.assign(libro, req.body);
    await libro.save();

    const populated = await libro.populate([
      { path: "autor", select: "nombre nacionalidad" },
      { path: "categorias", select: "nombre slug" }
    ]);
    res.json(populated);
  } catch (err) {
    next(err);
  }
}

async function eliminarLibro(req, res, next) {
  try {
    const libro = await Libro.findByIdAndDelete(req.params.id);
    if (!libro) return res.status(404).json({ error: "Libro no encontrado" });
    res.json({ message: "Libro eliminado" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearLibro,
  obtenerLibros,
  obtenerLibroPorId,
  actualizarLibro,
  eliminarLibro
};
