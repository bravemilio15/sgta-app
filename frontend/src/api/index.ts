const API_BASE = 'http://localhost:3004/api';
const ASIGNATURAS_API = 'http://localhost:3005/api';
const NOTIFICACIONES_API = 'http://localhost:3001/api';

// Usuarios
export async function registrarUsuario(datos: any) {
  const response = await fetch(`${API_BASE}/usuarios/registrar`, {
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
  const response = await fetch(`${API_BASE}/usuarios/registrar-estudiante-matriculas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return response.json();
}

export async function aprobarUsuario(uid: string) {
  const response = await fetch(`${API_BASE}/usuarios/aprobar/${uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

export async function obtenerUsuarioPorUid(uid: string) {
  const response = await fetch(`${API_BASE}/usuarios/usuario/${uid}`);
  return response.json();
}

export async function obtenerUsuariosPendientes() {
  const response = await fetch(`${API_BASE}/usuarios/pendientes`);
  return response.json();
}

const API_BASE_URL = 'http://localhost:3003/api/tareas';

// Obtener todos los estudiantes
export async function obtenerEstudiantes() {
  const response = await fetch(`${API_BASE}/usuarios/por-tipo/estudiante`);
  return response.json();
}

// Obtener todos los docentes
export async function obtenerDocentes() {
  const response = await fetch(`${API_BASE}/usuarios/por-tipo/docente`);
  return response.json();
}

// Obtener estadísticas generales
export async function obtenerEstadisticas() {
  const response = await fetch(`${API_BASE}/usuarios/estadisticas`);
  return response.json();
}

// Notificaciones
export async function obtenerNotificaciones(uid: string) {
  try {
    const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/usuario/${uid}`);
    if (!response.ok) {
      throw new Error('API no disponible');
    }
    return response.json();
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    // Retornar datos de ejemplo si la API no está disponible
    return [
      {
        id: '1',
        titulo: 'Bienvenido al sistema',
        mensaje: 'Has sido registrado exitosamente en SGTA',
        tipo: 'info',
        fechaCreacion: new Date().toISOString(),
        leida: false
      }
    ];
  }
}

export async function marcarNotificacionLeida(notificacionId: string) {
  try {
    const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/${notificacionId}/leida`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return { success: false, message: 'API no disponible' };
  }
}

export async function marcarNotificacionNoLeida(notificacionId: string) {
  try {
    const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/${notificacionId}/no-leida`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  } catch (error) {
    console.error('Error al marcar notificación como no leída:', error);
    return { success: false, message: 'API no disponible' };
  }
}

export async function eliminarNotificacion(notificacionId: string) {
  try {
    const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/${notificacionId}`, {
      method: 'DELETE'
    });
    return response.json();
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return { success: false, message: 'API no disponible' };
  }
}

export async function marcarTodasNotificacionesLeidas(uid: string) {
  try {
    const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/usuario/${uid}/marcar-todas-leidas`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    return { success: false, message: 'API no disponible' };
  }
}

export async function crearNotificacion(datos: {
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  destinatarioUid: string;
  remitenteUid?: string;
  accionUrl?: string;
}) {
  try {
    const response = await fetch(`${NOTIFICACIONES_API}/notificaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    return response.json();
  } catch (error) {
    console.error('Error al crear notificación:', error);
    return { success: false, message: 'API no disponible' };
  }
}

export async function contarNotificacionesNoLeidas(uid: string) {
  try {
    const response = await fetch(`${NOTIFICACIONES_API}/notificaciones/usuario/${uid}/conteo-no-leidas`);
    return response.json();
  } catch (error) {
    console.error('Error al contar notificaciones no leídas:', error);
    return { count: 0 };
  }
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
  try {
    const response = await fetch(`${ASIGNATURAS_API}/asignaturas/todas`);
    if (!response.ok) {
      throw new Error(`Error al obtener asignaturas: ${response.status}`);
    }
    const data = await response.json();
    console.log('Asignaturas obtenidas desde API:', data);
    return data;
  } catch (error) {
    console.error('Error en obtenerAsignaturas:', error);
    return [];
  }
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

export async function removerDocenteDeAsignatura(asignaturaId: string) {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/remover-docente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asignaturaId })
  });
  return response.json();
}

export async function obtenerDocentesDisponibles(maxAsignaturas: number = 5) {
  const response = await fetch(`${ASIGNATURAS_API}/asignaturas/docentes-disponibles?maxAsignaturas=${maxAsignaturas}`);
  return response.json();
}

export async function obtenerDocentesConAsignaturas() {
  const response = await fetch(`${API_BASE}/usuarios/docentes-con-asignaturas`);
  return response.json();
}

export async function obtenerAsignaturasDeDocente(docenteUid: string) {
  const response = await fetch(`${API_BASE}/usuarios/docente/${docenteUid}/asignaturas`);
  return response.json();
}

export async function agregarAsignaturaADocente(docenteUid: string, asignaturaId: string) {
  const response = await fetch(`${API_BASE}/usuarios/agregar-asignatura-docente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docenteUid, asignaturaId })
  });
  return response.json();
}

export async function removerAsignaturaDeDocente(docenteUid: string, asignaturaId: string) {
  const response = await fetch(`${API_BASE}/usuarios/remover-asignatura-docente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docenteUid, asignaturaId })
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

// Funciones de integración usuarios-tareas
export async function obtenerUsuariosParaTarea(tareaId: string, tipo: 'estudiantes' | 'docente', token: string) {
  const response = await fetch(`${API_BASE_URL}/${tareaId}/usuarios?tipo=${tipo}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

export async function obtenerTareasPorAsignatura(asignaturaId: string, token: string) {
  try {
    console.log('Haciendo petición a:', `${API_BASE_URL}/asignatura/${asignaturaId}`);
    const response = await fetch(`${API_BASE_URL}/asignatura/${asignaturaId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Respuesta del servidor:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('Error en obtenerTareasPorAsignatura:', error);
    throw error;
  }
}

export async function obtenerEstadisticasUsuarioTareas(uid: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/usuarios/${uid}/estadisticas`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// Función para obtener información completa de usuario con tareas
export async function obtenerUsuarioConTareas(uid: string, token: string) {
  try {
    // Obtener información del usuario
    const usuario = await obtenerUsuarioPorUid(uid);
    
    // Obtener estadísticas de tareas
    const estadisticas = await obtenerEstadisticasUsuarioTareas(uid, token);
    
    return {
      ...usuario,
      estadisticas
    };
  } catch (error) {
    console.error('Error al obtener usuario con tareas:', error);
    throw error;
  }
}

// Función para obtener asignaturas con tareas
export async function obtenerAsignaturasConTareas(docenteUid: string, token: string) {
  try {
    // Obtener asignaturas del docente
    const asignaturas = await obtenerAsignaturasPorDocente(docenteUid);
    
    // Para cada asignatura, obtener sus tareas
    const asignaturasConTareas = await Promise.all(
      asignaturas.map(async (asignatura: any) => {
        try {
          const tareas = await obtenerTareasPorAsignatura(asignatura.id, token);
          return {
            ...asignatura,
            tareas
          };
        } catch (error) {
          console.error(`Error al obtener tareas para asignatura ${asignatura.id}:`, error);
          return {
            ...asignatura,
            tareas: []
          };
        }
      })
    );
    
    return asignaturasConTareas;
  } catch (error) {
    console.error('Error al obtener asignaturas con tareas:', error);
    throw error;
  }
}
