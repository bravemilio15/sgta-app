import React, { useState, useEffect } from 'react';
import { useUser } from '../../../../context/UserContext';
import AdminLayout from '../../../../shared/components/Layout/AdminLayout';
import Button from '../../../../shared/components/Button';
import { obtenerEstudiantes, aprobarUsuario } from '../../../../api';
import './AdminEstudiantes.css';

interface Estudiante {
  uid: string;
  nombreCompleto: string;
  correoPersonal: string;
  correoInstitucional: string;
  identificacion: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  fechaRegistro: string;
  carrera: string;
  asignatura: string;
  estadoRegistro: string;
}

const AdminEstudiantes = () => {
  const { user, loading } = useUser();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [estudianteEditando, setEstudianteEditando] = useState<Estudiante | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado'>('todos');

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correoPersonal: '',
    correoInstitucional: '',
    identificacion: '',
    carrera: 'Computación',
    asignatura: '',
  });

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  const cargarEstudiantes = async () => {
    try {
      const datos = await obtenerEstudiantes();
      // Asegurar que datos sea un array
      const estudiantesArray = Array.isArray(datos) ? datos : [];
      setEstudiantes(estudiantesArray);
      setCargando(false);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      setEstudiantes([]); // Inicializar como array vacío en caso de error
      setCargando(false);
    }
  };

  const handleCrearEstudiante = () => {
    setEstudianteEditando(null);
    setFormData({
      nombreCompleto: '',
      correoPersonal: '',
      correoInstitucional: '',
      identificacion: '',
      carrera: 'Computación',
      asignatura: '',
    });
    setMostrarFormulario(true);
  };

  const handleEditarEstudiante = (estudiante: Estudiante) => {
    setEstudianteEditando(estudiante);
    setFormData({
      nombreCompleto: estudiante.nombreCompleto,
      correoPersonal: estudiante.correoPersonal,
      correoInstitucional: estudiante.correoInstitucional,
      identificacion: estudiante.identificacion,
      carrera: estudiante.carrera || 'Computación',
      asignatura: estudiante.asignatura || '',
    });
    setMostrarFormulario(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (estudianteEditando) {
      // Actualizar estudiante existente
      setEstudiantes(estudiantes.map(est => 
        est.uid === estudianteEditando.uid 
          ? { ...est, ...formData }
          : est
      ));
    } else {
      // Crear nuevo estudiante
      const nuevoEstudiante: Estudiante = {
        uid: Date.now().toString(),
        ...formData,
        estado: 'pendiente',
        estadoRegistro: 'Pendiente',
        fechaRegistro: new Date().toISOString().split('T')[0],
      };
      setEstudiantes([...estudiantes, nuevoEstudiante]);
    }
    
    setMostrarFormulario(false);
    setEstudianteEditando(null);
  };

  const handleAprobarEstudiante = async (uid: string) => {
    try {
      await aprobarUsuario(uid);
      setEstudiantes(estudiantes.map(est => 
        est.uid === uid 
          ? { ...est, estado: 'aprobado' as const, estadoRegistro: 'Aprobado' }
          : est
      ));
    } catch (error) {
      console.error('Error aprobando estudiante:', error);
    }
  };

  const handleRechazarEstudiante = async (uid: string) => {
    setEstudiantes(estudiantes.map(est => 
      est.uid === uid 
        ? { ...est, estado: 'rechazado' as const, estadoRegistro: 'Rechazado' }
        : est
    ));
  };

  const handleEliminarEstudiante = async (uid: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este estudiante?')) {
      setEstudiantes(estudiantes.filter(est => est.uid !== uid));
    }
  };

  const estudiantesFiltrados = estudiantes.filter(est => 
    filtroEstado === 'todos' || est.estado === filtroEstado
  );

  if (loading || cargando) {
    return (
      <AdminLayout>
        <div className="admin-estudiantes-loading">
          <div className="loading-spinner"></div>
          <p>Cargando estudiantes...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user || user.tipo !== 'administrador') {
    return (
      <AdminLayout>
        <div className="admin-estudiantes-error">
          <h2>Acceso Denegado</h2>
          <p>Solo los administradores pueden acceder a esta página.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-estudiantes">
        <header className="admin-estudiantes-header">
          <div>
            <h1 className="admin-estudiantes-title">Gestión de Estudiantes</h1>
            <p className="admin-estudiantes-subtitle">
              Administra los estudiantes del sistema SGTA
            </p>
          </div>
          <Button onClick={handleCrearEstudiante} className="crear-estudiante-btn">
            ➕ Crear Estudiante
          </Button>
        </header>

        <div className="admin-estudiantes-filters">
          <div className="filter-group">
            <label htmlFor="filtro-estado">Filtrar por estado:</label>
            <select 
              id="filtro-estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
              className="filter-select"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
              <option value="rechazado">Rechazados</option>
            </select>
          </div>
          <div className="estudiantes-count">
            {estudiantesFiltrados.length} estudiante(s) encontrado(s)
          </div>
        </div>

        <div className="admin-estudiantes-table-container">
          <table className="admin-estudiantes-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Correo Personal</th>
                <th>Correo Institucional</th>
                <th>Identificación</th>
                <th>Carrera</th>
                <th>Asignatura</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.map(estudiante => (
                <tr key={estudiante.uid}>
                  <td>{estudiante.nombreCompleto}</td>
                  <td>{estudiante.correoPersonal}</td>
                  <td>{estudiante.correoInstitucional}</td>
                  <td>{estudiante.identificacion}</td>
                  <td>{estudiante.carrera || 'Computación'}</td>
                  <td>{estudiante.asignatura || 'No especificada'}</td>
                  <td>
                    <span className={`estado-badge ${estudiante.estado}`}>
                      {estudiante.estado}
                    </span>
                  </td>
                  <td>{estudiante.fechaRegistro}</td>
                  <td className="acciones-cell">
                    <div className="acciones-buttons">
                      {estudiante.estado === 'pendiente' && (
                        <>
                          <Button 
                            onClick={() => handleAprobarEstudiante(estudiante.uid)}
                            className="aprobar-btn"
                          >
                            ✅ Aprobar
                          </Button>
                          <Button 
                            onClick={() => handleRechazarEstudiante(estudiante.uid)}
                            className="rechazar-btn"
                          >
                            ❌ Rechazar
                          </Button>
                        </>
                      )}
                      <Button 
                        onClick={() => handleEditarEstudiante(estudiante)}
                        className="editar-btn"
                      >
                        ✏️ Editar
                      </Button>
                      <Button 
                        onClick={() => handleEliminarEstudiante(estudiante.uid)}
                        className="eliminar-btn"
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mostrarFormulario && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{estudianteEditando ? 'Editar Estudiante' : 'Crear Nuevo Estudiante'}</h2>
              <form onSubmit={handleSubmit} className="estudiante-form">
                <div className="form-group">
                  <label htmlFor="nombreCompleto">Nombre Completo:</label>
                  <input
                    type="text"
                    id="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="correoPersonal">Correo Personal:</label>
                  <input
                    type="email"
                    id="correoPersonal"
                    value={formData.correoPersonal}
                    onChange={(e) => setFormData({...formData, correoPersonal: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="correoInstitucional">Correo Institucional:</label>
                  <input
                    type="email"
                    id="correoInstitucional"
                    value={formData.correoInstitucional}
                    onChange={(e) => setFormData({...formData, correoInstitucional: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="identificacion">Identificación:</label>
                  <input
                    type="text"
                    id="identificacion"
                    value={formData.identificacion}
                    onChange={(e) => setFormData({...formData, identificacion: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="carrera">Carrera:</label>
                  <input
                    type="text"
                    id="carrera"
                    value={formData.carrera}
                    onChange={(e) => setFormData({...formData, carrera: e.target.value})}
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="asignatura">Asignatura:</label>
                  <input
                    type="text"
                    id="asignatura"
                    value={formData.asignatura}
                    onChange={(e) => setFormData({...formData, asignatura: e.target.value})}
                  />
                </div>
                
                <div className="form-actions">
                  <Button type="submit" className="guardar-btn">
                    {estudianteEditando ? 'Actualizar' : 'Crear'} Estudiante
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setMostrarFormulario(false)}
                    className="cancelar-btn"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEstudiantes; 