import React from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { Routes, Route } from 'react-router-dom'
import FAQ from './FAQ'
import SecurityQuestion from './SecurityQuestion'
import Dashboard from './Dashboard'
import ManageUsers from './ManageUsers'
import UserDetails from './utiles/userroutes/UserDetails'
import CumulusDefault from './CumulusDefault'

function Layout() {
  return (
    <div className='flex'>
        
           
      <div className='min-h-screen bg-gray-100'>
        <Sidebar />
      </div>
      
      <div className='w-full'>
      <Navbar />
      <Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/faq" element={<FAQ />} />
  <Route path="/SecurityQuestion" element={<SecurityQuestion />} />
  <Route path="/ManageUsers/*" element={<ManageUsers />} />
  <Route path="/ManageUsers/user/:id" element={<UserDetails />} />
  <Route path="/CumulusDefault" element={<CumulusDefault />} />
</Routes>

      </div>
      
      
    </div>
  )
}

export default Layout
