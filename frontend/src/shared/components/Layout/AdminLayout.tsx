import React from 'react';
import AdminSidebar from '../Sidebar/AdminSidebar';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-layout-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout; 