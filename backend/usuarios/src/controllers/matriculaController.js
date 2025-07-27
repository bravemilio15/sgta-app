const MatriculaService = require('../services/matriculaService');
const { Matricula, EstadoMatricula, EstadoAsignaturaMatricula } = require('../models/matricula');
const { PeriodoAcademico, EstadoPeriodo } = require('../models/periodoAcademico');

// Crear una nueva matrícula para un estudiante
async function crearMatricula(req, res) {
  try {
    const { estudianteUid, periodoId, asignaturasIds } = req.body;

    if (!estudianteUid || !periodoId) {
      return res.status(400).json({ 
        error: 'estudianteUid y periodoId son requeridos' 
      });
    }

    if (!Array.isArray(asignaturasIds) || asignaturasIds.length === 0) {
      return res.status(400).json({ 
        error: 'asignaturasIds debe ser un array con al menos una asignatura' 
      });
    }

    const matricula = await MatriculaService.crearMatricula(estudianteUid, periodoId, asignaturasIds);
    
    res.status(201).json({
      mensaje: 'Matrícula creada exitosamente',
      matricula: matricula.toJSON()
    });
  } catch (error) {
    console.error('Error en crearMatricula:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}

// Obtener la matrícula de un estudiante en un período específico
async function obtenerMatriculaEstudiante(req, res) {
  try {
    const { estudianteUid, periodoId } = req.params;

    const matricula = await MatriculaService.obtenerMatriculaEstudiante(estudianteUid, periodoId);
    
    if (!matricula) {
      return res.status(404).json({ 
        error: 'Matrícula no encontrada' 
      });
    }

    res.json({
      matricula: matricula.toJSON()
    });
  } catch (error) {
    console.error('Error en obtenerMatriculaEstudiante:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}

// Obtener todas las matrículas de un estudiante
async function obtenerMatriculasEstudiante(req, res) {
  try {
    const { estudianteUid } = req.params;

    const matriculas = await MatriculaService.obtenerMatriculasEstudiante(estudianteUid);
    
    res.json({
      matriculas: matriculas.map(m => m.toJSON())
    });
  } catch (error) {
    console.error('Error en obtenerMatriculasEstudiante:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}

// Obtener matrículas activas de un estudiante
async function obtenerMatriculasActivasEstudiante(req, res) {
  try {
    const { estudianteUid } = req.params;

    const matriculas = await MatriculaService.obtenerMatriculasActivasEstudiante(estudianteUid);
    
    res.json({
      matriculas: matriculas.map(m => m.toJSON())
    });
  } catch (error) {
    console.error('Error en obtenerMatriculasActivasEstudiante:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}

// Asignar nota a una unidad específica de una asignatura
async function asignarNotaUnidad(req, res) {
  try {
    const { matriculaId, asignaturaId } = req.params;
    const { tipoUnidad, nota } = req.body;

    if (!tipoUnidad || nota === undefined) {
      return res.status(400).json({ 
        error: 'tipoUnidad y nota son requeridos' 
      });
    }

    if (!['AA', 'APE', 'ACD'].includes(tipoUnidad)) {
      return res.status(400).json({ 
        error: 'tipoUnidad debe ser AA, APE o ACD' 
      });
    }

    if (typeof nota !== 'number' || nota < 0 || nota > 10) {
      return res.status(400).json({ 
        error: 'nota debe ser un número entre 0 y 10' 
      });
    }

    const matricula = await MatriculaService.asignarNotaUnidad(matriculaId, asignaturaId, tipoUnidad, nota);
    
    res.json({
      mensaje: 'Nota asignada exitosamente',
      matricula: matricula.toJSON()
    });
  } catch (error) {
    console.error('Error en asignarNotaUnidad:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}

// Agregar asignatura a una matrícula existente
async function agregarAsignaturaAMatricula(req, res) {
  try {
    const { matriculaId } = req.params;
    const { asignaturaId } = req.body;

    if (!asignaturaId) {
      return res.status(400).json({ 
        error: 'asignaturaId es requerido' 
      });
    }

    const matricula = await MatriculaService.agregarAsignaturaAMatricula(matriculaId, asignaturaId);
    
    res.json({
      mensaje: 'Asignatura agregada exitosamente',
      matricula: matricula.toJSON()
    });
  } catch (error) {
    console.error('Error en agregarAsignaturaAMatricula:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}

// Remover asignatura de una matrícula
async function removerAsignaturaDeMatricula(req, res) {
  try {
    const { matriculaId, asignaturaId } = req.params;

    const matricula = await MatriculaService.removerAsignaturaDeMatricula(matriculaId, asignaturaId);
    
    res.json({
      mensaje: 'Asignatura removida exitosamente',
      matricula: matricula.toJSON()
    });
  } catch (error) {
    console.error('Error en removerAsignaturaDeMatricula:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}

// Obtener estadísticas de matrículas
async function obtenerEstadisticasMatriculas(req, res) {
  try {
    const { periodoId } = req.query;

    const estadisticas = await MatriculaService.obtenerEstadisticasMatriculas(periodoId);
    
    res.json({
      estadisticas
    });
  } catch (error) {
    console.error('Error en obtenerEstadisticasMatriculas:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}

// Obtener matrícula por ID
async function obtenerMatriculaPorId(req, res) {
  try {
    const { matriculaId } = req.params;

    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const matriculaRef = db.collection('matriculas').doc(matriculaId);
    const matriculaDoc = await matriculaRef.get();
    
    if (!matriculaDoc.exists) {
      return res.status(404).json({ 
        error: 'Matrícula no encontrada' 
      });
    }

    const matricula = new Matricula({ id: matriculaId, ...matriculaDoc.data() });
    
    res.json({
      matricula: matricula.toJSON()
    });
  } catch (error) {
    console.error('Error en obtenerMatriculaPorId:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}

// Actualizar matrícula
async function actualizarMatricula(req, res) {
  try {
    const { matriculaId } = req.params;
    const datosActualizados = req.body;

    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const matriculaRef = db.collection('matriculas').doc(matriculaId);
    const matriculaDoc = await matriculaRef.get();
    
    if (!matriculaDoc.exists) {
      return res.status(404).json({ 
        error: 'Matrícula no encontrada' 
      });
    }

    // Actualizar solo los campos permitidos
    const camposPermitidos = ['estado', 'fechaActualizacion'];
    const datosParaActualizar = {};
    
    camposPermitidos.forEach(campo => {
      if (datosActualizados[campo] !== undefined) {
        datosParaActualizar[campo] = datosActualizados[campo];
      }
    });

    if (Object.keys(datosParaActualizar).length === 0) {
      return res.status(400).json({ 
        error: 'No hay campos válidos para actualizar' 
      });
    }

    datosParaActualizar.fechaActualizacion = new Date().toISOString();
    
    await matriculaRef.update(datosParaActualizar);
    
    res.json({
      mensaje: 'Matrícula actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error en actualizarMatricula:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
}

module.exports = {
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
}; 