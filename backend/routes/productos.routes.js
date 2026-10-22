const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/productos - listar todos los productos (con el nombre del proveedor)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, pr.nombre AS nombre_proveedor
             FROM producto p
             JOIN proveedor pr ON pr.nit = p.nit_proveedor
             ORDER BY p.nombre`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al consultar productos' });
    }
});

// GET /api/productos/:codigo - obtener un producto
router.get('/:codigo', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM producto WHERE codigo = $1',
            [req.params.codigo]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al consultar el producto' });
    }
});

// POST /api/productos - crear un producto
router.post('/', async (req, res) => {
    const { codigo, nombre, precio_unitario, nit_proveedor } = req.body;

    if (!codigo || !nombre || precio_unitario == null || !nit_proveedor) {
        return res.status(400).json({ error: 'codigo, nombre, precio_unitario y nit_proveedor son obligatorios' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO producto (codigo, nombre, precio_unitario, nit_proveedor)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [codigo, nombre, precio_unitario, nit_proveedor]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un producto con ese código' });
        }
        if (err.code === '23503') {
            return res.status(400).json({ error: 'El nit_proveedor no corresponde a ningún proveedor existente' });
        }
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

// PUT /api/productos/:codigo - actualizar un producto
router.put('/:codigo', async (req, res) => {
    const { nombre, precio_unitario, nit_proveedor } = req.body;

    try {
        const result = await pool.query(
            `UPDATE producto
             SET nombre = $1, precio_unitario = $2, nit_proveedor = $3
             WHERE codigo = $4 RETURNING *`,
            [nombre, precio_unitario, nit_proveedor, req.params.codigo]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23503') {
            return res.status(400).json({ error: 'El nit_proveedor no corresponde a ningún proveedor existente' });
        }
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// DELETE /api/productos/:codigo - borrar un producto
router.delete('/:codigo', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM producto WHERE codigo = $1 RETURNING *',
            [req.params.codigo]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado', producto: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (err.code === '23503') {
            return res.status(409).json({ error: 'No se puede eliminar: el producto tiene compras registradas' });
        }
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

module.exports = router;
