import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerTarea, gestionarEntrega, obtenerEntregaPorEstudianteTarea } from '../../../api';
import { useUser } from '../../../context/UserContext';
import './TareaEstudiantePage.css';

const TareaEstudiantePage = () => {
    const { id: tareaId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [tarea, setTarea] = useState(null);
    const [entrega, setEntrega] = useState(null);
    const [archivos, setArchivos] = useState([]);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const cargarDatos = async () => {
            if (user && user.token && tareaId) {
                const dataTarea = await obtenerTarea(tareaId, user.token);
                setTarea(dataTarea);
                const dataEntrega = await obtenerEntregaPorEstudianteTarea(user.uid, tareaId, user.token);
                setEntrega(dataEntrega);
            }
        };
        cargarDatos();
    }, [tareaId, user]);

    const handleFileChange = (e) => {
        setArchivos(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (archivos.length === 0) {
            setMensaje('Debes seleccionar al menos un archivo.');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < archivos.length; i++) {
            formData.append('archivos', archivos[i]);
        }

        try {
            const response = await gestionarEntrega(tareaId, formData, user.token);
            setMensaje('Entrega realizada con éxito!');
            // Actualizar el estado de la entrega
        } catch (error) {
            setMensaje('Error al realizar la entrega.');
        }
    };

    if (!tarea) return <div>Cargando...</div>;

    return (
        <div className="tarea-estudiante-container">
            <button onClick={() => navigate('/estudiante/dashboard')} className="volver-btn">‹ Volver</button>
            <h1>{tarea.titulo}</h1>
            <p><strong>Asignatura:</strong> {tarea.asignatura}</p>
            <p><strong>Fecha de entrega:</strong> {new Date(tarea.fechaEntrega).toLocaleString()}</p>
            <div className="tarea-descripcion" dangerouslySetInnerHTML={{ __html: tarea.descripcion }} />

            <div className="entrega-section">
                <h2>Mi Entrega</h2>
                {entrega && (
                    <div className="entrega-actual">
                        <h4>Archivos Entregados:</h4>
                        {entrega.archivos.map(a => <p key={a.nombre}>{a.nombre}</p>)}
                        <p><strong>Calificación:</strong> {entrega.calificacion ?? 'No calificado'}</p>
                        <p><strong>Retroalimentación:</strong> {entrega.retroalimentacion ?? 'N/A'}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="entrega-form">
                    <h3>Subir Archivos</h3>
                    <p>Formatos permitidos: PDF, Excel, Word. Tamaño máximo: 10MB.</p>
                    <input type="file" multiple onChange={handleFileChange} />
                    <button type="submit">Entregar Tarea</button>
                </form>
                {mensaje && <p className="mensaje">{mensaje}</p>}
            </div>
        </div>
    );
};

export default TareaEstudiantePage;