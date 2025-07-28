const admin = require('firebase-admin');
const { Matricula, EstadoMatricula, EstadoAsignaturaMatricula } = require('../models/matricula');
const { PeriodoAcademico, EstadoPeriodo } = require('../models/periodoAcademico');
const db = admin.firestore();

class MatriculaService {
  // Crear una nueva matrícula para un estudiante
  static async crearMatricula(estudianteUid, periodoId, asignaturasIds = []) {
    try {
      // Verificar que el período esté activo
      const periodoRef = db.collection('periodos_academicos').doc(periodoId);
      const periodoDoc = await periodoRef.get();
      
      if (!periodoDoc.exists) {
        throw new Error('Período académico no encontrado');
      }
      
      const periodo = new PeriodoAcademico({ id: periodoId, ...periodoDoc.data() });
      
      // Verificar que el período esté activo (simplificado)
      if (!periodo.esActivo || periodo.estado !== EstadoPeriodo.ACTIVO) {
        throw new Error('El período académico no está activo');
      }
      
      // Verificar que el estudiante no tenga ya una matrícula activa en este período
      const matriculaExistente = await this.obtenerMatriculaEstudiante(estudianteUid, periodoId);
      if (matriculaExistente) {
        throw new Error('El estudiante ya tiene una matrícula activa para este período');
      }

      // Obtener información de las asignaturas
      const asignaturasData = [];
      for (const asignaturaId of asignaturasIds) {
        const asignaturaRef = db.collection('asignaturas').doc(asignaturaId);
        const asignaturaDoc = await asignaturaRef.get();
        
        if (!asignaturaDoc.exists) {
          throw new Error(`Asignatura ${asignaturaId} no encontrada`);
        }
        
        asignaturasData.push({
          id: asignaturaId,
          ...asignaturaDoc.data()
        });
      }
      
      // Crear la matrícula
      const matricula = new Matricula({
        estudianteUid,
        periodoId,
        fechaMatricula: new Date().toISOString()
      });

      // Agregar las asignaturas a la matrícula
      for (const asignatura of asignaturasData) {
        matricula.agregarAsignatura(asignatura.id, asignatura.nombre);
      }
      
      // Guardar en Firestore
      const matriculaRef = await db.collection('matriculas').add(matricula.toJSON());
      matricula.id = matriculaRef.id;
      
      return matricula;
    } catch (error) {
      console.error('Error al crear matrícula:', error);
      throw error;
    }
  }

  // Obtener la matrícula de un estudiante en un período específico
  static async obtenerMatriculaEstudiante(estudianteUid, periodoId) {
    try {
      const matriculasRef = db.collection('matriculas');
      const matriculaSnapshot = await matriculasRef
        .where('estudianteUid', '==', estudianteUid)
        .where('periodoId', '==', periodoId)
        .limit(1)
        .get();

      if (matriculaSnapshot.empty) {
        return null;
      }

      const matriculaDoc = matriculaSnapshot.docs[0];
      return new Matricula({ id: matriculaDoc.id, ...matriculaDoc.data() });
    } catch (error) {
      console.error('Error al obtener matrícula del estudiante:', error);
      throw error;
    }
  }

  // Obtener todas las matrículas de un estudiante
  static async obtenerMatriculasEstudiante(estudianteUid) {
    try {
      const matriculasRef = db.collection('matriculas');
      const matriculasSnapshot = await matriculasRef
        .where('estudianteUid', '==', estudianteUid)
        .orderBy('fechaMatricula', 'desc')
        .get();

      if (matriculasSnapshot.empty) {
        return [];
      }

      const matriculas = [];
      for (const doc of matriculasSnapshot.docs) {
        const data = doc.data();
        
        // Limpiar datos duplicados y asegurar estructura consistente
        const matriculaLimpia = {
          id: doc.id,
          estudianteUid: data.estudianteUid,
          periodoId: data.periodoId,
          fechaMatricula: data.fechaMatricula || data.fechaCreacion,
          estado: data.estado || 'ACTIVA',
          fechaCreacion: data.fechaCreacion,
          fechaActualizacion: data.fechaActualizacion,
          asignaturas: []
        };

        // Procesar asignaturas y eliminar duplicados
        if (data.asignaturas && Array.isArray(data.asignaturas)) {
          const asignaturasUnicas = new Map();
          
          data.asignaturas.forEach(asignatura => {
            if (asignatura.asignaturaId) {
              // Si ya existe, mantener la más reciente
              if (!asignaturasUnicas.has(asignatura.asignaturaId) || 
                  asignatura.fechaActualizacion > asignaturasUnicas.get(asignatura.asignaturaId).fechaActualizacion) {
                asignaturasUnicas.set(asignatura.asignaturaId, {
                  asignaturaId: asignatura.asignaturaId,
                  nombreAsignatura: asignatura.nombreAsignatura,
                  estado: asignatura.estado || 'MATRICULADA',
                  unidadAA: asignatura.unidadAA || 0,
                  unidadAPE: asignatura.unidadAPE || 0,
                  unidadACD: asignatura.unidadACD || 0,
                  notaTotal: asignatura.notaTotal || 0,
                  fechaMatricula: asignatura.fechaMatricula || data.fechaMatricula,
                  fechaActualizacion: asignatura.fechaActualizacion || data.fechaActualizacion
                });
              }
            }
          });
          
          matriculaLimpia.asignaturas = Array.from(asignaturasUnicas.values());
        }

        matriculas.push(new Matricula(matriculaLimpia));
      }

      return matriculas;
    } catch (error) {
      console.error('Error al obtener matrículas del estudiante:', error);
      throw error;
    }
  }

  // Obtener matrículas activas de un estudiante
  static async obtenerMatriculasActivasEstudiante(estudianteUid) {
    try {
      const matriculasRef = db.collection('matriculas');
      const matriculasSnapshot = await matriculasRef
        .where('estudianteUid', '==', estudianteUid)
        .where('estado', '==', EstadoMatricula.ACTIVA)
        .orderBy('fechaMatricula', 'desc')
        .get();

      const matriculas = [];
      matriculasSnapshot.forEach(doc => {
        matriculas.push(new Matricula({ id: doc.id, ...doc.data() }));
      });

      return matriculas;
    } catch (error) {
      console.error('Error al obtener matrículas activas del estudiante:', error);
      throw error;
    }
  }

  // Asignar nota a una unidad específica de una asignatura
  static async asignarNotaUnidad(matriculaId, asignaturaId, tipoUnidad, nota) {
    try {
      const matriculaRef = db.collection('matriculas').doc(matriculaId);
      const matriculaDoc = await matriculaRef.get();
      
      if (!matriculaDoc.exists) {
        throw new Error('Matrícula no encontrada');
      }

      const matricula = new Matricula({ id: matriculaId, ...matriculaDoc.data() });
      
      // Asignar la nota
      matricula.asignarNotaUnidad(asignaturaId, tipoUnidad, nota);
      
      // Actualizar en Firestore
      await matriculaRef.update(matricula.toJSON());
      
      return matricula;
    } catch (error) {
      console.error('Error al asignar nota:', error);
      throw error;
    }
  }

  // Agregar asignatura a una matrícula existente
  static async agregarAsignaturaAMatricula(matriculaId, asignaturaId) {
    try {
      const matriculaRef = db.collection('matriculas').doc(matriculaId);
      const matriculaDoc = await matriculaRef.get();
      
      if (!matriculaDoc.exists) {
        throw new Error('Matrícula no encontrada');
      }

      const matricula = new Matricula({ id: matriculaId, ...matriculaDoc.data() });
      
      // Obtener información de la asignatura
      const asignaturaRef = db.collection('asignaturas').doc(asignaturaId);
      const asignaturaDoc = await asignaturaRef.get();
      
      if (!asignaturaDoc.exists) {
        throw new Error('Asignatura no encontrada');
      }

      const asignatura = asignaturaDoc.data();
      
      // Agregar la asignatura a la matrícula
      matricula.agregarAsignatura(asignaturaId, asignatura.nombre);
      
      // Actualizar en Firestore
      await matriculaRef.update(matricula.toJSON());
      
      return matricula;
    } catch (error) {
      console.error('Error al agregar asignatura a matrícula:', error);
      throw error;
    }
  }

  // Remover asignatura de una matrícula
  static async removerAsignaturaDeMatricula(matriculaId, asignaturaId) {
    try {
      const matriculaRef = db.collection('matriculas').doc(matriculaId);
      const matriculaDoc = await matriculaRef.get();
      
      if (!matriculaDoc.exists) {
        throw new Error('Matrícula no encontrada');
      }

      const matricula = new Matricula({ id: matriculaId, ...matriculaDoc.data() });
      
      // Remover la asignatura de la matrícula
      matricula.removerAsignatura(asignaturaId);
      
      // Actualizar en Firestore
      await matriculaRef.update(matricula.toJSON());
      
      return matricula;
    } catch (error) {
      console.error('Error al remover asignatura de matrícula:', error);
      throw error;
    }
  }

  // Obtener estadísticas de matrículas
  static async obtenerEstadisticasMatriculas(periodoId = null) {
    try {
      let matriculasRef = db.collection('matriculas');
      
      if (periodoId) {
        matriculasRef = matriculasRef.where('periodoId', '==', periodoId);
      }
      
      const matriculasSnapshot = await matriculasRef.get();
      
      let totalMatriculas = 0;
      let matriculasActivas = 0;
      let matriculasCompletadas = 0;
      let totalAsignaturas = 0;
      let asignaturasAprobadas = 0;
      let asignaturasReprobadas = 0;

      matriculasSnapshot.forEach(doc => {
        const matricula = new Matricula({ id: doc.id, ...doc.data() });
        totalMatriculas++;
        
        if (matricula.estado === EstadoMatricula.ACTIVA) {
          matriculasActivas++;
        } else if (matricula.estado === EstadoMatricula.COMPLETADA) {
          matriculasCompletadas++;
        }
        
        const estadisticas = matricula.obtenerEstadisticas();
        totalAsignaturas += estadisticas.totalAsignaturas;
        asignaturasAprobadas += estadisticas.aprobadas;
        asignaturasReprobadas += estadisticas.reprobadas;
      });

      return {
        totalMatriculas,
        matriculasActivas,
        matriculasCompletadas,
        totalAsignaturas,
        asignaturasAprobadas,
        asignaturasReprobadas,
        porcentajeAprobacion: totalAsignaturas > 0 ? (asignaturasAprobadas / totalAsignaturas) * 100 : 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de matrículas:', error);
      throw error;
    }
  }

  // Verificar si existe una matrícula para un estudiante en un período
  static async verificarMatriculaExistente(estudianteUid, periodoId) {
    try {
      const matricula = await this.obtenerMatriculaEstudiante(estudianteUid, periodoId);
      return matricula !== null;
    } catch (error) {
      console.error('Error al verificar matrícula existente:', error);
      throw error;
    }
  }
}

module.exports = MatriculaService; 