const API_BASE = 'http://localhost:3004/api';

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
const API_BASE_URL = 'http://localhost:3003/api/tareas';

// --- TAREAS ---

// RF08: Obtener todas las tareas de un docente
export const obtenerTareasDocente = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/docente`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Obtener una tarea específica por ID
export const obtenerTarea = async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
};

// Obtener detalles de la tarea con las entregas (para revisar)
export const obtenerDetalleTarea = async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/${id}/detalle`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
};

// RF08: Crear una nueva tarea
export const crearTarea = async (tarea: any, token: string) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tarea)
  });
  return response.json();
};

// RF08: Actualizar una tarea existente
export const actualizarTarea = async (id: string, tarea: any, token: string) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tarea)
  });
  return response.json();
};

// RF08: Eliminar una tarea
export const eliminarTarea = async (id: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// RF09: Asignar una tarea
export const asignarTarea = async (id: string, asignacion: any, token: string) => {
  const response = await fetch(`${API_BASE_URL}/${id}/asignar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(asignacion)
  });
  return response.json();
};


// RF12: Gestionar entrega del estudiante
export const gestionarEntrega = async (tareaId: string, formData: FormData, token: string) => {
  const response = await fetch(`${API_BASE_URL}/${tareaId}/entregar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return response.json();
};

// RF14: Calificar una entrega
export const calificarEntrega = async (entregaId: string, calificacion: any, token: string) => {
    const response = await fetch(`${API_BASE_URL}/entregas/${entregaId}/calificar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(calificacion)
    });
    return response.json();
};


// --- ESTUDIANTE ---

// RF13: Obtener dashboard del estudiante
export const obtenerDashboardEstudiante = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/estudiante/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
};
