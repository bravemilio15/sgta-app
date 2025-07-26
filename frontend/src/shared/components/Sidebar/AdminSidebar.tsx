import './AdminSidebar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { getAuth, signOut } from 'firebase/auth';
import { 
  FiBarChart2, 
  FiUsers, 
  FiLogOut,
  FiBook
} from 'react-icons/fi';

const AdminSidebar = () => {
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
    { to: '/panel-admin', label: 'Dashboard', icon: <FiBarChart2 />, exact: true },
    { to: '/panel-admin/estudiantes', label: 'Estudiantes', icon: <FiUsers /> },
    { to: '/panel-admin/docentes', label: 'Docentes', icon: <FiUsers /> },
    { to: '/panel-admin/asignaturas', label: 'Asignaturas', icon: <FiBook /> },
    { to: '/panel-admin/reportes', label: 'Reportes', icon: <FiBarChart2 /> },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (!user || user.tipo !== 'administrador') return null;

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-title">Panel Administrativo</div>
      </div>
      
      <nav className="admin-sidebar-nav">
        <ul className="admin-sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.to} className="admin-sidebar-menu-item">
              <Link 
                to={item.to} 
                className={`admin-sidebar-menu-link ${isActive(item.to, item.exact) ? 'active' : ''}`}
              >
                <span className="admin-sidebar-menu-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-sidebar-logout-btn" onClick={handleLogout}>
          <FiLogOut />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar; 