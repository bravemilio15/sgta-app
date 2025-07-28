const express = require('express');
const router = express.Router();
const { 
  crearPeriodoAcademico, 
  obtenerPeriodosAcademicos, 
  obtenerPeriodoAcademico, 
  obtenerPeriodoActivo, 
  actualizarPeriodoAcademico, 
  activarPeriodoAcademico, 
  finalizarPeriodoAcademico, 
  eliminarPeriodoAcademico,
  obtenerPeriodosPorEstado,
  actualizarEstadosPeriodos,
  obtenerEstadisticasPeriodos,
  verificarSolapamientos,
  obtenerPeriodosParaActualizar,
  obtenerEstadoServicio,
  iniciarServicioAutomatico,
  detenerServicioAutomatico
} = require('../controllers/periodoAcademicoController');

// Crear un nuevo período académico
router.post('/', crearPeriodoAcademico);

// Obtener todos los períodos académicos (con filtros opcionales)
router.get('/', obtenerPeriodosAcademicos);

// Obtener el período académico activo
router.get('/activo', obtenerPeriodoActivo);

// Obtener períodos por estado (ACTUAL, PASADO, FUTURO)
router.get('/estado/:estado', obtenerPeriodosPorEstado);

// Obtener estadísticas de períodos académicos
router.get('/estadisticas', obtenerEstadisticasPeriodos);

// Verificar solapamientos entre períodos
router.get('/verificar-solapamientos', verificarSolapamientos);

// Obtener períodos que necesitan actualización
router.get('/para-actualizar', obtenerPeriodosParaActualizar);

// Obtener estado del servicio automático
router.get('/estado-servicio', obtenerEstadoServicio);

// Actualizar automáticamente todos los estados de períodos
router.put('/actualizar-estados', actualizarEstadosPeriodos);

// Iniciar servicio de actualización automática
router.post('/servicio/iniciar', iniciarServicioAutomatico);

// Detener servicio de actualización automática
router.post('/servicio/detener', detenerServicioAutomatico);

// Obtener un período académico específico
router.get('/:id', obtenerPeriodoAcademico);

// Actualizar un período académico
router.put('/:id', actualizarPeriodoAcademico);

// Activar un período académico
router.put('/:id/activar', activarPeriodoAcademico);

// Finalizar un período académico
router.put('/:id/finalizar', finalizarPeriodoAcademico);

// Eliminar un período académico
router.delete('/:id', eliminarPeriodoAcademico);

module.exports = router; 