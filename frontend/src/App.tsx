import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ArticlesPage from "@/pages/Articles";
import CBNPage from "@/pages/CBN";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import Dashboard from "@/pages/Index";
import { authHelper } from "@/services/api";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = authHelper.getCurrentToken();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <TooltipProvider>
      <Router>
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
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
