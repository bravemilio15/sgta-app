import './Sidebar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { getAuth, signOut } from 'firebase/auth';
import { 
  FiHome, 
  FiUsers, 
  FiBarChart2, 
  FiBell, 
  FiSettings, 
  FiLogOut
} from 'react-icons/fi';

const Sidebar = () => {
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

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.tipo) {
      case 'docente':
        return [
          { to: '/docente/tareas', label: 'Mis Tareas', icon: <FiBarChart2 /> },
          { to: '/reportes', label: 'Reportes', icon: <FiBarChart2 /> },
          { to: '/notificaciones', label: 'Notificaciones', icon: <FiBell /> },
        ];
      case 'estudiante':
        return [
          { to: '/estudiante/dashboard', label: 'Mi Dashboard', icon: <FiHome /> },
          { to: '/notificaciones', label: 'Notificaciones', icon: <FiBell /> },
        ];
      default:
        return [];
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  if (!user || user.tipo === 'administrador') return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">SGTA</div>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {getMenuItems().map((item) => (
            <li key={item.to} className="sidebar-menu-item">
              <Link 
                to={item.to} 
                className={`sidebar-menu-link ${isActive(item.to) ? 'active' : ''}`}
              >
                <span className="sidebar-menu-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <FiLogOut />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
