const admin = require('firebase-admin');
const { PeriodoAcademico } = require('../models/periodoAcademico');
const db = admin.firestore();

class PeriodoAcademicoService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  // Iniciar el servicio de actualización automática
  iniciarActualizacionAutomatica(intervaloMinutos = 60) {
    if (this.isRunning) {
      console.log('El servicio de actualización automática ya está ejecutándose');
      return;
    }

    console.log(`Iniciando servicio de actualización automática de períodos académicos (intervalo: ${intervaloMinutos} minutos)`);
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      try {
        await this.actualizarEstadosPeriodos();
      } catch (error) {
        console.error('Error en la actualización automática de períodos:', error);
      }
    }, intervaloMinutos * 60 * 1000);

    // Ejecutar la primera actualización inmediatamente
    this.actualizarEstadosPeriodos();
  }

  // Detener el servicio de actualización automática
  detenerActualizacionAutomatica() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('Servicio de actualización automática detenido');
    }
  }

  // Actualizar estados de todos los períodos académicos
  async actualizarEstadosPeriodos() {
    try {
      console.log('Actualizando estados de períodos académicos...');
      
      const snapshot = await db.collection('periodos_academicos').get();
      const batch = db.batch();
      let periodosActualizados = 0;
      let periodosFinalizados = 0;
      let periodosActivados = 0;
      
      snapshot.forEach(doc => {
        const periodo = new PeriodoAcademico({ id: doc.id, ...doc.data() });
        const estadoAnterior = periodo.estado;
        const esActivoAnterior = periodo.esActivo;
        
        const huboCambios = periodo.actualizarEstado();
        
        if (huboCambios) {
          batch.update(doc.ref, {
            estado: periodo.estado,
            esActivo: periodo.esActivo,
            fechaActualizacion: periodo.fechaActualizacion
          });
          periodosActualizados++;
          
          // Contar tipos de cambios
          if (estadoAnterior !== periodo.estado) {
            if (periodo.estado === 'FINALIZADO') {
              periodosFinalizados++;
            } else if (periodo.estado === 'ACTIVO') {
              periodosActivados++;
            }
          }
        }
      });
      
      if (periodosActualizados > 0) {
        await batch.commit();
        console.log(`✅ Actualización completada: ${periodosActualizados} períodos actualizados`);
        console.log(`   - ${periodosActivados} períodos activados`);
        console.log(`   - ${periodosFinalizados} períodos finalizados`);
      } else {
        console.log('✅ No se requirieron actualizaciones');
      }
      
      return {
        periodosActualizados,
        periodosActivados,
        periodosFinalizados
      };
    } catch (error) {
      console.error('❌ Error al actualizar estados de períodos:', error);
      throw error;
    }
  }

  // Obtener períodos que necesitan actualización
  async obtenerPeriodosParaActualizar() {
    try {
      const snapshot = await db.collection('periodos_academicos').get();
      const periodosParaActualizar = [];
      
      snapshot.forEach(doc => {
        const periodo = new PeriodoAcademico({ id: doc.id, ...doc.data() });
        const estadoCalculado = periodo.calcularEstado();
        const esActivoCalculado = periodo.calcularEsActivo();
        
        if (periodo.estado !== estadoCalculado || periodo.esActivo !== esActivoCalculado) {
          periodosParaActualizar.push({
            id: periodo.id,
            nombre: periodo.nombre,
            estadoActual: periodo.estado,
            estadoCalculado: estadoCalculado,
            esActivoActual: periodo.esActivo,
            esActivoCalculado: esActivoCalculado,
            fechaInicio: periodo.fechaInicio,
            fechaFin: periodo.fechaFin
          });
        }
      });
      
      return periodosParaActualizar;
    } catch (error) {
      console.error('Error al obtener períodos para actualizar:', error);
      throw error;
    }
  }

  // Verificar si hay períodos solapados
  async verificarSolapamientos() {
    try {
      const snapshot = await db.collection('periodos_academicos').get();
      const periodos = [];
      const solapamientos = [];
      
      snapshot.forEach(doc => {
        const periodo = new PeriodoAcademico({ id: doc.id, ...doc.data() });
        periodos.push(periodo);
      });
      
      for (let i = 0; i < periodos.length; i++) {
        for (let j = i + 1; j < periodos.length; j++) {
          if (periodos[i].seSolapaCon(periodos[j])) {
            solapamientos.push({
              periodo1: {
                id: periodos[i].id,
                nombre: periodos[i].nombre,
                fechaInicio: periodos[i].fechaInicio,
                fechaFin: periodos[i].fechaFin
              },
              periodo2: {
                id: periodos[j].id,
                nombre: periodos[j].nombre,
                fechaInicio: periodos[j].fechaInicio,
                fechaFin: periodos[j].fechaFin
              }
            });
          }
        }
      }
      
      return solapamientos;
    } catch (error) {
      console.error('Error al verificar solapamientos:', error);
      throw error;
    }
  }

  // Obtener estadísticas de períodos académicos
  async obtenerEstadisticas() {
    try {
      const snapshot = await db.collection('periodos_academicos').get();
      const estadisticas = {
        total: 0,
        porEstado: {
          PLANIFICACION: 0,
          ACTIVO: 0,
          FINALIZADO: 0,
          CANCELADO: 0
        },
        porTipo: {
          SEMESTRE: 0,
          TRIMESTRE: 0,
          CUATRIMESTRE: 0,
          INTENSIVO: 0
        },
        activos: 0,
        proximosAVencer: 0,
        vencidos: 0
      };
      
      const ahora = new Date();
      const proximos30Dias = new Date();
      proximos30Dias.setDate(proximos30Dias.getDate() + 30);
      
      snapshot.forEach(doc => {
        const periodo = new PeriodoAcademico({ id: doc.id, ...doc.data() });
        estadisticas.total++;
        estadisticas.porEstado[periodo.estado]++;
        estadisticas.porTipo[periodo.tipo]++;
        
        if (periodo.esActivo) {
          estadisticas.activos++;
        }
        
        const fechaFin = new Date(periodo.fechaFin);
        if (fechaFin > ahora && fechaFin <= proximos30Dias) {
          estadisticas.proximosAVencer++;
        }
        
        if (fechaFin < ahora) {
          estadisticas.vencidos++;
        }
      });
      
      return estadisticas;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  // Obtener el estado del servicio
  obtenerEstadoServicio() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId ? 'activo' : null,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new PeriodoAcademicoService(); 