import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import Toast from './components/ui/Toast';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

// Public Route Component (redirects to dashboard if logged in)
function PublicRoute({ children }) {
  const { user } = useApp();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  const { toast, closeToast } = useApp();

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipts"
          element={
            <ProtectedRoute>
              <Layout>
                <Receipts />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/deliveries"
          element={
            <ProtectedRoute>
              <Layout>
                <Deliveries />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
