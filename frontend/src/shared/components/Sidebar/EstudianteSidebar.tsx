import './EstudianteSidebar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { getAuth, signOut } from 'firebase/auth';
import { 
  FiBarChart2, 
  FiBook, 
  FiLogOut,
  FiFileText,
  FiCalendar,
  FiSettings
} from 'react-icons/fi';

const EstudianteSidebar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

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
    { to: '/inicio-estudiante', label: 'Dashboard', icon: <FiBarChart2 />, exact: true },
    { to: '/inicio-estudiante/tareas', label: 'Mis Tareas', icon: <FiFileText /> },
    { to: '/inicio-estudiante/asignaturas', label: 'Mis Asignaturas', icon: <FiBook /> },
    { to: '/inicio-estudiante/calendario', label: 'Calendario', icon: <FiCalendar /> },
    { to: '/inicio-estudiante/progreso', label: 'Mi Progreso', icon: <FiBarChart2 /> },
    { to: '/inicio-estudiante/configuracion', label: 'Configuración', icon: <FiSettings /> },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (!user || user.tipo !== 'estudiante') return null;

  return (
    <aside className="estudiante-sidebar">
      <div className="estudiante-sidebar-header">
        <div className="estudiante-sidebar-title">Panel Estudiante</div>
      </div>
      
      <nav className="estudiante-sidebar-nav">
        <ul className="estudiante-sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.to} className="estudiante-sidebar-menu-item">
              <Link 
                to={item.to} 
                className={`estudiante-sidebar-menu-link ${isActive(item.to, item.exact) ? 'active' : ''}`}
              >
                <span className="estudiante-sidebar-menu-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="estudiante-sidebar-footer">
        <button className="estudiante-sidebar-logout-btn" onClick={handleLogout}>
          <FiLogOut />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default EstudianteSidebar; 