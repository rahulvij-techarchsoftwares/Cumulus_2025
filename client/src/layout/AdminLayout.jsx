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
import SignupForm from '../Component/Admin/SignupForm';

function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/admin-form" element={<SignupForm />} />
          <Route path="/SecurityQuestion" element={<SecurityQuestion />} />
          <Route path="/ManageUsers" element={<ManageUsers />} />
          <Route path="ManageUsers/user/:id" element={<UserDetails />} />
          <Route path="/CumulusDefault" element={<CumulusDefault />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminLayout;
