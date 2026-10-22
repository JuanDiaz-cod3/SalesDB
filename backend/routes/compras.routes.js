const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/compras - listar todas las compras (pedidos)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, cl.nombre AS nombre_cliente, p.nombre AS nombre_producto
             FROM compra c
             JOIN cliente cl ON cl.id_cliente = c.id_cliente
             JOIN producto p ON p.codigo = c.codigo_producto
             ORDER BY c.fecha_compra DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al consultar las compras' });
    }
});

// GET /api/compras/:id - obtener un pedido
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, cl.nombre AS nombre_cliente, p.nombre AS nombre_producto
             FROM compra c
             JOIN cliente cl ON cl.id_cliente = c.id_cliente
             JOIN producto p ON p.codigo = c.codigo_producto
             WHERE c.id_compra = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al consultar el pedido' });
    }
});

// POST /api/compras - un cliente realiza un pedido de un producto
router.post('/', async (req, res) => {
    const { id_cliente, codigo_producto, cantidad, fecha_compra } = req.body;

    if (!id_cliente || !codigo_producto || !cantidad) {
        return res.status(400).json({ error: 'id_cliente, codigo_producto y cantidad son obligatorios' });
    }
    if (cantidad <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    try {
        // el precio se toma del precio_unitario del producto en este momento,
        // para que quede "congelado" en la compra aunque el producto cambie de precio despues
        const producto = await pool.query(
            'SELECT precio_unitario FROM producto WHERE codigo = $1',
            [codigo_producto]
        );
        if (producto.rows.length === 0) {
            return res.status(400).json({ error: 'El producto no existe' });
        }
        const precio_compra = producto.rows[0].precio_unitario;
        const fecha = fecha_compra || new Date().toISOString().slice(0, 10);

        const result = await pool.query(
            `INSERT INTO compra (id_cliente, codigo_producto, cantidad, precio_compra, fecha_compra)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id_cliente, codigo_producto, cantidad, precio_compra, fecha]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23503') {
            return res.status(400).json({ error: 'El cliente o el producto no existen' });
        }
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Ya existe una compra de ese cliente y producto en esa fecha' });
        }
        res.status(500).json({ error: 'Error al registrar la compra' });
    }
});

// PUT /api/compras/:id - corregir la cantidad o fecha de un pedido ya hecho
router.put('/:id', async (req, res) => {
    const { cantidad, fecha_compra } = req.body;

    if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    try {
        const result = await pool.query(
            `UPDATE compra SET cantidad = $1, fecha_compra = COALESCE($2, fecha_compra)
             WHERE id_compra = $3 RETURNING *`,
            [cantidad, fecha_compra || null, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar el pedido' });
    }
});

// DELETE /api/compras/:id - cancelar un pedido
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM compra WHERE id_compra = $1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }
        res.json({ mensaje: 'Pedido eliminado', pedido: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar el pedido' });
    }
});

module.exports = router;
