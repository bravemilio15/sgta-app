import React, { useState } from 'react';
import Button from '../../../../shared/components/Button';
import './RegisterPage.css';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../../../../api';

const RegisterPage = () => {
  const navigate = useNavigate();
  // Estados para cada campo del formulario
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('cedula');
  const [asignatura, setAsignatura] = useState('procesos');
  const [emailUser, setEmailUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    try {
      const datos = {
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
        identificacion,
        tipoIdentificacion,
        asignatura,
        correoUsuario: emailUser
      };
      const res = await registrarUsuario(datos);
      if (res && res.message) {
        setMensaje('¡Registro exitoso! Espera la aprobación de tu cuenta.');
        // Opcional: limpiar campos o redirigir
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
      <main className="register-main">
        <section className="register-card">
          <h2 className="register-title">REGISTRO ESTUDIANTE</h2>
          <form className="register-form" style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }} onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="firstName">Primer Nombre:</label>
                <input id="firstName" type="text" className="register-input" value={primerNombre} onChange={e => setPrimerNombre(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="secondName">Segundo Nombre:</label>
                <input id="secondName" type="text" className="register-input" value={segundoNombre} onChange={e => setSegundoNombre(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="firstLastName">Primer Apellido:</label>
                <input id="firstLastName" type="text" className="register-input" value={primerApellido} onChange={e => setPrimerApellido(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="secondLastName">Segundo Apellido:</label>
                <input id="secondLastName" type="text" className="register-input" value={segundoApellido} onChange={e => setSegundoApellido(e.target.value)} />
              </div>
            </div>
            <label htmlFor="identification" style={{ width: '100%' }}>Identificación:</label>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input id="identification" type="text" className="register-input" style={{ flex: 2 }} value={identificacion} onChange={e => setIdentificacion(e.target.value)} />
              <select id="idType" className="register-input" style={{ flex: 1 }} value={tipoIdentificacion} onChange={e => setTipoIdentificacion(e.target.value)}>
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            <label htmlFor="subject" style={{ width: '100%' }}>Asignatura:</label>
            <select id="subject" className="register-input" style={{ width: '100%' }} value={asignatura} onChange={e => setAsignatura(e.target.value)}>
              <option value="procesos">Procesos de Software</option>
              <option value="otra">Otra</option>
            </select>
            <label htmlFor="emailUser" style={{ width: '100%', marginTop: '0.7rem' }}>Correo institucional:</label>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                id="emailUser"
                type="text"
                className="register-input"
                style={{ flex: 2, marginRight: '0.3rem' }}
                placeholder="usuario"
                value={emailUser}
                onChange={e => setEmailUser(e.target.value)}
              />
              <span style={{ flex: 1, color: '#222', fontWeight: 'bold', fontSize: '1rem' }}>@uni.unl.ec</span>
            </div>
            {mensaje && <div style={{ color: mensaje.startsWith('¡Registro') ? 'green' : 'red', marginTop: '1rem', textAlign: 'center' }}>{mensaje}</div>}
            <Button type="submit" style={{ background: '#1a3fa6', color: '#fff', marginTop: '1rem', width: '100%' }} disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</Button>
            <Button type="button" style={{ background: '#e0e0e0', color: '#222', marginTop: '0.5rem', width: '100%' }} onClick={() => navigate('/usuarios')}>Volver</Button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage; 