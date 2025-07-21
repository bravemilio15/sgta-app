import React, { useState } from 'react';
import { useUser } from '../../../../context/UserContext';

const PanelAdminPage = () => {
  const { user, loading } = useUser();

  if (loading) return <div>Cargando...</div>;
  if (!user || user.tipo !== 'administrador') {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>Acceso denegado. Solo administradores pueden ver este panel.</div>;
  }

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8, background: '#fff', textAlign: 'center' }}>
      <h2>Panel de Administrador</h2>
      <p>Bienvenido, <b>{user.correo}</b></p>
      <p>Solo los usuarios con tipo <b>administrador</b> pueden acceder a este panel.</p>
      {/* + */}
    </div>
  );
};

export default PanelAdminPage; 