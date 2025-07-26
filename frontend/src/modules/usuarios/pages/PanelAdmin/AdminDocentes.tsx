import React, { useState, useEffect } from 'react';
import { useUser } from '../../../../context/UserContext';
import AdminLayout from '../../../../shared/components/Layout/AdminLayout';
import Button from '../../../../shared/components/Button';
import { obtenerDocentes } from '../../../../api';
import './AdminDocentes.css';

interface Docente {
  uid: string;
  nombreCompleto: string;
  correoPersonal: string;
  correoInstitucional: string;
  identificacion: string;
  estado: 'activo' | 'inactivo';
  estadoRegistro: string;
  materias: string[];
  titulos: string[];
  departamento: string;
  fechaPerf: string;
}

const AdminDocentes = () => {
  const { user, loading } = useUser();
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [docenteEditando, setDocenteEditando] = useState<Docente | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correoPersonal: '',
    correoInstitucional: '',
    identificacion: '',
    materias: '',
    titulos: '',
    departamento: '',
  });

  useEffect(() => {
    cargarDocentes();
  }, []);

  const cargarDocentes = async () => {
    try {
      const datos = await obtenerDocentes();
      // Asegurar que datos sea un array
      const docentesArray = Array.isArray(datos) ? datos : [];
      setDocentes(docentesArray);
      setCargando(false);
    } catch (error) {
      console.error('Error cargando docentes:', error);
      setDocentes([]); // Inicializar como array vacío en caso de error
      setCargando(false);
    }
  };

  const handleCrearDocente = () => {
    setDocenteEditando(null);
    setFormData({
      nombreCompleto: '',
      correoPersonal: '',
      correoInstitucional: '',
      identificacion: '',
      materias: '',
      titulos: '',
      departamento: '',
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
      materias: Array.isArray(docente.materias) ? docente.materias.join(', ') : '',
      titulos: Array.isArray(docente.titulos) ? docente.titulos.join(', ') : '',
      departamento: docente.departamento || '',
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
              materias: formData.materias.split(',').map(m => m.trim()).filter(Boolean),
              titulos: formData.titulos.split(',').map(t => t.trim()).filter(Boolean)
            }
          : doc
      ));
    } else {
      // Crear nuevo docente
      const nuevoDocente: Docente = {
        uid: Date.now().toString(),
        ...formData,
        estado: 'activo',
        estadoRegistro: 'Aprobado',
        materias: formData.materias.split(',').map(m => m.trim()).filter(Boolean),
        titulos: formData.titulos.split(',').map(t => t.trim()).filter(Boolean),
        fechaPerf: new Date().toISOString(),
      };
      setDocentes([...docentes, nuevoDocente]);
    }
    
    setMostrarFormulario(false);
    setDocenteEditando(null);
  };

  const handleActivarDocente = async (uid: string) => {
    setDocentes(docentes.map(doc => 
      doc.uid === uid 
        ? { ...doc, estado: 'activo' as const }
        : doc
    ));
  };

  const handleDesactivarDocente = async (uid: string) => {
    setDocentes(docentes.map(doc => 
      doc.uid === uid 
        ? { ...doc, estado: 'inactivo' as const }
        : doc
    ));
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
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
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
                <th>Departamento</th>
                <th>Materias</th>
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
                  <td>{docente.departamento || 'No especificado'}</td>
                  <td>
                    <div className="materias-list">
                      {Array.isArray(docente.materias) ? docente.materias.map((materia, index) => (
                        <span key={index} className="materia-tag">{materia}</span>
                      )) : 'No especificadas'}
                    </div>
                  </td>
                  <td>
                    <div className="materias-list">
                      {Array.isArray(docente.titulos) ? docente.titulos.map((titulo, index) => (
                        <span key={index} className="materia-tag">{titulo}</span>
                      )) : 'No especificados'}
                    </div>
                  </td>
                  <td>
                    <span className={`estado-badge ${docente.estado}`}>
                      {docente.estado}
                    </span>
                  </td>
                  <td className="acciones-cell">
                    <div className="acciones-buttons">
                      {docente.estado === 'inactivo' ? (
                        <Button 
                          onClick={() => handleActivarDocente(docente.uid)}
                          className="activar-btn"
                        >
                          ✅ Activar
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleDesactivarDocente(docente.uid)}
                          className="desactivar-btn"
                        >
                          ⏸️ Desactivar
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
                  <label htmlFor="departamento">Departamento:</label>
                  <input
                    type="text"
                    id="departamento"
                    value={formData.departamento}
                    onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="materias">Materias (separadas por comas):</label>
                  <textarea
                    id="materias"
                    value={formData.materias}
                    onChange={(e) => setFormData({...formData, materias: e.target.value})}
                    placeholder="Ej: Programación I, Base de Datos, Algoritmos"
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