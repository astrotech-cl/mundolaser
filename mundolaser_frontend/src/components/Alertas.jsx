import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { api } from '../api';
import { formatearFecha } from '../utils/fecha';
import { ordenarPorCliente, ordenarPorFecha } from '../utils/ordenar';

const Alertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState('');
  const [ordenListado, setOrdenListado] = useState('cliente-asc');
  const alertasOrdenadas = ordenListado === 'cliente-desc'
    ? ordenarPorCliente(alertas, 'desc')
    : ordenListado === 'vencimiento-asc'
      ? ordenarPorFecha(alertas, 'fecha_vencimiento', 'asc')
      : ordenListado === 'vencimiento-desc'
        ? ordenarPorFecha(alertas, 'fecha_vencimiento', 'desc')
        : ordenListado === 'atencion-asc'
          ? ordenarPorFecha(alertas, 'fecha', 'asc')
          : ordenListado === 'atencion-desc'
            ? ordenarPorFecha(alertas, 'fecha', 'desc')
            : ordenarPorCliente(alertas);

  const obtenerAlertas = async () => {
    try {
      const data = await api('/api/alertas-garantia');
      setAlertas(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    let activo = true;
    api('/api/alertas-garantia').then(data => {
      if (activo) setAlertas(Array.isArray(data) ? data : []);
    }).catch(err => { if (activo) setError(err.message); });
    return () => { activo = false; };
  }, []);

  const contactar = async (alerta) => {
    const detalle = alerta.telefono ? ` (${alerta.telefono})` : '';
    const confirmar = window.confirm(
      `¿Marcar a ${alerta.cliente}${detalle} como contactado? La alerta dejará de mostrarse.`
    );
    if (!confirmar) return;

    try {
      await api(`/api/alertas-garantia/${alerta.id}/contactar`, { method: 'POST' });
      if (alerta.telefono) {
        window.location.assign(`tel:${alerta.telefono}`);
      }
      obtenerAlertas();
    } catch (err) {
      setError(err.message);
    }
  };

  const exportarAExcel = () => {
    if (alertas.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const datosExcel = alertas.map((alerta) => ({
      'ID Ticket': `#${alerta.id}`,
      Cliente: alerta.cliente,
      Teléfono: alerta.telefono || '',
      'Equipo / Falla': alerta.equipo,
      'Última atención': formatearFecha(alerta.fecha),
      'Vencimiento Garantía': formatearFecha(alerta.fecha_vencimiento),
      'Estado de Alerta': 'Vencida',
      'Acción Sugerida': 'Contactar'
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alertas Post-Venta');
    worksheet['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 16 },
      { wch: 45 },
      { wch: 18 },
      { wch: 22 },
      { wch: 15 },
      { wch: 15 }
    ];

    XLSX.writeFile(workbook, 'Reporte_Alertas_MundoLaser.xlsx');
  };

  return (
    <div className="app-content">
      <header className="page-heading">
        <div>
          <h1><span className="page-title-icon alert-title-icon"><i className="bi bi-bell-fill"></i></span>Alertas de Garantía</h1>
          <p>Equipos con más de 3 meses desde su última atención</p>
        </div>
        <div className="page-heading-actions d-flex align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="orden-alertas" className="form-label small fw-semibold mb-0 text-nowrap">Ordenar por</label>
            <select
              id="orden-alertas"
              className="form-select"
              value={ordenListado}
              onChange={(e) => setOrdenListado(e.target.value)}
            >
              <option value="cliente-asc">Cliente: A-Z</option>
              <option value="cliente-desc">Cliente: Z-A</option>
              <option value="vencimiento-asc">Vencimiento: ascendente</option>
              <option value="vencimiento-desc">Vencimiento: descendente</option>
              <option value="atencion-asc">Última atención: ascendente</option>
              <option value="atencion-desc">Última atención: descendente</option>
            </select>
          </div>
          <button
            onClick={exportarAExcel}
            className="btn btn-outline-success shadow-sm"
            disabled={alertas.length === 0}
          >
            <i className="bi bi-file-earmark-excel me-2"></i>Exportar Excel
          </button>
          <Link to="/dashboard" className="btn btn-primary shadow-sm">
            Volver al Taller
          </Link>
        </div>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card alert-card">
        <div className="card-header alert-card-header d-flex justify-content-between align-items-center">
          <span><i className="bi bi-exclamation-circle me-2"></i>Clientes a contactar para mantenimiento preventivo</span>
          <span className="badge rounded-pill text-bg-danger">{alertas.length}</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-center app-table">
              <thead className="table-light">
                <tr>
                  <th>ID Ticket</th>
                  <th className="text-start">Cliente</th>
                  <th className="text-start">Equipo / Falla</th>
                  <th>Última atención</th>
                  <th>Vencimiento Garantía (3 Meses)</th>
                  <th>Acción Sugerida</th>
                </tr>
              </thead>
              <tbody>
                {alertas.length > 0 ? (
                  alertasOrdenadas.map((alerta) => (
                    <tr key={alerta.id}>
                      <td className="fw-bold">#{alerta.id}</td>
                      <td className="text-start fw-bold">
                        {alerta.cliente}
                        {alerta.telefono && (
                          <div className="small text-muted fw-normal">{alerta.telefono}</div>
                        )}
                      </td>
                      <td className="text-start">{alerta.equipo}</td>
                      <td>{formatearFecha(alerta.fecha)}</td>
                      <td className="text-danger fw-bold">
                        {formatearFecha(alerta.fecha_vencimiento)}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-success fw-bold"
                          onClick={() => contactar(alerta)}
                        >
                          <i className="bi bi-telephone-outbound me-1"></i> Contactar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-muted py-5 text-center">
                      <i className="bi bi-check-circle text-success fs-3 d-block mb-2"></i>
                      No hay equipos con garantías vencidas en este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alertas;
