const express = require('express');
const router = express.Router();
const {
  crearTareaDocente,
  editarTareaDocente,
  eliminarTareaDocente,
  asignarTarea,
  gestionarEntrega,
  eliminarArchivoEntrega,
  calificarEntrega,
  obtenerDashboardEstudiante,
  obtenerTareasDocente,
  obtenerDetalleTarea,
  obtenerTareaEspecifica,
  obtenerEntregasTarea,
  obtenerEntregaEspecifica,
  actualizarEntregaEstudiante,
  eliminarEntregaEstudiante,
  obtenerUsuariosParaTarea,
  obtenerTareasPorAsignatura,
  obtenerEstadisticasUsuarioTareas,
  validacionesCrearTarea
} = require('../controllers/taskController');
const { verificarToken, verificarRol } = require('../middleware/auth');
const { uploadMultiple, handleMulterError } = require('../middleware/fileUpload');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// RF08: Gestión de tareas (Docente)
router.post('/', verificarRol(['docente']), validacionesCrearTarea, crearTareaDocente);
router.put('/:tareaId', verificarRol(['docente']), editarTareaDocente);
router.delete('/:tareaId', verificarRol(['docente']), eliminarTareaDocente);

// RF09: Asignación de tareas
router.post(
  '/:tareaId/asignar', 
  verificarRol(['docente']), 
  asignarTarea
);

// RF12: Gestión de entregas (Estudiante)
router.post(
  '/:tareaId/entregar',
  verificarRol(['estudiante']),
  uploadMultiple,
  handleMulterError,
  gestionarEntrega
);

// Eliminar archivo de entrega
router.delete(
  '/:tareaId/entregas/:entregaId/archivos/:archivoId',
  verificarRol(['estudiante']),
  eliminarArchivoEntrega
);

// RF14: Calificación de entregas (Docente)
router.post(
  '/entregas/:entregaId/calificar',
  verificarRol(['docente']),
  calificarEntrega
);

// RF13: Dashboard del estudiante
router.get('/estudiante/dashboard', verificarRol(['estudiante']), obtenerDashboardEstudiante);

// Obtener tareas del docente
router.get('/docente', verificarRol(['docente']), obtenerTareasDocente);

// Obtener detalle de tarea con entregas
router.get('/:tareaId/detalle', verificarRol(['docente']), obtenerDetalleTarea);

// Obtener tarea específica
router.get('/:tareaId', obtenerTareaEspecifica);

// Obtener entregas de una tarea
router.get('/:tareaId/entregas', verificarRol(['docente']), obtenerEntregasTarea);

// Obtener entrega específica
router.get('/entregas/:entregaId', obtenerEntregaEspecifica);

// Actualizar entrega (estudiante)
router.put('/entregas/:entregaId', verificarRol(['estudiante']), actualizarEntregaEstudiante);

// Eliminar entrega (estudiante)
router.delete('/entregas/:entregaId', verificarRol(['estudiante']), eliminarEntregaEstudiante);

// Nuevas rutas para integración con usuarios
router.get('/:tareaId/usuarios', obtenerUsuariosParaTarea);
router.get('/asignatura/:asignaturaId', obtenerTareasPorAsignatura);
router.get('/usuarios/:uid/estadisticas', obtenerEstadisticasUsuarioTareas);

module.exports = router;