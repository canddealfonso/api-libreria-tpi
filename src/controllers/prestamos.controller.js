const Prestamo = require("../models/Prestamo");
const Libro = require("../models/Libro");
const { parsePagination, parseSort } = require("../utils/pagination");

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function crearPrestamo(req, res, next) {
  try {
    const usuario = req.user.id;
    const { libro: libroId } = req.body;

    // Decremento atómico de stock disponible
    const libro = await Libro.findOneAndUpdate(
      { _id: libroId, stockDisponible: { $gt: 0 } },
      { $inc: { stockDisponible: -1 } },
      { new: true }
    );

    if (!libro) {
      return res.status(400).json({ error: "Libro inexistente o sin stock disponible" });
    }

    const dias = Number(process.env.LOAN_DAYS || 14);
    const fechaVencimiento = req.body.fechaVencimiento ? new Date(req.body.fechaVencimiento) : addDays(new Date(), dias);

    try {
      const created = await Prestamo.create({
        usuario,
        libro: libroId,
        fechaVencimiento
      });

      const populated = await created.populate([
        { path: "usuario", select: "nombre email role" },
        { path: "libro", select: "titulo autor categorias", populate: [{ path: "autor", select: "nombre" }, { path: "categorias", select: "nombre" }] }
      ]);

      res.status(201).json(populated);
    } catch (err) {
      // Revertir stock si falla la creación del préstamo
      await Libro.findByIdAndUpdate(libroId, { $inc: { stockDisponible: 1 } });
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

async function obtenerMisPrestamos(req, res, next) {
  try {
    const usuario = req.user.id;
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
    const sort = parseSort(req.query.sort, { defaultSort: { createdAt: -1 } });

    const filter = { usuario };
    if (req.query.estado) filter.estado = req.query.estado;

    const [data, total] = await Promise.all([
      Prestamo.find(filter)
        .populate({ path: "libro", select: "titulo autor", populate: { path: "autor", select: "nombre" } })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Prestamo.countDocuments(filter)
    ]);

    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function obtenerPrestamos(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
    const sort = parseSort(req.query.sort, { defaultSort: { createdAt: -1 } });

    const filter = {};
    if (req.query.estado) filter.estado = req.query.estado;
    if (req.query.usuario) filter.usuario = req.query.usuario;
    if (req.query.libro) filter.libro = req.query.libro;

    const [data, total] = await Promise.all([
      Prestamo.find(filter)
        .populate({ path: "usuario", select: "nombre email role" })
        .populate({ path: "libro", select: "titulo autor", populate: { path: "autor", select: "nombre" } })
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Prestamo.countDocuments(filter)
    ]);

    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function obtenerPrestamoPorId(req, res, next) {
  try {
    const prestamo = await Prestamo.findById(req.params.id)
      .populate({ path: "usuario", select: "nombre email role" })
      .populate({ path: "libro", select: "titulo autor", populate: { path: "autor", select: "nombre" } });

    if (!prestamo) return res.status(404).json({ error: "Préstamo no encontrado" });

    // Owner o admin
    const isOwner = prestamo.usuario && prestamo.usuario._id && prestamo.usuario._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "No autorizado" });

    res.json(prestamo);
  } catch (err) {
    next(err);
  }
}

async function actualizarPrestamo(req, res, next) {
  try {
    const prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) return res.status(404).json({ error: "Préstamo no encontrado" });

    Object.assign(prestamo, req.body);
    await prestamo.save();

    const populated = await prestamo.populate([
      { path: "usuario", select: "nombre email role" },
      { path: "libro", select: "titulo autor", populate: { path: "autor", select: "nombre" } }
    ]);

    res.json(populated);
  } catch (err) {
    next(err);
  }
}

async function devolverPrestamo(req, res, next) {
  try {
    const prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) return res.status(404).json({ error: "Préstamo no encontrado" });

    const isOwner = prestamo.usuario.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "No autorizado" });

    if (prestamo.estado === "devuelto") {
      return res.status(400).json({ error: "El préstamo ya fue devuelto" });
    }

    prestamo.estado = "devuelto";
    prestamo.fechaDevolucion = new Date();
    await prestamo.save();

    // Reponer stock (sin superar stockTotal)
    const libro = await Libro.findById(prestamo.libro);
    if (libro) {
      libro.stockDisponible = Math.min(libro.stockTotal, (libro.stockDisponible || 0) + 1);
      await libro.save();
    }

    const populated = await prestamo.populate([
      { path: "usuario", select: "nombre email role" },
      { path: "libro", select: "titulo autor", populate: { path: "autor", select: "nombre" } }
    ]);

    res.json(populated);
  } catch (err) {
    next(err);
  }
}

async function eliminarPrestamo(req, res, next) {
  try {
    const prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) return res.status(404).json({ error: "Préstamo no encontrado" });

    // Si lo borramos estando activo, reponemos stock para no “perder” el ejemplar
    if (prestamo.estado === "activo") {
      const libro = await Libro.findById(prestamo.libro);
      if (libro) {
        libro.stockDisponible = Math.min(libro.stockTotal, (libro.stockDisponible || 0) + 1);
        await libro.save();
      }
    }

    await prestamo.deleteOne();
    res.json({ message: "Préstamo eliminado" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearPrestamo,
  obtenerMisPrestamos,
  obtenerPrestamos,
  obtenerPrestamoPorId,
  actualizarPrestamo,
  devolverPrestamo,
  eliminarPrestamo
};
