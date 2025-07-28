import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { crearTarea, actualizarTarea, obtenerTarea } from '../../../api';
import { useUser } from '../../../context/UserContext';
import './GestionarTareasPage.css';

const GestionarTareaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUser();
    
    // Obtener asignaturaId desde la URL si existe
    const urlParams = new URLSearchParams(location.search);
    const asignaturaId = urlParams.get('asignaturaId');
    
    const [tarea, setTarea] = useState({
        titulo: '',
        descripcion: '',
        fechaInicio: '',
        fechaEntrega: '',
        tipo: 'ACD',
        asignatura: '',
        asignaturaId: asignaturaId || '',
        permiteEntregaTardia: false,
    });

    // Si hay asignaturaId, obtener información de la asignatura
    const [asignaturaInfo, setAsignaturaInfo] = useState<any>(null);
    const [loadingAsignatura, setLoadingAsignatura] = useState(false);

    useEffect(() => {
        const obtenerInfoAsignatura = async () => {
            if (asignaturaId && user?.token) {
                try {
                    setLoadingAsignatura(true);
                    // Aquí podrías hacer una llamada a la API para obtener info de la asignatura
                    // Por ahora usaremos un objeto mock
                    setAsignaturaInfo({
                        id: asignaturaId,
                        nombre: 'Asignatura seleccionada',
                        codigo: 'ASIG001'
                    });
                } catch (error) {
                    console.error('Error al obtener información de la asignatura:', error);
                } finally {
                    setLoadingAsignatura(false);
                }
            }
        };
        obtenerInfoAsignatura();
    }, [asignaturaId, user]);

    useEffect(() => {
        if (id && user?.token) {
            const cargarTarea = async () => {
                const tareaExistente = await obtenerTarea(id, user.token);
                setTarea(tareaExistente);
            };
            cargarTarea();
        }
    }, [id, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setTarea(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.token) return;
        
        if (id) {
            await actualizarTarea(id, tarea, user.token);
        } else {
            await crearTarea(tarea, user.token);
        }
        
        // Redirigir según el contexto
        if (asignaturaId) {
            navigate(`/docente/asignatura/${asignaturaId}/tareas`);
        } else {
            navigate('/tareas/menu/inicio-docente');
        }
    };

    return (
        <div className="gestionar-tarea-container">
            <h2>{id ? 'Editar' : 'Crear'} Tarea</h2>
            
            {asignaturaId && asignaturaInfo && (
                <div className="asignatura-context">
                    <div className="asignatura-info-display">
                        <h3>Asignatura: {asignaturaInfo.nombre}</h3>
                        <p>Código: {asignaturaInfo.codigo}</p>
                        <p className="asignatura-notice">Esta tarea se creará específicamente para esta asignatura</p>
                    </div>
                </div>
            )}
            
            {loadingAsignatura && (
                <div className="loading-asignatura">
                    <div className="loading-spinner"></div>
                    <p>Cargando información de la asignatura...</p>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="gestionar-tarea-form">
                <input 
                    name="titulo" 
                    value={tarea.titulo} 
                    onChange={handleChange} 
                    placeholder="Título de la tarea" 
                    required 
                />
                
                <textarea 
                    name="descripcion" 
                    value={tarea.descripcion} 
                    onChange={handleChange} 
                    placeholder="Descripción detallada de la tarea" 
                    required 
                />
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Fecha de Inicio</label>
                        <input 
                            type="datetime-local" 
                            name="fechaInicio" 
                            value={tarea.fechaInicio} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Fecha de Entrega</label>
                        <input 
                            type="datetime-local" 
                            name="fechaEntrega" 
                            value={tarea.fechaEntrega} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Tipo de Tarea</label>
                        <select name="tipo" value={tarea.tipo} onChange={handleChange}>
                            <option value="ACD">Actividad de contacto con docente</option>
                            <option value="APE">Aprendizaje práctico experimental</option>
                            <option value="AA">Aprendizaje autónomo</option>
                        </select>
                    </div>
                    
                    {!asignaturaId && (
                        <div className="form-group">
                            <label>Asignatura</label>
                            <input 
                                name="asignatura" 
                                value={tarea.asignatura} 
                                onChange={handleChange} 
                                placeholder="Nombre de la asignatura" 
                                required 
                            />
                        </div>
                    )}
                </div>
                
                <label className="checkbox-label">
                    <input 
                        type="checkbox" 
                        name="permiteEntregaTardia" 
                        checked={tarea.permiteEntregaTardia} 
                        onChange={handleChange} 
                    />
                    <span>Permite entrega tardía</span>
                </label>
                
                <div className="form-actions">
                    <button type="button" onClick={() => navigate(-1)} className="cancel-btn">
                        Cancelar
                    </button>
                    <button type="submit" className="submit-btn">
                        {id ? 'Actualizar' : 'Crear'} Tarea
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GestionarTareaPage;