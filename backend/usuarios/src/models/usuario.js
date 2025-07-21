// Enumeración para el estado de registro
const EstadoRegistro = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado'
};

// Clase base Usuario
class Usuario {
  constructor({
    nombreCompleto,
    correoInstitucional,
    identificacion,
    tipoIdentificacion,
    fechaPerf,
    estadoRegistro = EstadoRegistro.PENDIENTE,
    tipo = 'estudiante' // Por defecto
  }) {
    this.nombreCompleto = nombreCompleto;
    this.correoInstitucional = correoInstitucional;
    this.identificacion = identificacion;
    this.tipoIdentificacion = tipoIdentificacion;
    this.fechaPerf = fechaPerf;
    this.estadoRegistro = estadoRegistro;
    this.tipo = tipo;
  }
}

// Clase Administrador
class Administrador extends Usuario {
  constructor(props) {
    super({ ...props, tipo: 'administrador' });
    // Puedes agregar campos específicos de administrador aquí
  }
}

// Clase Docente
class Docente extends Usuario {
  constructor(props) {
    super({ ...props, tipo: 'docente' });
    // Puedes agregar campos específicos de docente aquí
  }
}

module.exports = { Usuario, Administrador, Docente, EstadoRegistro };
