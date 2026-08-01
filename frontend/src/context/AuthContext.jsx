import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('fleetguard_user');
    const token = localStorage.getItem('fleetguard_token');

    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        const userId = parsed?.id || parsed?.user_id || parsed?.sub;
        if (userId) {
          localStorage.setItem('fleetguard_user_id', userId);
        }
        return parsed;
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('fleetguard_user');
        localStorage.removeItem('fleetguard_token');
        localStorage.removeItem('fleetguard_user_id');
      }
    }

    return null;
  });
  const loading = false;

  const login = (userData, token) => {
    setUser(userData);
    const userId = userData?.id || userData?.user_id || userData?.sub;
    localStorage.setItem('fleetguard_user', JSON.stringify(userData));
    localStorage.setItem('fleetguard_token', token);
    if (userId) {
      localStorage.setItem('fleetguard_user_id', userId);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fleetguard_user');
    localStorage.removeItem('fleetguard_token');
    localStorage.removeItem('fleetguard_user_id');
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
