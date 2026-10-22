-- Datos de prueba del informe (sección 7). Ejecutar después de schema.sql.
-- Orden: proveedores → productos → clientes → compras, para respetar las llaves foráneas.

INSERT INTO proveedor (nit, nombre, direccion) VALUES
    ('900123456-7', 'Distribuidora del Norte', 'Calle 85 #50-20'),
    ('901234567-8', 'Tecnología Caribe',       'Carrera 46 #72-15');

INSERT INTO producto (codigo, nombre, precio_unitario, nit_proveedor) VALUES
    ('P001', 'Teclado mecánico',        150000, '900123456-7'),
    ('P002', 'Mouse inalámbrico',        85000, '900123456-7'),
    ('P003', 'Monitor LED 24 pulgadas', 650000, '901234567-8');

INSERT INTO cliente (id_cliente, nombre, apellidos, direccion, fecha_nacimiento) VALUES
    ('1001234567', 'Carlos', 'Rodríguez Pérez', 'Calle 80 #45-12',   '2000-05-15'),
    ('1002345678', 'María',  'Gómez López',     'Carrera 50 #70-25', '1998-08-22'),
    ('1003456789', 'Laura',  'Martínez Díaz',   'Calle 90 #55-30',   '2002-03-10');

-- Laura queda sin compras a propósito, para la consulta 2.
INSERT INTO compra (id_cliente, codigo_producto, cantidad, precio_compra, fecha_compra) VALUES
    ('1001234567', 'P001', 2, 150000, '2026-10-20'),
    ('1001234567', 'P002', 1,  85000, '2026-10-20'),
    ('1002345678', 'P003', 1, 650000, '2026-10-20');
