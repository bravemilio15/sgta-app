import React, { useState, useEffect } from 'react';
import { useUser } from '../../../context/UserContext';
import { obtenerDashboardEstudiante } from '../../../api';
import TareaCard from '../components/TareaCard';
import './InicioEstudiantePage.css';

const InicioEstudiantePage = () => {
    const { user } = useUser();
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        const cargarDashboard = async () => {
            if (user && user.token) {
                const data = await obtenerDashboardEstudiante(user.token);
                setDashboard(data);
            }
        };
        cargarDashboard();
    }, [user]);

    if (!dashboard) return <div>Cargando...</div>;

    return (
        <div className="inicio-estudiante-container">
            <h1>Mi Aula Virtual</h1>
            <div className="dashboard-resumen">
                {/* Aquí puedes agregar los indicadores visuales */}
            </div>
            <div className="tareas-pendientes">
                <h2>Tareas Pendientes</h2>
                {dashboard.tareas.filter(t => t.estado === 'pendiente').map(tarea => (
                    <TareaCard key={tarea.id} tarea={tarea} />
                ))}
            </div>
            <div className="tareas-calificadas">
                <h2>Calificaciones Recibidas</h2>
                {dashboard.tareas.filter(t => t.estado === 'calificada').map(tarea => (
                    <TareaCard key={tarea.id} tarea={tarea} />
                ))}
            </div>
        </div>
    );
};

export default InicioEstudiantePage;