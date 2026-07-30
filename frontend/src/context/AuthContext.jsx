import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('fleetguard_user');
    const token = localStorage.getItem('fleetguard_token');

    if (storedUser && token) {
      try {
        return JSON.parse(storedUser);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('fleetguard_user');
        localStorage.removeItem('fleetguard_token');
      }
    }

    return null;
  });
  const loading = false;

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('fleetguard_user', JSON.stringify(userData));
    localStorage.setItem('fleetguard_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fleetguard_user');
    localStorage.removeItem('fleetguard_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
