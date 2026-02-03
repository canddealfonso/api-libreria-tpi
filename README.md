# API Librería Comunitaria (TPI Back End - Node.js)

API RESTful para gestionar una **Librería/Biblioteca** con:
- **Autores**
- **Libros** (con stock, categorías y búsqueda)
- **Categorías**
- **Préstamos** (usuarios pueden pedir/devolver)
- **Usuarios** (registro/login con **bcrypt** + **JWT**)

> Mantiene los puntos del TPI: 2+ entidades principales + CRUD, validaciones, seguridad (bcrypt + rate limiting), Postman y documentación.

---

## Tecnologías

- Node.js + Express
- MongoDB + Mongoose
- bcrypt (hash de contraseñas)
- JSON Web Token (JWT) para autenticación
- express-rate-limit (rate limiting)
- express-validator (validación de datos)

---

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

Servidor: `http://localhost:<PORT>` (por defecto `5000`)

> Asegurate de tener MongoDB corriendo y `MONGO_URI` configurado.

---

## Auth y Roles (JWT)

- Registro y login devuelven un `token`.
- Para endpoints protegidos, enviar:
  - Header: `Authorization: Bearer <token>`

**Admin rápido (solo para demo/local):**
1) En `.env` dejar `ALLOW_ADMIN_REGISTRATION=true`
2) Registrar un usuario con `"role": "admin"`

---


## Postman (colección incluida)

En `postman/API_Libreria_TPI.postman_collection.json` tenés una colección lista para importar.

**Variables de colección**:
- `host` y `port` (ej: `localhost` y `5001`)
- `tokenAdmin`, `tokenUser`
- `autorId`, `categoriaId`, `libroId`, `prestamoId`

> Los requests de **Crear** guardan automáticamente los IDs en variables (en `Tests`), así podés ejecutar luego **Actualizar/Eliminar** sin copiar/pegar.

**Orden recomendado para probar todo el flujo:**
1. Auth - Register Admin
2. Autores - Crear
3. Categorías - Crear (genera nombre único para evitar duplicados)
4. Libros - Crear
5. Auth - Register User
6. Préstamos - Crear
7. Préstamos - Devolver

## Endpoints

### Healthcheck
- `GET /api/health`

### Auth
- `POST /api/auth/register`
```json
{ "nombre": "Candela", "email": "candela@example.com", "password": "password123", "role": "admin" }
```

- `POST /api/auth/login`
```json
{ "email": "candela@example.com", "password": "password123" }
```

### Usuarios (requiere JWT)
- `GET /api/usuarios` (admin)
- `POST /api/usuarios` (admin)
- `GET /api/usuarios/:id` (admin o el propio usuario)
- `PUT /api/usuarios/:id` (admin o el propio usuario)
- `DELETE /api/usuarios/:id` (admin)

### Autores
- `GET /api/autores?q=garcia&sort=nombre`
- `GET /api/autores/:id`
- `POST /api/autores` (admin)
- `PUT /api/autores/:id` (admin)
- `DELETE /api/autores/:id` (admin)

### Categorías
- `GET /api/categorias?q=ficcion`
- `GET /api/categorias/:id`
- `POST /api/categorias` (admin)
- `PUT /api/categorias/:id` (admin)
- `DELETE /api/categorias/:id` (admin)

### Libros (búsqueda + filtros + stock)
- `GET /api/libros?q=soledad&disponibles=true&page=1&limit=10&sort=-createdAt`
- `GET /api/libros/:id`
- `POST /api/libros` (admin)
```json
{
  "titulo": "Cien años de soledad",
  "anioPublicacion": 1967,
  "autor": "ID_AUTOR",
  "categorias": ["ID_CATEGORIA"],
  "stockTotal": 3,
  "stockDisponible": 3
}
```
- `PUT /api/libros/:id` (admin)
- `DELETE /api/libros/:id` (admin)

### Préstamos (JWT)
- `POST /api/prestamos` (user/admin)
```json
{ "libro": "ID_LIBRO" }
```
- `GET /api/prestamos/mis` (user/admin) → lista los préstamos del usuario logueado
- `GET /api/prestamos` (admin) → lista global con filtros `estado`, `usuario`, `libro`
- `GET /api/prestamos/:id` (admin o dueño)
- `PATCH /api/prestamos/:id/devolver` (admin o dueño) → devuelve y repone stock
- `PUT /api/prestamos/:id` (admin)
- `DELETE /api/prestamos/:id` (admin)

---

## Postman

En `./postman` hay una colección lista para importar:
- `API_Libreria_TPI.postman_collection.json`

Flujo recomendado:
1) Register (admin) → guardar `token`
2) Crear Categoría/Autor → guardar IDs
3) Crear Libro (con stock)
4) Login como user → `token`
5) Crear Préstamo → devolver

---

## Frontend (opcional)

`./public/index.html` muestra un catálogo simple consumiendo `GET /api/libros` y `GET /api/autores`.
Abrí: `http://localhost:5000`

---

## Deploy (opcional - Render)

1) Usar MongoDB Atlas y setear `MONGO_URI`
2) Crear Web Service en Render
3) Variables de entorno mínimas:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `BCRYPT_SALT_ROUNDS`

---

## Checklist TPI

- [x] 2+ entidades principales (Autores/Libros) + extra (Categorías/Préstamos/Usuarios)
- [x] CRUD completo (para entidades)
- [x] Seguridad: bcrypt + validaciones + rate limiting
- [x] Pruebas en Postman (colección incluida)
- [x] Documentación (README)
- [ ] Deploy en Render (opcional)
