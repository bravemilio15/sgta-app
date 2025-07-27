import React, { useState, useEffect } from 'react';
import { useUser } from '../../../../context/UserContext';
import AdminLayout from '../../../../shared/components/Layout/AdminLayout';
import { FiBarChart2, FiUsers, FiFileText, FiDownload } from 'react-icons/fi';
import { obtenerEstadisticas } from '../../../../api';
import './AdminReportes.css';

interface Estadisticas {
  totalEstudiantes: number;
  totalDocentes: number;
  estudiantesPendientes: number;
  docentesActivos: number;
}

const AdminReportes: React.FC = () => {
  const { user } = useUser();
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalEstudiantes: 0,
    totalDocentes: 0,
    estudiantesPendientes: 0,
    docentesActivos: 0
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
        docentesActivos: 0
      });
    } finally {
      setCargando(false);
    }
  };

  const generarReporte = (tipo: string) => {
    // Aquí puedes implementar la generación de reportes
    console.log(`Generando reporte de ${tipo}`);
    alert(`Reporte de ${tipo} generado exitosamente`);
  };

  if (cargando) {
    return (
      <AdminLayout>
        <div className="admin-reportes-loading">
          <div className="loading-spinner"></div>
          <p>Cargando reportes...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-reportes">
        <div className="admin-reportes-header">
          <div>
            <h1 className="admin-reportes-title">Reportes del Sistema</h1>
            <p className="admin-reportes-subtitle">
              Genera y visualiza reportes detallados del sistema SGTA
            </p>
          </div>
        </div>

        <div className="admin-reportes-stats">
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
              <FiUsers />
            </div>
            <div className="stat-content">
              <h3>{estadisticas.totalDocentes}</h3>
              <p>Total Docentes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FiFileText />
            </div>
            <div className="stat-content">
              <h3>{estadisticas.estudiantesPendientes}</h3>
              <p>Estudiantes Pendientes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FiBarChart2 />
            </div>
            <div className="stat-content">
              <h3>{estadisticas.docentesActivos}</h3>
              <p>Docentes Activos</p>
            </div>
          </div>
        </div>

        <div className="admin-reportes-sections">
          <div className="admin-reportes-section">
            <h2 className="section-title">Generar Reportes</h2>
            <div className="reportes-grid">
              <div className="reporte-card">
                <div className="reporte-icon">
                  <FiUsers />
                </div>
                <h3>Reporte de Estudiantes</h3>
                <p>Lista completa de estudiantes con sus estados</p>
                <button 
                  className="generar-reporte-btn"
                  onClick={() => generarReporte('estudiantes')}
                >
                  <FiDownload />
                  Generar Reporte
                </button>
              </div>

              <div className="reporte-card">
                <div className="reporte-icon">
                  <FiUsers />
                </div>
                <h3>Reporte de Docentes</h3>
                <p>Información detallada de todos los docentes</p>
                <button 
                  className="generar-reporte-btn"
                  onClick={() => generarReporte('docentes')}
                >
                  <FiDownload />
                  Generar Reporte
                </button>
              </div>

              <div className="reporte-card">
                <div className="reporte-icon">
                  <FiBarChart2 />
                </div>
                <h3>Estadísticas Generales</h3>
                <p>Resumen estadístico del sistema</p>
                <button 
                  className="generar-reporte-btn"
                  onClick={() => generarReporte('estadisticas')}
                >
                  <FiDownload />
                  Generar Reporte
                </button>
              </div>

              <div className="reporte-card">
                <div className="reporte-icon">
                  <FiFileText />
                </div>
                <h3>Reporte de Actividad</h3>
                <p>Actividad reciente del sistema</p>
                <button 
                  className="generar-reporte-btn"
                  onClick={() => generarReporte('actividad')}
                >
                  <FiDownload />
                  Generar Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReportes; 