import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerDetalleTarea, calificarEntrega } from '../../../api';
import { useUser } from '../../../context/UserContext';
import './RevisarTareaPage.css';

const RevisarTareaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [detalle, setDetalle] = useState(null);
    const [calificaciones, setCalificaciones] = useState({});
    const [observaciones, setObservaciones] = useState({});

    useEffect(() => {
        const cargarDetalles = async () => {
            if (user && user.token && id) {
                const data = await obtenerDetalleTarea(id, user.token);
                setDetalle(data);
            }
        };
        cargarDetalles();
    }, [id, user]);

    const handleCalificar = async (entregaId) => {
        const calificacion = {
            calificacion: parseFloat(calificaciones[entregaId]),
            retroalimentacion: observaciones[entregaId] || ''
        };
        await calificarEntrega(entregaId, calificacion, user.token);
        alert('Calificación guardada');
        // Opcional: Recargar los datos para ver la calificación actualizada
    };

    if (!detalle) return <div>Cargando...</div>;

    return (
        <div className="revisar-tarea-container">
            <button onClick={() => navigate('/docente/tareas')} className="volver-btn">‹ Volver</button>
            <h1>Revisar Tarea: {detalle.tarea.titulo}</h1>
            <p>{detalle.tarea.descripcion}</p>

            <div className="entregas-lista">
                {detalle.entregas.map(entrega => (
                    <div key={entrega.id} className="entrega-card">
                        <div className="entrega-info">
                            <h4>{entrega.estudiante.nombreCompleto}</h4>
                            <p><strong>Entregado:</strong> {new Date(entrega.fechaEntrega).toLocaleString()}</p>
                            <div className="archivos-entregados">
                                {entrega.archivos.map(archivo => (
                                    <a href={archivo.url} target="_blank" rel="noopener noreferrer" key={archivo.nombre}>
                                        {archivo.nombre}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div className="calificacion-form">
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="Calificación (0-10)"
                                defaultValue={entrega.calificacion}
                                onChange={(e) => setCalificaciones(prev => ({ ...prev, [entrega.id]: e.target.value }))}
                            />
                            <textarea
                                placeholder="Observaciones..."
                                defaultValue={entrega.retroalimentacion}
                                onChange={(e) => setObservaciones(prev => ({ ...prev, [entrega.id]: e.target.value }))}
                            />
                            <button onClick={() => handleCalificar(entrega.id)}>Calificar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RevisarTareaPage;