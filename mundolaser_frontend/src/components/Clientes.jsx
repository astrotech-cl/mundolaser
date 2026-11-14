import { useEffect, useState } from 'react';
import { api } from '../api';

const vacio = { nombre: '', telefono: '', email: '' };

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [formulario, setFormulario] = useState(vacio);
  const [error, setError] = useState('');

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
    <div className="container mt-4">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-0">
          <i className="bi bi-people-fill me-2"></i>Clientes
        </h2>
        <p className="text-muted mb-0">Listado de clientes registrados</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-dark text-white fw-bold">Registrar cliente</div>
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
              <button type="submit" className="btn btn-success fw-bold">Guardar cliente</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white fw-bold">
          <i className="bi bi-person-lines-fill me-2"></i>Base de clientes
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 text-center">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                </tr>
              </thead>
              <tbody>
                {clientes.length > 0 ? (
                  clientes.map((cliente) => (
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
