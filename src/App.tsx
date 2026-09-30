import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Reports from './pages/Reports';

function Protected({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/produtos" element={<Products />} />
        <Route path="/pedidos" element={<Orders />} />
        <Route path="/relatorios" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/produtos" replace />} />
    </Routes>
  );
}
