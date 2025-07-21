import React, { useState } from 'react';
import Button from '../../../../shared/components/Button';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerUsuarioPorUid } from '../../../../api';

// Simulación de autenticación con usuario admin
const usuarioAdminSimulado = {
  uid: 'adminUID',
  correo: 'admin@admin.com',
  password: 'admin1',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    // Simulación: si coincide con admin, obtener tipo y redirigir
    if (username === usuarioAdminSimulado.correo && password === usuarioAdminSimulado.password) {
      // Simula obtener el tipo desde el backend
      // En producción, deberías autenticar y obtener el uid real
      const datos = await obtenerUsuarioPorUid(usuarioAdminSimulado.uid);
      if (datos && datos.tipo === 'administrador') {
        navigate('/panel-admin');
        return;
      } else {
        setMensaje('No tienes permisos de administrador.');
        return;
      }
    }
    setMensaje('Credenciales incorrectas.');
  };

  return (
    <div className="login-bg">
      <main className="login-main">
        <section className="login-card">
          <h2 className="login-title">INICIAR SESIÓN</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="username">Nombre de usuario:</label>
            <input id="username" type="text" className="login-input" value={username} onChange={e => setUsername(e.target.value)} />

            <label htmlFor="password">Contraseña:</label>
            <input id="password" type="password" className="login-input" value={password} onChange={e => setPassword(e.target.value)} />

            <div className="login-remember">
              <input id="remember" type="checkbox" />
              <label htmlFor="remember">Recordar Inicio de Sesión</label>
            </div>

            {mensaje && <div style={{ color: 'red', marginBottom: 8 }}>{mensaje}</div>}
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
};

export default LoginPage; 