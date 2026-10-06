import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/useTheme';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { Navigate, Route, Routes } from 'react-router-dom';

function AuthenticatedApp() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-sm text-zinc-500">Loading FlowTodo...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="*" element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
