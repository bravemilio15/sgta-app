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
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { useState } from 'react';

const Sidebar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);

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
      case 'administrador':
        return [
          { to: '/panel-admin', label: 'Dashboard', icon: <FiBarChart2 /> },
          { to: '/panel-admin/estudiantes', label: 'Estudiantes', icon: <FiUsers /> },
          { to: '/panel-admin/docentes', label: 'Docentes', icon: <FiUsers /> },
          { to: '/reportes', label: 'Reportes', icon: <FiBarChart2 /> },
          { to: '/notificaciones', label: 'Notificaciones', icon: <FiBell /> },
          { to: '/configuracion', label: 'Configuración', icon: <FiSettings /> },
        ];
      case 'docente':
        return [
          { to: '/tareas/menu/inicio-docente', label: 'Inicio', icon: <FiHome /> },
          { to: '/tareas', label: 'Mis Tareas', icon: <FiBarChart2 /> },
          { to: '/reportes', label: 'Reportes', icon: <FiBarChart2 /> },
          { to: '/notificaciones', label: 'Notificaciones', icon: <FiBell /> },
        ];
      case 'estudiante':
        return [
          { to: '/tareas/menu/inicio-estudiante', label: 'Inicio', icon: <FiHome /> },
          { to: '/tareas', label: 'Mis Tareas', icon: <FiBarChart2 /> },
          { to: '/notificaciones', label: 'Notificaciones', icon: <FiBell /> },
        ];
      default:
        return [];
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Si tiene nombre completo, usarlo
    if (user.nombreCompleto) {
      return user.nombreCompleto;
    }
    
    // Si no, usar el correo pero mostrar solo la parte antes del @
    if (user.correo) {
      return user.correo.split('@')[0];
    }
    
    return 'Usuario';
  };

  const getRoleDisplayName = () => {
    if (!user) return '';
    
    switch (user.tipo) {
      case 'administrador':
        return 'Administrador del Sistema';
      case 'docente':
        return 'Docente';
      case 'estudiante':
        return 'Estudiante';
      default:
        return user.tipo;
    }
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">SGTA</div>
        <div className="sidebar-user-profile">
          <div 
            className="profile-trigger"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="profile-avatar">
              <FiUser />
            </div>
            <div className="profile-info">
              <span className="profile-name">{getUserDisplayName()}</span>
              <span className="profile-role">{getRoleDisplayName()}</span>
            </div>
            {showProfile ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          
          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-details">
                <div className="detail-item">
                  <strong>Nombre:</strong> {getUserDisplayName()}
                </div>
                <div className="detail-item">
                  <strong>Rol:</strong> {getRoleDisplayName()}
                </div>
                <div className="detail-item">
                  <strong>Email:</strong> {user.correo}
                </div>
                {user.identificacion && (
                  <div className="detail-item">
                    <strong>Identificación:</strong> {user.identificacion}
                  </div>
                )}
                {user.carrera && (
                  <div className="detail-item">
                    <strong>Carrera:</strong> {user.carrera}
                  </div>
                )}
                {user.semestre && (
                  <div className="detail-item">
                    <strong>Semestre:</strong> {user.semestre}
                  </div>
                )}
                {user.especialidad && (
                  <div className="detail-item">
                    <strong>Especialidad:</strong> {user.especialidad}
                  </div>
                )}
                {user.departamento && (
                  <div className="detail-item">
                    <strong>Departamento:</strong> {user.departamento}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
