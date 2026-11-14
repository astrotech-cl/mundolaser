import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      onLogin(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 border-0" style={{ width: '400px' }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary mb-0">Mundo Láser</h2>
          <p className="text-muted small">Acceso al Panel de Control</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={manejarLogin}>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">Correo Electrónico</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold text-secondary">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 fw-bold">
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
