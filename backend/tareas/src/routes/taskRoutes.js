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
  validacionesCrearTarea
} = require('../controllers/taskController');
const { verificarToken, verificarRol } = require('../middleware/auth');
const { uploadMultiple, handleMulterError } = require('../middleware/fileUpload');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas para DOCENTES
// RF08: Gestión de tareas
router.post(
  '/', 
  verificarRol(['docente']), 
  validacionesCrearTarea,
  crearTareaDocente
);

router.put(
  '/:tareaId', 
  verificarRol(['docente']), 
  editarTareaDocente
);

router.delete(
  '/:tareaId', 
  verificarRol(['docente']), 
  eliminarTareaDocente
);

// RF09: Asignación de tareas
router.post(
  '/:tareaId/asignar', 
  verificarRol(['docente']), 
  asignarTarea
);

// RF14: Calificación
router.post(
  '/entregas/:entregaId/calificar', 
  verificarRol(['docente']), 
  calificarEntrega
);

// Obtener tareas del docente
router.get(
  '/docente', 
  verificarRol(['docente']), 
  obtenerTareasDocente
);

// Obtener detalle de tarea con entregas
router.get(
  '/:tareaId/detalle', 
  verificarRol(['docente']), 
  obtenerDetalleTarea
);

// Obtener una tarea específica (para editar)
router.get(
  '/:tareaId',
  verificarRol(['docente', 'estudiante']),
  obtenerTareaEspecifica
);

// Obtener entregas de una tarea
router.get(
  '/:tareaId/entregas',
  verificarRol(['docente']),
  obtenerEntregasTarea
);

// Obtener entrega específica
router.get(
  '/entregas/:entregaId',
  verificarRol(['docente', 'estudiante']),
  obtenerEntregaEspecifica
);

// Actualizar entrega
router.put(
  '/entregas/:entregaId',
  verificarRol(['estudiante']),
  actualizarEntregaEstudiante
);

// Eliminar entrega
router.delete(
  '/entregas/:entregaId',
  verificarRol(['estudiante']),
  eliminarEntregaEstudiante
);

// Rutas para ESTUDIANTES
// RF12: Gestión de entregas
router.post(
  '/:tareaId/entregar',
  verificarRol(['estudiante']),
  uploadMultiple,
  handleMulterError,
  gestionarEntrega
);

router.delete(
  '/:tareaId/archivo/:archivoNombre',
  verificarRol(['estudiante']),
  eliminarArchivoEntrega
);

// RF13: Dashboard del estudiante
router.get(
  '/estudiante/dashboard',
  verificarRol(['estudiante']),
  obtenerDashboardEstudiante
);

module.exports = router;