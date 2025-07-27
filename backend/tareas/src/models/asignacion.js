// Tipos de asignación
const TiposAsignacion = {
  CURSO: 'curso',
  GRUPO: 'grupo',
  INDIVIDUAL: 'individual'
};

class Asignacion {
  constructor({
    id,
    tareaId,
    tipo,
    destinatarios = [],
    justificacion = null,
    fechaAsignacion = new Date().toISOString()
  }) {
    this.id = id;
    this.tareaId = tareaId;
    this.tipo = tipo;
    this.destinatarios = destinatarios; // Array de IDs según el tipo
    this.justificacion = justificacion;
    this.fechaAsignacion = fechaAsignacion;
  }
}

module.exports = { Asignacion, TiposAsignacion };