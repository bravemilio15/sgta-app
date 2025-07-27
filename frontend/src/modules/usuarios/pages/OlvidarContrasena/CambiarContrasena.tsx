import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cambiarContrasenaConToken } from '../../../../api';
import UsuariosLayout from '../../UsuariosLayout';
import Button from '../../../../shared/components/Button';
import './olvidarContra.css';

const CambiarContrasena = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');
  const [token, setToken] = useState('');
  const [uid, setUid] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const uidParam = searchParams.get('uid');
    
    if (!tokenParam || !uidParam) {
      setMensaje('Enlace inválido. Solicita un nuevo enlace de recuperación.');
      setTipoMensaje('error');
      return;
    }

    setToken(tokenParam);
    setUid(uidParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevaContrasena || !confirmarContrasena) {
      setMensaje('Por favor, completa todos los campos.');
      setTipoMensaje('error');
      return;
    }

    if (nuevaContrasena.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres.');
      setTipoMensaje('error');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setMensaje('Las contraseñas no coinciden.');
      setTipoMensaje('error');
      return;
    }

    setLoading(true);
    setMensaje('');

    try {
      const res = await cambiarContrasenaConToken(token, uid, nuevaContrasena);
      
      if (res.message) {
        setMensaje('Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.');
        setTipoMensaje('success');
        setNuevaContrasena('');
        setConfirmarContrasena('');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/usuarios');
        }, 3000);
      } else {
        setMensaje('Error: ' + (res.error || 'No se pudo actualizar la contraseña.'));
        setTipoMensaje('error');
      }
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      setMensaje('Error de conexión. Por favor, intenta nuevamente.');
      setTipoMensaje('error');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate('/usuarios');
  };

  if (!token || !uid) {
    return (
      <UsuariosLayout>
        <div className="olvidar-contrasena-container">
          <main className="olvidar-contrasena-main">
            <div className="olvidar-contrasena-card">
              <h1 className="olvidar-contrasena-title">ENLACE INVÁLIDO</h1>
              <div className="olvidar-contrasena-content">
                <p className="olvidar-contrasena-description">
                  El enlace de recuperación no es válido o ha expirado.
                </p>
                <div className="form-actions">
                  <Button 
                    type="button" 
                    className="volver-btn"
                    onClick={handleVolver}
                  >
                    Volver al Login
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </UsuariosLayout>
    );
  }

  return (
    <UsuariosLayout>
      <div className="olvidar-contrasena-container">
        <main className="olvidar-contrasena-main">
          <div className="olvidar-contrasena-card">
            <h1 className="olvidar-contrasena-title">CAMBIAR CONTRASEÑA</h1>
            
            <div className="olvidar-contrasena-content">
              <h2 className="olvidar-contrasena-question">Establece tu nueva contraseña</h2>
              
              <p className="olvidar-contrasena-description">
                Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
              </p>
              
              <form onSubmit={handleSubmit} className="olvidar-contrasena-form">
                <div className="form-group">
                  <label htmlFor="nuevaContrasena" className="form-label">
                    Nueva contraseña
                </label>
                  <input
                    id="nuevaContrasena"
                    type="password"
                    className="form-input"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmarContrasena" className="form-label">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmarContrasena"
                    type="password"
                    className="form-input"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    required
                    minLength={6}
                  />
                </div>
                
                {mensaje && (
                  <div className={`mensaje ${tipoMensaje}`}>
                    {mensaje}
                  </div>
                )}
                
                <div className="form-actions">
                  <Button 
                    type="submit" 
                    className="solicitar-btn"
                    disabled={loading}
                  >
                    {loading ? 'Actualizando...' : 'Cambiar contraseña'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    className="volver-btn"
                    onClick={handleVolver}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </UsuariosLayout>
  );
};

export default CambiarContrasena; 