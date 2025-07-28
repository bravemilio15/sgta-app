const { body, validationResult } = require('express-validator');
const {
  crearTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  obtenerTareasPorDocente,
  crearAsignacion,
  obtenerAsignacionesPorTarea,
  crearEntrega,
  obtenerEntrega,
  actualizarEntrega,
  obtenerEntregasPorTarea,
  obtenerEntregaPorEstudianteTarea,
  obtenerTareasEstudiante,
  subirArchivo
} = require('../services/firebaseService');
const { validarArchivos } = require('../services/fileService');
const { notificarNuevaTarea, notificarCalificacion } = require('../services/notificationService');
const { Tarea, TiposTarea } = require('../models/tarea');
const { Entrega, EstadosEntrega } = require('../models/entrega');
const { Asignacion, TiposAsignacion } = require('../models/asignacion');
const admin = require('firebase-admin');

// Validaciones para crear tarea
const validacionesCrearTarea = [
  body('titulo').notEmpty().withMessage('El título es requerido'),
  body('descripcion').notEmpty().withMessage('La descripción es requerida'),
  body('fechaInicio').isISO8601().withMessage('Fecha de inicio inválida'),
  body('fechaEntrega').isISO8601().withMessage('Fecha de entrega inválida'),
  body('tipo').isIn(Object.keys(TiposTarea)).withMessage('Tipo de tarea inválido'),
  body('asignatura').notEmpty().withMessage('La asignatura es requerida')
];

// RF08: Crear tarea (Docente)
async function crearTareaDocente(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      titulo,
      descripcion,
      fechaInicio,
      fechaEntrega,
      tipo,
      asignatura,
      permiteEntregaTardia,
      diasPermitidosEntregaTardia,
      porcentajePenalizacion,
      archivosPermitidos,
      tamanioMaximoMB
    } = req.body;

    // Validar que el usuario sea docente
    if (req.usuario.tipo !== 'docente') {
      return res.status(403).json({ error: 'Solo los docentes pueden crear tareas' });
    }

    // Validar fechas
    if (new Date(fechaInicio) > new Date(fechaEntrega)) {
      return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la fecha de entrega' });
    }

    const nuevaTarea = new Tarea({
      titulo,
      descripcion,
      fechaInicio,
      fechaEntrega,
      tipo,
      asignatura,
      docenteId: req.usuario.uid,
      permiteEntregaTardia: permiteEntregaTardia || false,
      diasPermitidosEntregaTardia: diasPermitidosEntregaTardia || 0,
      porcentajePenalizacion: porcentajePenalizacion || 50,
      archivosPermitidos: archivosPermitidos || ['pdf', 'xlsx', 'docx'],
      tamanioMaximoMB: tamanioMaximoMB || 10
    });

    const tareaId = await crearTarea(nuevaTarea);
    nuevaTarea.id = tareaId;

    res.status(201).json({
      message: 'Tarea creada exitosamente',
      tarea: nuevaTarea
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
}

// RF08: Editar tarea (Docente)
async function editarTareaDocente(req, res) {
  try {
    const { tareaId } = req.params;
    const actualizaciones = req.body;

    // Verificar que la tarea existe y pertenece al docente
    const tarea = await obtenerTarea(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    if (tarea.docenteId !== req.usuario.uid) {
      return res.status(403).json({ error: 'No tienes permisos para editar esta tarea' });
    }

    // Validar fechas si se están actualizando
    if (actualizaciones.fechaInicio && actualizaciones.fechaEntrega) {
      if (new Date(actualizaciones.fechaInicio) > new Date(actualizaciones.fechaEntrega)) {
        return res.status(400).json({ error: 'La fecha de inicio no puede ser posterior a la fecha de entrega' });
      }
    }

    await actualizarTarea(tareaId, actualizaciones);

    res.json({
      message: 'Tarea actualizada exitosamente',
      tareaId
    });
  } catch (error) {
    console.error('Error al editar tarea:', error);
    res.status(500).json({ error: 'Error al editar la tarea' });
  }
}

// RF08: Eliminar tarea (Docente)
async function eliminarTareaDocente(req, res) {
  try {
    const { tareaId } = req.params;

    // Verificar que la tarea existe y pertenece al docente
    const tarea = await obtenerTarea(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    if (tarea.docenteId !== req.usuario.uid) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta tarea' });
    }

    // Verificar si hay entregas
    const entregas = await obtenerEntregasPorTarea(tareaId);
    if (entregas.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar una tarea que tiene entregas de estudiantes' 
      });
    }

    await eliminarTarea(tareaId);

    res.json({
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
}

// RF09: Asignar tarea (Docente)
async function asignarTarea(req, res) {
  try {
    const { tareaId } = req.params;
    const { tipo, destinatarios, justificacion } = req.body;

    // Validar que la tarea existe y pertenece al docente
    const tarea = await obtenerTarea(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    if (tarea.docenteId !== req.usuario.uid) {
      return res.status(403).json({ error: 'No tienes permisos para asignar esta tarea' });
    }

    // Validar tipo de asignación
    if (!Object.values(TiposAsignacion).includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de asignación inválido' });
    }

    // Validar destinatarios
    if (!destinatarios || destinatarios.length === 0) {
      return res.status(400).json({ error: 'Debe especificar al menos un destinatario' });
    }

    // Si es individual, justificación puede ser requerida
    if (tipo === TiposAsignacion.INDIVIDUAL && destinatarios.length === 1 && !justificacion) {
      console.warn('Asignación individual sin justificación');
    }

    const nuevaAsignacion = new Asignacion({
      tareaId,
      tipo,
      destinatarios,
      justificacion
    });

    const asignacionId = await crearAsignacion(nuevaAsignacion);
    nuevaAsignacion.id = asignacionId;

    // Notificar a los estudiantes
    await notificarNuevaTarea(destinatarios, tarea);

    res.status(201).json({
      message: 'Tarea asignada exitosamente',
      asignacion: nuevaAsignacion
    });
  } catch (error) {
    console.error('Error al asignar tarea:', error);
    res.status(500).json({ error: 'Error al asignar la tarea' });
  }
}

// RF12: Crear/actualizar entrega (Estudiante)
async function gestionarEntrega(req, res) {
  try {
    const { tareaId } = req.params;
    const estudianteId = req.usuario.uid;

    // Verificar que la tarea existe
    const tarea = await obtenerTarea(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Verificar que el estudiante tiene asignada esta tarea
    const asignaciones = await obtenerAsignacionesPorTarea(tareaId);
    const tieneAsignacion = asignaciones.some(asig => 
      asig.destinatarios.includes(estudianteId)
    );

    if (!tieneAsignacion) {
      return res.status(403).json({ error: 'No tienes asignada esta tarea' });
    }

    // Verificar si ya existe una entrega
    let entrega = await obtenerEntregaPorEstudianteTarea(estudianteId, tareaId);

    // Validar archivos
    if (req.files && req.files.length > 0) {
      const erroresArchivos = validarArchivos(req.files, tarea);
      if (erroresArchivos.length > 0) {
        return res.status(400).json({ errores: erroresArchivos });
      }
    }

    // Verificar si es entrega tardía
    const ahora = new Date();
    const fechaLimite = new Date(tarea.fechaEntrega);
    let esEntregaTardia = false;
    let penalizacionAplicada = false;

    if (ahora > fechaLimite) {
      if (!tarea.permiteEntregaTardia) {
        return res.status(400).json({ error: 'Esta tarea no permite entregas tardías' });
      }

      const diasTarde = Math.ceil((ahora - fechaLimite) / (1000 * 60 * 60 * 24));
      if (diasTarde > tarea.diasPermitidosEntregaTardia) {
        return res.status(400).json({ 
          error: `El plazo para entregas tardías ha expirado (máximo ${tarea.diasPermitidosEntregaTardia} días)` 
        });
      }

      esEntregaTardia = true;
      penalizacionAplicada = true;
    }

    // Subir archivos si se proporcionaron
    let archivosSubidos = [];
    if (req.files && req.files.length > 0) {
      for (const archivo of req.files) {
        const archivoSubido = await subirArchivo(archivo, `tareas/${tareaId}/${estudianteId}`);
        archivosSubidos.push(archivoSubido);
      }
    }

    if (entrega) {
      // Actualizar entrega existente
      const actualizaciones = {
        archivos: [...(entrega.archivos || []), ...archivosSubidos],
        fechaEntrega: new Date().toISOString(),
        estado: EstadosEntrega.ENTREGADA,
        esEntregaTardia,
        penalizacionAplicada
      };

      // Agregar al historial
      const historialItem = {
        timestamp: new Date().toISOString(),
        accion: 'actualizacion',
        detalles: `Se actualizó la entrega con ${archivosSubidos.length} archivo(s) nuevo(s)`
      };

      actualizaciones.historial = [...(entrega.historial || []), historialItem];

      await actualizarEntrega(entrega.id, actualizaciones);

      res.json({
        message: 'Entrega actualizada exitosamente',
        entregaId: entrega.id,
        esEntregaTardia,
        penalizacionAplicada
      });
    } else {
      // Crear nueva entrega
      const nuevaEntrega = new Entrega({
        tareaId,
        estudianteId,
        archivos: archivosSubidos,
        fechaEntrega: new Date().toISOString(),
        estado: EstadosEntrega.ENTREGADA,
        esEntregaTardia,
        penalizacionAplicada,
        historial: [{
          timestamp: new Date().toISOString(),
          accion: 'creacion',
          detalles: `Entrega creada con ${archivosSubidos.length} archivo(s)`
        }]
      });

      const entregaId = await crearEntrega(nuevaEntrega);

      res.status(201).json({
        message: 'Entrega creada exitosamente',
        entregaId,
        esEntregaTardia,
        penalizacionAplicada
      });
    }
  } catch (error) {
    console.error('Error al gestionar entrega:', error);
    res.status(500).json({ error: 'Error al procesar la entrega' });
  }
}

// RF12: Eliminar archivo de entrega (Estudiante)
async function eliminarArchivoEntrega(req, res) {
  try {
    const { tareaId, archivoNombre } = req.params;
    const estudianteId = req.usuario.uid;

    // Obtener la entrega
    const entrega = await obtenerEntregaPorEstudianteTarea(estudianteId, tareaId);
    if (!entrega) {
      return res.status(404).json({ error: 'No se encontró una entrega para esta tarea' });
    }

    // Verificar que el archivo existe en la entrega
    const archivoIndex = entrega.archivos.findIndex(a => a.nombre === archivoNombre);
    if (archivoIndex === -1) {
      return res.status(404).json({ error: 'Archivo no encontrado en la entrega' });
    }

    // Verificar que la entrega no esté calificada
    if (entrega.estado === EstadosEntrega.CALIFICADA) {
      return res.status(400).json({ error: 'No se pueden modificar entregas ya calificadas' });
    }

    // Eliminar archivo
    const nuevosArchivos = entrega.archivos.filter((_, index) => index !== archivoIndex);

    // Validar que aún cumpla con los requisitos mínimos
    const tarea = await obtenerTarea(tareaId);
    const extensionesRestantes = nuevosArchivos.map(a => 
      a.nombre.split('.').pop().toLowerCase()
    );

    if (!extensionesRestantes.includes('pdf')) {
      return res.status(400).json({ error: 'Debe mantener al menos un archivo PDF' });
    }

    if (!extensionesRestantes.some(ext => ['xlsx', 'xls'].includes(ext))) {
      return res.status(400).json({ error: 'Debe mantener al menos un archivo Excel' });
    }

    // Actualizar entrega
    const actualizaciones = {
      archivos: nuevosArchivos,
      historial: [...entrega.historial, {
        timestamp: new Date().toISOString(),
        accion: 'eliminacion_archivo',
        detalles: `Se eliminó el archivo: ${archivoNombre}`
      }]
    };

    await actualizarEntrega(entrega.id, actualizaciones);

    res.json({
      message: 'Archivo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ error: 'Error al eliminar el archivo' });
  }
}

// RF14: Calificar entrega (Docente)
async function calificarEntrega(req, res) {
  try {
    const { entregaId } = req.params;
    const { calificacion, retroalimentacion } = req.body;

    // Validar calificación
    if (calificacion === undefined || calificacion < 0 || calificacion > 10) {
      return res.status(400).json({ error: 'La calificación debe estar entre 0 y 10' });
    }

    // Obtener la entrega
    const entrega = await obtenerEntrega(entregaId);
    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    // Verificar que la tarea pertenece al docente
    const tarea = await obtenerTarea(entrega.tareaId);
    if (tarea.docenteId !== req.usuario.uid) {
      return res.status(403).json({ error: 'No tienes permisos para calificar esta entrega' });
    }

    // Aplicar penalización si corresponde
    let calificacionFinal = calificacion;
    if (entrega.esEntregaTardia && entrega.penalizacionAplicada) {
      calificacionFinal = calificacion * (1 - tarea.porcentajePenalizacion / 100);
      calificacionFinal = Math.round(calificacionFinal * 100) / 100; // Redondear a 2 decimales
    }

    // Actualizar entrega
    const actualizaciones = {
      calificacion: calificacionFinal,
      calificacionOriginal: calificacion,
      retroalimentacion,
      estado: EstadosEntrega.CALIFICADA,
      fechaCalificacion: new Date().toISOString(),
      historial: [...entrega.historial, {
        timestamp: new Date().toISOString(),
        accion: 'calificacion',
        detalles: `Calificada con ${calificacionFinal}/10${entrega.esEntregaTardia ? ' (con penalización)' : ''}`
      }]
    };

    await actualizarEntrega(entregaId, actualizaciones);

    // Notificar al estudiante
    await notificarCalificacion(entrega.estudianteId, tarea, calificacionFinal);

    res.json({
      message: 'Entrega calificada exitosamente',
      calificacionFinal,
      penalizacionAplicada: entrega.esEntregaTardia
    });
  } catch (error) {
    console.error('Error al calificar entrega:', error);
    res.status(500).json({ error: 'Error al calificar la entrega' });
  }
}

// RF13: Obtener dashboard del estudiante
async function obtenerDashboardEstudiante(req, res) {
  try {
    const estudianteId = req.usuario.uid;

    // Obtener todas las tareas asignadas al estudiante
    const tareas = await obtenerTareasEstudiante(estudianteId);

    // Obtener entregas del estudiante
    const entregasPromises = tareas.map(tarea => 
      obtenerEntregaPorEstudianteTarea(estudianteId, tarea.id)
    );
    const entregas = await Promise.all(entregasPromises);

    // Procesar información para el dashboard
    const dashboard = {
      asignaturasActivas: [...new Set(tareas.map(t => t.asignatura))],
      resumen: {
        totalTareas: tareas.length,
        tareasPendientes: 0,
        tareasEntregadas: 0,
        tareasCalificadas: 0,
        promedioCalificacion: 0
      },
      tareas: []
    };

    let sumaCalificaciones = 0;
    let cantidadCalificadas = 0;

    tareas.forEach((tarea, index) => {
      const entrega = entregas[index];
      const ahora = new Date();
      const fechaEntrega = new Date(tarea.fechaEntrega);
      const diasRestantes = Math.ceil((fechaEntrega - ahora) / (1000 * 60 * 60 * 24));

      let estado = 'pendiente';
      let indicadorTiempo = 'normal';

      if (entrega) {
        if (entrega.estado === EstadosEntrega.CALIFICADA) {
          estado = 'calificada';
          dashboard.resumen.tareasCalificadas++;
          sumaCalificaciones += entrega.calificacion;
          cantidadCalificadas++;
        } else {
          estado = 'entregada';
          dashboard.resumen.tareasEntregadas++;
        }
      } else {
        dashboard.resumen.tareasPendientes++;
        
        // Indicadores de tiempo
        if (diasRestantes < 0) {
          indicadorTiempo = 'vencida';
        } else if (diasRestantes <= 1) {
          indicadorTiempo = 'urgente';
        } else if (diasRestantes <= 3) {
          indicadorTiempo = 'proximo';
        }
      }

      dashboard.tareas.push({
        id: tarea.id,
        titulo: tarea.titulo,
        asignatura: tarea.asignatura,
        fechaEntrega: tarea.fechaEntrega,
        diasRestantes,
        indicadorTiempo,
        estado,
        calificacion: entrega?.calificacion || null,
        retroalimentacion: entrega?.retroalimentacion || null,
        esEntregaTardia: entrega?.esEntregaTardia || false
      });
    });

    // Calcular promedio
    if (cantidadCalificadas > 0) {
      dashboard.resumen.promedioCalificacion = Math.round((sumaCalificaciones / cantidadCalificadas) * 100) / 100;
    }

    // Ordenar tareas por fecha de entrega
    dashboard.tareas.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));

    res.json(dashboard);
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ error: 'Error al obtener el dashboard' });
  }
}

// Obtener tareas del docente
async function obtenerTareasDocente(req, res) {
  try {
    const docenteId = req.usuario.uid;
    const tareas = await obtenerTareasPorDocente(docenteId);

    // Enriquecer con información de asignaciones y entregas
    const tareasConInfo = await Promise.all(tareas.map(async (tarea) => {
      const asignaciones = await obtenerAsignacionesPorTarea(tarea.id);
      const entregas = await obtenerEntregasPorTarea(tarea.id);

      const totalEstudiantes = asignaciones.reduce((sum, asig) => 
        sum + asig.destinatarios.length, 0
      );

      return {
        ...tarea,
        totalEstudiantes,
        entregasRecibidas: entregas.length,
        entregasCalificadas: entregas.filter(e => e.estado === EstadosEntrega.CALIFICADA).length
      };
    }));

    res.json(tareasConInfo);
  } catch (error) {
    console.error('Error al obtener tareas del docente:', error);
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
}

// Obtener detalle de tarea con entregas (Docente)
async function obtenerDetalleTarea(req, res) {
  try {
    const { tareaId } = req.params;

    // Obtener tarea
    const tarea = await obtenerTarea(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Verificar permisos
    if (tarea.docenteId !== req.usuario.uid) {
      return res.status(403).json({ error: 'No tienes permisos para ver esta tarea' });
    }

    // Obtener asignaciones y entregas
    const asignaciones = await obtenerAsignacionesPorTarea(tareaId);
    const entregas = await obtenerEntregasPorTarea(tareaId);

    // Obtener información de estudiantes
    const db = admin.firestore();
    const estudiantesIds = [...new Set(asignaciones.flatMap(a => a.destinatarios))];
    
    const estudiantesPromises = estudiantesIds.map(id => 
      db.collection('usuarios').doc(id).get()
    );
    const estudiantesDocs = await Promise.all(estudiantesPromises);
    
    const estudiantes = estudiantesDocs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Mapear entregas con información de estudiantes
    const entregasConEstudiantes = entregas.map(entrega => {
      const estudiante = estudiantes.find(e => e.id === entrega.estudianteId);
      return {
        ...entrega,
        estudiante: {
          id: estudiante.id,
          nombreCompleto: estudiante.nombreCompleto,
          correoInstitucional: estudiante.correoInstitucional
        }
      };
    });

    res.json({
      tarea,
      asignaciones,
      entregas: entregasConEstudiantes,
      estadisticas: {
        totalEstudiantes: estudiantesIds.length,
        entregasRecibidas: entregas.length,
        entregasCalificadas: entregas.filter(e => e.estado === EstadosEntrega.CALIFICADA).length,
        entregasPendientes: estudiantesIds.length - entregas.length
      }
    });
  } catch (error) {
    console.error('Error al obtener detalle de tarea:', error);
    res.status(500).json({ error: 'Error al obtener el detalle de la tarea' });
  }
}

// Obtener una tarea específica
async function obtenerTareaEspecifica(req, res) {
  try {
    const { tareaId } = req.params;
    const tarea = await obtenerTarea(tareaId);
    
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Verificar permisos
    if (req.usuario.tipo === 'docente' && tarea.docenteId !== req.usuario.uid) {
      return res.status(403).json({ error: 'No tienes permisos para ver esta tarea' });
    }

    res.json(tarea);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ error: 'Error al obtener la tarea' });
  }
}

// Obtener entregas de una tarea
async function obtenerEntregasTarea(req, res) {
  try {
    const { tareaId } = req.params;
    
    // Verificar que la tarea existe y pertenece al docente
    const tarea = await obtenerTarea(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    if (tarea.docenteId !== req.usuario.uid) {
      return res.status(403).json({ error: 'No tienes permisos para ver las entregas de esta tarea' });
    }

    const entregas = await obtenerEntregasPorTarea(tareaId);
    res.json(entregas);
  } catch (error) {
    console.error('Error al obtener entregas:', error);
    res.status(500).json({ error: 'Error al obtener las entregas' });
  }
}

// Obtener entrega específica
async function obtenerEntregaEspecifica(req, res) {
  try {
    const { entregaId } = req.params;
    const entrega = await obtenerEntrega(entregaId);
    
    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    // Verificar permisos
    if (req.usuario.tipo === 'estudiante' && entrega.estudianteId !== req.usuario.uid) {
      return res.status(403).json({ error: 'No tienes permisos para ver esta entrega' });
    }

    res.json(entrega);
  } catch (error) {
    console.error('Error al obtener entrega:', error);
    res.status(500).json({ error: 'Error al obtener la entrega' });
  }
}

// Actualizar entrega
async function actualizarEntregaEstudiante(req, res) {
  try {
    const { entregaId } = req.params;
    const actualizaciones = req.body;

    // Verificar que la entrega existe y pertenece al estudiante
    const entrega = await obtenerEntrega(entregaId);
    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    if (entrega.estudianteId !== req.usuario.uid) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar esta entrega' });
    }

    const entregaActualizada = await actualizarEntrega(entregaId, actualizaciones);
    res.json(entregaActualizada);
  } catch (error) {
    console.error('Error al actualizar entrega:', error);
    res.status(500).json({ error: 'Error al actualizar la entrega' });
  }
}

// Eliminar entrega
async function eliminarEntregaEstudiante(req, res) {
  try {
    const { entregaId } = req.params;

    // Verificar que la entrega existe y pertenece al estudiante
    const entrega = await obtenerEntrega(entregaId);
    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    if (entrega.estudianteId !== req.usuario.uid) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta entrega' });
    }

    await eliminarEntrega(entregaId);
    res.json({ message: 'Entrega eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar entrega:', error);
    res.status(500).json({ error: 'Error al eliminar la entrega' });
  }
}

// Obtener información de usuarios para tareas
async function obtenerUsuariosParaTarea(req, res) {
  try {
    const { tareaId } = req.params;
    const { tipo } = req.query; // 'estudiantes' o 'docente'

    // Verificar que la tarea existe
    const tarea = await obtenerTarea(tareaId);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    const db = admin.firestore();
    let usuarios = [];

    if (tipo === 'estudiantes') {
      // Obtener estudiantes asignados a la tarea
      const asignaciones = await obtenerAsignacionesPorTarea(tareaId);
      const estudiantesIds = [...new Set(asignaciones.flatMap(a => a.destinatarios))];
      
      const estudiantesPromises = estudiantesIds.map(id => 
        db.collection('usuarios').doc(id).get()
      );
      const estudiantesDocs = await Promise.all(estudiantesPromises);
      
      usuarios = estudiantesDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } else if (tipo === 'docente') {
      // Obtener información del docente
      const docenteDoc = await db.collection('usuarios').doc(tarea.docenteId).get();
      if (docenteDoc.exists) {
        usuarios = [{
          id: docenteDoc.id,
          ...docenteDoc.data()
        }];
      }
    }

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios para tarea:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

// Obtener tareas por asignatura
async function obtenerTareasPorAsignatura(req, res) {
  try {
    const { asignaturaId } = req.params;
    const { tipo } = req.query; // 'docente' o 'estudiante'

    // Obtener todas las tareas del docente
    const tareas = await obtenerTareasPorDocente(req.usuario.uid);
    
    // Filtrar por asignatura
    const tareasAsignatura = tareas.filter(tarea => tarea.asignatura === asignaturaId);

    // Enriquecer con información de asignaciones y entregas
    const tareasConInfo = await Promise.all(tareasAsignatura.map(async (tarea) => {
      const asignaciones = await obtenerAsignacionesPorTarea(tarea.id);
      const entregas = await obtenerEntregasPorTarea(tarea.id);

      const totalEstudiantes = asignaciones.reduce((sum, asig) => 
        sum + asig.destinatarios.length, 0
      );

      return {
        ...tarea,
        totalEstudiantes,
        entregasRecibidas: entregas.length,
        entregasCalificadas: entregas.filter(e => e.estado === EstadosEntrega.CALIFICADA).length
      };
    }));

    res.json(tareasConInfo);
  } catch (error) {
    console.error('Error al obtener tareas por asignatura:', error);
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
}

// Obtener estadísticas de usuario en tareas
async function obtenerEstadisticasUsuarioTareas(req, res) {
  try {
    const { uid } = req.params;
    const usuario = req.usuario;

    // Verificar permisos
    if (usuario.uid !== uid && usuario.tipo !== 'administrador') {
      return res.status(403).json({ error: 'No tienes permisos para ver estas estadísticas' });
    }

    let estadisticas = {};

    if (usuario.tipo === 'docente') {
      // Estadísticas para docentes
      const tareas = await obtenerTareasPorDocente(uid);
      const totalTareas = tareas.length;
      const tareasActivas = tareas.filter(t => t.estado === 'activa').length;
      const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;

      // Calcular entregas totales
      let totalEntregas = 0;
      let entregasCalificadas = 0;
      
      for (const tarea of tareas) {
        const entregas = await obtenerEntregasPorTarea(tarea.id);
        totalEntregas += entregas.length;
        entregasCalificadas += entregas.filter(e => e.estado === EstadosEntrega.CALIFICADA).length;
      }

      estadisticas = {
        totalTareas,
        tareasActivas,
        tareasCompletadas,
        totalEntregas,
        entregasCalificadas,
        porcentajeCompletado: totalTareas > 0 ? (tareasCompletadas / totalTareas) * 100 : 0
      };
    } else if (usuario.tipo === 'estudiante') {
      // Estadísticas para estudiantes
      const tareas = await obtenerTareasEstudiante(uid);
      const totalTareas = tareas.length;
      const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
      const tareasEntregadas = tareas.filter(t => t.estado === 'entregada').length;
      const tareasCalificadas = tareas.filter(t => t.estado === 'calificada').length;

      // Calcular promedio de calificaciones
      const calificaciones = tareas
        .filter(t => t.calificacion)
        .map(t => t.calificacion);
      
      const promedioCalificacion = calificaciones.length > 0 
        ? calificaciones.reduce((sum, cal) => sum + cal, 0) / calificaciones.length 
        : 0;

      estadisticas = {
        totalTareas,
        tareasPendientes,
        tareasEntregadas,
        tareasCalificadas,
        promedioCalificacion,
        porcentajeCompletado: totalTareas > 0 ? (tareasCalificadas / totalTareas) * 100 : 0
      };
    }

    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas de usuario:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
}

module.exports = {
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
};