const admin = require('firebase-admin');
const { PeriodoAcademico, EstadoPeriodo, TipoPeriodo } = require('../models/periodoAcademico');
const periodoAcademicoService = require('../services/periodoAcademicoService');
const db = admin.firestore();

// Crear un nuevo período académico
async function crearPeriodoAcademico(req, res) {
  try {
    const {
      nombre,
      fechaInicio,
      fechaFin,
      tipo = TipoPeriodo.TRIMESTRE,
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

    // Verificar solapamiento con otros períodos
    const todosLosPeriodos = await periodosRef.get();
    const nuevoPeriodo = new PeriodoAcademico({
      nombre,
      fechaInicio: inicio.toISOString(),
      fechaFin: fin.toISOString(),
      tipo,
      descripcion
    });

    for (const doc of todosLosPeriodos.docs) {
      const periodoExistente = new PeriodoAcademico({ id: doc.id, ...doc.data() });
      if (nuevoPeriodo.seSolapaCon(periodoExistente)) {
        return res.status(400).json({
          error: 'El período se solapa con otro período académico existente'
        });
      }
    }

    // Crear el período académico (el estado se calcula automáticamente)
    const periodo = new PeriodoAcademico({
      nombre,
      fechaInicio: inicio.toISOString(),
      fechaFin: fin.toISOString(),
      tipo,
      descripcion
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
      // Actualizar el estado automáticamente antes de enviar
      periodo.actualizarEstado();
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
    
    // Actualizar el estado automáticamente
    const huboCambios = periodo.actualizarEstado();
    
    // Si hubo cambios, actualizar en la base de datos
    if (huboCambios) {
      await periodoRef.update({
        estado: periodo.estado,
        esActivo: periodo.esActivo,
        fechaActualizacion: periodo.fechaActualizacion
      });
    }
    
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
    
    // Actualizar el estado automáticamente
    const huboCambios = periodo.actualizarEstado();
    
    // Si hubo cambios, actualizar en la base de datos
    if (huboCambios) {
      await periodoDoc.ref.update({
        estado: periodo.estado,
        esActivo: periodo.esActivo,
        fechaActualizacion: periodo.fechaActualizacion
      });
    }
    
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

      // Verificar solapamiento con otros períodos
      const todosLosPeriodos = await db.collection('periodos_academicos').get();
      const periodoActualizado = new PeriodoAcademico({
        ...periodoDoc.data(),
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      });

      for (const doc of todosLosPeriodos.docs) {
        if (doc.id !== id) {
          const periodoExistente = new PeriodoAcademico({ id: doc.id, ...doc.data() });
          if (periodoActualizado.seSolapaCon(periodoExistente)) {
            return res.status(400).json({
              error: 'El período se solapa con otro período académico existente'
            });
          }
        }
      }
    }

    // Campos permitidos para actualizar
    const camposPermitidos = ['nombre', 'fechaInicio', 'fechaFin', 'tipo', 'descripcion'];
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

// Activar un período académico manualmente
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

// Finalizar un período académico manualmente
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
      // Actualizar el estado automáticamente
      periodo.actualizarEstado();
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

// Nuevo endpoint para actualizar automáticamente todos los períodos
async function actualizarEstadosPeriodos(req, res) {
  try {
    const snapshot = await db.collection('periodos_academicos').get();
    const batch = db.batch();
    let periodosActualizados = 0;
    
    snapshot.forEach(doc => {
      const periodo = new PeriodoAcademico({ id: doc.id, ...doc.data() });
      const huboCambios = periodo.actualizarEstado();
      
      if (huboCambios) {
        batch.update(doc.ref, {
          estado: periodo.estado,
          esActivo: periodo.esActivo,
          fechaActualizacion: periodo.fechaActualizacion
        });
        periodosActualizados++;
      }
    });
    
    if (periodosActualizados > 0) {
      await batch.commit();
    }
    
    res.json({
      mensaje: `Estados actualizados automáticamente. ${periodosActualizados} períodos actualizados.`
    });
  } catch (error) {
    console.error('Error al actualizar estados de períodos:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Nuevo endpoint para obtener estadísticas de períodos académicos
async function obtenerEstadisticasPeriodos(req, res) {
  try {
    const estadisticas = await periodoAcademicoService.obtenerEstadisticas();
    
    res.json({
      estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de períodos:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Nuevo endpoint para verificar solapamientos
async function verificarSolapamientos(req, res) {
  try {
    const solapamientos = await periodoAcademicoService.verificarSolapamientos();
    
    res.json({
      solapamientos,
      total: solapamientos.length
    });
  } catch (error) {
    console.error('Error al verificar solapamientos:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Nuevo endpoint para obtener períodos que necesitan actualización
async function obtenerPeriodosParaActualizar(req, res) {
  try {
    const periodos = await periodoAcademicoService.obtenerPeriodosParaActualizar();
    
    res.json({
      periodos,
      total: periodos.length
    });
  } catch (error) {
    console.error('Error al obtener períodos para actualizar:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Nuevo endpoint para obtener el estado del servicio
async function obtenerEstadoServicio(req, res) {
  try {
    const estado = periodoAcademicoService.obtenerEstadoServicio();
    
    res.json({
      estado
    });
  } catch (error) {
    console.error('Error al obtener estado del servicio:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Nuevo endpoint para iniciar el servicio automático
async function iniciarServicioAutomatico(req, res) {
  try {
    const { intervaloMinutos = 60 } = req.body;
    
    periodoAcademicoService.iniciarActualizacionAutomatica(intervaloMinutos);
    
    res.json({
      mensaje: 'Servicio de actualización automática iniciado exitosamente',
      intervaloMinutos
    });
  } catch (error) {
    console.error('Error al iniciar servicio automático:', error);
    res.status(500).json({
      error: error.message
    });
  }
}

// Nuevo endpoint para detener el servicio automático
async function detenerServicioAutomatico(req, res) {
  try {
    periodoAcademicoService.detenerActualizacionAutomatica();
    
    res.json({
      mensaje: 'Servicio de actualización automática detenido exitosamente'
    });
  } catch (error) {
    console.error('Error al detener servicio automático:', error);
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
  obtenerPeriodosPorEstado,
  actualizarEstadosPeriodos,
  obtenerEstadisticasPeriodos,
  verificarSolapamientos,
  obtenerPeriodosParaActualizar,
  obtenerEstadoServicio,
  iniciarServicioAutomatico,
  detenerServicioAutomatico
}; 