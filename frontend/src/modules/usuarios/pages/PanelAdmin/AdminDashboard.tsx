import React, { useState, useEffect } from 'react';
import { useUser } from '../../../../context/UserContext';
import AdminLayout from '../../../../shared/components/Layout/AdminLayout';
import { obtenerEstadisticas } from '../../../../api';
import { FiUsers, FiUser, FiClock, FiFileText, FiBook } from 'react-icons/fi';
import './AdminDashboard.css';

interface Estadisticas {
  totalEstudiantes: number;
  totalDocentes: number;
  estudiantesPendientes: number;
  docentesActivos: number;
  totalAsignaturas?: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useUser();
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalEstudiantes: 0,
    totalDocentes: 0,
    estudiantesPendientes: 0,
    docentesActivos: 0,
    totalAsignaturas: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setCargando(true);
      const datos = await obtenerEstadisticas();
      setEstadisticas(datos);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      // En caso de error, usar datos por defecto
      setEstadisticas({
        totalEstudiantes: 0,
        totalDocentes: 0,
        estudiantesPendientes: 0,
        docentesActivos: 0,
        totalAsignaturas: 0
      });
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="admin-dashboard-header">
          <h1 className="admin-dashboard-title">Dashboard Administrativo</h1>
          <p className="admin-dashboard-subtitle">
            Bienvenido al panel de control del sistema SGTA
          </p>
        </div>

        <div className="admin-dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-content">
              <h3>{estadisticas.totalEstudiantes}</h3>
              <p>Total Estudiantes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FiUser />
            </div>
            <div className="stat-content">
              <h3>{estadisticas.totalDocentes}</h3>
              <p>Total Docentes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FiClock />
            </div>
            <div className="stat-content">
              <h3>{estadisticas.estudiantesPendientes}</h3>
              <p>Estudiantes Pendientes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FiFileText />
            </div>
            <div className="stat-content">
              <h3>{estadisticas.docentesActivos}</h3>
              <p>Docentes Activos</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FiBook />
            </div>
            <div className="stat-content">
              <h3>{estadisticas.totalAsignaturas || 0}</h3>
              <p>Total Asignaturas</p>
            </div>
          </div>
        </div>

        <div className="admin-dashboard-sections">
          <div className="admin-dashboard-section">
            <h2 className="section-title">Acciones Rápidas</h2>
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={() => window.location.href = '/panel-admin/estudiantes'}
              >
                <FiUsers />
                Gestionar Estudiantes
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => window.location.href = '/panel-admin/docentes'}
              >
                <FiUser />
                Gestionar Docentes
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => window.location.href = '/panel-admin/reportes'}
              >
                <FiFileText />
                Ver Reportes
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => window.location.href = '/panel-admin/asignaturas'}
              >
                <FiBook />
                Gestionar Asignaturas
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 