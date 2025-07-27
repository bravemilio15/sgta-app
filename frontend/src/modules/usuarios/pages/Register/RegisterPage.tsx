import React, { useState, useEffect } from 'react';
import Button from '../../../../shared/components/Button';
import UsuariosLayout from '../../UsuariosLayout';
import './RegisterPage.css';
import { useNavigate } from 'react-router-dom';
import { registrarEstudianteConMatriculas, obtenerAsignaturas, obtenerPeriodoActivo } from '../../../../api';

const RegisterPage = () => {
  const navigate = useNavigate();
  // Estados para cada campo del formulario
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [tipoIdentificacion, setTipoIdentificacion] = useState('cedula');
  const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState<string[]>([]);
  const [correoPersonal, setCorreoPersonal] = useState('');
  const [emailUser, setEmailUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [asignaturas, setAsignaturas] = useState<Array<{id: string, codigo: string, nombre: string}>>([]);
  const [cargandoAsignaturas, setCargandoAsignaturas] = useState(true);
  const [periodoActivo, setPeriodoActivo] = useState<{id: string, nombre: string} | null>(null);
  const [cargandoPeriodo, setCargandoPeriodo] = useState(true);

  useEffect(() => {
    cargarAsignaturas();
    cargarPeriodoActivo();
  }, []);

  const cargarAsignaturas = async () => {
    try {
      setCargandoAsignaturas(true);
      const asignaturasData = await obtenerAsignaturas();
      setAsignaturas(asignaturasData);
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
    } finally {
      setCargandoAsignaturas(false);
    }
  };

  const cargarPeriodoActivo = async () => {
    try {
      setCargandoPeriodo(true);
      const periodoData = await obtenerPeriodoActivo();
      if (periodoData.periodo) {
        setPeriodoActivo(periodoData.periodo);
      }
    } catch (error) {
      console.error('Error al cargar período activo:', error);
    } finally {
      setCargandoPeriodo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    
    // Validar campos requeridos
    if (!emailUser) {
      setMensaje('Error: Debes completar el correo institucional');
      setLoading(false);
      return;
    }

    if (asignaturasSeleccionadas.length === 0) {
      setMensaje('Error: Debes seleccionar al menos una asignatura');
      setLoading(false);
      return;
    }

    if (!periodoActivo) {
      setMensaje('Error: No hay un período académico activo');
      setLoading(false);
      return;
    }
    
    // Validar formato de correo personal si se proporciona
    if (correoPersonal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correoPersonal)) {
        setMensaje('Error: El correo personal no tiene un formato válido');
        setLoading(false);
        return;
      }
    }
    
    try {
      const datos = {
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
        identificacion,
        tipoIdentificacion,
        correoPersonal,
        correoUsuario: emailUser,
        asignaturasIds: asignaturasSeleccionadas,
        periodoId: periodoActivo.id
      };
      const res = await registrarEstudianteConMatriculas(datos);
      if (res && res.message) {
        setMensaje('¡Registro exitoso! Tu cuenta está pendiente de aprobación por el administrador.');
        // Limpiar campos
        setPrimerNombre('');
        setSegundoNombre('');
        setPrimerApellido('');
        setSegundoApellido('');
        setIdentificacion('');
        setTipoIdentificacion('cedula');
        setAsignaturasSeleccionadas([]);
        setCorreoPersonal('');
        setEmailUser('');
      } else {
        setMensaje('Error: ' + (res.error || 'No se pudo registrar.'));
      }
    } catch (err: any) {
      setMensaje('Error de red: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAsignatura = (asignaturaId: string) => {
    setAsignaturasSeleccionadas(prev => 
      prev.includes(asignaturaId)
        ? prev.filter(id => id !== asignaturaId)
        : [...prev, asignaturaId]
    );
  };

  return (
    <UsuariosLayout>
      <div className="register-bg">
        <main className="register-main">
          <section className="register-card">
          <h2 className="register-title">REGISTRO ESTUDIANTE</h2>
          <form className="register-form" style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }} onSubmit={handleSubmit}>
            <div style={{ width: '100%' }}>
              <label htmlFor="firstName">Primer Nombre:</label>
              <input id="firstName" type="text" className="register-input" value={primerNombre} onChange={e => setPrimerNombre(e.target.value)} />
            </div>
            <div style={{ width: '100%' }}>
              <label htmlFor="secondName">Segundo Nombre:</label>
              <input id="secondName" type="text" className="register-input" value={segundoNombre} onChange={e => setSegundoNombre(e.target.value)} />
            </div>
            <div style={{ width: '100%' }}>
              <label htmlFor="firstLastName">Primer Apellido:</label>
              <input id="firstLastName" type="text" className="register-input" value={primerApellido} onChange={e => setPrimerApellido(e.target.value)} />
            </div>
            <div style={{ width: '100%' }}>
              <label htmlFor="secondLastName">Segundo Apellido:</label>
              <input id="secondLastName" type="text" className="register-input" value={segundoApellido} onChange={e => setSegundoApellido(e.target.value)} />
            </div>
            <label htmlFor="identification" style={{ width: '100%' }}>Identificación:</label>
            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <input id="identification" type="text" className="register-input" style={{ flex: 2 }} value={identificacion} onChange={e => setIdentificacion(e.target.value)} />
              <select id="idType" className="register-input" style={{ flex: 1 }} value={tipoIdentificacion} onChange={e => setTipoIdentificacion(e.target.value)}>
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            <label htmlFor="periodo" style={{ width: '100%' }}>Período Académico:</label>
            <div style={{ 
              padding: '0.5rem', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              border: '1px solid #ddd'
            }}>
              {cargandoPeriodo ? (
                <div>Cargando período académico...</div>
              ) : periodoActivo ? (
                <div style={{ fontWeight: 'bold', color: '#1a3fa6' }}>
                  {periodoActivo.nombre}
                </div>
              ) : (
                <div style={{ color: '#e53935', fontWeight: 'bold' }}>
                  No hay período académico activo
                </div>
              )}
            </div>

            <label htmlFor="asignaturas" style={{ width: '100%' }}>Asignaturas:</label>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              padding: '0.5rem'
            }}>
              {cargandoAsignaturas ? (
                <div>Cargando asignaturas...</div>
              ) : asignaturas.length === 0 ? (
                <div style={{ color: '#666', fontStyle: 'italic' }}>
                  No hay asignaturas disponibles
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {asignaturas.map((asig) => (
                    <label key={asig.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.3rem',
                      borderRadius: '4px',
                      backgroundColor: asignaturasSeleccionadas.includes(asig.id) ? '#e3f2fd' : 'transparent'
                    }}>
                      <input
                        type="checkbox"
                        checked={asignaturasSeleccionadas.includes(asig.id)}
                        onChange={() => toggleAsignatura(asig.id)}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontSize: '0.9rem' }}>
                        {asig.codigo} - {asig.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {asignaturasSeleccionadas.length > 0 && (
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#666', 
                marginTop: '0.3rem',
                fontStyle: 'italic'
              }}>
                Seleccionadas: {asignaturasSeleccionadas.length} asignatura(s)
              </div>
            )}
            
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
                required
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

export default RegisterPage;