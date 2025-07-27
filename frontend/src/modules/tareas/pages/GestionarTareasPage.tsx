import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearTarea, actualizarTarea, obtenerTarea } from '../../../api';
import { useUser } from '../../../context/UserContext';
import './GestionarTareasPage.css';

const GestionarTareaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [tarea, setTarea] = useState({
        titulo: '',
        descripcion: '',
        fechaInicio: '',
        fechaEntrega: '',
        tipo: 'ACD',
        asignatura: '',
        permiteEntregaTardia: false,
    });

    useEffect(() => {
        if (id) {
            const cargarTarea = async () => {
                const tareaExistente = await obtenerTarea(id, user.token);
                setTarea(tareaExistente);
            };
            cargarTarea();
        }
    }, [id, user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTarea(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (id) {
            await actualizarTarea(id, tarea, user.token);
        } else {
            await crearTarea(tarea, user.token);
        }
        navigate('/docente/tareas');
    };

    return (
        <div className="gestionar-tarea-container">
            <h2>{id ? 'Editar' : 'Crear'} Tarea</h2>
            <form onSubmit={handleSubmit} className="gestionar-tarea-form">
                <input name="titulo" value={tarea.titulo} onChange={handleChange} placeholder="Título" required />
                <textarea name="descripcion" value={tarea.descripcion} onChange={handleChange} placeholder="Descripción" required />
                <input type="datetime-local" name="fechaInicio" value={tarea.fechaInicio} onChange={handleChange} required />
                <input type="datetime-local" name="fechaEntrega" value={tarea.fechaEntrega} onChange={handleChange} required />
                <select name="tipo" value={tarea.tipo} onChange={handleChange}>
                    <option value="ACD">Actividad de contacto con docente</option>
                    <option value="APE">Aprendizaje práctico experimental</option>
                    <option value="AA">Aprendizaje autónomo</option>
                </select>
                <input name="asignatura" value={tarea.asignatura} onChange={handleChange} placeholder="Asignatura" required />
                <label>
                    <input type="checkbox" name="permiteEntregaTardia" checked={tarea.permiteEntregaTardia} onChange={handleChange} />
                    Permite entrega tardía
                </label>
                <button type="submit">{id ? 'Actualizar' : 'Crear'} Tarea</button>
            </form>
        </div>
    );
};

export default GestionarTareaPage;