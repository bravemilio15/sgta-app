import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitarRecuperacionContrasena } from '../../../../api';
import UsuariosLayout from '../../UsuariosLayout';
import Button from '../../../../shared/components/Button';
import './olvidarContra.css';

const OlvidarContra = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMensaje('Por favor, ingresa tu correo personal, Asociado a la Universidad Nacional de Loja.');
      setTipoMensaje('error');
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMensaje('Por favor, ingresa un correo electrónico válido.');
      setTipoMensaje('error');
      return;
    }

    setLoading(true);
    setMensaje('');

    try {
      const res = await solicitarRecuperacionContrasena(email);
      
      if (res.message) {
        setMensaje('Se ha enviado un enlace de recuperación a tu correo personal. Por favor, revisa tu bandeja de entrada.');
        setTipoMensaje('success');
        setEmail('');
      } else {
        setMensaje('Error: ' + (res.error || 'No se pudo procesar la solicitud.'));
        setTipoMensaje('error');
      }
    } catch (error: any) {
      console.error('Error al solicitar recuperación:', error);
      setMensaje('Error de conexión. Por favor, intenta nuevamente.');
      setTipoMensaje('error');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate('/usuarios');
  };

  return (
    <UsuariosLayout>
      <div className="olvidar-contrasena-container">
        <main className="olvidar-contrasena-main">
        <div className="olvidar-contrasena-card">
          <h1 className="olvidar-contrasena-title">RECUPERACIÓN DE CONTRASEÑA</h1>
          
          <div className="olvidar-contrasena-content">
            <h2 className="olvidar-contrasena-question">¿Olvidaste tu contraseña?</h2>
            
            <p className="olvidar-contrasena-description">
              Se enviará un enlace de recuperación a tu correo personal asociado a la Universidad Nacional de Loja.
            </p>
            
            <form onSubmit={handleSubmit} className="olvidar-contrasena-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Correo personal
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-correo@gmail.com"
                  required
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
                  {loading ? 'Enviando...' : 'Solicitar recuperación'}
                </Button>
                
                <Button 
                  type="button" 
                  className="volver-btn"
                  onClick={handleVolver}
                >
                  Volver
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

export default OlvidarContra;
