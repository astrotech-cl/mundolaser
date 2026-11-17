

export function Footer() {
  return (
    <footer className="app-footer py-3 mt-auto">
      <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small">
        <span className="text-secondary">
          © {new Date().getFullYear()} <strong className="text-dark">Mundo Láser</strong> — Sistema de Gestión Técnica
        </span>
        
        <span className="text-secondary">
          Desarrollado y soportado por{' '}
          <a
            href="https://astrotech.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="fw-bold text-decoration-none"
          >
            Astro Tech <i className="bi bi-box-arrow-up-right ms-1"></i>
          </a>
        </span>
      </div>
    </footer>
  );
}