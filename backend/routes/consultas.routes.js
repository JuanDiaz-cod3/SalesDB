const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// CONSULTA 1: clientes y la cantidad de pedidos realizados
router.get('/clientes-pedidos', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT cl.id_cliente, cl.nombre, cl.apellidos, COUNT(c.*) AS cantidad_pedidos
             FROM cliente cl
             LEFT JOIN compra c ON c.id_cliente = cl.id_cliente
             GROUP BY cl.id_cliente, cl.nombre, cl.apellidos
             ORDER BY cantidad_pedidos DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al ejecutar la consulta' });
    }
});

// CONSULTA 2: clientes que no realizaron ningun pedido
router.get('/clientes-sin-pedidos', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT cl.*
             FROM cliente cl
             LEFT JOIN compra c ON c.id_cliente = cl.id_cliente
             WHERE c.id_cliente IS NULL`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al ejecutar la consulta' });
    }
});

// CONSULTA 3: cliente, producto, cantidad comprada, precio de compra y proveedor
router.get('/detalle-compras', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT cl.nombre AS nombre_cliente,
                    cl.apellidos AS apellidos_cliente,
                    p.nombre AS nombre_producto,
                    c.cantidad,
                    c.precio_compra,
                    pr.nombre AS nombre_proveedor
             FROM compra c
             JOIN cliente cl ON cl.id_cliente = c.id_cliente
             JOIN producto p ON p.codigo = c.codigo_producto
             JOIN proveedor pr ON pr.nit = p.nit_proveedor
             ORDER BY c.fecha_compra DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al ejecutar la consulta' });
    }
});

// CONSULTA 4 (la segunda "CONSULTA 2" del documento): proveedores con los productos suministrados
router.get('/proveedores-productos', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT pr.nit, pr.nombre AS nombre_proveedor, p.codigo, p.nombre AS nombre_producto, p.precio_unitario
             FROM proveedor pr
             LEFT JOIN producto p ON p.nit_proveedor = pr.nit
             ORDER BY pr.nombre, p.nombre`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al ejecutar la consulta' });
    }
});

module.exports = router;
