import React, { useState, useEffect } from 'react';
import { formatearFecha } from '../utils/fecha';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  // Formulario superior: Crear Nuevo Ticket
  const [nuevoTicket, setNuevoTicket] = useState({
    cliente: '',
    equipo: '',
    falla: '',
    estado: 'Pendiente'
  });

  // Control de fila desplegable (histórico o cierre)
  const [ticketActivo, setTicketActivo] = useState(null);
  const [historicoActual, setHistoricoActual] = useState(null);
  const [cargandoHistorico, setCargandoHistorico] = useState(false);

  // Parámetros de servicio técnico para cerrar ticket
  const [parametros, setParametros] = useState({
    contador_paginas: '',
    nivel_toner: '100%',
    repuestos_cambiados: '',
    observaciones: ''
  });

  // Petición autorizada con Token JWT y rutas relativas
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const resp = await fetch(url, { ...options, headers });
      if (resp.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return null;
      }
      return resp;
    } catch (err) {
      console.error(`Error de red en ${url}:`, err);
      return null;
    }
  };

  // 1. Cargar tickets y clientes desde la base de datos
  const obtenerDatos = async () => {
    const respTickets = await authFetch('/api/tickets');
    if (respTickets && respTickets.ok) {
      const data = await respTickets.json();
      setTickets(Array.isArray(data) ? data : (data.tickets || []));
    } else {
      setTickets([]);
    }

    const respClientes = await authFetch('/api/clientes');
    if (respClientes && respClientes.ok) {
      const dataCli = await respClientes.json();
      setClientes(Array.isArray(dataCli) ? dataCli : (dataCli.clientes || []));
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  // 2. Crear ticket desde el formulario superior
  const crearTicket = async (e) => {
    e.preventDefault();
    if (!nuevoTicket.cliente || !nuevoTicket.equipo || !nuevoTicket.falla) {
      alert('Por favor completa todos los campos del nuevo ticket.');
      return;
    }

    const resp = await authFetch('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        cliente: nuevoTicket.cliente,
        equipo: nuevoTicket.equipo,
        falla: nuevoTicket.falla,
        asunto: `${nuevoTicket.equipo} - ${nuevoTicket.falla}`,
        estado: nuevoTicket.estado
      })
    });

    if (resp && resp.ok) {
      setNuevoTicket({ cliente: '', equipo: '', falla: '', estado: 'Pendiente' });
      obtenerDatos();
    }
  };

  // 3. Eliminar ticket
  const eliminarTicket = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este ticket?')) return;
    const resp = await authFetch(`/api/tickets/${id}`, { method: 'DELETE' });
    if (resp && resp.ok) {
      obtenerDatos();
    }
  };

  // 4. Verificación de estado cerrado
  const esTicketCerrado = (estado) => {
    if (!estado) return false;
    const est = estado.toLowerCase();
    return est.includes('reparado') || est.includes('entregado');
  };

  // 5. Manejar cambio de estado en el dropdown
  const manejarCambioEstado = async (ticket, nuevoEstado) => {
    if (esTicketCerrado(nuevoEstado)) {
      setTicketActivo(ticket.id);
      setHistoricoActual(null);
      setParametros({ contador_paginas: '', nivel_toner: '100%', repuestos_cambiados: '', observaciones: '' });
      return;
    }

    const resp = await authFetch(`/api/tickets/${ticket.id}`, {
      method: 'PUT',
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (resp && resp.ok) {
      obtenerDatos();
    }
  };

  // 6. Guardar reporte técnico (cierre definitivo y comienzo de garantía)
  const guardarReporte = async (e, idTicket) => {
    e.preventDefault();
    const resp = await authFetch('/api/reportes', {
      method: 'POST',
      body: JSON.stringify({ ticket_id: idTicket, ...parametros })
    });

    if (resp && resp.ok) {
      setTicketActivo(null);
      setParametros({ contador_paginas: '', nivel_toner: '100%', repuestos_cambiados: '', observaciones: '' });
      obtenerDatos();
    }
  };

  // 7. Alternar panel: Ver Histórico o abrir Formulario
  const toggleDetalleTicket = async (ticket) => {
    if (ticketActivo === ticket.id) {
      setTicketActivo(null);
      setHistoricoActual(null);
      return;
    }

    setTicketActivo(ticket.id);

    if (esTicketCerrado(ticket.estado)) {
      setCargandoHistorico(true);
      const resp = await authFetch(`/api/reportes/${ticket.id}`);
      if (resp && resp.ok) {
        const data = await resp.json();
        setHistoricoActual(data);
      } else {
        setHistoricoActual(null);
      }
      setCargandoHistorico(false);
    } else {
      setHistoricoActual(null);
      setParametros({ contador_paginas: '', nivel_toner: '100%', repuestos_cambiados: '', observaciones: '' });
    }
  };

  // Filtro combinado: Búsqueda por texto + Selector de Estado
  const listaTickets = Array.isArray(tickets) ? tickets : [];
  const ticketsFiltrados = listaTickets.filter((t) => {
    if (!t) return false;

    const texto = (busqueda || '').toLowerCase().trim();
    const cliente = (t.cliente || '').toLowerCase();
    const equipo = (t.equipo || t.asunto || '').toLowerCase();
    const id = (t.id || '').toString();
    const coincideTexto = !texto || cliente.includes(texto) || equipo.includes(texto) || id.includes(texto);

    const estadoTicket = (t.estado || '').toLowerCase();
    const coincideEstado = !filtroEstado || estadoTicket.includes(filtroEstado.toLowerCase());

    return coincideTexto && coincideEstado;
  });

  return (
    <div className="container-fluid py-3 px-4">
      {/* SECCIÓN SUPERIOR: FORMULARIO REGISTRAR NUEVO TICKET */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-dark text-white fw-bold py-2 d-flex align-items-center">
          <i className="bi bi-plus-circle me-2"></i>Registrar Nuevo Ticket
        </div>
        <div className="card-body bg-light">
          <form onSubmit={crearTicket} className="row g-2 align-items-center">
            <div className="col-md-3">
              <input
                type="text"
                list="lista-clientes-dash"
                className="form-control"
                placeholder="Seleccionar o escribir Cliente..."
                value={nuevoTicket.cliente}
                onChange={(e) => setNuevoTicket({ ...nuevoTicket, cliente: e.target.value })}
                required
              />
              <datalist id="lista-clientes-dash">
                {clientes.map((c) => (
                  <option key={c.id || c.nombre} value={c.nombre} />
                ))}
              </datalist>
            </div>

            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Modelo del Equipo (Ej: HP LaserJet M111w)"
                value={nuevoTicket.equipo}
                onChange={(e) => setNuevoTicket({ ...nuevoTicket, equipo: e.target.value })}
                required
              />
            </div>

            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Descripción (Falla / Detalles)"
                value={nuevoTicket.falla}
                onChange={(e) => setNuevoTicket({ ...nuevoTicket, falla: e.target.value })}
                required
              />
            </div>

            <div className="col-md-2 text-end">
              <button type="submit" className="btn btn-success fw-bold w-100">
                <i className="bi bi-box-arrow-in-down me-1"></i>Guardar Ticket
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: LISTADO DE TICKETS */}
      <div className="bg-primary text-white p-3 rounded-top d-flex justify-content-between align-items-center shadow-sm">
        <h5 className="fw-bold mb-0">
          <i className="bi bi-list-task me-2"></i>Tickets Registrados
        </h5>
        <span className="badge bg-white text-primary fw-bold">
          {ticketsFiltrados.length} resultados
        </span>
      </div>

      <div className="bg-white p-3 rounded-bottom shadow-sm border mb-4">
        {/* Barra de Filtro */}
        <div className="row g-2 mb-3">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por cliente, equipo o ID del ticket..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select text-muted"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Reparado">Reparado / Entregado</option>
            </select>
          </div>
        </div>

        {/* Tabla Principal */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 text-center">
            <thead className="table-light">
              <tr className="text-secondary small">
                <th>ID</th>
                <th>Cliente</th>
                <th>Equipo</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.length > 0 ? (
                ticketsFiltrados.map((ticket) => (
                  <React.Fragment key={ticket.id}>
                    <tr>
                      <td className="fw-bold">#{ticket.id}</td>
                      <td>{ticket.cliente}</td>
                      <td>{ticket.equipo || ticket.asunto}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => toggleDetalleTicket(ticket)}
                          className="btn btn-sm btn-link text-decoration-none p-0"
                        >
                          <span className={`badge me-1 ${esTicketCerrado(ticket.estado) ? 'bg-success' : 'bg-secondary'}`}>
                            {esTicketCerrado(ticket.estado) ? 'Reporte' : 'Falla'}
                          </span>
                          <span className="fst-italic text-muted">
                            {esTicketCerrado(ticket.estado) ? 'Ver Histórico' : 'Ver en Equipo'}
                          </span>
                        </button>
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm fw-bold border-0 shadow-sm ${esTicketCerrado(ticket.estado)
                              ? 'text-success bg-success-subtle'
                              : ticket.estado === 'En Revisión'
                                ? 'text-warning bg-warning-subtle'
                                : 'text-secondary bg-secondary-subtle'
                            }`}
                          value={esTicketCerrado(ticket.estado) ? 'Reparado / Entregado' : ticket.estado}
                          onChange={(e) => manejarCambioEstado(ticket, e.target.value)}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Revisión">En Revisión</option>
                          <option value="Reparado / Entregado">Reparado / Entregado</option>
                        </select>
                      </td>
                      <td>{formatearFecha(ticket.fecha)}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleDetalleTicket(ticket)}
                            className="btn btn-sm btn-outline-success"
                            title="Ver Histórico / Parámetros"
                          >
                            <i className="bi bi-tools"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarTicket(ticket.id)}
                            className="btn btn-sm btn-outline-danger"
                            title="Eliminar Ticket"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Fila Desplegable: Histórico Guardado o Formulario de Cierre */}
                    {ticketActivo === ticket.id && (
                      <tr>
                        <td colSpan="7" className="bg-light p-4 border-start border-4 border-success text-start">
                          {esTicketCerrado(ticket.estado) ? (
                            <div>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold text-success mb-0">
                                  <i className="bi bi-file-earmark-check me-2"></i>
                                  Histórico de Servicio - Ticket #{ticket.id}
                                </h6>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => { setTicketActivo(null); setHistoricoActual(null); }}
                                >
                                  Cerrar Vista
                                </button>
                              </div>

                              {cargandoHistorico ? (
                                <p className="text-muted mb-0">Cargando reporte técnico...</p>
                              ) : historicoActual ? (
                                <div className="row g-3 bg-white p-3 rounded border">
                                  <div className="col-md-3">
                                    <span className="fw-bold d-block text-secondary small">Contador de Páginas:</span>
                                    <span className="fs-6 fw-bold">{historicoActual.contador_paginas || 'N/A'}</span>
                                  </div>
                                  <div className="col-md-3">
                                    <span className="fw-bold d-block text-secondary small">Nivel de Tóner:</span>
                                    <span className="badge bg-info text-dark">{historicoActual.nivel_toner || 'N/A'}</span>
                                  </div>
                                  <div className="col-md-6">
                                    <span className="fw-bold d-block text-secondary small">Repuestos Cambiados:</span>
                                    <span>{historicoActual.repuestos_cambiados || 'Ninguno'}</span>
                                  </div>
                                  <div className="col-12 mt-2 pt-2 border-top">
                                    <span className="fw-bold d-block text-secondary small">Observaciones del Técnico:</span>
                                    <p className="mb-0 text-dark">{historicoActual.observaciones || 'Sin observaciones'}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="alert alert-warning mb-0 py-2">
                                  No hay parámetros técnicos registrados para este ticket.
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <h6 className="fw-bold text-primary mb-3">
                                <i className="bi bi-tools me-2"></i>
                                Ingresar Parámetros de Servicio - Ticket #{ticket.id}
                              </h6>
                              <form onSubmit={(e) => guardarReporte(e, ticket.id)} className="row g-3">
                                <div className="col-md-3">
                                  <label className="form-label small fw-bold">Contador de Páginas</label>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    placeholder="Ej: 35000"
                                    value={parametros.contador_paginas}
                                    onChange={(e) => setParametros({ ...parametros, contador_paginas: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="col-md-3">
                                  <label className="form-label small fw-bold">Nivel de Tóner (%)</label>
                                  <select
                                    className="form-select form-select-sm"
                                    value={parametros.nivel_toner}
                                    onChange={(e) => setParametros({ ...parametros, nivel_toner: e.target.value })}
                                  >
                                    <option value="100%">100% (Nuevo)</option>
                                    <option value="75%">75%</option>
                                    <option value="50%">50%</option>
                                    <option value="25%">25%</option>
                                    <option value="Bajo">Bajo</option>
                                  </select>
                                </div>
                                <div className="col-md-6">
                                  <label className="form-label small fw-bold">Repuestos Cambiados</label>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Ej: Rodillo de presión, fusor, pick-up roller..."
                                    value={parametros.repuestos_cambiados}
                                    onChange={(e) => setParametros({ ...parametros, repuestos_cambiados: e.target.value })}
                                  />
                                </div>
                                <div className="col-12">
                                  <label className="form-label small fw-bold">Observaciones del Técnico</label>
                                  <textarea
                                    className="form-control form-control-sm"
                                    rows="2"
                                    placeholder="Detalles del mantenimiento o falla resuelta..."
                                    value={parametros.observaciones}
                                    onChange={(e) => setParametros({ ...parametros, observaciones: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="col-12 text-end">
                                  <button
                                    type="button"
                                    onClick={() => setTicketActivo(null)}
                                    className="btn btn-sm btn-secondary me-2"
                                  >
                                    Cancelar
                                  </button>
                                  <button type="submit" className="btn btn-sm btn-success fw-bold">
                                    <i className="bi bi-shield-check me-1"></i> Guardar en Histórico y Comenzar Garantía
                                  </button>
                                </div>
                              </form>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-muted py-4">No se encontraron tickets registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;