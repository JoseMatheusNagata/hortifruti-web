import { createContext, ReactNode, useContext, useState } from 'react';
import { api } from './api';
import { User } from './types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('user') ?? 'null');
    } catch {
      return null;
    }
  });

  async function login(email: string, senha: string) {
    const { data } = await api.post<{ token: string; user: User }>('/auth/login', { email, senha });
    if (data.user.role !== 'ADMIN') {
      throw { response: { data: { message: 'Este painel é exclusivo para administradores.' } } };
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
