import { useEffect, useState } from 'react';
import { api } from '../api';
import { ordenarPorCliente } from '../utils/ordenar';

const vacio = { nombre: '', telefono: '', email: '' };

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [formulario, setFormulario] = useState(vacio);
  const [error, setError] = useState('');
  const clientesOrdenados = ordenarPorCliente(clientes);

  const obtenerClientes = async () => {
    try {
      const data = await api('/api/clientes');
      setClientes(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message);
      setClientes([]);
    }
  };

  useEffect(() => {
    let activo = true;
    api('/api/clientes').then(data => {
      if (activo) setClientes(Array.isArray(data) ? data : []);
    }).catch(err => { if (activo) setError(err.message); });
    return () => { activo = false; };
  }, []);

  const crearCliente = async (e) => {
    e.preventDefault();
    try {
      await api('/api/clientes', {
        method: 'POST',
        body: JSON.stringify(formulario)
      });
      setFormulario(vacio);
      obtenerClientes();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-content">
      <header className="page-heading">
        <div>
          <h1><span className="page-title-icon"><i className="bi bi-people-fill"></i></span>Clientes</h1>
          <p>Administra la información de tus clientes</p>
        </div>
        <span className="badge rounded-pill text-bg-light border px-3 py-2">{clientes.length} registrados</span>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-dark text-white">
          <i className="bi bi-person-plus me-2"></i>Registrar cliente
        </div>
        <div className="card-body">
          <form onSubmit={crearCliente} className="row g-3">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Nombre"
                value={formulario.nombre}
                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                required
              />
            </div>
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Teléfono"
                value={formulario.telefono}
                onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <input
                type="email"
                className="form-control"
                placeholder="Correo"
                value={formulario.email}
                onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
              />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-primary">Guardar cliente</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <i className="bi bi-person-lines-fill me-2"></i>Base de clientes
          <span className="badge rounded-pill text-bg-light">{clientes.length}</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-center app-table">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                </tr>
              </thead>
              <tbody>
                {clientesOrdenados.length > 0 ? (
                  clientesOrdenados.map((cliente) => (
                    <tr key={cliente.id}>
                      <td className="fw-bold">#{cliente.id}</td>
                      <td>{cliente.nombre}</td>
                      <td>{cliente.telefono || 'Sin teléfono'}</td>
                      <td>{cliente.email || 'Sin correo'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-muted py-5 text-center">
                      <i className="bi bi-info-circle fs-3 d-block mb-2"></i>
                      No hay clientes registrados en este momento.
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

export default Clientes;
