import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginWithSupabase, registerWithSupabase } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('FLEET_MANAGER');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    setInfoMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { user, access_token: accessToken } = await loginWithSupabase(email, password);
        login(user, accessToken);
        onLoginSuccess();
      } else {
        const response = await registerWithSupabase(email, password, fullName, role);
        if (response.access_token && response.user) {
          login(response.user, response.access_token);
          onLoginSuccess();
        } else {
          setInfoMessage(response.message || 'Registration successful! You can now sign in.');
          setMode('signin');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>FleetGuard</h1>
          <p>{mode === 'signin' ? 'Sign in to your FleetGuard account' : 'Create a new FleetGuard Supabase account'}</p>
        </div>

        <div className="auth-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            className={`tab-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('signin')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              background: mode === 'signin' ? '#ffffff' : 'transparent',
              color: mode === 'signin' ? '#2563eb' : '#64748b',
              boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('signup')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? '#2563eb' : '#64748b',
              boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Sign Up
          </button>
        </div>

        {infoMessage && <p className="info-message" style={{ background: '#eff6ff', color: '#1d4ed8', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{infoMessage}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'signup' && (
            <>
              <label>
                <span>Full Name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </label>
              <label>
                <span>Role</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="FLEET_MANAGER">Fleet Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MECHANIC">Mechanic</option>
                  <option value="DRIVER">Driver</option>
                </select>
              </label>
            </>
          )}

          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
              minLength={mode === 'signup' ? 6 : undefined}
              required
            />
          </label>

          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? (mode === 'signin' ? 'Logging in...' : 'Signing up...') : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}

