import React, { useState } from 'react';
import Button from '../../../../shared/components/Button';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerUsuarioPorUid } from '../../../../api';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    const auth = getAuth();
    try {
      console.log('Intentando login con:', username, password);
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      console.log('Login exitoso:', userCredential);
      const uid = userCredential.user.uid;
      const datos = await obtenerUsuarioPorUid(uid);
      console.log('Datos usuario backend:', datos);
      if (datos && datos.tipo === 'administrador') {
        navigate('/panel-admin');
        return;
      }
      if (datos && datos.tipo === 'estudiante') {
        navigate('/tareas/menu/inicio-estudiante');
        return;
      }
      if (datos && datos.tipo === 'docente') {
        navigate('/tareas/menu/inicio-docente');
        return;
      }
      // Si no coincide ningún tipo, mostrar error
      setMensaje('Error: Tipo de usuario no válido.');
    } catch (error: any) {
      console.log('Error en login:', error);
      setMensaje('Error: ' + (error.message || 'No se pudo iniciar sesión.'));
    }
  };

  const handleOlvideContrasena = () => {
    navigate('/usuarios/olvidar-contrasena');
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

            <div className="login-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: '0.7rem' }}>
              <Button 
                type="button" 
                style={{ background: '#e0e0e0', color: '#222' }}
                onClick={handleOlvideContrasena}
              >
                Olvidé mi contraseña
              </Button>
            </div>
          </form>
          <div className="login-register" style={{ textAlign: 'center', width: '100%' }}>
            <span style={{ color: '#000' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/usuarios/registro" className="register-link">Regístrate</Link>
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;