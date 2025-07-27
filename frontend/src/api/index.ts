const API_BASE = 'http://localhost:3004/api';
const ASIGNATURAS_API = 'http://localhost:3005/api';
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

// Registrar estudiante con matrículas
export async function registrarEstudianteConMatriculas(datos: {
  // Datos del estudiante
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  identificacion: string;
  tipoIdentificacion: string;
  correoPersonal: string;
  correoUsuario: string;
  // Datos de matrículas
  asignaturasIds: string[];
  periodoId: string;
}) {
  const response = await fetch(`${API_BASE}/usuarios/register-with-matriculas`, {
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
const API_BASE_URL = 'http://localhost:3003/api/tareas';

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

// Asignaturas
export async function crearAsignatura(datos: any) {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/crear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function obtenerAsignaturas() {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/todas`);
  return response.json();
}

export async function obtenerAsignaturaPorId(id: string) {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/${id}`);
  return response.json();
}

export async function editarAsignatura(id: string, datos: any) {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function eliminarAsignatura(id: string) {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/${id}`, {
    method: 'DELETE'
  });
  return response.json();
}

export async function obtenerAsignaturasPorDocente(docenteUid: string) {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/docente/${docenteUid}`);
  return response.json();
}

export async function agregarEstudianteAAsignatura(asignaturaId: string, estudianteUid: string) {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/agregar-estudiante`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asignaturaId, estudianteUid })
  });
  return response.json();
}

export async function removerEstudianteDeAsignatura(asignaturaId: string, estudianteUid: string) {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/remover-estudiante`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asignaturaId, estudianteUid })
  });
  return response.json();
}

export async function asignarDocenteAAsignatura(asignaturaId: string, docenteUid: string) {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/asignar-docente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asignaturaId, docenteUid })
  });
  return response.json();
}

// Solicitar recuperación de contraseña
export async function solicitarRecuperacionContrasena(correoPersonal: string) {
  const response = await fetch(`${API_BASE}/usuarios/solicitar-recuperacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correoPersonal })
  });
  return response.json();
}

// Cambiar contraseña con token
export async function cambiarContrasenaConToken(token: string, uid: string, nuevaContrasena: string) {
  const response = await fetch(`${API_BASE}/usuarios/cambiar-contrasena`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, uid, nuevaContrasena })
  });
  return response.json();
}

// Períodos Académicos
export async function obtenerPeriodosAcademicos() {
  const response = await fetch(`${API_BASE}/usuarios/periodos-academicos`);
  if (!response.ok) {
    throw new Error(`Error al obtener períodos académicos: ${response.status}`);
  }
  return response.json();
}

export async function obtenerPeriodoActivo() {
  const response = await fetch(`${API_BASE}/usuarios/periodos-academicos/activo`);
  return response.json();
}

export async function crearPeriodoAcademico(datos: {
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: string;
  estado: string;
  descripcion?: string;
}) {
  const response = await fetch(`${API_BASE}/usuarios/periodos-academicos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function actualizarPeriodoAcademico(id: string, datos: {
  nombre?: string;
  fechaInicio?: string;
  fechaFin?: string;
  tipo?: string;
  descripcion?: string;
  estado?: string;
}) {
  const response = await fetch(`${API_BASE}/usuarios/periodos-academicos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function eliminarPeriodoAcademico(id: string) {
  const response = await fetch(`${API_BASE}/usuarios/periodos-academicos/${id}`, {
    method: 'DELETE'
  });
  return response.json();
}

export async function activarPeriodoAcademico(id: string) {
  const response = await fetch(`${API_BASE}/usuarios/periodos-academicos/${id}/activar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

export async function finalizarPeriodoAcademico(id: string) {
  const response = await fetch(`${API_BASE}/usuarios/periodos-academicos/${id}/finalizar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

export async function obtenerPeriodosPorEstado(estado: string) {
  const response = await fetch(`${API_BASE}/usuarios/periodos-academicos/estado/${estado}`);
  if (!response.ok) {
    throw new Error(`Error al obtener períodos por estado: ${response.status}`);
  }
  return response.json();
}

// Matrículas
export async function crearMatricula(datos: {
  estudianteUid: string;
  asignaturaId: string;
  periodoId: string;
}) {
  const response = await fetch(`${API_BASE}/usuarios/matriculas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function crearMatriculasMasivas(datos: {
  estudianteUid: string;
  asignaturasIds: string[];
  periodoId: string;
}) {
  const response = await fetch(`${API_BASE}/usuarios/matriculas/masivas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function obtenerMatriculasEstudiante(estudianteUid: string, periodoId?: string) {
  const url = periodoId 
    ? `${API_BASE}/usuarios/matriculas/estudiante/${estudianteUid}?periodoId=${periodoId}`
    : `${API_BASE}/usuarios/matriculas/estudiante/${estudianteUid}`;
  const response = await fetch(url);
  return response.json();
}

export async function asignarNotaUnidad(matriculaId: string, tipoUnidad: 'AA' | 'APE' | 'ACD', nota: number) {
  const response = await fetch(`${API_BASE}/usuarios/matriculas/${matriculaId}/unidad`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipoUnidad, nota })
  });
  return response.json();
}

// Tareas
export async function obtenerTareasDocente(token: string) {
  const response = await fetch(`${API_BASE_URL}/docente`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function eliminarTarea(tareaId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/${tareaId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function crearTarea(datos: any, token: string) {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function actualizarTarea(tareaId: string, datos: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/${tareaId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function obtenerTarea(tareaId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/${tareaId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function obtenerDashboardEstudiante(token: string) {
  const response = await fetch(`${API_BASE_URL}/estudiante/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Entregas y calificaciones
export async function calificarEntrega(entregaId: string, calificacion: number, comentarios: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/entregas/${entregaId}/calificar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ calificacion, comentarios })
  });
  return response.json();
}

export async function obtenerEntregasTarea(tareaId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/${tareaId}/entregas`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function entregarTarea(tareaId: string, datos: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/${tareaId}/entregar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function obtenerEntrega(entregaId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/entregas/${entregaId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function actualizarEntrega(entregaId: string, datos: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/entregas/${entregaId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function eliminarEntrega(entregaId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/entregas/${entregaId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Funciones adicionales faltantes
export async function gestionarEntrega(tareaId: string, datos: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/${tareaId}/entregar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function obtenerEntregaPorEstudianteTarea(tareaId: string, estudianteId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/${tareaId}/entregas/estudiante/${estudianteId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function obtenerDetalleTarea(tareaId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/${tareaId}/detalle`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

