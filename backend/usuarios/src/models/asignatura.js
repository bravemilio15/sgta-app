class Asignatura {
  constructor({
    id,
    codigo,
    nombre,
    carrera = 'Computación', // Quemada como solicitaste
    docenteUid = null,
    estudiantesUid = []
  }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.carrera = carrera; // Siempre será 'Computación'
    this.docenteUid = docenteUid;
    this.estudiantesUid = Array.isArray(estudiantesUid) ? estudiantesUid : [];
  }

  // Método para agregar un estudiante a la asignatura
  agregarEstudiante(estudianteUid) {
    if (!this.estudiantesUid.includes(estudianteUid)) {
      this.estudiantesUid.push(estudianteUid);
    }
  }

  // Método para remover un estudiante de la asignatura
  removerEstudiante(estudianteUid) {
    this.estudiantesUid = this.estudiantesUid.filter(uid => uid !== estudianteUid);
  }

  // Método para verificar si un estudiante está matriculado
  tieneEstudiante(estudianteUid) {
    return this.estudiantesUid.includes(estudianteUid);
  }

  // Método para obtener el número de estudiantes
  getNumeroEstudiantes() {
    return this.estudiantesUid.length;
  }

  // Método para validar que la asignatura tenga datos requeridos
  esValida() {
    return this.codigo && this.nombre;
  }

  // Método para convertir a objeto plano
  toJSON() {
    const data = {
      codigo: this.codigo,
      nombre: this.nombre,
      carrera: this.carrera,
      docenteUid: this.docenteUid,
      estudiantesUid: this.estudiantesUid
    };
    
    // Solo incluir id si existe
    if (this.id) {
      data.id = this.id;
    }
    
    return data;
  }
}

module.exports = { Asignatura }; 