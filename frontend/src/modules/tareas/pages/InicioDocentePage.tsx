import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerTareasDocente, eliminarTarea } from '../../../api';
import { useUser } from '../../../context/UserContext';
import './InicioDocentePage.css';

const InicioDocentePage = () => {
    const [tareas, setTareas] = useState([]);
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const cargarTareas = async () => {
            if (user && user.token) {
                const tareasData = await obtenerTareasDocente(user.token);
                setTareas(tareasData);
            }
        };
        cargarTareas();
    }, [user]);

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            await eliminarTarea(id, user.token);
            setTareas(tareas.filter(t => t.id !== id));
        }
    };

    return (
        <div className="inicio-docente-container">
            <header className="inicio-docente-header">
                <h1>Mis Tareas</h1>
                <button onClick={() => navigate('/docente/tareas/nueva')} className="nueva-tarea-btn">
                    + Nueva Tarea
                </button>
            </header>
            <div className="tareas-list">
                {tareas.map(tarea => (
                    <div key={tarea.id} className="tarea-card">
                        <h3>{tarea.titulo}</h3>
                        <p><strong>Asignatura:</strong> {tarea.asignatura}</p>
                        <p><strong>Fecha de Entrega:</strong> {new Date(tarea.fechaEntrega).toLocaleDateString()}</p>
                        <p><strong>Tipo:</strong> {tarea.tipo}</p>
                        <div className="tarea-actions">
                            <button onClick={() => navigate(`/docente/tareas/editar/${tarea.id}`)}>Editar</button>
                            <button onClick={() => navigate(`/docente/tareas/revisar/${tarea.id}`)}>Revisar</button>
                            <button onClick={() => handleEliminar(tarea.id)} className="eliminar-btn">Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InicioDocentePage;