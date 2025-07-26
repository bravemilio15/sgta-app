import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UsuariosPage, OpcionRegistro, RegisterPage, RegisterPageDocente } from '../modules/usuarios';
import { TareasPage } from '../modules/tareas';
import { ReportesPage } from '../modules/reportes';
import { NotificacionesPage } from '../modules/notificaciones/notificacion-panel';
import PanelAdminPage from '../modules/usuarios/pages/PanelAdmin/PanelAdminPage';
import AdminDashboard from '../modules/usuarios/pages/PanelAdmin/AdminDashboard';
import AdminEstudiantes from '../modules/usuarios/pages/PanelAdmin/AdminEstudiantes';
import AdminDocentes from '../modules/usuarios/pages/PanelAdmin/AdminDocentes';
import AdminReportes from '../modules/usuarios/pages/PanelAdmin/AdminReportes';
import Header from '../shared/components/Header';
import Layout from '../shared/components/Layout/Layout';
import '../index.css';
import InicioEstudiantePage from '../modules/tareas/menu/InicioEstudiantePage';
import InicioDocentePage from '../modules/tareas/pages/InicioDocentePage';
import { useUser } from '../context/UserContext';
import { useEffect } from 'react';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, allowedTypes }: { children: React.ReactNode, allowedTypes?: string[] }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/usuarios" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(user.tipo)) {
    return <Navigate to="/usuarios" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas públicas (solo usuarios no autenticados)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  }

  if (user) {
    // Redirigir según el tipo de usuario
    if (user.tipo === 'administrador') {
      return <Navigate to="/panel-admin" replace />;
    } else if (user.tipo === 'estudiante') {
      return <Navigate to="/tareas/menu/inicio-estudiante" replace />;
    } else if (user.tipo === 'docente') {
      return <Navigate to="/tareas/menu/inicio-docente" replace />;
    }
  }

  return <>{children}</>;
};

export default function AppRouter() {
  const { user } = useUser();

  return (
    <div className="app-bg">
      <BrowserRouter>
        {/* Solo mostrar header si el usuario está autenticado */}
        {user && <Header />}
        <main className="app-main">
          <Routes>
            {/* Ruta raíz - redirigir según autenticación */}
            <Route path="/" element={
              user ? (
                user.tipo === 'administrador' ? <Navigate to="/panel-admin" replace /> :
                user.tipo === 'estudiante' ? <Navigate to="/tareas/menu/inicio-estudiante" replace /> :
                user.tipo === 'docente' ? <Navigate to="/tareas/menu/inicio-docente" replace /> :
                <Navigate to="/usuarios" replace />
              ) : <Navigate to="/usuarios" replace />
            } />
            
            {/* Rutas públicas */}
            <Route path="/usuarios" element={
              <PublicRoute>
                <UsuariosPage />
              </PublicRoute>
            } />
            <Route path="/usuarios/registro" element={
              <PublicRoute>
                <OpcionRegistro />
              </PublicRoute>
            } />
            <Route path="/usuarios/registro/estudiante" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route path="/usuarios/registro/docente" element={
              <PublicRoute>
                <RegisterPageDocente />
              </PublicRoute>
            } />
            
            {/* Rutas protegidas */}
            <Route path="/tareas" element={
              <ProtectedRoute>
                <Layout><TareasPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/reportes" element={
              <ProtectedRoute>
                <Layout><ReportesPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/notificaciones" element={
              <ProtectedRoute>
                <Layout><NotificacionesPage /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Rutas del administrador */}
            <Route path="/panel-admin" element={
              <ProtectedRoute allowedTypes={['administrador']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/panel-admin/estudiantes" element={
              <ProtectedRoute allowedTypes={['administrador']}>
                <AdminEstudiantes />
              </ProtectedRoute>
            } />
            <Route path="/panel-admin/docentes" element={
              <ProtectedRoute allowedTypes={['administrador']}>
                <AdminDocentes />
              </ProtectedRoute>
            } />
            <Route path="/panel-admin/reportes" element={
              <ProtectedRoute allowedTypes={['administrador']}>
                <AdminReportes />
              </ProtectedRoute>
            } />
            
            <Route path="/tareas/menu/inicio-estudiante" element={
              <ProtectedRoute allowedTypes={['estudiante']}>
                <Layout><InicioEstudiantePage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/tareas/menu/inicio-docente" element={
              <ProtectedRoute allowedTypes={['docente']}>
                <Layout><InicioDocentePage /></Layout>
              </ProtectedRoute>
            } />
            
            {/* Ruta 404 */}
            <Route path="*" element={<div style={{textAlign:'center',marginTop:'2rem'}}>Página no encontrada</div>} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}
