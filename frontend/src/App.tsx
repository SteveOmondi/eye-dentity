import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WebsiteBuilderForm } from './components/WebsiteBuilderForm';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentCancel } from './pages/PaymentCancel';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminWebsites } from './pages/admin/AdminWebsites';
import { AdminOrders } from './pages/admin/AdminOrders';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WebsiteBuilderForm />} />
        <Route path="/builder" element={<WebsiteBuilderForm />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="websites" element={<AdminWebsites />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
