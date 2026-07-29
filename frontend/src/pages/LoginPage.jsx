import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DEMO_USERS = [
  { id: '1', email: 'manager@fleetguard.com', full_name: 'Fleet Manager', role: 'FLEET_MANAGER', password: 'password' },
  { id: '2', email: 'driver@fleetguard.com', full_name: 'John Driver', role: 'DRIVER', password: 'password' },
  { id: '3', email: 'mechanic@fleetguard.com', full_name: 'Jane Mechanic', role: 'MECHANIC', password: 'password' },
  { id: '4', email: 'admin@fleetguard.com', full_name: 'Admin User', role: 'ADMIN', password: 'password' },
];

export default function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Demo authentication - find user by email and password
      const user = DEMO_USERS.find((u) => u.email === email && u.password === password);

      if (!user) {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      // Simulate successful login
      const token = `token_${user.id}_${Date.now()}`;
      login(user, token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>FleetGuard</h1>
          <p>Fleet Maintenance & Compliance Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo Credentials:</p>
          <div className="demo-users">
            {DEMO_USERS.map((user) => (
              <div key={user.id} className="demo-user">
                <small>
                  <strong>{user.full_name}</strong> ({user.role})
                  <br />
                  {user.email} / {user.password}
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
