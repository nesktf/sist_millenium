// Utilidades para manejo de fechas en zona horaria de Buenos Aires

/**
 * Formatea una fecha a string legible en zona horaria de Buenos Aires
 */
export function formatDateAR(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Formatea una fecha con hora en zona horaria de Buenos Aires
 */
export function formatDateTimeAR(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Obtiene la fecha actual en Buenos Aires en formato YYYY-MM-DD
 */
export function getTodayAR(): string {
  const now = new Date();
  const arDate = new Date(now.toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires'
  }));
  
  const year = arDate.getFullYear();
  const month = String(arDate.getMonth() + 1).padStart(2, '0');
  const day = String(arDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Convierte un input de fecha (YYYY-MM-DD) a Date ajustado para Buenos Aires
 * Esto evita problemas de zona horaria al guardar
 */
export function parseInputDateAR(dateString: string): Date {
  // Crear fecha en zona horaria de Buenos Aires
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0); // Usar mediodía para evitar problemas
  return date;
}