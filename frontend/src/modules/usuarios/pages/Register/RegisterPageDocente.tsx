import React, { useState } from 'react';
import Button from '../../../../shared/components/Button';
import UsuariosLayout from '../../UsuariosLayout';
import './RegisterPage.css';
import { useNavigate } from 'react-router-dom';
import { registrarDocente } from '../../../../api';

const RegisterPageDocente = () => {
  const navigate = useNavigate();
  // Estados para cada campo del formulario
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('cedula');
  const [correoPersonal, setCorreoPersonal] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    
    // Validar campos requeridos
    if (!primerNombre || !primerApellido || !identificacion || !correoUsuario) {
      setMensaje('Por favor, completa todos los campos obligatorios.');
      return;
    }
    
    // Validar formato de correo personal si se proporciona
    if (correoPersonal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correoPersonal)) {
        setMensaje('El correo personal no tiene un formato válido.');
        return;
      }
    }
    
    setLoading(true);
    try {
      // Construir nombre completo
      const nombreCompleto = `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.replace(/  +/g, ' ').trim();
      
      const datos = {
        nombreCompleto,
        correoPersonal,
        identificacion,
        tipoIdentificacion,
        correoUsuario
      };
      const res = await registrarDocente(datos);
      if (res && res.message) {
        setMensaje('¡Registro exitoso! Tu cuenta está pendiente de aprobación por el administrador.');
        setPrimerNombre('');
        setSegundoNombre('');
        setPrimerApellido('');
        setSegundoApellido('');
        setIdentificacion('');
        setTipoIdentificacion('cedula');
        setCorreoPersonal('');
        setCorreoUsuario('');
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
    <UsuariosLayout>
      <div className="register-bg">
        <main className="register-main">
          <section className="register-card">
          <h2 className="register-title">REGISTRO DOCENTE</h2>
          <form className="register-form" style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }} onSubmit={handleSubmit}>
            <div style={{ width: '100%' }}>
              <label htmlFor="primerNombre">Primer Nombre:</label>
              <input id="primerNombre" type="text" className="register-input" value={primerNombre} onChange={e => setPrimerNombre(e.target.value)} required />
            </div>
            <div style={{ width: '100%' }}>
              <label htmlFor="segundoNombre">Segundo Nombre:</label>
              <input id="segundoNombre" type="text" className="register-input" value={segundoNombre} onChange={e => setSegundoNombre(e.target.value)} />
            </div>
            <div style={{ width: '100%' }}>
              <label htmlFor="primerApellido">Primer Apellido:</label>
              <input id="primerApellido" type="text" className="register-input" value={primerApellido} onChange={e => setPrimerApellido(e.target.value)} required />
            </div>
            <div style={{ width: '100%' }}>
              <label htmlFor="segundoApellido">Segundo Apellido:</label>
              <input id="segundoApellido" type="text" className="register-input" value={segundoApellido} onChange={e => setSegundoApellido(e.target.value)} />
            </div>
            <label htmlFor="identificacion" style={{ width: '100%' }}>Identificación:</label>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input id="identificacion" type="text" className="register-input" style={{ flex: 2 }} value={identificacion} onChange={e => setIdentificacion(e.target.value)} required />
              <select id="tipoIdentificacion" className="register-input" style={{ flex: 1 }} value={tipoIdentificacion} onChange={e => setTipoIdentificacion(e.target.value)}>
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            
            <label htmlFor="correoPersonal" style={{ width: '100%', marginTop: '0.7rem' }}>
              Correo personal:
              <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                (Opcional: Solo para envío de credenciales cuando sea aprobado)
              </span>
            </label>
            <input
              id="correoPersonal"
              type="email"
              className="register-input"
              style={{ width: '100%' }}
              placeholder="ejemplo@gmail.com (opcional)"
              value={correoPersonal}
              onChange={e => setCorreoPersonal(e.target.value)}
            />
            
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
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.3rem', fontStyle: 'italic' }}>
              📧 Este será tu usuario para acceder al sistema
            </div>
            {mensaje && <div style={{ color: mensaje.startsWith('¡Registro') ? 'green' : 'red', marginTop: '1rem', textAlign: 'center' }}>{mensaje}</div>}
            <Button type="submit" style={{ background: '#1a3fa6', color: '#fff', marginTop: '1rem', width: '100%' }} disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</Button>
            <Button type="button" style={{ background: '#e0e0e0', color: '#222', marginTop: '0.5rem', width: '100%' }} onClick={() => navigate('/usuarios/registro')}>Volver</Button>
          </form>
        </section>
      </main>
    </div>
    </UsuariosLayout>
  );
};

export default RegisterPageDocente; 