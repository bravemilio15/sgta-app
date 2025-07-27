const admin = require('firebase-admin');
const { PeriodoAcademico, EstadoPeriodo, TipoPeriodo } = require('../models/periodoAcademico');
const db = admin.firestore();

// Crear un nuevo período académico
async function crearPeriodoAcademico(req, res) {
  try {
    const {
      nombre,
      fechaInicio,
      fechaFin,
      tipo = TipoPeriodo.TRIMESTRE,
      estado = EstadoPeriodo.PLANIFICACION,
      descripcion = ''
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !fechaInicio || !fechaFin) {
      return res.status(400).json({
        error: 'nombre, fechaInicio y fechaFin son obligatorios'
      });
    }

    // Validar que las fechas sean válidas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        error: 'Las fechas deben ser válidas'
      });
    }

    if (inicio >= fin) {
      return res.status(400).json({
        error: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
    }

    // Verificar si ya existe un período con el mismo nombre
    const periodosRef = db.collection('periodos_academicos');
    const queryNombre = await periodosRef.where('nombre', '==', nombre).get();
    
    if (!queryNombre.empty) {
      return res.status(400).json({
        error: 'Ya existe un período académico con ese nombre'
      });
    }

    // Crear el período académico
    const periodo = new PeriodoAcademico({
      nombre,
      fechaInicio: inicio.toISOString(),
      fechaFin: fin.toISOString(),
      tipo,
      descripcion,
      estado,
      esActivo: estado === EstadoPeriodo.ACTIVO
    });

    // Guardar en Firestore
    const periodoRef = await periodosRef.add(periodo.toJSON());
    
    // Actualizar el documento con el ID correcto
    await periodoRef.update({ id: periodoRef.id });
    
    // Obtener el documento actualizado
    const docSnapshot = await periodoRef.get();
    const periodoActualizado = new PeriodoAcademico({ id: docSnapshot.id, ...docSnapshot.data() });

    res.status(201).json({
      mensaje: 'Período académico creado exitosamente',
      periodo: periodoActualizado.toJSON()
    });
  } catch (error) {
    console.error('Error al crear período académico:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Obtener todos los períodos académicos
async function obtenerPeriodosAcademicos(req, res) {
  try {
    console.log('Obteniendo períodos académicos...');
    const { estado, tipo } = req.query;
    
    let query = db.collection('periodos_academicos');
    
    // Aplicar filtros si se proporcionan
    if (estado) {
      query = query.where('estado', '==', estado);
    }
    
    if (tipo) {
      query = query.where('tipo', '==', tipo);
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    query = query.orderBy('fechaCreacion', 'desc');
    
    const snapshot = await query.get();
    const periodos = [];
    
    snapshot.forEach(doc => {
      const periodo = new PeriodoAcademico({ id: doc.id, ...doc.data() });
      periodos.push(periodo.toJSON());
    });

    console.log(`Períodos encontrados: ${periodos.length}`);
    res.json({
      periodos,
      total: periodos.length
    });
  } catch (error) {
    console.error('Error al obtener períodos académicos:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Obtener un período académico por ID
async function obtenerPeriodoAcademico(req, res) {
  try {
    const { id } = req.params;
    
    const periodoRef = db.collection('periodos_academicos').doc(id);
    const periodoDoc = await periodoRef.get();
    
    if (!periodoDoc.exists) {
      return res.status(404).json({
        error: 'Período académico no encontrado'
      });
    }

    const periodo = new PeriodoAcademico({ id, ...periodoDoc.data() });
    
    res.json({
      periodo: periodo.toJSON()
    });
  } catch (error) {
    console.error('Error al obtener período académico:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Obtener el período académico activo
async function obtenerPeriodoActivo(req, res) {
  try {
    const periodosRef = db.collection('periodos_academicos');
    const queryActivo = await periodosRef.where('esActivo', '==', true).limit(1).get();
    
    if (queryActivo.empty) {
      return res.status(404).json({
        error: 'No hay un período académico activo'
      });
    }

    const periodoDoc = queryActivo.docs[0];
    const periodo = new PeriodoAcademico({ id: periodoDoc.id, ...periodoDoc.data() });
    
    res.json({
      periodo: periodo.toJSON()
    });
  } catch (error) {
    console.error('Error al obtener período activo:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Actualizar un período académico
async function actualizarPeriodoAcademico(req, res) {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;
    
    const periodoRef = db.collection('periodos_academicos').doc(id);
    const periodoDoc = await periodoRef.get();
    
    if (!periodoDoc.exists) {
      return res.status(404).json({
        error: 'Período académico no encontrado'
      });
    }

    // Validar fechas si se están actualizando
    if (datosActualizados.fechaInicio || datosActualizados.fechaFin) {
      const fechaInicio = datosActualizados.fechaInicio ? new Date(datosActualizados.fechaInicio) : new Date(periodoDoc.data().fechaInicio);
      const fechaFin = datosActualizados.fechaFin ? new Date(datosActualizados.fechaFin) : new Date(periodoDoc.data().fechaFin);
      
      if (fechaInicio >= fechaFin) {
        return res.status(400).json({
          error: 'La fecha de inicio debe ser anterior a la fecha de fin'
        });
      }
    }

    // Campos permitidos para actualizar
    const camposPermitidos = ['nombre', 'fechaInicio', 'fechaFin', 'tipo', 'descripcion', 'estado'];
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
    
    await periodoRef.update(datosParaActualizar);
    
    res.json({
      mensaje: 'Período académico actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar período académico:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Activar un período académico
async function activarPeriodoAcademico(req, res) {
  try {
    const { id } = req.params;
    
    const periodoRef = db.collection('periodos_academicos').doc(id);
    const periodoDoc = await periodoRef.get();
    
    if (!periodoDoc.exists) {
      return res.status(404).json({
        error: 'Período académico no encontrado'
      });
    }

    const periodo = new PeriodoAcademico({ id, ...periodoDoc.data() });
    
    if (!periodo.puedeActivarse()) {
      return res.status(400).json({
        error: 'El período no puede activarse en este momento'
      });
    }

    // Desactivar todos los otros períodos
    const batch = db.batch();
    const todosLosPeriodos = await db.collection('periodos_academicos').get();
    
    todosLosPeriodos.forEach(doc => {
      batch.update(doc.ref, { esActivo: false });
    });
    
    // Activar el período seleccionado
    batch.update(periodoRef, { 
      esActivo: true, 
      estado: EstadoPeriodo.ACTIVO,
      fechaActualizacion: new Date().toISOString()
    });
    
    await batch.commit();
    
    res.json({
      mensaje: 'Período académico activado exitosamente'
    });
  } catch (error) {
    console.error('Error al activar período académico:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Finalizar un período académico
async function finalizarPeriodoAcademico(req, res) {
  try {
    const { id } = req.params;
    
    const periodoRef = db.collection('periodos_academicos').doc(id);
    const periodoDoc = await periodoRef.get();
    
    if (!periodoDoc.exists) {
      return res.status(404).json({
        error: 'Período académico no encontrado'
      });
    }

    const periodo = new PeriodoAcademico({ id, ...periodoDoc.data() });
    
    if (periodo.estado !== EstadoPeriodo.ACTIVO) {
      return res.status(400).json({
        error: 'Solo se pueden finalizar períodos activos'
      });
    }

    await periodoRef.update({
      estado: EstadoPeriodo.FINALIZADO,
      esActivo: false,
      fechaActualizacion: new Date().toISOString()
    });
    
    res.json({
      mensaje: 'Período académico finalizado exitosamente'
    });
  } catch (error) {
    console.error('Error al finalizar período académico:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Eliminar un período académico
async function eliminarPeriodoAcademico(req, res) {
  try {
    const { id } = req.params;
    
    const periodoRef = db.collection('periodos_academicos').doc(id);
    const periodoDoc = await periodoRef.get();
    
    if (!periodoDoc.exists) {
      return res.status(404).json({
        error: 'Período académico no encontrado'
      });
    }

    const periodo = new PeriodoAcademico({ id, ...periodoDoc.data() });
    
    // Solo permitir eliminar períodos en planificación
    if (periodo.estado !== EstadoPeriodo.PLANIFICACION) {
      return res.status(400).json({
        error: 'Solo se pueden eliminar períodos en planificación'
      });
    }

    await periodoRef.delete();
    
    res.json({
      mensaje: 'Período académico eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar período académico:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Obtener períodos por estado (ACTUAL, PASADO, FUTURO)
async function obtenerPeriodosPorEstado(req, res) {
  try {
    const { estado } = req.params; // ACTUAL, PASADO, FUTURO
    const ahora = new Date();
    
    // Obtener todos los períodos y filtrar en memoria para evitar problemas de índices
    const snapshot = await db.collection('periodos_academicos').get();
    const periodos = [];
    
    snapshot.forEach(doc => {
      const periodo = new PeriodoAcademico({ id: doc.id, ...doc.data() });
      const periodoData = periodo.toJSON();
      
      switch (estado.toUpperCase()) {
        case 'ACTUAL':
          if (periodo.esActivo) {
            periodos.push(periodoData);
          }
          break;
        case 'PASADO':
          if (new Date(periodo.fechaFin) < ahora) {
            periodos.push(periodoData);
          }
          break;
        case 'FUTURO':
          if (new Date(periodo.fechaInicio) > ahora) {
            periodos.push(periodoData);
          }
          break;
        default:
          return res.status(400).json({
            error: 'Estado debe ser ACTUAL, PASADO o FUTURO'
          });
      }
    });

    // Ordenar por fecha de creación (más recientes primero)
    periodos.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

    res.json({
      estado: estado.toUpperCase(),
      periodos,
      total: periodos.length
    });
  } catch (error) {
    console.error('Error al obtener períodos por estado:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

module.exports = {
  crearPeriodoAcademico,
  obtenerPeriodosAcademicos,
  obtenerPeriodoAcademico,
  obtenerPeriodoActivo,
  actualizarPeriodoAcademico,
  activarPeriodoAcademico,
  finalizarPeriodoAcademico,
  eliminarPeriodoAcademico,
  obtenerPeriodosPorEstado
}; 