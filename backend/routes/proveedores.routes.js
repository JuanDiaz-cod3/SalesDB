const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/proveedores - listar todos los proveedores
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM proveedor ORDER BY nombre');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al consultar proveedores' });
    }
});

// GET /api/proveedores/:nit - obtener un proveedor
router.get('/:nit', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM proveedor WHERE nit = $1',
            [req.params.nit]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al consultar el proveedor' });
    }
});

// POST /api/proveedores - crear un proveedor
router.post('/', async (req, res) => {
    const { nit, nombre, direccion } = req.body;

    if (!nit || !nombre) {
        return res.status(400).json({ error: 'nit y nombre son obligatorios' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO proveedor (nit, nombre, direccion)
             VALUES ($1, $2, $3) RETURNING *`,
            [nit, nombre, direccion || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un proveedor con ese nit' });
        }
        res.status(500).json({ error: 'Error al crear el proveedor' });
    }
});

// PUT /api/proveedores/:nit - actualizar un proveedor
router.put('/:nit', async (req, res) => {
    const { nombre, direccion } = req.body;

    try {
        const result = await pool.query(
            `UPDATE proveedor SET nombre = $1, direccion = $2
             WHERE nit = $3 RETURNING *`,
            [nombre, direccion || null, req.params.nit]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el proveedor' });
    }
});

// DELETE /api/proveedores/:nit - borrar un proveedor
router.delete('/:nit', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM proveedor WHERE nit = $1 RETURNING *',
            [req.params.nit]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json({ mensaje: 'Proveedor eliminado', proveedor: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (err.code === '23503') {
            return res.status(409).json({ error: 'No se puede eliminar: el proveedor tiene productos asociados' });
        }
        res.status(500).json({ error: 'Error al eliminar el proveedor' });
    }
});

module.exports = router;
