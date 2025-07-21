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

