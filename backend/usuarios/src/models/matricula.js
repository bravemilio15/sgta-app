// Enumeraciones para el estado de la matrícula
const EstadoMatricula = {
  ACTIVA: 'ACTIVA', 
  COMPLETADA: 'COMPLETADA', 
  SUSPENDIDA: 'SUSPENDIDA'
};

const EstadoAsignaturaMatricula = {
  MATRICULADA: 'MATRICULADA',
  EN_CURSO: 'EN_CURSO',
  APROBADA: 'APROBADA',
  REPROBADA: 'REPROBADA',
  RETIRADA: 'RETIRADA'
};

class Matricula {
  constructor({
    id = null,
    estudianteUid,
    periodoId,
    fechaMatricula = new Date().toISOString(),
    estado = EstadoMatricula.ACTIVA,
    asignaturas = [], // Array de objetos con asignatura y su estado
    fechaCreacion = new Date().toISOString(),
    fechaActualizacion = new Date().toISOString()
  }) {
    this.id = id;
    this.estudianteUid = estudianteUid;
    this.periodoId = periodoId;
    this.fechaMatricula = fechaMatricula;
    this.estado = estado;
    this.asignaturas = Array.isArray(asignaturas) ? asignaturas : [];
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  // Agregar una asignatura a la matrícula
  agregarAsignatura(asignaturaId, nombreAsignatura) {
    const asignaturaExistente = this.asignaturas.find(a => a.asignaturaId === asignaturaId);
    if (!asignaturaExistente) {
      this.asignaturas.push({
        asignaturaId,
        nombreAsignatura,
        estado: EstadoAsignaturaMatricula.MATRICULADA,
        unidadAA: 0,
        unidadAPE: 0,
        unidadACD: 0,
        notaTotal: 0,
        fechaMatricula: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
      });
      this.fechaActualizacion = new Date().toISOString();
    }
  }

  // Remover una asignatura de la matrícula
  removerAsignatura(asignaturaId) {
    this.asignaturas = this.asignaturas.filter(a => a.asignaturaId !== asignaturaId);
    this.fechaActualizacion = new Date().toISOString();
  }

  // Obtener una asignatura específica
  obtenerAsignatura(asignaturaId) {
    return this.asignaturas.find(a => a.asignaturaId === asignaturaId);
  }

  // Asignar nota a una unidad específica de una asignatura
  asignarNotaUnidad(asignaturaId, tipoUnidad, nota) {
    const asignatura = this.obtenerAsignatura(asignaturaId);
    if (!asignatura) {
      throw new Error('Asignatura no encontrada en la matrícula');
    }

    if (nota < 0 || nota > 10) {
      throw new Error('La nota debe estar entre 0 y 10');
    }

    switch (tipoUnidad) {
      case 'AA':
        asignatura.unidadAA = nota;
        break;
      case 'APE':
        asignatura.unidadAPE = nota;
        break;
      case 'ACD':
        asignatura.unidadACD = nota;
        break;
      default:
        throw new Error('Tipo de unidad inválido');
    }

    // Calcular nota total
    asignatura.notaTotal = asignatura.unidadAA + asignatura.unidadAPE + asignatura.unidadACD;
    
    // Actualizar estado de la asignatura
    if (asignatura.notaTotal >= 21) {
      asignatura.estado = EstadoAsignaturaMatricula.APROBADA;
    } else if (asignatura.notaTotal > 0) {
      asignatura.estado = EstadoAsignaturaMatricula.REPROBADA;
    }

    asignatura.fechaActualizacion = new Date().toISOString();
    this.fechaActualizacion = new Date().toISOString();
  }

  // Marcar asignatura como en curso
  marcarEnCurso(asignaturaId) {
    const asignatura = this.obtenerAsignatura(asignaturaId);
    if (asignatura) {
      asignatura.estado = EstadoAsignaturaMatricula.EN_CURSO;
      asignatura.fechaActualizacion = new Date().toISOString();
      this.fechaActualizacion = new Date().toISOString();
    }
  }

  // Retirar una asignatura
  retirarAsignatura(asignaturaId) {
    const asignatura = this.obtenerAsignatura(asignaturaId);
    if (asignatura) {
      asignatura.estado = EstadoAsignaturaMatricula.RETIRADA;
      asignatura.fechaActualizacion = new Date().toISOString();
      this.fechaActualizacion = new Date().toISOString();
    }
  }

  // Obtener asignaturas aprobadas
  obtenerAsignaturasAprobadas() {
    return this.asignaturas.filter(a => a.estado === EstadoAsignaturaMatricula.APROBADA);
  }

  // Obtener asignaturas reprobadas
  obtenerAsignaturasReprobadas() {
    return this.asignaturas.filter(a => a.estado === EstadoAsignaturaMatricula.REPROBADA);
  }

  // Obtener asignaturas en curso
  obtenerAsignaturasEnCurso() {
    return this.asignaturas.filter(a => a.estado === EstadoAsignaturaMatricula.EN_CURSO);
  }

  // Verificar si la matrícula está activa
  estaActiva() {
    return this.estado === EstadoMatricula.ACTIVA;
  }

  // Completar la matrícula (cuando termina el período)
  completar() {
    this.estado = EstadoMatricula.COMPLETADA;
    this.fechaActualizacion = new Date().toISOString();
  }

  // Suspender la matrícula
  suspender() {
    this.estado = EstadoMatricula.SUSPENDIDA;
    this.fechaActualizacion = new Date().toISOString();
  }

  // Reactivar la matrícula
  reactivar() {
    this.estado = EstadoMatricula.ACTIVA;
    this.fechaActualizacion = new Date().toISOString();
  }

  // Obtener estadísticas de la matrícula
  obtenerEstadisticas() {
    const totalAsignaturas = this.asignaturas.length;
    const aprobadas = this.obtenerAsignaturasAprobadas().length;
    const reprobadas = this.obtenerAsignaturasReprobadas().length;
    const enCurso = this.obtenerAsignaturasEnCurso().length;
    const retiradas = this.asignaturas.filter(a => a.estado === EstadoAsignaturaMatricula.RETIRADA).length;

    return {
      totalAsignaturas,
      aprobadas,
      reprobadas,
      enCurso,
      retiradas,
      porcentajeAprobacion: totalAsignaturas > 0 ? (aprobadas / totalAsignaturas) * 100 : 0
    };
  }

  // Validar que la matrícula tenga datos requeridos
  esValida() {
    return this.estudianteUid && this.periodoId && this.asignaturas.length > 0;
  }

  // Convertir a objeto plano
  toJSON() {
    return {
      estudianteUid: this.estudianteUid,
      periodoId: this.periodoId,
      fechaMatricula: this.fechaMatricula,
      estado: this.estado,
      asignaturas: this.asignaturas,
      fechaCreacion: this.fechaCreacion,
      fechaActualizacion: this.fechaActualizacion,
      ...(this.id && { id: this.id })
    };
  }
}

module.exports = { Matricula, EstadoMatricula, EstadoAsignaturaMatricula }; 