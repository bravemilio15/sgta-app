import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './MainLayout.css';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Header />
            <main className="main-content">
                <Outlet /> {/* Aquí se renderizará el contenido de cada página */}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;