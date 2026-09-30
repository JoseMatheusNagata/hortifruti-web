import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, LogOut, Package, ShoppingBasket, Sprout } from 'lucide-react';
import { useAuth } from '../auth';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Sprout size={22} /> Hortifrúti
        </div>
        <nav>
          <NavLink to="/produtos"><Package size={18} /> <span>Produtos</span></NavLink>
          <NavLink to="/pedidos"><ShoppingBasket size={18} /> <span>Pedidos</span></NavLink>
          <NavLink to="/relatorios"><BarChart3 size={18} /> <span>Relatórios</span></NavLink>
        </nav>
        <div className="userbox">
          <small>{user?.nome}</small>
          <button
            className="btn ghost"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
