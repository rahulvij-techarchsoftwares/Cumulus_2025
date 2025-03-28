

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import NotFound from '../store/NotFound';
function AdminRoute() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="*" element={<NotFound />} />  {/* Not Found is now separate */}
      </Routes>
    </Router>
  );
}

export default AdminRoute;
