const mongoose = require("mongoose");

const AutorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    nacionalidad: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Autor", AutorSchema);
