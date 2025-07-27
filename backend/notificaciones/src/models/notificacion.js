// Modelo para notificaciones
class Notificacion {
  constructor({
    id,
    titulo,
    mensaje,
    tipo = 'info', // 'info', 'warning', 'success', 'error'
    estado = 'no_leida', // 'no_leida', 'leida'
    destinatarioUid,
    remitenteUid = null,
    remitente = 'Sistema SGTA',
    accionUrl = null,
    fechaCreacion = new Date().toISOString(),
    fechaLectura = null
  }) {
    this.id = id || this.generarId();
    this.titulo = titulo;
    this.mensaje = mensaje;
    this.tipo = tipo;
    this.estado = estado;
    this.destinatarioUid = destinatarioUid;
    this.remitenteUid = remitenteUid;
    this.remitente = remitente;
    this.accionUrl = accionUrl;
    this.fechaCreacion = fechaCreacion;
    this.fechaLectura = fechaLectura;
  }

  generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  marcarComoLeida() {
    this.estado = 'leida';
    this.fechaLectura = new Date().toISOString();
  }

  marcarComoNoLeida() {
    this.estado = 'no_leida';
    this.fechaLectura = null;
  }

  toJSON() {
    return {
      id: this.id,
      titulo: this.titulo,
      mensaje: this.mensaje,
      tipo: this.tipo,
      estado: this.estado,
      destinatarioUid: this.destinatarioUid,
      remitenteUid: this.remitenteUid,
      remitente: this.remitente,
      accionUrl: this.accionUrl,
      fechaCreacion: this.fechaCreacion,
      fechaLectura: this.fechaLectura
    };
  }
}

module.exports = { Notificacion };
