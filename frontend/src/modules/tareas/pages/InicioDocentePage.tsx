// frontend/src/modules/tareas/pages/InicioDocentePage.tsx

import React, { useState, useEffect } from 'react';
import './InicioDocentePage.css'; // Crearemos este archivo para los estilos

// Datos de ejemplo para no depender del backend al inicio.
// Esto simula la información que vendrá de Firebase.
const mockTareas = [
    { id: '1', titulo: 'APE-GLC-Automatas', materia: 'Procesos de software', fechaEntrega: 'Lunes 30 de Junio del 2025', revisada: true },
    { id: '2', titulo: 'AA1', materia: 'Procesos de software', fechaEntrega: 'Martes 20 de Julio 2025', revisada: false },
    { id: '3', titulo: 'APE1', materia: 'Procesos de software', fechaEntrega: 'Martes 20 de Julio 2025', revisada: true },
    { id: '4', titulo: 'APE2', materia: 'Procesos de software', fechaEntrega: 'Martes 20 de Julio 2025', revisada: false },
];

export const InicioDocentePage: React.FC = () => {
    // 'useState' es el "Modelo". Aquí guardamos nuestra lista de tareas.
    const [tareas, setTareas] = useState(mockTareas);

    // 'useEffect' se usa para ejecutar código cuando el componente se carga.
    // Más adelante, aquí pondremos la llamada a la API para traer las tareas reales.
    useEffect(() => {
        // Por ahora, solo usamos los datos de ejemplo.
        setTareas(mockTareas);
    }, []);

    // La parte 'return' es la "Vista" (JSX).
    return (
        <div className="inicio-docente-container">
            <div className="header">
                <h1>Hola, Santiago Apolo</h1>
                <p>Lunes 30 de Junio del 2025</p>
                <p className="tareas-pendientes">Tienes 2 tareas pendientes por revisar</p>
            </div>

            <div className="toolbar">
                <button className="nueva-tarea-btn">Nueva tarea</button>
                {/* Aquí podrías agregar un input para filtrar */}
            </div>

            <table className="tareas-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Materia</th>
                        <th>Fecha de entrega</th>
                        <th>Revisada</th>
                        <th>Revisar</th>
                    </tr>
                </thead>
                <tbody>
                    {tareas.map((tarea) => (
                        <tr key={tarea.id}>
                            <td>{tarea.titulo}</td>
                            <td>{tarea.materia}</td>
                            <td>{tarea.fechaEntrega}</td>
                            <td>
                                <span className={tarea.revisada ? 'status-si' : 'status-no'}>
                                    {tarea.revisada ? 'Si' : 'No'}
                                </span>
                            </td>
                            <td>
                                <button className="revisar-btn">Revisar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};