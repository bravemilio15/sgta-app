// Enumeración para el estado de registro
const EstadoRegistro = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado'
};

// Modelo de Usuario (estructura de datos)
class Usuario {
  constructor({
    nombreCompleto,
    correoInstitucional,
    identificacion,
    tipoIdentificacion,
    asignatura,
    fechaPerf,
    estadoRegistro = EstadoRegistro.PENDIENTE
  }) {
    this.nombreCompleto = nombreCompleto;
    this.correoInstitucional = correoInstitucional;
    this.identificacion = identificacion;
    this.tipoIdentificacion = tipoIdentificacion;
    this.asignatura = asignatura;
    this.fechaPerf = fechaPerf;
    this.estadoRegistro = estadoRegistro;
  }
}

module.exports = { Usuario, EstadoRegistro };
