import React, { useState, useEffect } from 'react';
import { useUser } from '../../../../context/UserContext';
import AdminLayout from '../../../../shared/components/Layout/AdminLayout';
import Button from '../../../../shared/components/Button';
import { obtenerDocentesConAsignaturas, obtenerAsignaturas, aprobarUsuario } from '../../../../api';
import './AdminDocentes.css';

interface Docente {
  uid: string;
  nombreCompleto: string;
  correoPersonal: string;
  correoInstitucional: string;
  identificacion: string;
  estado: 'pendiente' | 'aprobado';
  estadoRegistro: string;
  asignaturasUid?: string[];
  titulos: string[];
  fechaPerf: string;
}

interface Asignatura {
  id: string;
  codigo: string;
  nombre: string;
  carrera: string;
}

const AdminDocentes = () => {
  const { user, loading } = useUser();
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [docenteEditando, setDocenteEditando] = useState<Docente | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'aprobado'>('todos');

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correoPersonal: '',
    correoInstitucional: '',
    identificacion: '',
    titulos: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      // Cargar docentes y asignaturas en paralelo
      const [docentesData, asignaturasData] = await Promise.all([
        obtenerDocentesConAsignaturas(),
        obtenerAsignaturas()
      ]);
      
      console.log('Docentes cargados:', docentesData);
      console.log('Asignaturas cargadas:', asignaturasData);
      
      // Asegurar que datos sea un array
      const docentesArray = Array.isArray(docentesData) ? docentesData : [];
      const asignaturasArray = Array.isArray(asignaturasData) ? asignaturasData : [];
      
      setDocentes(docentesArray);
      setAsignaturas(asignaturasArray);
      setCargando(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setDocentes([]);
      setAsignaturas([]);
      setCargando(false);
    }
  };

  const obtenerNombreAsignatura = (asignaturaId: string) => {
    console.log('Buscando asignatura con ID:', asignaturaId);
    console.log('Asignaturas disponibles:', asignaturas);
    
    const asignatura = asignaturas.find(a => a.id === asignaturaId);
    console.log('Asignatura encontrada:', asignatura);
    
    if (asignatura) {
      return `${asignatura.codigo} - ${asignatura.nombre}`;
    } else {
      // Temporalmente mostrar el ID para debuggear
      return `ID: ${asignaturaId} (no encontrada)`;
    }
  };

  const handleCrearDocente = () => {
    setDocenteEditando(null);
    setFormData({
      nombreCompleto: '',
      correoPersonal: '',
      correoInstitucional: '',
      identificacion: '',
      titulos: '',
    });
    setMostrarFormulario(true);
  };

  const handleEditarDocente = (docente: Docente) => {
    setDocenteEditando(docente);
    setFormData({
      nombreCompleto: docente.nombreCompleto,
      correoPersonal: docente.correoPersonal,
      correoInstitucional: docente.correoInstitucional,
      identificacion: docente.identificacion,
      titulos: Array.isArray(docente.titulos) ? docente.titulos.join(', ') : '',
    });
    setMostrarFormulario(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (docenteEditando) {
      // Actualizar docente existente
      setDocentes(docentes.map(doc => 
        doc.uid === docenteEditando.uid 
          ? { 
              ...doc, 
              ...formData,
              titulos: formData.titulos.split(',').map(t => t.trim()).filter(Boolean)
            }
          : doc
      ));
    } else {
      // Crear nuevo docente
      const nuevoDocente: Docente = {
        uid: Date.now().toString(),
        ...formData,
        estado: 'pendiente',
        estadoRegistro: 'Pendiente',
        asignaturasUid: [],
        titulos: formData.titulos.split(',').map(t => t.trim()).filter(Boolean),
        fechaPerf: new Date().toISOString(),
      };
      setDocentes([...docentes, nuevoDocente]);
    }
    
    setMostrarFormulario(false);
    setDocenteEditando(null);
  };

  const handleAprobarDocente = async (uid: string) => {
    try {
      await aprobarUsuario(uid);
      setDocentes(docentes.map(doc => 
        doc.uid === uid 
          ? { ...doc, estado: 'aprobado' as const, estadoRegistro: 'Aprobado' }
          : doc
      ));
    } catch (error) {
      console.error('Error aprobando docente:', error);
    }
  };

  const handleEliminarDocente = async (uid: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este docente?')) {
      setDocentes(docentes.filter(doc => doc.uid !== uid));
    }
  };

  const docentesFiltrados = docentes.filter(doc => 
    filtroEstado === 'todos' || doc.estado === filtroEstado
  );

  if (loading || cargando) {
    return (
      <AdminLayout>
        <div className="admin-docentes-loading">
          <div className="loading-spinner"></div>
          <p>Cargando docentes...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user || user.tipo !== 'administrador') {
    return (
      <AdminLayout>
        <div className="admin-docentes-error">
          <h2>Acceso Denegado</h2>
          <p>Solo los administradores pueden acceder a esta página.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-docentes">
        <header className="admin-docentes-header">
          <div>
            <h1 className="admin-docentes-title">Gestión de Docentes</h1>
            <p className="admin-docentes-subtitle">
              Administra los docentes del sistema SGTA
            </p>
          </div>
          <Button onClick={handleCrearDocente} className="crear-docente-btn">
            ➕ Crear Docente
          </Button>
        </header>

        <div className="admin-docentes-filters">
          <div className="filter-group">
            <label htmlFor="filtro-estado">Filtrar por estado:</label>
            <select 
              id="filtro-estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
              className="filter-select"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobado">Aprobados</option>
            </select>
          </div>
          <div className="docentes-count">
            {docentesFiltrados.length} docente(s) encontrado(s)
          </div>
        </div>

        <div className="admin-docentes-table-container">
          <table className="admin-docentes-table">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Correo Personal</th>
                <th>Correo Institucional</th>
                <th>Identificación</th>
                <th>Asignaturas</th>
                <th>Títulos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentesFiltrados.map(docente => (
                <tr key={docente.uid}>
                  <td>{docente.nombreCompleto}</td>
                  <td>{docente.correoPersonal}</td>
                  <td>{docente.correoInstitucional}</td>
                  <td>{docente.identificacion}</td>
                  <td>
                    <div className="asignaturas-list">
                      {docente.asignaturasUid && docente.asignaturasUid.length > 0 ? (
                        <div className="asignaturas-info">
                          <span className="asignaturas-count">
                            {docente.asignaturasUid.length} asignatura(s)
                          </span>
                          <div className="asignaturas-details">
                            {docente.asignaturasUid.map((asignaturaId, index) => (
                              <span key={index} className="asignatura-tag">
                                {obtenerNombreAsignatura(asignaturaId)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="no-asignaturas">Sin asignaturas</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="titulos-list">
                      {Array.isArray(docente.titulos) && docente.titulos.length > 0 ? (
                        docente.titulos.map((titulo, index) => (
                          <span key={index} className="titulo-tag">{titulo}</span>
                        ))
                      ) : (
                        <span className="no-titulos">No especificados</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`estado-badge ${docente.estado}`}>
                      {docente.estado}
                    </span>
                  </td>
                  <td className="acciones-cell">
                    <div className="acciones-buttons">
                      {docente.estado?.toLowerCase() === 'pendiente' && (
                        <Button 
                          onClick={() => handleAprobarDocente(docente.uid)}
                          className="aprobar-btn"
                        >
                          ✅ Aprobar
                        </Button>
                      )}
                      <Button 
                        onClick={() => handleEditarDocente(docente)}
                        className="editar-btn"
                      >
                        ✏️ Editar
                      </Button>
                      <Button 
                        onClick={() => handleEliminarDocente(docente.uid)}
                        className="eliminar-btn"
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mostrarFormulario && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{docenteEditando ? 'Editar Docente' : 'Crear Nuevo Docente'}</h2>
              <form onSubmit={handleSubmit} className="docente-form">
                <div className="form-group">
                  <label htmlFor="nombreCompleto">Nombre Completo:</label>
                  <input
                    type="text"
                    id="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="correoPersonal">Correo Personal:</label>
                  <input
                    type="email"
                    id="correoPersonal"
                    value={formData.correoPersonal}
                    onChange={(e) => setFormData({...formData, correoPersonal: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="correoInstitucional">Correo Institucional:</label>
                  <input
                    type="email"
                    id="correoInstitucional"
                    value={formData.correoInstitucional}
                    onChange={(e) => setFormData({...formData, correoInstitucional: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="identificacion">Identificación:</label>
                  <input
                    type="text"
                    id="identificacion"
                    value={formData.identificacion}
                    onChange={(e) => setFormData({...formData, identificacion: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="titulos">Títulos (separados por comas):</label>
                  <textarea
                    id="titulos"
                    value={formData.titulos}
                    onChange={(e) => setFormData({...formData, titulos: e.target.value})}
                    placeholder="Ej: Ingeniero en Sistemas, Magister en Informática"
                  />
                </div>
                
                <div className="form-actions">
                  <Button type="submit" className="guardar-btn">
                    {docenteEditando ? 'Actualizar' : 'Crear'} Docente
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setMostrarFormulario(false)}
                    className="cancelar-btn"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDocentes; 