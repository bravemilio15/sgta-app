import { useEffect, useState } from 'react';
import { useUser } from '../../../../context/UserContext';
import Sidebar from '../../../../shared/components/Sidebar/Sidebar';
import Button from '../../../../shared/components/Button';
import { obtenerUsuariosPendientes, aprobarUsuario } from '../../../../api';
import './PanelAdminPage.css';

const PanelAdminPage = () => {
  const { user, loading } = useUser();
  const [pendientes, setPendientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (user && user.tipo === 'administrador') {
      obtenerUsuariosPendientes().then(setPendientes).finally(() => setCargando(false));
    }
  }, [user]);

  const handleAprobar = async (uid: string) => {
    await aprobarUsuario(uid);
    setPendientes(pendientes.filter(u => u.uid !== uid));
  };

  if (loading || cargando) return <div className="paneladmin-bg"><div className="paneladmin-main">Cargando...</div></div>;
  if (!user || user.tipo !== 'administrador') {
    return <div className="paneladmin-bg"><div className="paneladmin-main" style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>Acceso denegado. Solo administradores pueden ver este panel.</div></div>;
  }

  return (
    <div className="paneladmin-dashboard">
      <Sidebar />
      <main className="paneladmin-content">
        <h2 className="paneladmin-title">Panel de Administrador</h2>
        <section className="paneladmin-section">
          <h3>Estudiantes Pendientes</h3>
          {pendientes.length === 0 ? (
            <p>No hay estudiantes pendientes.</p>
          ) : (
            <table className="paneladmin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Identificación</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pendientes.map(est => (
                  <tr key={est.uid}>
                    <td>{est.nombreCompleto}</td>
                    <td>{est.correoInstitucional}</td>
                    <td>{est.identificacion}</td>
                    <td>
                      <Button onClick={() => handleAprobar(est.uid)}>Aprobar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};

export default PanelAdminPage; 