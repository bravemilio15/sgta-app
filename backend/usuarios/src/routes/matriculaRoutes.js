const express = require('express');
const router = express.Router();
const { 
  crearMatricula, 
  obtenerMatriculaEstudiante, 
  obtenerMatriculasEstudiante, 
  obtenerMatriculasActivasEstudiante, 
  asignarNotaUnidad, 
  agregarAsignaturaAMatricula, 
  removerAsignaturaDeMatricula, 
  obtenerEstadisticasMatriculas, 
  obtenerMatriculaPorId, 
  actualizarMatricula 
} = require('../controllers/matriculaController');

// Crear una nueva matrícula
router.post('/', crearMatricula);

// Obtener matrícula por ID
router.get('/:matriculaId', obtenerMatriculaPorId);

// Actualizar matrícula
router.put('/:matriculaId', actualizarMatricula);

// Obtener matrícula de un estudiante en un período específico
router.get('/estudiante/:estudianteUid/periodo/:periodoId', obtenerMatriculaEstudiante);

// Obtener todas las matrículas de un estudiante
router.get('/estudiante/:estudianteUid', obtenerMatriculasEstudiante);

// Obtener matrículas activas de un estudiante
router.get('/estudiante/:estudianteUid/activas', obtenerMatriculasActivasEstudiante);

// Asignar nota a una unidad específica de una asignatura
router.put('/:matriculaId/asignatura/:asignaturaId/unidad', asignarNotaUnidad);

// Agregar asignatura a una matrícula existente
router.post('/:matriculaId/asignaturas', agregarAsignaturaAMatricula);

// Remover asignatura de una matrícula
router.delete('/:matriculaId/asignatura/:asignaturaId', removerAsignaturaDeMatricula);

// Obtener estadísticas de matrículas
router.get('/estadisticas/generales', obtenerEstadisticasMatriculas);

module.exports = router; 