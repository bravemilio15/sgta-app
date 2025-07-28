import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerAsignaturasDeDocente } from '../../../api';
import { useUser } from '../../../context/UserContext';
import type { Asignatura } from '../types';
import './InicioDocentePage.css';

const InicioDocentePage = () => {
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const cargarAsignaturas = async () => {
            if (user && user.uid) {
                try {
                    setLoading(true);
                    const response = await obtenerAsignaturasDeDocente(user.uid);
                    if (response.asignaturas) {
                        setAsignaturas(response.asignaturas);
                    } else {
                        setAsignaturas([]);
                    }
                } catch (error) {
                    console.error('Error al cargar asignaturas:', error);
                    setAsignaturas([]);
                } finally {
                    setLoading(false);
                }
            }
        };
        cargarAsignaturas();
    }, [user]);

    const handleAsignaturaClick = (asignatura: Asignatura) => {
        navigate(`/docente/asignatura/${asignatura.id}/tareas`, { 
            state: { asignatura } 
        });
    };

    if (loading) {
        return (
            <div className="inicio-docente-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando tus asignaturas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="inicio-docente-container">
            <header className="inicio-docente-header">
                <h1>Mis Asignaturas</h1>
                <p className="welcome-message">
                    Bienvenido, {user?.nombreCompleto || 'Docente'}
                </p>
            </header>

            {asignaturas.length === 0 ? (
                <div className="no-asignaturas">
                    <div className="no-asignaturas-icon">📚</div>
                    <h3>No tienes asignaturas asignadas</h3>
                    <p>Contacta al administrador para que te asigne asignaturas.</p>
                </div>
            ) : (
                <div className="asignaturas-grid">
                    {asignaturas.map(asignatura => (
                        <div 
                            key={asignatura.id} 
                            className="asignatura-card"
                            onClick={() => handleAsignaturaClick(asignatura)}
                        >
                            <div className="asignatura-header">
                                <h3>{asignatura.nombre}</h3>
                                <span className="asignatura-codigo">{asignatura.codigo}</span>
                            </div>
                            <div className="asignatura-info">
                                <div className="info-item">
                                    <span className="info-label">Estudiantes:</span>
                                    <span className="info-value">{asignatura.numeroEstudiantes || 0}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Carrera:</span>
                                    <span className="info-value">{asignatura.carrera}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Estado:</span>
                                    <span className={`info-value estado-${asignatura.estado?.toLowerCase() || 'asignada'}`}>
                                        {asignatura.estado || 'ASIGNADA'}
                                    </span>
                                </div>
                            </div>
                            <div className="asignatura-actions">
                                <button className="gestionar-btn">
                                    Gestionar Tareas
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InicioDocentePage;