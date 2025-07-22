import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="sgta-header">
      <div className="sgta-header__left">
        <img src="/logo-unl.png" alt="Logo UNL" className="sgta-header__logo" />
        <div>
          <h1 className="sgta-header__title">Universidad Nacional de Loja</h1>
          <h2 className="sgta-header__subtitle">Sistema Gestor de Tareas – SGTA</h2>
        </div>
      </div>
      <div className="sgta-header__right">
        <button className="sgta-header__home-btn" onClick={() => navigate('/usuarios')}>🏠 Inicio</button>
      </div>
    </header>
  );
};

export default Header;
