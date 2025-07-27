
// Enumeración para el tipo de tarea
const TiposTarea = {
  ACD: 'Actividad de contacto con docente',
  APE: 'Aprendizaje práctico experimental',
  AA: 'Aprendizaje autónomo'
};

// Clase Tarea según los requerimientos
class Tarea {
  constructor({
    id,
    titulo,
    descripcion,
    fechaInicio,
    fechaEntrega,
    tipo,
    asignatura,
    docenteId,
    permiteEntregaTardia = false,
    diasPermitidosEntregaTardia = 0,
    porcentajePenalizacion = 50,
    archivosPermitidos = ['pdf', 'xlsx', 'docx'],
    tamanioMaximoMB = 10,
    estado = 'activa',
    fechaCreacion = new Date().toISOString()
  }) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.fechaInicio = fechaInicio;
    this.fechaEntrega = fechaEntrega;
    this.tipo = tipo;
    this.asignatura = asignatura;
    this.docenteId = docenteId;
    this.permiteEntregaTardia = permiteEntregaTardia;
    this.diasPermitidosEntregaTardia = diasPermitidosEntregaTardia;
    this.porcentajePenalizacion = porcentajePenalizacion;
    this.archivosPermitidos = archivosPermitidos;
    this.tamanioMaximoMB = tamanioMaximoMB;
    this.estado = estado;
    this.fechaCreacion = fechaCreacion;
  }
}

module.exports = { Tarea, TiposTarea };