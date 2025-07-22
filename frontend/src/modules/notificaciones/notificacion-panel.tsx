import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import Sidebar from '../../shared/components/Sidebar/Sidebar';
import Button from '../../shared/components/Button';
import { 
  obtenerNotificaciones, 
  marcarNotificacionLeida, 
  marcarNotificacionNoLeida, 
  eliminarNotificacion, 
  marcarTodasNotificacionesLeidas 
} from '../../api';
import './notificacion-panel.css';

// Tipos para las notificaciones
type TipoNotificacion = 'info' | 'warning' | 'success' | 'error';
type EstadoNotificacion = 'no_leida' | 'leida';

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
  estado: EstadoNotificacion;
  fechaCreacion: string;
  remitente?: string;
  accionUrl?: string;
}

export const NotificacionesPage = () => {
  const { user, loading } = useUser();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'no_leidas' | 'leidas'>('todas');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | TipoNotificacion>('todos');
  const [cargando, setCargando] = useState(true);

  // Cargar notificaciones
  useEffect(() => {
    if (user) {
      cargarNotificaciones();
    }
  }, [user]);

  const cargarNotificaciones = async () => {
    setCargando(true);
    try {
      // Intentar cargar desde la API
      const notificacionesAPI = await obtenerNotificaciones(user!.uid);
      setNotificaciones(notificacionesAPI);
    } catch (error) {
      console.log('API no disponible, usando datos de ejemplo');
      // Usar datos de ejemplo si la API no está disponible
      const notificacionesEjemplo: Notificacion[] = [
        {
          id: '1',
          titulo: 'Nueva tarea asignada',
          mensaje: 'Se ha asignado una nueva tarea en la materia Procesos de Software. Fecha límite: 30 de enero de 2025.',
          tipo: 'info',
          estado: 'no_leida',
          fechaCreacion: '2025-01-22T10:30:00Z',
          remitente: 'Prof. García',
          accionUrl: '/tareas/1'
        },
        {
          id: '2',
          titulo: 'Cuenta aprobada',
          mensaje: 'Tu cuenta de estudiante ha sido aprobada exitosamente. Ya puedes acceder a todas las funcionalidades del sistema.',
          tipo: 'success',
          estado: 'leida',
          fechaCreacion: '2025-01-21T14:15:00Z',
          remitente: 'Sistema SGTA'
        },
        {
          id: '3',
          titulo: 'Recordatorio de entrega',
          mensaje: 'Tienes una tarea pendiente que vence mañana. Asegúrate de completarla a tiempo.',
          tipo: 'warning',
          estado: 'no_leida',
          fechaCreacion: '2025-01-22T08:00:00Z',
          remitente: 'Sistema SGTA'
        },
        {
          id: '4',
          titulo: 'Calificación disponible',
          mensaje: 'La calificación de tu última tarea ya está disponible. Revisa tu progreso académico.',
          tipo: 'info',
          estado: 'leida',
          fechaCreacion: '2025-01-20T16:45:00Z',
          remitente: 'Prof. García'
        },
        {
          id: '5',
          titulo: 'Tarea vencida',
          mensaje: 'La tarea "Análisis de Requisitos" ha vencido sin ser entregada. Contacta a tu profesor.',
          tipo: 'error',
          estado: 'no_leida',
          fechaCreacion: '2025-01-19T23:59:00Z',
          remitente: 'Sistema SGTA'
        }
      ];
      setNotificaciones(notificacionesEjemplo);
    } finally {
      setCargando(false);
    }
  };

  const handleMarcarLeida = async (id: string) => {
    try {
      await marcarNotificacionLeida(id);
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, estado: 'leida' } : notif
        )
      );
    } catch (error) {
      console.log('Error al marcar como leída, actualizando solo localmente');
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, estado: 'leida' } : notif
        )
      );
    }
  };

  const handleMarcarNoLeida = async (id: string) => {
    try {
      await marcarNotificacionNoLeida(id);
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, estado: 'no_leida' } : notif
        )
      );
    } catch (error) {
      console.log('Error al marcar como no leída, actualizando solo localmente');
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, estado: 'no_leida' } : notif
        )
      );
    }
  };

  const handleEliminar = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta notificación?')) {
      try {
        await eliminarNotificacion(id);
        setNotificaciones(prev => prev.filter(notif => notif.id !== id));
      } catch (error) {
        console.log('Error al eliminar, removiendo solo localmente');
        setNotificaciones(prev => prev.filter(notif => notif.id !== id));
      }
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await marcarTodasNotificacionesLeidas(user!.uid);
      setNotificaciones(prev => 
        prev.map(notif => ({ ...notif, estado: 'leida' as EstadoNotificacion }))
      );
    } catch (error) {
      console.log('Error al marcar todas como leídas, actualizando solo localmente');
      setNotificaciones(prev => 
        prev.map(notif => ({ ...notif, estado: 'leida' as EstadoNotificacion }))
      );
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerIconoTipo = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(notif => {
    const cumpleFiltroEstado = filtroEstado === 'todas' || 
      (filtroEstado === 'no_leidas' && notif.estado === 'no_leida') ||
      (filtroEstado === 'leidas' && notif.estado === 'leida');
    
    const cumpleFiltroTipo = filtroTipo === 'todos' || notif.tipo === filtroTipo;
    
    return cumpleFiltroEstado && cumpleFiltroTipo;
  });

  const conteoNoLeidas = notificaciones.filter(n => n.estado === 'no_leida').length;

  if (loading || cargando) {
    return (
      <div className="notificaciones-bg">
        <div className="notificaciones-main">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="notificaciones-bg">
        <div className="notificaciones-main" style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
          Debe iniciar sesión para ver las notificaciones.
        </div>
      </div>
    );
  }

  return (
    <div className="notificaciones-dashboard">
      <Sidebar />
      <main className="notificaciones-content">
        <h2 className="notificaciones-title">
          Centro de Notificaciones
          {conteoNoLeidas > 0 && (
            <span className="notificaciones-badge">{conteoNoLeidas}</span>
          )}
        </h2>
        
        {/* Controles y filtros */}
        <section className="notificaciones-controls">
          <div className="notificaciones-filters">
            <div className="filter-group">
              <label>Estado:</label>
              <select 
                value={filtroEstado} 
                onChange={e => setFiltroEstado(e.target.value as any)}
                className="filter-select"
              >
                <option value="todas">Todas</option>
                <option value="no_leidas">No leídas</option>
                <option value="leidas">Leídas</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Tipo:</label>
              <select 
                value={filtroTipo} 
                onChange={e => setFiltroTipo(e.target.value as any)}
                className="filter-select"
              >
                <option value="todos">Todos</option>
                <option value="info">Información</option>
                <option value="warning">Advertencia</option>
                <option value="success">Éxito</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          
          <div className="notificaciones-actions">
            {conteoNoLeidas > 0 && (
              <Button onClick={handleMarcarTodasLeidas}>
                Marcar todas como leídas
              </Button>
            )}
            <Button 
              onClick={cargarNotificaciones}
              style={{ background: '#3b4a56' }}
            >
              🔄 Actualizar
            </Button>
          </div>
        </section>

        {/* Lista de notificaciones */}
        <section className="notificaciones-section">
          <h3>
            Notificaciones ({notificacionesFiltradas.length})
          </h3>
          
          {notificacionesFiltradas.length === 0 ? (
            <div className="notificaciones-empty">
              <p>No hay notificaciones que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="notificaciones-list">
              {notificacionesFiltradas.map(notificacion => (
                <div 
                  key={notificacion.id} 
                  className={`notificacion-item ${notificacion.estado} ${notificacion.tipo}`}
                >
                  <div className="notificacion-header">
                    <div className="notificacion-info">
                      <span className="notificacion-icono">
                        {obtenerIconoTipo(notificacion.tipo)}
                      </span>
                      <div className="notificacion-meta">
                        <h4 className="notificacion-titulo">{notificacion.titulo}</h4>
                        <div className="notificacion-detalles">
                          <span className="notificacion-fecha">
                            {formatearFecha(notificacion.fechaCreacion)}
                          </span>
                          {notificacion.remitente && (
                            <span className="notificacion-remitente">
                              De: {notificacion.remitente}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="notificacion-acciones">
                      {notificacion.estado === 'no_leida' ? (
                        <button 
                          onClick={() => handleMarcarLeida(notificacion.id)}
                          className="accion-btn leida"
                          title="Marcar como leída"
                        >
                          👁️
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleMarcarNoLeida(notificacion.id)}
                          className="accion-btn no-leida"
                          title="Marcar como no leída"
                        >
                          👁️‍🗨️
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleEliminar(notificacion.id)}
                        className="accion-btn eliminar"
                        title="Eliminar notificación"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="notificacion-contenido">
                    <p className="notificacion-mensaje">{notificacion.mensaje}</p>
                    {notificacion.accionUrl && (
                      <div className="notificacion-accion">
                        <Button onClick={() => window.location.href = notificacion.accionUrl!}>
                          Ver más
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
