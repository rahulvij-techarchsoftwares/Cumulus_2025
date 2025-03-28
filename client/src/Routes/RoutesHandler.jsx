import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate ,useLocation} from 'react-router-dom';
import Login from '../Component/Auth/Login';
import Signup from '../Component/Auth/Signup';
import Updatepassword from '../Component/Auth/Updatepassword';
import Enterdashboard from '../Component/Auth/Enterdashboard';
import Thankyou from '../Component/Auth/Thankyou';
import Subscription from '../Component/Main/Subscription';
import Hero from '../Component/landing/components/Hero';
import { Terms } from '../Component/landing/Privacy/Terms';
import { Privacy } from '../Component/landing/Privacy/Privacy';
import Mainlayout from '../layout/Mainlayout';
import AdminLayout from '../layout/AdminLayout';
import NotFound from '../store/NotFound';
import PublicLayout from '../layout/Publiclayout';
import AdminRoute from '../layout/AdminRoute';
// Private Route Wrapper
const PrivateRoute = ({ element, allowedRoles }) => {
  const role = localStorage.getItem("role");

  console.log("Checking PrivateRoute, role:", role); // Debugging

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(role) ? element : <Navigate to="/not-found" replace />;
};




const RoutesHandler = () => {
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route


  useEffect(() => {
    const allowedPaths = ["/signup", "/login", "/updatepassword"];

    if (allowedPaths.includes(location.pathname)) {
      if (role === "User") {
        navigate("/folder/0", { replace: true });
      } else if (role === "Admin") {
        navigate("/admin", { replace: true });
      }
    }
  }, [role, navigate, location.pathname]);

  useEffect(() => {
    const handleStorageChange = () => setRole(localStorage.getItem("role") || "");
    window.addEventListener("storage", handleStorageChange);
    
    setLoading(false);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (loading) {
    return <h1 style={{ textAlign: "center", marginTop: "20%" }}>Loading...</h1>;
  }

  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Hero />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/updatepassword" element={<Updatepassword />} />
      <Route path="/thankyou" element={<Thankyou />} />
      <Route path="/shared*" element={<PublicLayout />} />

      {/* User Routes */}
      {/* <Route path="/subscription" element={<Subscription />} /> */}
      {/* <Route path="/enterdashboard" element={<Enterdashboard />} /> */}
      <Route path="/*" element={<PrivateRoute element={<Mainlayout />} allowedRoles={["User"]} />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={<PrivateRoute element={<AdminLayout />} allowedRoles={["Admin"]} />} />

      {/* Not Found Route */}

       <Route path="/not-found" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
};

export default RoutesHandler;
