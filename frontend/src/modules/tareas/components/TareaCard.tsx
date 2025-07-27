import React from 'react';
import { Link } from 'react-router-dom';
import './TareaCard.css';

const TareaCard = ({ tarea }) => {
    const { titulo, asignatura, fechaEntrega, diasRestantes, estado, calificacion } = tarea;

    const getEstadoClass = () => {
        if (estado === 'calificada') return 'estado-calificada';
        if (diasRestantes < 0) return 'estado-vencida';
        if (diasRestantes <= 3) return 'estado-urgente';
        return 'estado-pendiente';
    };

    return (
        <div className={`tarea-card-estudiante ${getEstadoClass()}`}>
            <Link to={`/tarea/${tarea.id}`}>
                <h3>{titulo}</h3>
                <p>{asignatura}</p>
                <p>Fecha de entrega: {new Date(fechaEntrega).toLocaleDateString()}</p>
                {estado === 'pendiente' && <p>Días restantes: {diasRestantes}</p>}
                {estado === 'calificada' && <p>Calificación: {calificacion}/10</p>}
            </Link>
        </div>
    );
};

export default TareaCard;