import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ArticlesPage from '@/pages/Articles';
import CBNPage from '@/pages/CBN';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import Dashboard from '@/pages/Index';
import StockPage from '@/pages/Stock';
import MachinesPage from '@/pages/Machines';
import ProductionPlanning from '@/pages/ProductionPlanning';
import Settings from '@/pages/Settings';
import Reports from '@/pages/Reports';
import MachineAssignment from '@/pages/MachineAssignment';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="cbn" element={<CBNPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="machines" element={<MachinesPage />} />
          <Route path="machine-assignment" element={<MachineAssignment />} />
          <Route path="production-planning" element={<ProductionPlanning />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
      <Toaster />
    </TooltipProvider>
  );
};

export default AppRoutes; 