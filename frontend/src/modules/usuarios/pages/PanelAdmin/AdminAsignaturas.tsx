import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../../shared/components/Layout/AdminLayout';
import { 
  obtenerAsignaturas, 
  crearAsignatura, 
  editarAsignatura, 
  eliminarAsignatura,
  obtenerDocentes,
  asignarDocenteAAsignatura,
  removerDocenteDeAsignatura,
  obtenerDocentesDisponibles,
  obtenerDocentesConAsignaturas
} from '../../../../api';
import { FiPlus, FiEdit, FiTrash2, FiBook, FiUser, FiUsers, FiX, FiInfo } from 'react-icons/fi';
import './AdminAsignaturas.css';

interface Asignatura {
  id: string;
  codigo: string;
  nombre: string;
  carrera: string;
  docenteUid: string;
  estudiantesUid: string[];
}

interface Docente {
  uid: string;
  nombreCompleto: string;
  asignaturasUid?: string[];
}

const AdminAsignaturas: React.FC = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [docentesDisponibles, setDocentesDisponibles] = useState<Docente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [asignaturaActual, setAsignaturaActual] = useState<Asignatura | null>(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    docenteUid: ''
  });
  const [mostrarModalAsignarDocente, setMostrarModalAsignarDocente] = useState(false);
  const [asignaturaParaAsignar, setAsignaturaParaAsignar] = useState<Asignatura | null>(null);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [asignaturasData, docentesData, docentesDisponiblesData] = await Promise.all([
        obtenerAsignaturas(),
        obtenerDocentesConAsignaturas(),
        obtenerDocentesDisponibles(5)
      ]);
      setAsignaturas(asignaturasData);
      setDocentes(docentesData);
      setDocentesDisponibles(docentesDisponiblesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      codigo: '',
      nombre: '',
      docenteUid: ''
    });
    setAsignaturaActual(null);
    setModoEdicion(false);
  };

  const abrirModalAsignarDocente = (asignatura: Asignatura) => {
    setAsignaturaParaAsignar(asignatura);
    setDocenteSeleccionado('');
    setMostrarModalAsignarDocente(true);
  };

  const cerrarModalAsignarDocente = () => {
    setMostrarModalAsignarDocente(false);
    setAsignaturaParaAsignar(null);
    setDocenteSeleccionado('');
  };

  const abrirModalCrear = () => {
    limpiarFormulario();
    setMostrarModal(true);
  };

  const abrirModalEditar = (asignatura: Asignatura) => {
    setAsignaturaActual(asignatura);
    setFormData({
      codigo: asignatura.codigo,
      nombre: asignatura.nombre,
      docenteUid: asignatura.docenteUid
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    limpiarFormulario();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.nombre) {
      alert('Por favor complete código y nombre');
      return;
    }

    try {
      if (modoEdicion && asignaturaActual) {
        await editarAsignatura(asignaturaActual.id, formData);
      } else {
        await crearAsignatura(formData);
      }
      
      await cargarDatos();
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar asignatura:', error);
      alert('Error al guardar la asignatura');
    }
  };

  const handleAsignarDocente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!docenteSeleccionado) {
      alert('Por favor seleccione un docente');
      return;
    }

    if (!asignaturaParaAsignar) {
      alert('Error: No se encontró la asignatura');
      return;
    }

    try {
      await asignarDocenteAAsignatura(asignaturaParaAsignar.id, docenteSeleccionado);
      await cargarDatos();
      cerrarModalAsignarDocente();
    } catch (error) {
      console.error('Error al asignar docente:', error);
      alert('Error al asignar el docente');
    }
  };

  const handleRemoverDocente = async (asignaturaId: string) => {
    if (window.confirm('¿Está seguro de que desea remover el docente de esta asignatura?')) {
      try {
        await removerDocenteDeAsignatura(asignaturaId);
        await cargarDatos();
      } catch (error) {
        console.error('Error al remover docente:', error);
        alert('Error al remover el docente');
      }
    }
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta asignatura?')) {
      try {
        await eliminarAsignatura(id);
        await cargarDatos();
      } catch (error) {
        console.error('Error al eliminar asignatura:', error);
        alert('Error al eliminar la asignatura');
      }
    }
  };

  const obtenerNombreDocente = (docenteUid: string) => {
    if (!docenteUid) return 'Sin docente asignado';
    const docente = docentes.find(d => d.uid === docenteUid);
    return docente ? docente.nombreCompleto : 'Docente no encontrado';
  };

  const obtenerNumeroAsignaturasDocente = (docenteUid: string) => {
    const docente = docentes.find(d => d.uid === docenteUid);
    return docente?.asignaturasUid?.length || 0;
  };

  if (cargando) {
    return (
      <AdminLayout>
        <div className="admin-asignaturas-loading">
          <div className="loading-spinner"></div>
          <p>Cargando asignaturas...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-asignaturas">
        <div className="admin-asignaturas-header">
          <h1 className="admin-asignaturas-title">Gestión de Asignaturas</h1>
          <p className="admin-asignaturas-subtitle">
            Administra las asignaturas disponibles en el sistema
          </p>
        </div>

        <div className="admin-asignaturas-actions">
          <button 
            className="admin-asignaturas-btn-primary"
            onClick={abrirModalCrear}
          >
            <FiPlus />
            Nueva Asignatura
          </button>
        </div>

        <div className="admin-asignaturas-content">
          {asignaturas.length === 0 ? (
            <div className="admin-asignaturas-empty">
              <FiBook className="empty-icon" />
              <p>No hay asignaturas registradas</p>
              <button 
                className="admin-asignaturas-btn-primary"
                onClick={abrirModalCrear}
              >
                Crear primera asignatura
              </button>
            </div>
          ) : (
            <div className="admin-asignaturas-grid">
              {asignaturas.map((asignatura) => (
                <div key={asignatura.id} className="asignatura-card">
                  <div className="asignatura-card-header">
                    <div className="asignatura-card-icon">
                      <FiBook />
                    </div>
                    <div className="asignatura-card-actions">
                      <button
                        className="asignatura-card-btn-edit"
                        onClick={() => abrirModalEditar(asignatura)}
                        title="Editar"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="asignatura-card-btn-delete"
                        onClick={() => handleEliminar(asignatura.id)}
                        title="Eliminar"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  
                  <div className="asignatura-card-content">
                    <h3 className="asignatura-card-codigo">{asignatura.codigo}</h3>
                    <h4 className="asignatura-card-nombre">{asignatura.nombre}</h4>
                    <p className="asignatura-card-carrera">{asignatura.carrera}</p>
                    
                    <div className="asignatura-card-info">
                      <div className="asignatura-card-docente">
                        <FiUser />
                        <span>{obtenerNombreDocente(asignatura.docenteUid)}</span>
                        {asignatura.docenteUid && (
                          <span className="asignatura-card-docente-info">
                            ({obtenerNumeroAsignaturasDocente(asignatura.docenteUid)} asignaturas)
                          </span>
                        )}
                      </div>
                      <div className="asignatura-card-estudiantes">
                        <FiUsers />
                        <span>{asignatura.estudiantesUid.length} estudiantes</span>
                      </div>
                      
                      {!asignatura.docenteUid ? (
                        <button
                          className="asignatura-card-btn-asignar"
                          onClick={() => abrirModalAsignarDocente(asignatura)}
                          title="Asignar docente"
                        >
                          Asignar Docente
                        </button>
                      ) : (
                        <button
                          className="asignatura-card-btn-remover"
                          onClick={() => handleRemoverDocente(asignatura.id)}
                          title="Remover docente"
                        >
                          <FiX /> Remover Docente
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para crear/editar asignatura */}
        {mostrarModal && (
          <div className="modal-overlay" onClick={cerrarModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modoEdicion ? 'Editar Asignatura' : 'Nueva Asignatura'}</h2>
                <button className="modal-close" onClick={cerrarModal}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label htmlFor="codigo">Código:</label>
                  <input
                    id="codigo"
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                    placeholder="Ej: PROG101"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="nombre">Nombre:</label>
                  <input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Programación I"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="docenteUid">Docente (opcional):</label>
                  <select
                    id="docenteUid"
                    value={formData.docenteUid}
                    onChange={(e) => setFormData({...formData, docenteUid: e.target.value})}
                  >
                    <option value="">Sin docente asignado</option>
                    {docentesDisponibles.map((docente) => (
                      <option key={docente.uid} value={docente.uid}>
                        {docente.nombreCompleto} ({docente.asignaturasUid?.length || 0} asignaturas)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {modoEdicion ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para asignar docente */}
        {mostrarModalAsignarDocente && (
          <div className="modal-overlay" onClick={cerrarModalAsignarDocente}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Asignar Docente</h2>
                <button className="modal-close" onClick={cerrarModalAsignarDocente}>×</button>
              </div>
              
              <form onSubmit={handleAsignarDocente} className="modal-form">
                <div className="form-group">
                  <label>Asignatura:</label>
                  <p className="asignatura-info">
                    {asignaturaParaAsignar?.codigo} - {asignaturaParaAsignar?.nombre}
                  </p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="docenteAsignar">Seleccionar Docente:</label>
                  <select
                    id="docenteAsignar"
                    value={docenteSeleccionado}
                    onChange={(e) => setDocenteSeleccionado(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar docente</option>
                    {docentesDisponibles.map((docente) => (
                      <option key={docente.uid} value={docente.uid}>
                        {docente.nombreCompleto} ({docente.asignaturasUid?.length || 0} asignaturas)
                      </option>
                    ))}
                  </select>
                  <small className="form-help">
                    <FiInfo /> Solo se muestran docentes con menos de 5 asignaturas
                  </small>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={cerrarModalAsignarDocente}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Asignar Docente
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAsignaturas; 