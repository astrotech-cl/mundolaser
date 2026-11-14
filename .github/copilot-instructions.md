# Instrucciones para Copilot

## Comandos

El frontend y el backend son paquetes independientes; ejecuta los comandos desde la carpeta correspondiente.

### Frontend (`mundolaser_frontend`)

- `npm run dev`: inicia Vite en desarrollo.
- `npm run build`: genera la compilación de producción en `dist`.
- `npm run preview`: sirve localmente la compilación generada.
- `npm run lint`: ejecuta ESLint sobre el frontend.

No hay un runner ni scripts de pruebas configurados en el frontend, así que no existe un comando para ejecutar una prueba individual.

### Backend (`mundolaser_backend`)

- `npm run dev`: inicia la API con Nodemon.
- `npm start`: inicia la API con Node.

No hay pruebas del backend configuradas. El script `npm test` actual es solo un marcador que termina con error; no lo uses como verificación de pruebas.

## Arquitectura

- La aplicación es un sistema de gestión de tickets de servicio, clientes, reportes técnicos y alertas de garantía.
- `mundolaser_frontend` es una SPA de React 19 con Vite y React Router. `src/App.jsx` define las rutas, protege las páginas del panel con el token de sesión y conecta las vistas `Dashboard`, `Clientes` y `Alertas`. `Login` inicia la sesión.
- `mundolaser_frontend/src/api.js` centraliza las solicitudes HTTP: usa `VITE_API_URL` (por defecto `http://localhost:3000`), agrega el token JWT y procesa errores 401 redirigiendo al inicio de sesión.
- `mundolaser_backend/index.js` contiene la API Express y la lógica de negocio. Usa `pg` para PostgreSQL y JWT para proteger las rutas operativas. Sus endpoints cubren autenticación y registro de administradores, tickets, clientes, reportes técnicos y alertas de garantía.
- PostgreSQL almacena clientes, tickets, usuarios, historial de cambios de estado y reportes técnicos. `mundolaser_backup.sql` y `mundolaser_plano.sql` son volcados de la base de datos. Al arrancar, el backend añade a `tickets` las columnas `alerta_contactada` y `tipo_ticket` si faltan; no crea el resto del esquema.
- El frontend y el backend tienen dependencias y comandos propios. Para desarrollo, configura el backend con `mundolaser_backend/.env.example` y el frontend con `VITE_API_URL` si la API no está en la dirección local predeterminada. No incluyas valores secretos en el código ni en los volcados.

## Convenciones y reglas de dominio

- La interfaz y los mensajes de la API están en español; conserva ese idioma y el vocabulario existente al modificar textos visibles.
- Los estados válidos de ticket son exactamente `Pendiente`, `En Revisión` y `Reparado`. Mantén estos valores sincronizados entre la validación del backend y los controles del frontend.
- Los tipos de ticket que ofrece la interfaz son `Falla` y `Venta`. En la base de datos, el modelo/equipo del ticket se guarda en `tickets.asunto`, y su descripción en `tickets.descripcion`.
- Los datos del panel viajan por `api()` desde `src/api.js`; reutiliza ese helper para conservar el encabezado de autenticación y el manejo de errores de sesión.
- Las consultas PostgreSQL usan parámetros posicionales (`$1`, `$2`, etc.). Conserva este patrón y las transacciones existentes cuando una operación actualiza entidades relacionadas, como el ticket y su historial o reporte.
- Guardar un reporte técnico cambia el estado del ticket a `Reparado` y registra el cambio en `historico_tickets`. Las alertas vencen tres meses después del último reporte técnico o, si no hay reportes, de la fecha del ticket; al marcar una alerta como contactada, deja de aparecer.
