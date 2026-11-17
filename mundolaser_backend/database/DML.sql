-- Datos de ejemplo. Ejecutar una sola vez en una base de datos vacía.
INSERT INTO tickets (cliente, asunto, descripcion, estado, fecha) VALUES
('Librería Central', 'HP LaserJet Pro M404dn', 'Atasco de papel constante', 'Reparado', '2026-05-15 10:30:00'),
('Colegio San Jorge', 'HP Color LaserJet M255dw', 'Manchas de tóner en la impresión', 'Reparado', '2026-06-20 14:15:00'),
('Estudio de Abogados Lex', 'HP LaserJet Enterprise M507dn', 'Equipo no enciende', 'Reparado', '2026-04-10 09:00:00'),
('Constructora Beta', 'HP Neverstop 1000w', 'Error de conexión en red Wi-Fi', 'Reparado', '2026-07-05 16:45:00'),
('Notaría Pública 4', 'HP LaserJet Tank 2602sdw', 'Ruido fuerte al tomar las hojas', 'Reparado', '2026-03-25 11:20:00'),
('Agencia de Publicidad XYZ', 'HP Color LaserJet Pro M454dw', 'Cartucho magenta no reconocido', 'Pendiente', '2026-10-15 10:00:00'),
('Consultora Médica', 'HP LaserJet M111w', 'No conecta por cable USB', 'En Revisión', '2026-10-28 12:30:00'),
('Carlos Mendoza', 'HP LaserJet MFP M141w', 'Impresión sale muy pálida', 'Pendiente', '2026-11-01 15:00:00'),
('Municipalidad Centro', 'HP Color LaserJet MFP M283fdw', 'Falla en el alimentador superior ADF', 'En Revisión', '2026-09-15 08:45:00'),
('Universidad del Norte', 'HP Enterprise MFP M480f', 'Pantalla táctil congelada', 'Reparado', '2026-10-05 17:10:00');

-- DML para el directorio de Clientes
INSERT INTO clientes (nombre, telefono, email) VALUES
('Librería Central', '+56922334455', 'contacto@libreriacentral.cl'),
('Colegio San Jorge', '+56933445566', 'soporte@colegiosanjorge.cl'),
('Estudio de Abogados Lex', '+56911223344', 'informatica@estudiolex.cl'),
('Constructora Beta', '+56944556677', 'adquisiciones@constructorabeta.cl'),
('Notaría Pública 4', '+56955667788', 'contacto@notaria4.cl'),
('Agencia de Publicidad XYZ', '+56988990011', 'hola@agenciaxyz.cl'),
('Consultora Médica', '+56977889900', 'soporte@consultoramedica.cl'),
('Carlos Mendoza', '+56912345678', 'cmendoza@gmail.com'),
('Municipalidad Centro', '+56999887766', 'tecnologia@municipalidadcentro.cl'),
('Universidad del Norte', '+56966778899', 'ti@unorte.cl');

-- Crear el primer administrador mediante /api/registrar-admin con
-- BOOTSTRAP_ADMIN_SECRET configurado; el backend guarda la contraseña con bcrypt.