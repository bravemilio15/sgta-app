import React, { useState, useEffect } from 'react';
import { 
  obtenerPeriodosAcademicos, 
  crearPeriodoAcademico, 
  actualizarPeriodoAcademico, 
  eliminarPeriodoAcademico,
  activarPeriodoAcademico,
  finalizarPeriodoAcademico,
  obtenerPeriodosPorEstado
} from '../../../../api';
import './AdminConfiguracion.css';

interface PeriodoAcademico {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  esActivo: boolean;
  tipo: string;
  descripcion: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

const AdminConfiguracion: React.FC = () => {
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState<PeriodoAcademico | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    fechaInicio: '',
    fechaFin: '',
    tipo: 'TRIMESTRE',
    estado: 'PLANIFICACION',
    descripcion: ''
  });

  useEffect(() => {
    cargarPeriodos();
  }, [filterEstado]);

  const cargarPeriodos = async () => {
    try {
      setLoading(true);
      setError('');
      let response;
      
      if (filterEstado === 'TODOS') {
        response = await obtenerPeriodosAcademicos();
      } else {
        response = await obtenerPeriodosPorEstado(filterEstado);
      }
      
      // Asegurar que periodos sea siempre un array
      let periodosArray: PeriodoAcademico[] = [];
      if (response && response.periodos) {
        periodosArray = Array.isArray(response.periodos) ? response.periodos : [];
      } else if (response && Array.isArray(response)) {
        periodosArray = response;
      }
      
      console.log('Respuesta del API:', response);
      console.log('Tipo de respuesta:', typeof response);
      console.log('Es array:', Array.isArray(response));
      console.log('Tiene periodos:', response && response.periodos);
      console.log('Períodos procesados:', periodosArray);
      
      setPeriodos(periodosArray);
    } catch (error: any) {
      console.error('Error al cargar períodos:', error);
      setError('Error al cargar los períodos académicos. Por favor, intenta de nuevo.');
      setPeriodos([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      if (editingPeriodo) {
        await actualizarPeriodoAcademico(editingPeriodo.id, formData);
        setSuccess('Período académico actualizado correctamente');
      } else {
        await crearPeriodoAcademico(formData);
        setSuccess('Período académico creado correctamente');
      }
      
      setShowModal(false);
      setEditingPeriodo(null);
      resetForm();
      cargarPeriodos();
    } catch (error: any) {
      console.error('Error al guardar período:', error);
      setError(error.response?.data?.error || 'Error al guardar el período académico. Por favor, intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (periodo: PeriodoAcademico) => {
    setEditingPeriodo(periodo);
    setFormData({
      nombre: periodo.nombre,
      fechaInicio: periodo.fechaInicio.split('T')[0],
      fechaFin: periodo.fechaFin.split('T')[0],
      tipo: periodo.tipo,
      estado: periodo.estado,
      descripcion: periodo.descripcion
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este período académico?')) {
      try {
        await eliminarPeriodoAcademico(id);
        cargarPeriodos();
      } catch (error: any) {
        console.error('Error al eliminar período:', error);
        setError('Error al eliminar el período académico.');
      }
    }
  };

  const handleActivar = async (id: string) => {
    try {
      await activarPeriodoAcademico(id);
      cargarPeriodos();
    } catch (error: any) {
      console.error('Error al activar período:', error);
      setError('Error al activar el período académico.');
    }
  };

  const handleFinalizar = async (id: string) => {
    try {
      await finalizarPeriodoAcademico(id);
      cargarPeriodos();
    } catch (error: any) {
      console.error('Error al finalizar período:', error);
      setError('Error al finalizar el período académico.');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      fechaInicio: '',
      fechaFin: '',
      tipo: 'TRIMESTRE',
      estado: 'PLANIFICACION',
      descripcion: ''
    });
  };

  const openModal = () => {
    setEditingPeriodo(null);
    resetForm();
    setShowModal(true);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return '#28a745';
      case 'PLANIFICACION': return '#ffc107';
      case 'FINALIZADO': return '#6c757d';
      case 'CANCELADO': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="admin-configuracion">
      <div className="configuracion-header">
        <h1>Configuración - Períodos Académicos</h1>
        <button className="btn-primary" onClick={openModal}>
          + Nuevo Período
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="configuracion-filters">
        <select 
          value={filterEstado} 
          onChange={(e) => setFilterEstado(e.target.value)}
          className="filter-select"
        >
          <option value="TODOS">Todos los Períodos</option>
          <option value="ACTUAL">Períodos Actuales</option>
          <option value="PASADO">Períodos Pasados</option>
          <option value="FUTURO">Períodos Futuros</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Cargando períodos académicos...</div>
      ) : (
        <div className="periodos-grid">
          {periodos.length > 0 ? (
            periodos.map((periodo) => (
              <div key={periodo.id} className="periodo-card">
                <div className="periodo-header">
                  <h3>{periodo.nombre}</h3>
                  <span 
                    className="estado-badge"
                    style={{ backgroundColor: getEstadoColor(periodo.estado) }}
                  >
                    {periodo.estado}
                  </span>
                </div>
                
                <div className="periodo-info">
                  <p><strong>Tipo:</strong> {periodo.tipo}</p>
                  <p><strong>Inicio:</strong> {formatDate(periodo.fechaInicio)}</p>
                  <p><strong>Fin:</strong> {formatDate(periodo.fechaFin)}</p>
                  {periodo.descripcion && (
                    <p><strong>Descripción:</strong> {periodo.descripcion}</p>
                  )}
                  <p><strong>Activo:</strong> {periodo.esActivo ? 'Sí' : 'No'}</p>
                </div>

                <div className="periodo-actions">
                  {periodo.estado === 'PLANIFICACION' && (
                    <button 
                      className="btn-activar"
                      onClick={() => handleActivar(periodo.id)}
                    >
                      Activar
                    </button>
                  )}
                  
                  {periodo.estado === 'ACTIVO' && (
                    <button 
                      className="btn-finalizar"
                      onClick={() => handleFinalizar(periodo.id)}
                    >
                      Finalizar
                    </button>
                  )}
                  
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(periodo)}
                  >
                    Editar
                  </button>
                  
                  {periodo.estado === 'PLANIFICACION' && (
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(periodo.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-periodos">
              <p>No hay períodos académicos disponibles.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear/editar período */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingPeriodo ? 'Editar Período' : 'Nuevo Período Académico'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="periodo-form">
              <div className="form-group">
                <label>Nombre del Período:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: 2024-1, Enero-Marzo 2024"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Inicio:</label>
                  <input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Fecha de Fin:</label>
                  <input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Estado del Período:</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  <option value="PLANIFICACION">Planificación</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descripción (opcional):</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción adicional del período..."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingPeriodo ? 'Actualizar' : 'Crear') + ' Período'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConfiguracion; 