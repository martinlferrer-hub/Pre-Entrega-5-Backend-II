# EventHub API

API REST para una Plataforma de Eventos e Inscripciones.

## Pre-entrega 5 — Roles y autorización

En esta etapa se incorpora autorización basada en roles sobre la autenticación existente.

La API distingue correctamente:

- **401 Unauthorized**: no existe una sesión válida.
- **403 Forbidden**: existe una sesión válida, pero el rol no tiene permiso para realizar la acción.

La autenticación continúa utilizando JWT almacenado en la cookie `currentUser`. Passport.js mantiene las estrategias de registro y login; para las rutas de autorización se utiliza un middleware reutilizable que valida el JWT y otro middleware que valida los roles permitidos.

## Roles

El modelo `User` admite:

- `user` — usuario estándar.
- `organizer` — puede crear y administrar sus propios eventos.
- `admin` — puede administrar cualquier evento y consultar todos los usuarios.

El registro público siempre fuerza `role: "user"`. Un cliente no puede registrarse como `organizer` o `admin` enviando el campo `role` en el body.

## Matriz de permisos

| Acción | user | organizer | admin |
|---|:---:|:---:|:---:|
| Consultar eventos publicados | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar/cancelar eventos propios | ❌ | ✅ | ✅ |
| Modificar cualquier evento | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

## Arquitectura

```text
Request
  ↓
Route
  ↓
Authentication middleware
  ↓
Authorization middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
Model / MongoDB
```

La autorización no depende del frontend. Los permisos se verifican en middleware y la propiedad del recurso se valida en la capa de servicio.

## Middlewares

### `auth.middleware.js`

Lee el JWT de la cookie `currentUser`, lo verifica con `JWT_SECRET`, coloca `{ id, email, role }` en `req.user` y responde `401` cuando no existe una sesión válida.

### `authorize.middleware.js`

Es reutilizable y recibe los roles permitidos:

```js
authorize("organizer", "admin")
```

Si el usuario está autenticado pero su rol no está permitido, responde `403`.

## Propiedad de recursos

Para `PUT /api/events/:id`:

- `organizer` puede modificar únicamente eventos cuyo `organizer` coincida con su `req.user.id`.
- `admin` puede modificar cualquier evento.
- Un `organizer` que intente modificar un evento ajeno recibe `403`.

## Tecnologías

- Node.js
- Express
- MongoDB
- Mongoose
- Passport.js
- passport-local
- passport-custom
- bcrypt
- jsonwebtoken
- cookie-parser
- dotenv
- JavaScript / ECMAScript Modules (ESM)

## Instalación

```bash
npm install
```

Crear `.env` a partir de `.env.example`.

```env
PORT=8080
NODE_ENV=development
MONGO_URL=mongodb://localhost:27017/eventhub
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1h
```

`MONGO_URL` y `JWT_SECRET` son obligatorios.

## Ejecución

```bash
npm run dev
```

También:

```bash
npm start
```

Tests:

```bash
npm test
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor Express |
| `NODE_ENV` | `development` o `production` |
| `MONGO_URL` | URL de conexión a MongoDB |
| `JWT_SECRET` | Secreto obligatorio para firmar/verificar JWT |
| `JWT_EXPIRES_IN` | Expiración del JWT, por ejemplo `1h` |

## Rutas

### `GET /api/health`

Verifica el estado del servidor.

Response `200`:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

### `GET /api/events`

Consulta eventos publicados. No requiere autenticación.

Response `200`:

```json
{
  "status": "success",
  "payload": []
}
```

### `POST /api/events`

Crea un evento. Requiere sesión válida y rol `organizer` o `admin`.

Request:

```json
{
  "title": "Congreso Tech 2026",
  "description": "Congreso sobre tecnología y desarrollo.",
  "date": "2026-11-20T18:00:00.000Z",
  "location": "Playa del Carmen",
  "capacity": 200
}
```

Response `201`:

```json
{
  "status": "success",
  "payload": {
    "id": "6690...",
    "title": "Congreso Tech 2026",
    "description": "Congreso sobre tecnología y desarrollo.",
    "date": "2026-11-20T18:00:00.000Z",
    "location": "Playa del Carmen",
    "capacity": 200,
    "status": "published",
    "organizer": "665f2a..."
  }
}
```

Sin cookie válida: `401 No autenticado`.

Con rol `user`: `403 No tenés permisos para realizar esta acción`.

### `PUT /api/events/:id`

Modifica un evento. Requiere `organizer` o `admin`.

- `organizer`: solamente sus propios eventos.
- `admin`: cualquier evento.

Ejemplo:

```http
PUT /api/events/6690...
```

```json
{
  "title": "Congreso Tech 2026 - Actualizado",
  "capacity": 250
}
```

Si un organizer intenta modificar un evento ajeno:

```json
{
  "status": "error",
  "message": "No tenés permisos para modificar este evento"
}
```

Status: `403`.

### `GET /api/users`

Ruta administrativa. Requiere rol `admin`.

Response `200`:

```json
{
  "status": "success",
  "payload": [
    {
      "_id": "665f2a...",
      "first_name": "Ana",
      "last_name": "Pérez",
      "email": "ana@mail.com",
      "role": "user"
    }
  ]
}
```

`password` nunca se incluye.

Con rol `organizer` o `user`: `403`.

### `POST /api/sessions/register`

Registro público. El rol siempre queda en `user`.

Request:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com",
  "password": "Secreta123"
}
```

### `POST /api/sessions/login`

Autentica al usuario y establece la cookie `currentUser`.

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

### `GET /api/sessions/current`

Requiere autenticación.

Response `200`:

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Sin cookie válida:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

Status: `401`.

### `POST /api/sessions/logout`

Elimina la cookie `currentUser`.

Response `200`:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

## Diferencia entre 401 y 403

### 401 — No autenticado

Se devuelve cuando el request no presenta una sesión válida:

- no existe cookie `currentUser`;
- JWT inválido;
- JWT expirado.

### 403 — Sin permisos

Se devuelve cuando el usuario sí está autenticado, pero su rol no puede ejecutar la acción solicitada.

Ejemplo:

```text
user autenticado
      ↓
POST /api/events
      ↓
403
```

No se utiliza `500` para estos casos.

## Cómo probar la autorización

Para probar `organizer` y `admin`, el registro público crea usuarios con `role: user`. Los roles privilegiados deben asignarse de manera controlada en la base de datos de desarrollo o mediante una herramienta administrativa.

Casos mínimos:

1. Login como `user` → `POST /api/events` → `403`.
2. Login como `organizer` → `POST /api/events` → `201`.
3. Login como `organizer` → `GET /api/users` → `403`.
4. Login como `admin` → `GET /api/users` → `200`.
5. Sin cookie → cualquier ruta privada → `401`.
6. Organizer intenta modificar evento ajeno → `403`.
7. Admin modifica evento ajeno → `200`.

## Flujo de autenticación y autorización

```text
REGISTER
   ↓
LOGIN
   ↓
JWT en currentUser
   ↓
AUTH → ¿sesión válida?
   ↓ sí
AUTHORIZE → ¿rol permitido?
   ↓ sí
CONTROLLER
   ↓
SERVICE
   ↓
REPOSITORY
   ↓
DAO
   ↓
MongoDB
```

## Estructura

```text
src/
├── app.js
├── server.js
├── config/
│   ├── database.js
│   ├── env.js
│   └── passport.config.js
├── routes/
│   ├── events.router.js
│   ├── health.router.js
│   ├── sessions.router.js
│   └── users.router.js
├── controllers/
│   ├── events.controller.js
│   ├── health.controller.js
│   ├── sessions.controller.js
│   └── users.controller.js
├── services/
│   ├── events.service.js
│   ├── sessions.service.js
│   └── users.service.js
├── repositories/
│   ├── events.repository.js
│   └── users.repository.js
├── dao/
│   ├── events.dao.js
│   └── users.dao.js
├── models/
│   ├── Event.js
│   └── User.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   └── error.middleware.js
└── utils/
    ├── hash.js
    └── jwt.js
```

## Seguridad

- `password` utiliza bcrypt.
- `password` tiene `select: false` en el modelo.
- JWT no contiene password.
- `JWT_SECRET` es obligatorio.
- Cookie `currentUser` con `httpOnly: true`.
- `.env` y `node_modules` no deben subirse.
- La autorización se ejecuta en backend.
- La propiedad del recurso se valida en el service.

## Autor

Martin Ferrer
