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
    <section className="login-page">
      <div className="card login-card">
        <div className="text-center mb-4">
          <span className="login-brand-mark" aria-hidden="true"><i className="bi bi-printer-fill"></i></span>
          <h1>Mundo Láser</h1>
          <p className="text-muted mb-0">Ingresa para administrar el taller</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={manejarLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="login-email">Correo Electrónico</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold" htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2">
            <i className="bi bi-box-arrow-in-right me-2"></i>Ingresar al Sistema
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
