import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../../shared/components/Header';
import Footer from '../../../../shared/components/Footer';
import './OpcionRegistro.css';

const OpcionRegistro = () => {
  const navigate = useNavigate();
  return (
    <div className="register-bg">
      <Header />
      <main className="register-main" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <section className="opcionregistro-card">
          <div className="opcionregistro-title">Elige el tipo de registro</div>
          <button className="opcionregistro-btn" onClick={() => navigate('/usuarios/registro/estudiante')}>Registro Estudiante</button>
          <button className="opcionregistro-btn" onClick={() => navigate('/usuarios/registro/docente')}>Registro Docente</button>
          <button className="opcionregistro-volver-btn" onClick={() => navigate('/usuarios')}>Volver</button>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OpcionRegistro; 