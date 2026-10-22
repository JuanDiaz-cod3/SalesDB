const express = require('express');
const cors = require('cors');
require('dotenv').config();

const clientesRoutes = require('./routes/clientes.routes');
const productosRoutes = require('./routes/productos.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const comprasRoutes = require('./routes/compras.routes');
const consultasRoutes = require('./routes/consultas.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/clientes', clientesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/consultas', consultasRoutes);

app.get('/', (req, res) => {
    res.json({ mensaje: 'API Laboratorio 01 - Bases de Datos' });
});

// En Vercel la app se exporta como función serverless; localmente se levanta con listen.
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;
