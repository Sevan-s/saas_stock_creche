import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { ActivityLogs } from './pages/ActivityLogs';
import { Register } from './pages/Register';
import { AdminCatalogue } from './pages/AdminCatalogue';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/commandes" element={<Orders />} />
              <Route path="/historique" element={<ActivityLogs />} />
              <Route
                path="/admin/catalogue"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN_CRECHE', 'ADMIN_GLOBAL', 'DIRECTRICE']}>
                    <AdminCatalogue />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;