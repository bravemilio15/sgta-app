import React, { useState } from 'react';
import Button from '../../../../shared/components/Button';
import Header from '../../../../shared/components/Header';
import Footer from '../../../../shared/components/Footer';
import './RegisterPage.css';
import { useNavigate } from 'react-router-dom';
import { registrarDocente } from '../../../../api';

const RegisterPageDocente = () => {
  const navigate = useNavigate();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('cedula');
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    if (!nombreCompleto || !identificacion || !correoUsuario || !password || !confirmPassword) {
      setMensaje('Por favor, completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setMensaje('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const datos = {
        nombreCompleto,
        identificacion,
        tipoIdentificacion,
        correoUsuario,
        password
      };
      const res = await registrarDocente(datos);
      if (res && res.message) {
        setMensaje('¡Registro exitoso! Espera la aprobación de tu cuenta.');
        setNombreCompleto('');
        setIdentificacion('');
        setTipoIdentificacion('cedula');
        setCorreoUsuario('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setMensaje('Error: ' + (res.error || 'No se pudo registrar.'));
      }
    } catch (err: any) {
      setMensaje('Error de red: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      <Header />
      <main className="register-main">
        <section className="register-card">
          <h2 className="register-title">REGISTRO DOCENTE</h2>
          <form className="register-form" style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }} onSubmit={handleSubmit}>
            <div style={{ width: '100%' }}>
              <label htmlFor="nombreCompleto">Nombre Completo:</label>
              <input id="nombreCompleto" type="text" className="register-input" value={nombreCompleto} onChange={e => setNombreCompleto(e.target.value)} />
            </div>
            <label htmlFor="identificacion" style={{ width: '100%' }}>Identificación:</label>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input id="identificacion" type="text" className="register-input" style={{ flex: 2 }} value={identificacion} onChange={e => setIdentificacion(e.target.value)} />
              <select id="tipoIdentificacion" className="register-input" style={{ flex: 1 }} value={tipoIdentificacion} onChange={e => setTipoIdentificacion(e.target.value)}>
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            <label htmlFor="correoUsuario" style={{ width: '100%', marginTop: '0.7rem' }}>Correo institucional:</label>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                id="correoUsuario"
                type="text"
                className="register-input"
                style={{ flex: 2, marginRight: '0.3rem' }}
                placeholder="usuario"
                value={correoUsuario}
                onChange={e => setCorreoUsuario(e.target.value)}
              />
              <span style={{ flex: 1, color: '#222', fontWeight: 'bold', fontSize: '1rem' }}>@uni.edu.ec</span>
            </div>
            <label htmlFor="password" style={{ width: '100%', marginTop: '0.7rem' }}>Contraseña:</label>
            <input id="password" type="password" className="register-input" style={{ width: '100%' }} value={password} onChange={e => setPassword(e.target.value)} />
            <label htmlFor="confirmPassword" style={{ width: '100%', marginTop: '0.7rem' }}>Confirmar Contraseña:</label>
            <input id="confirmPassword" type="password" className="register-input" style={{ width: '100%' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            {mensaje && <div style={{ color: mensaje.startsWith('¡Registro') ? 'green' : 'red', marginTop: '1rem', textAlign: 'center' }}>{mensaje}</div>}
            <Button type="submit" style={{ background: '#1a3fa6', color: '#fff', marginTop: '1rem', width: '100%' }} disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</Button>
            <Button type="button" style={{ background: '#e0e0e0', color: '#222', marginTop: '0.5rem', width: '100%' }} onClick={() => navigate('/usuarios/registro')}>Volver</Button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPageDocente; 