import React from 'react';
import Button from '../../../../shared/components/Button';
import './LoginPage.css';
import { Link } from 'react-router-dom';

const LoginPage = () => (
  <div className="login-bg">
    <main className="login-main">
      <section className="login-card">
        <h2 className="login-title">INICIAR SESIÓN</h2>
        <form className="login-form">
          <label htmlFor="username">Nombre de usuario:</label>
          <input id="username" type="text" className="login-input" />

          <label htmlFor="password">Contraseña:</label>
          <input id="password" type="password" className="login-input" />

          <div className="login-remember">
            <input id="remember" type="checkbox" />
            <label htmlFor="remember">Recordar Inicio de Sesión</label>
          </div>

          <Button type="submit">ACCEDER</Button>

          <div className="login-actions">
            <Button type="button" style={{ background: '#e0e0e0', color: '#222' }}>Olvidé mi contraseña</Button>
            <Button type="button" style={{ background: '#3b4a56' }}>Volver</Button>
          </div>
        </form>
        <div className="login-register" style={{ textAlign: 'center', width: '100%' }}>
          <span>¿No tienes cuenta? <Link to="/usuarios/registro" style={{ color: '#222', fontWeight: 'bold', textDecoration: 'underline' }}>Regístrate</Link></span>
        </div>
      </section>
    </main>
  </div>
);

export default LoginPage; 