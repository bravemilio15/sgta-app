import { useUser } from '../../../context/UserContext';

const InicioDocentePage = () => {
  const { user, loading } = useUser();

  if (loading) return <div style={{ minHeight: '100vh', minWidth: '100vw', background: '#928d8d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  if (!user || user.tipo !== 'docente') {
    return <div style={{ minHeight: '100vh', minWidth: '100vw', background: '#928d8d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'red' }}>Acceso denegado. Solo docentes pueden ver esta página.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', background: '#928d8d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <section style={{ background: '#fff', padding: '2.5rem 2.5rem 1.5rem 2.5rem', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', minWidth: 350, maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: '#1a3fa6', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '1.5rem', textAlign: 'center' }}>Inicio sesión como estudiante</h2>
          <p style={{ color: '#222', fontWeight: 'bold', marginBottom: 8 }}>Bienvenido, <b>{user.correo}</b></p>
          <p style={{ color: '#222' }}>Tipo de usuario: <b>{user.tipo}</b></p>
        </section>
      </main>
    </div>
  );
};

export default InicioDocentePage;