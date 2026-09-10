import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import API from '../api/axios';
import type { User, AuthResponse } from '../types/index.tsx';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginClassique: (email: string, motDePasse: string) => Promise<AuthResponse>;
  loginPin: (codeRattachement: string, codePIN: string) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Erreur lors de la lecture de la session:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const loginClassique = async (email: string, motDePasse: string): Promise<AuthResponse> => {
    const { data } = await API.post<AuthResponse>('/auth/login', { email, motDePasse });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const loginPin = async (codeRattachement: string, codePIN: string): Promise<AuthResponse> => {
    const { data } = await API.post<AuthResponse>('/auth/login-pin', { codeRattachement, codePIN });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginClassique, loginPin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};