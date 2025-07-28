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
  FiSettings
} from 'react-icons/fi';

const DocenteSidebar = () => {
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
    { to: '/inicio-docente', label: 'Dashboard', icon: <FiBarChart2 />, exact: true },
    { to: '/inicio-docente/tareas', label: 'Mis Tareas', icon: <FiFileText /> },
    { to: '/inicio-docente/asignaturas', label: 'Mis Asignaturas', icon: <FiBook /> },
    { to: '/inicio-docente/estudiantes', label: 'Mis Estudiantes', icon: <FiUsers /> },
    { to: '/inicio-docente/reportes', label: 'Reportes', icon: <FiBarChart2 /> },
    { to: '/inicio-docente/configuracion', label: 'Configuración', icon: <FiSettings /> },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

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