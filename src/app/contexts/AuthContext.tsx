import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { postData, getData } from '../services/n8nClient';

const AUTH_LOGIN_URL = 'http://localhost:3000/api/auth/login';
const AUTH_ME_URL = 'http://localhost:3000/api/auth/me';

// Tipos para el usuario y roles
export type Role = 'empleado' | 'rrhh';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  cedula?: string;
  puesto?: string;
  foto?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar estado validando el token
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getData<{ user: any }>(AUTH_ME_URL);
          if (response && response.user) {
            const u = response.user;
            setUser({
              id: u.id,
              name: u.nombre,
              username: u.cédula || u.nombre,
              role: u.rol,
              cedula: u.cédula,
              puesto: u.puesto,
              foto: u.foto
            });
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, []);

  const login = async (username: string, password?: string) => {
    const payload = { username, password };
    const response = await postData<{ token: string, user: any }>(AUTH_LOGIN_URL, payload);
    
    if (response && response.token && response.user) {
      const u = response.user;
      setUser({
        id: u.id,
        name: u.nombre,
        username: u.cédula || u.nombre,
        role: u.rol,
        cedula: u.cédula,
        puesto: u.puesto,
        foto: u.foto
      });
      localStorage.setItem('token', response.token);
    } else {
      throw new Error('Credenciales incorrectas');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto más fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
