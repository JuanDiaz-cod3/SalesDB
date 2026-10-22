# Laboratorio 01 — Bases de Datos

Sistema de gestión de clientes, productos, proveedores y pedidos. Hecho para el Laboratorio 01 del curso de Bases de Datos: modelo relacional + script SQL + aplicación web (Express + React) que consume una base PostgreSQL local.

**Número de grupo: TODO — falta definirlo, el nombre final del Word a entregar debe ser `LABORATOTIO_1_GRUPO_<#>`.**

## Enunciado (resumen)

Una empresa vende productos a clientes. Un cliente tiene identificación, nombre, apellidos, dirección y fecha de nacimiento. Un producto tiene código, nombre y precio unitario, y es suministrado por un único proveedor (un proveedor puede suministrar varios productos). Un cliente puede comprar varios productos y un producto puede ser comprado por varios clientes (relación N:M vía pedidos).

Entregables pedidos por el documento original:
1. Diagrama entidad-relación.
2. Modelo relacional.
3. Script de creación de tablas, ejecutado en la base asignada al grupo.
4. Aplicación con un menú que permita:
   - Insertar/actualizar/borrar clientes, productos y proveedores.
   - Que un cliente realice pedidos de productos.
   - Ejecutar 4 consultas (ver abajo).
5. Un Word `LABORATOTIO_1_GRUPO_<#>`, enviado solo por el líder del grupo.

## Stack elegido

- **Backend**: Node.js + Express + `pg` (driver de PostgreSQL).
- **Frontend**: React + Vite + `react-router-dom`.
- **Base de datos**: PostgreSQL 18, **local** (no hay deploy — el profesor clona el repo, crea su propia base local, corre el script, y levanta ambos servidores en su máquina).

## Estructura del repo

```
Lab1/
├── backend/
│   ├── db/
│   │   ├── schema.sql          # CREATE DATABASE + CREATE TABLE (orden: proveedor → producto → cliente → compra)
│   │   └── pool.js             # Pool de conexión pg, lee variables de .env
│   ├── routes/
│   │   ├── clientes.routes.js      # GET, GET/:id, POST, PUT/:id, DELETE/:id
│   │   ├── productos.routes.js     # idem (incluye JOIN con proveedor en el GET)
│   │   ├── proveedores.routes.js   # idem
│   │   ├── compras.routes.js       # GET, GET/:id, POST (pedido), PUT/:id (editar cantidad/fecha), DELETE/:id
│   │   └── consultas.routes.js     # las 4 consultas del enunciado
│   ├── index.js                # arma Express, monta rutas, cors, dotenv
│   ├── .env                    # credenciales reales (NO está en git)
│   └── .env.example            # plantilla de variables de entorno
└── frontend/
    ├── index.html               # carga fuentes Sora + JetBrains Mono
    └── src/
        ├── api/client.js        # wrapper fetch hacia http://localhost:3000/api
        ├── index.css            # design tokens + primitivas compartidas (.btn, .field, .chip, tabla...)
        ├── App.jsx               # rutas: "/" landing, "/app/*" aplicación
        ├── components/
        │   ├── NavBar.jsx/.css   # barra de navegación de la app
        │   ├── AppLayout.jsx     # shell con <Outlet/>
        │   └── PageHeader.jsx    # chip + título reutilizado en todas las páginas
        └── pages/
            ├── Landing.jsx/.css  # pantalla de bienvenida (video de fondo en public/video.wall.mp4)
            ├── Dashboard.jsx     # menú principal dentro de /app
            ├── Clientes.jsx
            ├── Productos.jsx
            ├── Proveedores.jsx
            ├── Pedidos.jsx       # un cliente hace un pedido de un producto
            └── Consultas.jsx     # las 4 consultas, cada una con botón propio
```

## Cómo correr el proyecto (para el profesor / otro integrante)

1. **PostgreSQL** debe estar instalado y corriendo localmente.
2. Crear la base y las tablas (son dos pasos porque Postgres no permite crear una base y usarla en la misma conexión):
   ```bash
   psql -U postgres -c "CREATE DATABASE salesdb;"
   psql -U postgres -d salesdb -f backend/db/schema.sql
   ```
   El segundo comando va a imprimir un error de "la base de datos salesdb ya existe" en la primera línea (porque `schema.sql` también trae el `CREATE DATABASE`) — es inofensivo, psql sigue y crea las tablas igual. Si prefieres evitar ese mensaje, abre `schema.sql` y comenta/borra solo la primera línea antes de correrlo.
3. **Backend**:
   ```bash
   cd backend
   cp .env.example .env   # y completar DB_PASSWORD con la clave real de postgres local
   npm install
   npm start               # o: node index.js  → http://localhost:3000
   ```
4. **Frontend** (en otra terminal):
   ```bash
   cd frontend
   npm install
   npm run dev              # → http://localhost:5173
   ```
5. Abrir el navegador y verificar:
   - **Frontend**: `http://localhost:5173` → debe cargar la landing "SALESDB" con el botón "Entrar al sistema". Click ahí para llegar al menú (`/app`) con las 5 secciones.
   - **Backend**: `http://localhost:3000` → debe responder `{"mensaje":"API Laboratorio 01 - Bases de Datos"}`. Si esto no carga, el frontend tampoco va a poder traer datos (revisa que `backend/.env` tenga la clave correcta de tu Postgres local).
   - Ambos servidores quedan corriendo en la terminal donde los lanzaste (`Ctrl+C` para pararlos); tienen que estar los dos activos al mismo tiempo, en dos terminales separadas.

## Modelo de datos (resumen — ver `backend/db/schema.sql` para el detalle exacto)

- `proveedor(nit PK, nombre, direccion)`
- `producto(codigo PK, nombre, precio_unitario, nit_proveedor FK → proveedor)`
- `cliente(id_cliente PK, nombre, apellidos, direccion, fecha_nacimiento)`
- `compra(id_compra PK serial, id_cliente FK → cliente, codigo_producto FK → producto, cantidad, precio_compra, fecha_compra)`

Decisión de diseño importante: **`precio_compra` guarda el precio unitario del producto congelado al momento del pedido** (no el total). Si el producto sube de precio después, los pedidos viejos no cambian. El **total** (`cantidad × precio_compra`) se calcula en el frontend, nunca se guarda — así nunca queda desincronizado si se edita la cantidad de un pedido ya hecho.

`compra` tiene `id_compra` como llave primaria propia (no compuesta) para poder editar/borrar un pedido puntual vía `PUT/DELETE /api/compras/:id`.

## API (backend, base `http://localhost:3000/api`)

| Recurso | Rutas |
|---|---|
| Clientes | `GET /clientes`, `GET /clientes/:id`, `POST /clientes`, `PUT /clientes/:id`, `DELETE /clientes/:id` |
| Productos | `GET /productos`, `GET /productos/:codigo`, `POST /productos`, `PUT /productos/:codigo`, `DELETE /productos/:codigo` |
| Proveedores | `GET /proveedores`, `GET /proveedores/:nit`, `POST /proveedores`, `PUT /proveedores/:nit`, `DELETE /proveedores/:nit` |
| Pedidos (compras) | `GET /compras`, `GET /compras/:id`, `POST /compras`, `PUT /compras/:id` (solo cantidad/fecha), `DELETE /compras/:id` |
| Consultas | `GET /consultas/clientes-pedidos`, `GET /consultas/clientes-sin-pedidos`, `GET /consultas/detalle-compras`, `GET /consultas/proveedores-productos` |

Todas las rutas de borrado devuelven `409` con un mensaje claro si hay una llave foránea que lo impide (ej. borrar un proveedor con productos asociados). Los `POST`/`PUT` devuelven `400`/`409` con mensajes en español ante datos inválidos o duplicados.

## Qué ya está hecho

- [x] Script SQL (`schema.sql`), ejecutado y probado contra una base local `salesdb`.
- [x] Backend completo: CRUD de cliente/producto/proveedor, creación/edición/borrado de pedidos, las 4 consultas.
- [x] Frontend completo: landing + app con las 5 secciones del menú (Clientes, Productos, Proveedores, Pedidos, Consultas).
- [x] UX: confirmación antes de borrar, estado de "Guardando…", banners de éxito/error, validación de dependencias vacías (ej. no puedes crear un producto sin proveedor).
- [x] Revisión de diseño (Impeccable critique) aplicada — ver `frontend/.impeccable/critique/` para el reporte completo.
- [x] **Diagrama entidad-relación** — `frontend/public/basedb.png`. Verificado campo por campo contra `schema.sql`: coincide exacto (incluye `id_compra` como PK propia de `COMPRA` y `precio_compra`). Listo para pegar en el Word.

## Qué falta (para quien continúe)

- [ ] **Modelo relacional** documentado como entregable aparte (tablas con PK/FK en formato de documento, no solo el script). El contenido ya está resumido más abajo en "Modelo de datos" — falta solo darle formato de documento/imagen para el Word.
- [ ] **Definir el número de grupo** y crear el Word `LABORATOTIO_1_GRUPO_<#>` con capturas de pantalla de la app funcionando y las consultas ejecutadas.
- [ ] Opcional: subir el repo a GitHub (no se ha inicializado git todavía a propósito).
- [ ] Probar el flujo completo con datos reales de prueba (ahora mismo la base está vacía).

## Notas de contexto / decisiones tomadas en el desarrollo

- Se eligió **PostgreSQL local** en vez de Supabase/deploy porque el documento especifica que el profesor debe poder clonar y correr todo en su propia máquina.
- El **video de fondo** de la landing (`frontend/public/video.wall.mp4`) y su poster (`photo.wall.png`) fueron descargados por el estudiante desde una fuente externa (motionsites.ai) bajo su propia sesión — **no son assets de Anthropic ni vienen incluidos por defecto**; si el repo se clona sin esos dos archivos, la landing seguirá funcionando pero sin el video de fondo (hay fallback CSS, pero revisen que `public/video.wall.mp4` y `public/photo.wall.png` estén presentes).
- El favicon del navegador usa `public/photo.wall.png`.
