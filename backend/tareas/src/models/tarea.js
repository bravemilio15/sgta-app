// Enumeración para el tipo de tarea
const TiposTarea = {
  APE: 'APE',
  AA: 'AA',
  ACD: 'ACD'
};

// Clase Tarea según el modelo UML
class Tarea {
  constructor({
    id,
    titulo,
    descripcion,
    fechaInicio,
    fechaEntrega,
    tipo,
    permiteEntregaTardia,
    diasPermitidosEntregaTardia,
    porcentajePenalizacionEntregaTardia,
    esGrupal
  }) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.fechaInicio = fechaInicio;
    this.fechaEntrega = fechaEntrega;
    this.tipo = tipo; // Debe ser uno de TiposTarea
    this.permiteEntregaTardia = permiteEntregaTardia;
    this.diasPermitidosEntregaTardia = diasPermitidosEntregaTardia;
    this.porcentajePenalizacionEntregaTardia = porcentajePenalizacionEntregaTardia;
    this.esGrupal = esGrupal;
  }

  configurarEntregaTardia(permitir) {
    this.permiteEntregaTardia = permitir;
  }
}

module.exports = { Tarea, TiposTarea };