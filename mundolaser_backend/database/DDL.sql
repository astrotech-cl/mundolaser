CREATE DATABASE mundolaser_db;

\c mundolaser_db;

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    cliente VARCHAR(150) NOT NULL,
    asunto VARCHAR(255) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_DATE
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'admin'
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE reportes_tecnicos (
    id SERIAL PRIMARY KEY,
    ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
    contador_paginas INT,
    nivel_toner VARCHAR(50),
    repuestos_cambiados TEXT,
    observaciones TEXT,
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE historico_tickets (
  id SERIAL PRIMARY KEY,
  ticket_id INT,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
