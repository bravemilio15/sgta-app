import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UsuariosPage, OpcionRegistro, RegisterPage, RegisterPageDocente } from '../modules/usuarios';
import { TareasPage } from '../modules/tareas';
import { ReportesPage } from '../modules/reportes';
import { NotificacionesPage } from '../modules/notificaciones/notificacion-panel';
import PanelAdminPage from '../modules/usuarios/pages/PanelAdmin/PanelAdminPage';
import Header from '../shared/components/Header';
import '../index.css';
import InicioEstudiantePage from '../modules/tareas/menu/InicioEstudiantePage';
import { InicioDocentePage } from '../modules/tareas/pages/InicioDocentePage';

export default function AppRouter() {
  return (
    <div className="app-bg">
      <BrowserRouter>
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/usuarios" replace />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/usuarios/registro" element={<OpcionRegistro />} />
            <Route path="/usuarios/registro/estudiante" element={<RegisterPage />} />
            <Route path="/usuarios/registro/docente" element={<RegisterPageDocente />} />
            <Route path="/tareas" element={<TareasPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
            <Route path="/notificaciones" element={<NotificacionesPage />} />
            <Route path="/panel-admin" element={<PanelAdminPage />} />
            <Route path="/tareas/menu/inicio-estudiante" element={<InicioEstudiantePage />} />
            <Route path="/tareas/menu/inicio-docente" element={<InicioDocentePage />} />            <Route path="*" element={<div style={{textAlign:'center',marginTop:'2rem'}}>Página no encontrada</div>} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}
