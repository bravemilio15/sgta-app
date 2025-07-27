// Estados de entrega
const EstadosEntrega = {
  BORRADOR: 'borrador',
  ENTREGADA: 'entregada',
  CALIFICADA: 'calificada'
};

class Entrega {
  constructor({
    id,
    tareaId,
    estudianteId,
    archivos = [],
    fechaEntrega,
    estado = EstadosEntrega.BORRADOR,
    calificacion = null,
    retroalimentacion = null,
    esEntregaTardia = false,
    penalizacionAplicada = false,
    historial = []
  }) {
    this.id = id;
    this.tareaId = tareaId;
    this.estudianteId = estudianteId;
    this.archivos = archivos;
    this.fechaEntrega = fechaEntrega;
    this.estado = estado;
    this.calificacion = calificacion;
    this.retroalimentacion = retroalimentacion;
    this.esEntregaTardia = esEntregaTardia;
    this.penalizacionAplicada = penalizacionAplicada;
    this.historial = historial;
  }

  agregarAlHistorial(accion, detalles) {
    this.historial.push({
      timestamp: new Date().toISOString(),
      accion,
      detalles
    });
  }
}

module.exports = { Entrega, EstadosEntrega };