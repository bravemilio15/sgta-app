const API_BASE = 'http://localhost:3004/api';
const NOTIFICACIONES_API = 'http://localhost:3001/api';

// Usuarios
export async function registrarUsuario(datos: any) {
  const response = await fetch(`${API_BASE}/usuarios/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function aprobarUsuario(uid: string) {
  const response = await fetch(`${API_BASE}/usuarios/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid })
  });
  return response.json();
}

export async function obtenerUsuarioPorUid(uid: string) {
  const response = await fetch(`${API_BASE}/usuarios/${uid}`);
  return response.json();
}

export async function obtenerUsuariosPendientes() {
  const response = await fetch(`${API_BASE}/usuarios?estado=Pendiente`);
  return response.json();
}

// Obtener todos los estudiantes
export async function obtenerEstudiantes() {
  const response = await fetch(`${API_BASE}/usuarios?tipo=estudiante`);
  return response.json();
}

// Obtener todos los docentes
export async function obtenerDocentes() {
  const response = await fetch(`${API_BASE}/usuarios?tipo=docente`);
  return response.json();
}

// Obtener estadísticas generales
export async function obtenerEstadisticas() {
  const response = await fetch(`${API_BASE}/usuarios/estadisticas`);
  return response.json();
}

// Notificaciones
export async function obtenerNotificaciones(uid: string) {
  const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/usuario/${uid}`);
  return response.json();
}

export async function marcarNotificacionLeida(notificacionId: string) {
  const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/${notificacionId}/leida`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

export async function marcarNotificacionNoLeida(notificacionId: string) {
  const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/${notificacionId}/no-leida`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

export async function eliminarNotificacion(notificacionId: string) {
  const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/${notificacionId}`, {
    method: 'DELETE'
  });
  return response.json();
}

export async function marcarTodasNotificacionesLeidas(uid: string) {
  const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/usuario/${uid}/marcar-todas-leidas`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

export async function crearNotificacion(datos: {
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  destinatarioUid: string;
  remitenteUid?: string;
  accionUrl?: string;
}) {
  const response = await fetch(`${NOTIFICACIONES_API}/notificaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function contarNotificacionesNoLeidas(uid: string) {
  const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/usuario/${uid}/conteo-no-leidas`);
  return response.json();
}

// Docentes
export async function registrarDocente(datos: any) {
  const response = await fetch(`${API_BASE}/usuarios/register-docente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return response.json();
}

