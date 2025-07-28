const { Asignatura } = require('../models/asignatura');
const {
  guardarAsignaturaEnFirestore,
  obtenerAsignaturasDeFirestore,
  obtenerAsignaturaPorId,
  editarAsignaturaEnFirestore,
  eliminarAsignaturaDeFirestore,
  obtenerAsignaturasPorDocente,
  obtenerAsignaturasPorEstudiante,
  agregarEstudianteAAsignatura,
  removerEstudianteDeAsignatura,
  agregarAsignaturaADocente,
  removerAsignaturaDeDocente,
  obtenerDocentesConAsignaturas
} = require('../services/firebaseService');

// Crear una nueva asignatura
async function crearAsignatura(req, res) {
  try {
    const {
      codigo,
      nombre,
      docenteUid
    } = req.body;

    // Validar datos requeridos
    if (!codigo || !nombre) {
      return res.status(400).json({
        error: 'Código y nombre son obligatorios'
      });
    }

    // Crear instancia de asignatura
    const asignatura = new Asignatura({
      codigo,
      nombre,
      docenteUid: docenteUid || null,
      carrera: 'Computación' // Quemada como solicitaste
    });

    // Validar que la asignatura sea válida
    if (!asignatura.esValida()) {
      return res.status(400).json({
        error: 'Datos de asignatura inválidos'
      });
    }

    // Guardar en Firestore
    const id = await guardarAsignaturaEnFirestore(asignatura.toJSON());
    asignatura.id = id;

    res.status(201).json({
      message: 'Asignatura creada correctamente',
      asignatura: asignatura.toJSON()
    });
  } catch (error) {
    console.error('Error al crear asignatura:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener todas las asignaturas
async function obtenerAsignaturas(req, res) {
  try {
    const asignaturas = await obtenerAsignaturasDeFirestore();
    res.json(asignaturas);
  } catch (error) {
    console.error('Error al obtener asignaturas:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener una asignatura específica
async function obtenerAsignatura(req, res) {
  try {
    const { id } = req.params;
    const asignatura = await obtenerAsignaturaPorId(id);
    res.json(asignatura);
  } catch (error) {
    console.error('Error al obtener asignatura:', error);
    res.status(500).json({ error: error.message });
  }
}

// Editar una asignatura
async function editarAsignatura(req, res) {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    // Validar que no se intente cambiar la carrera
    if (datosActualizados.carrera && datosActualizados.carrera !== 'Computación') {
      return res.status(400).json({
        error: 'La carrera debe ser "Computación"'
      });
    }

    // Asegurar que la carrera sea siempre 'Computación'
    datosActualizados.carrera = 'Computación';

    await editarAsignaturaEnFirestore(id, datosActualizados);
    res.json({ message: 'Asignatura actualizada correctamente' });
  } catch (error) {
    console.error('Error al editar asignatura:', error);
    res.status(500).json({ error: error.message });
  }
}

// Eliminar una asignatura
async function eliminarAsignatura(req, res) {
  try {
    const { id } = req.params;
    await eliminarAsignaturaDeFirestore(id);
    res.json({ message: 'Asignatura eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar asignatura:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener asignaturas por docente
async function obtenerAsignaturasPorDocenteController(req, res) {
  try {
    const { docenteUid } = req.params;
    const asignaturas = await obtenerAsignaturasPorDocente(docenteUid);
    res.json(asignaturas);
  } catch (error) {
    console.error('Error al obtener asignaturas por docente:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener asignaturas por estudiante
async function obtenerAsignaturasPorEstudianteController(req, res) {
  try {
    const { estudianteUid } = req.params;
    const asignaturas = await obtenerAsignaturasPorEstudiante(estudianteUid);
    res.json(asignaturas);
  } catch (error) {
    console.error('Error al obtener asignaturas por estudiante:', error);
    res.status(500).json({ error: error.message });
  }
}

// Agregar estudiante a asignatura
async function agregarEstudiante(req, res) {
  try {
    const { asignaturaId, estudianteUid } = req.body;

    if (!asignaturaId || !estudianteUid) {
      return res.status(400).json({
        error: 'asignaturaId y estudianteUid son obligatorios'
      });
    }

    await agregarEstudianteAAsignatura(asignaturaId, estudianteUid);
    res.json({ message: 'Estudiante agregado a la asignatura correctamente' });
  } catch (error) {
    console.error('Error al agregar estudiante:', error);
    res.status(500).json({ error: error.message });
  }
}

// Remover estudiante de asignatura
async function removerEstudiante(req, res) {
  try {
    const { asignaturaId, estudianteUid } = req.body;

    if (!asignaturaId || !estudianteUid) {
      return res.status(400).json({
        error: 'asignaturaId y estudianteUid son obligatorios'
      });
    }

    await removerEstudianteDeAsignatura(asignaturaId, estudianteUid);
    res.json({ message: 'Estudiante removido de la asignatura correctamente' });
  } catch (error) {
    console.error('Error al remover estudiante:', error);
    res.status(500).json({ error: error.message });
  }
}

// Asignar docente a asignatura
async function asignarDocente(req, res) {
  try {
    const { asignaturaId, docenteUid } = req.body;

    if (!asignaturaId || !docenteUid) {
      return res.status(400).json({
        error: 'asignaturaId y docenteUid son obligatorios'
      });
    }

    // Verificar que la asignatura existe
    const asignatura = await obtenerAsignaturaPorId(asignaturaId);
    if (!asignatura) {
      return res.status(404).json({
        error: 'Asignatura no encontrada'
      });
    }

    // Si la asignatura ya tiene un docente, removerlo primero
    if (asignatura.docenteUid && asignatura.docenteUid !== docenteUid) {
      await removerAsignaturaDeDocente(asignatura.docenteUid, asignaturaId);
    }

    // Asignar el nuevo docente a la asignatura
    await editarAsignaturaEnFirestore(asignaturaId, { docenteUid });
    
    // Agregar la asignatura al docente
    await agregarAsignaturaADocente(docenteUid, asignaturaId);

    res.json({ 
      message: 'Docente asignado correctamente',
      asignaturaId,
      docenteUid
    });
  } catch (error) {
    console.error('Error al asignar docente:', error);
    res.status(500).json({ error: error.message });
  }
}

// Remover docente de asignatura
async function removerDocente(req, res) {
  try {
    const { asignaturaId } = req.body;

    if (!asignaturaId) {
      return res.status(400).json({
        error: 'asignaturaId es obligatorio'
      });
    }

    // Obtener la asignatura para verificar si tiene docente
    const asignatura = await obtenerAsignaturaPorId(asignaturaId);
    if (!asignatura) {
      return res.status(404).json({
        error: 'Asignatura no encontrada'
      });
    }

    if (!asignatura.docenteUid) {
      return res.status(400).json({
        error: 'La asignatura no tiene docente asignado'
      });
    }

    // Remover la asignatura del docente
    await removerAsignaturaDeDocente(asignatura.docenteUid, asignaturaId);
    
    // Remover el docente de la asignatura
    await editarAsignaturaEnFirestore(asignaturaId, { docenteUid: null });

    res.json({ 
      message: 'Docente removido correctamente',
      asignaturaId,
      docenteUid: asignatura.docenteUid
    });
  } catch (error) {
    console.error('Error al remover docente:', error);
    res.status(500).json({ error: error.message });
  }
}

// Obtener docentes disponibles (sin asignaturas o con pocas asignaturas)
async function obtenerDocentesDisponibles(req, res) {
  try {
    const { maxAsignaturas = 5 } = req.query; // Por defecto máximo 5 asignaturas
    
    const docentes = await obtenerDocentesConAsignaturas();
    const docentesDisponibles = docentes.filter(docente => 
      docente.asignaturasUid.length < parseInt(maxAsignaturas)
    );
    
    res.json(docentesDisponibles);
  } catch (error) {
    console.error('Error al obtener docentes disponibles:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  crearAsignatura,
  obtenerAsignaturas,
  obtenerAsignatura,
  editarAsignatura,
  eliminarAsignatura,
  obtenerAsignaturasPorDocente: obtenerAsignaturasPorDocenteController,
  obtenerAsignaturasPorEstudiante: obtenerAsignaturasPorEstudianteController,
  agregarEstudiante,
  removerEstudiante,
  asignarDocente,
  removerDocente,
  obtenerDocentesDisponibles
};
