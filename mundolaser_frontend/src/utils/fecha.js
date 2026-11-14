export const formatearFecha = (valor) => {
  if (!valor) return 'N/A';

  const fechaISO = typeof valor === 'string' && valor.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (fechaISO) {
    return `${fechaISO[3]}-${fechaISO[2]}-${fechaISO[1].slice(-2)}`;
  }

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return 'N/A';

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = String(fecha.getFullYear()).slice(-2);
  return `${dia}-${mes}-${anio}`;
};
