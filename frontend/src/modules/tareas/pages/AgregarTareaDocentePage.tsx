import React, { useState } from 'react';
import './AgregarTareaDocentePage.css'; // Asegúrate de importar el archivo CSS

const tiposTarea = ['APE', 'AA', 'ACD'];

const AgregarTareaDocentePage = ({ onVolver, onTareaAgregada }) => {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArchivo(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Construye el objeto tarea
    const tarea = {
      titulo,
      tipo,
      descripcion,
      // Puedes agregar más campos aquí según tu backend
    };

    // Enviar la tarea al backend
    try {
      const res = await fetch('http://localhost:3003/tareas/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tarea),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Tarea agregada correctamente');
        if (onTareaAgregada) onTareaAgregada(data.tarea);
        setTitulo('');
        setTipo('');
        setDescripcion('');
        setArchivo(null);
      } else {
        alert('Error al agregar tarea: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
    setLoading(false);
  };

  return (
    <div className="agregar-tarea-container">
      <h2>Agregar Tarea</h2>
      <form className="agregar-tarea-form" onSubmit={handleSubmit}>
        <label>Título</label>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} required />

        <label>Tipo de tarea</label>
        <select value={tipo} onChange={e => setTipo(e.target.value)} required>
          <option value="">Seleccione tipo</option>
          {tiposTarea.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label>Descripción</label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} required />

        <label>Archivo</label>
        <input type="file" onChange={handleArchivoChange} />

        <div className="agregar-tarea-actions">
          <button type="button" onClick={onVolver} className="volver-btn">Volver</button>
          <button type="submit" className="cancelar-btn" disabled={loading}>Cancelar</button>
          <button type="submit" className="agregar-btn" disabled={loading}>Agregar</button>
        </div>
      </form>
      <footer className="inicio-docente-footer">
        <span>Teléfono: XXXXXXXXXX</span>
        <span>Correo electrónico: Ayuda@unl.edu.ec</span>
      </footer>
    </div>
  );
};

export default AgregarTareaDocentePage;