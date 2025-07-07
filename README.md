# Property Management API

API Backend para gestión de propiedades inmobiliarias construida con Node.js, Express y MongoDB, utilizando arquitectura de cebolla (Onion Architecture).

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura de cebolla** con las siguientes capas:

```
src/
├── domain/              # Capa de Dominio (núcleo)
│   ├── entities/        # Entidades de negocio
│   ├── repositories/    # Interfaces de repositorios
│   └── services/        # Interfaces de servicios
├── application/         # Capa de Aplicación
│   └── usecases/        # Casos de uso (lógica de negocio)
├── infrastructure/      # Capa de Infraestructura
│   ├── database/        # Modelos y conexión a BD
│   ├── repositories/    # Implementación de repositorios
│   ├── services/        # Implementación de servicios
│   ├── middleware/      # Middlewares de Express
│   ├── di/              # Inyección de dependencias
│   └── config/          # Configuración del servidor
└── presentation/        # Capa de Presentación
    ├── controllers/     # Controladores HTTP
    └── routes/          # Rutas de la API
```

## 🚀 Características

- **Autenticación y Autorización**: JWT con roles (admin, agent, client)
- **Gestión de Usuarios**: CRUD completo con diferentes permisos por rol
- **Gestión de Propiedades**: CRUD con filtros avanzados y paginación
- **Seguridad**: Rate limiting, CORS, Helmet, validaciones
- **Base de Datos**: MongoDB con Mongoose
- **Arquitectura Limpia**: Separación de responsabilidades y fácil testing
- **TypeScript**: Tipado estático completo

## 🛠️ Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd property-management-api
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Iniciar MongoDB**

```bash
# Si usas MongoDB local
mongod

# O usar MongoDB Atlas (cloud)
# Configurar MONGODB_URI en .env
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

## 📋 Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/property-management

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔐 Autenticación

### Registro de Usuario

```bash
POST /api/v1/auth/register
```

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "cliente",
  "phone": "+57 300 123 4567"
}
```

### Login

```bash
POST /api/v1/auth/login
```

```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

### Headers de Autenticación

```bash
Authorization: Bearer <jwt-token>
```

## 👥 Roles y Permisos

### 🔴 ADMIN

- ✅ Crear, leer, actualizar y eliminar usuarios
- ✅ Crear, leer, actualizar y eliminar propiedades
- ✅ Ver todas las propiedades de todos los agentes
- ✅ Cambiar roles de usuarios

### 🟡 AGENT

- ✅ Crear y gestionar sus propias propiedades
- ✅ Ver y actualizar su propio perfil
- ❌ No puede gestionar otros usuarios

### 🟢 CLIENT

- ✅ Ver propiedades públicas
- ✅ Ver y actualizar su propio perfil
- ❌ No puede crear propiedades
- ❌ No puede gestionar otros usuarios

## 📖 Endpoints de la API

### 🏥 Health Check

```bash
GET /api/v1/health
```

### 🔐 Autenticación

```bash
POST /api/v1/auth/register     # Registro
POST /api/v1/auth/login        # Login
GET  /api/v1/auth/profile      # Perfil (requiere auth)
POST /api/v1/auth/validate-token # Validar token
```

### 👥 Usuarios

```bash
GET    /api/v1/users           # Listar usuarios (solo admin)
POST   /api/v1/users           # Crear usuario (solo admin)
GET    /api/v1/users/:id       # Ver usuario
PUT    /api/v1/users/:id       # Actualizar usuario
DELETE /api/v1/users/:id       # Eliminar usuario (solo admin)
PATCH  /api/v1/users/:id/password # Cambiar contraseña
```

### 🏠 Propiedades

```bash
GET    /api/v1/properties      # Listar propiedades (público)
POST   /api/v1/properties      # Crear propiedad (admin/agent)
GET    /api/v1/properties/:id  # Ver propiedad (público)
PUT    /api/v1/properties/:id  # Actualizar propiedad
DELETE /api/v1/properties/:id  # Eliminar propiedad
PATCH  /api/v1/properties/:id/toggle-status # Cambiar estado

GET    /api/v1/properties/agent/:agentId # Propiedades por agente
```

## 🔍 Filtros y Paginación

### Parámetros de Query para Propiedades

```bash
GET /api/v1/properties?page=1&limit=10&location=Medellín&minPrice=100000&maxPrice=500000&bedrooms=3&bathrooms=2&propertyType=apartment
```

### Parámetros disponibles:

- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)
- `sortBy`: Campo para ordenar (default: 'createdAt')
- `sortOrder`: Orden 'asc' o 'desc' (default: 'desc')
- `location`: Filtrar por ubicación
- `minPrice` / `maxPrice`: Rango de precios
- `minArea` / `maxArea`: Rango de área
- `bedrooms`: Número de habitaciones
- `bathrooms`: Número de baños
- `propertyType`: Tipo de propiedad
- `agentId`: ID del agente

## 🧪 Scripts Dispon
