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

  // Método para convertir el objeto a JSON para Firestore
  toJSON() {
    return {
      nombreCompleto: this.nombreCompleto,
      correoPersonal: this.correoPersonal,
      correoInstitucional: this.correoInstitucional,
      identificacion: this.identificacion,
      tipoIdentificacion: this.tipoIdentificacion,
      fechaPerf: this.fechaPerf,
      estadoRegistro: this.estadoRegistro,
      tipo: this.tipo,
      passwordHash: this.passwordHash,
      passwordTemporal: this.passwordTemporal
    };
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
    fechaRegistro = new Date().toISOString(),
    estadoAcademico = 'REGULAR' // REGULAR, IRREGULAR, GRADUADO, RETIRADO
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
    this.fechaRegistro = fechaRegistro;
    this.estadoAcademico = estadoAcademico;
  }

  // Método para verificar si puede matricularse
  puedeMatricularse() {
    return this.estadoRegistro === EstadoRegistro.APROBADO && 
           this.estadoAcademico === 'REGULAR';
  }

  // Método para convertir el objeto a JSON para Firestore
  toJSON() {
    return {
      ...super.toJSON(),
      carrera: this.carrera,
      fechaRegistro: this.fechaRegistro,
      estadoAcademico: this.estadoAcademico
    };
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
    estadoRegistro = EstadoRegistro.PENDIENTE, // Los docentes requieren aprobación por defecto
    passwordHash = null,
    passwordTemporal = null,
    asignaturasUid = [], // Array de IDs de asignaturas que imparte
    titulos = [], // Array de títulos académicos
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
    this.asignaturasUid = Array.isArray(asignaturasUid) ? asignaturasUid : [];
    this.titulos = Array.isArray(titulos) ? titulos : [titulos].filter(Boolean);
  }

  // Método para agregar una asignatura al docente
  agregarAsignatura(asignaturaUid) {
    if (!this.asignaturasUid.includes(asignaturaUid)) {
      this.asignaturasUid.push(asignaturaUid);
    }
  }

  // Método para remover una asignatura del docente
  removerAsignatura(asignaturaUid) {
    this.asignaturasUid = this.asignaturasUid.filter(uid => uid !== asignaturaUid);
  }

  // Método para verificar si el docente tiene una asignatura específica
  tieneAsignatura(asignaturaUid) {
    return this.asignaturasUid.includes(asignaturaUid);
  }

  // Método para obtener el número de asignaturas que imparte
  getNumeroAsignaturas() {
    return this.asignaturasUid.length;
  }

  // Método para obtener todas las asignaturas del docente
  obtenerAsignaturas() {
    return this.asignaturasUid;
  }

  // Método para limpiar todas las asignaturas del docente
  limpiarAsignaturas() {
    this.asignaturasUid = [];
  }

  // Método para convertir el objeto a JSON para Firestore
  toJSON() {
    return {
      ...super.toJSON(),
      asignaturasUid: this.asignaturasUid,
      titulos: this.titulos,
    };
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
    estadoRegistro = EstadoRegistro.APROBADO,
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

  // Método para convertir el objeto a JSON para Firestore
  toJSON() {
    return {
      ...super.toJSON(),
      nivelAcceso: this.nivelAcceso
    };
  }
}

module.exports = { 
  Usuario, 
  Estudiante, 
  Docente, 
  Administrador, 
  EstadoRegistro 
};
