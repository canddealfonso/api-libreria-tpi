const mongoose = require("mongoose");

const PrestamoSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    libro: { type: mongoose.Schema.Types.ObjectId, ref: "Libro", required: true },
    fechaPrestamo: { type: Date, default: Date.now },
    fechaVencimiento: { type: Date, required: true },
    fechaDevolucion: { type: Date },
    estado: { type: String, enum: ["activo", "devuelto", "vencido"], default: "activo" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prestamo", PrestamoSchema);
