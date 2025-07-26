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
    correoPersonal, // Correo personal del usuario
    correoInstitucional, // Correo institucional @uni.edu.ec
    identificacion,
    tipoIdentificacion,
    fechaPerf,
    estadoRegistro = EstadoRegistro.PENDIENTE,
    tipo = 'estudiante', // Por defecto
    passwordHash = null, // Hash de la contraseña
    passwordTemporal = null // Contraseña temporal para envío por correo
  }) {
    this.nombreCompleto = nombreCompleto;
    this.correoPersonal = correoPersonal;
    this.correoInstitucional = correoInstitucional;
    this.identificacion = identificacion;
    this.tipoIdentificacion = tipoIdentificacion;
    this.fechaPerf = fechaPerf;
    this.estadoRegistro = estadoRegistro;
    this.tipo = tipo;
    this.passwordHash = passwordHash;
    this.passwordTemporal = passwordTemporal;
  }
}

// Clase Estudiante que hereda de Usuario
class Estudiante extends Usuario {
  constructor({
    nombreCompleto,
    correoPersonal,
    correoInstitucional,
    identificacion,
    tipoIdentificacion,
    fechaPerf,
    estadoRegistro = EstadoRegistro.PENDIENTE,
    passwordHash = null,
    passwordTemporal = null,
    carrera = 'Computación', // Quemada en Computación
    asignatura = '',
    fechaRegistro = new Date().toISOString()
  }) {
    super({
      nombreCompleto,
      correoPersonal,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      fechaPerf,
      estadoRegistro,
      tipo: 'estudiante', // Tipo fijo para estudiantes
      passwordHash,
      passwordTemporal
    });
    
    // Atributos específicos del estudiante
    this.carrera = carrera;
    this.asignatura = asignatura;
    this.fechaRegistro = fechaRegistro;
  }
}

// Clase Docente que hereda de Usuario
class Docente extends Usuario {
  constructor({
    nombreCompleto,
    correoPersonal,
    correoInstitucional,
    identificacion,
    tipoIdentificacion,
    fechaPerf,
    estadoRegistro = EstadoRegistro.APROBADO, // Los docentes vienen aprobados por defecto
    passwordHash = null,
    passwordTemporal = null,
    materias = [], // Array de materias que imparte
    titulos = [], // Array de títulos académicos
    departamento = ''
  }) {
    super({
      nombreCompleto,
      correoPersonal,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      fechaPerf,
      estadoRegistro,
      tipo: 'docente', // Tipo fijo para docentes
      passwordHash,
      passwordTemporal
    });
    
    // Atributos específicos del docente
    this.materias = Array.isArray(materias) ? materias : [materias].filter(Boolean);
    this.titulos = Array.isArray(titulos) ? titulos : [titulos].filter(Boolean);
    this.departamento = departamento;
  }
}

// Clase Administrador que hereda de Usuario
class Administrador extends Usuario {
  constructor({
    nombreCompleto,
    correoPersonal,
    correoInstitucional,
    identificacion,
    tipoIdentificacion,
    fechaPerf,
    estadoRegistro = EstadoRegistro.APROBADO, // Los administradores vienen aprobados por defecto
    passwordHash = null,
    passwordTemporal = null,
    nivelAcceso = 'admin' // Nivel de acceso administrativo
  }) {
    super({
      nombreCompleto,
      correoPersonal,
      correoInstitucional,
      identificacion,
      tipoIdentificacion,
      fechaPerf,
      estadoRegistro,
      tipo: 'administrador', // Tipo fijo para administradores
      passwordHash,
      passwordTemporal
    });
    
    // Atributos específicos del administrador
    this.nivelAcceso = nivelAcceso;
  }
}

module.exports = { 
  Usuario, 
  Estudiante, 
  Docente, 
  Administrador, 
  EstadoRegistro 
};
