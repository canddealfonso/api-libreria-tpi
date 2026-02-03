const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { apiLimiter } = require("./middlewares/rateLimit");
const errorHandler = require("./middlewares/errorHandler");

const autoresRoutes = require("./routes/autores.routes");
const categoriasRoutes = require("./routes/categorias.routes");
const librosRoutes = require("./routes/libros.routes");
const prestamosRoutes = require("./routes/prestamos.routes");
const usersRoutes = require("./routes/users.routes");
const authRoutes = require("./routes/auth.routes");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function bootstrap() {
  if (!MONGO_URI) {
    console.error("❌ Falta MONGO_URI en el .env");
    process.exit(1);
  }

  await connectDB(MONGO_URI);

  const app = express();

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(apiLimiter);

  // Front (opcional)
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Healthcheck
  app.get("/api/health", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

  // Rutas API
  app.use("/api/auth", authRoutes);
  app.use("/api/usuarios", usersRoutes);
  app.use("/api/autores", autoresRoutes);
  app.use("/api/categorias", categoriasRoutes);
  app.use("/api/libros", librosRoutes);
  app.use("/api/prestamos", prestamosRoutes);

  // 404 API
  app.use("/api", (req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

  // Error handler
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

bootstrap();
