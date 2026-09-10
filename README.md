# Language Academy API

Backend REST para una plataforma de academia de idiomas, desarrollado con NestJS, Prisma y PostgreSQL. Proyecto individual - Cuarto Proyecto Integrador.

## Autor

Agustin Quintana

## Idea original

Plataforma de gestion de cursos de idiomas: usuarios se registran, se inscriben a cursos, y avanzan por niveles y lecciones. Idea heredada del Segundo Proyecto Integrador.

## Tecnologias

- NestJS 11 + TypeScript
- Prisma 7 (driver adapter `@prisma/adapter-pg`)
- PostgreSQL
- JWT (Passport) con access token + refresh token rotativo
- bcrypt para hasheo de contrasenas
- class-validator / class-transformer
- Helmet + CORS + @nestjs/throttler (rate limiting)
- Jest para testing

## Requisitos

- Node.js 20+
- pnpm
- PostgreSQL 14+ corriendo localmente (o via Docker)

## Instalacion local

```bash
# 1. Clonar el repositorio
git clone https://github.com/Agustinn19/language-academy-api.git
cd language-academy-api

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales

# 4. Aplicar migraciones de Prisma
pnpm exec prisma migrate dev

# 5. (Opcional) Poblar la base con datos de prueba
pnpm prisma db seed

# 6. Levantar el servidor en modo desarrollo
pnpm start:dev
```

La API queda disponible en `http://localhost:3000/api`.

## Variables de entorno

Ver `.env.example` para la lista completa. Nunca commitear el archivo `.env` real.

| Variable | Descripcion |
|---|---|
| `DATABASE_URL` | Cadena de conexion a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar access tokens |
| `JWT_EXPIRES_IN` | Duracion del access token (ej. `15m`) |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens (distinto de `JWT_SECRET`) |
| `JWT_REFRESH_EXPIRES_IN` | Duracion del refresh token (ej. `7d`) |
| `CORS_ORIGIN` | Origen permitido para CORS |
| `PORT` | Puerto del servidor (default: 3000) |

## Usuarios de prueba (via seed)

| Email | Password | Rol |
|---|---|---|
| admin@academy.com | AdminPassword123! | ADMIN |
| student@academy.com | StudentPassword123! | STUDENT |

## Seguridad implementada

- Contrasenas hasheadas con bcrypt (10 rondas), nunca devueltas en las respuestas.
- JWT con access token de corta duracion + refresh token rotativo, hasheado en base de datos con bcrypt.
- Logout invalida el refresh token guardado (`hashedRefreshToken: null`).
- Deteccion de reuso de refresh token: si el token recibido no matchea el hash guardado, se invalida toda la sesion.
- ValidationPipe global (`whitelist`, `forbidNonWhitelisted`, `transform`) contra mass assignment.
- Helmet para headers de seguridad HTTP.
- CORS configurado explicitamente via `CORS_ORIGIN`.
- Rate limiting global (20 req/min) + reforzado en `/auth/login` (5 req/min) contra fuerza bruta.
- Ownership real en `enrollments`: un usuario solo puede ver/editar/eliminar sus propias inscripciones (salvo rol ADMIN).

## Endpoints

Prefijo global: `/api`

### Auth

| Metodo | Ruta | Guard / Rol | Descripcion |
|---|---|---|---|
| POST | `/api/auth/register` | Publico | Crea un usuario nuevo, devuelve access + refresh token |
| POST | `/api/auth/login` | Publico (rate limit: 5/min) | Valida credenciales, devuelve access + refresh token |
| POST | `/api/auth/refresh` | Requiere refresh token valido | Rota el refresh token y emite un nuevo par |
| POST | `/api/auth/logout` | JWT (access token) | Invalida el refresh token guardado |

### Users

| Metodo | Ruta | Guard / Rol | Descripcion |
|---|---|---|---|
| GET | `/api/users` | JWT + ADMIN | Lista todos los usuarios |
| GET | `/api/users/:id` | JWT | Obtiene un usuario por id |
| POST | `/api/users` | JWT + ADMIN | Crea un usuario |
| PATCH | `/api/users/:id` | JWT | Actualiza un usuario |
| DELETE | `/api/users/:id` | JWT + ADMIN | Elimina un usuario |

### Languages

| Metodo | Ruta | Guard / Rol | Descripcion |
|---|---|---|---|
| GET | `/api/languages` | Publico | Lista los idiomas disponibles |
| GET | `/api/languages/:id` | Publico | Obtiene un idioma por id |
| POST | `/api/languages` | JWT | Crea un idioma |
| PATCH | `/api/languages/:id` | JWT | Actualiza un idioma |
| DELETE | `/api/languages/:id` | JWT | Elimina un idioma |

### Levels

| Metodo | Ruta | Guard / Rol | Descripcion |
|---|---|---|---|
| GET | `/api/levels` | Publico | Lista los niveles disponibles |
| GET | `/api/levels/:id` | Publico | Obtiene un nivel por id |
| POST | `/api/levels` | JWT | Crea un nivel |
| PATCH | `/api/levels/:id` | JWT | Actualiza un nivel |
| DELETE | `/api/levels/:id` | JWT | Elimina un nivel |

### Enrollments (con ownership)

| Metodo | Ruta | Guard / Rol | Ownership | Descripcion |
|---|---|---|---|---|
| POST | `/api/enrollments` | JWT | El `userId` sale del token, no del body | Crea una inscripcion a un curso |
| GET | `/api/enrollments` | JWT | Devuelve solo las inscripciones del usuario logueado | Lista las inscripciones propias |
| GET | `/api/enrollments/:id` | JWT | 403 si no es propia y no es ADMIN | Obtiene una inscripcion |
| PATCH | `/api/enrollments/:id` | JWT | 403 si no es propia y no es ADMIN | Actualiza el estado de una inscripcion |
| DELETE | `/api/enrollments/:id` | JWT | 403 si no es propia y no es ADMIN | Elimina una inscripcion |

## Scripts disponibles

```bash
pnpm start:dev       # Servidor en modo watch
pnpm build           # Compila el proyecto
pnpm test            # Corre los tests
pnpm prisma studio   # Abre Prisma Studio para inspeccionar la DB
pnpm prisma db seed  # Ejecuta el seed de datos de prueba
```

## Deploy

API desplegada en Render: https://language-academy-api.onrender.com

Base de datos PostgreSQL gestionada por Render (plan free). Las migraciones se aplican automaticamente en cada deploy via `prisma migrate deploy` (configurado en el script `start:prod`).

Nota: el plan free de Render suspende la instancia tras inactividad; el primer request puede demorar hasta 50 segundos en responder.