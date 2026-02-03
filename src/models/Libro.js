const mongoose = require("mongoose");

const LibroSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    isbn: { type: String, trim: true, unique: true, sparse: true },
    anioPublicacion: { type: Number, min: 0 },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: "Autor", required: true },
    categorias: [{ type: mongoose.Schema.Types.ObjectId, ref: "Categoria" }],
    stockTotal: { type: Number, default: 1, min: 0 },
    stockDisponible: { type: Number, default: 1, min: 0 }
  },
  { timestamps: true }
);

LibroSchema.pre("validate", function (next) {
  if (this.stockTotal != null && this.stockDisponible == null) {
    this.stockDisponible = this.stockTotal;
  }
  if (this.stockDisponible != null && this.stockTotal != null) {
    if (this.stockDisponible > this.stockTotal) this.stockDisponible = this.stockTotal;
  }
  next();
});

module.exports = mongoose.model("Libro", LibroSchema);
