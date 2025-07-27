import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UsuariosPage, RegisterPage } from '../modules/usuarios';
import InicioDocentePage from '../modules/tareas/pages/InicioDocentePage';
import GestionarTareaPage from '../modules/tareas/pages/GestionarTareaPage';
import RevisarTareaPage from '../modules/tareas/pages/RevisarTareaPage';
import InicioEstudiantePage from '../modules/tareas/pages/InicioEstudiantePage';
import TareaEstudiantePage from '../modules/tareas/pages/TareaEstudiantePage';
import MainLayout from '../shared/layout/MainLayout';
import '../index.css';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="login" element={<UsuariosPage />} />
          <Route path="registro" element={<RegisterPage />} />
          
          {/* Rutas de Docente */}
          <Route path="docente/tareas" element={<InicioDocentePage />} />
          <Route path="docente/tareas/nueva" element={<GestionarTareaPage />} />
          <Route path="docente/tareas/editar/:id" element={<GestionarTareaPage />} />
          <Route path="docente/tareas/revisar/:id" element={<RevisarTareaPage />} />

          {/* Rutas de Estudiante */}
          <Route path="estudiante/dashboard" element={<InicioEstudiantePage />} />
          <Route path="estudiante/tarea/:id" element={<TareaEstudiantePage />} />

          <Route path="*" element={<div>Página no encontrada</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}