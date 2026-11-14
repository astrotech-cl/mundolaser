require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { timingSafeEqual } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const ESTADOS = ['Pendiente', 'En Revisión', 'Reparado'];
const NIVELES_TONER = ['100%', '75%', '50%', '25%', '0%', 'Bajo'];

if (!JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT) || 5432,
});

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

function exigirAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o vencida' });
  }
}

function textoRequerido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

function bootstrapSecretValido(secreto) {
  const esperado = process.env.BOOTSTRAP_ADMIN_SECRET;
  if (!esperado || typeof secreto !== 'string') {
    return false;
  }

  const esperadoBuffer = Buffer.from(esperado);
  const secretoBuffer = Buffer.from(secreto);
  return esperadoBuffer.length === secretoBuffer.length
    && timingSafeEqual(esperadoBuffer, secretoBuffer);
}

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!textoRequerido(email) || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email.trim()]);
    if (usuario.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.rows[0].password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.rows[0].id, rol: usuario.rows[0].rol },
      JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.json({ token, rol: usuario.rows[0].rol, mensaje: 'Bienvenido a Mundo Láser' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error en el servidor durante el login' });
  }
});

app.post('/api/registrar-admin', async (req, res) => {
  const { email, password } = req.body;
  if (!textoRequerido(email) || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Email válido y contraseña de al menos 6 caracteres' });
  }

  const client = await pool.connect();
  let transaccionIniciada = false;
  try {
    await client.query('BEGIN');
    transaccionIniciada = true;
    await client.query('SELECT pg_advisory_xact_lock($1)', [70120261104]);

    const existentes = await client.query('SELECT COUNT(*)::int AS total FROM usuarios');
    if (existentes.rows[0].total > 0) {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) {
        await client.query('ROLLBACK');
        transaccionIniciada = false;
        return res.status(403).json({ error: 'Ya existe un administrador' });
      }
      try {
        const usuario = jwt.verify(token, JWT_SECRET);
        if (usuario.rol !== 'admin') {
          await client.query('ROLLBACK');
          transaccionIniciada = false;
          return res.status(403).json({ error: 'Solo un administrador puede crear otro' });
        }
      } catch {
        if (transaccionIniciada) {
          await client.query('ROLLBACK');
          transaccionIniciada = false;
        }
        return res.status(401).json({ error: 'Sesión inválida o vencida' });
      }
    } else {
      if (!process.env.BOOTSTRAP_ADMIN_SECRET) {
        await client.query('ROLLBACK');
        transaccionIniciada = false;
        return res.status(503).json({
          error: 'El registro inicial está deshabilitado: configura BOOTSTRAP_ADMIN_SECRET'
        });
      }
      if (!bootstrapSecretValido(req.headers['x-bootstrap-secret'])) {
        await client.query('ROLLBACK');
        transaccionIniciada = false;
        return res.status(403).json({ error: 'Secreto de inicialización inválido' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);

    await client.query(
      "INSERT INTO usuarios (email, password, rol) VALUES ($1, $2, 'admin')",
      [email.trim(), passwordEncriptada]
    );

    await client.query('COMMIT');
    transaccionIniciada = false;
    res.json({ mensaje: 'Administrador creado exitosamente en la base de datos' });
  } catch (err) {
    if (transaccionIniciada) {
      await client.query('ROLLBACK');
    }
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al crear el administrador' });
  } finally {
    client.release();
  }
});

app.get('/api/tickets', exigirAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tickets ORDER BY fecha DESC, id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/tickets', exigirAuth, async (req, res) => {
  try {
    const clienteRaw = req.body.clienteId || req.body.cliente; 
    const equipo = req.body.modelo || req.body.equipo;
    const falla = req.body.descripcion || req.body.falla;
    const tipoTicket = req.body.tipoTicket || 'Falla';
    const estado = req.body.estado;
    const estadoFinal = estado || 'Pendiente';

    if (!(textoRequerido(clienteRaw) || Number.isInteger(clienteRaw)) || !textoRequerido(equipo) || !textoRequerido(falla)) {
      return res.status(400).json({ error: 'Cliente, equipo y falla son obligatorios' });
    }
    if (!ESTADOS.includes(estadoFinal)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    let nombreCliente = String(clienteRaw).trim();
    let clienteId = null;
    if (req.body.clienteId !== undefined) {
      if (!Number.isInteger(Number(req.body.clienteId)) || Number(req.body.clienteId) <= 0) {
        return res.status(400).json({ error: 'Cliente no válido' });
      }
      const clienteDb = await pool.query('SELECT id, nombre FROM clientes WHERE id = $1', [req.body.clienteId]);
      if (!clienteDb.rowCount) return res.status(404).json({ error: 'Cliente no encontrado' });
      nombreCliente = clienteDb.rows[0].nombre;
      clienteId = clienteDb.rows[0].id;
    } else {
      const coincidencias = await pool.query('SELECT id FROM clientes WHERE lower(trim(nombre)) = lower(trim($1))', [nombreCliente]);
      if (coincidencias.rowCount > 1) {
        return res.status(400).json({ error: 'Hay clientes con el mismo nombre. Selecciona uno por su identificador.' });
      }
      clienteId = coincidencias.rows[0]?.id || null;
    }

    // AHORA ESTÁN SEPARADOS: 'equipo' va a la columna 'asunto' y 'falla' a la columna 'descripcion'
    await pool.query(
      'INSERT INTO tickets (cliente, asunto, estado, tipo_ticket, descripcion, cliente_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [nombreCliente.trim(), equipo.trim(), estadoFinal, tipoTicket, falla.trim(), clienteId]
    );

    res.json({ mensaje: 'Ticket creado exitosamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al crear el ticket' });
  }
});

app.delete('/api/tickets/:id', exigirAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query('DELETE FROM reportes_tecnicos WHERE ticket_id = $1', [id]);
    await client.query('DELETE FROM historico_tickets WHERE ticket_id = $1', [id]);
    const result = await client.query('DELETE FROM tickets WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    await client.query('COMMIT');
    res.json({ mensaje: 'Ticket eliminado exitosamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Error al eliminar el ticket' });
  } finally {
    client.release();
  }
});

app.put('/api/tickets/:id', exigirAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    await client.query('BEGIN');
    const actual = await client.query('SELECT estado FROM tickets WHERE id = $1 FOR UPDATE', [id]);
    if (actual.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    if (actual.rows[0].estado !== estado) {
      await client.query(
        'INSERT INTO historico_tickets (ticket_id, estado_anterior, estado_nuevo) VALUES ($1, $2, $3)',
        [id, actual.rows[0].estado, estado]
      );
      await client.query('UPDATE tickets SET estado = $1 WHERE id = $2', [estado, id]);
    }
    await client.query('COMMIT');
    res.json({ mensaje: 'Estado actualizado exitosamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Error al actualizar el ticket' });
  } finally {
    client.release();
  }
});

app.get('/api/clientes', exigirAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, telefono, email FROM clientes ORDER BY nombre'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener los clientes' });
  }
});

app.post('/api/clientes', exigirAuth, async (req, res) => {
  try {
    const { nombre, telefono, email } = req.body;
    if (!textoRequerido(nombre)) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const correo = textoRequerido(email) ? email.trim() : null;
    await pool.query(
      'INSERT INTO clientes (nombre, telefono, email) VALUES ($1, $2, $3)',
      [nombre.trim(), textoRequerido(telefono) ? telefono.trim() : null, correo]
    );
    res.json({ mensaje: 'Cliente registrado' });
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ese correo ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar el cliente' });
  }
});

// NUEVO: Mejorado para incluir "Ventas" y "Fallas" en el cálculo de los 3 meses
app.get('/api/alertas-garantia', exigirAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, cliente, equipo, fecha, fecha_vencimiento, telefono, email, tipo_ticket
      FROM (
        SELECT DISTINCT ON (t.id)
          t.id,
          t.cliente,
          t.asunto AS equipo,
          t.tipo_ticket,
          COALESCE(r.ultima_atencion, t.fecha) AS fecha,
          (COALESCE(r.ultima_atencion, t.fecha) + INTERVAL '3 months') AS fecha_vencimiento,
          c.telefono,
          c.email
        FROM tickets t
        LEFT JOIN (
          SELECT ticket_id, MAX(fecha_reporte)::date AS ultima_atencion
          FROM reportes_tecnicos
          GROUP BY ticket_id
        ) r ON r.ticket_id = t.id
        LEFT JOIN clientes c ON c.id = t.cliente_id
        WHERE COALESCE(t.alerta_contactada, false) = false
          AND (COALESCE(r.ultima_atencion, t.fecha) + INTERVAL '3 months') <= CURRENT_DATE
        ORDER BY t.id, c.id
      ) alertas
      ORDER BY fecha_vencimiento ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener las alertas de garantía' });
  }
});

app.post('/api/alertas-garantia/:id/contactar', exigirAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE tickets SET alerta_contactada = true WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }
    res.json({ mensaje: 'Alerta marcada como contactada' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al marcar la alerta' });
  }
});

app.get('/api/reportes/:id', exigirAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reportes_tecnicos WHERE ticket_id = $1 ORDER BY fecha_reporte DESC, id DESC LIMIT 1',
      [req.params.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener el reporte técnico' });
  }
});

app.post('/api/reportes', exigirAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { ticket_id, contador_paginas, nivel_toner, repuestos_cambiados, observaciones } = req.body;
    const paginas = Number(contador_paginas);

    if (!ticket_id || !Number.isInteger(paginas) || paginas < 0) {
      return res.status(400).json({ error: 'El contador de páginas debe ser un número válido' });
    }
    if (!NIVELES_TONER.includes(nivel_toner)) {
      return res.status(400).json({ error: 'Nivel de tóner no válido' });
    }
    if (!textoRequerido(observaciones)) {
      return res.status(400).json({ error: 'Las observaciones son obligatorias' });
    }

    await client.query('BEGIN');
    const actual = await client.query('SELECT estado FROM tickets WHERE id = $1 FOR UPDATE', [ticket_id]);
    if (actual.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    await client.query(
      'INSERT INTO reportes_tecnicos (ticket_id, contador_paginas, nivel_toner, repuestos_cambiados, observaciones) VALUES ($1, $2, $3, $4, $5)',
      [ticket_id, paginas, nivel_toner, repuestos_cambiados || null, observaciones.trim()]
    );

    if (actual.rows[0].estado !== 'Reparado') {
      await client.query(
        'INSERT INTO historico_tickets (ticket_id, estado_anterior, estado_nuevo) VALUES ($1, $2, $3)',
        [ticket_id, actual.rows[0].estado, 'Reparado']
      );
    }
    await client.query('UPDATE tickets SET estado = $1, alerta_contactada = false WHERE id = $2', ['Reparado', ticket_id]);
    await client.query('COMMIT');

    res.json({ mensaje: 'Reporte técnico guardado y ticket cerrado exitosamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: 'Error al guardar el reporte técnico' });
  } finally {
    client.release();
  }
});

// NUEVO: Se agregará automáticamente la columna tipo_ticket en tu base de datos al arrancar
async function prepararBase() {
  await pool.query(`
    ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS alerta_contactada boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS tipo_ticket VARCHAR(50) DEFAULT 'Falla',
    ADD COLUMN IF NOT EXISTS cliente_id integer REFERENCES clientes(id)
  `);
  // Los nombres duplicados requieren revisión manual: no asignar un contacto al azar.
  await pool.query(`
    UPDATE tickets t SET cliente_id = c.id
    FROM (
      SELECT lower(trim(nombre)) AS nombre, MIN(id) AS id
      FROM clientes GROUP BY lower(trim(nombre)) HAVING COUNT(*) = 1
    ) c
    WHERE t.cliente_id IS NULL AND lower(trim(t.cliente)) = c.nombre
  `);
}

prepararBase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend de Mundo Láser conectado a PostgreSQL en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo preparar la base de datos:', err.message);
    process.exit(1);
  });