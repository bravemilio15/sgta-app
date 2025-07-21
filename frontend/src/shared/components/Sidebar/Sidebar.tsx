import './Sidebar.css';
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <aside className="sidebar">
    <div className="sidebar-title">SGTA</div>
    <nav>
      <ul>
        <li><Link to="/panel-admin">Dashboard</Link></li>
        <li><Link to="/usuarios">Usuarios</Link></li>
        <li><Link to="/tareas">Tareas</Link></li>
        <li><Link to="/reportes">Reportes</Link></li>
        <li><Link to="/notificaciones">Notificaciones</Link></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
