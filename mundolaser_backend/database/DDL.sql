-- Crear y seleccionar mundolaser_db antes de ejecutar este archivo.

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    cliente VARCHAR(150) NOT NULL,
    cliente_id INT REFERENCES clientes(id),
    asunto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    tipo_ticket VARCHAR(50) NOT NULL DEFAULT 'Falla',
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    alerta_contactada BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin'
);

CREATE TABLE reportes_tecnicos (
    id SERIAL PRIMARY KEY,
    ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    contador_paginas INT,
    nivel_toner VARCHAR(50),
    repuestos_cambiados TEXT,
    observaciones TEXT,
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historico_tickets (
    id SERIAL PRIMARY KEY,
    ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
