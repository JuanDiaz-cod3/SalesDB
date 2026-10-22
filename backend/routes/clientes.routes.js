const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/clientes - listar todos los clientes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM cliente ORDER BY nombre, apellidos'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al consultar clientes' });
    }
});

// GET /api/clientes/:id - obtener un cliente
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM cliente WHERE id_cliente = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al consultar el cliente' });
    }
});

// POST /api/clientes - crear un cliente
router.post('/', async (req, res) => {
    const { id_cliente, nombre, apellidos, direccion, fecha_nacimiento } = req.body;

    if (!id_cliente || !nombre || !apellidos) {
        return res.status(400).json({ error: 'id_cliente, nombre y apellidos son obligatorios' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO cliente (id_cliente, nombre, apellidos, direccion, fecha_nacimiento)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id_cliente, nombre, apellidos, direccion || null, fecha_nacimiento || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un cliente con esa identificación' });
        }
        res.status(500).json({ error: 'Error al crear el cliente' });
    }
});

// PUT /api/clientes/:id - actualizar un cliente
router.put('/:id', async (req, res) => {
    const { nombre, apellidos, direccion, fecha_nacimiento } = req.body;

    try {
        const result = await pool.query(
            `UPDATE cliente
             SET nombre = $1, apellidos = $2, direccion = $3, fecha_nacimiento = $4
             WHERE id_cliente = $5 RETURNING *`,
            [nombre, apellidos, direccion || null, fecha_nacimiento || null, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
});

// DELETE /api/clientes/:id - borrar un cliente
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM cliente WHERE id_cliente = $1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ mensaje: 'Cliente eliminado', cliente: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (err.code === '23503') {
            return res.status(409).json({ error: 'No se puede eliminar: el cliente tiene compras registradas' });
        }
        res.status(500).json({ error: 'Error al eliminar el cliente' });
    }
});

module.exports = router;
