import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Footer } from './components/Footer';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Clientes from './components/Clientes';
import Alertas from './components/Alertas';

const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const iniciarSesion = (nuevoToken) => {
    localStorage.setItem('token', nuevoToken);
    setToken(nuevoToken);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        {token && (
          <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
            <div className="container">
              <span className="navbar-brand fw-bold text-primary">
                <i className="bi bi-printer-fill me-2"></i>Mundo Láser
              </span>
              <button className="navbar-toggler" type="button" onClick={() => setMenuAbierto(!menuAbierto)} aria-expanded={menuAbierto} aria-controls="navbarNav" aria-label="Abrir menú">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className={`collapse navbar-collapse${menuAbierto ? ' show' : ''}`} id="navbarNav">
                <div className="navbar-nav ms-auto align-items-center">
                  <NavLink to="/dashboard" className="nav-link" onClick={() => setMenuAbierto(false)}>Taller</NavLink>
                  <NavLink to="/clientes" className="nav-link" onClick={() => setMenuAbierto(false)}>Clientes</NavLink>
                  <NavLink to="/alertas" className="nav-link text-danger" onClick={() => setMenuAbierto(false)}>
                    <i className="bi bi-bell-fill me-1"></i>Alertas Post-Venta
                  </NavLink>
                  <button onClick={cerrarSesion} className="btn btn-outline-danger btn-sm ms-lg-3 mt-2 mt-lg-0 fw-bold">
                    <i className="bi bi-box-arrow-right me-1"></i>Salir
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}

        <main className="flex-grow-1">
          <Routes>
            <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login onLogin={iniciarSesion} />} />

            <Route path="/dashboard" element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            } />

            <Route path="/clientes" element={
              <RutaProtegida>
                <Clientes />
              </RutaProtegida>
            } />

            <Route path="/alertas" element={
              <RutaProtegida>
                <Alertas />
              </RutaProtegida>
            } />

            <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;