import React from 'react';

const tareasEjemplo = [
  {
    id: 1,
    titulo: 'APE-GLC-Automatas',
    materia: 'Procesos de software',
    fechaEntrega: 'Lunes 30 de Junio del 2025',
    revisada: true,
  },
  // ...más tareas
];

const materiasEjemplo = ['Procesos de software', 'Matemática', 'Algoritmos'];

const InicioDocentePage = () => {
  return (
    <div className="inicio-docente-container">
      <header className="inicio-docente-header">
        <h1>Hola, Santiago Apolo</h1>
        <p>Lunes 30 de Junio del 2025</p>
        <p>Tienes 2 tareas pendientes por revisar</p>
      </header>

      <section className="inicio-docente-tareas">
        <div className="inicio-docente-tareas-header">
          <h2>Tareas</h2>
          <div>
            <select className="materia-filter">
              <option value="">Filtrar por materia</option>
              {materiasEjemplo.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button className="nueva-tarea-btn">Nueva tarea</button>
          </div>
        </div>
        <table className="tareas-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Materia</th>
              <th>Fecha de entrega</th>
              <th>Revisada</th>
              <th>Revisar</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tareasEjemplo.map(t => (
              <tr key={t.id}>
                <td>{t.titulo}</td>
                <td>{t.materia}</td>
                <td>{t.fechaEntrega}</td>
                <td>
                  <span className={t.revisada ? 'revisada-si' : 'revisada-no'}>
                    {t.revisada ? 'Si' : 'No'}
                  </span>
                </td>
                <td>
                  <button className="revisar-btn">Revisar</button>
                </td>
                <td>
                  <button className="editar-btn">✏️</button>
                  <button className="eliminar-btn">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <footer className="inicio-docente-footer">
        <span>Teléfono: XXXXXXXXXX</span>
        <span>Correo electrónico: Ayuda@unl.edu.ec</span>
      </footer>
    </div>
  );
};

export default InicioDocentePage;