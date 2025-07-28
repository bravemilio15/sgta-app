const express = require('express');
const router = express.Router();
const {
  registrarUsuario,
  aprobarUsuario,
  registrarAdministrador,
  registrarDocente,
  solicitarRecuperacionContrasena,
  cambiarContrasenaConToken,
  obtenerUsuarioPorUid,
  obtenerUsuariosPendientes,
  obtenerUsuariosPorTipo,
  obtenerEstadisticas,
  registrarEstudianteConMatriculas,
  obtenerDocentesConAsignaturas,
  agregarAsignaturaADocente,
  removerAsignaturaDeDocente,
  obtenerAsignaturasDeDocente,
  obtenerMatriculasEstudiante,
  crearMatricula,
  crearMatriculasMasivas,
  asignarNotaUnidad,
  obtenerPeriodosAcademicos,
  obtenerPeriodoActivo,
  crearPeriodoAcademico,
  actualizarPeriodoAcademico,
  eliminarPeriodoAcademico,
  activarPeriodoAcademico,
  finalizarPeriodoAcademico,
  obtenerPeriodosPorEstado
} = require('../controllers/userController');

// Rutas de registro
router.post('/registrar', registrarUsuario);
router.post('/registrar-admin', registrarAdministrador);
router.post('/registrar-docente', registrarDocente);
router.post('/registrar-estudiante-matriculas', registrarEstudianteConMatriculas);

// Rutas de aprobación
router.put('/aprobar/:uid', aprobarUsuario);

// Rutas de recuperación de contraseña
router.post('/solicitar-recuperacion', solicitarRecuperacionContrasena);
router.post('/cambiar-contrasena', cambiarContrasenaConToken);

// Rutas de consulta
router.get('/usuario/:uid', obtenerUsuarioPorUid);
router.get('/pendientes', obtenerUsuariosPendientes);
router.get('/por-tipo/:tipo', obtenerUsuariosPorTipo);
router.get('/estadisticas', obtenerEstadisticas);

// Rutas específicas para docentes y asignaturas
router.get('/docentes-con-asignaturas', obtenerDocentesConAsignaturas);
router.post('/agregar-asignatura-docente', agregarAsignaturaADocente);
router.post('/remover-asignatura-docente', removerAsignaturaDeDocente);
router.get('/docente/:docenteUid/asignaturas', obtenerAsignaturasDeDocente);

// Rutas de matrículas
router.get('/matriculas/estudiante/:estudianteUid', obtenerMatriculasEstudiante);
router.post('/matriculas', crearMatricula);
router.post('/matriculas/masivas', crearMatriculasMasivas);
router.put('/matriculas/:matriculaId/unidad', asignarNotaUnidad);

// Rutas de períodos académicos
router.get('/periodos-academicos', obtenerPeriodosAcademicos);
router.get('/periodos-academicos/activo', obtenerPeriodoActivo);
router.post('/periodos-academicos', crearPeriodoAcademico);
router.put('/periodos-academicos/:id', actualizarPeriodoAcademico);
router.delete('/periodos-academicos/:id', eliminarPeriodoAcademico);
router.put('/periodos-academicos/:id/activar', activarPeriodoAcademico);
router.put('/periodos-academicos/:id/finalizar', finalizarPeriodoAcademico);
router.get('/periodos-academicos/estado/:estado', obtenerPeriodosPorEstado);

module.exports = router;
