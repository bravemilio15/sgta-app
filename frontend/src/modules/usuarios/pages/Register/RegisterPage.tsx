import React, { useState } from 'react';
import Button from '../../../../shared/components/Button';
import './RegisterPage.css';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  // Estado solo para visualización del campo de correo
  const [emailUser, setEmailUser] = useState('');
  return (
    <div className="register-bg">
      <main className="register-main">
        <section className="register-card">
          <h2 className="register-title">REGISTRO ESTUDIANTE</h2>
          <form className="register-form" style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="firstName">Primer Nombre:</label>
                <input id="firstName" type="text" className="register-input" />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="secondName">Segundo Nombre:</label>
                <input id="secondName" type="text" className="register-input" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="firstLastName">Primer Apellido:</label>
                <input id="firstLastName" type="text" className="register-input" />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="secondLastName">Segundo Apellido:</label>
                <input id="secondLastName" type="text" className="register-input" />
              </div>
            </div>
            <label htmlFor="identification" style={{ width: '100%' }}>Identificación:</label>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input id="identification" type="text" className="register-input" style={{ flex: 2 }} />
              <select id="idType" className="register-input" style={{ flex: 1 }}>
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            <label htmlFor="subject" style={{ width: '100%' }}>Asignatura:</label>
            <select id="subject" className="register-input" style={{ width: '100%' }}>
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
            <Button type="submit" style={{ background: '#1a3fa6', color: '#fff', marginTop: '1rem', width: '100%' }}>Registrarse</Button>
            <Button type="button" style={{ background: '#e0e0e0', color: '#222', marginTop: '0.5rem', width: '100%' }} onClick={() => navigate('/usuarios')}>Volver</Button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default RegisterPage; 