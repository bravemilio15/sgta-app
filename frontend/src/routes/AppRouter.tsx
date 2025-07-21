import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UsuariosPage } from '../modules/usuarios';
import { TareasPage } from '../modules/tareas';
import { ReportesPage } from '../modules/reportes';
import { NotificacionesPage } from '../modules/notificaciones';
import { RegisterPage } from '../modules/usuarios';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import '../index.css';

export default function AppRouter() {
  return (
    <div className="app-bg">
      <Header />
      <main className="app-main">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/usuarios" replace />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/usuarios/registro" element={<RegisterPage />} />
            <Route path="/tareas" element={<TareasPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
            <Route path="/notificaciones" element={<NotificacionesPage />} />
            <Route path="*" element={<div style={{textAlign:'center',marginTop:'2rem'}}>Página no encontrada</div>} />
          </Routes>
        </BrowserRouter>
      </main>
      <Footer />
    </div>
  );
}
