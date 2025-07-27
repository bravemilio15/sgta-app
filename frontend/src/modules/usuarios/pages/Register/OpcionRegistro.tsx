import React from 'react';
import { useNavigate } from 'react-router-dom';
import UsuariosLayout from '../../UsuariosLayout';
import './OpcionRegistro.css';

const OpcionRegistro = () => {
  const navigate = useNavigate();
  return (
    <UsuariosLayout>
      <div className="register-bg">
        <main className="register-main" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <section className="opcionregistro-card">
            <div className="opcionregistro-title">Elige el tipo de registro</div>
            <button className="opcionregistro-btn" onClick={() => navigate('/usuarios/registro/estudiante')}>Registro Estudiante</button>
            <button className="opcionregistro-btn" onClick={() => navigate('/usuarios/registro/docente')}>Registro Docente</button>
            <button className="opcionregistro-volver-btn" onClick={() => navigate('/usuarios')}>Volver</button>
          </section>
        </main>
      </div>
    </UsuariosLayout>
  );
};

export default OpcionRegistro; 