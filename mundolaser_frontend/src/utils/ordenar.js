export const ordenarPorCliente = (registros, direccion = 'asc') =>
  [...registros].sort((a, b) => {
    const comparacion = String(a.nombre || a.cliente || '').localeCompare(
      String(b.nombre || b.cliente || ''),
      'es',
      { sensitivity: 'base' }
    );
    return direccion === 'desc' ? -comparacion : comparacion;
  });

export const ordenarPorFecha = (registros, campo, direccion = 'asc') =>
  [...registros].sort((a, b) => {
    const fechaA = Date.parse(String(a[campo] || ''));
    const fechaB = Date.parse(String(b[campo] || ''));
    const fechaAInvalida = Number.isNaN(fechaA);
    const fechaBInvalida = Number.isNaN(fechaB);

    if (fechaAInvalida || fechaBInvalida) {
      if (fechaAInvalida && fechaBInvalida) return 0;
      return fechaAInvalida ? 1 : -1;
    }

    const comparacion = fechaA - fechaB;
    return direccion === 'desc' ? -comparacion : comparacion;
  });
