# TWM - Proyecto de Compra y Venta

Aplicación web de compra y venta que conecta clientes y vendedores. Permite explorar y publicar productos y servicios, gestionar compras y ventas, y dar seguimiento a sus etapas desde una interfaz web respaldada por una API y una base de datos PostgreSQL.


## Integrantes del grupo

- Pablo Millaquipay Flores
- Harold Palma Palma
- David Pérez Catalán
- Luis Pinuer Carrillo
- Carlos Rivera Quezada
- Marcelo Compai

## Estructura del repositorio

- `frontend/`: aplicación React con Vite. Las pantallas están en `src/pages`, los componentes reutilizables en `src/components`, y las llamadas a la API en `src/services`.
- `backend/`: API REST en ASP.NET Core. Incluye controladores, modelos, DTOs y servicios; usa Entity Framework Core con PostgreSQL y autenticación JWT.
- `bd_proyecto/`: scripts SQL para crear el esquema, cargar datos iniciales, definir funciones y triggers.
- `minuta/`: minutas del proyecto.
- `postman/`: recursos de Postman para pruebas de la API.

## Requisitos

- Node.js compatible con Vite 8: **20.19 o superior** (o **22.12 o superior**).
- npm.
- **.NET SDK 10.0**.
- **PostgreSQL** y una base de datos local o accesible para la aplicación.

## Configuración inicial

### 1. Clonar el repositorio

```bash
git clone https://github.com/ElPabloOficial/-TWM-Proyecto-Compra-Venta.git
cd -TWM-Proyecto-Compra-Venta
```

### 2. Crear y preparar la base de datos

En PostgreSQL, crea una base de datos vacía. Luego, utiliza Query Tool de pgAdmin para ejecutar los scripts de `bd_proyecto/` en el siguiente orden:

1. `create_tables.txt`: crea las tablas y relaciones.
2. `inserts.txt`: carga los datos iniciales.
3. `funciones.txt`: define las funciones PostgreSQL utilizadas por la aplicación.
4. `triggers.txt`: define los triggers.
5. `script.txt`: ajusta las secuencias de las columnas autoincrementales después de cargar los datos.

**Nota:** `create_tables.txt` eliminará las tablas existentes antes de volver a crearlas; se recomienda usar solamente en una base de datos que puedas reinicializar, ya que se perderán todos los datos.

### 3. Configurar el backend

El backend lee la cadena de conexión `ConnectionStrings:DefaultConnection` y la clave `Jwt:Key` de la configuración de ASP.NET Core. Para el entorno de desarrollo, crea `backend/appsettings.Development.json` (el cual está excluido de Git) con tus propios valores:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "REEMPLAZA_POR_TU_CADENA_DE_CONEXION_POSTGRESQL"
  },
  "Jwt": {
    "Key": "reemplaza-por-una-clave-secreta-larga-y-aleatoria"
  }
}
```

Reemplaza el valor de `DefaultConnection` por una cadena de conexión PostgreSQL que incluya el host, puerto, base de datos, usuario y contraseña de tu entorno. **No subas contraseñas ni claves reales al repositorio.** El perfil de desarrollo `http` inicia la API en `http://localhost:5097`; Swagger está disponible en `http://localhost:5097/swagger` mientras la API se ejecuta en desarrollo.

### 4. Iniciar la API

Desde la raíz del repositorio:

```bash
cd backend
dotnet restore
dotnet run --launch-profile http
```

Deja este proceso activo. La API utiliza PostgreSQL y necesita que la base de datos y su configuración estén disponibles al iniciar.

### 5. Iniciar el frontend

En otra terminal, desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que Vite indique en la terminal (normalmente `http://localhost:5173`). El frontend usa por defecto la API en `http://localhost:5097/api`.

Si la API está en otra dirección, configura `VITE_API_URL` en `frontend/.env.local`, incluyendo el prefijo `/api`; por ejemplo:

```env
VITE_API_URL=http://localhost:5097/api
```

El backend permite solicitudes de desarrollo desde `http://localhost:5173` y `http://127.0.0.1:5173`. Si cambias el origen del frontend, actualiza también la política CORS del backend.


## Diseño

[Diseño conceptual del proyecto en Figma](https://www.figma.com/design/n0hVLsWXtG64eKxKp3tHOD/trabajo?node-id=0-1&p=f&t=pltzD8RN2oCeC43M-0)
