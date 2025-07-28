import './DocenteSidebar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { getAuth, signOut } from 'firebase/auth';
import { 
  FiBarChart2, 
  FiBook, 
  FiLogOut,
  FiFileText,
  FiUsers,
  FiSettings,
  FiHome,
  FiPlus
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { obtenerAsignaturasDeDocente } from '../../../api';
import type { Asignatura } from '../../../modules/tareas/types';

const DocenteSidebar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(true);

  useEffect(() => {
    const cargarAsignaturas = async () => {
      if (user?.uid) {
        try {
          setLoadingAsignaturas(true);
          const response = await obtenerAsignaturasDeDocente(user.uid);
          if (response.asignaturas) {
            setAsignaturas(response.asignaturas.slice(0, 3)); // Solo mostrar las primeras 3
          }
        } catch (error) {
          console.error('Error al cargar asignaturas:', error);
        } finally {
          setLoadingAsignaturas(false);
        }
      }
    };
    cargarAsignaturas();
  }, [user]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setUser(null);
      navigate('/usuarios');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    { to: '/tareas/menu/inicio-docente', label: 'Inicio', icon: <FiHome />, exact: true },
    { to: '/docente/tareas', label: 'Mis Tareas', icon: <FiFileText /> },
    { to: '/reportes', label: 'Reportes', icon: <FiBarChart2 /> },
    { to: '/notificaciones', label: 'Notificaciones', icon: <FiUsers /> },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Verificar si estamos en una página de asignatura específica
  const isInAsignaturaPage = location.pathname.includes('/docente/asignatura/');
  const currentAsignaturaId = location.pathname.split('/docente/asignatura/')[1]?.split('/')[0];

  if (!user || user.tipo !== 'docente') return null;

  return (
    <aside className="docente-sidebar">
      <div className="docente-sidebar-header">
        <div className="docente-sidebar-title">Panel Docente</div>
      </div>
      
      <nav className="docente-sidebar-nav">
        <ul className="docente-sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.to} className="docente-sidebar-menu-item">
              <Link 
                to={item.to} 
                className={`docente-sidebar-menu-link ${isActive(item.to, item.exact) ? 'active' : ''}`}
              >
                <span className="docente-sidebar-menu-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Accesos rápidos a asignaturas */}
        {asignaturas.length > 0 && (
          <div className="docente-sidebar-section">
            <div className="docente-sidebar-section-title">
              <FiBook />
              Accesos Rápidos
            </div>
            <ul className="docente-sidebar-menu">
              {asignaturas.map((asignatura) => {
                const isCurrentAsignatura = currentAsignaturaId === asignatura.id;
                return (
                  <li key={asignatura.id} className="docente-sidebar-menu-item">
                    <Link 
                      to={`/docente/asignatura/${asignatura.id}/tareas`}
                      className={`docente-sidebar-menu-link asignatura-link ${isCurrentAsignatura ? 'current-asignatura' : ''}`}
                      state={{ asignatura }}
                    >
                      <span className="docente-sidebar-menu-icon">
                        <FiFileText />
                      </span>
                      <div className="asignatura-link-content">
                        <span className="asignatura-name">{asignatura.nombre}</span>
                        <span className="asignatura-code">{asignatura.codigo}</span>
                        {isCurrentAsignatura && (
                          <span className="current-indicator">● Actual</span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        
        {loadingAsignaturas && (
          <div className="docente-sidebar-loading">
            <div className="loading-spinner"></div>
            <span>Cargando asignaturas...</span>
          </div>
        )}
      </nav>

      <div className="docente-sidebar-footer">
        <button className="docente-sidebar-logout-btn" onClick={handleLogout}>
          <FiLogOut />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default DocenteSidebar; 