import React from 'react';
import Header from '../../shared/components/Header/Header';
import Footer from '../../shared/components/Footer/Footer';
import BackgroundImage from './BackgroundImage';
import './UsuariosLayout.css';

interface UsuariosLayoutProps {
  children: React.ReactNode;
}

const UsuariosLayout: React.FC<UsuariosLayoutProps> = ({ children }) => {
  return (
    <div className="usuarios-layout">
      <BackgroundImage />
      <Header />
      <main className="usuarios-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default UsuariosLayout; 