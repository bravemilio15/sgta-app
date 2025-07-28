// Enumeraciones para el estado del período académico
const EstadoPeriodo = {
  PLANIFICACION: 'PLANIFICACION',
  ACTIVO: 'ACTIVO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO'
};

// Enumeraciones para el tipo de período
const TipoPeriodo = {
  SEMESTRE: 'SEMESTRE',
  TRIMESTRE: 'TRIMESTRE',
  CUATRIMESTRE: 'CUATRIMESTRE',
  INTENSIVO: 'INTENSIVO'
};

// Modelo PeriodoAcademico
class PeriodoAcademico {
  constructor({
    id = null,
    nombre,
    fechaInicio,
    fechaFin,
    estado = null, // Se calculará automáticamente
    esActivo = null, // Se calculará automáticamente
    tipo = TipoPeriodo.SEMESTRE,
    descripcion = '',
    fechaCreacion = new Date().toISOString(),
    fechaActualizacion = new Date().toISOString()
  }) {
    this.id = id;
    this.nombre = nombre;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.tipo = tipo;
    this.descripcion = descripcion;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
    
    // Calcular estado y esActivo automáticamente basado en las fechas
    this.estado = estado || this.calcularEstado();
    this.esActivo = esActivo !== null ? esActivo : this.calcularEsActivo();
  }

  // Método para calcular el estado basado en las fechas
  calcularEstado() {
    const ahora = new Date();
    const fechaInicio = new Date(this.fechaInicio);
    const fechaFin = new Date(this.fechaFin);
    
    if (ahora < fechaInicio) {
      return EstadoPeriodo.PLANIFICACION;
    } else if (ahora >= fechaInicio && ahora <= fechaFin) {
      return EstadoPeriodo.ACTIVO;
    } else {
      return EstadoPeriodo.FINALIZADO;
    }
  }

  // Método para calcular si está activo basado en las fechas
  calcularEsActivo() {
    const ahora = new Date();
    const fechaInicio = new Date(this.fechaInicio);
    const fechaFin = new Date(this.fechaFin);
    
    return ahora >= fechaInicio && ahora <= fechaFin;
  }

  // Método para actualizar el estado automáticamente
  actualizarEstado() {
    const estadoAnterior = this.estado;
    const esActivoAnterior = this.esActivo;
    
    this.estado = this.calcularEstado();
    this.esActivo = this.calcularEsActivo();
    
    // Si el estado cambió, actualizar la fecha de actualización
    if (estadoAnterior !== this.estado || esActivoAnterior !== this.esActivo) {
      this.fechaActualizacion = new Date().toISOString();
      return true; // Indica que hubo cambios
    }
    
    return false; // No hubo cambios
  }

  // Método para verificar si el período puede activarse
  puedeActivarse() {
    const ahora = new Date();
    const fechaInicio = new Date(this.fechaInicio);
    return this.estado === EstadoPeriodo.PLANIFICACION && 
           ahora >= fechaInicio;
  }

  // Método para verificar si el período está vigente
  estaVigente() {
    return this.esActivo && this.estado === EstadoPeriodo.ACTIVO;
  }

  // Método para activar el período manualmente
  activar() {
    if (this.puedeActivarse()) {
      this.estado = EstadoPeriodo.ACTIVO;
      this.esActivo = true;
      this.fechaActualizacion = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Método para finalizar el período manualmente
  finalizar() {
    if (this.estado === EstadoPeriodo.ACTIVO) {
      this.estado = EstadoPeriodo.FINALIZADO;
      this.esActivo = false;
      this.fechaActualizacion = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Método para cancelar el período
  cancelar() {
    if (this.estado === EstadoPeriodo.PLANIFICACION || this.estado === EstadoPeriodo.ACTIVO) {
      this.estado = EstadoPeriodo.CANCELADO;
      this.esActivo = false;
      this.fechaActualizacion = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Método simplificado para verificar si está en período de matrículas
  // Solo verifica que el período esté activo
  estaEnPeriodoMatriculas() {
    return this.esActivo && this.estado === EstadoPeriodo.ACTIVO;
  }

  // Método simplificado para verificar si está en período de retiros
  // Solo verifica que el período esté activo
  estaEnPeriodoRetiros() {
    return this.esActivo && this.estado === EstadoPeriodo.ACTIVO;
  }

  // Método simplificado para obtener el estado del período para matrículas
  getEstadoMatriculas() {
    if (!this.esActivo) {
      return 'INACTIVO';
    }
    
    if (this.estado === EstadoPeriodo.ACTIVO) {
      return 'MATRICULAS_ABIERTAS';
    }
    
    if (this.estado === EstadoPeriodo.FINALIZADO) {
      return 'FINALIZADO';
    }
    
    return 'EN_CURSO';
  }

  // Método para obtener la duración del período en días
  getDuracionDias() {
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    const diferencia = fin.getTime() - inicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  // Método para obtener los días restantes del período
  getDiasRestantes() {
    const ahora = new Date();
    const fechaFin = new Date(this.fechaFin);
    const diferencia = fechaFin.getTime() - ahora.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  // Método para obtener los días transcurridos del período
  getDiasTranscurridos() {
    const ahora = new Date();
    const fechaInicio = new Date(this.fechaInicio);
    const diferencia = ahora.getTime() - fechaInicio.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  // Método para obtener el progreso del período (0-100)
  getProgreso() {
    if (this.estado === EstadoPeriodo.PLANIFICACION) {
      return 0;
    }
    
    if (this.estado === EstadoPeriodo.FINALIZADO) {
      return 100;
    }
    
    const diasTranscurridos = this.getDiasTranscurridos();
    const duracionTotal = this.getDuracionDias();
    
    if (duracionTotal === 0) return 0;
    
    const progreso = (diasTranscurridos / duracionTotal) * 100;
    return Math.min(Math.max(progreso, 0), 100);
  }

  // Método para validar que el período sea válido
  esValido() {
    const fechaInicio = new Date(this.fechaInicio);
    const fechaFin = new Date(this.fechaFin);
    
    return this.nombre && 
           this.nombre.trim() !== '' &&
           fechaInicio < fechaFin &&
           Object.values(TipoPeriodo).includes(this.tipo);
  }

  // Método para verificar si el período se solapa con otro
  seSolapaCon(otroPeriodo) {
    const inicio1 = new Date(this.fechaInicio);
    const fin1 = new Date(this.fechaFin);
    const inicio2 = new Date(otroPeriodo.fechaInicio);
    const fin2 = new Date(otroPeriodo.fechaFin);
    
    return (inicio1 < fin2 && fin1 > inicio2);
  }

  // Método para convertir a JSON
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      estado: this.estado,
      esActivo: this.esActivo,
      tipo: this.tipo,
      descripcion: this.descripcion,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
      duracionDias: this.getDuracionDias(),
      diasRestantes: this.getDiasRestantes(),
      diasTranscurridos: this.getDiasTranscurridos(),
      progreso: this.getProgreso()
    };
  }
}

module.exports = { 
  PeriodoAcademico, 
  EstadoPeriodo, 
  TipoPeriodo 
}; 