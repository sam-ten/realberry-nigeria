import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InvestorDashboard from './pages/InvestorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import KYCPage from './pages/KYCPage';
import DividendsPage from './pages/DividendsPage';
import DocumentsPage from './pages/DocumentsPage';
import CommunitiesPage from './pages/CommunitiesPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<InvestorDashboard />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/kyc" element={<KYCPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/communities" element={<CommunitiesPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dividends" element={<DividendsPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
