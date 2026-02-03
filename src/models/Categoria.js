const mongoose = require("mongoose");

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9\s-]/g, "") // deja letras, números, espacio y guion
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CategoriaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, unique: true },
    descripcion: { type: String, trim: true },
    slug: { type: String, unique: true }
  },
  { timestamps: true }
);

CategoriaSchema.pre("validate", function (next) {
  if (!this.slug && this.nombre) this.slug = slugify(this.nombre);
  next();
});

module.exports = mongoose.model("Categoria", CategoriaSchema);
