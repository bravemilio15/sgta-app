import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { getAuth, signOut } from 'firebase/auth';
import { FiLogOut, FiUser, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
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

  const getWelcomeMessage = () => {
    if (!user) return '';

    switch (user.tipo) {
      case 'administrador':
        return 'Panel de Administrador';
      case 'estudiante':
        return 'Panel de Estudiante';
      case 'docente':
        return 'Panel de Docente';
      default:
        return 'Bienvenido';
    }
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

  return (
    <header className="sgta-header">
      <div className="sgta-header__left">
        <img src="/Sgta_icon.png" alt="Logo SGTA" className="sgta-header__logo" /> {/* <-- Usa la ruta pública aquí */}
        <div>
          <h1 className="sgta-header__title">Universidad Nacional de Loja</h1>
          <h2 className="sgta-header__subtitle">Sistema Gestor de Tareas – SGTA</h2>
          {user && <p className="sgta-header__welcome">{getWelcomeMessage()}</p>}
        </div>
      </div>
      <div className="sgta-header__right">
        {user && (
          <div className="header-profile">
            <div
              className="header-profile-trigger"
              onClick={() => setShowProfile(!showProfile)}
            >
              <div className="header-profile-avatar">
                <FiUser />
              </div>
              <div className="header-profile-info">
                <span className="header-profile-name">{getUserDisplayName()}</span>
                <span className="header-profile-role">{getRoleDisplayName()}</span>
              </div>
              {showProfile ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {showProfile && (
              <div className="header-profile-dropdown">
                <div className="header-profile-details">
                  <div className="header-detail-item">
                    <strong>Nombre:</strong> {getUserDisplayName()}
                  </div>
                  <div className="header-detail-item">
                    <strong>Rol:</strong> {getRoleDisplayName()}
                  </div>
                  <div className="header-detail-item">
                    <strong>Email:</strong> {user.correo}
                  </div>
                  {user.identificacion && (
                    <div className="header-detail-item">
                      <strong>Identificación:</strong> {user.identificacion}
                    </div>
                  )}
                  {user.carrera && (
                    <div className="header-detail-item">
                      <strong>Carrera:</strong> {user.carrera}
                    </div>
                  )}
                  {user.semestre && (
                    <div className="header-detail-item">
                      <strong>Semestre:</strong> {user.semestre}
                    </div>
                  )}
                  {user.especialidad && (
                    <div className="header-detail-item">
                      <strong>Especialidad:</strong> {user.especialidad}
                    </div>
                  )}
                  {user.departamento && (
                    <div className="header-detail-item">
                      <strong>Departamento:</strong> {user.departamento}
                    </div>
                  )}
                </div>
                <button className="header-logout-btn" onClick={handleLogout}>
                  <FiLogOut />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
