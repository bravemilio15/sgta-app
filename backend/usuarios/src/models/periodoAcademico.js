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
    estado = EstadoPeriodo.PLANIFICACION,
    esActivo = false,
    tipo = TipoPeriodo.SEMESTRE,
    descripcion = '',
    fechaCreacion = new Date().toISOString(),
    fechaActualizacion = new Date().toISOString()
  }) {
    this.id = id;
    this.nombre = nombre;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.estado = estado;
    this.esActivo = esActivo;
    this.tipo = tipo;
    this.descripcion = descripcion;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  // Método para verificar si el período puede activarse
  puedeActivarse() {
    const ahora = new Date();
    return this.estado === EstadoPeriodo.PLANIFICACION && 
           ahora >= new Date(this.fechaInicio);
  }

  // Método para verificar si el período está vigente
  estaVigente() {
    const ahora = new Date();
    return this.esActivo && 
           this.estado === EstadoPeriodo.ACTIVO &&
           ahora >= new Date(this.fechaInicio) && 
           ahora <= new Date(this.fechaFin);
  }

  // Método para activar el período
  activar() {
    if (this.puedeActivarse()) {
      this.estado = EstadoPeriodo.ACTIVO;
      this.esActivo = true;
      this.fechaActualizacion = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Método para finalizar el período
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

  // Método para verificar si el período está en período de matrículas
  estaEnPeriodoMatriculas() {
    const ahora = new Date();
    const fechaInicio = new Date(this.fechaInicio);
    
    // Período de matrículas: desde 30 días antes del inicio hasta el inicio
    const fechaInicioMatriculas = new Date(fechaInicio);
    fechaInicioMatriculas.setDate(fechaInicioMatriculas.getDate() - 30);
    
    return ahora >= fechaInicioMatriculas && ahora <= fechaInicio;
  }

  // Método para verificar si el período está en período de retiros
  estaEnPeriodoRetiros() {
    const ahora = new Date();
    const fechaInicio = new Date(this.fechaInicio);
    
    // Período de retiros: desde el inicio hasta 30 días después
    const fechaFinRetiros = new Date(fechaInicio);
    fechaFinRetiros.setDate(fechaFinRetiros.getDate() + 30);
    
    return ahora >= fechaInicio && ahora <= fechaFinRetiros;
  }

  // Método para obtener el estado del período para matrículas
  getEstadoMatriculas() {
    const ahora = new Date();
    const fechaInicio = new Date(this.fechaInicio);
    const fechaFin = new Date(this.fechaFin);
    
    if (!this.esActivo) {
      return 'INACTIVO';
    }
    
    if (this.estaEnPeriodoMatriculas()) {
      return 'MATRICULAS_ABIERTAS';
    }
    
    if (this.estaEnPeriodoRetiros()) {
      return 'RETIROS_PERMITIDOS';
    }
    
    if (ahora > fechaFin) {
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

  // Método para validar que el período sea válido
  esValido() {
    const fechaInicio = new Date(this.fechaInicio);
    const fechaFin = new Date(this.fechaFin);
    
    return this.nombre && 
           this.nombre.trim() !== '' &&
           fechaInicio < fechaFin &&
           Object.values(EstadoPeriodo).includes(this.estado) &&
           Object.values(TipoPeriodo).includes(this.tipo);
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
      fechaActualizacion: this.fechaActualizacion
    };
  }
}

module.exports = { 
  PeriodoAcademico, 
  EstadoPeriodo, 
  TipoPeriodo 
}; 