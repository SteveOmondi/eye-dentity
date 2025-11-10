import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WebsiteBuilderForm } from './components/WebsiteBuilderForm';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentCancel } from './pages/PaymentCancel';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WebsiteBuilderForm />} />
        <Route path="/builder" element={<WebsiteBuilderForm />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Routes>
    </Router>
  );
}

export default App;
