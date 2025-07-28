const express = require('express');
const router = express.Router();
const {
  crearAsignatura,
  obtenerAsignaturas,
  obtenerAsignatura,
  editarAsignatura,
  eliminarAsignatura,
  obtenerAsignaturasPorDocente,
  obtenerAsignaturasPorEstudiante,
  agregarEstudiante,
  removerEstudiante,
  asignarDocente,
  removerDocente,
  obtenerDocentesDisponibles
} = require('../controllers/asignaturaController');

// Rutas básicas
router.post('/crear', crearAsignatura);
router.get('/todas', obtenerAsignaturas);
router.post('/agregar-estudiante', agregarEstudiante);
router.post('/remover-estudiante', removerEstudiante);
router.post('/asignar-docente', asignarDocente);
router.post('/remover-docente', removerDocente);

// Rutas con parámetros
router.get('/docente/:docenteUid', obtenerAsignaturasPorDocente);
router.get('/estudiante/:estudianteUid', obtenerAsignaturasPorEstudiante);
router.get('/docentes-disponibles', obtenerDocentesDisponibles);
router.get('/:id', obtenerAsignatura);
router.put('/:id', editarAsignatura);
router.delete('/:id', eliminarAsignatura);

module.exports = router;
