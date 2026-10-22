CREATE DATABASE salesdb;

CREATE TABLE proveedor(
    nit VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200)
);

CREATE TABLE producto (
    codigo VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    nit_proveedor VARCHAR(20) NOT NULL REFERENCES proveedor(nit)
);

CREATE TABLE cliente (
    id_cliente VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    fecha_nacimiento DATE                                        
);                                                        

CREATE TABLE compra (
    id_compra SERIAL PRIMARY KEY,
    id_cliente VARCHAR(20) NOT NULL REFERENCES cliente(id_cliente),
    codigo_producto VARCHAR(20) NOT NULL REFERENCES producto(codigo),
    cantidad INT NOT NULL,
    precio_compra DECIMAL(10, 2) NOT NULL,
    fecha_compra DATE NOT NULL
);
