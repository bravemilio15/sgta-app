import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { obtenerTareasPorAsignatura, eliminarTarea } from '../../../api';
import { useUser } from '../../../context/UserContext';
import type { Tarea, Asignatura } from '../types';
import './GestionarTareasAsignaturaPage.css';

const GestionarTareasAsignaturaPage = () => {
    const [tareas, setTareas] = useState<Tarea[]>([]);
    const [loading, setLoading] = useState(true);
    const [asignatura, setAsignatura] = useState<Asignatura | null>(null);
    const { user } = useUser();
    const navigate = useNavigate();
    const { asignaturaId } = useParams();
    const location = useLocation();

    useEffect(() => {
        const cargarDatos = async () => {
            if (user?.token && asignaturaId) {
                try {
                    setLoading(true);
                    
                    // Obtener información de la asignatura desde el estado de navegación
                    if (location.state?.asignatura) {
                        setAsignatura(location.state.asignatura);
                    }
                    
                    // Obtener tareas de la asignatura
                    const tareasData = await obtenerTareasPorAsignatura(asignaturaId, user.token);
                    setTareas(tareasData || []);
                } catch (error) {
                    console.error('Error al cargar tareas:', error);
                    setTareas([]);
                } finally {
                    setLoading(false);
                }
            }
        };
        cargarDatos();
    }, [user, asignaturaId, location.state]);

    const handleEliminar = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            try {
                await eliminarTarea(id, user?.token || '');
                setTareas(tareas.filter(t => t.id.toString() !== id));
            } catch (error) {
                console.error('Error al eliminar tarea:', error);
                alert('Error al eliminar la tarea');
            }
        }
    };

    const handleVolver = () => {
        navigate('/tareas/menu/inicio-docente');
    };

    if (loading) {
        return (
            <div className="gestionar-tareas-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando tareas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="gestionar-tareas-container">
            <header className="gestionar-tareas-header">
                <div className="header-content">
                    <button onClick={handleVolver} className="volver-btn">
                        ← Volver a Mis Asignaturas
                    </button>
                    <div className="asignatura-info">
                        <h1>{asignatura?.nombre || 'Asignatura'}</h1>
                        <p className="asignatura-codigo">{asignatura?.codigo}</p>
                    </div>
                    <button 
                        onClick={() => navigate(`/docente/tareas/nueva?asignaturaId=${asignaturaId}`)} 
                        className="nueva-tarea-btn"
                    >
                        + Nueva Tarea
                    </button>
                </div>
            </header>

            <div className="tareas-section">
                <div className="tareas-header">
                    <h2>Tareas de la Asignatura</h2>
                    <span className="tareas-count">{tareas.length} tarea{tareas.length !== 1 ? 's' : ''}</span>
                </div>

                {tareas.length === 0 ? (
                    <div className="no-tareas">
                        <div className="no-tareas-icon">📝</div>
                        <h3>No hay tareas creadas</h3>
                        <p>Crea la primera tarea para esta asignatura</p>
                        <button 
                            onClick={() => navigate(`/docente/tareas/nueva?asignaturaId=${asignaturaId}`)}
                            className="crear-primera-tarea-btn"
                        >
                            Crear Primera Tarea
                        </button>
                    </div>
                ) : (
                    <div className="tareas-grid">
                        {tareas.map(tarea => (
                            <div key={tarea.id} className="tarea-card">
                                <div className="tarea-header">
                                    <h3>{tarea.titulo}</h3>
                                    <span className={`tarea-tipo tarea-${tarea.tipoTarea.toLowerCase()}`}>
                                        {tarea.tipoTarea}
                                    </span>
                                </div>
                                <p className="tarea-descripcion">{tarea.descripcion}</p>
                                <div className="tarea-info">
                                    <div className="info-item">
                                        <span className="info-label">Fecha de Entrega:</span>
                                        <span className="info-value">
                                            {new Date(tarea.fechaEntrega).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Estado:</span>
                                        <span className={`info-value estado-${tarea.estado}`}>
                                            {tarea.estado.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Tipo:</span>
                                        <span className="info-value">{tarea.grupal ? 'Grupal' : 'Individual'}</span>
                                    </div>
                                </div>
                                <div className="tarea-actions">
                                    <button 
                                        onClick={() => navigate(`/docente/tareas/editar/${tarea.id}`)}
                                        className="editar-btn"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/docente/tareas/revisar/${tarea.id}`)}
                                        className="revisar-btn"
                                    >
                                        Revisar
                                    </button>
                                    <button 
                                        onClick={() => handleEliminar(tarea.id.toString())}
                                        className="eliminar-btn"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GestionarTareasAsignaturaPage; 