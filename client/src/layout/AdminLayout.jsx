import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../Component/Admin/Sidebar';
import Navbar from '../Component/Admin/Navbar';
import FAQ from '../Component/Admin/FAQ';
import SecurityQuestion from '../Component/Admin/SecurityQuestion';
import Dashboard from '../Component/Admin/Dashboard';
import ManageUsers from '../Component/Admin/ManageUsers';
import UserDetails from '../Component/Admin/utiles/userroutes/UserDetails';
import CumulusDefault from '../Component/Admin/CumulusDefault';
import NotFound from '../store/NotFound';

function AdminLayout() {
  return (
    <div className="flex">
      <div className="min-h-screen bg-gray-100">
        <Sidebar />
      </div>
      <div className="w-full">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/securityquestion" element={<SecurityQuestion />} />
          <Route path="/manageusers/*" element={<ManageUsers />} />
          <Route path="/manageusers/user/:id" element={<UserDetails />} />
          <Route path="/cumulusdefault" element={<CumulusDefault />} />
          
          {/* Catch-all route for undefined admin paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminLayout;
